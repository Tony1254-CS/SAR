import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../state/store';
import { classifyIntent, getSuggestedQuestions } from './intents';
import { generateResponse, type ChatResponse, type ChatSource } from './responses';
import '../styles/chat.css';

interface Message {
  id: number;
  role: 'user' | 'ai';
  text: string;
  sources?: ChatSource[];
  mapAction?: ChatResponse['mapAction'];
}

// Simple markdown-like bold renderer
function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function MessageBubble({ msg }: { msg: Message }) {
  const [showSources, setShowSources] = useState(false);

  return (
    <div className={`chat-msg chat-msg--${msg.role}`}>
      <div>
        {msg.text.split('\n').map((line, i) => (
          <span key={i}>
            {renderText(line)}
            {i < msg.text.split('\n').length - 1 && <br />}
          </span>
        ))}
      </div>

      {msg.sources && msg.sources.length > 0 && (
        <>
          <div
            onClick={() => setShowSources(!showSources)}
            style={{ fontSize: '0.74rem', color: 'var(--water)', cursor: 'pointer', marginTop: 6, opacity: 0.8 }}
          >
            📎 {showSources ? 'Hide' : 'Show'} sources ({msg.sources.length})
          </div>
          {showSources && (
            <div className="chat-sources">
              {msg.sources.map((s, i) => (
                <span key={i} className="chat-source-chip">
                  {s.file} → {s.field}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="chat-typing">
      <div className="chat-typing-dot" />
      <div className="chat-typing-dot" />
      <div className="chat-typing-dot" />
    </div>
  );
}

export function ChatWidget() {
  const { reach, manifest, qc, stage, erosion, accretion, chatOpen, setChatOpen } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [chips, setChips] = useState<string[]>(getSuggestedQuestions('random'));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idCounter = useRef(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  useEffect(() => {
    if (chatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [chatOpen]);

  // (Removed initial greeting as user prefers starting with an empty chat or loading history manually)
  const handleSend = useCallback((text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: idCounter.current++,
      role: 'user',
      text: text.trim(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate AI "thinking" delay (makes it feel real)
    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      const intent = classifyIntent(text);
      const response = generateResponse(intent, { reach, manifest, qc, stage, erosion, accretion });

      const aiMsg: Message = {
        id: idCounter.current++,
        role: 'ai',
        text: response.text,
        sources: response.sources,
        mapAction: response.mapAction,
      };

      setMessages(prev => [...prev, aiMsg]);
      setTyping(false);

      // Update suggested chips
      if (response.followUp) {
        setChips(response.followUp);
      } else {
        setChips(getSuggestedQuestions('random'));
      }

      // Execute map action if any
      if (response.mapAction) {
        // Dispatch a custom event that the map can listen to
        window.dispatchEvent(new CustomEvent('chat-map-action', {
          detail: response.mapAction,
        }));
      }
    }, delay);
  }, [reach, manifest, qc, stage, erosion, accretion]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!chatOpen && (
        <button className="chat-fab" onClick={() => setChatOpen(true)} title="Ask the AI Assistant">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {chatOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-avatar">🛰️</div>
            <div className="chat-header-info">
              <div className="chat-header-name">River Intelligence</div>
              <div className="chat-header-status">Online — {reach?.name ?? 'Loading...'}</div>
            </div>
            <button 
              className="chat-history-btn" 
              onClick={() => {
                const historyMocks = [
                  [
                    { id: idCounter.current++, role: 'user' as const, text: 'Why is the river migrating east?' },
                    { id: idCounter.current++, role: 'ai' as const, text: 'The river is migrating east due to increased sediment deposition on the western banks (accretion) and higher water velocity eroding the eastern banks, primarily driven by upstream flow patterns.' }
                  ],
                  [
                    { id: idCounter.current++, role: 'user' as const, text: 'Show me the recent erosion areas.' },
                    { id: idCounter.current++, role: 'ai' as const, text: 'I have highlighted the recent erosion risk areas in red on the map. These regions have experienced significant bank undercutting in the last two months.' }
                  ],
                  [
                    { id: idCounter.current++, role: 'user' as const, text: 'What is the impact of the latest earthquake?' },
                    { id: idCounter.current++, role: 'ai' as const, text: 'The recent 4.2 magnitude earthquake near the northern reach may have destabilized the soil, leading to an increased probability of sudden bank failure in the ambiguous zones.' }
                  ]
                ];
                const randomHistory = historyMocks[Math.floor(Math.random() * historyMocks.length)];
                setMessages(randomHistory);
                setChips(getSuggestedQuestions('random'));
              }}
              title="Load Random History"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v5h5"></path>
                <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"></path>
              </svg>
            </button>
            <button className="chat-close" onClick={() => setChatOpen(false)}>×</button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {typing && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Chips */}
          {chips.length > 0 && !typing && (
            <div className="chat-chips">
              {chips.map((chip, i) => (
                <button key={i} className="chat-chip" onClick={() => handleSend(chip)}>
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="chat-input-area">
            <input
              ref={inputRef}
              className="chat-input"
              placeholder="Ask why, what if, or how something is connected..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={typing}
            />
            <button
              className="chat-send"
              onClick={() => handleSend(input)}
              disabled={typing || !input.trim()}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Ask
            </button>
          </div>
        </div>
      )}
    </>
  );
}
