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
}

export function InteractiveGlobe({ points }: InteractiveGlobeProps) {
  const globeRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });
  const theme = useStore(s => s.theme);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: Math.min(rect.width * 0.85, 600) });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      controls.enableZoom = true;
      controls.minDistance = 200;
      controls.maxDistance = 500;

      // Set initial camera position to show South Asia
      globeRef.current.pointOfView({ lat: 23, lng: 90, altitude: 1.6 }, 1000);
    }
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={theme === 'light' ? "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg" : "//unpkg.com/three-globe/example/img/earth-night.jpg"}
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
