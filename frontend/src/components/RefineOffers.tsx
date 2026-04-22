import React, { useState } from 'react';

interface RefineOffersProps {
  onRefine: (needs: string) => void;
  isLoading?: boolean;
  minimal?: boolean;
}

/**
 * RefineOffers component for users to provide custom requirements.
 */
const RefineOffers: React.FC<RefineOffersProps> = ({ onRefine, isLoading, minimal }) => {
  const [value, setValue] = useState('');

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
        <input 
          type="text" 
          placeholder="e.g. I need at least £30k, and a lower daily sweep" 
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={isLoading}
        />
        <button 
          className={`btn btn-primary ${minimal ? '' : 'btn-full'} no-margin-bottom`}
          onClick={handleSubmit}
          disabled={isLoading || !value.trim()}
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

        @media (max-width: 600px) {
          .input-row {
            flex-direction: column;
            align-items: stretch;
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
          flex-grow: 1;
          background-color: var(--input-bg);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 12px 16px;
          border-radius: 12px;
          box-sizing: border-box;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .not-right:not(.minimal) input {
          margin-bottom: 16px;
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
