import axios from 'axios';
import config from '../../config.js';

// Map ISO country code → capital city for weather lookup
const COUNTRY_CAPITALS = {
  AF: 'Kabul', AR: 'Buenos Aires', AU: 'Canberra', BD: 'Dhaka', BR: 'Brasilia',
  CA: 'Ottawa', CN: 'Beijing', CO: 'Bogota', DE: 'Berlin', EG: 'Cairo',
  ES: 'Madrid', ET: 'Addis Ababa', FR: 'Paris', GB: 'London', GH: 'Accra',
  ID: 'Jakarta', IN: 'New Delhi', IQ: 'Baghdad', IR: 'Tehran', IT: 'Rome',
  JP: 'Tokyo', KE: 'Nairobi', KR: 'Seoul', MX: 'Mexico City', MY: 'Kuala Lumpur',
  NG: 'Abuja', NZ: 'Wellington', PH: 'Manila', PK: 'Islamabad', PL: 'Warsaw',
  RU: 'Moscow', SA: 'Riyadh', SE: 'Stockholm', SG: 'Singapore', TH: 'Bangkok',
  TR: 'Ankara', TZ: 'Dodoma', UA: 'Kyiv', US: 'Washington', VN: 'Hanoi',
  ZA: 'Pretoria', AE: 'Abu Dhabi', CH: 'Bern', CL: 'Santiago', PE: 'Lima',
  NO: 'Oslo', FI: 'Helsinki', DK: 'Copenhagen', PT: 'Lisbon', IL: 'Jerusalem',
};

export async function fetchWeather(countryCode) {
  const key = config.openWeatherKey;
  if (!key) {
    // Return mock data when no API key
    return generateMockWeather(countryCode);
  }

  const city = COUNTRY_CAPITALS[countryCode] || countryCode;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${key}&units=metric`;

  try {
    const { data } = await axios.get(url, { timeout: 5000 });
    return {
      temp: Math.round(data.main?.temp),
      feelsLike: Math.round(data.main?.feels_like),
      condition: data.weather?.[0]?.main || 'Unknown',
      description: data.weather?.[0]?.description || '',
      icon: data.weather?.[0]?.icon || '01d',
      humidity: data.main?.humidity,
      windSpeed: data.wind?.speed,
      pressure: data.main?.pressure,
    };
  } catch (err) {
    console.warn(`Weather API error for ${countryCode}:`, err.message);
    return generateMockWeather(countryCode);
  }
}

function generateMockWeather(code) {
  // Generate plausible mock weather based on region
  const tropicalCountries = ['IN', 'BD', 'TH', 'ID', 'PH', 'NG', 'GH', 'KE', 'CO', 'BR', 'MY', 'SG', 'VN', 'ET', 'TZ', 'EG'];
  const coldCountries = ['CA', 'RU', 'NO', 'FI', 'SE', 'DK'];
  const isTropical = tropicalCountries.includes(code);
  const isCold = coldCountries.includes(code);

  const conditions = ['Clear', 'Clouds', 'Rain', 'Drizzle', 'Mist'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const baseTemp = isTropical ? 30 : isCold ? 5 : 18;
  const temp = baseTemp + Math.floor(Math.random() * 10) - 3;

  return {
    temp,
    feelsLike: temp - 2,
    condition,
    description: condition.toLowerCase(),
    icon: '01d',
    humidity: 40 + Math.floor(Math.random() * 40),
    windSpeed: 2 + Math.floor(Math.random() * 8),
    pressure: 1010 + Math.floor(Math.random() * 20),
  };
}
