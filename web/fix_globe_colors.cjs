const fs = require('fs');

// Fix 1: Convert VERDICT_COLOR to hex in Cases.tsx so WebGL can parse them
let casesPath = 'src/pages/Cases.tsx';
let casesContent = fs.readFileSync(casesPath, 'utf8');

casesContent = casesContent.replace("SUPPORTED: 'var(--pass)'", "SUPPORTED: '#7FBF8E'");
casesContent = casesContent.replace("LIMITED: 'var(--warn)'", "LIMITED: '#E0B34A'");
casesContent = casesContent.replace("INCONCLUSIVE: 'var(--fail)'", "INCONCLUSIVE: '#E4572E'");
casesContent = casesContent.replace("?? 'var(--text-3)'", "?? '#6F7880'"); // Fallback

fs.writeFileSync(casesPath, casesContent);

// Fix 2: Zoom in the globe in InteractiveGlobe.tsx
let globePath = 'src/components/InteractiveGlobe.tsx';
let globeContent = fs.readFileSync(globePath, 'utf8');

globeContent = globeContent.replace("altitude: 2.5", "altitude: 1.6"); // Zoomed in
globeContent = globeContent.replace("size: 0.6", "size: 1.2"); // Make points bigger so they are clearly visible
globeContent = globeContent.replace("pointAltitude={0.06}", "pointAltitude={0.1}"); // Make points float slightly higher

// We need to also increase the point sizes passed from Cases.tsx
casesContent = fs.readFileSync(casesPath, 'utf8');
casesContent = casesContent.replace("size: 0.6", "size: 1.5");
fs.writeFileSync(casesPath, casesContent);

// Also make arc thickness bigger in globe
globeContent = globeContent.replace("arcStroke={0.5}", "arcStroke={1.0}");

fs.writeFileSync(globePath, globeContent);

console.log('Fixed WebGL colors and zoomed globe in!');
