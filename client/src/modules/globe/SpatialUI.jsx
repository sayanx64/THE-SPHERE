import React, { useEffect, useRef, useState } from 'react';
import useStore from '../data/store';

function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num?.toLocaleString() || '—';
}

function getWeatherEmoji(condition) {
  if (!condition) return '🌡️';
  const c = condition.toLowerCase();
  if (c.includes('clear') || c.includes('sunny')) return '☀️';
  if (c.includes('cloud')) return '☁️';
  if (c.includes('rain') || c.includes('drizzle')) return '🌧️';
  if (c.includes('thunder') || c.includes('storm')) return '⛈️';
  if (c.includes('snow')) return '🌨️';
  if (c.includes('mist') || c.includes('fog') || c.includes('haze')) return '🌫️';
  return '🌡️';
}

export default function SpatialUI({ globeRef }) {
  const containerRef = useRef(null);
  const selectedCountry = useStore((s) => s.selectedCountry);
  const countryData = useStore((s) => s.countryData);
  const loading = useStore((s) => s.loading);
  const error = useStore((s) => s.error);

  const [isVisible, setIsVisible] = useState(false);

  // Sync spatial position with globe
  useEffect(() => {
    if (!selectedCountry || !globeRef.current) {
      setIsVisible(false);
      return;
    }

    // Delay visibility slightly to allow camera to move first
    const showTimeout = setTimeout(() => setIsVisible(true), 150);

    let animationFrameId;
    const updatePosition = () => {
      if (globeRef.current && containerRef.current) {
        // Project lat/lng to 2D screen coordinates
        const coords = globeRef.current.getScreenCoords(
          selectedCountry.lat,
          selectedCountry.lng,
          0.02 // slight altitude offset
        );

        // If coords is valid, update the absolute transform
        if (coords) {
          containerRef.current.style.transform = `translate(${coords.x}px, ${coords.y}px)`;
        }
      }
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    updatePosition();

    return () => {
      clearTimeout(showTimeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedCountry, globeRef]);

  if (!selectedCountry) return null;

  return (
    <div
      ref={containerRef}
      className={`spatial-anchor ${isVisible ? 'visible' : 'hidden'}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 100,
        transition: 'opacity 0.3s ease',
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Center connector dot */}
      <div style={{
        width: '8px',
        height: '8px',
        background: '#00d4ff',
        borderRadius: '50%',
        boxShadow: '0 0 10px #00d4ff',
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
      }}></div>

      {/* Main Country Card (Top Left) */}
      <div className="spatial-panel spatial-main">
        <div className="spatial-header">
          <span style={{ fontSize: '1.5rem' }}>{selectedCountry.flag}</span>
          <div>
            <div className="spatial-title">{selectedCountry.name}</div>
            <div className="spatial-subtitle">{selectedCountry.region}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
          <div>
            <div style={{ color: '#00d4ff', fontSize: '0.65rem', textTransform: 'uppercase' }}>Capital</div>
            <div>{selectedCountry.capital}</div>
          </div>
          <div>
            <div style={{ color: '#00e676', fontSize: '0.65rem', textTransform: 'uppercase' }}>Pop</div>
            <div>{formatNumber(selectedCountry.population)}</div>
          </div>
        </div>
      </div>

      {/* Stats Overview (Top Right) */}
      {!loading && !error && countryData?.stats && (
        <div className="spatial-panel spatial-stats">
          <div className="spatial-subtitle" style={{ marginBottom: '8px' }}>📊 Statistics</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {countryData.stats.gdp && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#888' }}>GDP:</span>
                <span style={{ fontWeight: 600 }}>${formatNumber(countryData.stats.gdp)}</span>
              </div>
            )}
            {countryData.stats.gdpPerCapita && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#888' }}>Per Capita:</span>
                <span style={{ fontWeight: 600 }}>${formatNumber(countryData.stats.gdpPerCapita)}</span>
              </div>
            )}
            {countryData.stats.lifeExpectancy && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#888' }}>Life Exp:</span>
                <span style={{ fontWeight: 600 }}>{countryData.stats.lifeExpectancy}y</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weather (Bottom Right) */}
      {!loading && !error && countryData?.weather && (
        <div className="spatial-panel spatial-weather">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '2rem' }}>{getWeatherEmoji(countryData.weather.condition)}</div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#00d4ff' }}>
                {countryData.weather.temp}°C
              </div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>{countryData.weather.condition}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: '0.7rem', color: '#888' }}>
              <div>💧 {countryData.weather.humidity}%</div>
              <div>💨 {countryData.weather.windSpeed}m/s</div>
            </div>
          </div>
        </div>
      )}

      {/* News (Bottom Left) */}
      {!loading && !error && countryData?.news?.length > 0 && (
        <div className="spatial-panel spatial-news">
          <div className="spatial-subtitle" style={{ marginBottom: '8px' }}>📰 Top News</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {countryData.news.slice(0, 2).map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  color: 'inherit',
                  padding: '6px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {article.title}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#00d4ff', marginTop: '4px' }}>
                  {article.source}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="spatial-panel spatial-stats" style={{ width: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="loading-sphere" style={{ width: '24px', height: '24px' }}></div>
        </div>
      )}
    </div>
  );
}
