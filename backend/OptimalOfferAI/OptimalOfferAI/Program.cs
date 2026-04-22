using OptimalOfferAI.Models;
using OptimalOfferAI.Services;
using OptimalOfferAI.Repositories;
using System.Text.Json;
using System.Reflection;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Load Gemini API key from env var if not in appsettings
if (Environment.GetEnvironmentVariable("GEMINI_API_KEY") is { } key)
    builder.Configuration["Gemini:ApiKey"] = key;

var apiKey = builder.Configuration["Gemini:ApiKey"];
if (string.IsNullOrEmpty(apiKey))
{
    Console.ForegroundColor = ConsoleColor.Yellow;
    Console.WriteLine("WARNING: Gemini:ApiKey is not set. The recommender service will fail.");
    Console.WriteLine("Please set the GEMINI_API_KEY environment variable.");
    Console.ResetColor();
}

builder.Services.Configure<GeminiOptions>(builder.Configuration.GetSection(GeminiOptions.SectionName));

builder.Services.AddSingleton<IPersonaRepository, FileBasedPersonaRepository>();
builder.Services.AddSingleton<GeminiRecommenderService>();
builder.Services.AddScoped<IOfferOrchestrator, OfferOrchestrator>();
builder.Services.AddMemoryCache();

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add OpenAPI services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "DOJO Optimal Offer AI API",
        Version = "v1",
        Description = "An API to recommend business funding offers using AI."
    });
    
    // Include XML comments for Controller documentation
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseCors("AllowAll");

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "DOJO Optimal Offer AI API v1");
    options.RoutePrefix = "swagger"; // Serves the Swagger UI at /swagger
});

app.MapControllers();

// Add a minimal API endpoint to list personas (replaces the previous map logic)
app.MapGet("/personas", async (IPersonaRepository repo) => 
{
    var keys = await repo.GetPersonaKeysAsync();
    return Results.Json(keys);
})
.WithName("GetPersonas")
.WithDescription("Retrieves a list of available mocked merchant personas.");

app.Run();
