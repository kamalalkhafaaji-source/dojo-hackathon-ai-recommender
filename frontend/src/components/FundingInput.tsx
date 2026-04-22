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
  const handleIncrement = () => {
    if (amount + 1000 <= max) onChange(amount + 1000);
    else onChange(max);
  };

  const handleDecrement = () => {
    if (amount - 1000 >= min) onChange(amount - 1000);
    else onChange(min);
  };

  return (
    <section className="funding-input-container">
      <div className="input-content">
        <div className="input-info">
          <h3>Customise your funding</h3>
          <p>Adjust the amount to see how it affects your offers.</p>
        </div>
        
        <div className="stepper-group">
          <div className="stepper-controls">
            <button 
              className="stepper-btn" 
              onClick={handleDecrement}
              disabled={amount <= min}
            >
              −
            </button>
            <div className="amount-display">
              <span className="currency">£</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => onChange(Number(e.target.value))}
                min={min}
                max={max}
              />
            </div>
            <button 
              className="stepper-btn" 
              onClick={handleIncrement}
              disabled={amount >= max}
            >
              +
            </button>
          </div>
          <button className="btn btn-primary apply-btn" onClick={onConfirm}>
            Apply amount
          </button>
        </div>
      </div>
      
      <div className="input-range-hint">
        Range: £{min.toLocaleString('en-GB')} — £{max.toLocaleString('en-GB')}
      </div>

      <style>{`
        .funding-input-container {
          background-color: #FFFFFF;
          border: 1px solid #E5E7EB;
          padding: 24px;
          border-radius: 20px;
          width: 100%;
          box-sizing: border-box;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
          margin-bottom: 24px;
        }

        .input-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .input-info h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .input-info p {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .stepper-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stepper-controls {
          display: flex;
          align-items: center;
          background-color: #F3F4F6;
          border-radius: 12px;
          padding: 4px;
          border: 1px solid #E5E7EB;
        }

        .stepper-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .stepper-btn:hover:not(:disabled) {
          background-color: #F9FAFB;
          border-color: var(--accent-color);
          color: var(--accent-color);
        }

        .stepper-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .amount-display {
          display: flex;
          align-items: center;
          padding: 0 16px;
          min-width: 120px;
          justify-content: center;
        }

        .amount-display .currency {
          font-size: 16px;
          font-weight: 700;
          margin-right: 2px;
          color: var(--text-primary);
        }

        .amount-display input {
          border: none;
          background: transparent;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          width: 80px;
          text-align: left;
          outline: none;
          -moz-appearance: textfield;
        }

        .amount-display input::-webkit-outer-spin-button,
        .amount-display input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .apply-btn {
          font-size: 13px;
          padding: 10px 20px;
          white-space: nowrap;
        }

        .input-range-hint {
          margin-top: 16px;
          font-size: 11px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        @media (max-width: 850px) {
          .input-content {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }
          
          .stepper-group {
            flex-direction: column;
          }

          .stepper-controls {
            width: 100%;
            justify-content: space-between;
          }

          .amount-display {
            flex-grow: 1;
          }

          .apply-btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
};

export default FundingInput;
