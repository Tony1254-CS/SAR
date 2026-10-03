const fs = require('fs');
let methods = fs.readFileSync('src/pages/Methods.tsx', 'utf8');

// Replace MainBox component
const newMainBox = `function MainBox({ title, description, icon, color, onClick, delay }: { title: string, description: string, icon: ReactNode, color: string, onClick: () => void, delay: number }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? \`linear-gradient(135deg, rgba(28, 34, 40, 0.8) 0%, rgba(18, 22, 26, 0.9) 100%)\` : 'rgba(18, 22, 26, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: isHovered ? color : 'rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '2rem',
        cursor: 'pointer',
        boxShadow: isHovered ? \`0 12px 40px \${color}30, inset 0 0 20px \${color}10\` : '0 8px 32px rgba(0,0,0,0.4)',
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        height: '100%',
        animation: \`fadeSlideUp 0.6s var(--ease-out) \${delay}s forwards\`,
        opacity: 0,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle background glow blob on hover */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '150px',
        height: '150px',
        background: color,
        filter: 'blur(80px)',
        opacity: isHovered ? 0.3 : 0,
        transition: 'opacity 0.6s ease',
        pointerEvents: 'none'
      }} />

      <div style={{ 
        fontSize: '40px', 
        marginBottom: '0.5rem', 
        color: isHovered ? color : 'var(--text-3)',
        filter: isHovered ? \`drop-shadow(0 0 15px \${color}80)\` : 'none',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'scale(1.15) rotate(-5deg)' : 'scale(1) rotate(0deg)',
        transformOrigin: 'left center',
        zIndex: 1
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: isHovered ? '#ffffff' : 'var(--text)', margin: 0, transition: 'color 0.3s ease', zIndex: 1 }}>{title}</h3>
      <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', lineHeight: 1.7, margin: 0, flex: 1, fontWeight: 400, zIndex: 1 }}>{description}</p>
      
      {/* Map Layers styled button */}
      <div style={{
        marginTop: '1.5rem',
        alignSelf: 'flex-start',
        padding: '8px 18px',
        background: isHovered ? \`\${color}15\` : 'rgba(255, 255, 255, 0.03)',
        border: '1px solid',
        borderColor: isHovered ? color : 'rgba(255, 255, 255, 0.1)',
        color: isHovered ? color : 'var(--text-2)',
        fontSize: '0.9rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        borderRadius: '100px',
        boxShadow: isHovered ? \`0 0 15px \${color}20\` : 'none',
        zIndex: 1
      }}>
        View Details 
        <span style={{ 
          transform: isHovered ? 'translateX(6px)' : 'none', 
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: isHovered ? 1 : 0.6
        }}>→</span>
      </div>
    </div>
  );
}`;

// Use regex to replace MainBox
methods = methods.replace(/function MainBox\([\s\S]*?function Modal/m, newMainBox + '\n\nfunction Modal');

// Replace style block to add grid
methods = methods.replace(/@keyframes slideUpModal {[\s\S]*?}/, (match) => {
  return match + `
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
        }`;
});

// Replace grid div
methods = methods.replace(/<div style=\{\{ display: 'grid', gridTemplateColumns: 'repeat\(auto-fill, minmax\(320px, 1fr\)\)', gap: 'var\(--s6\)', marginTop: 'var\(--s8\)' \}\}>/, '<div className="methods-grid">');

fs.writeFileSync('src/pages/Methods.tsx', methods);
console.log('Methods updated');
