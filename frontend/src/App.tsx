import { useState } from 'react';
import SidebarNarrow from './components/SidebarNarrow';
import SidebarWide from './components/SidebarWide';
import FundingHeader from './components/FundingHeader';
import FundingInput from './components/FundingInput';
import { PaymentPlanCard } from './components/PaymentPlanCard';
import type { PaymentPlan } from './components/PaymentPlanCard';
import RefineOffers from './components/RefineOffers';
import SummaryBox from './components/SummaryBox';

const INITIAL_PLANS: PaymentPlan[] = [
  {
    id: 'plan-1',
    amount: '£14,000.00',
    totalToPay: '£25,800.00',
    paymentLabel: '8% of daily sales',
    badge: 'Best fit',
    isBestFit: true,
    reasons: [
      'Your low 8% sweep keeps ~£1,288/day free for operations',
      'This amount (£14k) is a manageable ~33% of your monthly turnover (£42k)',
      'Repayment in ~9 months, matching your coffee seasonality'
    ]
  },
  {
    id: 'plan-2',
    amount: '£14,000.00',
    totalToPay: '£23,800.00',
    paymentLabel: '10% of daily sales',
    badge: '2nd',
    reasons: [
      'Faster repayment helps you clear the debt quickly',
      'Optimized fee and repayment time for your business flow',
      'Manageable sweep amount for steady growth'
    ]
  },
  {
    id: 'plan-3',
    amount: '£14,000.00',
    totalToPay: '£22,000.00',
    paymentLabel: '12% of daily sales',
    badge: '3rd',
    reasons: [
      'Maximize your capital access and invest rapidly',
      'Quickest repayment to be debt-free faster',
      'Suitably larger sweep for high-volume periods'
    ]
  }
];

function App() {
  const [fundingAmount, setFundingAmount] = useState<number>(14000);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-1');

  const selectedPlan = INITIAL_PLANS.find(p => p.id === selectedPlanId) || INITIAL_PLANS[0];

  const handleConfirm = () => {
    console.log('Confirmed amount:', fundingAmount);
    // Logic to update plans based on amount would go here
  };

  const handleContinue = () => {
    alert(`Continuing with ${selectedPlan.paymentLabel} plan!`);
  };

  return (
    <div className="app-layout">
      <SidebarNarrow />
      <SidebarWide />
      
      <main className="main-content">
        <div className="container">
          <FundingHeader />
          
          <FundingInput 
            amount={fundingAmount}
            onChange={setFundingAmount}
            onConfirm={handleConfirm}
          />

          <h2 className="section-title">Choose your payment plan:</h2>

          <div className="payment-plans">
            {INITIAL_PLANS.map(plan => (
              <PaymentPlanCard 
                key={plan.id}
                plan={plan}
                isActive={selectedPlanId === plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
              />
            ))}
          </div>

          <div className="bottom-section">
            <RefineOffers />
            <SummaryBox 
              fundingAmount={selectedPlan.amount}
              fixedFee="£11,800.00" // Hardcoded for now based on original design
              totalToPay={selectedPlan.totalToPay}
              onContinue={handleContinue}
              onCancel={() => setSelectedPlanId('plan-1')}
            />
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
        }

        .bottom-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .footer-text {
          margin-top: 40px;
          margin-bottom: 40px;
          color: var(--text-secondary);
          font-size: 12px;
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
