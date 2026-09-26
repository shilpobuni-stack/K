import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { all, search, ids } = req.query;

      if (all === '1') {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data || []);
      }

      if (search) {
        const query = `%${search.trim()}%`;
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .or(`id.ilike.${query},phone.ilike.${query},name.ilike.${query}`)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data || []);
      }

      if (ids) {
        const idList = ids.split(',').map(s => s.trim()).filter(Boolean);
        if (idList.length === 0) return res.status(200).json([]);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .in('id', idList)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data || []);
      }

      return res.status(200).json([]);
    }

    if (req.method === 'POST') {
      const { requestId, items, customer, expectedTotal } = req.body;
      const orderId = `KS-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Compute total, weight, and delivery
      let subtotal = 0;
      let weight = 0;
      const formattedItems = (items || []).map(item => {
        const qty = item.quantity || 1;
        const price = item.price || 0;
        const w = item.weight || 0;
        subtotal += price * qty;
        weight += w * qty;
        return item;
      });

      const total = Number(expectedTotal || subtotal);
      const delivery = total > subtotal ? total - subtotal : (customer?.region === 'outside' ? 130 : 80);

      const orderRow = {
        id: orderId,
        name: customer?.name || '',
        phone: customer?.phone || '',
        address: customer?.address || '',
        region: customer?.region || 'inside',
        note: customer?.note || '',
        items: formattedItems,
        subtotal,
        weight,
        delivery,
        total,
        status: 'অপেক্ষমাণ',
        admin_note: '',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(orderRow)
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status, note } = req.body;
      const updateData = {};
      if (status !== undefined) updateData.status = status;
      if (note !== undefined) updateData.admin_note = note;

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Orders API error:', err);
    res.status(500).json({ error: err.message });
  }
}
