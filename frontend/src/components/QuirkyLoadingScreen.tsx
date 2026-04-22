import React, { useState, useEffect, useRef } from 'react';

interface QuirkyLoadingScreenProps {
  isFinished: boolean;
  onComplete: () => void;
}

const quirkyMessages = [
  "Firing up the financial engines...",
  "Curating your data to the offers...",
  "Super analyzing the offers for you...",
  "Crunching the numbers with our finance gurus...",
  "Doing the final math (carry the one)...",
  "Sprinkling some AI magic on the results...",
  "Almost there, polishing the pixels..."
];

// Average expected time in milliseconds
const EXPECTED_LOAD_TIME = 25000;

const QuirkyLoadingScreen: React.FC<QuirkyLoadingScreenProps> = ({ isFinished, onComplete }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const isFinishedRef = useRef(isFinished);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    isFinishedRef.current = isFinished;
    if (isFinished) {
      setProgress(100);
      progressRef.current = 100;
      setMessageIndex(quirkyMessages.length - 1); // Jump to last message
      
      // Wait 1 second at 100% before triggering completion
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isFinished, onComplete]);

  useEffect(() => {
    if (isFinishedRef.current) return;

    // Handle message changes
    const messageInterval = setInterval(() => {
      setMessageIndex((prevIndex) => {
        if (prevIndex < quirkyMessages.length - 2) {
          return prevIndex + 1;
        }
        return prevIndex;
      });
    }, Math.floor(EXPECTED_LOAD_TIME / quirkyMessages.length));

    // Jumpy progress bar logic
    const jumpProgress = () => {
      if (isFinishedRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const expectedProgress = Math.min((elapsed / EXPECTED_LOAD_TIME) * 95, 95);
      
      const current = progressRef.current;
      
      if (current < 95) {
        // Random jump, but bounded by expected progress over time
        // We only jump if current is lagging behind expected
        if (current <= expectedProgress) {
          const jump = Math.floor(Math.random() * 8) + 2;
          let nextProgress = current + jump;
          
          // Don't let it exceed expected progress by too much to ensure it doesn't hit 95 too early
          const maxAllowed = Math.max(expectedProgress + 5, 5); 
          if (nextProgress > maxAllowed) nextProgress = maxAllowed;
          if (nextProgress > 95) nextProgress = 95;
          
          progressRef.current = nextProgress;
          setProgress(nextProgress);
        }
      }
      
      // Schedule next jump between 0.5s and 1.5s
      if (progressRef.current < 95) {
        const nextJumpDelay = Math.floor(Math.random() * 1000) + 500;
        setTimeout(jumpProgress, nextJumpDelay);
      }
    };

    // Start jumping
    setTimeout(jumpProgress, 500);

    return () => {
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="quirky-loading-container">
      <div className="loading-content">
        <h3 className="quirky-message fade-in-up" key={messageIndex}>
          {quirkyMessages[messageIndex]}
        </h3>
        
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="progress-percentage">
          {Math.floor(progress)}%
        </div>
      </div>

      <style>{`
        .quirky-loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          margin-top: 40px;
          margin-bottom: 60px;
          width: 100%;
          text-align: center;
          animation: fadeIn 0.5s ease-out forwards;
        }

        .loading-content {
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .quirky-message {
          font-size: 18px;
          color: var(--text-primary);
          font-weight: 500;
          letter-spacing: -0.2px;
          line-height: 1.4;
          margin: 0;
          min-height: 52px; /* Prevent jumping when text wraps */
          display: flex;
          align-items: flex-end;
        }

        .progress-bar-container {
          width: 100%;
          height: 8px;
          background-color: rgba(0, 0, 0, 0.05);
          border-radius: 100px;
          overflow: hidden;
          position: relative;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-color), #2BB8A0);
          border-radius: 100px;
          /* Faster transition for jumpy feel */
          transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
        }
        
        .progress-bar-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 1.5s infinite;
        }

        .progress-percentage {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          font-variant-numeric: tabular-nums;
        }

        .fade-in-up {
          animation: fadeInUp 0.4s ease-out forwards;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default QuirkyLoadingScreen;
