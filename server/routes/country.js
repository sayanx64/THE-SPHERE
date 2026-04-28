import { Router } from 'express';
import { fetchCountryData } from '../aggregator/index.js';
import cache from '../cache/index.js';
import config from '../config.js';

const router = Router();

router.get('/:code', async (req, res) => {
  const code = req.params.code?.toUpperCase();

  if (!code || code.length !== 2 || !/^[A-Z]{2}$/.test(code)) {
    return res.status(400).json({ error: 'Invalid country code. Use ISO 3166-1 alpha-2 (e.g., US, IN, GB).' });
  }

  try {
    // Check cache
    const cacheKey = `country:${code}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    // Fetch fresh data
    const data = await fetchCountryData(code);

    // Cache with shortest TTL
    cache.set(cacheKey, data, config.cacheTTL.weather);

    res.json({ ...data, cached: false });
  } catch (err) {
    console.error(`Error fetching data for ${code}:`, err.message);
    res.status(502).json({ error: `Failed to fetch data for ${code}`, details: err.message });
  }
});

export default router;
