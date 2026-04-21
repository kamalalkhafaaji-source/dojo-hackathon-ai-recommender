import { useState, useMemo, useEffect } from 'react';
import SidebarNarrow from './components/SidebarNarrow';
import SidebarWide from './components/SidebarWide';
import FundingHeader from './components/FundingHeader';
import FundingInput from './components/FundingInput';
import { PaymentPlanCard } from './components/PaymentPlanCard';
import type { PaymentPlan } from './components/PaymentPlanCard';
import RefineOffers from './components/RefineOffers';
import SummaryBox from './components/SummaryBox';
import ErrorMessage from './components/ErrorMessage';
import { useRecommendations } from './hooks/useRecommendations';

function App() {
  const { data, isLoading: isApiLoading, error, refine, changePersona, currentPersona, refresh } = useRecommendations();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [fundingInputAmount, setFundingInputAmount] = useState<number | ''>('');
  const [appliedCustomAmount, setAppliedCustomAmount] = useState<number | null>(null);
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const isLoading = isApiLoading || isLocalLoading;

  useEffect(() => {
    setAppliedCustomAmount(null);
    setFundingInputAmount('');
  }, [data]);

  const plans = useMemo<PaymentPlan[]>(() => {
    if (!data) return [];
    
    let recommendationsToUse = data.recommendations;
    
    if (appliedCustomAmount !== null) {
      const allOffers = Object.values(data.offers);
      const sortedOffers = [...allOffers].sort((a, b) => {
        return Math.abs(a.fundingAmount - appliedCustomAmount) - Math.abs(b.fundingAmount - appliedCustomAmount);
      });
      
      const top3 = sortedOffers.slice(0, 3);
      recommendationsToUse = top3.map((offer, index) => ({
        offerId: offer.offerId,
        rank: index + 1,
        headline: index === 0 ? `Closest match to £${appliedCustomAmount.toLocaleString()}` : 'Alternative option',
        reasons: [
          `Funding amount: £${offer.fundingAmount.toLocaleString()}`,
          `Repayment: £${offer.repaymentAmount.toLocaleString()} at ${offer.holdbackPercentage}% sweep`,
          `Estimated term: ${offer.daysUntilRepayment} days`
        ]
      }));
    }
    
    return recommendationsToUse.map((rec) => {
      const offer = data.offers[rec.offerId];
      const formatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

      return {
        id: rec.offerId,
        amount: formatter.format(offer.fundingAmount),
        totalToPay: formatter.format(offer.repaymentAmount),
        paymentLabel: `${offer.holdbackPercentage}% of daily sales`,
        badge: rec.rank === 1 ? 'Best fit' : rec.rank === 2 ? '2nd' : '3rd',
        isBestFit: rec.rank === 1,
        reasons: rec.reasons
      };
    });
  }, [data, appliedCustomAmount]);

  // Set initial selected plan when data loads
  useMemo(() => {
    if (plans.length > 0 && (!selectedPlanId || !plans.find(p => p.id === selectedPlanId))) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0];
  const selectedOffer = data?.offers[selectedPlanId || ''] || (data ? Object.values(data.offers)[0] : null);

  const handleContinue = () => {
    if (selectedPlan) {
      alert(`Continuing with ${selectedPlan.paymentLabel} plan!`);
    }
  };

  const formatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
  const currentFundingAmount = fundingInputAmount !== '' ? fundingInputAmount : (selectedOffer?.fundingAmount || 0);

  return (
    <div className="app-layout">
      <SidebarNarrow />
      <SidebarWide />
      
      <main className="main-content">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FundingHeader />
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Persona:</span>
              <select 
                value={currentPersona || ''} 
                onChange={(e) => {
                  changePersona(e.target.value);
                  setSelectedPlanId(null);
                }}
                className="persona-select"
                disabled={isLoading}
              >
                <option value="">Select a persona...</option>
                <option value="rossis-restaurant">Rossi's Restaurant</option>
                <option value="lucias-coffee">Lucia's Coffee</option>
                <option value="salty-dog-bar">Salty Dog Bar</option>
              </select>
            </div>
          </div>
          
          {data && (
            <FundingInput 
              amount={currentFundingAmount}
              onChange={(val) => setFundingInputAmount(val)}
              onConfirm={() => {
                if (fundingInputAmount !== '' && fundingInputAmount !== appliedCustomAmount) {
                  setIsLocalLoading(true);
                  setTimeout(() => {
                    setAppliedCustomAmount(Number(fundingInputAmount));
                    setSelectedPlanId(null);
                    setIsLocalLoading(false);
                  }, 500);
                }
              }} 
            />
          )}

          <h2 className="section-title">
            {isLoading && !data ? 'Finding your best offers...' : data ? `Recommended for ${data.merchant.tradingName}:` : error ? 'System Error' : 'Select a persona to get started'}
          </h2>

          {error ? (
            <ErrorMessage 
              title="Failed to load offers" 
              message={error} 
              onRetry={refresh} 
            />
          ) : (
            <>
              {!isLoading && plans.length === 0 && !error && data && (
                <div className="empty-state">
                  <p>No recommendations available. Please select a different persona or try again.</p>
                </div>
              )}

              <div className={`payment-plans ${isLoading ? 'loading' : ''}`}>
                {isLoading ? (
                  <>
                    <div className="skeleton-card"></div>
                    <div className="skeleton-card"></div>
                    <div className="skeleton-card"></div>
                  </>
                ) : (
                  plans.map(plan => (
                    <PaymentPlanCard 
                      key={plan.id}
                      plan={plan}
                      isActive={selectedPlanId === plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                    />
                  ))
                )}
              </div>

              <div className="bottom-section">
                <RefineOffers onRefine={refine} isLoading={isLoading} />
                {selectedPlan && selectedOffer && (
                  <SummaryBox 
                    fundingAmount={selectedPlan.amount}
                    fixedFee={formatter.format(selectedOffer.repaymentAmount - selectedOffer.fundingAmount)}
                    totalToPay={selectedPlan.totalToPay}
                    onContinue={handleContinue}
                    onCancel={() => setSelectedPlanId(plans[0]?.id || null)}
                  />
                )}
              </div>
            </>
          )}

          <footer className="footer-text">
            If you'd like to discuss your offers, contact us
          </footer>
        </div>
      </main>

      <style>{`
        .section-title {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 20px;
        }

        .payment-plans {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 40px;
          transition: opacity 0.2s ease;
          position: relative;
        }

        .payment-plans.loading {
          opacity: 0.8;
          pointer-events: none;
        }

        .skeleton-card {
          background-color: var(--bg-color);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          height: 300px;
          animation: skeleton-pulse 1.5s infinite;
        }

        @keyframes skeleton-pulse {
          0%, 100% { background-color: var(--bg-color); }
          50% { background-color: rgba(0, 0, 0, 0.05); }
        }

        .bottom-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .footer-text {
          margin-top: 40px;
          margin-bottom: 120px;
          color: var(--text-secondary);
          font-size: 12px;
        }

        .error-message {
          color: #DC2626;
          background: rgba(220, 38, 38, 0.05);
          padding: 12px 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          border: 1px solid rgba(220, 38, 38, 0.2);
          line-height: 1.5;
        }

        .empty-state {
          background-color: var(--bg-color);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 40px 20px;
          text-align: center;
          color: var(--text-secondary);
        }

        .persona-select {
          background: var(--input-bg);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 12px;
          outline: none;
          cursor: pointer;
        }

        .persona-select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 1100px) {
          .payment-plans {
            grid-template-columns: 1fr;
          }
          .bottom-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
