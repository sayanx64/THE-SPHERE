import axios from 'axios';

/**
 * Fetch country stats from REST Countries API (free, no key needed).
 * Also fetches GDP from World Bank API.
 */
export async function fetchCountryStats(countryCode) {
  const [countryData, gdpData] = await Promise.allSettled([
    fetchRestCountries(countryCode),
    fetchWorldBankGDP(countryCode),
  ]);

  const country = countryData.status === 'fulfilled' ? countryData.value : null;
  const gdp = gdpData.status === 'fulfilled' ? gdpData.value : null;

  if (!country) {
    throw new Error(`Could not fetch stats for ${countryCode}`);
  }

  return {
    country: {
      code: countryCode,
      name: country.name?.common || countryCode,
      officialName: country.name?.official || '',
      capital: country.capital?.[0] || 'Unknown',
      region: country.region || 'Unknown',
      subregion: country.subregion || '',
      population: country.population || 0,
      languages: country.languages ? Object.values(country.languages) : [],
      currencies: country.currencies ? Object.values(country.currencies).map(c => c.name) : [],
      timezones: country.timezones || [],
    },
    stats: {
      population: country.population || 0,
      area: country.area || 0,
      gdp: gdp?.gdp || null,
      gdpPerCapita: gdp?.gdpPerCapita || null,
      lifeExpectancy: gdp?.lifeExpectancy || null,
      gini: country.gini ? Object.values(country.gini)?.[0] || null : null,
    },
  };
}

async function fetchRestCountries(code) {
  const { data } = await axios.get(
    `https://restcountries.com/v3.1/alpha/${code}?fields=name,capital,region,subregion,population,area,languages,currencies,timezones,gini`,
    { timeout: 5000 }
  );
  return data;
}

async function fetchWorldBankGDP(code) {
  try {
    // GDP (current USD)
    const gdpUrl = `https://api.worldbank.org/v2/country/${code}/indicator/NY.GDP.MKTP.CD?format=json&per_page=1&date=2020:2023&mrv=1`;
    const gdpCapUrl = `https://api.worldbank.org/v2/country/${code}/indicator/NY.GDP.PCAP.CD?format=json&per_page=1&date=2020:2023&mrv=1`;
    const lifeUrl = `https://api.worldbank.org/v2/country/${code}/indicator/SP.DYN.LE00.IN?format=json&per_page=1&date=2020:2023&mrv=1`;

    const [gdpRes, gdpCapRes, lifeRes] = await Promise.allSettled([
      axios.get(gdpUrl, { timeout: 5000 }),
      axios.get(gdpCapUrl, { timeout: 5000 }),
      axios.get(lifeUrl, { timeout: 5000 }),
    ]);

    const gdp = gdpRes.status === 'fulfilled' ? gdpRes.value.data?.[1]?.[0]?.value : null;
    const gdpPerCapita = gdpCapRes.status === 'fulfilled' ? gdpCapRes.value.data?.[1]?.[0]?.value : null;
    const lifeExpectancy = lifeRes.status === 'fulfilled'
      ? Math.round((lifeRes.value.data?.[1]?.[0]?.value || 0) * 10) / 10
      : null;

    return { gdp, gdpPerCapita: gdpPerCapita ? Math.round(gdpPerCapita) : null, lifeExpectancy };
  } catch (err) {
    console.warn(`World Bank API error for ${code}:`, err.message);
    return { gdp: null, gdpPerCapita: null, lifeExpectancy: null };
  }
}
