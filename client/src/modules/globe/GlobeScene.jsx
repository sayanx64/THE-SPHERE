import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import Globe from 'react-globe.gl';
import { feature } from 'topojson-client';
import { COUNTRIES } from '../data/countries';
import CAPITALS from '../data/capitals';
import HOTSPOTS from '../data/hotspots';
import useStore from '../data/store';
import './hotspots.css';

/* ── Country name normalization ──────────────────── */

const COUNTRY_NAME_MAP = {
  'United States of America': 'United States',
  'Russian Federation': 'Russia',
  'Korea, Republic of': 'South Korea',
  "Korea, Democratic People's Republic of": 'North Korea',
  'Iran, Islamic Republic of': 'Iran',
  'Syrian Arab Republic': 'Syria',
  'Viet Nam': 'Vietnam',
  'Lao People\'s Democratic Republic': 'Laos',
  'Czechia': 'Czech Republic',
  'Myanmar': 'Myanmar',
  'Brunei Darussalam': 'Brunei',
  'Republic of the Congo': 'Congo',
  'Dem. Rep. Congo': 'DR Congo',
  'Côte d\'Ivoire': 'Ivory Coast',
  'Bosnia and Herz.': 'Bosnia',
  'Dominican Rep.': 'Dominican Republic',
  'Central African Rep.': 'Central African Republic',
  'S. Sudan': 'South Sudan',
  'Solomon Is.': 'Solomon Islands',
  'Eq. Guinea': 'Equatorial Guinea',
  'eSwatini': 'Eswatini',
  'Falkland Is.': 'Falkland Islands',
  'Fr. S. Antarctic Lands': 'French Southern Territories',
  'W. Sahara': 'Western Sahara',
  'N. Cyprus': 'Northern Cyprus',
  'Somaliland': 'Somalia',
  'Taiwan': 'Taiwan',
};

const normalizeName = (name) => COUNTRY_NAME_MAP[name] || name;

/**
 * Find a COUNTRIES entry matching a GeoJSON feature name.
 * Tries: exact (normalized) → case-insensitive partial.
 */
function matchCountry(geoName) {
  if (!geoName) return null;
  const normalized = normalizeName(geoName).toLowerCase();

  return COUNTRIES.find((c) => {
    const cn = c.name.toLowerCase();
    return cn === normalized || normalized.includes(cn) || cn.includes(normalized);
  });
}

/** Check if a polygon belongs to the currently selected country. */
function isPolyForCountry(polyName, country) {
  if (!polyName || !country) return false;
  const a = normalizeName(polyName).toLowerCase();
  const b = country.name.toLowerCase();
  return a === b || a.includes(b) || b.includes(a);
}

