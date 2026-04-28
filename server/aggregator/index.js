import { fetchWeather } from './providers/weatherProvider.js';
import { fetchNews } from './providers/newsProvider.js';
import { fetchCountryStats } from './providers/statsProvider.js';

/**
 * Aggregate data from all providers for a given country code.
 * Uses Promise.allSettled for graceful degradation — if one API fails,
 * the others still return data.
 */
export async function fetchCountryData(code) {
  const [weatherResult, newsResult, statsResult] = await Promise.allSettled([
    fetchWeather(code),
    fetchNews(code),
    fetchCountryStats(code),
  ]);

  const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : null;
  const news = newsResult.status === 'fulfilled' ? newsResult.value : [];
  const stats = statsResult.status === 'fulfilled' ? statsResult.value : null;

  // Log failures
  if (weatherResult.status === 'rejected') {
    console.warn(`⚠️ Weather fetch failed for ${code}:`, weatherResult.reason?.message);
  }
  if (newsResult.status === 'rejected') {
    console.warn(`⚠️ News fetch failed for ${code}:`, newsResult.reason?.message);
  }
  if (statsResult.status === 'rejected') {
    console.warn(`⚠️ Stats fetch failed for ${code}:`, statsResult.reason?.message);
  }

  return {
    country: stats?.country || { code, name: code },
    weather,
    news,
    stats: stats?.stats || null,
    fetchedAt: new Date().toISOString(),
  };
}
