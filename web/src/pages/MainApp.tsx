import { MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { useDeepLink } from '../state/useDeepLink';
import { MapStage } from '../map/MapStage';
import { Hydrograph } from '../hydrograph/Hydrograph';
import { StoryPanel } from '../panels/StoryPanel';
import { EvidencePanel } from '../panels/EvidencePanel';
import { QCPanel } from '../panels/QCPanel';
import { TopBar } from '../TopBar';
import { Loading } from '../states/Loading';
import { ErrorState } from '../states/ErrorState';
import { fetchReaches, loadReachBundle, DataLoadError } from '../data/load';
import type { ReachListItem } from '../data/types';
import { EvidenceTabs } from '../panels/EvidenceTabs';
import { FullscreenHUD } from '../panels/FullscreenHUD';
import { ChatWidget } from '../chat/ChatWidget';
import { CinematicDescription } from '../components/CinematicDescription';

type LoadStatus = 'loading' | 'ready' | 'empty' | 'error';

export default function MainApp() {
  const { reachId, selectedFeatureId, panel, setReachId, loadBundle, analysisMode, analysisSplit, setAnalysisMode, setAnalysisSplit, analysisState, analysisActiveTab, analysisModeType, inspectMode, setInspectMode, chatOpen, cinematicMode } = useStore();
  const [reaches, setReaches] = useState<ReachListItem[] | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [errorFile, setErrorFile] = useState('reaches.json');
  const [retryToken, setRetryToken] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showInspectTooltip, setShowInspectTooltip] = useState(true);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useDeepLink();

  // Bootstrap: load the reach catalog once, then default to the first reach
  // unless a deep link already selected one (Section 20.1/21.1 Empty state).
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetchReaches()
      .then((list) => {
        if (cancelled) return;
        setReaches(list);
        const deepLinkedReach = useStore.getState().reachId;
        if (deepLinkedReach) {
          // A deep link (Section 20.1) may point at a reach not yet in the
          // picker list; let the per-reach fetch below decide if it exists.
          return;
        }
        if (list.length === 0) {
          setStatus('empty');
          return;
        }
        setReachId(list[0].reach_id);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setErrorFile('reaches.json');
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [retryToken, setReachId]);

  useEffect(() => {
    if (!reachId) return;
    let cancelled = false;
    setStatus('loading');
    loadReachBundle(reachId)
      .then((bundle) => {
        if (cancelled) return;
        loadBundle(reachId, bundle);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setErrorFile(err instanceof DataLoadError ? err.message : 'bundle');
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [reachId, retryToken, loadBundle]);

  return (
    <div className={`main-app-container ${chatOpen ? 'chat-open' : ''} ${inspectMode ? 'inspect-mode' : ''}`}>
      {/* Global Toast for Inspect Mode */}
      {inspectMode && (
        <div className="inspect-toast">
          Mode ON: Click on any highlighted box to start chatting
        </div>
      )}

      <TopBar reaches={reaches} />
      <div className="navbar-spacer" style={{ flexShrink: 0 }} />
      <div className={`main-app-content ${analysisSplit ? 'split-active' : ''}`}>
        <div className="print-hide map-container-area" style={{ flex: 1, position: 'relative' }}>
          {status === 'loading' && <Loading />}
        {status === 'empty' && (
          <div style={{ padding: 'var(--s6)', color: 'var(--text-2)' }}>
            No processed reach in this bundle.{' '}
            <a href="/methods" style={{ color: 'var(--water)' }}>
              See Methods / how to reproduce
            </a>
          </div>
        )}
        {status === 'error' && (
          <ErrorState filename={errorFile} onRetry={() => setRetryToken((t) => t + 1)} />
        )}
        {status === 'ready' && (
          <>
            <MapStage />
            {!analysisSplit && !cinematicMode && <StoryPanel />}
            {selectedFeatureId && !cinematicMode && <EvidencePanel />}
            {panel === 'qc' && !cinematicMode && <QCPanel />}
            
            {/* Agentic Workflow Panel */}
            {analysisMode && !analysisSplit && (
              <div className="agentic-panel">
                <EvidenceTabs />
              </div>
            )}
          </>
        )}
        </div>
        
        {/* The Split Screen Report (Right Half) */}
        {analysisSplit && status === 'ready' && (
          <div id="report-container" className="report-container">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s6)' }} className="print-hide">
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <h2 style={{ color: 'var(--water)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                   {analysisModeType === 'FULL' ? 'Full Analysis Report' : `${analysisActiveTab ? analysisActiveTab.charAt(0).toUpperCase() + analysisActiveTab.slice(1) : 'Analysis'} Report`}
                 </h2>
                 <button onClick={() => window.print()} className="agentic-action-btn" style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                   Download PDF
                 </button>
                 <div style={{ position: 'relative' }}>
                   <button 
                     onClick={() => { setInspectMode(!inspectMode); setShowInspectTooltip(false); }}
                     style={{ background: inspectMode ? 'var(--water)' : 'transparent', color: inspectMode ? '#000' : 'var(--water)', border: '1px solid var(--water)', padding: '6px 12px', borderRadius: 16, fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s', boxShadow: inspectMode ? 'none' : '0 0 10px rgba(var(--water-rgb), 0.3)', animation: inspectMode ? 'none' : 'pulse-border 2s infinite' }}
                   >
                     {inspectMode ? <><MessageSquare size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', margin: '0 4px' }} /> Exit Chat Mode</> : <><MessageSquare size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', margin: '0 4px' }} /> Chat with Data</>}
                   </button>
                   {showInspectTooltip && !inspectMode && (
                     <div style={{ position: 'absolute', top: '120%', right: 0, width: 220, background: 'var(--water)', color: '#000', padding: 8, borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, animation: 'fade-in 0.5s', zIndex: 100 }}>
                       <div style={{ position: 'absolute', top: -4, right: 24, width: 8, height: 8, background: 'var(--water)', transform: 'rotate(45deg)' }} />
                       Want to know more? Click here to ask AI about any data!
                     </div>
                   )}
                 </div>
               </div>
               <button onClick={() => { setAnalysisMode(false); setAnalysisSplit(false); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
             </div>
             
             {/* We render EvidenceTabs here but force it to look like a final report without the floating panel wrapper */}
             <div className="report-mode">
               <EvidenceTabs isReportMode />
             </div>
          </div>
        )}
      </div>
      <div className="print-hide hydrograph-wrapper">
        {status === 'ready' ? (
          <Hydrograph 
             width={chatOpen && windowWidth >= 1024 ? windowWidth * 0.7 : windowWidth} 
             height={windowWidth <= 480 ? 100 : windowWidth <= 767 ? 120 : 150} 
          />
        ) : (
          <div className="hydrograph-skeleton" style={{ height: '100%', background: 'var(--bg)' }} />
        )}
      </div>

      {analysisState === 'PROCESSING' && <FullscreenHUD tab={analysisActiveTab} />}

      {/* AI Chat Assistant */}
      {status === 'ready' && <ChatWidget />}
      <CinematicDescription />
    </div>
  );
}
