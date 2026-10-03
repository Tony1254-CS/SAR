const fs = require('fs');
let content = fs.readFileSync('src/pages/Cases.tsx', 'utf8');

// Reduce fixed height
content = content.replace(/height: 380px;/g, "height: 280px;");

// Reduce padding on the cards
content = content.replace(/padding: 2.5rem;/g, "padding: 1.5rem;");

// Fix margin-top on the verdict badge so it's not pushed so far down
content = content.replace(/margin-top: 2rem;/g, "margin-top: 1rem;");

// Inject watermark icon in the front card
const frontCardStart = '<div className="flip-card-front" style={{ borderTop: `3px solid ${color}` }}>';
const frontCardWithWatermark = `${frontCardStart}
                  {/* Subtle Background Watermark */}
                  <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05, transform: 'scale(8)', pointerEvents: 'none' }}>
                    {meta?.icon}
                  </div>`;
content = content.replace(frontCardStart, frontCardWithWatermark);

fs.writeFileSync('src/pages/Cases.tsx', content);
console.log('Made flip cards smaller and added watermark');
