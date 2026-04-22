import React, { useState, useEffect } from 'react';
import { suggestRefinement } from '../api/recommendations';
import type { SuggestedRefinement } from '../types/api';

interface RefineOffersProps {
  onRefine: (needs: string) => void;
  isLoading?: boolean;
  minimal?: boolean;
  merchantContext?: string;
  suggestedRefinements?: SuggestedRefinement[];
}

const RefineOffers: React.FC<RefineOffersProps> = ({ onRefine, isLoading, minimal, merchantContext, suggestedRefinements }) => {
  const [value, setValue] = useState('');
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const handlePromptClick = (prompt: string) => {
    if (isLoading || isMagicLoading) return;
    setValue(prompt);
    onRefine(prompt); // Call instantly
  };

  const handleMagicWand = async () => {
    if (!merchantContext || isMagicLoading) return;
    
    setIsMagicLoading(true);
    setIsThinking(true);
    setValue(''); // Clear current value
    
    try {
      const suggestion = await suggestRefinement({ merchantContext });
      setIsThinking(false); // Stop thinking animation
      
      // Simulate typewriter into the input field
      let currentText = "";
      const speed = 10; // ms per char
      
      for (let i = 0; i < suggestion.length; i++) {
        currentText += suggestion[i];
        setValue(currentText);
        await new Promise(resolve => setTimeout(resolve, speed));
      }
    } catch (e) {
      console.error(e);
      setIsThinking(false);
      setValue("I need funding to help grow my business."); // Fallback
    } finally {
      setIsMagicLoading(false);
    }
  };

  const handleSubmit = () => {
    if (value.trim()) {
      onRefine(value);
    }
  };

  return (
    <div className={`not-right ${minimal ? 'minimal' : ''}`}>
      {minimal ? (
        <p className="minimal-label">Not quite right? Tell us what you're looking for and we'll refine your offers.</p>
      ) : (
        <>
          <h3>Not quite right?</h3>
          <p>Tell us more about what you need and we'll refine these offers.</p>
        </>
      )}
      <div className="input-row">
        <div className="input-wrapper">
          <textarea 
            placeholder="e.g. I need at least £30k, and a lower daily sweep" 
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isLoading || isMagicLoading}
            rows={3}
          />
          {isThinking && (
            <div className="thinking-overlay">
              <span className="shimmer">✨ Dojo is crafting your perfect request...</span>
            </div>
          )}
          {merchantContext && !isThinking && (
            <button 
              className={`magic-wand-btn ${isMagicLoading ? 'loading' : ''}`} 
              onClick={handleMagicWand} 
              disabled={isLoading || isMagicLoading}
            >
              Suggest ✨
            </button>
          )}
        </div>
        <button 
          className={`btn btn-primary ${minimal ? '' : 'btn-full'} no-margin-bottom`}
          onClick={handleSubmit}
          disabled={isLoading || isMagicLoading || !value.trim()}
          style={minimal ? { alignSelf: 'stretch', height: 'auto', minWidth: '140px' } : {}}
        >
          {isLoading ? 'Refining...' : 'Refine offers'}
        </button>
      </div>

      {suggestedRefinements && suggestedRefinements.length > 0 && (
        <div className="suggestions-container">
          <span className="suggestions-label">Recommended requests:</span>
          <div className="suggestion-chips">
            {suggestedRefinements.map((s, i) => (
              <button 
                key={i} 
                className="suggestion-chip full-prompt"
                onClick={() => handlePromptClick(s.prompt)}
                disabled={isLoading || isMagicLoading}
              >
                {s.prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .not-right {
          background-color: var(--bg-color);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px;
        }

        .not-right.minimal {
          background-color: #FFFFFF;
          border: 1px solid #E5E7EB;
          padding: 24px;
          border-radius: 20px;
          width: 100%;
          margin: 32px 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
          box-sizing: border-box; /* Ensure padding doesn't cause overflow */
        }

        .minimal-label {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 12px;
          margin-top: 0;
        }

        .input-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        
        .input-wrapper {
          position: relative;
          flex-grow: 1;
          display: flex;
        }
        
        .magic-wand-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background-color: var(--tertiary-color);
          border: 1px solid var(--tertiary-color);
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
          color: white;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(108, 92, 231, 0.2);
          z-index: 6;
        }
        
        .magic-wand-btn:hover:not(:disabled) {
          background-color: var(--tertiary-hover);
          border-color: var(--tertiary-hover);
          transform: translateY(-52%) scale(1.02);
        }

        @keyframes pulse {
          0% { transform: translateY(-50%) scale(1); opacity: 0.7; }
          50% { transform: translateY(-50%) scale(1.1); opacity: 1; }
          100% { transform: translateY(-50%) scale(1); opacity: 0.7; }
        }

        .thinking-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          display: flex;
          align-items: center;
          padding: 0 16px;
          border-radius: 12px;
          z-index: 5;
        }

        .shimmer {
          font-size: 14px;
          color: var(--accent-color);
          font-weight: 500;
          font-style: italic;
          animation: shimmer-pulse 1.5s infinite;
        }

        @keyframes shimmer-pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }

        @media (max-width: 600px) {
          .input-row {
            flex-direction: column;
            align-items: stretch;
          }
          
          .input-wrapper {
            width: 100%;
          }

          .not-right textarea {
            width: 100%;
            margin-bottom: 12px;
          }

          .not-right:not(.minimal) textarea {
            margin-bottom: 16px;
          }
        }

        .not-right h3 {
          margin-top: 0;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .not-right p {
          color: var(--text-secondary);
          font-size: 15px;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .not-right textarea {
          flex-grow: 1;
          background-color: var(--input-bg);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 16px;
          padding-right: 120px; /* Space for the 'Suggest' button on the right */
          border-radius: 12px;
          box-sizing: border-box;
          font-size: 14px;
          transition: border-color 0.2s ease;
          resize: none;
          font-family: inherit;
        }

        .not-right textarea:focus {
          outline: none;
          border-color: var(--accent-color);
        }

        .no-margin-bottom {
          margin-bottom: 0 !important;
        }

        .suggestions-container {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .suggestions-label {
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .suggestion-chips {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .suggestion-chip.full-prompt {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          color: #4B5563;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          line-height: 1.4;
          height: 100%;
        }

        .suggestion-chip.full-prompt:hover:not(:disabled) {
          border-color: var(--accent-color);
          background-color: rgba(25, 98, 84, 0.02);
          color: var(--accent-color);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .suggestion-chip:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default RefineOffers;
