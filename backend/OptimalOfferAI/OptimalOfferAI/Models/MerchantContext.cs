namespace OptimalOfferAI.Models;

public record RecommendationRequest(
    MerchantContext Merchant,
    List<McaOffer> Offers,
    string? UserNeeds = null
);

public record MerchantContext(
    BusinessProfile BusinessProfile,
    CardTurnover CardTurnover,
    CashFlowSignals CashFlowSignals,
    List<FundingHistoryEntry> FundingHistory,
    PeerSignal PeerSignal
);

public record BusinessProfile(
    string TradingName,
    string LegalType,
    string Mcc,
    string Industry,
    int TradingMonthsOnDojo,
    string City,
    string CountryIsoAlpha3
);

public record CardTurnover(
    string CurrencyIsoAlpha3,
    decimal MonthlySalesAmount,
    decimal Trend3mPct,
    decimal Trend12mPct,
    decimal AvgTransactionValue,
    string Seasonality
);

public record CashFlowSignals(
    List<string> PeakDays,
    List<string> QuietDays,
    List<string> RecentDips
);

public record FundingHistoryEntry(
    string Provider,
    string Product,
    decimal FundedAmount,
    decimal RepaymentAmount,
    decimal RemainingAmount,
    decimal HoldbackPercentage,
    bool IsRenewed
);

public record PeerSignal(
    string Segment,
    decimal TypicalAmount,
    decimal TypicalHoldbackPercentage,
    int TypicalTermDays
);

public record McaOffer(
    string OfferId,
    string Provider,
    decimal FundingAmount,
    decimal RepaymentAmount,
    decimal HoldbackPercentage,
    int DaysUntilRepayment,
    string ExpirationDate
);

