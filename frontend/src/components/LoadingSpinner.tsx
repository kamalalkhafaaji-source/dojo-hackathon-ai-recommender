import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  fullPage?: boolean;
}

/**
 * A modern CSS-based loading spinner that aligns with the DOJO design system.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ label, fullPage }) => {
  const spinner = (
    <div className="spinner-container">
      <div className="spinner"></div>
      {label && <p className="spinner-label">{label}</p>}
      
      <style>{`
        .spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          width: 100%;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(25, 98, 84, 0.1);
          border-radius: 50%;
          border-top-color: var(--accent-color);
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 16px;
        }

        .spinner-label {
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        ${fullPage ? `
          .spinner-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255, 255, 255, 0.8);
            z-index: 1000;
            backdrop-filter: blur(4px);
          }
        ` : ''}
      `}</style>
    </div>
  );

  return spinner;
};

export default LoadingSpinner;
