import { useState, useMemo, useEffect } from 'react';
import SidebarNarrow from './components/SidebarNarrow';
import SidebarWide from './components/SidebarWide';
import FundingHeader from './components/FundingHeader';
import FundingInput from './components/FundingInput';
import { PaymentPlanCard } from './components/PaymentPlanCard';
import type { PaymentPlan } from './components/PaymentPlanCard';
import RefineOffers from './components/RefineOffers';
import RefinementContext from './components/RefinementContext';
import SummaryBox from './components/SummaryBox';
import ErrorMessage from './components/ErrorMessage';
import { useRecommendations } from './hooks/useRecommendations';

function App() {
  const { data, isLoading: isApiLoading, error, refine, changePersona, currentPersona, currentUserNeeds, refresh } = useRecommendations('rossis-restaurant');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [fundingInputAmount, setFundingInputAmount] = useState<number | ''>('');
  const [appliedCustomAmount, setAppliedCustomAmount] = useState<number | null>(null);
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const isLoading = isApiLoading || isLocalLoading;

  useEffect(() => {
    setAppliedCustomAmount(null);
    setFundingInputAmount('');
    
    // Always reset selection when fresh data comes from the API
    if (data) {
      const isAiGenerated = !data.isFallback && appliedCustomAmount === null;
      if (isAiGenerated && data.recommendations.length >= 2) {
        // AI response: always select the middle offer (which we've mapped to index 1)
        // Note: we wait for 'plans' useMemo to finish, so we do it in a small timeout 
        // or just rely on the selection useMemo logic below being triggered by data change.
        setSelectedPlanId(null); // Clear first to force trigger
      } else {
        setSelectedPlanId(null);
      }
    }
  }, [data]);

  const plans = useMemo<PaymentPlan[]>(() => {
    if (!data) return [];
    
    let recommendationsToUse = data.recommendations;
    const isAiGenerated = data && !data.isFallback && appliedCustomAmount === null;
    
    if (appliedCustomAmount !== null) {
      const allOffers = Object.values(data.offers);
      const sortedOffers = [...allOffers].sort((a, b) => {
        return Math.abs(a.fundingAmount - appliedCustomAmount) - Math.abs(b.fundingAmount - appliedCustomAmount);
      });
      
      const top3 = sortedOffers.slice(0, 3);
      recommendationsToUse = top3.map((offer, index) => ({
        offerId: offer.offerId,
        rank: index + 1,
        headline: index === 0 ? `Closest match to £${appliedCustomAmount.toLocaleString('en-GB', { maximumFractionDigits: 0 })}` : 'Alternative option',
        reasons: [
          `Funding amount: £${offer.fundingAmount.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`,
          `Repayment: £${offer.repaymentAmount.toLocaleString('en-GB', { maximumFractionDigits: 0 })} at ${offer.holdbackPercentage}% sweep`,
          `Estimated term: ${offer.daysUntilRepayment} days`
        ],
        repaymentTerm: offer.daysUntilRepayment.toString(),
        expirationDate: offer.expirationDate
      }));
    } else if (isAiGenerated && recommendationsToUse.length === 3) {
      // Reorder so that Rank 1 is in the middle (index 1)
      // Original order: [Rank 1, Rank 2, Rank 3] -> Goal: [Rank 2, Rank 1, Rank 3]
      const r1 = recommendationsToUse.find(r => r.rank === 1);
      const r2 = recommendationsToUse.find(r => r.rank === 2);
      const r3 = recommendationsToUse.find(r => r.rank === 3);
      if (r1 && r2 && r3) {
        recommendationsToUse = [r2, r1, r3];
      }
    }
    
    return recommendationsToUse.map((rec, index) => {
      const offer = data.offers[rec.offerId];
      const formatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });

      return {
        id: rec.offerId,
        amount: formatter.format(offer.fundingAmount),
        totalToPay: formatter.format(offer.repaymentAmount),
        paymentLabel: `${offer.holdbackPercentage}% of daily sales`,
        repaymentTerm: offer.daysUntilRepayment.toString(),
        expirationDate: offer.expirationDate,
        badge: rec.tag || (rec.rank === 1 ? 'Best fit' : rec.rank === 2 ? '2nd' : '3rd'),
        isBestFit: rec.rank === 1,
        isHighlighted: isAiGenerated && rec.rank === 1, // Highlight the best one (Rank 1), regardless of index
        reasons: rec.reasons
      };
    });
  }, [data, appliedCustomAmount]);

  // Set initial selected plan when data loads or changes
  useMemo(() => {
    if (plans.length > 0) {
      const isAiGenerated = data && !data.isFallback && appliedCustomAmount === null;
      
      // If AI generated and we haven't selected the middle one yet for THIS data set
      if (isAiGenerated && plans.length >= 2) {
        const middleOfferId = plans[1].id;
        if (selectedPlanId !== middleOfferId) {
          setSelectedPlanId(middleOfferId);
        }
      } else if (!isAiGenerated && selectedPlanId !== null && !plans.find(p => p.id === selectedPlanId)) {
        // Non-AI fallback: ensure we don't have a stale ID
        setSelectedPlanId(null);
      }
    }
  }, [plans, data, appliedCustomAmount]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0];
  const selectedOffer = data?.offers[selectedPlanId || ''] || (data ? Object.values(data.offers)[0] : null);

  const handleContinue = () => {
    if (selectedPlan) {
      alert(`Continuing with ${selectedPlan.paymentLabel} plan!`);
    }
  };

  const formatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
  const currentFundingAmount = fundingInputAmount !== '' ? fundingInputAmount : (selectedOffer?.fundingAmount || 0);

  // Calculate dynamic min and max from available offers
  const minFundingAmount = data ? Math.min(...Object.values(data.offers).map(o => o.fundingAmount)) : 6000;
  const maxFundingAmount = data ? Math.max(...Object.values(data.offers).map(o => o.fundingAmount)) : 25000;

  return (
    <div className="app-layout">
      <SidebarNarrow />
      <SidebarWide />
      
      <main className="main-content">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FundingHeader maxAmount={!isLoading && data ? maxFundingAmount : undefined} />
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
                <option value="rossis-restaurant">Rossi's Restaurant</option>
                <option value="lucias-coffee">Lucia's Coffee</option>
                <option value="salty-dog-bar">Salty Dog Bar</option>
              </select>
            </div>
          </div>
          
          {data && (
            <FundingInput 
              amount={currentFundingAmount}
              min={minFundingAmount}
              max={maxFundingAmount}
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

          <div className="section-title-row">
            <h2 className="section-title">
              {isLoading && !data ? 'Finding your best offers...' : data ? `Recommended for ${data.merchant.tradingName}:` : 'System Error'}
            </h2>

            {data && !isLoading && !error && (
              <div className={`ai-status-badge ${(data.isFallback || appliedCustomAmount !== null) ? 'fallback' : 'ai'}`}>
                {(data.isFallback || appliedCustomAmount !== null) ? (
                  <><span>⚠️</span> This is not generated through AI</>
                ) : (
                  <><span>✨</span> These are AI recommended responses</>
                )}
              </div>
            )}
          </div>

          <div className="refinement-row">
            {data && (
              <RefineOffers 
                minimal 
                onRefine={(needs) => { 
                  setSelectedPlanId(null); 
                  refine(needs); 
                }} 
                isLoading={isLoading} 
              />
            )}
          </div>

          {data && currentUserNeeds && !isLoading && !error && !data.isFallback && (
            <RefinementContext 
              needs={currentUserNeeds} 
              onClear={() => {
                setSelectedPlanId(null);
                refine(""); // Clear the needs
              }}
            />
          )}

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

              {!isLoading && data?.aiWarning && (
                <div className="ai-warning-banner">
                  <span className="ai-warning-icon">⚠️</span>
                  <span>{data.aiWarning}</span>
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
                {selectedPlan && selectedOffer && (
                  <SummaryBox 
                    fundingAmount={selectedPlan.amount}
                    fixedFee={formatter.format(selectedOffer.repaymentAmount - selectedOffer.fundingAmount)}
                    totalToPay={selectedPlan.totalToPay}
                    payment={selectedPlan.paymentLabel}
                    repaymentTerm={`${selectedPlan.repaymentTerm} days`}
                    expiryDate={selectedPlan.expirationDate}
                    onContinue={handleContinue}
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
        .section-title-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 0;
        }

        .refinement-row {
          width: 100%;
          margin-bottom: 24px;
        }

        .ai-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
        }

        .ai-status-badge.ai {
          background-color: #E6FFFA;
          color: #234E52;
          border: 1px solid #B2F5EA;
        }

        .ai-status-badge.fallback {
          background-color: #FFF5F5;
          color: #742A2A;
          border: 1px solid #FED7D7;
        }

        .ai-status-badge span {
          font-size: 14px;
        }

        .payment-plans {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-bottom: 40px;
          transition: opacity 0.2s ease;
          position: relative;
          align-items: center;
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
          display: flex;
          flex-direction: column;
          gap: 32px;
          width: 100%;
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

        .ai-warning-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(234, 179, 8, 0.08);
          border: 1px solid rgba(234, 179, 8, 0.4);
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 20px;
          font-size: 13px;
          color: #92400e;
          line-height: 1.5;
        }

        .ai-warning-icon {
          flex-shrink: 0;
          margin-top: 1px;
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
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
          /* Remove highlight scaling on smaller screens to avoid overlap */
          .skeleton-card, .plan-card.highlighted {
            transform: none;
          }
        }

        @media (max-width: 850px) {
          .section-title-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }

        @media (max-width: 700px) {
          .payment-plans {
            grid-template-columns: 1fr;
          }
          
          .container {
            padding-top: 40px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
