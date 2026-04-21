import React from 'react';

interface SummaryBoxProps {
  fundingAmount: string;
  fixedFee: string;
  totalToPay: string;
  onContinue: () => void;
  onCancel: () => void;
}

/**
 * SummaryBox component displays the financial breakdown and primary actions.
 */
const SummaryBox: React.FC<SummaryBoxProps> = ({
  fundingAmount,
  fixedFee,
  totalToPay,
  onContinue,
  onCancel
}) => {
  return (
    <div className="summary-box">
      <div className="summary-row">
        <span className="label">Funding amount</span>
        <span>{fundingAmount}</span>
      </div>
      <div className="summary-row">
        <span className="label">Fixed fee</span>
        <span>{fixedFee}</span>
      </div>
      <div className="summary-row total">
        <span className="label">Total to pay</span>
        <span>{totalToPay}</span>
      </div>
      
      <div className="summary-disclaimer">No hidden fees - you're completely free to close.</div>
      
      <button className="btn btn-primary btn-full" onClick={onContinue}>Continue</button>
      <button className="btn btn-full no-margin-bottom" onClick={onCancel}>Cancel</button>

      <style>{`
        .summary-box {
          background-color: var(--card-bg);
          border-radius: 20px;
          padding: 24px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 15px;
        }
        
        .summary-row.total {
          margin-bottom: 24px;
          font-weight: 600;
        }

        .summary-row .label {
          color: var(--text-secondary);
        }

        .summary-disclaimer {
          color: var(--text-secondary);
          font-size: 12px;
          text-align: center;
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .no-margin-bottom {
          margin-bottom: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default SummaryBox;
