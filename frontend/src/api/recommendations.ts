import type { EnrichedRecommendationResponse, RecommendationsInput, SimulateRequest, DeepDiveRequest, FaqRequest, SuggestRefinementRequest } from '../types/api';

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

export async function simulateImpact(req: SimulateRequest): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/Recommendations/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!response.ok) throw new Error('Failed to simulate');
  const data = await response.json();
  return data.response;
}

export async function deepDiveReason(req: DeepDiveRequest): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/Recommendations/deepdive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!response.ok) throw new Error('Failed to get deep dive');
  const data = await response.json();
  return data.response;
}

export async function generateFaq(req: FaqRequest): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/Recommendations/faq`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!response.ok) throw new Error('Failed to get FAQs');
  const data = await response.json();
  return data.faqs;
}

export async function suggestRefinement(req: SuggestRefinementRequest): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/Recommendations/suggest-refinement`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!response.ok) throw new Error('Failed to get suggestion');
  const data = await response.json();
  return data.suggestion;
}

export async function generatePersona(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/Recommendations/generate-persona`);
  if (!response.ok) throw new Error('Failed to generate persona');
  return response.json();
}
