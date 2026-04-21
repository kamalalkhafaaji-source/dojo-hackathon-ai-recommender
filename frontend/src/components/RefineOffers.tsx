import React, { useState } from 'react';

interface RefineOffersProps {
  onRefine: (needs: string) => void;
  isLoading?: boolean;
}

/**
 * RefineOffers component for users to provide custom requirements.
 */
const RefineOffers: React.FC<RefineOffersProps> = ({ onRefine, isLoading }) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (value.trim()) {
      onRefine(value);
    }
  };

  return (
    <div className="not-right">
      <h3>Not quite right?</h3>
      <p>Tell us more about what you need and we'll refine these offers.</p>
      <input 
        type="text" 
        placeholder="e.g. I need at least £30k, and a lower daily sweep" 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        disabled={isLoading}
      />
      <button 
        className="btn btn-primary btn-full no-margin-bottom"
        onClick={handleSubmit}
        disabled={isLoading || !value.trim()}
      >
        {isLoading ? 'Refining...' : 'Refine offers'}
      </button>

      <style>{`
        .not-right {
          background-color: var(--bg-color);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px;
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
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          box-sizing: border-box;
          font-size: 15px;
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
