const fs = require('fs');
let baseCss = fs.readFileSync('src/styles/base.css', 'utf8');

// Fix positioning for background elements
baseCss = baseCss.replace(/\.elegant-bg\s*\{[\s\S]*?\}/, (match) => {
    return match.replace('position: absolute;', 'position: fixed;').replace('z-index: 0;', 'z-index: -3;');
});
baseCss = baseCss.replace(/\.grid-mesh\s*\{[\s\S]*?\}/, (match) => {
    return match.replace('position: absolute;', 'position: fixed;').replace('z-index: 1;', 'z-index: -2;');
});
baseCss = baseCss.replace(/\.radar-light\s*\{[\s\S]*?\}/, (match) => {
    return match.replace('position: absolute;', 'position: fixed;').replace('z-index: 1;', 'z-index: -2;');
});

fs.writeFileSync('src/styles/base.css', baseCss);
console.log('Fixed background positions.');
