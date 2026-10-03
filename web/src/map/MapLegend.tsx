import { useStore } from '../state/store';

export function MapLegend() {
  const { compare, layers } = useStore();

  return (
    <div style={{
      position: 'absolute',
      bottom: '24px',
      right: '24px',
      background: 'var(--panel)',
      padding: 'var(--s3)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r)'
    }}>
      <h4 style={{ marginBottom: 'var(--s2)' }}>Legend</h4>
      
      {!compare.active ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: 'linear-gradient(90deg, #000, #fff)', border: '1px solid var(--line)' }}></span>
            <span>Radar: water looks dark, land looks bright.</span>
          </div>
          {layers.water && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', marginTop: 'var(--s1)' }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--water)', opacity: 0.55 }}></span>
              <span>Water</span>
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--erosion)' }}></span>
            <span>Land lost to water (Erosion)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', marginTop: 'var(--s1)' }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--accretion)' }}></span>
            <span>Water turned to land (Accretion)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', marginTop: 'var(--s1)' }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--ambiguous)', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(var(--shadow-rgb), 0.2) 2px, rgba(var(--shadow-rgb), 0.2) 4px)' }}></span>
            <span>Ambiguous / excluded</span>
          </div>
        </>
      )}
      
      {layers.forecast && (
        <div style={{ marginTop: 'var(--s2)', paddingTop: 'var(--s1)', borderTop: '1px solid var(--line)', animation: 'fadeInUp 0.3s ease-out' }}>
          <h5 style={{ margin: '0 0 var(--s1) 0', color: '#9b59b6' }}>Forecast Prediction</h5>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ff0000', opacity: 0.4, border: '1px solid #ff0000' }}></span>
            <span>Erosion Risk</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', marginTop: '4px' }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f1c40f', opacity: 0.4, border: '1px solid #f1c40f' }}></span>
            <span>Accretion Risk</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', marginTop: '4px' }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: '#95a5a6', opacity: 0.3, border: '1px solid #7f8c8d' }}></span>
            <span>Ambiguity</span>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
