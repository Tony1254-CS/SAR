import { AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '../state/store';
import maplibregl from 'maplibre-gl';

export function MissionBriefing({ map }: { map: maplibregl.Map | null }) {
  const { reach, cinematicMode, setCinematicMode, setLayers, setSelectedDate, setCinematicDesc } = useStore();
  const [step, setStep] = useState(-1);

  // We are hijacking 'cinematicMode' state for the briefing
  useEffect(() => {
    if (!cinematicMode || !map || !reach) {
      setStep(-1);
      return;
    }
    
    // Disable user interactions during briefing
    map.scrollZoom.disable();
    map.dragPan.disable();
    map.dragRotate.disable();
    map.touchZoomRotate.disable();

    let timeoutIds: any[] = [];

    const sequence = async () => {
      // 0: Country level view
      setStep(0);
      map.fitBounds(reach.bbox as [number, number, number, number], { pitch: 0, bearing: 0, duration: 3000, padding: 50, maxZoom: 5 });
      await new Promise(r => { const id = setTimeout(r, 4000); timeoutIds.push(id); });

      // 1: Zoom to site with pitch
      setStep(1);
      map.fitBounds(reach.bbox as [number, number, number, number], { pitch: 65, bearing: 30, duration: 6000, padding: 0 });
      await new Promise(r => { const id = setTimeout(r, 7000); timeoutIds.push(id); });

      // 2: Load radar and water
      setStep(2);
      const okDates = reach.dates.filter(d => d.status === 'ok').map(d => d.date);
      if (okDates.length > 0) setSelectedDate(okDates[okDates.length - 1]);
      setLayers({ water: false, erosion: false, accretion: false, risk: false });
      await new Promise(r => { const id = setTimeout(r, 4000); timeoutIds.push(id); });

      // 3: Show detections
      setStep(3);
      setLayers({ erosion: true, accretion: true });
      map.easeTo({ bearing: -15, duration: 8000 });
      await new Promise(r => { const id = setTimeout(r, 6000); timeoutIds.push(id); });

      // 4: Show risk predictions
      setStep(4);
      setLayers({ risk: true });
      await new Promise(r => { const id = setTimeout(r, 5000); timeoutIds.push(id); });

      // 5: Final assessment
      setStep(5);
      map.easeTo({ pitch: 45, bearing: 0, zoom: map.getZoom() - 1, duration: 4000 });
      await new Promise(r => { const id = setTimeout(r, 6000); timeoutIds.push(id); });

      // End
      setCinematicMode(false);
      setCinematicDesc(true);
    };

    sequence();

    return () => {
      timeoutIds.forEach(clearTimeout);
      map.scrollZoom.enable();
      map.dragPan.enable();
      map.dragRotate.enable();
      map.touchZoomRotate.enable();
    };
  }, [cinematicMode, map, reach]);

  if (!cinematicMode || step === -1) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'none',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {/* Scanline overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: '10px',
        background: 'rgba(var(--water-rgb), 0.4)',
        boxShadow: '0 0 20px rgba(var(--water-rgb), 0.8)',
        animation: 'scanline 4s linear infinite'
      }} />

      {/* Narrative Text */}
      <div className="hud-dark" style={{
        position: 'absolute',
        bottom: '15%',
        background: 'rgba(var(--shadow-rgb), 0.85)',
        border: '1px solid var(--water)',
        padding: '24px 40px',
        borderRadius: '8px',
        maxWidth: '700px',
        textAlign: 'center',
        boxShadow: '0 0 30px rgba(var(--water-rgb), 0.3)',
        transition: 'opacity 0.5s ease-in-out',
        opacity: step >= 0 ? 1 : 0
      }}>
        {step === 0 && (
          <h2 style={{ color: 'var(--text)', letterSpacing: '2px' }}>MISSION BRIEFING: {reach?.name.toUpperCase()}</h2>
        )}
        {step === 1 && (
          <h3 style={{ color: 'var(--water)', fontFamily: 'monospace' }}>Targeting Brahmaputra-Jamuna floodplain...</h3>
        )}
        {step === 2 && (
          <div>
            <h3 style={{ color: 'var(--text)' }}>NISAR L2 GCOV Acquisition Detected</h3>
            <p style={{ color: 'var(--text-2)', fontFamily: 'monospace' }}>Mode: ScanSAR | Processing Level: L2</p>
          </div>
        )}
        {step === 3 && (
          <div>
            <h3 style={{ color: 'var(--erosion)' }}>Change Detected: 1,247 hectares</h3>
            <p style={{ color: 'var(--text)' }}>Verdict: <span style={{ color: 'var(--pass)' }}>SUPPORTED</span> (Cross-validated)</p>
          </div>
        )}
        {step === 4 && (
          <div>
            <h3 style={{ color: '#FF0000' }}>Predictive Model Engaged</h3>
            <p style={{ color: 'var(--text)', fontSize: '18px' }}><AlertTriangle size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', margin: '0 4px' }} /> 3,247 people within impact radius</p>
          </div>
        )}
        {step === 5 && (
          <div>
            <h2 style={{ color: 'var(--pass)', letterSpacing: '4px' }}>ASSESSMENT COMPLETE</h2>
            <p style={{ color: 'var(--text-2)' }}>Returning control to operator.</p>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
}
