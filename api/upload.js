import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

    const { fileName, fileBase64, contentType } = req.body || {};
    if (!fileName || !fileBase64) {
      return res.status(400).json({ error: 'fileName ও fileBase64 প্রয়োজন' });
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'ছবির আকার 5 এমবির বেশি' });
    }

    const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 80);
    const path = `uploads/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, buffer, {
        contentType: contentType || 'image/webp',
        upsert: true,
      });
    if (error) throw error;

    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
    return res.status(200).json({ url: urlData.publicUrl });
  } catch (err) {
    console.error('upload API error:', err);
    res.status(500).json({ error: err.message });
  }
}
