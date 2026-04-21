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
  reasons: string[];
}

export interface MerchantSummary {
  tradingName: string;
  industry: string;
}

export interface EnrichedRecommendationResponse {
  recommendations: Recommendation[];
  offers: Record<string, McaOffer>;
  merchant: MerchantSummary;
}

export interface RecommendationsInput {
  persona?: string;
  userNeeds?: string;
}
