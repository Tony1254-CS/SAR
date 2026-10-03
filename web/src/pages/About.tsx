import { Cloud, Eye, Radio, Waves } from 'lucide-react';
import { Navbar } from '../components/Navbar';

const SOURCES = [
  {
    name: 'NISAR L2 GCOV Provisional V1',
    role: 'Primary measurement — calibrated γ⁰ radar backscatter per pass',
    doi: '10.5067/NIL2GCOV-P1',
    provider: 'NASA/JPL NISAR, via ASF DAAC',
    desc: 'NASA-ISRO Synthetic Aperture Radar mission. L-band (1.257 GHz, ~24 cm wavelength) geocoded, covariance-matrix product. Dual-pol (HHHH + HVHV). 12-day repeat cycle. This is the core measurement we use — calibrated radar backscatter per orbital pass, clipped to each reach AOI.',
  },
  {
    name: 'OPERA L3 DSWx-S1 V1',
    role: 'Independent validation — Sentinel-1 C-band water extent',
    doi: '10.5067/OPDSWS1-L3V1',
    provider: 'NASA JPL OPERA, via PO.DAAC',
    desc: 'An independent water surface extent product derived from Sentinel-1 C-band radar (different satellite, different wavelength). Used for cross-sensor agreement checks. Note: not yet wired into our pipeline — currently NOT_EVALUATED.',
  },
  {
    name: 'GPM IMERG Daily Late Run V07',
    role: 'Rainfall anomaly check',
    doi: '10.5067/GPM/IMERGDL/DAY/07',
    provider: 'NASA Goddard, GPM',
    desc: 'Global Precipitation Measurement multi-satellite product. We fetch daily precipitation for the 50-day window around each acquisition and compute a 7-day rainfall anomaly ratio before t1 vs. the window baseline. Our real data shows 1.72× seasonal norm (64.48mm vs 37.44mm baseline).',
  },
  {
    name: 'ASF GLO-30 HAND',
    role: 'Terrain mask — excludes water classification on high ground',
    doi: null,
    provider: 'Alaska Satellite Facility',
    desc: 'Height Above Nearest Drainage, derived from Copernicus GLO-30 DEM. Pixels above the HAND cutoff (15m in our config) are excluded from water classification, preventing hilltop radar shadows from being classified as water.',
  },
  {
    name: 'JRC Global Surface Water — Occurrence',
    role: 'Reference — defines stable-land zone for null test',
    doi: null,
    provider: 'European Commission Joint Research Centre',
    desc: 'Long-term water occurrence map used to define known-stable land for the false-positive control test. The null test checks: does the algorithm falsely detect change on land that has never been water?',
  },
  {
    name: 'FFWC River Stage',
    role: 'Scientific control — river height at each acquisition',
    doi: null,
    provider: 'Flood Forecasting and Warning Centre, BWDB, Bangladesh',
    desc: 'Gauge station readings that provide river water level at each radar acquisition time. Critical for stage matching — comparing two dates at the same river height isolates real bank migration from temporary flooding. Where unavailable, a proxy (imagery-derived water fraction) is used instead.',
  },
  {
    name: 'NASA GIBS Blue Marble',
    role: 'Satellite basemap tiles (WMTS)',
    doi: null,
    provider: 'NASA GIBS (Global Imagery Browse Services)',
    desc: 'Blue Marble ShadedRelief Bathymetry basemap tiles served via WMTS. Used as the visual context layer beneath our radar and change overlays on the map. Presentation only — not a scientific input.',
  },
];

