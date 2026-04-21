import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

/**
 * A generic error component that aligns with the DOJO design system.
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  title = "Something went wrong", 
  message, 
  onRetry 
}) => {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">{title}</h3>
      <p className="error-text">{message}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          Try again
        </button>
      )}

      <style>{`
        .error-container {
          background-color: #FFF5F5;
          border: 1px solid #FED7D7;
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          max-width: 500px;
          margin: 40px auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .error-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .error-title {
          font-size: 18px;
          font-weight: 600;
          color: #C53030;
          margin: 0;
        }

        .error-text {
          font-size: 15px;
          color: #742A2A;
          line-height: 1.5;
          margin: 0 0 8px 0;
        }

        .error-container .btn {
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
};

export default ErrorMessage;
