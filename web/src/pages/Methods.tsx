import { Settings, Satellite, Brain, CheckCircle2, Wrench, AlertTriangle } from 'lucide-react';
import { useEffect, useState, ReactNode } from 'react';
import { useStore } from '../state/store';
import { fetchQC } from '../data/load';
import type { QC } from '../data/types';
import { Navbar } from '../components/Navbar';

const SOURCES: { name: string; role: string; doi: string; provider: string }[] = [
  { name: 'NISAR L2 GCOV PROVISIONAL V1', role: 'Primary measurement — calibrated γ⁰ radar backscatter per pass', doi: '10.5067/NIL2GCOV-P1', provider: 'NASA/JPL NISAR, via ASF DAAC' },
  { name: 'OPERA L3 DSWx-S1 V1', role: 'Independent validation — Sentinel-1 water extent, different sensor and wavelength', doi: '10.5067/OPDSWS1-L3V1', provider: 'NASA JPL OPERA, via PO.DAAC' },
  { name: 'ASF GLO-30 HAND', role: 'Terrain mask — excludes water classifications on high ground', doi: 'CC0, no DOI', provider: 'Alaska Satellite Facility' },
  { name: 'JRC Global Surface Water — occurrence', role: 'Reference — defines stable-land zone for the null test', doi: 'n/a', provider: 'EC Joint Research Centre' },
  { name: 'FFWC river stage', role: 'Scientific control — river height at each acquisition', doi: 'n/a', provider: 'Flood Forecasting and Warning Centre, BWDB' },
];

const PIPELINE_STEPS = [
  { label: 'DISCOVER', desc: 'Find candidate NISAR GCOV granules for the reach/time window' },
  { label: 'FETCH', desc: 'Stream and AOI-clip only the layers needed (HHHH, mask, geometry)' },
  { label: 'VALIDATE RAW', desc: 'Reject broken, partial, or wrong-geometry granules' },
  { label: 'PREPROCESS', desc: 'Nodata mask → dB conversion → light speckle filter' },
  { label: 'WATER', desc: 'Tile-based Otsu thresholding with bimodality check, per date' },
  { label: 'STAGE', desc: 'Interpolate gauge height to each acquisition time (or proxy fallback)' },
  { label: 'PAIRS', desc: 'Select an equal-stage (or later-lower) before/after pair' },
  { label: 'CHANGE', desc: 'Classify erosion / accretion / seasonal / ambiguous, with persistence' },
  { label: 'VALIDATE SCIENCE', desc: 'Cross-sensor agreement, null test, sensitivity, alignment' },
  { label: 'RENDER', desc: 'Reproject rasters to EPSG:3857 PNGs for the map' },
  { label: 'MANIFEST', desc: 'Attach provenance (granule IDs, params) to every displayed number' },
  { label: 'CHECK BUNDLE', desc: 'Refuse to ship a bundle that fails schema or consistency checks' },
];

