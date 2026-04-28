import { create } from 'zustand';
import { COUNTRIES } from './countries';

/* ── Mock data generators ───────────────────────────── */

function mockWeather(country) {
  const tropical = ['Asia', 'Africa'].includes(country.region);
  const conditions = ['Clear', 'Clouds', 'Rain', 'Drizzle', 'Mist'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const base = tropical ? 30 : 16;
  const temp = base + Math.floor(Math.random() * 10) - 3;
  return {
    temp,
    feelsLike: temp - 2,
    condition,
    humidity: 40 + Math.floor(Math.random() * 40),
    windSpeed: 2 + Math.floor(Math.random() * 8),
  };
}

function mockNews(country) {
  const headlines = [
    `${country.name} announces major infrastructure investment`,
    `Tech industry in ${country.name} sees record growth`,
    `${country.name} commits to new renewable energy targets`,
    `Cultural heritage festival draws crowds in ${country.capital}`,
    `${country.name} strengthens regional trade agreements`,
  ];
  return headlines.map((title, i) => ({
    title,
    source: ['Reuters', 'Bloomberg', 'AP News', 'BBC', 'The Guardian'][i],
    url: '#',
    publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
  }));
}

function mockStats(country) {
  const pop = [14e8, 33e7, 12e7, 8e7, 6e7, 2e7][Math.floor(Math.random() * 6)];
  return {
    population: pop,
    gdp: pop * (3000 + Math.floor(Math.random() * 50000)),
    gdpPerCapita: 3000 + Math.floor(Math.random() * 50000),
    lifeExpectancy: 60 + Math.round(Math.random() * 20 * 10) / 10,
    area: 50000 + Math.floor(Math.random() * 9e6),
    gini: 25 + Math.round(Math.random() * 20 * 10) / 10,
  };
}

/* ── Store ──────────────────────────────────────────── */

const useStore = create((set, get) => ({
  // Selected country
  selectedCountry: null,
  selectCountry: (country) => set({ selectedCountry: country, panelOpen: true }),
  clearSelection: () => set({ selectedCountry: null, panelOpen: false, countryData: null }),

  // Panel state
  panelOpen: false,
  setPanelOpen: (open) => set({ panelOpen: open }),

  // Country data (mock — no backend needed)
  countryData: null,
  loading: false,
  error: null,

  fetchCountryData: async (code) => {
    set({ loading: true, error: null });
    // Small delay so the skeleton loader is visible
    await new Promise((r) => setTimeout(r, 300));

    const country = COUNTRIES.find((c) => c.code === code) || { code, name: code, capital: 'Unknown', region: 'Unknown', flag: '' };

    set({
      countryData: {
        country,
        weather: mockWeather(country),
        news: mockNews(country),
        stats: mockStats(country),
      },
      loading: false,
    });
  },

  // Hover state (for tooltip)
  hoveredCountry: null,
  hoverPosition: { x: 0, y: 0 },
  setHovered: (country, x, y) => set({ hoveredCountry: country, hoverPosition: { x, y } }),
  clearHovered: () => set({ hoveredCountry: null }),

  // Globe camera target
  cameraTarget: null,
  setCameraTarget: (lat, lng) => set({ cameraTarget: { lat, lng } }),
}));

export default useStore;
