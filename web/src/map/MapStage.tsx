import { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useStore } from '../state/store';
import {
  addStaticSources,
  ensureReachLayers,
  updateRadarWaterImage,
  setWaterVisible,
  setChangeLayersVisible,
  ensureAmbiguousLayer,
  setTerrainEnabled,
} from './bundleLayers';
import { FlyIn } from './FlyIn';
import { OutsideCoverage } from '../states/OutsideCoverage';
import { MapLegend } from './MapLegend';
import { CompareSwipe } from './CompareSwipe';
import { RiverMemory } from './RiverMemory';
import { MissionBriefing } from './MissionBriefing';
import { SensorFusion } from './SensorFusion';

export function MapStage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isOutside, setIsOutside] = useState(false);
  const [terrainOn, setTerrainOn] = useState(false);
  const flownRef = useRef(false);
  const reachLayersReadyRef = useRef(false);
  const displayedDateRef = useRef<string | null>(null);

  const { reachId, reach, bounds, selectedDate, compare, layers, sensoryMode } = useStore();

  // Mount the map once.
  useEffect(() => {
    if (mapContainer.current && !mapRef.current) {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          name: 'SAR Dark Satellite',
          sources: {
            'esri-satellite': {
              type: 'raster',
              tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              ],
              tileSize: 256,
              maxzoom: 18,
              attribution: 'Esri, Maxar, Earthstar Geographics'
            }
          },
          layers: [
            {
              id: 'background',
              type: 'background',
              paint: { 'background-color': '#070A0C' }
            },
            {
              id: 'satellite-tiles',
              type: 'raster',
              source: 'esri-satellite',
              paint: {
                'raster-opacity': 0.85,
                'raster-saturation': -0.3,
                'raster-contrast': 0.15
              }
            }
          ]
        },
        center: [89.7, 24.5],
        zoom: 6,
      });
      mapRef.current = map;

      map.on('load', () => {
        addStaticSources(map);
        setMapInstance(map);
        setMapLoaded(true);
      });

      map.on('move', () => {
        const bbox = useStore.getState().reach?.bbox;
        if (!bbox) return;
        const center = map.getCenter();
        const [w, s, e, n] = bbox;
        const pad = 0.045; // ~5km
        const outside = center.lng < w - pad || center.lng > e + pad || center.lat < s - pad || center.lat > n + pad;
        setIsOutside(outside);
      });
    }

    const handleCinematicFly = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { longitude, latitude, zoom, pitch, bearing, resetBounds } = customEvent.detail;
      
      if (resetBounds && mapRef.current) {
        mapRef.current.fitBounds(resetBounds as [number, number, number, number], { padding: 0 });
        mapRef.current.zoomTo(mapRef.current.getZoom() + 2.5, { duration: 1500 });
        mapRef.current.easeTo({ pitch: 0, bearing: 0, duration: 1500 });
      } else {
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom, pitch: pitch || 0, bearing: bearing || 0, speed: 0.5, curve: 1 });
      }
    };

    window.addEventListener('cinematic-fly', handleCinematicFly);

    return () => {
      window.removeEventListener('cinematic-fly', handleCinematicFly);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Fly in once, as soon as we know the reach's AOI.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !reach || flownRef.current) return;
    flownRef.current = true;
    new FlyIn(map, reach.bbox as [number, number, number, number]).start();
  }, [mapLoaded, reach]);

  // Add per-reach sources/layers once bounds + an initial date are known.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !reach || !bounds || !selectedDate) return;
    const baseUrl = `/data/v1/${reachId}`;

    if (!reachLayersReadyRef.current) {
      ensureReachLayers(map, { baseUrl, bounds, bbox: reach.bbox, initialDate: selectedDate });
      reachLayersReadyRef.current = true;
      displayedDateRef.current = selectedDate;

      const interactiveLayers = ['layer-8-erosion', 'layer-7-accretion'];
      
      interactiveLayers.forEach(layerId => {
        map.on('click', layerId, (e) => {
          const f = e.features?.[0];
          if (f) useStore.getState().setSelectedFeatureId(String(f.properties?.id));
        });
        map.on('mouseenter', layerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
        });
      });
    }
  }, [mapLoaded, reach, bounds, selectedDate, reachId]);

  // Reset per-reach layer state when the reach changes.
  useEffect(() => {
    reachLayersReadyRef.current = false;
    flownRef.current = false;
    displayedDateRef.current = null;
  }, [reachId]);

  // Radar/water image swaps: browse mode shows selectedDate; compare mode
  // shows t0 on the primary (left) map (Section 21.1 interaction table).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !reachId || !reachLayersReadyRef.current) return;
    const date = compare.active && compare.t0 ? compare.t0 : selectedDate;
    if (!date || date === displayedDateRef.current) return;
    displayedDateRef.current = date;
    updateRadarWaterImage(map, `/data/v1/${reachId}`, date);
  }, [mapLoaded, reachId, selectedDate, compare.active, compare.t0]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    setWaterVisible(map, layers.water);
  }, [mapLoaded, layers.water]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    // Assume setEarthquakeLayerVisible is exported from bundleLayers
    import('./bundleLayers').then(({ setEarthquakeLayerVisible, setPredictionLayerVisible, setRiskLayerVisible }) => {
      setEarthquakeLayerVisible(map, layers.earthquakes);
      setPredictionLayerVisible(map, layers.forecast);
      setRiskLayerVisible(map, layers.risk);
    });
  }, [mapLoaded, layers.earthquakes, layers.forecast, layers.risk]);

  // Handle prediction clicks
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    
    const clickHandler = (e: any) => {
      const f = e.features?.[0];
      if (!f) return;
      const p = f.properties;
      let title = 'Forecast';
      let color = '#999';
      if (p.type === 'erosion_risk') { title = 'Erosion Risk'; color = '#ff0000'; }
      else if (p.type === 'accretion_risk') { title = 'Accretion Risk'; color = '#f1c40f'; }
      else if (p.type === 'ambiguity') { title = 'Ambiguity / Uncertainty'; color = '#95a5a6'; }
      
      new maplibregl.Popup({ closeButton: true })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="padding:4px; color:#111; font-family:var(--font-base);">
            <h4 style="margin:0 0 8px 0; color:${color}; font-size:14px;">${title}</h4>
            <div style="margin-bottom:4px;"><b>Probability:</b> ${p.probability}%</div>
            <div style="margin-bottom:4px;"><b>Reasoning:</b> ${p.reason}</div>
            <div style="font-size:12.5px; color:#666; margin-top:8px;">AI Prediction Model</div>
          </div>
        `)
        .addTo(map);
    };

    const mouseEnterHandler = () => { map.getCanvas().style.cursor = 'pointer'; };
    const mouseLeaveHandler = () => { map.getCanvas().style.cursor = ''; };

    const layers = ['layer-13-predict-erosion', 'layer-13-predict-accretion', 'layer-13-predict-ambiguity'];
    layers.forEach(layer => {
      map.on('click', layer, clickHandler);
      map.on('mouseenter', layer, mouseEnterHandler);
      map.on('mouseleave', layer, mouseLeaveHandler);
    });

    return () => {
      layers.forEach(layer => {
        map.off('click', layer, clickHandler);
        map.off('mouseenter', layer, mouseEnterHandler);
        map.off('mouseleave', layer, mouseLeaveHandler);
      });
    };
  }, [mapLoaded]);

  // Handle earthquake clicks for descriptive popup
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    
    const clickHandler = (e: any) => {
      const f = e.features?.[0];
      if (!f || f.geometry.type !== 'Point') return;
      const coords = f.geometry.coordinates as [number, number];
      const p = f.properties;
      new maplibregl.Popup({ closeButton: true })
        .setLngLat(coords)
        .setHTML(`
          <div style="padding:4px; color:#111; font-family:var(--font-base);">
            <h4 style="margin:0 0 8px 0; color:#ff5a00; font-size:14px;">${p.title}</h4>
            <div style="margin-bottom:4px;"><b>Magnitude:</b> ${p.mag}</div>
            <div style="margin-bottom:4px;"><b>Date:</b> ${p.date}</div>
            <div style="font-size:12.5px; color:#666; margin-top:8px;">Source: NASA EONET API</div>
          </div>
        `)
        .addTo(map);
    };

    const mouseEnterHandler = () => { map.getCanvas().style.cursor = 'pointer'; };
    const mouseLeaveHandler = () => { map.getCanvas().style.cursor = ''; };

    map.on('click', 'layer-12-earthquakes', clickHandler);
    map.on('mouseenter', 'layer-12-earthquakes', mouseEnterHandler);
    map.on('mouseleave', 'layer-12-earthquakes', mouseLeaveHandler);

    return () => {
      map.off('click', 'layer-12-earthquakes', clickHandler);
      map.off('mouseenter', 'layer-12-earthquakes', mouseEnterHandler);
      map.off('mouseleave', 'layer-12-earthquakes', mouseLeaveHandler);
    };
  }, [mapLoaded]);

  // Change layers (erosion/accretion/ambiguous): show whenever toggled on.
  // Ambiguous layer still needs compare dates to be created.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !reachLayersReadyRef.current || !bounds || !reachId) return;
    if (compare.active && compare.t0 && compare.t1) {
      ensureAmbiguousLayer(map, { baseUrl: `/data/v1/${reachId}`, bounds, t0: compare.t0, t1: compare.t1 });
    }
    setChangeLayersVisible(map, {
      erosion: layers.erosion,
      accretion: layers.accretion,
      ambiguous: compare.active && layers.ambiguous,
    });
  }, [mapLoaded, compare.active, compare.t0, compare.t1, bounds, reachId, layers.erosion, layers.accretion, layers.ambiguous]);

  // Sensory Mode (Audio/Haptic Feedback)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (!sensoryMode) {
      map.getCanvas().style.cursor = '';
      return;
    }

    map.getCanvas().style.cursor = 'crosshair';
    let audioCtx: AudioContext | null = null;
    let lastFire = 0;

    const playTone = (freq: number) => {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.5, audioCtx.currentTime); // Increased volume from 0.05 to 0.5
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2); // Slower fade out
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } catch (e) {
        console.warn("AudioContext failed", e);
      }
    };

    const onMouseMove = (e: maplibregl.MapMouseEvent) => {
      const now = Date.now();
      if (now - lastFire < 80) return; // throttle

      const style = map.getStyle();
      if (!style) return;
      const validLayers = ['layer-8-erosion', 'layer-7-accretion', 'layer-6-water'].filter(l => map.getLayer(l));

      const features = validLayers.length > 0 ? map.queryRenderedFeatures(e.point, { layers: validLayers }) : [];
      lastFire = now;

      if (features.length > 0) {
        const type = features[0].layer.id;
        if (type === 'layer-8-erosion') {
          playTone(200); // Low warning tone
          if (navigator.vibrate) navigator.vibrate([30, 30, 30]);
        } else if (type === 'layer-7-accretion') {
          playTone(600); // High positive tone
          if (navigator.vibrate) navigator.vibrate(20);
        } else if (type === 'layer-6-water') {
          playTone(400); // Water tone
        }
      } else {
        // Default faint click for land (like a geiger counter)
        playTone(100);
      }
    };

    map.on('mousemove', onMouseMove);
    return () => {
      map.off('mousemove', onMouseMove);
      if (audioCtx) audioCtx.close().catch(() => {});
    };
  }, [mapLoaded, sensoryMode]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      <CompareSwipe primaryMap={mapInstance} />
      <RiverMemory />
      <SensorFusion />
      <MissionBriefing map={mapInstance} />
      {isOutside && (
        <OutsideCoverage
          onFlyBack={() => {
            if (reach) mapRef.current?.fitBounds(reach.bbox as [number, number, number, number], { padding: 20 });
          }}
        />
      )}
      {mapLoaded && (
        <button
          onClick={() => {
            const map = mapRef.current;
            if (!map) return;
            const next = !terrainOn;
            setTerrainOn(next);
            setTerrainEnabled(map, next);
          }}
          title="Terrain relief is a presentation layer (public elevation tiles) -- not a scientific measurement"
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 50,
            background: terrainOn ? 'var(--water)' : 'var(--panel)',
            color: terrainOn ? '#04222b' : 'var(--text)',
            border: '1px solid var(--line-strong)', borderRadius: 'var(--r)',
            padding: '5px 12px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: terrainOn ? 700 : 400,
          }}
        >
          {terrainOn ? '✓ 3D relief' : '3D relief'}
        </button>
      )}
      <MapLegend />
    </div>
  );
}
