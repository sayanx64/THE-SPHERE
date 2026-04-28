import React, { useState, useMemo, useRef, useEffect } from 'react';
import { COUNTRIES } from "../modules/data/countries";
import CITIES from "../modules/data/cities";
import useStore from "../modules/data/store";

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef();
  const selectCountry = useStore((s) => s.selectCountry);
  const setCameraTarget = useStore((s) => s.setCameraTarget);
  const fetchCountryData = useStore((s) => s.fetchCountryData);

  // Combined search: cities first, then countries
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

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

    return [...cityResults, ...countryResults].slice(0, 8);
  }, [query]);

  // Select a country (direct or via city)
  const handleSelectCountry = (country) => {
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
      selectCountry(country);
      setCameraTarget(city.lat, city.lng); // fly to city, not country centroid
      fetchCountryData(country.code);
    }
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

  return (
    <div className="search-container">
      <span className="search-icon">🔍</span>
      <input
        ref={inputRef}
        className="search-input"
        type="text"
        placeholder="Search countries or cities..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        id="search-input"
        aria-label="Search countries or cities"
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
            ) : (
              <div
                key={`city-${r.data.name}-${i}`}
                className="search-result-item"
                onMouseDown={() => handleSelectCity(r.data)}
              >
                <span className="search-result-flag">🏙️</span>
                <span className="search-result-name">{r.data.name}</span>
                <span className="search-result-region">{r.data.country}</span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
