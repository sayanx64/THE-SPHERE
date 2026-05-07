import React, { useState, useEffect, useRef } from 'react';

export default function LoadingScreen({ onStart, appStarted }) {
  const [phase, setPhase] = useState(0); // 0=loading, 1=ready, 2=exiting
  const canvasRef = useRef(null);

  // Particle background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles = [];
    const PARTICLE_COUNT = 120;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(108, 99, 255, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(108, 99, 255, ${p.alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Phase transitions
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2200);
    return () => clearTimeout(t1);
  }, []);

  const handleStart = () => {
    setPhase(2);
    setTimeout(() => onStart(), 800);
  };

  if (appStarted) return null;

  return (
    <div className={`landing-overlay ${phase === 2 ? 'exit' : ''}`}>
      <canvas ref={canvasRef} className="landing-particles" />

      {/* Radial glow behind sphere */}
      <div className="landing-glow" />

      <div className="landing-center">
        {/* Animated sphere */}
        <div className="landing-orb-wrap">
          <div className="landing-orb" />
          <div className="landing-orb-ring" />
          <div className="landing-orb-ring landing-orb-ring--2" />
        </div>

        {/* Title */}
        <h1 className={`landing-title ${phase >= 1 ? 'show' : ''}`}>
          THE SPHERE
        </h1>

        {/* Tagline */}
        <p className={`landing-tagline ${phase >= 1 ? 'show' : ''}`}>
          Real-time global intelligence
        </p>

        {/* Stats row */}
        <div className={`landing-stats ${phase >= 1 ? 'show' : ''}`}>
          <div className="landing-stat">
            <span className="landing-stat-num">197</span>
            <span className="landing-stat-label">Countries</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-num">LIVE</span>
            <span className="landing-stat-label">Ship Tracking</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-num">24/7</span>
            <span className="landing-stat-label">Weather & News</span>
          </div>
        </div>

        {/* CTA */}
        {phase >= 1 && (
          <button className="landing-cta" onClick={handleStart}>
            <span className="landing-cta-text">ENTER THE SPHERE</span>
            <span className="landing-cta-arrow">→</span>
          </button>
        )}
      </div>

      {/* Bottom attribution */}
      <div className={`landing-footer ${phase >= 1 ? 'show' : ''}`}>
        <span>Powered by AIS · OpenWeather · NewsAPI</span>
      </div>
    </div>
  );
}
