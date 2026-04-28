/* Country data: ISO alpha-2 codes, names, capitals, coordinates, flags, regions,
   population, and GDP. Curated subset of ~50 major countries for the globe. */

const COUNTRIES = [
  { code: "AF", name: "Afghanistan", capital: "Kabul", lat: 33.94, lng: 67.71, region: "Asia", pop: 41.1, gdp: 14.6 },
  { code: "AR", name: "Argentina", capital: "Buenos Aires", lat: -38.42, lng: -63.62, region: "Americas", pop: 46.0, gdp: 621.8 },
  { code: "AU", name: "Australia", capital: "Canberra", lat: -25.27, lng: 133.78, region: "Oceania", pop: 26.4, gdp: 1675.4 },
  { code: "BD", name: "Bangladesh", capital: "Dhaka", lat: 23.68, lng: 90.36, region: "Asia", pop: 172.0, gdp: 460.2 },
  { code: "BR", name: "Brazil", capital: "Brasília", lat: -14.24, lng: -51.93, region: "Americas", pop: 216.4, gdp: 2126.8 },
  { code: "CA", name: "Canada", capital: "Ottawa", lat: 56.13, lng: -106.35, region: "Americas", pop: 40.1, gdp: 2139.8 },
  { code: "CN", name: "China", capital: "Beijing", lat: 35.86, lng: 104.20, region: "Asia", pop: 1425.9, gdp: 17963.2 },
  { code: "CO", name: "Colombia", capital: "Bogotá", lat: 4.57, lng: -74.30, region: "Americas", pop: 52.1, gdp: 343.6 },
  { code: "DE", name: "Germany", capital: "Berlin", lat: 51.17, lng: 10.45, region: "Europe", pop: 84.5, gdp: 4456.1 },
  { code: "EG", name: "Egypt", capital: "Cairo", lat: 26.82, lng: 30.80, region: "Africa", pop: 112.7, gdp: 387.1 },
  { code: "ES", name: "Spain", capital: "Madrid", lat: 40.46, lng: -3.75, region: "Europe", pop: 47.9, gdp: 1580.7 },
  { code: "ET", name: "Ethiopia", capital: "Addis Ababa", lat: 9.15, lng: 40.49, region: "Africa", pop: 126.5, gdp: 126.8 },
  { code: "FR", name: "France", capital: "Paris", lat: 46.23, lng: 2.21, region: "Europe", pop: 68.2, gdp: 3030.0 },
  { code: "GB", name: "United Kingdom", capital: "London", lat: 55.38, lng: -3.44, region: "Europe", pop: 67.7, gdp: 3158.9 },
  { code: "GH", name: "Ghana", capital: "Accra", lat: 7.95, lng: -1.02, region: "Africa", pop: 33.5, gdp: 72.8 },
  { code: "ID", name: "Indonesia", capital: "Jakarta", lat: -0.79, lng: 113.92, region: "Asia", pop: 277.5, gdp: 1319.1 },
  { code: "IN", name: "India", capital: "New Delhi", lat: 20.59, lng: 78.96, region: "Asia", pop: 1428.6, gdp: 3730.0 },
  { code: "IQ", name: "Iraq", capital: "Baghdad", lat: 33.22, lng: 43.68, region: "Asia", pop: 44.5, gdp: 264.2 },
  { code: "IR", name: "Iran", capital: "Tehran", lat: 32.43, lng: 53.69, region: "Asia", pop: 88.6, gdp: 388.0 },
  { code: "IT", name: "Italy", capital: "Rome", lat: 41.87, lng: 12.57, region: "Europe", pop: 58.9, gdp: 2254.9 },
  { code: "JP", name: "Japan", capital: "Tokyo", lat: 36.20, lng: 138.25, region: "Asia", pop: 123.3, gdp: 4212.9 },
  { code: "KE", name: "Kenya", capital: "Nairobi", lat: -0.02, lng: 37.91, region: "Africa", pop: 55.1, gdp: 104.0 },
  { code: "KR", name: "South Korea", capital: "Seoul", lat: 35.91, lng: 127.77, region: "Asia", pop: 51.7, gdp: 1721.9 },
  { code: "MX", name: "Mexico", capital: "Mexico City", lat: 23.63, lng: -102.55, region: "Americas", pop: 128.9, gdp: 1322.7 },
  { code: "MY", name: "Malaysia", capital: "Kuala Lumpur", lat: 4.21, lng: 101.98, region: "Asia", pop: 34.3, gdp: 407.0 },
  { code: "NG", name: "Nigeria", capital: "Abuja", lat: 9.08, lng: 8.68, region: "Africa", pop: 223.8, gdp: 477.4 },
  { code: "NZ", name: "New Zealand", capital: "Wellington", lat: -40.90, lng: 174.89, region: "Oceania", pop: 5.2, gdp: 249.9 },
  { code: "PH", name: "Philippines", capital: "Manila", lat: 12.88, lng: 121.77, region: "Asia", pop: 117.3, gdp: 404.3 },
  { code: "PK", name: "Pakistan", capital: "Islamabad", lat: 30.38, lng: 69.35, region: "Asia", pop: 240.5, gdp: 338.2 },
  { code: "PL", name: "Poland", capital: "Warsaw", lat: 51.92, lng: 19.15, region: "Europe", pop: 36.8, gdp: 748.9 },
  { code: "RU", name: "Russia", capital: "Moscow", lat: 61.52, lng: 105.32, region: "Europe", pop: 144.2, gdp: 1862.5 },
  { code: "SA", name: "Saudi Arabia", capital: "Riyadh", lat: 23.89, lng: 45.08, region: "Asia", pop: 36.9, gdp: 1069.4 },
  { code: "SE", name: "Sweden", capital: "Stockholm", lat: 60.13, lng: 18.64, region: "Europe", pop: 10.5, gdp: 593.3 },
  { code: "SG", name: "Singapore", capital: "Singapore", lat: 1.35, lng: 103.82, region: "Asia", pop: 5.9, gdp: 397.1 },
  { code: "TH", name: "Thailand", capital: "Bangkok", lat: 15.87, lng: 100.99, region: "Asia", pop: 71.8, gdp: 512.2 },
  { code: "TR", name: "Turkey", capital: "Ankara", lat: 38.96, lng: 35.24, region: "Asia", pop: 85.3, gdp: 1012.4 },
  { code: "TZ", name: "Tanzania", capital: "Dodoma", lat: -6.37, lng: 34.89, region: "Africa", pop: 65.5, gdp: 75.7 },
  { code: "UA", name: "Ukraine", capital: "Kyiv", lat: 48.38, lng: 31.17, region: "Europe", pop: 37.0, gdp: 160.5 },
  { code: "US", name: "United States", capital: "Washington, D.C.", lat: 37.09, lng: -95.71, region: "Americas", pop: 339.9, gdp: 27357.8 },
  { code: "VN", name: "Vietnam", capital: "Hanoi", lat: 14.06, lng: 108.28, region: "Asia", pop: 99.5, gdp: 430.0 },
  { code: "ZA", name: "South Africa", capital: "Pretoria", lat: -30.56, lng: 22.94, region: "Africa", pop: 60.4, gdp: 377.6 },
  { code: "AE", name: "United Arab Emirates", capital: "Abu Dhabi", lat: 23.42, lng: 53.85, region: "Asia", pop: 9.4, gdp: 507.5 },
  { code: "CH", name: "Switzerland", capital: "Bern", lat: 46.82, lng: 8.23, region: "Europe", pop: 8.8, gdp: 884.9 },
  { code: "CL", name: "Chile", capital: "Santiago", lat: -35.68, lng: -71.54, region: "Americas", pop: 19.5, gdp: 335.5 },
  { code: "PE", name: "Peru", capital: "Lima", lat: -9.19, lng: -75.02, region: "Americas", pop: 34.0, gdp: 242.6 },
  { code: "NO", name: "Norway", capital: "Oslo", lat: 60.47, lng: 8.47, region: "Europe", pop: 5.5, gdp: 485.5 },
  { code: "FI", name: "Finland", capital: "Helsinki", lat: 61.92, lng: 25.75, region: "Europe", pop: 5.5, gdp: 300.2 },
  { code: "DK", name: "Denmark", capital: "Copenhagen", lat: 56.26, lng: 9.50, region: "Europe", pop: 5.9, gdp: 404.2 },
  { code: "PT", name: "Portugal", capital: "Lisbon", lat: 39.40, lng: -8.22, region: "Europe", pop: 10.3, gdp: 287.1 },
  { code: "IL", name: "Israel", capital: "Jerusalem", lat: 31.05, lng: 34.85, region: "Asia", pop: 9.8, gdp: 530.7 },
];

// Regional flag emoji lookup by ISO code
function getFlag(code) {
  const codePoints = code
    .toUpperCase()
    .split('')
    .map(c => 0x1f1e6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

// Add flag to each country
const COUNTRIES_WITH_FLAGS = COUNTRIES.map(c => ({
  ...c,
  flag: getFlag(c.code),
}));

export { COUNTRIES_WITH_FLAGS as COUNTRIES, getFlag };
export default COUNTRIES_WITH_FLAGS;
