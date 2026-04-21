import React from 'react';

interface RefinementContextProps {
  needs: string;
  onClear?: () => void;
}

/**
 * A prominent banner showing the user's current refinement criteria.
 */
const RefinementContext: React.FC<RefinementContextProps> = ({ needs, onClear }) => {
  return (
    <div className="refinement-banner">
      <div className="banner-content">
        <div className="banner-header">
          <span className="sparkle">✨</span>
          <h3>Refined for your specific needs</h3>
        </div>
        <p className="needs-text">"{needs}"</p>
      </div>
      {onClear && (
        <button className="clear-btn" onClick={onClear}>
          Reset
        </button>
      )}

      <style>{`
        .refinement-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--accent-color);
          color: white;
          padding: 16px 24px;
          border-radius: 20px;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(25, 98, 84, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.05);
          animation: slideDown 0.4s ease-out;
        }

        .banner-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 2px;
        }

        .banner-header h3 {
          margin: 0;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          opacity: 0.85;
        }

        .sparkle {
          font-size: 14px;
        }

        .needs-text {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          line-height: 1.4;
        }

        .clear-btn {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 8px 18px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-left: 20px;
          flex-shrink: 0;
        }

        .clear-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.4);
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default RefinementContext;
