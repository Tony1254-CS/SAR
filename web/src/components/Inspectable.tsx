import { Search } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../state/store';
import { classifyIntent } from '../chat/intents';
import { generateResponse } from '../chat/responses';

interface InspectableProps {
  children: React.ReactNode;
  intentKey: string;
  fallbackQuery?: string;
}

// Simple markdown-like bold renderer for the inline chat
function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function Inspectable({ children, intentKey, fallbackQuery }: InspectableProps) {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState<{role: string, text: string}[]>([]);
  const { reach, manifest, qc, stage, erosion, accretion, inspectMode } = useStore();

  const handleInspectClick = (e: React.MouseEvent) => {
    if (!inspectMode || expanded) return;
    e.stopPropagation();
    setExpanded(true);
    
    if (chatLog.length === 0) {
      // Simulate slight delay for the first explanation
      setTimeout(() => {
        const intent = classifyIntent(fallbackQuery || intentKey);
        const res = generateResponse(intent, { reach, manifest, qc, stage, erosion, accretion });
        setChatLog([{ role: 'ai', text: res.text }]);
      }, 300);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setChatLog(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    
    setTimeout(() => {
      const intent = classifyIntent(userText);
      const res = generateResponse(intent, { reach, manifest, qc, stage, erosion, accretion });
      setChatLog(prev => [...prev, { role: 'ai', text: res.text }]);
      
      if (res.mapAction) {
        window.dispatchEvent(new CustomEvent('chat-map-action', {
          detail: res.mapAction,
        }));
      }
    }, 600);
  };

  if (!inspectMode) {
    return <>{children}</>;
  }

  return (
    <div 
      className={`inspectable-wrapper ${expanded ? 'expanded' : ''}`}
      style={{ 
        position: 'relative', 
        border: expanded ? '1px solid rgba(var(--water-rgb), 0.5)' : '1px dashed rgba(var(--water-rgb), 0.5)', 
        borderRadius: 8, 
        padding: expanded ? '16px' : '0px',
        margin: expanded ? '8px 0' : '0',
        cursor: expanded ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        background: expanded ? 'rgba(var(--panel-rgb), 0.8)' : 'rgba(var(--water-rgb), 0.05)',
        boxShadow: expanded ? '0 10px 30px rgba(var(--shadow-rgb), 0.5)' : 'none',
        zIndex: expanded ? 10 : 1
      }}
      onClick={!expanded ? handleInspectClick : undefined}
    >
      <div style={{ pointerEvents: expanded ? 'auto' : 'none', opacity: expanded ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        {children}
      </div>
      
      {!expanded && (
        <div style={{ position: 'absolute', top: -8, right: -8, background: 'var(--water)', color: '#000', fontSize: '0.55rem', padding: '2px 6px', borderRadius: 10, fontWeight: 'bold', boxShadow: '0 0 8px var(--water)', zIndex: 2, pointerEvents: 'none' }}>
          <Search size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', margin: '0 4px' }} /> Inspect
        </div>
      )}

      {expanded && (
        <div style={{ marginTop: 16, borderTop: '1px solid rgba(var(--water-rgb), 0.2)', paddingTop: 16 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, color: 'var(--water)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <span style={{ animation: 'pulse-dot 2s infinite' }}>●</span> AI Analysis
          </div>

          {/* AI Chat Log inside the component */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16, maxHeight: 250, overflowY: 'auto', paddingRight: 4 }}>
            {chatLog.length === 0 ? (
              <div style={{ display: 'flex', gap: 4 }}>
                <div className="chat-typing-dot" style={{width: 4, height: 4}}/>
                <div className="chat-typing-dot" style={{width: 4, height: 4}}/>
                <div className="chat-typing-dot" style={{width: 4, height: 4}}/>
              </div>
            ) : chatLog.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? 'rgba(var(--water-rgb), 0.15)' : 'rgba(var(--fg-rgb), 0.05)',
                border: msg.role === 'user' ? '1px solid rgba(var(--water-rgb), 0.3)' : '1px solid rgba(var(--fg-rgb), 0.1)',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: '0.9rem',
                lineHeight: 1.5,
                color: msg.role === 'user' ? 'var(--text)' : 'var(--text-2)',
                maxWidth: '92%'
              }}>
                {msg.text.split('\n').map((line, j) => (
                  <span key={j}>
                    {renderText(line)}
                    {j < msg.text.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* Inline Input */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="<Wand2 size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', margin: '0 4px' }} /> Ask a follow-up question..."
              style={{ flex: 1, background: 'rgba(var(--fg-rgb), 0.05)', border: '1px solid rgba(var(--fg-rgb), 0.2)', borderRadius: 20, padding: '8px 14px', color: 'var(--text)', fontSize: '0.9rem', outline: 'none' }}
              autoFocus
            />
            <button 
              onClick={() => setExpanded(false)} 
              style={{ background: 'transparent', border: '1px solid rgba(var(--fg-rgb), 0.3)', color: 'var(--text-3)', borderRadius: 20, padding: '0 16px', fontSize: '0.86rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'rgba(var(--fg-rgb), 0.3)'; }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
