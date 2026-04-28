import React from 'react';
import GlobeScene from './modules/globe/GlobeScene';
import DataPanel from './modules/panels/DataPanel';
import ShipPanel from './modules/panels/ShipPanel';
import SearchBar from './components/SearchBar';
import Tooltip from './components/Tooltip';
import LoadingScreen from './components/LoadingScreen';
import useStore from './modules/data/store';
import useShipStore from './modules/data/shipStore';

export default function App() {
  const shipLayerVisible = useShipStore((s) => s.shipLayerVisible);
  const toggleShipLayer = useShipStore((s) => s.toggleShipLayer);
  const shipCount = useShipStore((s) => s.shipCount);
  const connected = useShipStore((s) => s.connected);
  const shipPanelOpen = useShipStore((s) => s.shipPanelOpen);
  const selectedCountry = useStore((s) => s.selectedCountry);
  const panelOpen = shipPanelOpen || !!selectedCountry;

  return (
    <div className="app-container">
      {/* Loading Screen */}
      <LoadingScreen />

      {/* Header */}
      <header className={`header ${panelOpen ? 'panel-is-open' : ''}`}>
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

      {/* Data Panel (country) */}
      <DataPanel />

      {/* Ship Panel */}
      <ShipPanel />

      {/* Bottom Info Bar */}
      <div className="info-bar">
        <div className="info-bar-dot" />
        <span>Click any point on the globe to explore</span>
        <span>·</span>
        <span>50 countries</span>
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
