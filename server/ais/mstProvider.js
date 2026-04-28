import config from '../config.js';
import { createLogger } from '../logger.js';

const logger = createLogger();
const BASE_URL = 'https://api.myshiptracking.com/api/v2';

/**
 * Fetch historical track for a vessel by MMSI.
 * Uses the Vessel History Track endpoint.
 * @param {number} mmsi
 * @param {number} days — how many days of history (default 7, trial max 20)
 * @returns {Array<{lat, lng, course, speed, time}>}
 */
export async function fetchVesselTrack(mmsi, days = 7) {
  const apiKey = config.mstApiKey;
  if (!apiKey) {
    logger.warn('No MST_API_KEY set — vessel track unavailable');
    return [];
  }

  try {
    const url = `${BASE_URL}/vessel/track?mmsi=${mmsi}&days=${days}&timegroup=10`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    const json = await res.json();

    if (json.status === 'error') {
      logger.warn({ code: json.code, message: json.message }, 'MST track error');
      return [];
    }

    return json.data || [];
  } catch (err) {
    logger.error({ err: err.message }, 'MST track fetch failed');
    return [];
  }
}

/**
 * Fetch extended vessel info by MMSI.
 * @param {number} mmsi
 * @returns {object|null}
 */
export async function fetchVesselDetails(mmsi) {
  const apiKey = config.mstApiKey;
  if (!apiKey) return null;

  try {
    const url = `${BASE_URL}/vessel?mmsi=${mmsi}&response=extended`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    const json = await res.json();
    if (json.status === 'error') return null;
    return json.data || null;
  } catch (err) {
    logger.error({ err: err.message }, 'MST vessel details fetch failed');
    return null;
  }
}
