import { useEffect, useRef } from 'react';
import { Radio, Activity, Square, RefreshCw, Satellite, Waves, CloudRain, Mountain, Globe, BarChart2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import '../styles/landing.css';

/* ─── Real pipeline steps from our run_reach.py ─── */
const PIPELINE_STEPS = [
  { label: 'Discover', desc: 'Find NISAR GCOV granules' },
  { label: 'Fetch', desc: 'Stream & AOI-clip' },
  { label: 'Validate', desc: 'Reject broken granules' },
  { label: 'Preprocess', desc: 'dB conversion & filter' },
  { label: 'Water', desc: 'Otsu thresholding' },
  { label: 'Stage', desc: 'Gauge height matching' },
  { label: 'Pairs', desc: 'Equal-stage pairing' },
  { label: 'Change', desc: 'Erosion / accretion' },
  { label: 'Validate', desc: 'Cross-sensor QC' },
  { label: 'Render', desc: 'Map-ready PNGs' },
  { label: 'Manifest', desc: 'Provenance chain' },
  { label: 'Check', desc: 'Bundle integrity' },
];

/* ─── Evidence trail stages — these are our real tabs ─── */
const EVIDENCE_STAGES = [
  {
    num: '01',
    title: 'Detect',
    desc: 'NISAR L-band radar measures the surface. Water reflects the signal away — dark pixels. Land scatters it back — bright pixels. The threshold between them is computed, not guessed.',
  },
  {
    num: '02',
    title: 'Investigate',
    desc: 'Cross-check the radar finding against independent sources: OPERA DSWx-S1, river stage data, GPM IMERG rainfall, and temporal persistence. Not all pass — that matters.',
  },
  {
    num: '03',
    title: 'Challenge',
    desc: 'Actively try to break the finding. Threshold sensitivity, RFI interference, scene alignment, order-of-magnitude plausibility. If a check fails, the verdict says so.',
  },
  {
    num: '04',
    title: 'Explain',
    desc: 'A template-generated summary from the actual data bundle — dates, areas, confidence ranges, verdict reasons. No language model wrote it; every number traces to manifest.json.',
  },
  {
    num: '05',
    title: 'Field',
    desc: 'Connect the satellite observation to the ground. Check your GPS proximity to the investigation footprint, log field notes, photograph evidence — all on-device, nothing uploaded.',
  },
];

/* ─── SAR concept cards — only concepts our project actually uses ─── */
const SAR_CONCEPTS = [
  {
    icon: <Radio size={18} />,
    title: 'Active Sensing',
    short: 'Its own light source — works through clouds and at night.',
    body: 'SAR sends its own microwave pulse and measures the return signal. Unlike optical sensors, it works through clouds, at night, and during monsoon — exactly when river change happens.',
  },
  {
    icon: <Activity size={18} />,
    title: 'L-Band Radar (~24 cm)',
    short: 'A long wavelength that sees through the tree canopy.',
    body: 'NISAR transmits at L-band: a ~24 cm wavelength that penetrates vegetation canopy and interacts with the ground surface. This lets us see through trees to the water edge beneath.',
  },
  {
    icon: <Square size={18} />,
    title: 'Backscatter & Water',
    short: 'Water is dark, land is bright.',
    body: 'Open water acts like a mirror, reflecting the radar pulse away — appearing dark (low σ⁰). Land and vegetation scatter the signal back to the sensor — appearing bright. This contrast is our detection principle.',
  },
  {
    icon: <RefreshCw size={18} />,
    title: 'Change Detection',
    short: 'Same river height, two dates — what moved?',
    body: 'By comparing two radar passes at the same river height, we isolate real bank migration from temporary flooding. A pixel that was land and became water, at matched stage — that is our signal.',
  },
];

/* ─── Data sources used in our project ─── */
const DATA_SOURCES = [
  {
    badge: <Satellite size={18} />,
    name: 'NISAR L2 GCOV Provisional V1',
    role: 'Primary measurement — calibrated γ⁰ backscatter per pass',
    doi: '10.5067/NIL2GCOV-P1',
  },
  {
    badge: <Waves size={18} />,
    name: 'OPERA L3 DSWx-S1 V1',
    role: 'Independent validation — Sentinel-1 water extent, different wavelength',
    doi: '10.5067/OPDSWS1-L3V1',
  },
  {
    badge: <CloudRain size={18} />,
    name: 'GPM IMERG Daily',
    role: 'Rainfall context — precipitation anomaly check',
    doi: '10.5067/GPM/IMERGDL/DAY/07',
  },
  {
    badge: <Mountain size={18} />,
    name: 'ASF GLO-30 HAND',
    role: 'Terrain mask — excludes water on high ground',
    doi: null,
  },
  {
    badge: <Globe size={18} />,
    name: 'NASA GIBS Blue Marble',
    role: 'Satellite basemap tiles via WMTS',
    doi: null,
  },
  {
    badge: <BarChart2 size={18} />,
    name: 'FFWC River Stage',
    role: 'Scientific control — river height at each acquisition',
    doi: null,
  },
];

/* Adds .is-visible to the element once it scrolls into view (drives the staggered entrance animations). */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('is-visible');
        io.disconnect();
      }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

