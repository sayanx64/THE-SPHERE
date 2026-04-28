import React from 'react';
import useStore from '../modules/data/store';

export default function Tooltip() {
  const hoveredCountry = useStore((s) => s.hoveredCountry);
  const hoverPosition = useStore((s) => s.hoverPosition);

  if (!hoveredCountry) return null;

  return (
    <div
      className={`globe-tooltip ${hoveredCountry ? 'visible' : ''}`}
      style={{
        left: hoverPosition.x,
        top: hoverPosition.y,
      }}
    >
      <span className="globe-tooltip-flag">{hoveredCountry.flag}</span>
      {hoveredCountry.name}
    </div>
  );
}
