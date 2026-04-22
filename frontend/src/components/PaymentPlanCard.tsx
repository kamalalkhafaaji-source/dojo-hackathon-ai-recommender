import React, { useState } from 'react';
import WhatIfChat from './WhatIfChat';
import { deepDiveReason } from '../api/recommendations';
import Typewriter from './Typewriter';

export interface PaymentPlan {
  id: string;
  provider: string;
  amount: string;
  totalToPay: string;
  paymentLabel: string;
  repaymentTerm: string;
  expirationDate: string;
  badge?: string;
  isBestFit?: boolean;
  isHighlighted?: boolean;
  reasons: string[];
  healthScore: number;
  projectedCashflow?: number[];
  rawDetails: string;
  merchantContext: string;
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
  const [deepDive, setDeepDive] = useState<{ reason: string; text: string; loading: boolean } | null>(null);

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

  const handleDeepDive = async (e: React.MouseEvent, reason: string) => {
    e.stopPropagation(); // prevent card selection
    if (deepDive?.reason === reason && !deepDive.loading) {
      setDeepDive(null); // toggle off
      return;
    }
    setDeepDive({ reason, text: '', loading: true });
    try {
      const result = await deepDiveReason({ reason, offerDetails: plan.rawDetails });
      setDeepDive({ reason, text: result, loading: false });
    } catch (err) {
      setDeepDive({ reason, text: 'Unable to load explanation.', loading: false });
    }
  };

  const renderReason = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="highlight">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div 
      className={`plan-card ${isActive ? 'active' : ''} ${plan.isHighlighted ? 'highlighted' : ''}`} 
      onClick={onClick}
    >
      {plan.isHighlighted && (
        <div className="recommendation-banner">
          Dojo's expert recommendation
        </div>
      )}
      <div className="plan-header">
        <div>
          <div className="plan-amount-label">Funding amount</div>
          <div className="plan-amount">{plan.amount}</div>
        </div>
        {plan.badge && (
          <div className={`badge ${isActive ? 'active-badge' : ''}`}>
            {plan.badge}
          </div>
        )}
      </div>

      <div className="plan-details">
        <div className="detail-row">
          <div className="detail-label">Partner</div>
          <div className="detail-value">{plan.provider}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Total to pay</div>
          <div className="detail-value">{plan.totalToPay}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label tooltip-wrapper">
            Payment <span className="tooltip-icon">?</span>
            <div className="tooltip">The percentage of your daily card takings automatically swept to repay the advance.</div>
          </div>
          <div className="detail-value">{plan.paymentLabel}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Repayment term</div>
          <div className="detail-value">~{plan.repaymentTerm} days</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Offer expires in</div>
          <div className="detail-value">{getDaysUntil(plan.expirationDate)}</div>
        </div>
      </div>

