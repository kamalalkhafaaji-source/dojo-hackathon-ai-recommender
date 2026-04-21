using System.Text.Json;
using Microsoft.Extensions.Options;
using Mscc.GenerativeAI;
using OptimalOfferAI.Models;

namespace OptimalOfferAI.Services;

public class GeminiRecommenderService
{
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase, WriteIndented = true };

    public GeminiRecommenderService(IOptions<GeminiOptions> options)
    {
        _options = options.Value;
    }

    private readonly GeminiOptions _options;

    public async Task<RecommendationResponse> GetRecommendationsAsync(RecommendationRequest request)
    {
        var apiKey = _options.ApiKey;
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new InvalidOperationException("Gemini API Key is missing. Please set the GEMINI_API_KEY environment variable.");
        }

        var googleAi = new GoogleAI(apiKey);
        var model = googleAi.GenerativeModel(model: "gemini-2.0-flash");
        model.UseJsonMode = true;

        var prompt = PromptBuilder.BuildPrompt(request);

        // Retry up to 3 times on rate-limit errors
        GenerateContentResponse? response = null;
        for (var attempt = 0; attempt < 3; attempt++)
        {
            try
            {
                response = await model.GenerateContent(prompt);
                if (response != null) break;
            }
            catch (HttpRequestException ex) when (ex.Message.Contains("429") || ex.Message.Contains("TooManyRequests"))
            {
                if (attempt == 2) throw;
                await Task.Delay(TimeSpan.FromSeconds(5 * (attempt + 1)));
            }
        }

        if (response == null)
        {
            throw new Exception("Gemini API returned a null response. This often happens if the API key is invalid or there was a connection issue.");
        }

        var text = response.Text;
        if (string.IsNullOrEmpty(text))
        {
            throw new Exception("Gemini API returned an empty or null text response. The request might have been blocked by safety filters or the model failed to generate content.");
        }

        // Strip markdown fences if present
        text = text.Trim();
        if (text.StartsWith("```"))
        {
            var firstNewline = text.IndexOf('\n');
            text = text[(firstNewline + 1)..];
            if (text.EndsWith("```"))
                text = text[..^3];
            text = text.Trim();
        }

        var result = JsonSerializer.Deserialize<RecommendationResponse>(text, JsonOpts)
                     ?? throw new Exception("Failed to parse Gemini response");
        return result;
    }
}
