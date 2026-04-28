import { Router } from 'express';

const router = Router();

// Simple country name search (backed by REST Countries API)
router.get('/', async (req, res) => {
  const query = req.query.q;
  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters.' });
  }

  try {
    const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fields=name,cca2,capital,region,flags`);
    if (!response.ok) {
      return res.json({ results: [] });
    }
    const data = await response.json();
    const results = data.slice(0, 10).map((c) => ({
      code: c.cca2,
      name: c.name?.common || c.name?.official,
      capital: c.capital?.[0] || 'Unknown',
      region: c.region,
      flag: c.flags?.emoji || '',
    }));
    res.json({ results });
  } catch (err) {
    res.json({ results: [] });
  }
});

export default router;
