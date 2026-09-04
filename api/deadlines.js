import data from '../src/data/ndgf.json' with { type: 'json' };
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({ deadlines: data.deadlines || [], generated: data.meta?.generated });
}
