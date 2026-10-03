const fs = require('fs');

const lightThemeCSS = `
[data-theme="light"] {
  --bg: #F8FAFC;
  --map-bg: #E2E8F0;
  --panel: #FFFFFF;
  --line: #CBD5E1;
  --line-strong: #94A3B8;
  
  --text: #0F172A;
  --text-2: #334155;
  --text-3: #64748B;
  
  --water: #0EA5E9;
  --water-strong: #0284C7;
  
  --glass-bg: rgba(255, 255, 255, 0.72);
  --glass-border: rgba(14, 165, 233, 0.15);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(14, 165, 233, 0.1);
  
  --glow-water: 0 0 20px rgba(14, 165, 233, 0.15);
  
  --panel-elevated: #F1F5F9;
  --panel-hover: #E2E8F0;
  --surface: #FFFFFF;
  --surface-2: #F8FAFC;
  
  --navbar-bg: rgba(255, 255, 255, 0.85);
  
  /* Background gradients */
  --gradient-hero: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #F8FAFC 100%);
  --gradient-card: linear-gradient(180deg, rgba(14, 165, 233, 0.02) 0%, transparent 100%);
}
`;

fs.appendFileSync('src/styles/tokens.css', lightThemeCSS);
console.log('Appended light theme to tokens.css');
