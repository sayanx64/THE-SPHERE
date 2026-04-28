import React from 'react';
import useStore from '../data/store';

function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num?.toLocaleString() || '—';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return 'Just now';
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

function SkeletonLoader() {
  return (
    <div style={{ padding: 'var(--space-xl)' }}>
      <div className="skeleton skeleton-block" style={{ height: '60px', marginBottom: '16px' }} />
      <div className="skeleton skeleton-text medium" />
      <div className="skeleton skeleton-text short" />
      <div className="skeleton skeleton-block" style={{ height: '100px', marginTop: '16px' }} />
      <div className="skeleton skeleton-block" style={{ height: '80px' }} />
      <div className="skeleton skeleton-block" style={{ height: '80px' }} />
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className="panel-section" style={{ textAlign: 'center', paddingTop: 'var(--space-3xl)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>⚠️</div>
      <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
        Failed to load data
      </div>
      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
        {error}
      </div>
      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-md)' }}>
        Make sure the backend server is running on port 3001
      </div>
    </div>
  );
}

function CountryHeader({ country }) {
  return (
    <div className="country-header">
      <div className="country-title-row">
        <div className="country-flag-badge">{country.flag}</div>
        <h2 className="country-name">{country.name}</h2>
      </div>
      <div className="country-meta">
        <span className="country-meta-item">
          <span className="country-meta-icon">📍</span>
          {country.capital}
        </span>
        <span className="country-meta-item">
          <span className="country-meta-icon">🌏</span>
          {country.region}
        </span>
        <span className="country-meta-item" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--color-accent-secondary)' }}>
          {country.code}
        </span>
      </div>
    </div>
  );
}

function WeatherCard({ weather }) {
  if (!weather) return null;
  return (
    <div className="panel-section">
      <div className="section-title">☁️ Weather</div>
      <div className="weather-card">
        <div className="weather-icon">{getWeatherEmoji(weather.condition)}</div>
        <div>
          <div className="weather-temp">{weather.temp}°C</div>
          <div className="weather-condition">{weather.condition || 'Unknown'}</div>
        </div>
        <div className="weather-details">
          <div className="weather-detail-item">
            💧 <span className="weather-detail-value">{weather.humidity || '—'}%</span>
          </div>
          <div className="weather-detail-item">
            💨 <span className="weather-detail-value">{weather.windSpeed || '—'} m/s</span>
          </div>
          <div className="weather-detail-item">
            👁️ <span className="weather-detail-value">{weather.feelsLike || '—'}°C feels</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsOverview({ stats, country }) {
  if (!stats && !country) return null;
  return (
    <div className="panel-section">
      <div className="section-title">📊 Statistics</div>
      <div className="stats-grid">
        {country?.population && (
          <div className="stat-card">
            <div className="stat-label">Population</div>
            <div className="stat-value">{formatNumber(country.population)}</div>
          </div>
        )}
        {stats?.gdp && (
          <div className="stat-card">
            <div className="stat-label">GDP</div>
            <div className="stat-value">${formatNumber(stats.gdp)}</div>
          </div>
        )}
        {stats?.gdpPerCapita && (
          <div className="stat-card">
            <div className="stat-label">GDP / Capita</div>
            <div className="stat-value">${formatNumber(stats.gdpPerCapita)}</div>
          </div>
        )}
        {stats?.lifeExpectancy && (
          <div className="stat-card">
            <div className="stat-label">Life Expectancy</div>
            <div className="stat-value">
              {stats.lifeExpectancy}
              <span className="stat-unit">yrs</span>
            </div>
          </div>
        )}
        {stats?.area && (
          <div className="stat-card">
            <div className="stat-label">Area</div>
            <div className="stat-value">
              {formatNumber(stats.area)}
              <span className="stat-unit">km²</span>
            </div>
          </div>
        )}
        {stats?.gini && (
          <div className="stat-card">
            <div className="stat-label">Gini Index</div>
            <div className="stat-value">{stats.gini}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function NewsFeed({ news }) {
  if (!news || news.length === 0) return null;
  return (
    <div className="panel-section">
      <div className="section-title">📰 Latest News</div>
      <div className="news-feed">
        {news.map((article, i) => (
          <a
            key={i}
            className="news-card"
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="news-card-title">{article.title}</div>
            <div className="news-card-meta">
              <span className="news-card-source">{article.source}</span>
              <span className="news-card-date">{formatDate(article.publishedAt)}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function DataPanel() {
  const panelOpen = useStore((s) => s.panelOpen);
  const selectedCountry = useStore((s) => s.selectedCountry);
  const countryData = useStore((s) => s.countryData);
  const loading = useStore((s) => s.loading);
  const error = useStore((s) => s.error);
  const clearSelection = useStore((s) => s.clearSelection);

  return (
    <div className={`data-panel ${panelOpen ? 'open' : ''}`} id="data-panel">
      <button className="panel-close-btn" onClick={clearSelection} aria-label="Close panel">
        ✕
      </button>

      {selectedCountry && <CountryHeader country={selectedCountry} />}

      {loading && <SkeletonLoader />}
      {error && <ErrorState error={error} />}

      {countryData && !loading && !error && (
        <>
          <WeatherCard weather={countryData.weather} />
          <StatsOverview stats={countryData.stats} country={countryData.country} />
          <NewsFeed news={countryData.news} />
        </>
      )}
    </div>
  );
}
