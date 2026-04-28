import React, { useState, useMemo, useRef, useEffect } from 'react';
import { COUNTRIES } from "../modules/data/countries";
import CITIES from "../modules/data/cities";
import useStore from "../modules/data/store";
import useShipStore from "../modules/data/shipStore";

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef();
  const selectCountry = useStore((s) => s.selectCountry);
  const clearSelection = useStore((s) => s.clearSelection);
  const setCameraTarget = useStore((s) => s.setCameraTarget);
  const fetchCountryData = useStore((s) => s.fetchCountryData);
  const selectShip = useShipStore((s) => s.selectShip);
  const clearShipSelection = useShipStore((s) => s.clearShipSelection);
  const shipsArray = useShipStore((s) => s.shipsArray);

  // Combined search: ships → cities → countries
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    // Ships — match by name or MMSI
    const shipResults = shipsArray.filter(
      (s) =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.mmsi && String(s.mmsi).includes(q))
    ).slice(0, 4).map((s) => ({ type: 'ship', data: s }));

    // Cities — match by city name or parent country name
    const cityResults = CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    ).slice(0, 4).map((c) => ({ type: 'city', data: c }));

    // Countries — match by name, code, or capital
    const countryResults = COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase() === q ||
        c.capital.toLowerCase().includes(q)
    ).slice(0, 5).map((c) => ({ type: 'country', data: c }));

    return [...shipResults, ...cityResults, ...countryResults].slice(0, 8);
  }, [query, shipsArray]);

  // Select a country (direct or via city)
  const handleSelectCountry = (country) => {
    clearShipSelection();
    selectCountry(country);
    setCameraTarget(country.lat, country.lng);
    fetchCountryData(country.code);
    setQuery('');
    inputRef.current?.blur();
  };

  // Select a city → find its country, fly to city coordinates
  const handleSelectCity = (city) => {
    const country = COUNTRIES.find((c) => c.code === city.countryCode);
    if (country) {
      clearShipSelection();
      selectCountry(country);
      setCameraTarget(city.lat, city.lng); // fly to city, not country centroid
      fetchCountryData(country.code);
    }
    setQuery('');
    inputRef.current?.blur();
  };

  // Select a ship → close country panel, open ship panel, fly to ship
  const handleSelectShip = (ship) => {
    clearSelection();
    selectShip(ship);
    setQuery('');
    inputRef.current?.blur();
  };

  // Close dropdown on escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setQuery('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const showResults = focused && results.length > 0;

  // Ship category color
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

  return (
    <div className="search-container">
      <span className="search-icon">🔍</span>
      <input
        ref={inputRef}
        className="search-input"
        type="text"
        placeholder="Search countries, cities, or ships..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        id="search-input"
        aria-label="Search countries, cities, or ships"
      />
      {showResults && (
        <div className="search-results">
          {results.map((r, i) =>
            r.type === 'country' ? (
              <div
                key={`country-${r.data.code}`}
                className="search-result-item"
                onMouseDown={() => handleSelectCountry(r.data)}
              >
                <span className="search-result-flag">{r.data.flag}</span>
                <span className="search-result-name">{r.data.name}</span>
                <span className="search-result-region">{r.data.region}</span>
              </div>
            ) : r.type === 'city' ? (
              <div
                key={`city-${r.data.name}-${i}`}
                className="search-result-item"
                onMouseDown={() => handleSelectCity(r.data)}
              >
                <span className="search-result-flag">🏙️</span>
                <span className="search-result-name">{r.data.name}</span>
                <span className="search-result-region">{r.data.country}</span>
              </div>
            ) : (
              <div
                key={`ship-${r.data.mmsi}`}
                className="search-result-item"
                onMouseDown={() => handleSelectShip(r.data)}
              >
                <span className="search-result-flag" style={{ fontSize: '0.9rem' }}>
                  <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, verticalAlign: 'middle' }}>
                    <path d="M12 2L20 20L12 17L4 20L12 2Z" fill={getShipColor(r.data.shipCategory)} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="search-result-name">{r.data.name || 'Unknown'}</span>
                <span className="search-result-region" style={{ color: getShipColor(r.data.shipCategory), fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                  {r.data.shipCategory || 'Vessel'} · {r.data.speed?.toFixed(1) || 0}kn
                </span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