export default function GlobeScene() {
  const globeRef = useRef();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [polygons, setPolygons] = useState([]);
  const [hoveredPoly, setHoveredPoly] = useState(null);
  const [selectedPoly, setSelectedPoly] = useState(null);

  const selectCountry = useStore((s) => s.selectCountry);
  const fetchCountryData = useStore((s) => s.fetchCountryData);
  const setHoveredStore = useStore((s) => s.setHovered);
  const clearHoveredStore = useStore((s) => s.clearHovered);
  const selectedCountry = useStore((s) => s.selectedCountry);

  // Load GeoJSON from TopoJSON
  useEffect(() => {
    fetch('/geojson/countries.json')
      .then((r) => r.json())
      .then((topo) => {
        const geo = feature(topo, topo.objects.countries);
        setPolygons(geo.features);
      })
      .catch((err) => console.warn('Failed to load country boundaries:', err));
  }, []);

  // Window resize
  useEffect(() => {
    const onResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Initial globe setup
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.3;
    globe.controls().enableDamping = true;
    globe.controls().dampingFactor = 0.12;
    globe.controls().minDistance = 150;
    globe.controls().maxDistance = 500;
    globe.pointOfView({ lat: 20, lng: 78, altitude: 2.2 });
  }, []);

  // Camera target from store (set by SearchBar for city-level coordinates)
  const cameraTarget = useStore((s) => s.cameraTarget);

  // Fly-to on selection (triggered by polygon click, point click, OR search)
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    if (selectedCountry) {
      globe.controls().autoRotate = false;
      // Prefer cameraTarget (city coords) over country centroid
      const lat = cameraTarget?.lat ?? selectedCountry.lat;
      const lng = cameraTarget?.lng ?? selectedCountry.lng;
      // Zoom closer for city-level targets
      const isCityZoom = cameraTarget && (
        cameraTarget.lat !== selectedCountry.lat ||
        cameraTarget.lng !== selectedCountry.lng
      );
      globe.pointOfView(
        { lat, lng, altitude: isCityZoom ? 1.2 : 1.7 },
        1200
      );
    } else {
      globe.controls().autoRotate = true;
      globe.pointOfView({ altitude: 2.2 }, 1000);
    }
  }, [selectedCountry, cameraTarget]);

  // ── Polygon handlers (country boundaries) ──

  const handlePolygonClick = useCallback((poly) => {
    const name = poly?.properties?.name;
    if (!name) return;

    const country = matchCountry(name);

    if (country) {
      selectCountry(country);
      fetchCountryData(country.code);
      console.log(`🌍 Selected: ${country.name} (${country.code})`);
    } else {
      console.log(`🌍 Clicked: ${name} (not in dataset)`);
    }
  }, [selectCountry, fetchCountryData]);

  const handlePolygonHover = useCallback((poly) => {
    setHoveredPoly(poly);
    if (poly) {
      document.body.style.cursor = 'pointer';
      const country = matchCountry(poly?.properties?.name);
      if (country) {
        setHoveredStore(country, window.innerWidth / 2, 80);
      }
    } else {
      document.body.style.cursor = 'default';
      clearHoveredStore();
    }
  }, [setHoveredStore, clearHoveredStore]);

  // Polygon fill — subtle, with highlight on hover/selected
  const polygonCapColor = useCallback((d) => {
    const isSelected = isPolyForCountry(d?.properties?.name, selectedCountry);
    const isHovered = hoveredPoly === d;

    if (isSelected) return 'rgba(255, 58, 127, 0.35)';
    if (isHovered) return 'rgba(108, 99, 255, 0.18)';
    return 'rgba(255, 255, 255, 0.01)';
  }, [selectedCountry, hoveredPoly]);

  const polygonSideColor = useCallback(() => 'rgba(0, 0, 0, 0)', []);

  const polygonStrokeColor = useCallback((d) => {
    const isSelected = isPolyForCountry(d?.properties?.name, selectedCountry);
    const isHovered = hoveredPoly === d;

    if (isSelected) return 'rgba(255, 58, 127, 0.9)';
    if (isHovered) return 'rgba(108, 99, 255, 0.5)';
    return 'rgba(108, 99, 255, 0.08)';
  }, [selectedCountry, hoveredPoly]);

  // ── Point handlers (keep existing system) ──

  const handlePointClick = useCallback((point) => {
    const country = COUNTRIES.find((c) => c.code === point.code);
    if (country) {
      selectCountry(country);
      fetchCountryData(country.code);
    }
  }, [selectCountry, fetchCountryData]);

  const handlePointHover = useCallback((point) => {
    if (point) {
      const country = COUNTRIES.find((c) => c.code === point.code);
      if (country) setHoveredStore(country, window.innerWidth / 2, 80);
      document.body.style.cursor = 'pointer';
    } else {
      clearHoveredStore();
      document.body.style.cursor = 'default';
    }
  }, [setHoveredStore, clearHoveredStore]);

  // Capital city dots — using accurate capital coordinates
  const pointsData = useMemo(() =>
    CAPITALS.map((c) => ({
      lat: c.lat, lng: c.lng, code: c.code, name: c.name, capital: c.capital,
    })),
  []);

  const pointColor = useCallback((d) =>
    selectedCountry?.code === d.code ? '#ff6b9d' : '#6e8aff',
  [selectedCountry]);

  const pointRadius = useCallback((d) =>
    selectedCountry?.code === d.code ? 1.4 : 0.35,
  [selectedCountry]);

  // Glow rings around capital dots
  const ringsData = useMemo(() =>
    CAPITALS.map((c) => ({
      lat: c.lat, lng: c.lng, code: c.code,
    })),
  []);

  const ringColor = useCallback((d) =>
    selectedCountry?.code === d.code ? () => '#ff3a7f' : () => 'rgba(168, 155, 255, 0.5)',
  [selectedCountry]);

  const ringMaxRadius = useCallback((d) =>
    selectedCountry?.code === d.code ? 3 : 1.2,
  [selectedCountry]);

  const ringPropagationSpeed = useCallback((d) =>
    selectedCountry?.code === d.code ? 3 : 1,
  [selectedCountry]);

  const ringRepeatPeriod = useCallback((d) =>
    selectedCountry?.code === d.code ? 600 : 2000,
  [selectedCountry]);

  return (
    <Globe
      ref={globeRef}
      globeImageUrl="/textures/earth-day.jpg"
      backgroundColor="#050510"
      atmosphereColor="#4a90d9"
      atmosphereAltitude={0.15}

      // Country polygons
      polygonsData={polygons}
      polygonCapColor={polygonCapColor}
      polygonSideColor={polygonSideColor}
      polygonStrokeColor={polygonStrokeColor}
      polygonAltitude={0.002}
      polygonLabel={(d) => `<span style="font-family:Inter,sans-serif;font-size:13px;color:#e8e8f0;background:rgba(10,10,35,0.85);padding:4px 10px;border-radius:8px;border:1px solid rgba(108,99,255,0.3)">${d?.properties?.name || ''}</span>`}
      onPolygonClick={handlePolygonClick}
      onPolygonHover={handlePolygonHover}

      // Capital city dots
      pointsData={pointsData}
      pointLat="lat"
      pointLng="lng"
      pointColor={pointColor}
      pointRadius={pointRadius}
      pointAltitude={0.006}
      pointsMerge={false}
      onPointClick={handlePointClick}
      onPointHover={handlePointHover}
      pointLabel={(d) => `<span style="font-family:Inter,sans-serif;font-size:11px;color:#ccc;background:rgba(10,10,35,0.8);padding:2px 8px;border-radius:6px">${d.capital}</span>`}

      // Glow rings around capitals
      ringsData={ringsData}
      ringLat="lat"
      ringLng="lng"
      ringColor={ringColor}
      ringMaxRadius={ringMaxRadius}
      ringPropagationSpeed={ringPropagationSpeed}
      ringRepeatPeriod={ringRepeatPeriod}

      // Hotspot markers (conflict / weather / economic)
      htmlElementsData={HOTSPOTS}
      htmlLat="lat"
      htmlLng="lng"
      htmlAltitude={0.01}
      htmlElement={(d) => {
        const typeColors = { conflict: '#ff3333', weather: '#ff9933', economic: '#00d4ff' };
        const el = document.createElement('div');
        el.className = `hotspot-marker hotspot-${d.type}`;
        el.innerHTML = `
          <div class="hotspot-dot"></div>
          <div class="hotspot-pulse"></div>
          <div class="hotspot-label">
            <span style="color:${typeColors[d.type]};font-weight:600;text-transform:uppercase;font-size:9px;letter-spacing:0.5px">${d.type}</span>
            <span style="margin-left:4px">${d.name}</span>
          </div>
        `;
        return el;
      }}

      animateIn={true}
      width={dimensions.width}
      height={dimensions.height}
    />
  );
}
