import { create } from 'zustand';
import { COUNTRIES } from './countries';



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

    try {
      const res = await fetch(`/api/country/${code}`);
      if (!res.ok) {
        throw new Error('Failed to fetch country data');
      }
      const data = await res.json();

      // Ensure we have a flag, either from our local COUNTRIES data or by generating it
      const localCountry = COUNTRIES.find((c) => c.code === code);
      if (localCountry && !data.country.flag) {
        data.country.flag = localCountry.flag;
      } else if (!data.country.flag) {
        // Fallback flag generation
        const codePoints = code.toUpperCase().split('').map(c => 0x1f1e6 + c.charCodeAt(0) - 65);
        data.country.flag = String.fromCodePoint(...codePoints);
      }

      set({
        countryData: data,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.message,
        loading: false,
      });
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
