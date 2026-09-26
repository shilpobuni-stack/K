import supabase from './db-client.js';

function calcDelivery(settings, weight, region, subtotal) {
  const freeThreshold = Number(settings.free_threshold ?? settings.freeThreshold ?? 0);
  if (freeThreshold > 0 && subtotal >= freeThreshold) return 0;
  const base = Number(region === 'outside' ? (settings.outside ?? 130) : (settings.inside ?? 80));
  const weightEnabled = settings.weight_enabled !== false && settings.weightEnabled !== false;
  if (!weightEnabled) return base;
  const baseWeight = Number(settings.base_weight ?? settings.baseWeight ?? 500);
  const weightStep = Math.max(1, Number(settings.weight_step ?? settings.weightStep ?? 500));
  const extraCharge = Number(settings.extra_charge ?? settings.extraCharge ?? 20);
  const steps = Math.ceil(Math.max(0, weight - baseWeight) / weightStep);
  return base + steps * extraCharge;
}

function mapOrder(n) {
  return {
    id: String(n.id),
    created_at: n.created_at,
    createdAt: n.created_at,
    name: n.name,
    phone: n.phone,
    address: n.address,
    region: n.region,
    note: n.note || '',
    items: n.items || [],
    subtotal: Number(n.subtotal || 0),
    weight: Number(n.weight || 0),
    delivery: Number(n.delivery || 0),
    total: Number(n.total || 0),
    status: n.status || 'অপেক্ষমাণ',
    admin_note: n.admin_note || '',
    adminNote: n.admin_note || '',
  };
}

