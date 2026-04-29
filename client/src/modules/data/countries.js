/* Country data module.
   Static fallback + dynamic fetch from REST Countries API.
   Fetches ALL countries and territories — no filtering.
   All consumers should use the store's `countries` state, not import directly. */

// ── Static fallback (50 curated countries) ────────────────────
const STATIC_COUNTRIES = [
  { code: "AF", name: "Afghanistan", capital: "Kabul", lat: 33.94, lng: 67.71, region: "Asia", population: 41100000, gdp: 14.6 },
  { code: "AR", name: "Argentina", capital: "Buenos Aires", lat: -38.42, lng: -63.62, region: "Americas", population: 46000000, gdp: 621.8 },
  { code: "AU", name: "Australia", capital: "Canberra", lat: -25.27, lng: 133.78, region: "Oceania", population: 26400000, gdp: 1675.4 },
  { code: "BD", name: "Bangladesh", capital: "Dhaka", lat: 23.68, lng: 90.36, region: "Asia", population: 172000000, gdp: 460.2 },
  { code: "BR", name: "Brazil", capital: "Brasília", lat: -14.24, lng: -51.93, region: "Americas", population: 216400000, gdp: 2126.8 },
  { code: "CA", name: "Canada", capital: "Ottawa", lat: 56.13, lng: -106.35, region: "Americas", population: 40100000, gdp: 2139.8 },
  { code: "CN", name: "China", capital: "Beijing", lat: 35.86, lng: 104.20, region: "Asia", population: 1425900000, gdp: 17963.2 },
  { code: "CO", name: "Colombia", capital: "Bogotá", lat: 4.57, lng: -74.30, region: "Americas", population: 52100000, gdp: 343.6 },
  { code: "DE", name: "Germany", capital: "Berlin", lat: 51.17, lng: 10.45, region: "Europe", population: 84500000, gdp: 4456.1 },
  { code: "EG", name: "Egypt", capital: "Cairo", lat: 26.82, lng: 30.80, region: "Africa", population: 112700000, gdp: 387.1 },
  { code: "ES", name: "Spain", capital: "Madrid", lat: 40.46, lng: -3.75, region: "Europe", population: 47900000, gdp: 1580.7 },
  { code: "ET", name: "Ethiopia", capital: "Addis Ababa", lat: 9.15, lng: 40.49, region: "Africa", population: 126500000, gdp: 126.8 },
  { code: "FR", name: "France", capital: "Paris", lat: 46.23, lng: 2.21, region: "Europe", population: 68200000, gdp: 3030.0 },
  { code: "GB", name: "United Kingdom", capital: "London", lat: 55.38, lng: -3.44, region: "Europe", population: 67700000, gdp: 3158.9 },
  { code: "GH", name: "Ghana", capital: "Accra", lat: 7.95, lng: -1.02, region: "Africa", population: 33500000, gdp: 72.8 },
  { code: "ID", name: "Indonesia", capital: "Jakarta", lat: -0.79, lng: 113.92, region: "Asia", population: 277500000, gdp: 1319.1 },
  { code: "IN", name: "India", capital: "New Delhi", lat: 20.59, lng: 78.96, region: "Asia", population: 1428600000, gdp: 3730.0 },
  { code: "IQ", name: "Iraq", capital: "Baghdad", lat: 33.22, lng: 43.68, region: "Asia", population: 44500000, gdp: 264.2 },
  { code: "IR", name: "Iran", capital: "Tehran", lat: 32.43, lng: 53.69, region: "Asia", population: 88600000, gdp: 388.0 },
  { code: "IT", name: "Italy", capital: "Rome", lat: 41.87, lng: 12.57, region: "Europe", population: 58900000, gdp: 2254.9 },
  { code: "JP", name: "Japan", capital: "Tokyo", lat: 36.20, lng: 138.25, region: "Asia", population: 123300000, gdp: 4212.9 },
  { code: "KE", name: "Kenya", capital: "Nairobi", lat: -0.02, lng: 37.91, region: "Africa", population: 55100000, gdp: 104.0 },
  { code: "KR", name: "South Korea", capital: "Seoul", lat: 35.91, lng: 127.77, region: "Asia", population: 51700000, gdp: 1721.9 },
  { code: "MX", name: "Mexico", capital: "Mexico City", lat: 23.63, lng: -102.55, region: "Americas", population: 128900000, gdp: 1322.7 },
  { code: "MY", name: "Malaysia", capital: "Kuala Lumpur", lat: 4.21, lng: 101.98, region: "Asia", population: 34300000, gdp: 407.0 },
  { code: "NG", name: "Nigeria", capital: "Abuja", lat: 9.08, lng: 8.68, region: "Africa", population: 223800000, gdp: 477.4 },
  { code: "NZ", name: "New Zealand", capital: "Wellington", lat: -40.90, lng: 174.89, region: "Oceania", population: 5200000, gdp: 249.9 },
  { code: "PH", name: "Philippines", capital: "Manila", lat: 12.88, lng: 121.77, region: "Asia", population: 117300000, gdp: 404.3 },
  { code: "PK", name: "Pakistan", capital: "Islamabad", lat: 30.38, lng: 69.35, region: "Asia", population: 240500000, gdp: 338.2 },
  { code: "PL", name: "Poland", capital: "Warsaw", lat: 51.92, lng: 19.15, region: "Europe", population: 36800000, gdp: 748.9 },
  { code: "RU", name: "Russia", capital: "Moscow", lat: 61.52, lng: 105.32, region: "Europe", population: 144200000, gdp: 1862.5 },
  { code: "SA", name: "Saudi Arabia", capital: "Riyadh", lat: 23.89, lng: 45.08, region: "Asia", population: 36900000, gdp: 1069.4 },
  { code: "SE", name: "Sweden", capital: "Stockholm", lat: 60.13, lng: 18.64, region: "Europe", population: 10500000, gdp: 593.3 },
  { code: "SG", name: "Singapore", capital: "Singapore", lat: 1.35, lng: 103.82, region: "Asia", population: 5900000, gdp: 397.1 },
  { code: "TH", name: "Thailand", capital: "Bangkok", lat: 15.87, lng: 100.99, region: "Asia", population: 71800000, gdp: 512.2 },
  { code: "TR", name: "Turkey", capital: "Ankara", lat: 38.96, lng: 35.24, region: "Asia", population: 85300000, gdp: 1012.4 },
  { code: "TZ", name: "Tanzania", capital: "Dodoma", lat: -6.37, lng: 34.89, region: "Africa", population: 65500000, gdp: 75.7 },
  { code: "UA", name: "Ukraine", capital: "Kyiv", lat: 48.38, lng: 31.17, region: "Europe", population: 37000000, gdp: 160.5 },
  { code: "US", name: "United States", capital: "Washington, D.C.", lat: 37.09, lng: -95.71, region: "Americas", population: 339900000, gdp: 27357.8 },
  { code: "VN", name: "Vietnam", capital: "Hanoi", lat: 14.06, lng: 108.28, region: "Asia", population: 99500000, gdp: 430.0 },
  { code: "ZA", name: "South Africa", capital: "Pretoria", lat: -30.56, lng: 22.94, region: "Africa", population: 60400000, gdp: 377.6 },
  { code: "AE", name: "United Arab Emirates", capital: "Abu Dhabi", lat: 23.42, lng: 53.85, region: "Asia", population: 9400000, gdp: 507.5 },
  { code: "CH", name: "Switzerland", capital: "Bern", lat: 46.82, lng: 8.23, region: "Europe", population: 8800000, gdp: 884.9 },
  { code: "CL", name: "Chile", capital: "Santiago", lat: -35.68, lng: -71.54, region: "Americas", population: 19500000, gdp: 335.5 },
  { code: "PE", name: "Peru", capital: "Lima", lat: -9.19, lng: -75.02, region: "Americas", population: 34000000, gdp: 242.6 },
  { code: "NO", name: "Norway", capital: "Oslo", lat: 60.47, lng: 8.47, region: "Europe", population: 5500000, gdp: 485.5 },
  { code: "FI", name: "Finland", capital: "Helsinki", lat: 61.92, lng: 25.75, region: "Europe", population: 5500000, gdp: 300.2 },
  { code: "DK", name: "Denmark", capital: "Copenhagen", lat: 56.26, lng: 9.50, region: "Europe", population: 5900000, gdp: 404.2 },
  { code: "PT", name: "Portugal", capital: "Lisbon", lat: 39.40, lng: -8.22, region: "Europe", population: 10300000, gdp: 287.1 },
  { code: "IL", name: "Israel", capital: "Jerusalem", lat: 31.05, lng: 34.85, region: "Asia", population: 9800000, gdp: 530.7 },
];

