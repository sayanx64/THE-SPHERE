import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import Globe from 'react-globe.gl';
import { feature } from 'topojson-client';
import CAPITALS from '../data/capitals';
import CITIES from '../data/cities.json';
import HOTSPOTS from '../data/hotspots';
import useStore from '../data/store';
import useShipStore from '../data/shipStore';
import SpatialUI from './SpatialUI';
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
 * Find a country entry matching a GeoJSON feature name.
 * Uses the provided countries list (dynamic from store).
 */
function matchCountryInList(geoName, countriesList) {
  if (!geoName) return null;
  const normalized = normalizeName(geoName).toLowerCase();

  return countriesList.find((c) => {
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
  const clearSelection = useStore((s) => s.clearSelection);
  const countries = useStore((s) => s.countries);

  // Matching helper using dynamic countries list
  const matchCountry = useCallback(
    (geoName) => matchCountryInList(geoName, countries),
    [countries]
  );

  // Ship tracking
  const shipsArray = useShipStore((s) => s.shipsArray);
  const shipLayerVisible = useShipStore((s) => s.shipLayerVisible);
  const selectShip = useShipStore((s) => s.selectShip);
  const clearShipSelection = useShipStore((s) => s.clearShipSelection);
  const connectToShipStream = useShipStore((s) => s.connectToShipStream);
  const trackData = useShipStore((s) => s.trackData);

  // Connect to ship SSE stream on mount
  useEffect(() => {
    connectToShipStream();
  }, []);

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
    globe.controls().autoRotate = false; // Disabled auto-rotation per user request
    globe.controls().autoRotateSpeed = 0.3;
    globe.controls().enableDamping = true;
    globe.controls().dampingFactor = 0.12;
    globe.controls().minDistance = 150;
    globe.controls().maxDistance = 500;
    globe.pointOfView({ lat: 20, lng: 78, altitude: 2.2 });

    // ── Day/Night Terminator ──
    // Calculate the sub-solar point (where the sun is directly overhead)
    function getSunPosition(date) {
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
      const hourUTC = date.getUTCHours() + date.getUTCMinutes() / 60;
      // Solar declination (simplified Fourier approximation)
      const declination = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));
      // Sub-solar longitude: sun is at noon (12:00 UTC) → longitude 0
      const sunLng = (12 - hourUTC) * 15;
      return { lat: declination, lng: sunLng };
    }

    // Convert lat/lng to 3D vector for the light
    function latLngToVec3(lat, lng, radius) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    const scene = globe.scene();

    // Dim the default ambient light
    scene.children.forEach((child) => {
      if (child.isAmbientLight) {
        child.intensity = 0.15;
      }
    });

    // Create a directional light to simulate the sun
    const sunLight = new THREE.DirectionalLight(0xfff8e1, 1.8);
    scene.add(sunLight);

    // Update sun position immediately and every 60 seconds
    function updateSun() {
      const { lat, lng } = getSunPosition(new Date());
      const pos = latLngToVec3(lat, lng, 400);
      sunLight.position.copy(pos);
    }
    updateSun();
    const sunInterval = setInterval(updateSun, 60000);

    return () => clearInterval(sunInterval);
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
      globe.controls().autoRotate = false; // Stay completely static
      globe.pointOfView({ altitude: 2.2 }, 1000);
    }
  }, [selectedCountry, cameraTarget]);

  // ── Polygon handlers (country boundaries) ──

  const handlePolygonClick = useCallback((poly) => {
    const name = poly?.properties?.name;
    if (!name) return;

    const country = matchCountry(name);

    if (country) {
      // Close ship panel first, then open country panel
      clearShipSelection();
      selectCountry(country);
      fetchCountryData(country.code);
      console.log(`🌍 Selected: ${country.name} (${country.code})`);
    } else {
      console.log(`🌍 Clicked: ${name} (not in dataset)`);
    }
  }, [selectCountry, fetchCountryData, clearShipSelection]);

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
    // Check if it's a ship point
    if (point.mmsi) {
      // Close country panel first, then open ship panel
      clearSelection();
      selectShip(point);
      const globe = globeRef.current;
      if (globe) {
        globe.controls().autoRotate = false;
        globe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.5 }, 1200);
      }
      return;
    }
    const country = countries.find((c) => c.code === point.code);
    if (country) {
      // Close ship panel first, then open country panel
      clearShipSelection();
      selectCountry(country);
      fetchCountryData(country.code);
    }
  }, [selectCountry, clearSelection, fetchCountryData, selectShip, clearShipSelection, countries]);

  const handlePointHover = useCallback((point) => {
    if (point) {
      if (!point.mmsi) {
        const country = countries.find((c) => c.code === point.code);
        if (country) setHoveredStore(country, window.innerWidth / 2, 80);
      }
      document.body.style.cursor = 'pointer';
    } else {
      clearHoveredStore();
      document.body.style.cursor = 'default';
    }
  }, [setHoveredStore, clearHoveredStore, countries]);

  // Capital city dots + major cities merged into one points layer
  const allCityPoints = useMemo(() => {
    const caps = CAPITALS.map((c) => ({
      lat: c.lat, lng: c.lng, code: c.code, name: c.name, capital: c.capital, isCapital: true,
    }));
    const others = CITIES.map((c) => ({
      lat: c.lat, lng: c.lng, code: c.code, name: c.name, capital: c.name, isCapital: false,
    }));
    return [...caps, ...others];
  }, []);

  // Combine Hotspots and Ships for the HTML elements layer
  const htmlLayerData = useMemo(() => {
    const hotspots = HOTSPOTS.map(h => ({ ...h, isHotspot: true }));
    const ships = shipLayerVisible 
      ? shipsArray
          .filter(s => s.lat != null && s.lng != null)
          .map(s => ({ ...s, isShip: true, altitude: 0.008 }))
      : [];
    return [...hotspots, ...ships];
  }, [shipsArray, shipLayerVisible]);

  // Points layer is now thousands of cities
  const pointsData = allCityPoints;

  const pointColor = useCallback((d) => {
    if (selectedCountry?.code === d.code) {
      return d.isCapital ? '#ff3a7f' : 'rgba(255, 58, 127, 0.7)'; // Vibrant for capital, translucent for other cities
    }
    return d.isCapital ? 'rgba(110, 138, 255, 0.8)' : 'rgba(115, 128, 161, 0.3)'; // Dimmer color for non-capitals
  }, [selectedCountry]);

  const pointRadius = useCallback((d) => {
    if (selectedCountry?.code === d.code) {
      return d.isCapital ? 0.35 : 0.15; // Reduced from 1.4 down to a premium, subtle size
    }
    return d.isCapital ? 0.25 : 0.08; // Smaller radius for non-selected cities
  }, [selectedCountry]);

  const pointAltitude = useCallback(() => 0.006, []);

  // Glow rings around capital dots only
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

  // Ship track path data
  const pathsData = useMemo(() => {
    if (!trackData || trackData.length < 2) return [];
    return [{
      coords: trackData.map(p => [p.lat, p.lng]),
    }];
  }, [trackData]);

  return (
    <>
    <Globe
      ref={globeRef}
      globeImageUrl="/textures/earth-blue-marble.jpg"
      bumpImageUrl="/textures/earth-topology.png"
      backgroundColor="#050510"
      atmosphereColor="#4da6ff"
      atmosphereAltitude={0.15}

      // Country polygons
      polygonsData={polygons}
      polygonCapColor={polygonCapColor}
      polygonSideColor={polygonSideColor}
      polygonStrokeColor={polygonStrokeColor}
      polygonAltitude={0.002}
      polygonLabel={(d) => {
        const name = d?.properties?.name || '';
        const country = matchCountry(name);
        if (!country) return `<span style="font-family:Inter,sans-serif;font-size:13px;color:#e8e8f0;background:rgba(10,10,35,0.85);padding:4px 10px;border-radius:8px;border:1px solid rgba(108,99,255,0.3)">${name}</span>`;
        return `<div style="font-family:Inter,sans-serif;background:rgba(10,10,35,0.92);padding:12px 16px;border-radius:12px;border:1px solid rgba(108,99,255,0.3);box-shadow:0 8px 32px rgba(0,0,0,0.5);backdrop-filter:blur(20px);min-width:200px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:1.4rem">${country.flag}</span>
            <div>
              <div style="font-size:14px;font-weight:700;color:#e8e8f0">${country.name}</div>
              <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.5px">${country.region}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            <div style="background:rgba(255,255,255,0.04);padding:6px 8px;border-radius:6px">
              <div style="font-size:9px;color:#6c63ff;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Capital</div>
              <div style="font-size:12px;color:#e8e8f0;font-weight:500">${country.capital}</div>
            </div>
            <div style="background:rgba(255,255,255,0.04);padding:6px 8px;border-radius:6px">
              <div style="font-size:9px;color:#00d4ff;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Population</div>
              <div style="font-size:12px;color:#e8e8f0;font-weight:500">${country.population ? (country.population >= 1e6 ? (country.population / 1e6).toFixed(1) + 'M' : country.population.toLocaleString()) : '—'}</div>
            </div>
            <div style="background:rgba(255,255,255,0.04);padding:6px 8px;border-radius:6px;grid-column:1 / -1">
              <div style="font-size:9px;color:#00e676;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">GDP (Nominal)</div>
              <div style="font-size:12px;color:#e8e8f0;font-weight:500">$${country.gdp ? country.gdp.toLocaleString() + 'B' : '—'}</div>
            </div>
          </div>
        </div>`;
      }}
      onPolygonClick={handlePolygonClick}
      onPolygonHover={handlePolygonHover}

      // Capital city dots
      pointsData={pointsData}
      pointLat="lat"
      pointLng="lng"
      pointColor={pointColor}
      pointRadius={pointRadius}
      pointAltitude={pointAltitude}
      pointsMerge={true} // BATCH 5000 CITIES INTO 1 DRAW CALL FOR 60 FPS!
      onPointClick={handlePointClick}
      onPointHover={handlePointHover}
      pointLabel={(d) => `<span style="font-family:Inter,sans-serif;font-size:11px;color:#ccc;background:rgba(10,10,35,0.8);padding:2px 8px;border-radius:6px">${d.capital || d.name}</span>`}

      // Glow rings around capitals
      ringsData={ringsData}
      ringLat="lat"
      ringLng="lng"
      ringColor={ringColor}
      ringMaxRadius={ringMaxRadius}
      ringPropagationSpeed={ringPropagationSpeed}
      ringRepeatPeriod={ringRepeatPeriod}

      // HTML Elements (Hotspots and Ships)
      htmlElementsData={htmlLayerData}
      htmlLat="lat"
      htmlLng="lng"
      htmlAltitude="altitude"
      htmlElement={(d) => {
        const el = document.createElement('div');
        
        if (d.isHotspot) {
          const typeColors = { conflict: '#ff3333', weather: '#ff9933', economic: '#00d4ff' };
          el.className = `hotspot-marker hotspot-${d.type}`;
          el.innerHTML = `
            <div class="hotspot-dot"></div>
            <div class="hotspot-pulse"></div>
            <div class="hotspot-label">
              <span style="color:${typeColors[d.type]};font-weight:600;text-transform:uppercase;font-size:9px;letter-spacing:0.5px">${d.type}</span>
              <span style="margin-left:4px">${d.name}</span>
            </div>
          `;
        } else if (d.isShip) {
          // Native DOM click handler ensures perfect clickability
          el.onclick = (e) => {
            e.stopPropagation();
            handlePointClick(d);
          };
          
          el.style.cursor = 'pointer';
          el.style.pointerEvents = 'auto'; 
          
          const getShipColor = (cat) => {
            switch (cat) {
              case 'Cargo': return '#ff1744';
              case 'Tanker': return '#ff9100';
              case 'Passenger': return '#00e676';
              case 'Fishing': return '#ffea00';
              case 'High-Speed': return '#d500f9';
              case 'Special': return '#00b0ff';
              default: return '#00e5ff';
            }
          };

          const color = getShipColor(d.shipCategory);
          const heading = d.heading ?? d.cog ?? 0;
          
          // CSS arrow perfectly aligned with MarineTraffic styling
          el.innerHTML = `
            <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; transform: rotate(${heading}deg); filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.8));">
              <path d="M12 2L20 20L12 17L4 20L12 2Z" fill="${color}" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>
            </svg>
          `;
          
          // Native hover tooltip
          el.title = `🚢 ${d.name || 'Unknown'} — ${d.speed?.toFixed(1) || 0}kn`;
        }
        
        return el;
      }}

      // Ship route trail (Smooth fading track)
      pathsData={pathsData}
      pathPoints="coords"
      pathPointLat={(p) => p[0]}
      pathPointLng={(p) => p[1]}
      pathColor={() => ['rgba(255, 23, 68, 0.9)', 'rgba(255, 23, 68, 0.0)']}
      pathStroke={1.5}
      pathDashLength={1}
      pathDashGap={0}
      pathDashAnimateTime={0}
      pathAltitude={0.005}

      animateIn={true}
      width={dimensions.width}
      height={dimensions.height}
    />
    <SpatialUI globeRef={globeRef} />
    </>
  );
}
