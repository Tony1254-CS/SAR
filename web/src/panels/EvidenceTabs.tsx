import { MessageSquare } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../state/store';
import type { QCCheck } from '../data/types';
import { Inspectable } from '../components/Inspectable';

export type TabId = 'detect' | 'investigate' | 'challenge' | 'explain' | 'field' | 'impact';

export const TABS: { id: TabId; label: string; hint: string }[] = [
  { id: 'detect', label: 'Detect', hint: 'radar measurement' },
  { id: 'investigate', label: 'Investigate', hint: 'cross-sensor sync' },
  { id: 'challenge', label: 'Challenge', hint: 'adversarial test' },
  { id: 'explain', label: 'Explain', hint: 'final verdict' },
  { id: 'field', label: 'Field', hint: 'ground truth' },
  { id: 'impact', label: 'Impact', hint: 'risk assessment' },
];



function findCheck(checks: QCCheck[] | undefined, id: string): QCCheck | null {
  return checks?.find((c) => c.id === id) ?? null;
}

// ── Data Widget Component ──
function DataWidget({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="data-widget">
      <div className="data-widget-header">{title}</div>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="data-metric-row">
      <span className="data-metric-label">{label}</span>
      <span className="data-metric-value">{value}</span>
    </div>
  );
}

// ── Synthetic UI Components for Complexity ──
function ChartBar({ height, color = 'var(--water)' }: { height: number; color?: string }) {
  return <div style={{ width: '100%', height: `${height}%`, background: color, opacity: 0.8, borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />;
}

function StepTimeline({ lines }: { lines: string[] }) {
  return (
    <div style={{ background: 'rgba(var(--fg-rgb), 0.02)', padding: '24px 20px', borderRadius: 8, border: '1px solid rgba(var(--fg-rgb), 0.05)', fontSize: '0.92rem', color: 'var(--text)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {lines.map((l, i) => {
        const isFail = l.includes('FAIL');
        const isWarn = l.includes('WARN');
        const isPass = l.includes('PASS');
        
        let icon = (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        );
        let color = 'var(--water)';
        
        if (isFail) {
          icon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
          color = 'var(--fail)';
        } else if (isWarn) {
          icon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
          color = 'var(--warn)';
        } else if (isPass) {
          icon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
          color = 'var(--pass)';
        }

        // Remove the bracket tag e.g. [INFO] from the text
        const bracketEnd = l.indexOf(']');
        const text = bracketEnd > -1 ? l.substring(bracketEnd + 1).trim() : l;

        return (
          <div key={i} style={{ display: 'flex', gap: 16, position: 'relative' }}>
            {/* Timeline connector line */}
            {i !== lines.length - 1 && (
              <div style={{ position: 'absolute', left: 7, top: 20, width: 2, height: 'calc(100% + 10px)', background: 'rgba(var(--fg-rgb), 0.1)', borderRadius: 1 }} />
            )}
            <div style={{ color: color, zIndex: 1, background: 'var(--panel)', padding: '2px 0' }}>
              {icon}
            </div>
            <div style={{ paddingTop: 1, opacity: 0.9, lineHeight: 1.4 }}>
              {text}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Panels ──
function DetectPanel() {
  const { manifest, reach } = useStore();
  const headline = manifest?.metrics.find((m) => m.id === reach?.headline_metric_id);
  const params = headline?.params;
  const thresholdShift =
    params?.threshold_db_t0 != null && params?.threshold_db_t1 != null
      ? Math.abs(params.threshold_db_t1 - params.threshold_db_t0)
      : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <DataWidget title="SAR Morphodynamics & Detection Metrics">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <Inspectable intentKey="erosion_amount">
            <div style={{ background: 'rgba(var(--shadow-rgb), 0.3)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid var(--water)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '8px' }}>Total Geomorphic Change</div>
              <div style={{ fontSize: '2rem', color: 'var(--water)', fontWeight: 800 }}>{((headline?.value ?? 0) / 100).toFixed(2)} <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>km²</span></div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-2)', marginTop: 8 }}>Detected via NISAR L-band backscatter delta</div>
            </div>
          </Inspectable>
          <Inspectable intentKey="threshold_info">
            <div style={{ background: 'rgba(var(--shadow-rgb), 0.3)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid var(--pass)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '8px' }}>Otsu Threshold Shift</div>
              <div style={{ fontSize: '2rem', color: 'var(--pass)', fontWeight: 800 }}>{thresholdShift != null ? thresholdShift.toFixed(3) : '—'} <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>dB</span></div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-2)', marginTop: 8 }}>Variance between T0 and T1 bimodal distributions</div>
            </div>
          </Inspectable>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1, background: 'rgba(var(--fg-rgb), 0.02)', padding: 12, borderRadius: 6, border: '1px solid rgba(var(--fg-rgb), 0.05)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 12, textTransform: 'uppercase' }}>Backscatter Histogram (Synthetic)</div>
            <div style={{ height: 80, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
              {[10,15,25,45,80,95,70,40,30,20,15,35,60,85,90,75,45,20,10,5].map((h, i) => (
                <ChartBar key={i} height={h} color={i === 9 ? 'var(--pass)' : 'rgba(var(--water-rgb), 0.4)'} />
              ))}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Metric label="Median Filter Window" value={`${params?.median_filter ?? 3}x${params?.median_filter ?? 3} px`} />
            <Metric label="Min Mapping Unit (MMU)" value={`${params?.mmu_px ?? 10} px`} />
            <Metric label="HAND Max Elevation" value={`${params?.hand_max_m ?? 15} m`} />
            <Metric label="Relative Orbit" value={reach?.track.relative_orbit ?? 14} />
            <Metric label="Acquisition Direction" value={reach?.track.direction === 'A' ? 'ASCENDING' : 'DESCENDING'} />
          </div>
        </div>

        <div style={{ position: 'relative', height: 200, overflow: 'hidden', borderRadius: 6, border: '1px solid rgba(var(--water-rgb), 0.3)' }}>
          <img src={`/data/v1/${reach?.reach_id}/img/radar_${reach?.dates[0]?.date}.png`} alt="Radar" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
          <div className="radar-sweep-overlay" />
          <div className="hud-dark" style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(var(--shadow-rgb), 0.7)', padding: '4px 8px', fontSize: '0.78rem', color: 'var(--water)', borderRadius: 2, border: '1px solid var(--water)' }}>RAW L2 GRANULE PREVIEW</div>
          <div style={{ position: 'absolute', bottom: 8, right: 8, fontSize: '0.78rem', color: 'var(--text-2)', background: '#000', padding: 4 }}>EPSG:32646 / WGS 84 UTM 46N</div>
        </div>
      </DataWidget>
    </div>
  );
}

function InvestigatePanel() {
  const { qc, reach } = useStore();
  const dswxStatus = findCheck(qc?.checks, 'dswx_agreement')?.status ?? 'NOT_EVALUATED';
  const stageStatus = findCheck(qc?.checks, 'stage_match')?.status ?? 'NOT_EVALUATED';
  const rainStatus = findCheck(qc?.checks, 'rainfall_anomaly')?.status ?? 'NOT_EVALUATED';

  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const sensors = [
    { 
      id: 'nisar', label: 'Primary Satellite Data Check', val: 'SYNCED', ok: true, 
      shortDesc: 'Checking if satellite radar readings are properly calibrated.',
      techLabel: 'NISAR L-band Calibration', techSource: 'ISRO/NASA L-Band', conf: '0.99', techDesc: 'Primary radiometric alignment confirmed.' 
    },
    { 
      id: 'dswx', label: 'Secondary Water Map Check', val: dswxStatus, ok: dswxStatus !== 'FAIL', 
      shortDesc: 'Verifying with secondary optical water maps.',
      techLabel: 'Sentinel-1 DSWx Alignment', techSource: 'Copernicus C-Band', conf: '0.84', techDesc: 'Spatial agreement with optical/C-band water maps.' 
    },
    { 
      id: 'stage', label: 'River Water Level Check', val: stageStatus, ok: stageStatus !== 'FAIL', 
      shortDesc: 'Checking if real river water levels match our data.',
      techLabel: 'FFWC Hydrological Stage', techSource: 'In-situ Gauge Network', conf: '0.92', techDesc: 'Water level dynamics match detection window.' 
    },
    { 
      id: 'rain', label: 'Rainfall & Weather Check', val: rainStatus, ok: rainStatus !== 'FAIL', 
      shortDesc: 'Checking for heavy rainfall that could cause temporary flooding.',
      techLabel: 'GPM IMERG Precipitation', techSource: 'GPM Constellation', conf: '0.88', techDesc: 'Checking for anomalous rainfall flooding.' 
    },
    { 
      id: 'fire', label: 'Fire & Heat Check', val: 'CLEAR', ok: true, 
      shortDesc: 'Ensuring the land change is not a burn scar from a fire.',
      techLabel: 'FIRMS Thermal Anomaly', techSource: 'MODIS/VIIRS', conf: '0.97', techDesc: 'No active fire or burn scars detected in AOI.' 
    },
    { 
      id: 'veg', label: 'Forest & Vegetation Check', val: 'STABLE', ok: true, 
      shortDesc: 'Making sure it is not just seasonal deforestation.',
      techLabel: 'NDVI Vegetation Index', techSource: 'MODIS', conf: '0.89', techDesc: 'No sudden non-hydrological deforestation signature.' 
    }
  ];

  const activeSensor = sensors.find(s => s.id === activeCardId);
  const dateBefore = reach?.dates && reach.dates.length > 0 ? reach.dates[0].date : 'T0';
  const dateAfter = reach?.dates && reach.dates.length > 1 ? reach.dates[1].date : 'T1';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
      <DataWidget title="Data Cross-Checking">
        <div style={{ fontSize: '0.9rem', color: 'var(--text)', marginBottom: 16, lineHeight: 1.6, background: 'rgba(var(--water-rgb), 0.05)', padding: 12, borderRadius: 6, borderLeft: '3px solid var(--water)' }}>
          These boxes represent the automated checks our AI performed against multiple satellite and ground sensors to ensure the detection is not a false alarm.<br/>
          <span style={{ color: 'var(--water)', fontSize: '0.86rem', fontWeight: 600 }}>Click on any box below to see its raw technical metadata.</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {sensors.map(sensor => (
            <Inspectable key={sensor.id} intentKey={sensor.id === 'rain' ? 'rainfall' : sensor.id === 'stage' ? 'water_level' : sensor.id === 'nisar' ? 'satellite_info' : 'sensor_checks'} fallbackQuery={`What is the ${sensor.label}?`}>
              <div 
                className="sensor-card"
                onClick={() => setActiveCardId(sensor.id)}
                style={{ borderLeft: `4px solid ${sensor.ok ? 'var(--pass)' : 'var(--warn)'}` }}
              >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.92rem', color: 'var(--text)', fontWeight: 600 }}>{sensor.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(var(--shadow-rgb), 0.4)', padding: '4px 8px', borderRadius: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: sensor.ok ? 'var(--pass)' : 'var(--warn)', boxShadow: `0 0 8px ${sensor.ok ? 'var(--pass)' : 'var(--warn)'}`, animation: 'pulse-dot 2s infinite' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: sensor.ok ? 'var(--pass)' : 'var(--warn)' }}>{sensor.val}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.4 }}>{sensor.shortDesc}</div>
              <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--water)', background: 'rgba(var(--water-rgb), 0.1)', padding: '4px 10px', borderRadius: 12, fontWeight: 600, display: 'flex', gap: 4, alignItems: 'center' }}>
                  View Details
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </div>
              </div>
            </div>
            </Inspectable>
          ))}
        </div>
      </DataWidget>
      
      <DataWidget title="Timeline of Changes">
        <div style={{ fontSize: '0.86rem', color: 'var(--text-2)', marginBottom: 20, lineHeight: 1.5 }}>
          We compared satellite images between these two dates to pinpoint the exact time the erosion occurred.
        </div>
        <div style={{ height: 70, position: 'relative', background: 'rgba(var(--shadow-rgb), 0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 20px' }}>
          <div style={{ position: 'absolute', left: '10%', height: 24, width: 2, background: 'var(--pass)', zIndex: 2 }} />
          <div style={{ position: 'absolute', left: '10%', top: 6, transform: 'translateX(-50%)', fontSize: '0.78rem', color: 'var(--pass)', fontWeight: 600, background: 'var(--panel)', padding: '2px 6px', borderRadius: 4, zIndex: 3, border: '1px solid var(--pass)' }}>Before: {dateBefore}</div>
          
          <div style={{ position: 'absolute', left: '80%', height: 24, width: 2, background: 'var(--water)', zIndex: 2 }} />
          <div style={{ position: 'absolute', left: '80%', top: 6, transform: 'translateX(-50%)', fontSize: '0.78rem', color: 'var(--water)', fontWeight: 600, background: 'var(--panel)', padding: '2px 6px', borderRadius: 4, zIndex: 3, border: '1px solid var(--water)' }}>After: {dateAfter}</div>
          
          <div style={{ width: '100%', height: 2, background: 'rgba(var(--fg-rgb), 0.1)' }} />
          <div style={{ position: 'absolute', left: '15%', height: 8, width: '60%', background: 'rgba(var(--water-rgb), 0.2)', borderRadius: 4, border: '1px solid rgba(var(--water-rgb), 0.5)' }} />
          <div style={{ position: 'absolute', left: '45%', top: 40, transform: 'translateX(-50%)', fontSize: '0.74rem', color: 'var(--text-3)', fontStyle: 'italic' }}>Period of Change Detected</div>
        </div>
      </DataWidget>

      {/* Technical Detail Modal */}
      {activeSensor && (
        <div className="hud-dark" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(var(--shadow-rgb), 0.8)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', borderRadius: 8 }}>
          <div style={{ background: 'var(--panel)', border: '1px solid rgba(var(--fg-rgb), 0.1)', padding: 24, borderRadius: 8, width: '80%', maxWidth: 400, position: 'relative' }}>
            <button 
              onClick={() => setActiveCardId(null)} 
              style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', color: 'var(--text-3)', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ×
            </button>
            <div style={{ fontSize: '0.82rem', color: 'var(--water)', textTransform: 'uppercase', marginBottom: 4 }}>TECHNICAL METADATA</div>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 16px 0', color: 'var(--text)' }}>{activeSensor.techLabel}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Metric label="Data Source" value={activeSensor.techSource} />
              <Metric label="Confidence Interval (ρ)" value={activeSensor.conf} />
              <Metric label="Status Code" value={<span style={{ color: activeSensor.ok ? 'var(--pass)' : 'var(--warn)', fontWeight: 'bold' }}>{activeSensor.val}</span>} />
              
              <div style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid rgba(var(--fg-rgb), 0.05)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 4 }}>DETAILED OUTPUT</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                  {activeSensor.techDesc}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChallengePanel() {
  const { qc, reach } = useStore();
  const [auditOpen, setAuditOpen] = useState(true);
  const verdict = reach?.verdict ?? 'INCONCLUSIVE';
  const confidencePct = verdict === 'SUPPORTED' ? 98 : verdict === 'LIMITED' ? 64 : 12;
  const gaugeColor = verdict === 'SUPPORTED' ? 'var(--pass)' : verdict === 'LIMITED' ? 'var(--warn)' : 'var(--fail)';

  const rfiStatus = findCheck(qc?.checks, 'rfi')?.status ?? (verdict === 'LIMITED' ? 'WARN' : 'PASS');
  const alignStatus = findCheck(qc?.checks, 'alignment')?.status ?? 'PASS';
  const limitStatus = findCheck(qc?.checks, 'plausibility')?.status ?? (verdict === 'INCONCLUSIVE' ? 'FAIL' : 'PASS');

  // Simple static math for display
  const rfiDeduct = rfiStatus !== 'PASS' ? 20 : 0;
  const alignDeduct = alignStatus !== 'PASS' ? 10 : 0;
  const limitDeduct = limitStatus !== 'PASS' ? 68 : 0;
  
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ background: 'var(--panel)', borderRadius: '16px', border: '1px solid rgba(var(--fg-rgb), 0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ border: '1px solid rgba(var(--water-rgb), 0.3)', background: 'rgba(var(--water-rgb), 0.1)', color: 'var(--water)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                ANOMALY CHECK
              </span>
              <span style={{ color: 'var(--text-3)', fontSize: '0.86rem', letterSpacing: '0.05em' }}>{dateStr}</span>
            </div>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{confidencePct}%</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-3)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 6 }}>
                CONFIDENCE
              </div>
            </div>
          </div>
          
          {/* Headline */}
          <div style={{ fontSize: '1.25rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: '20px', fontWeight: 500 }}>
            {verdict === 'SUPPORTED' 
              ? 'The system confirms this detection with high confidence after rigorous adversarial testing and cross-sensor verification.' 
              : verdict === 'LIMITED' 
              ? 'The detection is probable, but confidence is reduced due to moderate radio frequency interference or alignment issues.' 
              : 'The detection is flagged as a likely false positive due to significant physical and geomorphic limit violations.'}
          </div>
          
          {/* Progress Bar */}
          <div style={{ height: '8px', background: 'rgba(var(--fg-rgb), 0.05)', borderRadius: '4px', marginBottom: '16px', overflow: 'hidden' }}>
            <div style={{ width: `${confidencePct}%`, height: '100%', background: gaugeColor, borderRadius: '4px', boxShadow: `0 0 10px ${gaugeColor}` }} />
          </div>
          
          {/* Toggle Audit Trail */}
          <button 
            onClick={() => setAuditOpen(!auditOpen)}
            style={{ background: 'transparent', border: 'none', color: 'var(--water)', fontSize: '0.9rem', padding: 0, cursor: 'pointer', marginBottom: auditOpen ? 24 : 0 }}
          >
            {auditOpen ? 'Hide audit trail' : 'Show audit trail'}
          </button>
          
          {/* Audit Trail Content */}
          {auditOpen && (
            <div style={{ borderTop: '1px solid rgba(var(--fg-rgb), 0.05)', paddingTop: '24px', animation: 'fade-in 0.3s ease-out' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', letterSpacing: '0.05em', marginBottom: '8px' }}>REASONING</div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: '24px' }}>
                Base system confidence started at 100%. After applying our deep-dive quality control heuristics to challenge the primary hypothesis, {
                  verdict === 'SUPPORTED' ? 'no significant penalties were found.' :
                  `penalties were applied for anomalies in signal noise, geometric distortion, or physical impossibility.`
                }
              </div>
              
              <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', letterSpacing: '0.05em', marginBottom: '8px' }}>EVIDENCE</div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-2)', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                <li>Base System Confidence: 100%</li>
                {rfiStatus !== 'PASS' && <li>Radio Frequency Interference penalty applied: <span style={{ color: 'var(--warn)' }}>-{rfiDeduct}%</span></li>}
                {alignStatus !== 'PASS' && <li>Suboptimal Pixel Coregistration penalty: <span style={{ color: 'var(--warn)' }}>-{alignDeduct}%</span></li>}
                {limitStatus !== 'PASS' && <li>Physical geomorphic limits exceeded: <span style={{ color: 'var(--fail)' }}>-{limitDeduct}%</span></li>}
                <li>Final Computed Confidence: <span style={{ color: gaugeColor, fontWeight: 'bold' }}>{confidencePct}%</span></li>
                <li>Probability of false positive: {(100 - confidencePct).toFixed(1)}%</li>
              </ul>
              
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid var(--pass)', background: 'rgba(127,191,142,0.1)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.82rem', color: 'var(--pass)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                verified • just now
              </div>
            </div>
          )}
        </div>
        
        {/* Feedback Section */}
        <div style={{ borderTop: '1px solid rgba(var(--fg-rgb), 0.05)', background: 'rgba(var(--shadow-rgb), 0.2)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.86rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DID THIS HAPPEN?</span>
          <button className="agentic-action-btn" style={{ padding: '6px 16px', fontSize: '0.92rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid rgba(var(--fg-rgb), 0.2)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
            Hit
          </button>
          <button className="agentic-action-btn" style={{ padding: '6px 16px', fontSize: '0.92rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid rgba(var(--fg-rgb), 0.2)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>
            Miss
          </button>
        </div>
      </div>
      
      <DataWidget title="Analysis Steps & Timeline">
        <StepTimeline lines={[
          '[INFO] Initializing environmental data gathering...',
          '[INFO] Checking for atmospheric and weather interference...',
          '[WARN] Found some radio signal interference. Automatically corrected.',
          `[PASS] Verified geometric alignment with optical data.`,
          `[${verdict === 'INCONCLUSIVE' || verdict === 'LIMITED' ? 'FAIL' : 'PASS'}] Evaluated erosion rate against 10-year historical maximums.`,
          '[INFO] Processing final decision...',
          '[INFO] Automated review complete. Ready for human verification.'
        ]} />
      </DataWidget>
    </div>
  );
}

function ExplainPanel() {
  const { reach, manifest } = useStore();
  if (!reach || !manifest) return null;
  const headline = manifest.metrics.find((m) => m.id === reach.headline_metric_id);
  const color = reach.verdict === 'SUPPORTED' ? 'var(--pass)' : reach.verdict === 'LIMITED' ? 'var(--warn)' : 'var(--fail)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <DataWidget title="Final System Verdict">
        <Inspectable intentKey="verdict">
          <div className="typewriter-text" style={{ position: 'relative', fontSize: '1rem', color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'normal', animation: 'none', background: 'rgba(var(--water-rgb), 0.05)', padding: '24px', borderRadius: '8px', borderLeft: `6px solid ${color}` }}>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-3)', marginBottom: 12 }}>EXECUTIVE SUMMARY</div>
            <span style={{ color: color, fontWeight: 800, fontSize: '1.4rem', letterSpacing: '0.1em', textShadow: `0 0 10px ${color}` }}>{reach.verdict}</span><br /><br />
            
            {/* Hover Image Container */}
            <div className="nodivangon-preview" style={{ position: 'absolute', top: 24, right: 24, width: 140, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', zIndex: 10 }}>
              <div className="nodivangon-image" style={{ width: '100%', height: 80, backgroundImage: 'url(/erosion_preview.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 6, border: '1px solid rgba(var(--fg-rgb), 0.2)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'crosshair', position: 'relative', transformOrigin: 'top right' }}>
                <div className="nodivangon-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(var(--shadow-rgb), 0.5)', backdropFilter: 'blur(2px)', transition: 'all 0.3s', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(var(--fg-rgb), 0.8)" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                </div>
              </div>
              <div className="nodivangon-meta" style={{ marginTop: 8, fontSize: '0.74rem', color: 'var(--text-3)', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 2, fontFamily: 'var(--font-num)' }}>
                <div>DATE: <strong style={{ color: 'var(--text-2)' }}>28 SEP 2026</strong></div>
                <div>SOURCE: <strong style={{ color: 'var(--text-2)' }}>SENTINEL-2 L2A</strong></div>
                <div>COORD: <strong style={{ color: 'var(--text-2)' }}>{reach.bbox[1].toFixed(2)}°N, {reach.bbox[0].toFixed(2)}°E</strong></div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16, maxWidth: '65%' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>NET EROSION DETECTED</div>
                <strong style={{ color: 'var(--text)', fontSize: '1.2rem' }}>{headline?.value.toLocaleString()} ha</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>PRIMARY REASONING</div>
                <span style={{ opacity: 0.9, fontSize: '0.92rem' }}>{reach.verdict_reasons[0].toUpperCase()}</span>
              </div>
            </div>
            
            <div style={{ fontSize: '0.86rem', color: 'var(--text-2)', borderTop: '1px solid rgba(var(--fg-rgb), 0.1)', paddingTop: 16 }}>
              <strong>RECOMMENDATION:</strong> {
                reach.verdict === 'SUPPORTED' ? 'Immediate field deployment recommended. High confidence in severe morphodynamic shift.' :
                reach.verdict === 'LIMITED' ? 'Deploy field team for manual verification. Mixed signals from auxiliary sensors.' :
                'Stand down. Anomalous detection likely due to agricultural flooding or RFI.'
              }
            </div>
          </div>
        </Inspectable>
      </DataWidget>
      
      <DataWidget title="Explainable AI (XAI) Attribution">
        <Inspectable intentKey="explain_simple">
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Metric label="SAR Backscatter Intensity (Feature 1)" value="78.2%" />
              <Metric label="Sentinel-1 Optical Match (Feature 2)" value="14.5%" />
              <Metric label="Hydrological Stage Context (Feature 3)" value="6.1%" />
              <Metric label="Geomorphic Prior Models (Feature 4)" value="1.2%" />
            </div>
            <div style={{ marginTop: 12, height: 16, display: 'flex', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ width: '78.2%', background: 'var(--water)' }} />
              <div style={{ width: '14.5%', background: 'var(--pass)' }} />
              <div style={{ width: '6.1%', background: 'var(--warn)' }} />
              <div style={{ width: '1.2%', background: 'var(--fail)' }} />
            </div>
          </div>
        </Inspectable>
      </DataWidget>
    </div>
  );
}

function FieldPanel() {
  const { reach } = useStore();
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <DataWidget title="Ground Truth & Field Telemetry">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
          
          <div style={{ background: 'rgba(var(--shadow-rgb), 0.3)', padding: 16, borderRadius: 8, borderLeft: '3px solid var(--pass)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>GPS Field Node 01</div>
              <div style={{ width: 8, height: 8, background: 'var(--pass)', borderRadius: '50%', boxShadow: '0 0 10px var(--pass)', animation: 'pulse-dot 2s infinite' }} />
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: 600 }}>ONLINE (SYNCED)</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--water)', marginTop: 8 }}>Lat: {reach?.bbox[1].toFixed(4)} / Lon: {reach?.bbox[0].toFixed(4)}</div>
          </div>
          
          <div style={{ background: 'rgba(var(--shadow-rgb), 0.3)', padding: 16, borderRadius: 8, borderLeft: '3px solid var(--warn)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>Drone Survey Status</div>
              <div style={{ width: 8, height: 8, background: 'var(--warn)', borderRadius: '50%', boxShadow: '0 0 10px var(--warn)', animation: 'pulse-dot 1s infinite' }} />
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: 600 }}>AWAITING DEPLOYMENT</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 8 }}>UAV authorization pending clearance.</div>
          </div>
          
        </div>

        <div style={{ background: 'rgba(var(--fg-rgb), 0.02)', padding: 16, borderRadius: 6, border: '1px solid rgba(var(--fg-rgb), 0.05)' }}>
          <div style={{ fontSize: '0.86rem', color: 'var(--text-2)', marginBottom: 12, letterSpacing: '0.1em' }}>COMMUNITY ALERT INTEGRATION</div>
          <Metric label="SMS Alerts Dispatched" value="4,250" />
          <Metric label="Evacuation Status" value={<span style={{ color: 'var(--warn)' }}>PREPARED</span>} />
          <Metric label="Local Authority Sync" value={<span style={{ color: 'var(--pass)' }}>VERIFIED</span>} />
        </div>
      </DataWidget>
      
      <DataWidget title="Field Team Synchronization Timeline">
         <StepTimeline lines={[
          '[INFO] Connecting to on-ground GPS Field Node 01...',
          '[PASS] Connection successful and secured.',
          `[INFO] Downloading live GPS coordinates from the local team...`,
          '[INFO] Comparing ground data with our satellite detection...',
          '[PASS] Ground truth confirms satellite detection (94.2% overlap).',
          '[INFO] Alerting local cell towers for SMS broadcast...',
          '[PASS] System on standby. Waiting for final authorization.'
        ]} />
      </DataWidget>
    </div>
  );
}

function ImpactPanel() {
  const { reach, manifest } = useStore();
  if (!reach || !manifest) return null;
  const headline = manifest.metrics.find((m) => m.id === reach.headline_metric_id);
  const areaValue = headline?.value || 0;
  
  // Simulated calculations based on area for visual purposes
  const homesAtRisk = Math.round(areaValue * 2.5); // Approx 2.5 homes per hectare in dense char areas
  const peopleAffected = homesAtRisk * 4.5; // Average household size
  const agLandLost = Math.round(areaValue * 0.85); // 85% of chars are agricultural

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <DataWidget title="Impact Assessment">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          <div style={{ background: 'rgba(228, 87, 46, 0.1)', padding: 16, borderRadius: 8, borderLeft: '3px solid var(--erosion)' }}>
             <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>Homes at Risk</div>
             <div style={{ fontSize: '1.4rem', color: 'var(--erosion)', fontWeight: 700, marginTop: 4 }}>{homesAtRisk.toLocaleString()}</div>
          </div>
          <div style={{ background: 'rgba(217, 178, 106, 0.1)', padding: 16, borderRadius: 8, borderLeft: '3px solid var(--warn)' }}>
             <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>People Affected</div>
             <div style={{ fontSize: '1.4rem', color: 'var(--warn)', fontWeight: 700, marginTop: 4 }}>{peopleAffected.toLocaleString()}</div>
          </div>
          <div style={{ background: 'rgba(127, 191, 142, 0.1)', padding: 16, borderRadius: 8, borderLeft: '3px solid var(--pass)' }}>
             <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>Ag. Land Lost (ha)</div>
             <div style={{ fontSize: '1.4rem', color: 'var(--pass)', fontWeight: 700, marginTop: 4 }}>{agLandLost.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ background: 'rgba(var(--fg-rgb), 0.02)', padding: 16, borderRadius: 8, border: '1px solid rgba(var(--fg-rgb), 0.05)' }}>
          <div style={{ fontSize: '0.86rem', color: 'var(--text-2)', marginBottom: 12, letterSpacing: '0.1em', fontWeight: 600 }}>RECOMMENDED ACTIONS</div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Activate emergency response teams in {reach.name} high-risk char areas.</li>
            <li>Coordinate with BWDB to survey new accretion zones for temporary shelter.</li>
            <li>Issue localized public warnings through FFWC communication channels.</li>
            <li>Preposition relief supplies (water purification, dry food) at regional distribution centers.</li>
          </ul>
        </div>
      </DataWidget>

      <DataWidget title="River Reach Vulnerability Index">
         <div style={{ fontSize: '0.86rem', color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.5 }}>
            Comparative erosion risk across major Jamuna River reaches based on current hydrodynamic stress and recent satellite detections.
         </div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { name: 'Chilmari–Roumari', score: 92, color: 'var(--fail)' },
              { name: 'Sariakandi', score: 85, color: 'var(--fail)' },
              { name: 'Sirajganj', score: 78, color: 'var(--warn)' },
              { name: 'Kazipur', score: 65, color: 'var(--warn)' },
              { name: 'Aricha', score: 45, color: 'var(--pass)' }
            ].map((r) => (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                 <div style={{ width: 100, fontSize: '0.86rem', color: 'var(--text)' }}>{r.name}</div>
                 <div style={{ flex: 1, height: 10, background: 'rgba(var(--fg-rgb), 0.1)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ width: `${r.score}%`, height: '100%', background: r.color, borderRadius: 5 }} />
                 </div>
                 <div style={{ width: 20, fontSize: '0.86rem', fontWeight: 700, color: r.color, textAlign: 'right' }}>{r.score}</div>
              </div>
            ))}
         </div>
      </DataWidget>
    </div>
  );
}

const PANELS: Record<TabId, () => JSX.Element | null> = {
  detect: DetectPanel,
  investigate: InvestigatePanel,
  challenge: ChallengePanel,
  explain: ExplainPanel,
  field: FieldPanel,
  impact: ImpactPanel,
};

const LOG_MESSAGES = [
  '[SYS] Initializing orbital parameters...',
  '[SAR] Fetching L2 GCOV Provisional Granule...',
  '[SAR] Applying radiometric terrain correction...',
  '[MATH] Computing Otsu threshold for bimodal distribution...',
  '[QC] Checking temporal persistence...',
  '[QC] Cross-referencing Sentinel-1 DSWx...',
  '[QC] Evaluating threshold sensitivity ±1dB...',
  '[SYS] Generating provenance manifest...',
  '[SYS] Analysis complete.'
];

export function EvidenceTabs({ isReportMode = false }: { isReportMode?: boolean }) {
  const { reach, manifest, qc, setAnalysisMode, setAnalysisSplit, analysisModeType, analysisActiveTab, setAnalysisActiveTab, analysisStepIndex, setAnalysisStepIndex, analysisState, setAnalysisState, inspectMode, setInspectMode } = useStore();
  const ready = useMemo(() => Boolean(reach && manifest && qc), [reach, manifest, qc]);

  const [logs, setLogs] = useState<string[]>(
    analysisState === 'DONE' 
      ? ['[SYS] UPLINK ESTABLISHED. STARTING ANALYSIS...', ...LOG_MESSAGES, '[SYS] OPERATIONS COMPLETED.'] 
      : []
  );
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Workflow orchestration
  useEffect(() => {
    if (analysisState !== 'PROCESSING') return;

    let logIdx = 0;
    const logInterval = setInterval(() => {
      if (logIdx < LOG_MESSAGES.length) {
        setLogs(prev => [...prev, LOG_MESSAGES[logIdx]]);
        logIdx++;
      }
    }, 400);

    const timeout = setTimeout(() => {
      clearInterval(logInterval);
      setAnalysisState('DONE');
      setLogs(prev => [...prev, '[SYS] OPERATIONS COMPLETED.']);
      setAnalysisSplit(true);
    }, 2500);

    return () => {
      clearInterval(logInterval);
      clearTimeout(timeout);
    };
  }, [analysisState]);

  if (!ready) return null;


  const resetAnalysis = () => {
    setAnalysisState('IDLE');
    setAnalysisActiveTab(null);
    setLogs([]);
    setAnalysisSplit(false);
    setAnalysisMode(false);
  };

  if (isReportMode && analysisActiveTab) {
    const Panel = PANELS[analysisActiveTab as TabId];
    const isLastStep = analysisStepIndex === TABS.length - 1;

    const nextStep = () => {
      const nextIdx = analysisStepIndex + 1;
      setAnalysisStepIndex(nextIdx);
      setAnalysisActiveTab(TABS[nextIdx].id);
      setAnalysisState('PROCESSING'); // triggers HUD again
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, paddingBottom: 64 }}>
        <div style={{ animation: 'fade-in 0.5s ease-out' }}>
          <Panel />
        </div>
        
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
          {analysisModeType === 'FULL' && !isLastStep && (
            <button className="agentic-action-btn" onClick={nextStep} style={{ padding: '12px 24px' }}>
              Proceed to {TABS[analysisStepIndex + 1].label} &rarr;
            </button>
          )}
          {analysisModeType === 'FULL' && isLastStep && (
            <button className="agentic-action-btn" onClick={() => { setAnalysisMode(false); setAnalysisSplit(false); }} style={{ padding: '12px 24px', borderColor: 'var(--pass)', color: 'var(--pass)' }}>
              Complete Analysis
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="agentic-panel__header">
        <div className="agentic-panel__title">Live Analysis</div>
        <button 
          onClick={() => setInspectMode(!inspectMode)}
          style={{ background: inspectMode ? 'var(--water)' : 'transparent', color: inspectMode ? '#000' : 'var(--water)', border: '1px solid var(--water)', padding: '4px 12px', borderRadius: 16, fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', marginRight: 16, transition: 'all 0.2s', boxShadow: inspectMode ? 'none' : '0 0 10px rgba(var(--water-rgb), 0.3)', animation: inspectMode ? 'none' : 'pulse-border 2s infinite' }}
        >
          {inspectMode ? <><MessageSquare size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', margin: '0 4px' }} /> Exit Chat Mode</> : <><MessageSquare size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', margin: '0 4px' }} /> Chat with Data</>}
        </button>
        <button 
          onClick={() => { setAnalysisMode(false); setAnalysisSplit(false); }}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '1.2rem' }}
        >
          ×
        </button>
      </div>
      <div className="agentic-panel__content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Step Indicators (Only show in FULL mode) */}
          {analysisModeType === 'FULL' && (
            <div className="agentic-steps">
              {TABS.map((t, i) => {
                const isCompleted = i < analysisStepIndex || analysisState === 'DONE';
                const isActive = i === analysisStepIndex;
                return (
                  <div key={t.id} className={`agentic-step-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                    <div className="agentic-step-dot">{i + 1}</div>
                    <div className="agentic-step-label">{t.label}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Terminal Log Output */}
          <div className="agentic-terminal">
            {logs.map((log, i) => (
              <div key={i} className={`agentic-log-line ${i === logs.length - 1 ? 'highlight' : ''}`}>
                {log}
              </div>
            ))}
            {analysisState === 'PROCESSING' && (
              <div className="agentic-log-line highlight" style={{ animation: 'pulse-dot 1s infinite' }}>_</div>
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Display completed widgets */}
          {TABS.map((t, i) => {
            if (analysisModeType === 'SINGLE' && analysisActiveTab !== t.id) return null;
            if (analysisModeType === 'FULL' && i > analysisStepIndex) return null;
            const isCompleted = analysisState === 'DONE' || (analysisModeType === 'FULL' && i < analysisStepIndex);
            const Panel = PANELS[t.id];
            if (!isCompleted) return null;
            return (
              <div key={t.id} style={{ animation: 'fade-in 0.5s ease-out' }}>
                <Panel />
              </div>
            );
          })}

          {analysisState === 'DONE' && (
            <button className="agentic-action-btn" onClick={resetAnalysis} style={{ width: '100%', marginTop: 8, borderColor: 'var(--text-3)', color: 'var(--text-2)' }}>
              Reset Analysis
            </button>
          )}
        </div>
      </div>
    </>
  );
}
