const fs = require('fs');

const landingPath = 'src/pages/Landing.tsx';
let landing = fs.readFileSync(landingPath, 'utf8');

// The regex matches everything from <style> to </style>
const styleRegex = /<style>\s*\{`([\s\S]*?)`\}\s*<\/style>/;
const match = landing.match(styleRegex);

if (match) {
  const cssContent = match[1];
  
  // Append to base.css
  fs.appendFileSync('src/styles/base.css', '\n/* Global Background Styles from Landing */\n' + cssContent);
  
  // Remove the style block from Landing.tsx
  landing = landing.replace(styleRegex, '');
  
  // Remove the divs from Landing.tsx
  landing = landing.replace(/<div className="elegant-bg" \/>\s*<div className="grid-mesh" \/>\s*<div className="radar-light" \/>/, '');
  
  // Also remove the inline backgroundColor from section
  landing = landing.replace(/backgroundColor: '#000000', /, '');
  
  fs.writeFileSync(landingPath, landing);
  console.log('Successfully extracted styles and divs.');
} else {
  console.log('Could not find style block.');
}
