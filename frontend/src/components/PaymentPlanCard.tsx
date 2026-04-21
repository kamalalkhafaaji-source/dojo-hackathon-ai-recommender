import React from 'react';

export interface PaymentPlan {
  id: string;
  amount: string;
  totalToPay: string;
  paymentLabel: string;
  badge?: string;
  isBestFit?: boolean;
  reasons: string[];
}

interface PaymentPlanCardProps {
  plan: PaymentPlan;
  isActive: boolean;
  onClick: () => void;
}

/**
 * PaymentPlanCard component displays a single funding offer.
 */
export const PaymentPlanCard: React.FC<PaymentPlanCardProps> = ({ plan, isActive, onClick }) => {
  return (
    <div 
      className={`plan-card ${isActive ? 'active' : ''}`} 
      onClick={onClick}
    >
      <div className="plan-header">
        <div>
          <div className="plan-amount-label">Funding amount</div>
          <div className="plan-amount">{plan.amount}</div>
        </div>
        {plan.badge && (
          <div className={`badge ${plan.isBestFit ? 'best-fit' : ''}`}>
            {plan.badge}
          </div>
        )}
      </div>

      <div className="plan-details">
        <div className="detail-row">
          <div className="detail-label">Total to pay</div>
          <div className="detail-value">{plan.totalToPay}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Payment</div>
          <div className="detail-value">{plan.paymentLabel}</div>
        </div>
      </div>

      <div className="why-fits">
        <h4>Why this fits you</h4>
        <ul>
          {plan.reasons.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>
      </div>

      <style>{`
        .plan-card {
          background-color: var(--bg-color);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .plan-card:hover {
          border-color: #D1D5DB;
        }

        .plan-card.active {
          border-color: var(--accent-color);
          background-color: rgba(25, 98, 84, 0.03);
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .plan-amount-label {
          color: var(--text-secondary);
          font-size: 13px;
          margin-bottom: 6px;
        }

        .plan-amount {
          font-size: 20px;
          font-weight: 600;
        }

        .badge {
          background-color: #333;
          color: #fff;
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge.best-fit {
          background-color: var(--accent-color);
          color: var(--btn-primary-text);
        }

        .plan-details {
          margin-bottom: 24px;
        }

        .detail-row {
          margin-bottom: 16px;
        }

        .detail-label {
          color: var(--text-secondary);
          font-size: 13px;
          margin-bottom: 4px;
        }

        .detail-value {
          font-size: 15px;
          font-weight: 500;
        }

        .why-fits {
          flex-grow: 1;
        }

        .why-fits h4 {
          font-size: 15px;
          font-weight: 600;
          margin-top: 0;
          margin-bottom: 12px;
        }

        .why-fits ul {
          margin: 0;
          padding-left: 20px;
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.6;
        }

        .why-fits li {
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};
