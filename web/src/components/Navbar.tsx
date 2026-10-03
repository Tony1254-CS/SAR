import { useState, useEffect } from 'react';
import { AlertTriangle, Brain, Microscope, FileText, Volume2, Wrench, Sun, Moon, Menu, MapPin, BookOpen, Users, LogIn } from 'lucide-react';
import { useStore } from '../state/store';
import { TABS } from '../panels/EvidenceTabs';
import '../styles/navbar.css';

interface NavbarProps {
  /** Transparent background until scroll (use on Landing page) */
  transparent?: boolean;
  /** Show reach selector + observation metadata (use on /app page) */
  showReachInfo?: boolean;
  /** Reach selector items */
  reaches?: { reach_id: string; name: string }[] | null;
  /** Currently selected reach */
  reachId?: string | null;
  /** Callback when reach changes */
  onReachChange?: (id: string) => void;
  /** Latest data info */
  dataInfo?: string;
}

export function Navbar({
  transparent = false,
  showReachInfo = false,
  reaches,
  reachId,
  onReachChange,
  dataInfo,
}: NavbarProps) {
  const { sensoryMode, setSensoryMode, cinematicMode, setCinematicMode, layers, setLayers, setAnalysisMode, setAnalysisModeType, setAnalysisActiveTab, setAnalysisStepIndex, setAnalysisState, setAnalysisSplit, theme, toggleTheme } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState(
    <><Volume2 size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Audio</>
  );

  const path = typeof window !== 'undefined' ? window.location.pathname : '/';

  const handleBanglaVoice = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setVoiceStatus(<><Volume2 size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Audio</>);
      return;
    }
    
    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find(v => v.lang.toLowerCase().includes('bn'));
    
    let msg: SpeechSynthesisUtterance;
    if (bnVoice) {
      msg = new SpeechSynthesisUtterance("যমুনা নদীর এই অংশে বিশাল ভাঙন শনাক্ত করা হয়েছে। স্যাটেলাইট ডেটা ব্যবহার করে এটি নিশ্চিত করা হয়েছে। দয়া করে সতর্ক হোন।");
      msg.lang = 'bn-BD';
      msg.voice = bnVoice;
      setVoiceStatus(<><Volume2 size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Playing...</>);
    } else {
      msg = new SpeechSynthesisUtterance("Severe erosion detected in this section of the Jamuna River. Satellite data confirms this anomaly. Please alert local authorities.");
      msg.lang = 'en-US';
      setVoiceStatus(<><Volume2 size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Playing...</>);
    }
    
    msg.onend = () => setVoiceStatus(<><Volume2 size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Audio</>);
    msg.onerror = () => setVoiceStatus(<><Volume2 size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Audio</>);
    
    window.speechSynthesis.speak(msg);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navClass = [
    'navbar',
    scrolled ? 'navbar--scrolled' : '',
    transparent && !scrolled ? 'navbar--transparent' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const isActive = (href: string) => {
    if (href === '/' && path === '/') return true;
    if (href !== '/' && path.startsWith(href)) return true;
    return false;
  };

  const linkClass = (href: string) =>
    `navbar__link${isActive(href) ? ' navbar__link--active' : ''}`;

  return (
    <>
      <nav className={navClass} role="navigation" aria-label="Primary">
        <div className="navbar__left">
          {/* Brand */}
          <a href="/" className="navbar__brand" aria-label="FluviSAR — Home">
            <span className="navbar__brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" stroke="var(--water)" strokeOpacity="0.6" />
                <path d="M12 2 L12 4 M12 20 L12 22 M2 12 L4 12 M20 12 L22 12" stroke="var(--water)" strokeOpacity="0.4" />
                <circle cx="12" cy="12" r="3" fill="var(--water)" fillOpacity="0.2" stroke="var(--water)" />
                <path d="M12 9 Q15 12 12 15 Q9 12 12 9" fill="var(--water)" fillOpacity="0.3" />
              </svg>
            </span>
            <span className="navbar__brand-text">FLUVISAR</span>
          </a>

          {/* Nav links (hidden on /app to save space on laptops) */}
          {!showReachInfo && (
            <div className={`navbar__nav${mobileOpen ? ' navbar__nav--open' : ''}`}>
              <a href="/impact" className={linkClass('/impact')} style={{ color: '#E4572E', textShadow: '0 0 10px rgba(228,87,46,0.3)', fontWeight: 'bold' }}>
                <AlertTriangle size={18} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Insights
              </a>
              <a href="/cases" className={linkClass('/cases')}>
                Investigations
              </a>
              <a href="/intelligence" className={linkClass('/intelligence')} style={{ color: 'var(--water)', textShadow: '0 0 10px rgba(var(--water-rgb), 0.3)' }}>
                <Brain size={18} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> ML Intelligence
              </a>
              <a href="/sar-lab" className={linkClass('/sar-lab')} style={{ color: 'var(--pass)', textShadow: '0 0 10px rgba(127,191,142,0.3)' }}>
                <Microscope size={18} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> SAR Lab
              </a>
              <a href="/methods" className={linkClass('/methods')}>
                Methods
              </a>
              <a href="/about" className={linkClass('/about')}>
                About Us
              </a>
              <a href="/report" className="navbar__btn" style={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-fg)', padding: '4px 12px', fontSize: '0.9rem', marginLeft: '8px', textDecoration: 'none' }}>
                <FileText size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Report
              </a>
            </div>
          )}

          {/* On /app the bar is too crowded for inline links, so the normal site navigation lives in a Menu dropdown */}
          {showReachInfo && (
            <div className="navbar__dropdown navbar__dropdown--left">
              <button className="navbar__btn">
                <Menu size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Menu ▾
              </button>
              <div className="navbar__dropdown-content">
                <a href="/impact"><AlertTriangle size={16} /> Insights</a>
                <a href="/cases"><MapPin size={16} /> Investigations</a>
                <a href="/intelligence"><Brain size={16} /> ML Intelligence</a>
                <a href="/sar-lab"><Microscope size={16} /> SAR Lab</a>
                <a href="/methods"><BookOpen size={16} /> Methods</a>
                <a href="/about"><Users size={16} /> About Us</a>
                <a href="/report"><FileText size={16} /> Report</a>
                <a href="/auth"><LogIn size={16} /> Sign in</a>
              </div>
            </div>
          )}

          {/* Reach selector (only on /app) */}
          {showReachInfo && reaches && reaches.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                aria-label="Select investigation reach"
                value={reachId ?? ''}
                onChange={(e) => onReachChange?.(e.target.value)}
                className="navbar__reach-select"
              >
                {reaches.map((r) => (
                  <option key={r.reach_id} value={r.reach_id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => useStore.getState().setCinematicDesc(!useStore.getState().showCinematicDesc)}
                className="navbar__btn"
                style={{ background: 'rgba(var(--water-rgb), 0.1)', border: '1px solid var(--water)', color: 'var(--water)', padding: '6px 10px', fontSize: '0.82rem', display: 'flex', gap: '6px', alignItems: 'center' }}
                title="Cinematic HUD Description"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                Info
              </button>
            </div>
          )}
        </div>

        <div className="navbar__right">
          {/* Data status */}
          {dataInfo && (
            <span className="navbar__status" title="Data freshness">
              <span className="navbar__status-dot" />
              {dataInfo}
            </span>
          )}

          {/* Extra PRD Features and Trigger for Agentic Workflow (only on /app page) */}
          {showReachInfo && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              
              {/* Tool Group Dropdown */}
              <div className="navbar__dropdown">
                <button className="navbar__btn">
                  <Wrench size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Tools ▾
                </button>
                <div className="navbar__dropdown-content">
                  <button onClick={handleBanglaVoice} title="Bangla Voice Report">
                    {voiceStatus}
                  </button>
                  <button onClick={() => setLayers({ earthquakes: !layers.earthquakes })} title="NASA EONET Seismic Activity">
                    {layers.earthquakes ? '✓ ' : ''}Earthquakes
                  </button>
                  <button onClick={() => setSensoryMode(!sensoryMode)} title="Haptic & Audio Pixel Inspector">
                    {sensoryMode ? '✓ ' : ''}Sensory Inspector
                  </button>
                  <button onClick={() => setCinematicMode(!cinematicMode)} title="Auto-Narrated Mission Briefing">
                    {cinematicMode ? '✓ ' : ''}Mission Briefing
                  </button>
                  <button onClick={() => setLayers({ forecast: !layers.forecast })} title="Erosion & Accretion Forecast">
                    {layers.forecast ? '✓ ' : ''}Forecast Model
                  </button>
                  <button onClick={() => setLayers({ risk: !layers.risk })} title="Predictive Risk Heatmap" style={{ color: 'var(--erosion)' }}>
                    {layers.risk ? '✓ ' : ''}Predictive Risk
                  </button>
                </div>
              </div>

              {/* Evidence Tabs Dropdown */}
              <div className="navbar__dropdown">
                <button className="navbar__btn" style={{ borderColor: 'rgba(var(--water-rgb), 0.3)', color: 'var(--water)' }}>
                  Evidence ▾
                </button>
                <div className="navbar__dropdown-content">
                  {TABS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setAnalysisMode(true);
                        setAnalysisModeType('SINGLE');
                        setAnalysisActiveTab(t.id);
                        setAnalysisState('PROCESSING');
                        setAnalysisSplit(false);
                      }}
                      title={t.hint}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              

              <div style={{ width: 1, height: 24, background: 'rgba(var(--fg-rgb), 0.2)', margin: '0 4px' }} />

              <button
                onClick={() => {
                  setAnalysisMode(true);
                  setAnalysisModeType('FULL');
                  setAnalysisStepIndex(0);
                  setAnalysisActiveTab(TABS[0].id);
                  setAnalysisState('PROCESSING');
                  setAnalysisSplit(false);
                }}
                className="navbar__btn navbar__btn--primary"
                style={{ padding: '6px 16px', marginLeft: '4px', fontSize: '0.86rem' }}
              >
                <span style={{ marginRight: 6 }}>●</span> Live Analysis
              </button>
            </div>
          )}

          <button onClick={toggleTheme} className="navbar__btn" style={{ marginLeft: showReachInfo ? '16px' : '0', padding: '6px' }} title="Toggle Light/Dark Theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {!showReachInfo && (
            <a href="/auth" className="navbar__btn">
              Sign in
            </a>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="navbar__toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
        </button>
      </nav>
    </>
  );
}
