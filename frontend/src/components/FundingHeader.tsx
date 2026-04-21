import React from 'react';

interface FundingHeaderProps {
  maxAmount?: number;
}

/**
 * FundingHeader component displays the brand logo and the eligibility subtitle.
 */
const FundingHeader: React.FC<FundingHeaderProps> = ({ maxAmount }) => {
  return (
    <header className="funding-header">
      <div className="header-logo">
        <h1>DOJO</h1>
        <span className="logo-divider">X</span>
        <h1 className="logo-partner">Y O U L E N D</h1>
      </div>

      {maxAmount !== undefined && (
        <div className="header-subtitle">
          You're eligible for up to £{maxAmount.toLocaleString('en-GB', { maximumFractionDigits: 0 })} in business funding.
        </div>
      )}
      <div className="header-desc">Customise and review your offer.</div>
      <a href="#" className="header-link">Learn how flexible payments work.</a>

      <style>{`
        .funding-header {
          margin-bottom: 40px;
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .header-logo h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 500;
        }

        .logo-divider {
          color: var(--text-secondary);
          font-size: 12px;
        }

        .logo-partner {
          font-weight: 300 !important;
        }

        .header-subtitle {
          font-size: 18px;
          margin-bottom: 8px;
        }

        .header-desc {
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 10px;
        }

        .header-link {
          color: var(--accent-color);
          text-decoration: none;
          font-size: 14px;
        }
      `}</style>
    </header>
  );
};

export default FundingHeader;
