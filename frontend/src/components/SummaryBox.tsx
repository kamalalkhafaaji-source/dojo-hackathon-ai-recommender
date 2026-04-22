import React from 'react';

interface SummaryBoxProps {
  fundingAmount: string;
  fixedFee: string;
  totalToPay: string;
  payment: string;
  repaymentTerm: string;
  expiryDate: string; // Changed to accept the ISO date string for internal calculation
  onContinue: () => void;
}

/**
 * SummaryBox component displays the financial breakdown and primary actions in a full-width bar.
 */
const SummaryBox: React.FC<SummaryBoxProps> = ({
  fundingAmount,
  fixedFee,
  totalToPay,
  payment,
  repaymentTerm,
  expiryDate,
  onContinue
}) => {
  // Calculate days until expiry
  const getDaysUntil = (dateStr: string) => {
    try {
      const expiry = new Date(dateStr);
      const now = new Date();
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? `${diffDays} days` : 'Expiring soon';
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="summary-full-width">
      <div className="summary-content">
        <div className="summary-details">
          <div className="summary-item">
            <span className="label">Funding</span>
            <span className="value">{fundingAmount}</span>
          </div>
          
          <div className="divider"></div>
          
          <div className="summary-item">
            <span className="label">Fixed fee</span>
            <span className="value">{fixedFee}</span>
          </div>

          <div className="divider"></div>

          <div className="summary-item">
            <span className="label">Payment</span>
            <span className="value">{payment}</span>
          </div>

          <div className="divider"></div>

          <div className="summary-item">
            <span className="label">Term</span>
            <span className="value">~{repaymentTerm}</span>
          </div>

          <div className="divider"></div>

          <div className="summary-item">
            <span className="label">Expires in</span>
            <span className="value">{getDaysUntil(expiryDate)}</span>
          </div>

          <div className="divider"></div>

          <div className="summary-item total">
            <span className="label">Total to pay</span>
            <span className="value">{totalToPay}</span>
          </div>
        </div>
        
        <div className="summary-actions">
          <button className="btn btn-primary continue-btn" onClick={onContinue}>Continue</button>
        </div>
      </div>

      <style>{`
        .summary-full-width {
          width: 100%;
          background-color: #FFFFFF;
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px 32px;
          box-sizing: border-box;
          margin-top: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }

        .summary-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 32px;
        }

        .summary-details {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-grow: 1;
        }

        .divider {
          width: 1px;
          height: 32px;
          background-color: var(--border-color);
          opacity: 0.6;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: fit-content;
        }

        .summary-item .label {
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .summary-item .value {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .summary-item.total .value {
          color: var(--accent-color);
          font-size: 18px;
        }

        .summary-actions {
          flex-shrink: 0;
        }

        .continue-btn {
          min-width: 160px;
        }

        @media (max-width: 1100px) {
          .summary-details {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          .divider {
            display: none;
          }
          .summary-content {
            flex-direction: column;
            align-items: stretch;
          }
          .summary-actions {
            margin-top: 20px;
            display: flex;
            justify-content: center;
          }
          .continue-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SummaryBox;
