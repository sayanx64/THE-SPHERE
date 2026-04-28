import React from 'react';
import GlobeScene from './modules/globe/GlobeScene';
import DataPanel from './modules/panels/DataPanel';
import SearchBar from './components/SearchBar';
import Tooltip from './components/Tooltip';
import LoadingScreen from './components/LoadingScreen';

export default function App() {
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

      {/* Tooltip */}
      <Tooltip />

      {/* Data Panel */}
      <DataPanel />

      {/* Bottom Info Bar */}
      <div className="info-bar">
        <div className="info-bar-dot" />
        <span>Click any point on the globe to explore country data</span>
        <span>·</span>
        <span>50 countries</span>
      </div>
    </div>
  );
}
