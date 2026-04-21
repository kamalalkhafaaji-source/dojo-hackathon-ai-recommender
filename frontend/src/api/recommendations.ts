import type { EnrichedRecommendationResponse, RecommendationsInput } from '../types/api';

const API_BASE_URL = 'http://localhost:5000';

export async function fetchRecommendations(input: RecommendationsInput): Promise<EnrichedRecommendationResponse> {
  const response = await fetch(`${API_BASE_URL}/Recommendations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchPersonas(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/personas`);
  if (!response.ok) {
    throw new Error(`Failed to fetch personas: ${response.statusText}`);
  }
  return response.json();
}