      {plan.projectedCashflow && plan.projectedCashflow.length > 0 && (
        <div className="cashflow-chart">
          <div className="chart-label">6-Month Cashflow Projection</div>
          <div className="bars">
            {plan.projectedCashflow.map((val, i) => {
              const max = Math.max(...plan.projectedCashflow!);
              const height = (val / max) * 100;
              return (
                <div key={i} className="bar-wrapper" title={`Month ${i+1}: £${val}`}>
                  <div className="bar" style={{ height: `${height}%` }}></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="why-fits">
        <h4 className={plan.isHighlighted ? 'recommended-title' : ''}>
          {plan.isHighlighted ? "Dojo's expert recommendation" : 'Why this fits you'}
        </h4>
        
        <div className={`insights-box ${plan.isHighlighted ? 'recommended-insights' : ''}`}>
          <ul>
            {plan.reasons.map((reason, index) => (
              <li key={index} className={index === 0 ? 'primary-reason' : ''}>
                <span className="bullet-icon">{plan.isHighlighted ? '✨' : '✓'}</span>
                <div>
                  <span>{renderReason(reason)}</span>
                  <button className="deep-dive-btn" onClick={(e) => handleDeepDive(e, reason)}>
                    {deepDive?.reason === reason ? 'Hide' : 'Explain'}
                  </button>
                  {deepDive?.reason === reason && (
                    <div className="deep-dive-content">
                      {deepDive.loading ? 'Thinking...' : <Typewriter text={deepDive.text} speed={10} />}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <WhatIfChat offerDetails={plan.rawDetails} merchantContext={plan.merchantContext} />

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

        .plan-card.highlighted {
          transform: scale(1.08);
          box-shadow: 0 20px 50px rgba(25, 98, 84, 0.15);
          z-index: 2;
          border: 2px solid rgba(25, 98, 84, 0.3);
          position: relative;
          overflow: visible; /* Allow banner to pop */
        }

        .recommendation-banner {
          position: absolute;
          top: -14px; /* Pull it up to sit on the top edge */
          left: 20px;
          right: 20px;
          background-color: var(--accent-color);
          color: white;
          padding: 6px 0;
          border-radius: 100px; /* Fully rounded pill shape */
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          text-align: center;
          z-index: 3;
          box-shadow: 0 4px 12px rgba(25, 98, 84, 0.25);
          border: 2px solid white; /* Helps it pop and 'fade' into the white layout context */
        }

        .plan-card.highlighted .plan-header {
          margin-top: 12px; /* Adjusted spacing for the pill banner */
        }

        .plan-card.highlighted.active {
          border-color: var(--accent-color);
          border-width: 3px;
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
          background-color: #F3F4F6;
          color: #4B5563;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .active-badge {
          background-color: var(--accent-color);
          color: white;
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
          transition: all 0.2s;
        }

        .why-fits h4.recommended-title {
          font-size: 17px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .insights-box {
          background-color: #F9FAFB;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.2s ease;
        }

        .insights-box.recommended-insights {
          background-color: rgba(25, 98, 84, 0.05);
          border: 1px solid rgba(25, 98, 84, 0.1);
        }

        .why-fits ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .why-fits li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 16px;
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.6;
        }

        .why-fits li:last-child {
          margin-bottom: 0;
        }

        .primary-reason {
          font-size: 15px !important;
          color: var(--text-primary) !important;
          font-weight: 600;
        }

        .bullet-icon {
          color: var(--accent-color);
          font-weight: bold;
          font-size: 14px;
          line-height: 1.4;
          flex-shrink: 0;
        }

        .highlight {
          color: var(--accent-color);
          font-weight: 800;
        }

        .deep-dive-btn {
          background: none;
          border: none;
          color: var(--tertiary-color);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          padding: 0 4px;
          text-decoration: underline;
        }

        .deep-dive-content {
          margin-top: 8px;
          padding: 8px 12px;
          background: #FFFFFF;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 12px;
          color: var(--text-primary);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }

        .tooltip-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .tooltip-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #E5E7EB;
          color: #4B5563;
          font-size: 10px;
          font-weight: bold;
          cursor: help;
        }

        .tooltip {
          visibility: hidden;
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #1A1A1A;
          color: white;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 11px;
          width: 180px;
          text-align: center;
          z-index: 10;
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
          margin-bottom: 8px;
        }

        .tooltip::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -4px;
          border-width: 4px;
          border-style: solid;
          border-color: #1A1A1A transparent transparent transparent;
        }

        .tooltip-wrapper:hover .tooltip {
          visibility: visible;
          opacity: 1;
        }

        .cashflow-chart {
          margin-bottom: 24px;
          padding-top: 12px;
          border-top: 1px solid var(--border-color);
        }

        .chart-label {
          font-size: 11px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
          text-align: center;
        }

        .bars {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 40px;
          gap: 4px;
        }

        .bar-wrapper {
          flex: 1;
          height: 100%;
          display: flex;
          align-items: flex-end;
          background: rgba(0,0,0,0.02);
          border-radius: 2px;
        }

        .bar {
          width: 100%;
          background: var(--accent-color);
          border-radius: 2px;
          opacity: 0.7;
          transition: height 0.5s ease-out;
        }

        .plan-card.highlighted .bar {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};