const SAR_CONCEPTS = [
  {
    term: 'Synthetic Aperture Radar (SAR)',
    explanation: 'A radar imaging technique that synthesizes a large antenna aperture by combining multiple signal returns as the satellite moves along its orbit. This produces high-resolution imagery regardless of lighting or weather conditions.',
    relevance: 'NISAR, our primary data source, is a SAR satellite. Every radar image in this application is a SAR observation.',
  },
  {
    term: 'Active Sensing',
    explanation: 'Unlike passive optical sensors that depend on sunlight, SAR transmits its own microwave pulse and measures the reflected signal. This means it can observe at any time of day and through clouds.',
    relevance: 'Monsoon-season river erosion in Bangladesh happens under heavy cloud cover — exactly when optical satellites cannot see. SAR can.',
  },
  {
    term: 'L-Band (~24 cm wavelength)',
    explanation: 'Microwave frequency band centered around 1.2 GHz with ~24 cm wavelength. Longer wavelengths penetrate vegetation canopy and interact more with the ground surface than shorter bands (C-band, X-band).',
    relevance: 'NISAR\'s L-band lets us see through riverside vegetation to detect the actual water edge, which is critical for accurate erosion mapping along densely vegetated riverbanks.',
  },
  {
    term: 'Backscatter Coefficient (σ⁰ / γ⁰)',
    explanation: 'The measure of how much radar energy is reflected back to the sensor per unit area. Smooth surfaces (water) reflect the signal away from the sensor (specular reflection → low backscatter). Rough surfaces (land, vegetation) scatter the signal in many directions, including back toward the sensor (diffuse/volume scattering → high backscatter).',
    relevance: 'This contrast is our entire detection principle. We classify pixels as water (dark / low γ⁰) or land (bright / high γ⁰) using an Otsu threshold on the calibrated backscatter values.',
  },
  {
    term: 'Polarization (HH)',
    explanation: 'The orientation of the transmitted and received electromagnetic wave. HH means horizontal transmit, horizontal receive. Different polarizations interact differently with surface and vegetation structure.',
    relevance: 'Our pipeline uses the HHHH covariance product from NISAR — the co-polarized horizontal channel, which provides strong land/water contrast for our Otsu thresholding approach.',
  },
  {
    term: 'Change Detection',
    explanation: 'Comparing two SAR images acquired at different times to identify areas where the surface has changed. For reliable change detection, confounding factors (different river height, seasonal flooding) must be controlled.',
    relevance: 'Our core method: compare two NISAR passes at matched river stage. A pixel classified as land at t0 and water at t1, at the same river height, indicates genuine bank migration — not temporary flood.',
  },
];

