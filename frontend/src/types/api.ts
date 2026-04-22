export interface McaOffer {
  offerId: string;
  provider: string;
  fundingAmount: number;
  repaymentAmount: number;
  holdbackPercentage: number;
  daysUntilRepayment: number;
  expirationDate: string;
}

export interface Recommendation {
  offerId: string;
  rank: number;
  headline: string;
  tag?: string;
  healthScore?: number;
  projectedCashflow?: number[];
  reasons: string[];
}

export interface MerchantSummary {
  tradingName: string;
  industry: string;
}

export interface EnrichedRecommendationResponse {
  chainOfThought?: string;
  recommendations: Recommendation[];
  offers: Record<string, McaOffer>;
  merchant: MerchantSummary;
  isFallback: boolean;
  aiWarning?: string;
}

export interface RecommendationsInput {
  persona?: string;
  userNeeds?: string;
  isELI5?: boolean;
  sessionId?: string;
}

export interface SimulateRequest {
  offerDetails: string;
  merchantContext: string;
  userMessage: string;
}

export interface DeepDiveRequest {
  reason: string;
  offerDetails: string;
}

export interface FaqRequest {
  offerDetails: string;
  merchantContext: string;
}

export interface SuggestRefinementRequest {
  merchantContext: string;
}

}
