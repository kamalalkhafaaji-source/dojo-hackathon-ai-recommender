import { useState, useMemo } from 'react';
import SidebarNarrow from './components/SidebarNarrow';
import SidebarWide from './components/SidebarWide';
import FundingHeader from './components/FundingHeader';
import FundingInput from './components/FundingInput';
import { PaymentPlanCard } from './components/PaymentPlanCard';
import type { PaymentPlan } from './components/PaymentPlanCard';
import RefineOffers from './components/RefineOffers';
import SummaryBox from './components/SummaryBox';
import LoadingSpinner from './components/LoadingSpinner';
import { useRecommendations } from './hooks/useRecommendations';

function App() {
  const { data, isLoading, error, refine, changePersona, currentPersona } = useRecommendations('rossis-restaurant');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const plans = useMemo<PaymentPlan[]>(() => {
    if (!data) return [];
    
    return data.recommendations.map((rec) => {
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
  }, [data]);

  // Set initial selected plan when data loads
  useMemo(() => {
    if (plans.length > 0 && !selectedPlanId) {
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
                value={currentPersona} 
                onChange={(e) => {
                  changePersona(e.target.value);
                  setSelectedPlanId(null);
                }}
                className="persona-select"
              >
                <option value="rossis-restaurant">Rossi's Restaurant</option>
                <option value="lucias-coffee">Lucia's Coffee</option>
                <option value="salty-dog-bar">Salty Dog Bar</option>
              </select>
            </div>
          </div>
          
          <FundingInput 
            amount={selectedOffer?.fundingAmount || 0}
            onChange={() => {}} // In this MVP, the amount comes from the AI-selected offer
            onConfirm={() => {}} 
          />

          <h2 className="section-title">
            {data ? `Recommended for ${data.merchant.tradingName}:` : 'Finding your best offers...'}
          </h2>

          {error && <div className="error-message">Error: {error}</div>}

          {!data && isLoading && <LoadingSpinner label="We are fetching your offers" />}

          <div className={`payment-plans ${isLoading && data ? 'loading' : ''}`}>
            {isLoading && data && (
              <div className="overlay-spinner">
                <LoadingSpinner label="Tailoring your results..." />
              </div>
            )}
            {plans.map(plan => (
              <PaymentPlanCard 
                key={plan.id}
                plan={plan}
                isActive={selectedPlanId === plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
              />
            ))}
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
          opacity: 0.3;
          pointer-events: none;
        }

        .overlay-spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          width: 100%;
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
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          border: 1px solid rgba(220, 38, 38, 0.2);
        }

        .persona-select {
          background: var(--input-bg);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 12px;
          outline: none;
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
