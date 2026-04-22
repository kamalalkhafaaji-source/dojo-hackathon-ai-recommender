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
      </div>

      {maxAmount !== undefined && (
        <div className="header-subtitle">
          You're eligible for up to £{maxAmount.toLocaleString('en-GB', { maximumFractionDigits: 0 })} in business funding.
        </div>
      )}
      <a href="#" className="header-link">Learn how flexible payments work.</a>

      <style>{`
        .funding-header {
          margin-bottom: 24px;
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

        .header-subtitle {
          font-size: 18px;
          margin-bottom: 8px;
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
