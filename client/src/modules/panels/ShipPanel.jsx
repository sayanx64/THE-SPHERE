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

function getShipColor(category) {
  switch (category) {
    case 'Cargo': return '#ff1744';
    case 'Tanker': return '#ff9100';
    case 'Passenger': return '#00e676';
    case 'Fishing': return '#ffea00';
    case 'High-Speed': return '#d500f9';
    case 'Special': return '#00b0ff';
    default: return '#00e5ff';
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

function StatItem({ label, value, accent }) {
  return (
    <div className="ship-modal-stat">
      <div className="ship-modal-stat-label">{label}</div>
      <div className="ship-modal-stat-value" style={accent ? { color: accent } : undefined}>{value}</div>
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

  if (!shipPanelOpen || !selectedShip) return null;

  const ship = selectedShip;
  const color = getShipColor(ship.shipCategory);

  return (
    <div className="ship-modal-backdrop" onClick={clearShipSelection}>
      <div className="ship-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button className="ship-modal-close" onClick={clearShipSelection}>✕</button>

        {/* Header */}
        <div className="ship-modal-header">
          <div className="ship-modal-icon" style={{ color }}>
            {getShipEmoji(ship.shipCategory)}
          </div>
          <div className="ship-modal-title-wrap">
            <h2 className="ship-modal-name">{ship.name || 'Unknown Vessel'}</h2>
            <div className="ship-modal-meta">
              <span className="ship-modal-tag" style={{ borderColor: color, color }}>{ship.shipCategory || 'Vessel'}</span>
              <span className="ship-modal-mmsi">MMSI {ship.mmsi}</span>
            </div>
          </div>
        </div>

        {/* Body — 2-column grid */}
        <div className="ship-modal-body">

          {/* Navigation */}
          <div className="ship-modal-section">
            <div className="ship-modal-section-title">🧭 Navigation</div>
            <div className="ship-modal-stats-row">
              <StatItem label="Speed" value={formatSpeed(ship.speed)} />
              <StatItem label="Heading" value={formatHeading(ship.heading)} />
              <StatItem label="Course" value={formatHeading(ship.cog)} />
              <StatItem label="Status" value={ship.navStatus || '—'} />
            </div>
          </div>

          {/* Position */}
          <div className="ship-modal-section">
            <div className="ship-modal-section-title">📍 Position</div>
            <div className="ship-modal-stats-row">
              <StatItem label="Latitude" value={`${ship.lat?.toFixed(4)}°`} />
              <StatItem label="Longitude" value={`${ship.lng?.toFixed(4)}°`} />
            </div>
          </div>

          {/* Voyage */}
          {(ship.destination || extendedDetails?.next_port || extendedDetails?.last_port) && (
            <div className="ship-modal-section ship-modal-section--wide">
              <div className="ship-modal-section-title">🗺️ Voyage</div>
              <div className="ship-modal-stats-row">
                {(extendedDetails?.next_port || ship.destination) && (
                  <StatItem
                    label="Destination"
                    value={`${extendedDetails?.next_port || ship.destination}${extendedDetails?.next_port_country ? ` (${extendedDetails.next_port_country})` : ''}`}
                    accent="#00e5ff"
                  />
                )}
                {extendedDetails?.last_port && (
                  <StatItem label="Last Port" value={`${extendedDetails.last_port}${extendedDetails.last_port_country ? ` (${extendedDetails.last_port_country})` : ''}`} />
                )}
                {ship.callSign && <StatItem label="Call Sign" value={ship.callSign} />}
                {ship.imo && <StatItem label="IMO" value={ship.imo} />}
              </div>
            </div>
          )}

          {/* Marine Weather */}
          {extendedDetails?.temperature != null && (
            <div className="ship-modal-section">
              <div className="ship-modal-section-title">🌤️ Marine Weather</div>
              <div className="ship-modal-stats-row">
                <StatItem label="Temp" value={`${extendedDetails.temperature}°C`} accent="#00d4ff" />
                <StatItem label="Wind" value={`${extendedDetails.wind_knots}kn ${extendedDetails.wind_direction}`} />
                <StatItem label="Pressure" value={`${extendedDetails.pressure} hPa`} />
                <StatItem label="Humidity" value={`${extendedDetails.humidity}%`} />
              </div>
            </div>
          )}

          {/* Specs */}
          {extendedDetails && (extendedDetails.built || extendedDetails.gt || extendedDetails.dwt) && (
            <div className="ship-modal-section">
              <div className="ship-modal-section-title">🏗️ Specifications</div>
              <div className="ship-modal-stats-row">
                {extendedDetails.built && <StatItem label="Built" value={extendedDetails.built} />}
                {extendedDetails.gt && <StatItem label="Gross Tonnage" value={extendedDetails.gt.toLocaleString()} />}
                {extendedDetails.dwt && <StatItem label="Deadweight" value={`${extendedDetails.dwt.toLocaleString()}t`} />}
                {extendedDetails.draught && <StatItem label="Draught" value={`${extendedDetails.draught}m`} />}
              </div>
            </div>
          )}

          {/* Track */}
          <div className="ship-modal-section">
            <div className="ship-modal-section-title">🛤️ Route History</div>
            <div className="ship-modal-stats-row">
              {trackLoading ? (
                <StatItem label="Status" value="Loading..." accent="#00d4ff" />
              ) : trackData.length > 0 ? (
                <>
                  <StatItem label="Track Points" value={trackData.length} />
                  <StatItem label="Trail" value="✓ Visible" accent="#00e5ff" />
                </>
              ) : (
                <StatItem label="Status" value="No track data" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
