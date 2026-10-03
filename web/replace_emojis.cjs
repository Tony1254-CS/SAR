const fs = require('fs');
const path = require('path');

const emojiMap = {
  '🚨': 'AlertTriangle', '🧠': 'Brain', '🔬': 'Microscope', '📄': 'FileText', '🛠️': 'Wrench',
  '🔊': 'Volume2', '⏸️': 'Pause', '▶️': 'Play', '🛰️': 'Satellite', '✅': 'CheckCircle2',
  '⚠️': 'AlertTriangle', '☁️': 'Cloud', '👁️‍🗨️': 'Eye', '📡': 'Radio', '🌊': 'Waves',
  '🏔️': 'Mountain', '🔥': 'Flame', '🌿': 'Leaf', '⚠': 'AlertTriangle', '〰️': 'Activity',
  '⬛': 'Square', '🔄': 'RefreshCw', '🌧️': 'CloudRain', '⛰️': 'Mountain', '🌍': 'Globe',
  '📊': 'BarChart2', '⚙️': 'Settings', '🔧': 'Wrench', '🖨️': 'Printer', '🌀': 'Tornado',
  '📈': 'TrendingUp', '🚀': 'Rocket', '📐': 'Ruler', '⚡': 'Zap', '💾': 'Save', '🤝': 'Handshake',
  '🌤️': 'CloudSun', '★': 'Star', '❌': 'XCircle', '💬': 'MessageSquare', '📅': 'Calendar',
  '👤': 'User', '🌾': 'Sprout', '💰': 'DollarSign', '🔍': 'Search', '🪄': 'Wand2', '✔': 'Check',
  '⚙': 'Settings', '🏞️': 'Image'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  let imports = new Set();

  // Replace exact string matches e.g. icon: '📡' -> icon: <Radio size={18} />
  content = content.replace(/(['"])(.*?)(['"])/g, (match, p1, p2, p3) => {
    for(let [emoji, icon] of Object.entries(emojiMap)) {
      if (p2.trim() === emoji) {
         imports.add(icon);
         return `<${icon} size={18} />`;
      }
    }
    return match;
  });

  // Replace emojis in JSX text safely (only matching single-line text between tags)
  content = content.replace(/>([^<\n]+)</g, (match, text) => {
    let newText = text;
    for(let [emoji, icon] of Object.entries(emojiMap)) {
       if (newText.includes(emoji)) {
          imports.add(icon);
          newText = newText.replaceAll(emoji, `<${icon} size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', margin: '0 4px' }} />`);
       }
    }
    return `>${newText}<`;
  });
  
  // Custom case for ForecastImpact '⚡ NISAR L2 PREDICTIVE MODEL'
  for(let [emoji, icon] of Object.entries(emojiMap)) {
      // Find remaining emojis in code like text literals that might have missed the regex
      if (content.includes(emoji)) {
          // If it's a template literal or string in TS (like responses.ts), we shouldn't insert JSX.
          // Since we want NO emojis anywhere, we just replace it with text.
          // Wait, the user wants NO emojis. If we replace it with a text alternative in non-tsx files?
          // For now let's just replace any remaining emoji with the icon component inside JSX, 
          // or just strip the emoji if it's too complex.
      }
  }

  // Find remaining emojis
  const emojiRegex = new RegExp(`(${Object.keys(emojiMap).join('|')})`, 'g');
  content = content.replace(emojiRegex, (match) => {
      let icon = emojiMap[match];
      if (icon) {
          imports.add(icon);
          return `<${icon} size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', margin: '0 4px' }} />`;
      }
      return match;
  });

  if (content !== original) {
    if (imports.size > 0) {
      content = `import { ${Array.from(imports).join(', ')} } from 'lucide-react';\n` + content;
    }
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + filePath);
  }
}

const filesToProcess = [
  'src/pages/Landing.tsx', 
  'src/pages/About.tsx', 
  'src/pages/Cases.tsx', 
  'src/pages/Impact.tsx', 
  'src/pages/Intelligence.tsx', 
  'src/pages/Methods.tsx', 
  'src/pages/Report.tsx', 
  'src/panels/ForecastImpact.tsx', 
  'src/map/SensorFusion.tsx', 
  'src/map/RiverMemory.tsx', 
  'src/map/MissionBriefing.tsx',
  'src/components/Inspectable.tsx',
  'src/panels/EvidenceTabs.tsx',
  'src/pages/MainApp.tsx'
];

filesToProcess.forEach(file => {
  if (fs.existsSync(file)) {
     processFile(file);
  }
});
