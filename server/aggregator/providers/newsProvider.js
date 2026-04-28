import axios from 'axios';
import config from '../../config.js';

// Map ISO alpha-2 to full country names for news search
const COUNTRY_NAMES = {
  AF: 'Afghanistan', AR: 'Argentina', AU: 'Australia', BD: 'Bangladesh', BR: 'Brazil',
  CA: 'Canada', CN: 'China', CO: 'Colombia', DE: 'Germany', EG: 'Egypt',
  ES: 'Spain', ET: 'Ethiopia', FR: 'France', GB: 'United Kingdom', GH: 'Ghana',
  ID: 'Indonesia', IN: 'India', IQ: 'Iraq', IR: 'Iran', IT: 'Italy',
  JP: 'Japan', KE: 'Kenya', KR: 'South Korea', MX: 'Mexico', MY: 'Malaysia',
  NG: 'Nigeria', NZ: 'New Zealand', PH: 'Philippines', PK: 'Pakistan', PL: 'Poland',
  RU: 'Russia', SA: 'Saudi Arabia', SE: 'Sweden', SG: 'Singapore', TH: 'Thailand',
  TR: 'Turkey', TZ: 'Tanzania', UA: 'Ukraine', US: 'United States', VN: 'Vietnam',
  ZA: 'South Africa', AE: 'UAE', CH: 'Switzerland', CL: 'Chile', PE: 'Peru',
  NO: 'Norway', FI: 'Finland', DK: 'Denmark', PT: 'Portugal', IL: 'Israel',
};

export async function fetchNews(countryCode) {
  const key = config.newsApiKey;
  if (!key) {
    return generateMockNews(countryCode);
  }

  const countryName = COUNTRY_NAMES[countryCode] || countryCode;
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(countryName)}&sortBy=publishedAt&pageSize=5&apiKey=${key}`;

  try {
    const { data } = await axios.get(url, { timeout: 5000 });
    if (!data.articles || data.articles.length === 0) {
      return generateMockNews(countryCode);
    }
    return data.articles.slice(0, 5).map((a) => ({
      title: a.title || 'Untitled',
      source: a.source?.name || 'Unknown',
      url: a.url || '#',
      publishedAt: a.publishedAt,
      description: a.description?.slice(0, 150) || '',
    }));
  } catch (err) {
    console.warn(`News API error for ${countryCode}:`, err.message);
    return generateMockNews(countryCode);
  }
}

function generateMockNews(code) {
  const name = COUNTRY_NAMES[code] || code;
  const topics = [
    { title: `${name} announces new economic growth initiative`, source: 'Reuters' },
    { title: `Tech sector booming in ${name} amid global shifts`, source: 'Bloomberg' },
    { title: `${name}'s renewable energy investments reach record high`, source: 'The Guardian' },
    { title: `Cultural festival in ${name} draws international attention`, source: 'AP News' },
    { title: `${name} strengthens diplomatic ties with neighboring nations`, source: 'BBC' },
  ];

  return topics.map((t, i) => ({
    title: t.title,
    source: t.source,
    url: '#',
    publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
    description: `Latest developments from ${name}.`,
  }));
}
