const fs = require('fs');

// 1. Fix base.css
let baseCss = fs.readFileSync('src/styles/base.css', 'utf8');
baseCss = baseCss.replace(/body\s*\{[\s\S]*?background-color:\s*var\(--bg\);/, (match) => match.replace('background-color: var(--bg);', 'background-color: transparent;'));
baseCss = baseCss.replace(/\.page-container\s*\{[\s\S]*?background:\s*var\(--bg\);/, (match) => match.replace('background: var(--bg);', 'background: transparent;'));
baseCss = baseCss.replace(/\.report-container\s*\{[\s\S]*?background:\s*var\(--bg\);/, (match) => match.replace('background: var(--bg);', 'background: var(--panel);'));
baseCss = baseCss.replace(/\.main-app-container\s*\{[\s\S]*?background:\s*var\(--bg\);/g, (match) => match.replace('background: var(--bg);', 'background: transparent;'));
fs.writeFileSync('src/styles/base.css', baseCss);

// 2. Fix inline backgrounds in pages
const replaceInline = (file, search, replacement) => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(search, replacement);
        fs.writeFileSync(file, content);
    }
};

replaceInline('src/pages/SARLab.tsx', /background:\s*'var\(--bg\)'/, `background: 'transparent'`);
replaceInline('src/pages/Intelligence.tsx', /backgroundColor:\s*'var\(--bg\)'/, `backgroundColor: 'transparent'`);
replaceInline('src/pages/Methods.tsx', /background:\s*'var\(--bg\)'/, `background: 'transparent'`);
replaceInline('src/pages/Auth.tsx', /background:\s*'var\(--bg\)'/, `background: 'transparent'`);

console.log('Background styles updated.');
