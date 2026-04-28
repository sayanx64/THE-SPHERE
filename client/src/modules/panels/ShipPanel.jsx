import React from 'react';
import useShipStore from '../data/shipStore';

function getShipEmoji(category) {
  switch (category) {
    case 'Cargo': return '📦';
    case 'Tanker': return '🛢️';
    case 'Passenger': return '🚢';
    case 'Fishing': return '🎣';
    case 'High-Speed': return '⚡';
    case 'Special': return '⚓';
    default: return '🚢';
  }
}

function formatSpeed(knots) {
  if (!knots && knots !== 0) return '—';
  return `${knots.toFixed(1)} kn`;
}

function formatHeading(deg) {
  if (deg == null) return '—';
  return `${Math.round(deg)}°`;
}

function ShipHeader({ ship }) {
  return (
    <div className="country-header">
      <div className="country-title-row">
        <div className="country-flag-badge" style={{ fontSize: '1.8rem' }}>
          {getShipEmoji(ship.shipCategory)}
        </div>
        <h2 className="country-name">{ship.name || 'Unknown Vessel'}</h2>
      </div>
      <div className="country-meta">
        <span className="country-meta-item">
          <span className="country-meta-icon">🏷️</span>
          {ship.shipCategory || 'Unknown'}
        </span>
        <span className="country-meta-item" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--color-accent-secondary)' }}>
          MMSI {ship.mmsi}
        </span>
      </div>
    </div>
  );
}

function NavigationCard({ ship }) {
  return (
    <div className="panel-section">
      <div className="section-title">🧭 Navigation</div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Speed</div>
          <div className="stat-value">{formatSpeed(ship.speed)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Heading</div>
          <div className="stat-value">{formatHeading(ship.heading)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Course</div>
          <div className="stat-value">{formatHeading(ship.cog)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Status</div>
          <div className="stat-value" style={{ fontSize: 'var(--font-size-sm)' }}>{ship.navStatus || '—'}</div>
        </div>
      </div>
    </div>
  );
}

function VoyageCard({ ship, details }) {
  if (!ship.destination && !ship.callSign && !ship.imo && !details) return null;
  return (
    <div className="panel-section">
      <div className="section-title">🗺️ Voyage</div>
      <div className="stats-grid">
        {(details?.next_port || ship.destination) && (
          <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
            <div className="stat-label">Destination / Next Port</div>
            <div className="stat-value" style={{ fontSize: 'var(--font-size-base)', color: '#00e5ff' }}>
              {details?.next_port || ship.destination}
              {details?.next_port_country ? ` (${details.next_port_country})` : ''}
            </div>
          </div>
        )}
        {details?.last_port && (
          <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
            <div className="stat-label">Last Port</div>
            <div className="stat-value" style={{ fontSize: 'var(--font-size-sm)' }}>
              {details.last_port} {details.last_port_country ? `(${details.last_port_country})` : ''}
            </div>
          </div>
        )}
        {ship.callSign && (
          <div className="stat-card">
            <div className="stat-label">Call Sign</div>
            <div className="stat-value">{ship.callSign}</div>
          </div>
        )}
        {ship.imo && (
          <div className="stat-card">
            <div className="stat-label">IMO</div>
            <div className="stat-value">{ship.imo}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function SpecsCard({ details }) {
  if (!details || (!details.built && !details.gt && !details.dwt)) return null;
  return (
    <div className="panel-section">
      <div className="section-title">🏗️ Specifications</div>
      <div className="stats-grid">
        {details.built && (
          <div className="stat-card">
            <div className="stat-label">Built</div>
            <div className="stat-value">{details.built}</div>
          </div>
        )}
        {details.gt && (
          <div className="stat-card">
            <div className="stat-label">Gross Tonnage</div>
            <div className="stat-value">{details.gt.toLocaleString()}</div>
          </div>
        )}
        {details.dwt && (
          <div className="stat-card">
            <div className="stat-label">Deadweight</div>
            <div className="stat-value">{details.dwt.toLocaleString()}t</div>
          </div>
        )}
        {details.draught && (
          <div className="stat-card">
            <div className="stat-label">Draught</div>
            <div className="stat-value">{details.draught}m</div>
          </div>
        )}
      </div>
    </div>
  );
}

function WeatherCard({ details }) {
  if (!details || details.temperature == null) return null;
  return (
    <div className="panel-section">
      <div className="section-title">🌤️ Local Marine Weather</div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Temp</div>
          <div className="stat-value">{details.temperature}°C</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Wind</div>
          <div className="stat-value">{details.wind_knots}kn {details.wind_direction}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pressure</div>
          <div className="stat-value" style={{ fontSize: 'var(--font-size-sm)' }}>{details.pressure} hPa</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Humidity</div>
          <div className="stat-value">{details.humidity}%</div>
        </div>
      </div>
    </div>
  );
}

function PositionCard({ ship }) {
  return (
    <div className="panel-section">
      <div className="section-title">📍 Position</div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Latitude</div>
          <div className="stat-value" style={{ fontSize: 'var(--font-size-base)' }}>{ship.lat?.toFixed(4)}°</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Longitude</div>
          <div className="stat-value" style={{ fontSize: 'var(--font-size-base)' }}>{ship.lng?.toFixed(4)}°</div>
        </div>
      </div>
    </div>
  );
}

function TrackCard({ trackData, trackLoading }) {
  return (
    <div className="panel-section">
      <div className="section-title">🛤️ Route History (7 days)</div>
      {trackLoading ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
          <div className="stat-value" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-accent-secondary)' }}>
            Loading track...
          </div>
        </div>
      ) : trackData.length > 0 ? (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Track Points</div>
            <div className="stat-value">{trackData.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Trail Visible</div>
            <div className="stat-value" style={{ color: '#00e5ff', fontSize: 'var(--font-size-sm)' }}>
              ✓ On Globe
            </div>
          </div>
        </div>
      ) : (
        <div className="stat-card" style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
          <div className="stat-value" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            No track data available
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShipPanel() {
  const shipPanelOpen = useShipStore((s) => s.shipPanelOpen);
  const selectedShip = useShipStore((s) => s.selectedShip);
  const clearShipSelection = useShipStore((s) => s.clearShipSelection);
  const trackData = useShipStore((s) => s.trackData);
  const trackLoading = useShipStore((s) => s.trackLoading);
  const extendedDetails = useShipStore((s) => s.extendedDetails);

  return (
    <div className={`data-panel ${shipPanelOpen ? 'open' : ''}`} id="ship-panel">
      <button className="panel-close-btn" onClick={clearShipSelection} aria-label="Close ship panel">
        ✕
      </button>

      {selectedShip && (
        <>
          <ShipHeader ship={selectedShip} />
          <NavigationCard ship={selectedShip} />
          <VoyageCard ship={selectedShip} details={extendedDetails} />
          <SpecsCard details={extendedDetails} />
          <WeatherCard details={extendedDetails} />
          <PositionCard ship={selectedShip} />
          <TrackCard trackData={trackData} trackLoading={trackLoading} />
        </>
      )}
    </div>
  );
}
