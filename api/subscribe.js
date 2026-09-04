export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { email, categories } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Valid email required' });
  if (!Array.isArray(categories) || categories.length === 0) return res.status(400).json({ error: 'Pick at least one category' });
  // Mock store — in prod wire to Resend / Supabase / Mailchimp
  // For now log and return success; Vercel logs will show subscription
  console.log('SUBSCRIBE', { email, categories, at: new Date().toISOString() });
  // Example: 2-week reminder will be sent via cron that queries deadlines vs categories
  return res.status(200).json({ ok: true, email, categories, message: 'You\'re on the list — we\'ll email 2 weeks before each deadline for your picks.' });
}