function MainBox({ title, description, icon, color, onClick, delay }: { title: string, description: string, icon: ReactNode, color: string, onClick: () => void, delay: number }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? `linear-gradient(135deg, rgba(var(--panel-rgb), 0.8) 0%, rgba(var(--panel-rgb), 0.9) 100%)` : 'rgba(var(--panel-rgb), 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: isHovered ? color : 'rgba(var(--fg-rgb), 0.08)',
        borderRadius: '20px',
        padding: '1.25rem',
        cursor: 'pointer',
        boxShadow: isHovered ? `0 12px 40px ${color}30, inset 0 0 20px ${color}10` : '0 8px 32px rgba(var(--shadow-rgb), 0.4)',
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        height: '100%',
        animation: `fadeSlideUp 0.6s var(--ease-out) ${delay}s forwards`,
        opacity: 0,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle background glow blob on hover */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '150px',
        height: '150px',
        background: color,
        filter: 'blur(80px)',
        opacity: isHovered ? 0.3 : 0,
        transition: 'opacity 0.6s ease',
        pointerEvents: 'none'
      }} />

      <div style={{ 
        fontSize: '28px', 
        marginBottom: '0.5rem', 
        color: isHovered ? color : 'var(--text-3)',
        filter: isHovered ? `drop-shadow(0 0 15px ${color}80)` : 'none',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'scale(1.15) rotate(-5deg)' : 'scale(1) rotate(0deg)',
        transformOrigin: 'left center',
        zIndex: 1
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', margin: 0, transition: 'color 0.3s ease', zIndex: 1 }}>{title}</h3>
      <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0, flex: 1, fontWeight: 400, zIndex: 1 }}>{description}</p>
      
      {/* Map Layers styled button */}
      <div style={{
        marginTop: '1.5rem',
        alignSelf: 'flex-start',
        padding: '6px 14px',
        background: isHovered ? `${color}15` : 'rgba(var(--fg-rgb), 0.03)',
        border: '1px solid',
        borderColor: isHovered ? color : 'rgba(var(--fg-rgb), 0.1)',
        color: isHovered ? color : 'var(--text-2)',
        fontSize: '0.9rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        borderRadius: '100px',
        boxShadow: isHovered ? `0 0 15px ${color}20` : 'none',
        zIndex: 1
      }}>
        View Details 
        <span style={{ 
          transform: isHovered ? 'translateX(6px)' : 'none', 
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: isHovered ? 1 : 0.6
        }}>→</span>
      </div>
    </div>
  );
}

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: ReactNode }) {
  if (!isOpen) return null;
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(var(--shadow-rgb), 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.3s ease-out forwards'
      }} 
      onClick={onClose}
    >
      <div 
        style={{
          background: 'transparent',
          backgroundColor: 'rgba(var(--panel-rgb), 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          padding: 'var(--s8)',
          borderRadius: 'var(--r-lg)',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '85vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 24px 64px rgba(var(--shadow-rgb), 0.6), 0 0 0 1px rgba(var(--fg-rgb), 0.05) inset',
          border: '1px solid var(--line-strong)',
          animation: 'slideUpModal 0.4s var(--ease-out) forwards'
        }} 
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', top: 'var(--s5)', right: 'var(--s5)', 
            background: 'var(--panel)', border: '1px solid var(--line-strong)', 
            width: '32px', height: '32px', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '16px', cursor: 'pointer', color: 'var(--text-2)', 
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(var(--shadow-rgb), 0.2)'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--line-strong)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--panel)'; e.currentTarget.style.color = 'var(--text-2)'; }}
        >
          ✕
        </button>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--s6)', color: 'var(--text)', borderBottom: '1px solid var(--line-strong)', paddingBottom: 'var(--s4)' }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function MethodsPage() {
  const { manifest, reach } = useStore();
  const [qc, setQc] = useState<QC | null>(null);
  const [activeBox, setActiveBox] = useState<string | null>(null);

  useEffect(() => {
    if (reach?.reach_id) {
      fetchQC(`/data/v1/${reach.reach_id}`).then(setQc).catch(() => setQc(null));
    }
  }, [reach?.reach_id]);

  useEffect(() => {
    if (activeBox) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [activeBox]);

  return (
    <div className="page-container" style={{ position: 'relative', overflow: 'hidden' }}>
      
            {/* Inline styles for animations */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .methods-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
          margin-top: 1.5rem;
        }
        @media (min-width: 768px) {
          .methods-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .bg-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--water-dim) 0%, transparent 70%);
          top: -200px;
          right: -200px;
          opacity: 0.5;
          pointer-events: none;
          z-index: 0;
          animation: fadeIn 2s ease-out forwards;
        }
      `}</style>

      <div className="bg-glow" />
      <Navbar />
      <div className="navbar-spacer" />

      <div className="page-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--s6) var(--s4)', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 'var(--s6)', textAlign: 'center', animation: 'fadeSlideUp 0.6s var(--ease-out) forwards' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 'var(--s4)', color: 'var(--text)' }}>
            Methods & Architecture
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 'var(--text-lg)', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto' }}>
            FLUVISAR compares NISAR L-band radar of the Jamuna at the same river height before and after
            the monsoon peak, so that what changed is land the river took — not a temporary flood.
          </p>
        </div>

        {/* The Main Boxes Grid */}
        <div className="methods-grid">
          
          <MainBox 
            title="Processing Pipeline" 
            description="The 12-step automated sequence to process raw NISAR data into clean, validated morphology metrics." 
            icon=<Settings size={18} />
            color="var(--water)"
            onClick={() => setActiveBox('pipeline')} 
            delay={0.1}
          />

          <MainBox 
            title="Data Sources" 
            description="The primary and reference satellite datasets that power the pipeline and validation steps." 
            icon=<Satellite size={18} />
            color="var(--accretion)"
            onClick={() => setActiveBox('sources')} 
            delay={0.2}
          />

          <MainBox 
            title="Methodology" 
            description="How we confidently identify land loss while controlling for seasonal flooding variance." 
            icon=<Brain size={18} />
            color="var(--erosion)"
            onClick={() => setActiveBox('methodology')} 
            delay={0.3}
          />

          {qc && (
            <MainBox 
              title="Quality Control" 
              description="Automated cross-sensor checks performed to ensure the data is reliable before publishing." 
              icon=<CheckCircle2 size={18} />
              color="var(--pass)"
              onClick={() => setActiveBox('qc')} 
              delay={0.4}
            />
          )}

          {manifest && (
            <MainBox 
              title="Configuration" 
              description="The exact parameters used in the pipeline for this specific reach output." 
              icon=<Wrench size={18} />
              color="var(--ambiguous)"
              onClick={() => setActiveBox('config')} 
              delay={0.5}
            />
          )}

          <MainBox 
            title="Limitations" 
            description="Honesty about what this data represents and the boundaries of our confidence." 
            icon=<AlertTriangle size={18} />
            color="var(--warn)"
            onClick={() => setActiveBox('limitations')} 
            delay={0.6}
          />

        </div>
      </div>

      {/* --- Modals --- */}
      <Modal isOpen={activeBox === 'pipeline'} onClose={() => setActiveBox(null)} title="Processing Pipeline">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--s3)' }}>
          {PIPELINE_STEPS.map((step, i) => (
            <div key={i} style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-md)',
              padding: 'var(--s4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--s4)',
            }}>
              <span style={{ 
                background: 'rgba(var(--water-rgb), 0.1)', 
                color: 'var(--water)', 
                border: '1px solid rgba(var(--water-rgb), 0.2)',
                padding: '4px 10px', 
                borderRadius: '6px', 
                fontSize: 'var(--text-xs)', 
                fontWeight: 800,
                flexShrink: 0
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <div style={{ fontSize: 'var(--text-base)', color: 'var(--text)', fontWeight: 600, letterSpacing: '0.02em', marginBottom: '4px' }}>{step.label}</div>
                <div style={{ color: 'var(--text-2)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={activeBox === 'sources'} onClose={() => setActiveBox(null)} title="Data Sources">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--s4)' }}>
          {SOURCES.map((s, i) => (
            <div key={i} style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-md)',
              padding: 'var(--s5)',
              borderLeft: '4px solid var(--accretion)'
            }}>
              <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--text)', fontWeight: 600, margin: '0 0 var(--s2) 0' }}>{s.name}</h3>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-2)', margin: '0 0 var(--s4) 0', lineHeight: 1.5 }}>{s.role}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)', fontWeight: 500 }}>{s.provider}</span>
                <span style={{ fontSize: 'var(--text-xs)', background: 'var(--surface-1)', border: '1px solid var(--line)', color: 'var(--text-2)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'var(--font-num)' }}>
                  {s.doi}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={activeBox === 'methodology'} onClose={() => setActiveBox(null)} title="Erosion Definition">
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-md)',
          padding: 'var(--s6)',
          fontSize: 'var(--text-lg)',
          lineHeight: 1.8,
          color: 'var(--text-2)'
        }}>
          A pixel is classified <strong style={{ color: 'var(--erosion)' }}>erosion</strong> if it was
          land at <code style={{background:'var(--surface-1)', border: '1px solid var(--line)', padding:'2px 6px', borderRadius:'4px'}}>t0</code>, 
          water at <code style={{background:'var(--surface-1)', border: '1px solid var(--line)', padding:'2px 6px', borderRadius:'4px'}}>t1</code>, 
          the river stage at <code style={{background:'var(--surface-1)', border: '1px solid var(--line)', padding:'2px 6px', borderRadius:'4px'}}>t1</code> was 
          within 0.15 m of (or lower than) <code style={{background:'var(--surface-1)', border: '1px solid var(--line)', padding:'2px 6px', borderRadius:'4px'}}>t0</code>,
          and it stays water at every later valid pass. 
          <br/><br/>
          This controls for temporary flooding by requiring the comparison to happen at matched river height, 
          and requires persistence so a single noisy pass cannot manufacture a result.
        </div>
      </Modal>

      <Modal isOpen={activeBox === 'qc'} onClose={() => setActiveBox(null)} title="Quality Control Checks">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--s3)' }}>
          {qc?.checks.map((c) => {
            const isPass = c.status === 'PASS' || c.status === 'INFO';
            const isWarn = c.status === 'WARN';
            const isFail = c.status === 'FAIL';
            const statusColor = isPass ? 'var(--pass)' : isWarn ? 'var(--warn)' : isFail ? 'var(--fail)' : 'var(--text-3)';
            const statusBg = isPass ? 'rgba(127, 191, 142, 0.1)' : isWarn ? 'rgba(224, 179, 74, 0.1)' : isFail ? 'rgba(228, 87, 46, 0.1)' : 'var(--surface-2)';

            return (
              <div key={c.id} style={{
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-md)',
                padding: 'var(--s4) var(--s5)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 'var(--text-base)' }}>{c.label ?? c.id}</span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)', fontFamily: 'var(--font-num)' }}>
                    {c.value !== undefined && c.value !== null ? `${c.value} ${c.unit ?? ''}` : 'No value'}
                  </span>
                </div>
                <span style={{ 
                  color: statusColor, 
                  background: statusBg,
                  border: `1px solid ${statusColor}40`,
                  fontWeight: 700, 
                  fontSize: 'var(--text-xs)', 
                  letterSpacing: '0.04em',
                  padding: '6px 12px',
                  borderRadius: '16px'
                }}>
                  {c.status}
                </span>
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal isOpen={activeBox === 'config'} onClose={() => setActiveBox(null)} title="Configuration Parameters">
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-md)',
          padding: 'var(--s6)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 'var(--s5)'
        }}>
          {manifest?.metrics
            .filter((m) => m.params)
            .flatMap((m) =>
              Object.entries(m.params ?? {}).map(([k, v]) => (
                <div key={`${m.id}-${k}`} style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--surface-1)', border: '1px solid var(--line)', padding: 'var(--s4)', borderRadius: 'var(--r-sm)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ambiguous)', fontFamily: 'var(--font-num)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</span>
                  <span style={{ fontSize: 'var(--text-lg)', color: 'var(--text)', fontWeight: 600, fontFamily: 'var(--font-num)' }}>{String(v)}</span>
                </div>
              ))
            )}
        </div>
      </Modal>

      <Modal isOpen={activeBox === 'limitations'} onClose={() => setActiveBox(null)} title="Limitations & Caveats">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', padding: 'var(--s6)', borderRadius: 'var(--r-md)' }}>
            <h4 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text)', margin: '0 0 var(--s4) 0' }}>What We Don&apos;t Claim</h4>
            <ul style={{ paddingLeft: 'var(--s4)', margin: 0, color: 'var(--text-2)', fontSize: 'var(--text-base)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
              <li>Causes of erosion.</li>
              <li>Number of people displaced (we may quote CEGIS figures with attribution).</li>
              <li>Absolute ground truth accuracy (we report cross-sensor agreement instead).</li>
              <li>Flood forecasting.</li>
            </ul>
          </div>
          
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', padding: 'var(--s6)', borderRadius: 'var(--r-md)' }}>
            <h4 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text)', margin: '0 0 var(--s4) 0' }}>Known Limitations</h4>
            <ul style={{ paddingLeft: 'var(--s4)', margin: 0, color: 'var(--text-2)', fontSize: 'var(--text-base)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
              <li>Otsu thresholding on SAR can be confused by wind or emergent vegetation.</li>
              <li>Stage matching relies on gauge readings within 24 hours or a visual proxy fallback.</li>
              <li>NISAR PROVISIONAL products may carry residual RFI, which we attempt to screen out.</li>
            </ul>
          </div>
        </div>
      </Modal>

    </div>
  );
}
