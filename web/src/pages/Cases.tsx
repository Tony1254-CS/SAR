import { Image, Mountain, Flame, Leaf, Radio, Microscope } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchReaches, DataLoadError } from '../data/load';
import type { ReachListItem } from '../data/types';
import { Navbar } from '../components/Navbar';
import '../styles/globe.css';
import { InteractiveGlobe } from '../components/InteractiveGlobe';

/* ── Location metadata for the world map ── */
const LOCATION_META: Record<string, {
  icon: React.ReactNode;
  changeType: string;
  changeClass: string;
  region: string;
  description: string;
  mapX: number; // % from left on equirectangular projection
  mapY: number; // % from top
}> = {
  'jamuna-chilmari': {
    icon: <Image size={18} />,
    changeType: 'River Erosion',
    changeClass: 'erosion',
    region: 'South Asia',
    description: 'Monsoon-driven bank migration on the Jamuna — detected through clouds using L-band SAR.',
    mapX: 74.9, mapY: 28.5,
  },
  'glacier-bay-alaska': {
    icon: <Mountain size={18} />,
    changeType: 'Glacier Retreat',
    changeClass: 'glacier',
    region: 'North America',
    description: 'Glacier terminus retreat measured by radar coherence loss at the calving front.',
    mapX: 12.2, mapY: 17.0,
  },
  'norcal-wildfire': {
    icon: <Flame size={18} />,
    changeType: 'Wildfire Burn Scar',
    changeClass: 'wildfire',
    region: 'North America',
    description: 'Forest canopy destruction mapped via SAR backscatter decrease in burned areas.',
    mapX: 16.2, mapY: 27.8,
  },
  'sundarbans-mangrove': {
    icon: <Leaf size={18} />,
    changeType: 'Wetland Loss',
    changeClass: 'wetland',
    region: 'South Asia',
    description: 'Mangrove degradation along the Passur River estuary tracked through tidal-adjusted SAR.',
    mapX: 74.7, mapY: 32.0,
  },
};

const VERDICT_COLOR: Record<string, string> = {
  SUPPORTED: '#7FBF8E',
  LIMITED: '#E0B34A',
  INCONCLUSIVE: '#E4572E',
};

const VERDICT_ICON: Record<string, string> = {
  SUPPORTED: '✓',
  LIMITED: '~',
  INCONCLUSIVE: '?',
};

