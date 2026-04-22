using Microsoft.AspNetCore.Mvc;
using OptimalOfferAI.Models;
using OptimalOfferAI.Services;
using OptimalOfferAI.Repositories;

namespace OptimalOfferAI.Controllers;

[ApiController]
[Route("[controller]")]
[Produces("application/json")]
public class RecommendationsController : ControllerBase
{
    private readonly IOfferOrchestrator _orchestrator;

    public RecommendationsController(IOfferOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
    }

    /// <summary>
    /// Generates AI-powered funding offer recommendations for a given merchant persona and optional user needs.
    /// </summary>
    /// <param name="input">The payload containing the persona key and optional user needs.</param>
    /// <returns>A list of AI recommendations enriched with offer details.</returns>
    /// <response code="200">Returns the enriched recommendations.</response>
    /// <response code="404">If the specified persona is not found.</response>
    [HttpPost(Name = "GetRecommendations")]
    [ProducesResponseType(typeof(EnrichedRecommendationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRecommendations([FromBody] RecommendationsInput input)
    {
        try
        {
            var enriched = await _orchestrator.GetEnrichedRecommendationsAsync(input);

            if (enriched == null)
                return NotFound(new { message = "Persona not found." });

            return Ok(enriched);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetRecommendations: {ex.GetType().Name} - {ex.Message}");
            return BadRequest(new { 
                message = "Unable to generate recommendations at this time. Please try again later.",
                error = ex.Message 
            });
        }
    }

    [HttpPost("simulate")]
    public async Task<IActionResult> SimulateImpact([FromBody] SimulateRequest request, [FromServices] GeminiRecommenderService gemini)
    {
        var response = await gemini.SimulateImpactAsync(request.OfferDetails, request.MerchantContext, request.UserMessage);
        return Ok(new { response });
    }

    [HttpPost("deepdive")]
    public async Task<IActionResult> DeepDive([FromBody] DeepDiveRequest request, [FromServices] GeminiRecommenderService gemini)
    {
        var response = await gemini.GetDeepDiveAsync(request.Reason, request.OfferDetails);
        return Ok(new { response });
    }

    [HttpPost("faq")]
    public async Task<IActionResult> GenerateFaq([FromBody] FaqRequest request, [FromServices] GeminiRecommenderService gemini)
    {
        var response = await gemini.GenerateFaqAsync(request.OfferDetails, request.MerchantContext);
        return Ok(new { faqs = response });
    }

    [HttpPost("suggest-refinement")]
    public async Task<IActionResult> SuggestRefinement([FromBody] SuggestRefinementRequest request, [FromServices] GeminiRecommenderService gemini)
    {
        var response = await gemini.SuggestRefinementAsync(request.MerchantContext);
        return Ok(new { suggestion = response });
    }

    [HttpGet("generate-persona")]
    public async Task<IActionResult> GeneratePersona([FromServices] GeminiRecommenderService gemini)
    {
        var result = await gemini.GenerateDynamicPersonaAsync();
        if (result == null) return StatusCode(500, "Failed to generate persona.");
        return Ok(result);
    }
}

public record SimulateRequest(string OfferDetails, string MerchantContext, string UserMessage);
public record DeepDiveRequest(string Reason, string OfferDetails);
public record FaqRequest(string OfferDetails, string MerchantContext);
public record SuggestRefinementRequest(string MerchantContext);
