/* Country data: ISO alpha-2 codes, names, capitals, coordinates, flags, and regions.
   This is a curated subset of ~50 major countries for the globe. */

const COUNTRIES = [
  { code: "AF", name: "Afghanistan", capital: "Kabul", lat: 33.94, lng: 67.71, region: "Asia" },
  { code: "AR", name: "Argentina", capital: "Buenos Aires", lat: -38.42, lng: -63.62, region: "Americas" },
  { code: "AU", name: "Australia", capital: "Canberra", lat: -25.27, lng: 133.78, region: "Oceania" },
  { code: "BD", name: "Bangladesh", capital: "Dhaka", lat: 23.68, lng: 90.36, region: "Asia" },
  { code: "BR", name: "Brazil", capital: "Brasília", lat: -14.24, lng: -51.93, region: "Americas" },
  { code: "CA", name: "Canada", capital: "Ottawa", lat: 56.13, lng: -106.35, region: "Americas" },
  { code: "CN", name: "China", capital: "Beijing", lat: 35.86, lng: 104.20, region: "Asia" },
  { code: "CO", name: "Colombia", capital: "Bogotá", lat: 4.57, lng: -74.30, region: "Americas" },
  { code: "DE", name: "Germany", capital: "Berlin", lat: 51.17, lng: 10.45, region: "Europe" },
  { code: "EG", name: "Egypt", capital: "Cairo", lat: 26.82, lng: 30.80, region: "Africa" },
  { code: "ES", name: "Spain", capital: "Madrid", lat: 40.46, lng: -3.75, region: "Europe" },
  { code: "ET", name: "Ethiopia", capital: "Addis Ababa", lat: 9.15, lng: 40.49, region: "Africa" },
  { code: "FR", name: "France", capital: "Paris", lat: 46.23, lng: 2.21, region: "Europe" },
  { code: "GB", name: "United Kingdom", capital: "London", lat: 55.38, lng: -3.44, region: "Europe" },
  { code: "GH", name: "Ghana", capital: "Accra", lat: 7.95, lng: -1.02, region: "Africa" },
  { code: "ID", name: "Indonesia", capital: "Jakarta", lat: -0.79, lng: 113.92, region: "Asia" },
  { code: "IN", name: "India", capital: "New Delhi", lat: 20.59, lng: 78.96, region: "Asia" },
  { code: "IQ", name: "Iraq", capital: "Baghdad", lat: 33.22, lng: 43.68, region: "Asia" },
  { code: "IR", name: "Iran", capital: "Tehran", lat: 32.43, lng: 53.69, region: "Asia" },
  { code: "IT", name: "Italy", capital: "Rome", lat: 41.87, lng: 12.57, region: "Europe" },
  { code: "JP", name: "Japan", capital: "Tokyo", lat: 36.20, lng: 138.25, region: "Asia" },
  { code: "KE", name: "Kenya", capital: "Nairobi", lat: -0.02, lng: 37.91, region: "Africa" },
  { code: "KR", name: "South Korea", capital: "Seoul", lat: 35.91, lng: 127.77, region: "Asia" },
  { code: "MX", name: "Mexico", capital: "Mexico City", lat: 23.63, lng: -102.55, region: "Americas" },
  { code: "MY", name: "Malaysia", capital: "Kuala Lumpur", lat: 4.21, lng: 101.98, region: "Asia" },
  { code: "NG", name: "Nigeria", capital: "Abuja", lat: 9.08, lng: 8.68, region: "Africa" },
  { code: "NZ", name: "New Zealand", capital: "Wellington", lat: -40.90, lng: 174.89, region: "Oceania" },
  { code: "PH", name: "Philippines", capital: "Manila", lat: 12.88, lng: 121.77, region: "Asia" },
  { code: "PK", name: "Pakistan", capital: "Islamabad", lat: 30.38, lng: 69.35, region: "Asia" },
  { code: "PL", name: "Poland", capital: "Warsaw", lat: 51.92, lng: 19.15, region: "Europe" },
  { code: "RU", name: "Russia", capital: "Moscow", lat: 61.52, lng: 105.32, region: "Europe" },
  { code: "SA", name: "Saudi Arabia", capital: "Riyadh", lat: 23.89, lng: 45.08, region: "Asia" },
  { code: "SE", name: "Sweden", capital: "Stockholm", lat: 60.13, lng: 18.64, region: "Europe" },
  { code: "SG", name: "Singapore", capital: "Singapore", lat: 1.35, lng: 103.82, region: "Asia" },
  { code: "TH", name: "Thailand", capital: "Bangkok", lat: 15.87, lng: 100.99, region: "Asia" },
  { code: "TR", name: "Turkey", capital: "Ankara", lat: 38.96, lng: 35.24, region: "Asia" },
  { code: "TZ", name: "Tanzania", capital: "Dodoma", lat: -6.37, lng: 34.89, region: "Africa" },
  { code: "UA", name: "Ukraine", capital: "Kyiv", lat: 48.38, lng: 31.17, region: "Europe" },
  { code: "US", name: "United States", capital: "Washington, D.C.", lat: 37.09, lng: -95.71, region: "Americas" },
  { code: "VN", name: "Vietnam", capital: "Hanoi", lat: 14.06, lng: 108.28, region: "Asia" },
  { code: "ZA", name: "South Africa", capital: "Pretoria", lat: -30.56, lng: 22.94, region: "Africa" },
  { code: "AE", name: "United Arab Emirates", capital: "Abu Dhabi", lat: 23.42, lng: 53.85, region: "Asia" },
  { code: "CH", name: "Switzerland", capital: "Bern", lat: 46.82, lng: 8.23, region: "Europe" },
  { code: "CL", name: "Chile", capital: "Santiago", lat: -35.68, lng: -71.54, region: "Americas" },
  { code: "PE", name: "Peru", capital: "Lima", lat: -9.19, lng: -75.02, region: "Americas" },
  { code: "NO", name: "Norway", capital: "Oslo", lat: 60.47, lng: 8.47, region: "Europe" },
  { code: "FI", name: "Finland", capital: "Helsinki", lat: 61.92, lng: 25.75, region: "Europe" },
  { code: "DK", name: "Denmark", capital: "Copenhagen", lat: 56.26, lng: 9.50, region: "Europe" },
  { code: "PT", name: "Portugal", capital: "Lisbon", lat: 39.40, lng: -8.22, region: "Europe" },
  { code: "IL", name: "Israel", capital: "Jerusalem", lat: 31.05, lng: 34.85, region: "Asia" },
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
