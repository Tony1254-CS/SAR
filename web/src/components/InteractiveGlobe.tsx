import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { useStore } from '../state/store';

interface GlobePoint {
  lat: number;
  lng: number;
  label: string;
  color: string;
  size: number;
}

interface InteractiveGlobeProps {
  points: GlobePoint[];
  /** Fill the parent box (used as a hero background) instead of a fixed 85% aspect box */
  fill?: boolean;
  /** Always use the night-lights texture, ignoring the site theme */
  night?: boolean;
}

export function InteractiveGlobe({ points, fill = false, night = false }: InteractiveGlobeProps) {
  const globeRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });
  const theme = useStore(s => s.theme);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateDimensions = () => {
      const rect = el.getBoundingClientRect();
      setDimensions({ width: rect.width, height: fill ? rect.height : Math.min(rect.width * 0.85, 600) });
    };
    updateDimensions();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateDimensions) : null;
    ro?.observe(el);
    window.addEventListener('resize', updateDimensions);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [fill]);

  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      controls.enableZoom = !fill;
      controls.minDistance = 200;
      controls.maxDistance = 500;

      // Set initial camera position to show South Asia
      globeRef.current.pointOfView({ lat: 23, lng: 90, altitude: fill ? 1.25 : 1.6 }, 1000);
    }
  }, []);

  return (
    <div ref={containerRef} style={fill ? { position: 'absolute', inset: 0 } : { width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={!night && theme === 'light' ? "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg" : "//unpkg.com/three-globe/example/img/earth-night.jpg"}
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        atmosphereColor="#39C4D9"
        atmosphereAltitude={0.2}
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.01}
        pointRadius="size"
        pointLabel="label"
        arcsData={[]}
      />
    </div>
  );
}