// ── Flag emoji from ISO code ──────────────────────────────────
function getFlag(code) {
  const codePoints = code
    .toUpperCase()
    .split('')
    .map(c => 0x1f1e6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

// Add flags to static data
const COUNTRIES = STATIC_COUNTRIES.map(c => ({ ...c, flag: getFlag(c.code) }));

// ── Fetch ALL countries from REST Countries API ───────────────
const API_URL = 'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,capital,region,subregion,latlng,population,area,independent';

// ── Synthetic entries not in REST Countries API ───────────────
const SYNTHETIC_COUNTRIES = [
  {
    name: { common: 'Kosovo', official: 'Republic of Kosovo' },
    cca2: 'XK', cca3: 'XKX',
    capital: ['Pristina'],
    region: 'Europe', subregion: 'Southeast Europe',
    latlng: [42.6026, 20.9030],
    population: 1873000, area: 10887,
    independent: true,
  },
];

/**
 * Transforms a raw API country entry into the normalized shape
 * consumed throughout the application.
 */
function transformCountry(c) {
  const code = c.cca2;
  const lat = c.latlng?.[0] ?? 0;
  const lng = c.latlng?.[1] ?? 0;

  return {
    name: c.name.common,
    officialName: c.name?.official || '',
    code,
    cca3: c.cca3 || '',
    lat,
    lng,
    capital: c.capital?.[0] || 'N/A',
    region: c.region || 'Other',
    subregion: c.subregion || '',
    population: c.population ?? 0,
    area: c.area || null,
    flag: getFlag(code),
  };
}

/**
 * Fetch ALL countries and territories from REST Countries API.
 * No filtering — every entry becomes a valid target for globe interactions.
 */
async function fetchAllCountries() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`REST Countries API: ${res.status}`);
  const raw = await res.json();

  // Only filter out entries missing an ISO code or name
  const valid = raw.filter(c => c.cca2 && c.name?.common);

  // Merge synthetic entries
  const merged = [...valid, ...SYNTHETIC_COUNTRIES.filter(
    s => !valid.some(v => v.cca2 === s.cca2)
  )];

  return merged
    .map(transformCountry)
    .sort((a, b) => b.population - a.population);  // largest first
}

export { COUNTRIES, STATIC_COUNTRIES, getFlag, fetchAllCountries };
export default COUNTRIES;
