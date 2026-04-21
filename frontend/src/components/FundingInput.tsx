import React from 'react';

interface FundingInputProps {
  amount: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  onConfirm: () => void;
}

/**
 * FundingInput component for user to specify desired funding amount.
 */
const FundingInput: React.FC<FundingInputProps> = ({ 
  amount, 
  min = 6000, 
  max = 25000, 
  onChange, 
  onConfirm 
}) => {
  return (
    <section className="funding-input-section">
      <h2>How much funding would you like?</h2>
      <div className="input-group">
        <input 
          type="number" 
          className="number-input" 
          value={amount}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
        />
        <span className="input-hint">From £{min.toLocaleString('en-GB', { maximumFractionDigits: 0 })} to £{max.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</span>
        <button className="btn confirm-btn" onClick={onConfirm}>Confirm</button>
      </div>

      <style>{`
        .funding-input-section {
          margin-top: 0;
          margin-bottom: 40px;
        }

        .funding-input-section h2 {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 15px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          width: fit-content;
          gap: 8px;
        }

        .number-input {
          background-color: var(--input-bg);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 10px 15px;
          border-radius: 6px;
          font-size: 16px;
          width: 250px;
          box-sizing: border-box;
        }

        .input-hint {
          color: var(--text-secondary);
          font-size: 12px;
        }

        .confirm-btn {
          margin-top: 5px;
        }
      `}</style>
    </section>
  );
};

export default FundingInput;
