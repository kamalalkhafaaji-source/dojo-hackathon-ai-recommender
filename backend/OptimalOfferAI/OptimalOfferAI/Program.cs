using OptimalOfferAI.Models;
using OptimalOfferAI.Services;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Load Gemini API key from env var if not in appsettings
if (Environment.GetEnvironmentVariable("GEMINI_API_KEY") is { } key)
    builder.Configuration["Gemini:ApiKey"] = key;

builder.Services.AddSingleton<GeminiRecommenderService>();
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();
app.UseCors();

var jsonOpts = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

// Load fixtures
var fixturesDir = Path.Combine(AppContext.BaseDirectory, "Fixtures");
if (!Directory.Exists(fixturesDir))
    fixturesDir = Path.Combine(Directory.GetCurrentDirectory(), "Fixtures");

var personas = new Dictionary<string, RecommendationRequest>(StringComparer.OrdinalIgnoreCase);
foreach (var file in Directory.GetFiles(fixturesDir, "*.json"))
{
    var json = await File.ReadAllTextAsync(file);
    var data = JsonSerializer.Deserialize<RecommendationRequest>(json, jsonOpts)!;
    var name = Path.GetFileNameWithoutExtension(file);
    personas[name] = data;
}

// List available personas
app.MapGet("/personas", () => Results.Json(personas.Keys));

// Get recommendations
app.MapPost("/recommendations", async (RecommendationsInput input, GeminiRecommenderService gemini) =>
{
    var personaKey = input.Persona ?? personas.Keys.First();
    if (!personas.TryGetValue(personaKey, out var fixture))
        return Results.NotFound($"Persona '{personaKey}' not found. Available: {string.Join(", ", personas.Keys)}");

    var request = fixture with { UserNeeds = input.UserNeeds };
    var result = await gemini.GetRecommendationsAsync(request);

    // Enrich response with offer details for the front-end
    var enriched = new
    {
        result.Recommendations,
        Offers = fixture.Offers.ToDictionary(o => o.OfferId),
        Merchant = new { fixture.Merchant.BusinessProfile.TradingName, fixture.Merchant.BusinessProfile.Industry }
    };
    return Results.Json(enriched);
});

app.Run();

record RecommendationsInput(string? Persona = null, string? UserNeeds = null);
