import React, { useEffect } from 'react';
import GlobeScene from './modules/globe/GlobeScene';
import ShipPanel from './modules/panels/ShipPanel';
import SearchBar from './components/SearchBar';
import Tooltip from './components/Tooltip';
import LoadingScreen from './components/LoadingScreen';
import useStore from './modules/data/store';
import useShipStore from './modules/data/shipStore';

export default function App() {
  const loadCountries = useStore((s) => s.loadCountries);
  const shipLayerVisible = useShipStore((s) => s.shipLayerVisible);
  const toggleShipLayer = useShipStore((s) => s.toggleShipLayer);
  const shipCount = useShipStore((s) => s.shipCount);
  const connected = useShipStore((s) => s.connected);
  const shipPanelOpen = useShipStore((s) => s.shipPanelOpen);
  const selectedCountry = useStore((s) => s.selectedCountry);
  const countries = useStore((s) => s.countries);
  const panelOpen = shipPanelOpen || !!selectedCountry;

  // Load all countries from REST Countries API on mount
  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  return (
    <div className="app-container">
      {/* Loading Screen */}
      <LoadingScreen />

      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">🌐</div>
          <span className="logo-text">THE SPHERE</span>
          <span className="logo-sub">Global Intelligence</span>
        </div>
        <SearchBar />
      </header>

      {/* 3D Globe */}
      <div className="globe-container">
        <GlobeScene />
      </div>

      {/* Ship Layer Toggle */}
      <button
        className={`ship-toggle ${shipLayerVisible ? 'active' : ''}`}
        onClick={toggleShipLayer}
        title={shipLayerVisible ? 'Hide ships' : 'Show ships'}
      >
        <span className="ship-toggle-icon">🚢</span>
        <span className="ship-toggle-label">
          {shipLayerVisible ? 'Ships ON' : 'Ships OFF'}
        </span>
        {connected && shipCount > 0 && (
          <span className="ship-toggle-count">{shipCount}</span>
        )}
      </button>

      {/* Tooltip */}
      <Tooltip />

      {/* Ship Panel */}
      <ShipPanel />

      {/* Bottom Info Bar */}
      <div className="info-bar">
        <div className="info-bar-dot" />
        <span>Click any point on the globe to explore</span>
        <span>·</span>
        <span>{countries.length} countries</span>
        {connected && (
          <>
            <span>·</span>
            <span>🚢 {shipCount} vessels live</span>
          </>
        )}
      </div>
    </div>
  );
}
