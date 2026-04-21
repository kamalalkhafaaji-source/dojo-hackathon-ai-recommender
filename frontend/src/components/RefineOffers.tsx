import React from 'react';

/**
 * RefineOffers component for users to provide custom requirements.
 */
const RefineOffers: React.FC = () => {
  return (
    <div className="not-right">
      <h3>Not quite right?</h3>
      <p>Tell us more about what you need and we'll refine these offers.</p>
      <input type="text" placeholder="e.g. I need at least £30k, and a lower daily sweep" />
      <button className="btn btn-primary btn-full no-margin-bottom">Refine offers</button>

      <style>{`
        .not-right {
          background-color: var(--bg-color);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
        }

        .not-right h3 {
          margin-top: 0;
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 10px;
        }

        .not-right p {
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 15px;
        }

        .not-right input {
          width: 100%;
          background-color: var(--input-bg);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 15px;
          box-sizing: border-box;
        }

        .no-margin-bottom {
          margin-bottom: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default RefineOffers;