export function Landing() {
  const pipelineRef = useReveal<HTMLDivElement>();
  const trailRef = useReveal<HTMLDivElement>();
  const sourcesRef = useReveal<HTMLDivElement>();

  return (
    <div className="page-container">
      <Navbar transparent />

      {/* ════ Hero ════ */}
      <section data-theme="dark" style={{ color: 'var(--text)', position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
        <div className="hero-radar" aria-hidden="true" />
        <div className="hero-scrim" aria-hidden="true" />
        <div className="hero-caption">Jamuna River, Bangladesh · NISAR L-band radar · dark is water, bright is land</div>

        <div className="hero-content-elegant">
          <div className="eyebrow">
            GLOBAL CHANGE INTELLIGENCE
          </div>

          <h1 className="headline">
            <span className="headline-gradient">See the invisible.</span><br />
            <span className="headline-accent">Predict the inevitable.</span>
          </h1>

          <p className="subheadline">
            A cloud-native intelligence platform leveraging NISAR L-band radar to quantify global surface changes. From river erosion to glacial retreat, our ML engine decodes the physics of a transforming planet.
          </p>

          <div className="btn-group">
            <a href="/cases" className="btn-elegant-primary">
              Begin Investigation
            </a>
            <a href="/methods" className="btn-elegant-secondary">
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* ════ SAR Concepts ════ */}
      <section className="sar-intro">
        <div className="section-label">How SAR Works</div>
        <h2>Synthetic Aperture Radar for Earth Observation</h2>
        <p className="landing-lead">
          SAR is an active microwave remote sensing technology. Unlike optical cameras, it
          provides its own illumination — enabling observation regardless of time of day, cloud
          cover, or weather conditions.{' '}
          <a
            href="https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more on NASA Earthdata →
          </a>
        </p>

        <div className="sar-intro__grid">
          {SAR_CONCEPTS.map((c) => (
            <div key={c.title} className="sar-flip">
              <div className="sar-flip__inner">
                <div className="sar-flip__face sar-flip__front">
                  <span className="sar-card__icon">{c.icon}</span>
                  <h3>{c.title}</h3>
                  <p>{c.short}</p>
                </div>
                <div className="sar-flip__face sar-flip__back">
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" style={{ maxWidth: 1400, margin: '0 auto' }} />

      {/* ════ Pipeline ════ */}
      <section className="pipeline-section">
        <div className="section-label">Processing Pipeline</div>
        <h2>12-Step Analysis Pipeline</h2>
        <p className="landing-lead">
          Every number on this site passes through twelve offline processing steps — from raw
          NISAR granule to verified, bundled result. No step is skipped, and no number is hand-typed.
        </p>

        <div className="pipeline-flow" ref={pipelineRef}>
          {PIPELINE_STEPS.map((step, i) => {
            // Snake layout: 1 2 3 4 / 8 7 6 5 / 9 10 11 12
            const row = Math.floor(i / 4);
            const pos = i % 4;
            const col = row % 2 === 0 ? pos : 3 - pos;
            const cls = ['pipeline-node', row % 2 === 1 ? 'pipeline-node--rtl' : '', pos === 3 ? 'pipeline-node--end' : '', i === PIPELINE_STEPS.length - 1 ? 'pipeline-node--last' : ''].filter(Boolean).join(' ');
            return (
            <div className={cls} key={`${step.label}-${i}`} style={{ ['--i' as string]: i, gridRow: row + 1, gridColumn: col + 1 }}>
              <span className="pipeline-node__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="pipeline-node__label">{step.label}</span>
              <span className="pipeline-node__desc">{step.desc}</span>
            </div>
            );
          })}
        </div>
      </section>

      <div className="divider" style={{ maxWidth: 1400, margin: '0 auto' }} />

      {/* ════ Evidence Trail ════ */}
      <section className="evidence-trail">
        <div className="section-label">Evidence Trail</div>
        <h2>Five-Stage Verification</h2>
        <p className="landing-lead">
          Every investigation follows the same five-step trail: detect the change, investigate
          with independent sources, challenge the finding, explain the result, connect to the field.
        </p>

        <div className="evidence-trail__flow" ref={trailRef}>
          {EVIDENCE_STAGES.map((s, i) => (
            <div key={s.num} className="evidence-trail__step" style={{ ['--i' as string]: i }}>
              <span className="evidence-trail__step-num">STEP {s.num}</span>
              <span className="evidence-trail__step-title">{s.title}</span>
              <span className="evidence-trail__step-desc">{s.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" style={{ maxWidth: 1400, margin: '0 auto' }} />

      {/* ════ Data Sources ════ */}
      <section className="data-sources">
        <div className="section-label">Data Sources</div>
        <h2>Built on NASA Open Data</h2>
        <p className="landing-lead">
          Every observation, validation, and context layer comes from a named, citable dataset.
          No data is fabricated or simulated.
        </p>

        <div className="data-sources__grid" ref={sourcesRef}>
          {DATA_SOURCES.map((s, i) => (
            <div key={s.name} className="data-source-card" style={{ ['--i' as string]: i }}>
              <div className="data-source-card__badge">{s.badge}</div>
              <div className="data-source-card__info">
                <div className="data-source-card__name">{s.name}</div>
                <div className="data-source-card__role">{s.role}</div>
                {s.doi && (
                  <a
                    className="data-source-card__doi"
                    href={`https://doi.org/${s.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    DOI: {s.doi}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════ Footer ════ */}
      <footer className="landing-footer">
        FluviSAR &middot; NASA Space Apps Challenge 2026 &middot; Dancing with the SARs
        &middot;{' '}
        <a href="/methods">full methods &amp; sources</a> &middot;{' '}
        <a
          href="https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar"
          target="_blank"
          rel="noopener noreferrer"
        >
          NASA SAR Reference
        </a>
      </footer>
    </div>
  );
}