export function CasesPage() {
  const [reaches, setReaches] = useState<ReachListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReaches()
      .then(setReaches)
      .catch((e) => setError(e instanceof DataLoadError ? e.message : 'failed to load'));
  }, []);

  const activeReaches = reaches?.filter(r => r.reach_id !== 'dummy') ?? [];

  return (
    <div className="page-container">
      <Navbar />
      <div className="navbar-spacer" />

      {/* ════ Hero ════ */}
      <section className="globe-hero">
        <div className="globe-hero__badge">
          <span className="globe-hero__badge-dot" />
          GLOBAL SURFACE CHANGE MONITORING · NISAR L-BAND SAR
        </div>
        <h1>
          <span>Monitoring Earth's Surface</span><br />
          Across the Globe
        </h1>
        <p className="globe-hero__subtitle">
          Four active investigations spanning three continents — tracking river erosion,
          glacier retreat, wildfire burn scars, and mangrove loss using NASA's NISAR radar
          that sees through clouds, darkness, and weather.
        </p>

        {/* Stats */}
        <div className="globe-stats">
          <div className="globe-stat">
            <div className="globe-stat__value">{activeReaches.length || 4}</div>
            <div className="globe-stat__label">Active Sites</div>
          </div>
          <div className="globe-stat">
            <div className="globe-stat__value">4</div>
            <div className="globe-stat__label">Change Types</div>
          </div>
          <div className="globe-stat">
            <div className="globe-stat__value">3</div>
            <div className="globe-stat__label">Continents</div>
          </div>
          <div className="globe-stat">
            <div className="globe-stat__value">12</div>
            <div className="globe-stat__label">Pipeline Steps</div>
          </div>
        </div>
      </section>

      {/* ════ 3D Globe ════ */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '3rem auto 3rem auto', 
        padding: '0 var(--s5)',
        position: 'relative'
      }}>
        <div style={{
          background: 'rgba(var(--panel-rgb), 0.4)',
          borderRadius: 'var(--r-lg)',
          border: '1px solid rgba(var(--water-rgb), 0.1)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <InteractiveGlobe 
            points={activeReaches.map(r => {
              const meta = LOCATION_META[r.reach_id];
              if (!meta) return null;
              // Convert mapX (0-100 % of equirectangular) to lng (-180 to 180)
              const lng = (meta.mapX / 100) * 360 - 180;
              // Convert mapY (0-100 % from top) to lat (90 to -90)
              const lat = 90 - (meta.mapY / 100) * 180;
              return {
                lat,
                lng,
                label: `<div class="globe-tip"><strong>${r.name}</strong><br/>${meta.changeType} · ${meta.region}<br/>Verdict: <span style="color:${VERDICT_COLOR[r.verdict] ?? '#6F7880'}">${r.verdict}</span></div>`,
                color: VERDICT_COLOR[r.verdict] ?? '#6F7880',
                size: 1.5,
              };
            }).filter(Boolean) as any}
          />

          {/* Legend: dot colour = verdict */}
          <div className="globe-legend">
            <div className="globe-legend__title">Dot colour</div>
            {Object.entries(VERDICT_COLOR).map(([verdict, c]) => (
              <div key={verdict} className="globe-legend__row">
                <span className="globe-legend__dot" style={{ background: c, color: c }} />
                <span className="globe-legend__name">{verdict[0] + verdict.slice(1).toLowerCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════ Error State ════ */}
      {error && (
        <div className="page-content" style={{ textAlign: 'center' }}>
          <div className="card" style={{ borderColor: 'var(--fail)', color: 'var(--fail)' }}>
            Couldn&apos;t load investigations: {error}
          </div>
        </div>
      )}

      {/* ════ Loading State ════ */}
      {!reaches && !error && (
        <div className="page-content" style={{ textAlign: 'center', color: 'var(--text-3)' }}>
          <span className="mono">Loading global investigations…</span>
        </div>
      )}

      {/* ════ Case Study Cards ════ */}
            {/* Inline styles for 3D Flip and 2x2 Grid */}
      <style>{`
        .cases-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--s5);
        }
        @media (min-width: 768px) {
          .cases-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        .flip-card-container {
          background-color: transparent;
          width: 100%;
          height: 310px;
          perspective: 1500px;
          cursor: pointer;
        }
        
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: left;
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          transform-style: preserve-3d;
        }
        
        .flip-card-container:hover .flip-card-inner {
          transform: rotateY(180deg);
        }
        
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: var(--r-lg);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--line);
        }
        
        .flip-card-front {
          background: rgba(var(--panel-rgb), 0.7);
          backdrop-filter: blur(16px);
          z-index: 2;
          box-shadow: 0 4px 16px rgba(var(--shadow-rgb), 0.2);
        }
        
        .flip-card-back {
          background: rgba(var(--panel-rgb), 0.95);
          backdrop-filter: blur(24px);
          transform: rotateY(180deg);
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .flip-card-container:hover .flip-card-front {
           box-shadow: 0 12px 40px rgba(var(--shadow-rgb), 0.5);
        }
        
        .case-front-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .case-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }
        
        .case-subtitle {
          font-size: 1.1rem;
          color: var(--text-2);
          margin-bottom: auto;
        }
        
        .front-verdict {
          font-size: 1rem;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 100px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          align-self: flex-start;
          border: 1px solid;
          margin-top: 1rem;
        }
        
        .back-desc {
          font-size: 0.95rem;
          line-height: 1.4;
          color: var(--text);
        }
        
        .back-meta-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-3);
          font-size: 0.95rem;
          font-family: var(--font-num);
        }
        
        .open-btn {
          margin-top: auto;
          background: rgba(var(--fg-rgb), 0.05);
          color: var(--text);
          padding: 12px 24px;
          border-radius: 100px;
          text-align: center;
          font-weight: 600;
          transition: all 0.3s;
          border: 1px solid rgba(var(--fg-rgb), 0.1);
          text-decoration: none;
        }
        
        .open-btn:hover {
          background: rgba(var(--fg-rgb), 0.15);
          transform: translateY(-2px);
        }
      `}</style>

      <div className="cases-grid">
        {activeReaches.map((r, i) => {
          const meta = LOCATION_META[r.reach_id];
          const color = VERDICT_COLOR[r.verdict] ?? '#6F7880';
          const icon = VERDICT_ICON[r.verdict] ?? '·';

          return (
            <div 
              key={r.reach_id} 
              className="flip-card-container"
              style={{ animationDelay: `${0.1 * i}s`, animation: `fade-in-up 0.5s var(--ease-out) ${0.1 * i}s both` }}
            >
              <div className="flip-card-inner">
                
                {/* ── Front of Card ── */}
                <div className="flip-card-front" style={{ borderTop: `3px solid ${color}` }}>
                  {/* Subtle Background Watermark */}
                  <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05, transform: 'scale(8)', pointerEvents: 'none' }}>
                    {meta?.icon}
                  </div>
                  <div className="case-card__type" style={{ marginBottom: '1.5rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    <span style={{ color: color }}>{meta?.icon ?? <Radio size={18} />}</span>
                    {meta?.changeType ?? 'Surface Change'} · {meta?.region ?? 'Global'}
                  </div>
                  
                  <div className="case-front-content">
                    <div className="case-title">{r.name}</div>
                    <div className="case-subtitle">{r.river}</div>
                    
                    <div className="front-verdict" style={{ color: color, borderColor: `${color}40`, backgroundColor: `${color}10` }}>
                      {icon} {r.verdict}
                    </div>
                  </div>
                </div>

                {/* ── Back of Card ── */}
                <div className="flip-card-back" style={{ border: `1px solid ${color}50`, boxShadow: `inset 0 0 60px ${color}10` }}>
                  <div className="back-desc">
                    {meta?.description ?? 'No description available for this case.'}
                  </div>
                  
                  <hr style={{ border: 'none', borderTop: '1px solid rgba(var(--fg-rgb), 0.08)', margin: '1rem 0' }} />
                  
                  <div className="back-meta-item">
                    <Radio size={18} color={color} /> NISAR L-band SAR Analysis
                  </div>
                  <div className="back-meta-item">
                    <span style={{fontSize: '18px', filter:`drop-shadow(0 0 4px ${color})`}}>📍</span> 
                    BBox: {r.bbox.map(n => n.toFixed(2)).join(', ')}
                  </div>
                  <div className="back-meta-item">
                    <span style={{fontSize: '18px', filter:`drop-shadow(0 0 4px ${color})`}}>🕐</span> 
                    Data Date: {r.data_frozen_at.split('T')[0]}
                  </div>
                  
                  <a href={`/app?reach=${r.reach_id}`} className="open-btn" style={{ borderColor: `${color}50`, color: 'var(--text)', backgroundColor: `${color}20` }}>
                    Open Investigation →
                  </a>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* ════ Info Footer ════ */}
      <div className="cases-footer">
        <div className="cases-footer__info">
          <span className="cases-footer__icon"><Microscope size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', margin: '0 4px' }} /></span>
          <div>
            <strong style={{ color: 'var(--text)' }}>How verdicts work:</strong> Each site runs through our 12-step
            analysis pipeline. The system actively tries to break its own findings — if any quality check fails
            (threshold sensitivity, plausibility, insufficient acquisitions), the verdict reflects it honestly:{' '}
            <span style={{ color: 'var(--pass)', fontWeight: 600 }}>SUPPORTED</span>,{' '}
            <span style={{ color: 'var(--warn)', fontWeight: 600 }}>LIMITED</span>, or{' '}
            <span style={{ color: 'var(--fail)', fontWeight: 600 }}>INCONCLUSIVE</span>.
            <em> Our system was designed to be honest, not impressive.</em>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="landing-footer" style={{ marginTop: 'var(--s4)' }}>
        FluviSAR · NASA Space Apps Challenge 2026 · Dancing with the SARs ·{' '}
        <a href="/methods">Full Methods</a> ·{' '}
        <a href="https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar" target="_blank" rel="noopener noreferrer">
          NASA SAR Reference
        </a>
      </footer>
    </div>
  );
}
