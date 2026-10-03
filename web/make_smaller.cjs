const fs = require('fs');
let content = fs.readFileSync('src/pages/Methods.tsx', 'utf8');

// Reduce box padding
content = content.replace(/padding: '2rem',/g, "padding: '1.25rem',");

// Reduce gap between items
content = content.replace(/gap: '1rem',/g, "gap: '0.75rem',");

// Reduce fonts
content = content.replace(/fontSize: '1.5rem',/g, "fontSize: '1.15rem',");
content = content.replace(/fontSize: '1.05rem',/g, "fontSize: '0.85rem',");
content = content.replace(/fontSize: '40px',/g, "fontSize: '28px',");

// Adjust grid spacing
content = content.replace(/gap: 2rem;/g, "gap: 1.25rem;");
content = content.replace(/margin-top: 4rem;/g, "margin-top: 1.5rem;");

// Button padding
content = content.replace(/padding: '8px 18px',/g, "padding: '6px 14px',");
content = content.replace(/fontSize: '0.9rem',/g, "fontSize: '0.8rem',");

fs.writeFileSync('src/pages/Methods.tsx', content);
console.log('Made boxes smaller.');