function genOrderId() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KS-${t}-${r}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { ids, all, search } = req.query || {};

      if (all === '1' || all === 'true') {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
        if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json((data || []).map(mapOrder));
      }

      if (search) {
        const q = String(search).trim();
        if (!q) return res.status(200).json([]);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .or(`id.ilike.%${q}%,phone.ilike.%${q}%`)
          .order('created_at', { ascending: false })
          .limit(30);
        if (error) throw error;
        return res.status(200).json((data || []).map(mapOrder));
      }

      if (ids) {
        const idList = String(ids).split(',').map((s) => s.trim()).filter(Boolean);
        if (!idList.length) return res.status(200).json([]);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .in('id', idList);
        if (error) throw error;
        // Keep order of requested ids
        const byId = Object.fromEntries((data || []).map((o) => [o.id, mapOrder(o)]));
        return res.status(200).json(idList.map((id) => byId[id]).filter(Boolean));
      }

      return res.status(400).json({ error: 'Missing query' });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const customer = body.customer || {};
      const items = Array.isArray(body.items) ? body.items : [];
      const requestId = body.requestId ? String(body.requestId) : null;
      const expectedTotal = Number(body.expectedTotal ?? -1);

      if (!customer.name || !customer.phone || !customer.address) {
        return res.status(400).json({ error: 'নাম, ফোন ও ঠিকানা প্রয়োজন' });
      }
      if (!/^01[3-9][0-9]{8}$/.test(String(customer.phone).trim())) {
        return res.status(400).json({ error: 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)' });
      }
      if (!items.length) {
        return res.status(400).json({ error: 'ব্যাগ খালি' });
      }

      // Idempotency
      if (requestId) {
        const { data: existing } = await supabase
          .from('orders')
          .select('*')
          .eq('request_id', requestId)
          .maybeSingle();
        if (existing) return res.status(200).json(mapOrder(existing));
      }

      // Load products & settings
      const [{ data: products, error: pErr }, { data: settingsRow, error: sErr }] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('settings').select('*').eq('id', 'main').maybeSingle(),
      ]);
      if (pErr) throw pErr;
      if (sErr) throw sErr;
      const settings = settingsRow || {};
      const byId = Object.fromEntries((products || []).map((p) => [p.id, p]));

      const lineItems = [];
      let subtotal = 0;
      let weight = 0;

      for (const cartItem of items) {
        const product = byId[cartItem.productId];
        if (!product || product.active === false) {
          return res.status(400).json({ error: 'কিছু পণ্য আর পাওয়া যাচ্ছে না' });
        }
        const qty = Math.max(1, Number(cartItem.quantity || 1));
        const shades = Array.isArray(product.shades) ? product.shades : [];
        let shade = null;
        let stock = Number(product.stock || 0);
        if (shades.length) {
          shade = shades.find((s) => s.id === cartItem.shadeId);
          if (!shade) return res.status(400).json({ error: `${product.name} এর শেড বেছে নিন` });
          stock = Number(shade.stock || 0);
        }
        if (qty > stock) {
          return res.status(400).json({ error: `${product.name}${shade ? ' · ' + shade.name : ''} স্টকে নেই` });
        }

        const price = Number(product.price || 0);
        const w = Number(product.weight || 0);
        lineItems.push({
          productId: product.id,
          name: product.name,
          shade: shade ? `${shade.name} · ${shade.code}` : '',
          shadeId: shade?.id || '',
          quantity: qty,
          price,
          weight: w,
          image: shade?.image || product.image || '',
        });
        subtotal += price * qty;
        weight += w * qty;

        // Decrement stock
        if (shades.length && shade) {
          const newShades = shades.map((s) =>
            s.id === shade.id ? { ...s, stock: Math.max(0, Number(s.stock || 0) - qty) } : s
          );
          await supabase.from('products').update({ shades: newShades, stock: 0 }).eq('id', product.id);
        } else {
          await supabase
            .from('products')
            .update({ stock: Math.max(0, stock - qty) })
            .eq('id', product.id);
        }
      }

      const region = customer.region === 'outside' ? 'outside' : 'inside';
      const delivery = calcDelivery(settings, weight, region, subtotal);
      const total = subtotal + delivery;

      if (expectedTotal >= 0 && Math.abs(expectedTotal - total) > 1) {
        // Soft warning but still accept server-calculated total
      }

      const paymentLabel = String(customer.payment || 'ক্যাশ অন ডেলিভারি').slice(0, 80);
      const mobilePay = /বিকাশ|নগদ|রকেট|bkash|nagad|rocket/i.test(paymentLabel);
      let userNote = String(customer.note || '').slice(0, 400);
      if (mobilePay) {
        const trxMatch = userNote.match(/TrxID:\s*([A-Za-z0-9]{8,15})/i);
        if (!trxMatch || !/^[A-Z0-9]{8,15}$/.test(trxMatch[1].toUpperCase())) {
          return res.status(400).json({ error: 'ভুল বা অনুপস্থিত ট্রানজেকশন আইডি — অর্ডার নিশ্চিত করা যায়নি।' });
        }
      }
      const note = userNote
        ? `[পেমেন্ট: ${paymentLabel}]\n${userNote}`
        : `[পেমেন্ট: ${paymentLabel}]`;

      const order = {
        id: genOrderId(),
        request_id: requestId,
        name: String(customer.name).trim().slice(0, 120),
        phone: String(customer.phone).trim(),
        address: String(customer.address).trim(),
        region,
        note,
        items: lineItems,
        subtotal,
        weight,
        delivery,
        total,
        status: 'অপেক্ষমাণ',
        admin_note: '',
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('orders').insert(order).select().single();
      if (error) {
        // Retry without request_id collision
        if (String(error.message || '').includes('duplicate') && requestId) {
          const { data: again } = await supabase
            .from('orders')
            .select('*')
            .eq('request_id', requestId)
            .maybeSingle();
          if (again) return res.status(200).json(mapOrder(again));
        }
        throw error;
      }
      return res.status(201).json(mapOrder(data));
    }

    if (req.method === 'PUT') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

      const { id, status, note } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id প্রয়োজন' });

      const { data, error } = await supabase
        .from('orders')
        .update({
          status: status || 'অপেক্ষমাণ',
          admin_note: note ?? '',
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(mapOrder(data));
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('orders API error:', err);
    res.status(500).json({ error: err.message });
  }
}