export function AboutPage() {
  return (
    <div className="page-container">
      <Navbar />
      <div className="navbar-spacer" />

      {/* ── Cinematic Story Section ── */}
      <div className="cinematic-hero" style={{ position: 'relative', overflow: 'hidden', padding: '6rem 0' }}>
        {/* Background glow and image */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/erosion_preview.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15, mixBlendMode: 'luminosity', filter: 'blur(4px)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(var(--panel-rgb), 1) 0%, rgba(var(--panel-rgb), 0.5) 50%, rgba(var(--panel-rgb), 1) 100%)' }} />
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '80vw', height: '40vw', background: 'radial-gradient(ellipse at center, rgba(var(--water-rgb), 0.15) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div className="page-content" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', margin: 'var(--s6) 0 var(--s8)' }}>
            <div style={{ display: 'inline-block', padding: '4px 16px', background: 'rgba(var(--water-rgb), 0.1)', border: '1px solid var(--water)', color: 'var(--water)', borderRadius: '20px', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>
              The Untold Crisis
            </div>
            <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text)', textShadow: '0 0 40px rgba(var(--fg-rgb), 0.3)', marginBottom: 'var(--s4)', lineHeight: 1.1 }}>
              The River <br/><span style={{ background: 'linear-gradient(90deg, var(--water), var(--fail))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Takes It All</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-2)', maxWidth: '800px', margin: '0 auto', lineHeight: 1.8, fontFamily: 'serif', fontStyle: 'italic' }}>
              In Bangladesh, the Jamuna River doesn't just flood. It migrates. During the monsoon, the riverbank can erode hundreds of meters in a single week, swallowing homes, schools, and entire villages overnight.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '6rem' }}>
            {/* Story Card 1 */}
            <div style={{ display: 'flex', gap: '2rem', background: 'rgba(var(--fg-rgb), 0.02)', border: '1px solid rgba(var(--fg-rgb), 0.05)', borderRadius: '24px', padding: '2rem', backdropFilter: 'blur(10px)', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                <h3 style={{ fontSize: '2rem', color: 'var(--text)', marginBottom: '1rem' }}>Blinded by the Monsoon</h3>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.7, fontSize: '1.1rem' }}>
                  Traditional optical satellites (like Landsat or Sentinel-2) are useless when we need them most. Heavy monsoon clouds blanket the region for months, hiding the catastrophic erosion happening on the ground. We are blind to the destruction until the clouds finally clear in autumn—long after the damage is done.
                </p>
              </div>
              <div style={{ flex: '1 1 300px', height: '200px', background: 'linear-gradient(45deg, var(--surface-2), var(--panel-elevated))', borderRadius: '16px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==)', opacity: 0.5 }} />
                <span style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 20px rgba(var(--fg-rgb), 0.5))' }}><Cloud size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', margin: '0 4px' }} /><Eye size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', margin: '0 4px' }} /></span>
              </div>
            </div>

            {/* Story Card 2 */}
            <div style={{ display: 'flex', gap: '2rem', background: 'rgba(var(--water-rgb), 0.05)', border: '1px solid rgba(var(--water-rgb), 0.2)', borderRadius: '24px', padding: '2rem', backdropFilter: 'blur(10px)', alignItems: 'center', flexWrap: 'wrap', flexDirection: 'row-reverse', boxShadow: '0 20px 50px rgba(var(--water-rgb), 0.1)' }}>
              <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                <h3 style={{ fontSize: '2rem', color: 'var(--water)', marginBottom: '1rem', textShadow: '0 0 18px rgba(var(--water-rgb), 0.35)' }}>Piercing the Veil with SAR</h3>
                <p style={{ color: 'var(--text)', lineHeight: 1.7, fontSize: '1.1rem' }}>
                  Enter <strong>NISAR</strong>. By utilizing L-band Synthetic Aperture Radar (SAR), we emit active microwave pulses that punch straight through the densest clouds and rain. The radar backscatter reveals the precise boundary between land and water. For the first time, we can track morphodynamic river shifts in <strong>real-time</strong>, regardless of weather.
                </p>
              </div>
              <div style={{ flex: '1 1 300px', height: '200px', background: 'linear-gradient(45deg, var(--surface-2), var(--panel-elevated))', borderRadius: '16px', position: 'relative', overflow: 'hidden', border: '1px solid var(--water)' }}>
                <div style={{ position: 'absolute', top: 0, bottom: 0, width: '4px', background: 'var(--water)', left: '50%', boxShadow: '0 0 20px var(--water)', animation: 'scanline 2s infinite linear' }} />
                <style>{`@keyframes scanline { 0% { left: 0%; } 100% { left: 100%; } }`}</style>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <span style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 20px var(--water))' }}><Radio size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', margin: '0 4px' }} /><Waves size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', margin: '0 4px' }} /></span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Jaw-dropping Crew Section */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--s8)' }}>
            <div style={{ display: 'inline-block', padding: '4px 16px', background: 'rgba(var(--fg-rgb), 0.05)', border: '1px solid rgba(var(--fg-rgb), 0.1)', color: 'var(--text-3)', borderRadius: '20px', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2rem' }}>
              The Architects
            </div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', color: 'var(--text)', fontWeight: 800 }}>Meet the Crew</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
              {[
                { name: 'Sabbir Ahmed', role: 'Mission Commander', desc: 'System Architecture & AI Pipeline', initials: 'SA' },
                { name: 'Sanjid Talukder', role: 'Data Scientist', desc: 'SAR Processing & Remote Sensing', initials: 'ST' },
                { name: 'Sakibul Hassan Shovon', role: 'Frontend Engineer', desc: 'Interactive Visualization & UX', initials: 'SH' },
                { name: 'Yasin Arafat', role: 'Hydro Analyst', desc: 'River Dynamics & Quality Assurance', initials: 'YA' }
              ].map((member, i) => (
                <div key={member.name} className="crew-card" style={{
                  position: 'relative',
                  background: 'linear-gradient(145deg, rgba(var(--panel-rgb), 0.92), rgba(var(--panel-rgb), 0.78))',
                  border: '1px solid var(--line)',
                  padding: '3rem 2rem',
                  borderRadius: '24px',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  overflow: 'hidden',
                  animation: `fade-in-up 0.8s forwards ${i * 0.15}s`,
                  opacity: 0,
                  transform: 'translateY(20px)'
                }}>
                  <div className="crew-glow" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', height: '4px', background: 'transparent', transition: 'background 0.5s' }} />
                  <div style={{ 
                    width: '90px', height: '90px', borderRadius: '50%', 
                    background: 'rgba(var(--fg-rgb), 0.03)',
                    border: '2px solid rgba(var(--fg-rgb), 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.2rem', fontWeight: 900, color: 'var(--text)',
                    marginBottom: '1.5rem',
                    transition: 'all 0.5s',
                    position: 'relative',
                    zIndex: 2
                  }} className="crew-avatar">
                    {member.initials}
                  </div>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '8px', letterSpacing: '0.05em', color: 'var(--text)', zIndex: 2 }}>{member.name}</h3>
                  <div style={{ color: 'var(--water)', fontSize: '0.92rem', textTransform: 'uppercase', fontWeight: 800, marginBottom: '12px', letterSpacing: '1px', zIndex: 2 }}>{member.role}</div>
                  <div style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.5, zIndex: 2 }}>{member.desc}</div>
                </div>
              ))}
            </div>
            <style>{`
              .crew-card:hover {
                transform: translateY(-10px) scale(1.02) !important;
                border-color: rgba(var(--water-rgb), 0.3) !important;
                box-shadow: 0 20px 40px rgba(var(--shadow-rgb), 0.6), 0 0 40px rgba(var(--water-rgb), 0.1) !important;
              }
              .crew-card:hover .crew-glow {
                background: var(--water) !important;
                box-shadow: 0 0 20px var(--water);
              }
              .crew-card:hover .crew-avatar {
                border-color: var(--water) !important;
                color: var(--water) !important;
                background: rgba(var(--water-rgb), 0.1) !important;
                text-shadow: 0 0 15px var(--water);
                transform: scale(1.1);
              }
              @keyframes fade-in-up {
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </div>
        </div>
      </div>

      {/* ── Existing Data Sources Section ── */}
      <div className="page-content page-content--narrow" style={{ paddingBottom: 'var(--s8)' }}>
        <div className="divider" style={{ marginBottom: 'var(--s6)' }} />
        
        <div className="section-label">
          Data & Sources
        </div>
        <h1 style={{ marginBottom: 'var(--s3)' }}>Where the Data Comes From</h1>
        <p>
          Every observation, measurement, and validation check in FluviSAR traces to a
          named, citable dataset. This page documents the complete data provenance — what we use,
          why, and from whom.
        </p>

        {/* ── Data Provenance Flow ── */}
        <div style={{ margin: 'var(--s6) 0' }}>
          <h2 style={{ marginBottom: 'var(--s3)' }}>Data Flow</h2>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--s2)',
              alignItems: 'center',
              fontFamily: 'var(--font-num)',
              fontSize: 'var(--text-xs)',
              lineHeight: 2,
            }}
          >
            {[
              'NASA NISAR Satellite',
              'ASF DAAC Download',
              'AOI Clip & Preprocess',
              'Water Classification',
              'Stage Matching',
              'Change Detection',
              'QC Validation',
              'Bundle Generation',
              'Web Application',
            ].map((step, i, arr) => (
              <span key={step} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--s2)' }}>
                <span
                  style={{
                    padding: '4px 12px',
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-md)',
                    color: i === 0 ? 'var(--water)' : 'var(--text-2)',
                  }}
                >
                  {step}
                </span>
                {i < arr.length - 1 && (
                  <span style={{ color: 'var(--text-3)' }}>→</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* ── Detailed Data Sources ── */}
        <h2 style={{ marginBottom: 'var(--s4)' }}>Data Sources</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
          {SOURCES.map((s) => (
            <div
              key={s.name}
              className="card"
              style={{ borderLeft: '3px solid var(--border-accent)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--s3)', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-md)', marginBottom: 2 }}>{s.name}</h3>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--water)', fontWeight: 500 }}>
                    {s.role}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-num)', fontSize: 'var(--text-xs)', color: 'var(--text-3)' }}>
                  {s.provider}
                </div>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--s3)', marginBottom: 0 }}>
                {s.desc}
              </p>
              {s.doi && (
                <a
                  href={`https://doi.org/${s.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    marginTop: 'var(--s2)',
                    fontFamily: 'var(--font-num)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--water)',
                    opacity: 0.8,
                  }}
                >
                  DOI: {s.doi} ↗
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="divider" />

        {/* ── SAR Concepts ── */}
        <h2 style={{ marginBottom: 'var(--s2)' }}>SAR Concepts Used in This Project</h2>
        <p>
          These concepts from{' '}
          <a
            href="https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar"
            target="_blank"
            rel="noopener noreferrer"
          >
            NASA Earthdata's SAR resource
          </a>{' '}
          are directly relevant to how FluviSAR processes and interprets NISAR data.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)', marginTop: 'var(--s4)' }}>
          {SAR_CONCEPTS.map((c) => (
            <details
              key={c.term}
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-md)',
                padding: 0,
              }}
            >
              <summary
                style={{
                  padding: 'var(--s4)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 'var(--text-md)',
                  color: 'var(--text)',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {c.term}
                <span style={{ color: 'var(--text-3)', fontSize: 'var(--text-sm)' }}>▼</span>
              </summary>
              <div style={{ padding: '0 var(--s4) var(--s4)', borderTop: '1px solid var(--line)' }}>
                <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--s3)' }}>{c.explanation}</p>
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--water)',
                    padding: 'var(--s3)',
                    background: 'var(--water-dim)',
                    borderRadius: 'var(--r-md)',
                    borderLeft: '2px solid var(--water)',
                    marginBottom: 0,
                  }}
                >
                  <strong>In this project:</strong> {c.relevance}
                </div>
              </div>
            </details>
          ))}
        </div>

        <div className="divider" />

        {/* ── Honest Disclosure ── */}
        <h2 style={{ marginBottom: 'var(--s3)' }}>Disclosure</h2>
        <div className="card" style={{ background: 'var(--surface-2)' }}>
          <p style={{ fontSize: 'var(--text-sm)', margin: 0 }}>
            <strong>Built for NASA Space Apps Challenge 2026 — "Dancing with the SARs"</strong>. 
            Pipeline and UI code assisted by AI coding tools. Every scientific number
            shown in the app resolves to <code>manifest.json</code>, generated by the offline
            pipeline from the sources listed above — no number in this app is hand-typed.
          </p>
        </div>

        {/* ── NASA Earthdata Reference ── */}
        <div style={{ marginTop: 'var(--s5)', textAlign: 'center' }}>
          <a
            href="https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar"
            target="_blank"
            rel="noopener noreferrer"
            className="badge"
            style={{ textDecoration: 'none' }}
          >
            <Radio size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', margin: '0 4px' }} /> Read the full NASA Earthdata SAR Resource →
          </a>
        </div>
      </div>
    </div>
  );
}
