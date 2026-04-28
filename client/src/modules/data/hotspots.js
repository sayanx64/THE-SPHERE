/**
 * Hotspot markers — important global events.
 * Types: conflict (red), weather (orange), economic (blue)
 */

const HOTSPOTS = [
  // Conflicts
  { type: "conflict", name: "Ukraine – Eastern Front", lat: 48.3794, lng: 37.7431 },
  { type: "conflict", name: "Gaza Strip", lat: 31.3547, lng: 34.3088 },
  { type: "conflict", name: "Sudan – Khartoum", lat: 15.5007, lng: 32.5599 },
  { type: "conflict", name: "Myanmar – Rakhine", lat: 20.1486, lng: 92.8986 },
  { type: "conflict", name: "DR Congo – Goma", lat: -1.6585, lng: 29.2200 },

  // Weather / Disasters
  { type: "weather", name: "Typhoon Warning – Philippines", lat: 13.4125, lng: 123.3890 },
  { type: "weather", name: "Wildfire Alert – California", lat: 36.7783, lng: -119.4179 },
  { type: "weather", name: "Flooding – Bangladesh", lat: 24.8949, lng: 91.8687 },
  { type: "weather", name: "Cyclone Watch – Mozambique", lat: -18.6657, lng: 35.5296 },
  { type: "weather", name: "Heatwave – Southern Europe", lat: 38.9637, lng: 22.4099 },

  // Economic
  { type: "economic", name: "Tech Boom – Bengaluru", lat: 12.9716, lng: 77.5946 },
  { type: "economic", name: "Oil Price Surge – Dubai", lat: 25.2048, lng: 55.2708 },
  { type: "economic", name: "Stock Rally – Tokyo", lat: 35.6762, lng: 139.6503 },
  { type: "economic", name: "Currency Crisis – Buenos Aires", lat: -34.6037, lng: -58.3816 },
  { type: "economic", name: "Trade Expansion – Shanghai", lat: 31.2304, lng: 121.4737 },
];

export default HOTSPOTS;
