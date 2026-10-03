import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useStore } from '../state/store';
import {
  addStaticSources,
  ensureReachLayers,
  updateRadarWaterImage,
  setChangeLayersVisible,
  setWaterVisible,
  ensureAmbiguousLayer,
} from './bundleLayers';

export function CompareSwipe({ primaryMap }: { primaryMap: maplibregl.Map | null }) {
  const { compare, reachId, reach, bounds, layers, cinematicMode, setCompare } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const secondaryMapRef = useRef<maplibregl.Map | null>(null);
  const [secondaryLoaded, setSecondaryLoaded] = useState(false);
  const [position, setPosition] = useState(50);
  const isDragging = useRef(false);

  useEffect(() => {
    if (cinematicMode) {
      if (!compare.active) {
        const dates = useStore.getState().reach?.dates;
        if (dates && dates.length > 1) {
          setCompare({ active: true, t0: dates[0].date, t1: dates[dates.length - 1].date });
        }
      }
      let start: number | null = null;
      let reqId: number;
      const animate = (time: number) => {
        if (!start) start = time;
        const elapsed = time - start;
        const p = (Math.sin(elapsed / 1500) + 1) / 2 * 100; // smooth sine wave bounce
        setPosition(p);
        reqId = requestAnimationFrame(animate);
      };
      reqId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(reqId);
    }
  }, [cinematicMode, compare.active, setCompare]);

  useEffect(() => {
    if (!compare.active || !containerRef.current || !primaryMap) return;

    if (!secondaryMapRef.current) {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: primaryMap.getCenter(),
        zoom: primaryMap.getZoom(),
        interactive: false,
        attributionControl: false,
      });
      secondaryMapRef.current = map;
      map.on('load', () => {
        addStaticSources(map);
        setSecondaryLoaded(true);
      });
    }

    const primary = primaryMap;
    const secondary = secondaryMapRef.current;
    const syncMaps = () => {
      secondary?.jumpTo({
        center: primary.getCenter(),
        zoom: primary.getZoom(),
        bearing: primary.getBearing(),
        pitch: primary.getPitch(),
      });
    };
    primary.on('move', syncMaps);
    syncMaps();

    return () => {
      primary.off('move', syncMaps);
    };
  }, [compare.active, primaryMap]);

  useEffect(() => {
    if (!compare.active && secondaryMapRef.current) {
      secondaryMapRef.current.remove();
      secondaryMapRef.current = null;
      setSecondaryLoaded(false);
    }
  }, [compare.active]);

  // Right half shows t1 (Section 21.1: "map enters CompareSwipe (left t0, right t1)").
  useEffect(() => {
    const map = secondaryMapRef.current;
    if (!map || !secondaryLoaded || !reach || !bounds || !reachId || !compare.t1) return;
    const baseUrl = `/data/v1/${reachId}`;
    if (!map.getSource('radar-source')) {
      ensureReachLayers(map, { baseUrl, bounds, bbox: reach.bbox, initialDate: compare.t1 });
      if (compare.t0) ensureAmbiguousLayer(map, { baseUrl, bounds, t0: compare.t0, t1: compare.t1 });
    } else {
      updateRadarWaterImage(map, baseUrl, compare.t1);
    }
  }, [secondaryLoaded, reach, bounds, reachId, compare.t0, compare.t1]);

  // Keep the secondary (right/"after") map's layer visibility in sync with the
  // LayerToggles buttons — it has its own set of layers, separate from the
  // primary map, so it needs its own effect (Section 22.1 layer stack).
  useEffect(() => {
    const map = secondaryMapRef.current;
    if (!map || !secondaryLoaded) return;
    setWaterVisible(map, layers.water);
    setChangeLayersVisible(map, {
      erosion: layers.erosion,
      accretion: layers.accretion,
      ambiguous: layers.ambiguous,
    });
  }, [secondaryLoaded, layers.water, layers.erosion, layers.accretion, layers.ambiguous]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.parentElement!.getBoundingClientRect();
    let newPos = ((e.clientX - rect.left) / rect.width) * 100;
    newPos = Math.max(0, Math.min(100, newPos));
    setPosition(newPos);
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setPosition((p) => Math.max(0, p - 5));
    if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + 5));
  }, []);

  if (!compare.active) return null;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          clipPath: `inset(0 0 0 ${position}%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        role="slider"
        aria-valuenow={position}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${position}%`,
          // Hit target is much wider than the visible line (below) -- a 4px
          // wide drag handle is nearly impossible to grab with a real mouse.
          width: 32,
          marginLeft: -16,
          cursor: 'col-resize',
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: 4,
            marginLeft: -2,
            background: 'var(--line-strong)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            width: 24,
            height: 48,
            background: 'var(--panel)',
            border: '1px solid var(--line-strong)',
            borderRadius: 'var(--r)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly',
          }}
        >
          <div style={{ width: 1, height: 16, background: 'var(--text-3)' }} />
          <div style={{ width: 1, height: 16, background: 'var(--text-3)' }} />
        </div>
      </div>

      {/* Pinned to the slider (not a fixed corner) so they stay in the visible
          half regardless of where the divider sits or how wide the left
          info panel overlay is (Section 21.1 -- map spans full width, the
          panel just paints over the left portion of it). */}
      <div style={{
        position: 'absolute', top: 12, left: `${position}%`, transform: 'translateX(calc(-100% - 10px))',
        background: 'var(--bg)', padding: '4px 8px', color: 'var(--text)', zIndex: 10, fontSize: '0.92rem', whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}>
        Before: {compare.t0}
      </div>
      <div style={{
        position: 'absolute', top: 12, left: `${position}%`, transform: 'translateX(10px)',
        background: 'var(--bg)', padding: '4px 8px', color: 'var(--text)', zIndex: 10, fontSize: '0.92rem', whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}>
        After: {compare.t1}
      </div>
    </div>
  );
}
