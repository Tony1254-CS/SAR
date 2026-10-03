const fs = require('fs');
let content = fs.readFileSync('src/pages/Cases.tsx', 'utf8');

// 1. Add InteractiveGlobe import
if (!content.includes('InteractiveGlobe')) {
  content = content.replace(
    "import '../styles/globe.css';",
    "import '../styles/globe.css';\nimport { InteractiveGlobe } from '../components/InteractiveGlobe';"
  );
}

// 2. Replace the entire world-map section with 3D Globe
const worldMapStart = `{/* ════ World Map ════ */}`;
const worldMapEnd = `{/* ════ Error State ════ */}`;

const worldMapRegex = /\{\/\*\s*════ World Map ════\s*\*\/\}[\s\S]*?\{\/\*\s*════ Error State ════\s*\*\/\}/;

const globeReplacement = `{/* ════ 3D Globe ════ */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 var(--s5)',
        position: 'relative'
      }}>
        <div style={{
          background: 'rgba(10, 14, 18, 0.4)',
          borderRadius: 'var(--r-lg)',
          border: '1px solid rgba(57, 196, 217, 0.1)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <InteractiveGlobe 
            points={activeReaches.map(r => {
              const meta = LOCATION_META[r.reach_id];
              if (!meta) return null;
              // Convert mapX (0-100 % of equirectangular) to lng (-180 to 180)
              const lng = (meta.mapX / 100) * 360 - 180;
              // Convert mapY (0-100 % from top) to lat (90 to -90)
              const lat = 90 - (meta.mapY / 100) * 180;
              return {
                lat,
                lng,
                label: r.name,
                color: VERDICT_COLOR[r.verdict] ?? '#6F7880',
                size: 0.6,
              };
            }).filter(Boolean) as any}
          />
        </div>
      </div>

      {/* ════ Error State ════ */}`;

content = content.replace(worldMapRegex, globeReplacement);

fs.writeFileSync('src/pages/Cases.tsx', content);
console.log('3D Globe integrated!');
