const fs = require('fs');
let content = fs.readFileSync('src/pages/Methods.tsx', 'utf8');

const correctStyleBlock = `      {/* Inline styles for animations */}
      <style>{\`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .methods-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin-top: 4rem;
        }
        @media (min-width: 768px) {
          .methods-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .bg-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--water-dim) 0%, transparent 70%);
          top: -200px;
          right: -200px;
          opacity: 0.5;
          pointer-events: none;
          z-index: 0;
          animation: fadeIn 2s ease-out forwards;
        }
      \`}</style>`;

// Replace from {/* Inline styles to </style>
content = content.replace(/\{\/\*\s*Inline styles[\s\S]*?<\/style>/, correctStyleBlock);

fs.writeFileSync('src/pages/Methods.tsx', content);
console.log('Fixed CSS syntax');
