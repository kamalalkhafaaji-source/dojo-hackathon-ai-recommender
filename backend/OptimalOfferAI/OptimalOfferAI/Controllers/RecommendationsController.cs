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
                return NotFound($"Persona not found.");

            return Ok(enriched);
        }
        catch (Exception ex)
        {
            return Problem(
                detail: ex.Message,
                title: "An error occurred while generating recommendations.",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}
