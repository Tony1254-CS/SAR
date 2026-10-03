import { Pause, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '../state/store';

export function RiverMemory() {
  const { reach, selectedDate, setSelectedDate, layers } = useStore();
  const [playing, setPlaying] = useState(false);
  
  // Auto-pause if we switch off the water layer
  useEffect(() => {
    if (!layers.water && playing) {
      setPlaying(false);
    }
  }, [layers.water, playing]);

  useEffect(() => {
    if (!playing || !reach?.dates || reach.dates.length < 2) return;
    
    const okDates = reach.dates.filter(d => d.status === 'ok').map(d => d.date);
    if (okDates.length < 2) return;

    let currentIndex = okDates.indexOf(selectedDate || okDates[0]);
    if (currentIndex === -1) currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % okDates.length;
      setSelectedDate(okDates[currentIndex]);
      // If we hit the end, stop playing
      if (currentIndex === okDates.length - 1) {
        setPlaying(false);
      }
    }, 1500); // 1.5 seconds per frame

    return () => clearInterval(interval);
  }, [playing, reach, selectedDate, setSelectedDate]);

  if (!reach) return null;
  const okDates = reach.dates.filter(d => d.status === 'ok').map(d => d.date);
  if (okDates.length < 2) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'auto',
      minWidth: '320px',
      background: 'rgba(var(--panel-rgb), 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(var(--water-rgb), 0.3)',
      borderRadius: '24px',
      padding: '8px 16px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '16px',
      zIndex: 200,
      boxShadow: '0 8px 32px rgba(var(--shadow-rgb), 0.6)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h4 style={{ margin: 0, color: 'var(--text)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em' }}>
          TIME LAPSE
        </h4>
      </div>
        <div style={{ fontSize: '12.5px', color: 'var(--water)', fontFamily: 'monospace', marginLeft: 'auto', marginRight: 16 }}>
          {selectedDate}
        </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <button 
          onClick={() => {
            const current = useStore.getState();
            if (!current.layers.water) {
              current.setLayers({ water: true });
            }
            setPlaying(!playing);
          }}
          style={{
            background: playing ? 'rgba(var(--fg-rgb), 0.1)' : 'var(--water)',
            color: playing ? '#fff' : '#000',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            transition: 'all 0.2s'
          }}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        
        <div style={{ flex: 1, position: 'relative', height: '4px', background: 'rgba(var(--fg-rgb), 0.2)', borderRadius: '2px' }}>
          {okDates.map((date, i) => {
            const isSelected = date === selectedDate;
            const left = `${(i / (okDates.length - 1)) * 100}%`;
            return (
              <div 
                key={date}
                onClick={() => { setPlaying(false); setSelectedDate(date); }}
                style={{
                  position: 'absolute',
                  left,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: isSelected ? '14px' : '8px',
                  height: isSelected ? '14px' : '8px',
                  background: isSelected ? 'var(--water)' : '#888',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 0 10px var(--water)' : 'none',
                  transition: 'all 0.2s',
                  zIndex: isSelected ? 2 : 1
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
