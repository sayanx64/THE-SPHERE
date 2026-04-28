import React, { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [hidden, setHidden] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFading(true), 2000);
    const hideTimer = setTimeout(() => setHidden(true), 2600);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (hidden) return null;

  return (
    <div className={`loading-screen ${fading ? 'hidden' : ''}`}>
      <div className="loading-sphere" />
      <div className="loading-text">THE SPHERE</div>
      <div className="loading-subtext">Loading global intelligence...</div>
    </div>
  );
}
