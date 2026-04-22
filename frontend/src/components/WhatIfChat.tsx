import React, { useState } from 'react';
import { simulateImpact } from '../api/recommendations';
import Typewriter from './Typewriter';

interface WhatIfChatProps {
  offerDetails: string;
  merchantContext: string;
}

const WhatIfChat: React.FC<WhatIfChatProps> = ({ offerDetails, merchantContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await simulateImpact({
        offerDetails,
        merchantContext,
        userMessage
      });
      setHistory(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      setHistory(prev => [...prev, { role: 'ai', text: 'Sorry, I could not simulate that right now.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="what-if-wrapper">
      <button 
        className={`btn btn-tertiary chat-toggle-btn ${isOpen ? 'is-open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Close Simulator' : 'Ask a "What-if" question'}
      </button>

      {isOpen && (
        <div className="what-if-chat">
          <div className="chat-header">
            <h5>What-If Simulator</h5>
          </div>
          
          <div className="chat-history">
            {history.length === 0 && (
              <p className="chat-empty">Ask how changes in your business might affect this repayment.</p>
            )}
            {history.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                {msg.role === 'ai' && i === history.length - 1 ? (
                  <Typewriter text={msg.text} speed={15} />
                ) : (
                  msg.text
                )}
              </div>
            ))}
            {isLoading && <div className="chat-message ai typing">Typing...</div>}
          </div>

          <div className="chat-input-row">
            <input 
              type="text" 
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="What if revenue drops 10%?"
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading || !message.trim()}>Send</button>
          </div>
        </div>
      )}

      <style>{`
        .what-if-wrapper {
          width: 100%;
          margin-top: 32px;
        }

        .chat-toggle-btn {
          width: 100%;
          font-size: 13px;
        }

        .chat-toggle-btn.is-open {
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          margin-bottom: 0;
        }

        .what-if-chat {
          border: 1px solid var(--tertiary-color);
          border-top: none;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
          background: #FFFFFF;
          overflow: hidden;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: #F9FAFB;
          border-bottom: 1px solid var(--border-color);
        }

        .chat-header h5 {
          margin: 0;
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          color: var(--text-secondary);
        }

        .chat-history {
          padding: 12px;
          max-height: 200px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .chat-empty {
          margin: 0;
          font-size: 12px;
          color: var(--text-secondary);
          text-align: center;
          font-style: italic;
        }

        .chat-message {
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          line-height: 1.4;
          max-width: 90%;
        }

        .chat-message.user {
          background: var(--accent-color);
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 2px;
        }

        .chat-message.ai {
          background: #F3F4F6;
          color: var(--text-primary);
          align-self: flex-start;
          border-bottom-left-radius: 2px;
        }

        .chat-message.typing {
          color: var(--text-secondary);
          font-style: italic;
        }

        .chat-input-row {
          display: flex;
          border-top: 1px solid var(--border-color);
        }

        .chat-input-row input {
          flex-grow: 1;
          border: none;
          padding: 10px 12px;
          font-size: 13px;
          outline: none;
        }

        .chat-input-row button {
          background: none;
          border: none;
          border-left: 1px solid var(--border-color);
          padding: 0 16px;
          color: var(--accent-color);
          font-weight: 600;
          cursor: pointer;
        }

        .chat-input-row button:disabled {
          color: var(--text-secondary);
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default WhatIfChat;
