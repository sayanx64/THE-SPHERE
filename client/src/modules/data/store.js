import { create } from 'zustand';
import { COUNTRIES as STATIC_COUNTRIES, fetchAllCountries, getFlag } from './countries';

/* ── Store ──────────────────────────────────────────── */

const useStore = create((set, get) => ({
  // ── Dynamic country list (starts with static fallback) ──
  countries: STATIC_COUNTRIES,
  countriesLoaded: false,

  loadCountries: async () => {
    try {
      const all = await fetchAllCountries();
      if (all && all.length > 0) {
        set({ countries: all, countriesLoaded: true });
        console.log(`🌍 Loaded ${all.length} countries from REST Countries API`);
      }
    } catch (err) {
      console.warn('⚠️ Failed to fetch countries, using static fallback:', err.message);
      set({ countriesLoaded: true }); // Mark as loaded even on failure
    }
  },

  // ── Selected country ──
  selectedCountry: null,
  selectCountry: (country) => set({ selectedCountry: country, panelOpen: true }),
  clearSelection: () => set({ selectedCountry: null, panelOpen: false, countryData: null }),

  // Panel state
  panelOpen: false,
  setPanelOpen: (open) => set({ panelOpen: open }),

  // Country data (fetched from backend)
  countryData: null,
  loading: false,
  error: null,

  fetchCountryData: async (input) => {
    set({ loading: true, error: null });

    // ── Resolve input to ISO Alpha-2 code ──
    let code = input?.trim()?.toUpperCase();
    const isValidCode = /^[A-Z]{2}$/.test(code);

    if (!isValidCode) {
      const countries = get().countries;
      const match = countries.find((c) =>
        c.name.toLowerCase() === input?.toLowerCase()?.trim() ||
        c.capital.toLowerCase() === input?.toLowerCase()?.trim()
      );
      if (match) {
        code = match.code;
      } else {
        set({
          countryData: null,
          error: `Unknown country: "${input}"`,
          loading: false,
        });
        return;
      }
    }

    try {
      const res = await fetch(`/api/country/${code}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch data for ${code}`);
      }
      const data = await res.json();

      // Ensure flag
      if (!data.country.flag) {
        data.country.flag = getFlag(code);
      }

      set({
        countryData: data,
        loading: false,
      });
    } catch (err) {
      // Fallback: use local country data so the panel doesn't go blank
      const countries = get().countries;
      const localCountry = countries.find((c) => c.code === code);
      if (localCountry) {
        set({
          countryData: {
            country: {
              code: localCountry.code,
              name: localCountry.name,
              capital: localCountry.capital,
              region: localCountry.region,
              flag: localCountry.flag || getFlag(code),
              population: localCountry.population || null,
            },
            weather: null,
            news: [],
            stats: localCountry.gdp ? {
              gdp: localCountry.gdp * 1e9,
              area: localCountry.area || null,
              gdpPerCapita: localCountry.population ? Math.round((localCountry.gdp * 1e9) / localCountry.population) : null,
              lifeExpectancy: null,
              gini: null,
            } : null,
          },
          error: 'Server unavailable — showing cached data',
          loading: false,
        });
      } else {
        set({
          error: err.message,
          loading: false,
        });
      }
    }
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
