import React, { useState } from 'react';
import { suggestRefinement } from '../api/recommendations';

interface RefineOffersProps {
  onRefine: (needs: string) => void;
  isLoading?: boolean;
  minimal?: boolean;
  merchantContext?: string;
}

/**
 * RefineOffers component for users to provide custom requirements.
 */
const RefineOffers: React.FC<RefineOffersProps> = ({ onRefine, isLoading, minimal, merchantContext }) => {
  const [value, setValue] = useState('');
  const [isMagicLoading, setIsMagicLoading] = useState(false);

  const handleSubmit = () => {
    if (value.trim()) {
      onRefine(value);
    }
  };

  const handleMagicWand = async () => {
    if (!merchantContext || isMagicLoading) return;
    
    setIsMagicLoading(true);
    setValue(''); // Clear current value to show typewriter
    
    try {
      const suggestion = await suggestRefinement({ merchantContext });
      
      // Simulate typewriter into the input field
      let currentText = "";
      const speed = 15; // ms per char
      
      for (let i = 0; i < suggestion.length; i++) {
        currentText += suggestion[i];
        setValue(currentText);
        await new Promise(resolve => setTimeout(resolve, speed));
      }
    } catch (e) {
      console.error(e);
      setValue("I need funding to help grow my business."); // Fallback
    } finally {
      setIsMagicLoading(false);
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
          <input 
            type="text" 
            placeholder="e.g. I need at least £30k, and a lower daily sweep" 
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={isLoading || isMagicLoading}
          />
          {merchantContext && (
            <button 
              className={`magic-wand-btn ${isMagicLoading ? 'loading' : ''}`} 
              onClick={handleMagicWand} 
              disabled={isLoading || isMagicLoading}
              title="Auto-suggest based on your business profile"
            >
              ✨
            </button>
          )}
        </div>
        <button 
          className={`btn btn-primary ${minimal ? '' : 'btn-full'} no-margin-bottom`}
          onClick={handleSubmit}
          disabled={isLoading || isMagicLoading || !value.trim()}
        >
          {isLoading ? 'Refining...' : 'Refine offers'}
        </button>
      </div>

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

        @media (max-width: 768px) {
          .not-right.minimal {
            margin: 24px 0;
            padding: 20px;
          }
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
          align-items: center;
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
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        
        .magic-wand-btn:hover {
          opacity: 1;
        }
        
        .magic-wand-btn:disabled {
          cursor: not-allowed;
          opacity: 0.3;
        }

        .magic-wand-btn.loading {
          animation: pulse 1s infinite;
          opacity: 1;
          pointer-events: none;
        }

        @keyframes pulse {
          0% { transform: translateY(-50%) scale(1); opacity: 0.7; }
          50% { transform: translateY(-50%) scale(1.3); opacity: 1; }
          100% { transform: translateY(-50%) scale(1); opacity: 0.7; }
        }

        @media (max-width: 600px) {
          .input-row {
            flex-direction: column;
            align-items: stretch;
          }
          
          .input-wrapper {
            width: 100%;
          }

          .not-right input {
            width: 100%;
            margin-bottom: 12px; /* Add spacing between input and button when stacked */
          }

          .not-right:not(.minimal) input {
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

        .not-right input {
          width: 100%;
          background-color: var(--input-bg);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 12px 16px;
          padding-right: 40px; /* Space for magic wand */
          border-radius: 12px;
          box-sizing: border-box;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .not-right input:focus {
          outline: none;
          border-color: var(--accent-color);
        }

        .no-margin-bottom {
          margin-bottom: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default RefineOffers;
