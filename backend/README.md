# Backend Recommender

A .NET Console App representing the hackathon backend service.

## Goals
- Accept requests with merchant context and (optionally) user refinement needs.
- Formulate prompts for Gemini (or another LLM) including the mocked data and available offers.
- Enforce structured JSON output to return exactly 3 ranked recommendations with reasons.
- Read from local JSON fixtures for dummy data (no real Dojo services).
