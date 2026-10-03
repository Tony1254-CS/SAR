const fs = require('fs');

let content = fs.readFileSync('src/pages/Cases.tsx', 'utf8');

const replacement = `      {/* Inline styles for 3D Flip and 2x2 Grid */}
      <style>{\`
        .cases-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--s5);
        }
        @media (min-width: 768px) {
          .cases-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        .flip-card-container {
          background-color: transparent;
          width: 100%;
          height: 380px;
          perspective: 1500px;
          cursor: pointer;
        }
        
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: left;
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          transform-style: preserve-3d;
        }
        
        .flip-card-container:hover .flip-card-inner {
          transform: rotateY(180deg);
        }
        
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: var(--r-lg);
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--line);
        }
        
        .flip-card-front {
          background: rgba(18, 22, 26, 0.7);
          backdrop-filter: blur(16px);
          z-index: 2;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }
        
        .flip-card-back {
          background: rgba(10, 14, 18, 0.95);
          backdrop-filter: blur(24px);
          transform: rotateY(180deg);
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 1rem;
        }
        
        .flip-card-container:hover .flip-card-front {
           box-shadow: 0 12px 40px rgba(0,0,0,0.5);
        }
        
        .case-front-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .case-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }
        
        .case-subtitle {
          font-size: 1.1rem;
          color: var(--text-2);
          margin-bottom: auto;
        }
        
        .front-verdict {
          font-size: 1rem;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 100px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          align-self: flex-start;
          border: 1px solid;
          margin-top: 2rem;
        }
        
        .back-desc {
          font-size: 1.1rem;
          line-height: 1.6;
          color: var(--text);
        }
        
        .back-meta-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-3);
          font-size: 0.95rem;
          font-family: var(--font-num);
        }
        
        .open-btn {
          margin-top: auto;
          background: rgba(255,255,255,0.05);
          color: var(--text);
          padding: 12px 24px;
          border-radius: 100px;
          text-align: center;
          font-weight: 600;
          transition: all 0.3s;
          border: 1px solid rgba(255,255,255,0.1);
          text-decoration: none;
        }
        
        .open-btn:hover {
          background: rgba(255,255,255,0.15);
          transform: translateY(-2px);
        }
      \`}</style>

      <div className="cases-grid">
        {activeReaches.map((r, i) => {
          const meta = LOCATION_META[r.reach_id];
          const color = VERDICT_COLOR[r.verdict] ?? 'var(--text-3)';
          const icon = VERDICT_ICON[r.verdict] ?? '·';

          return (
            <div 
              key={r.reach_id} 
              className="flip-card-container"
              style={{ animationDelay: \`\${0.1 * i}s\`, animation: \`fade-in-up 0.5s var(--ease-out) \${0.1 * i}s both\` }}
            >
              <div className="flip-card-inner">
                
                {/* ── Front of Card ── */}
                <div className="flip-card-front" style={{ borderTop: \`3px solid \${color}\` }}>
                  <div className="case-card__type" style={{ marginBottom: '1.5rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    <span style={{ color: color }}>{meta?.icon ?? <Radio size={18} />}</span>
                    {meta?.changeType ?? 'Surface Change'} · {meta?.region ?? 'Global'}
                  </div>
                  
                  <div className="case-front-content">
                    <div className="case-title">{r.name}</div>
                    <div className="case-subtitle">{r.river}</div>
                    
                    <div className="front-verdict" style={{ color: color, borderColor: \`\${color}40\`, backgroundColor: \`\${color}10\` }}>
                      {icon} {r.verdict}
                    </div>
                  </div>
                </div>

                {/* ── Back of Card ── */}
                <div className="flip-card-back" style={{ border: \`1px solid \${color}50\`, boxShadow: \`inset 0 0 60px \${color}10\` }}>
                  <div className="back-desc">
                    {meta?.description ?? 'No description available for this case.'}
                  </div>
                  
                  <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '1rem 0' }} />
                  
                  <div className="back-meta-item">
                    <Radio size={18} color={color} /> NISAR L-band SAR Analysis
                  </div>
                  <div className="back-meta-item">
                    <span style={{fontSize: '18px', filter:\`drop-shadow(0 0 4px \${color})\`}}>📍</span> 
                    BBox: {r.bbox.map(n => n.toFixed(2)).join(', ')}
                  </div>
                  <div className="back-meta-item">
                    <span style={{fontSize: '18px', filter:\`drop-shadow(0 0 4px \${color})\`}}>🕐</span> 
                    Data Date: {r.data_frozen_at.split('T')[0]}
                  </div>
                  
                  <a href={\`/app?reach=\${r.reach_id}\`} className="open-btn" style={{ borderColor: \`\${color}50\`, color: '#fff', backgroundColor: \`\${color}20\` }}>
                    Open Investigation →
                  </a>
                </div>

              </div>
            </div>
          );
        })}
      </div>`;

// Replace <div className="cases-grid"> to </div>
content = content.replace(/<div className="cases-grid">[\s\S]*?<\/div>\s*\{\/\*\s*════ Info Footer ════\s*\*\/\}/, replacement + '\n\n      {/* ════ Info Footer ════ */}');

fs.writeFileSync('src/pages/Cases.tsx', content);
console.log('Flippable cards added!');
