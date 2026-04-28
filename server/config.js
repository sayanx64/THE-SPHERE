import { config as dotenvConfig } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: resolve(__dirname, '..', '.env') });

export default {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  newsApiKey: process.env.NEWS_API_KEY || '',
  openWeatherKey: process.env.OPENWEATHER_API_KEY || '',
  aisStreamKey: process.env.AISSTREAM_API_KEY || '',
  mstApiKey: process.env.MST_API_KEY || '',
  redisUrl: process.env.REDIS_URL || null,
  cacheTTL: {
    weather: 15 * 60,     // 15 minutes
    news: 30 * 60,        // 30 minutes
    stats: 24 * 60 * 60,  // 24 hours
    search: 60 * 60,      // 1 hour
  },
};
