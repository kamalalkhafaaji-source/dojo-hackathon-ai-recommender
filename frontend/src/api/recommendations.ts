import type { EnrichedRecommendationResponse, RecommendationsInput } from '../types/api';

// Use environment variable or default to localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function fetchRecommendations(input: RecommendationsInput): Promise<EnrichedRecommendationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/Recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      let errorDetail = response.statusText;
      try {
        const errorBody = await response.json();
        errorDetail = errorBody.detail || errorBody.message || errorDetail;
      } catch {
        // Use default error message if response is not JSON
      }
      throw new Error(`Failed to fetch recommendations (${response.status}): ${errorDetail}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Unable to connect to API at ${API_BASE_URL}. Please ensure the backend is running.`);
    }
    throw error;
  }
}

export async function fetchPersonas(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/personas`);
    if (!response.ok) {
      throw new Error(`Failed to fetch personas: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Unable to connect to API at ${API_BASE_URL}. Please ensure the backend is running.`);
    }
    throw error;
  }
}
