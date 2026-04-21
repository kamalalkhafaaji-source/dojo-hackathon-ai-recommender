import { useState, useEffect, useCallback } from 'react';
import { fetchRecommendations } from '../api/recommendations';
import type { EnrichedRecommendationResponse } from '../types/api';

export function useRecommendations(initialPersona?: string) {
  const [data, setData] = useState<EnrichedRecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [persona, setPersona] = useState<string | undefined>(initialPersona);
  const [userNeeds, setUserNeeds] = useState<string | undefined>();

  const getRecommendations = useCallback(async (p?: string, needs?: string) => {
    // Don't fetch if no persona is selected
    if (!p) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchRecommendations({ persona: p, userNeeds: needs });
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch recommendations:', errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getRecommendations(persona, userNeeds);
  }, [persona, userNeeds, getRecommendations]);

  const refine = (needs: string) => {
    setUserNeeds(needs);
  };

  const changePersona = (newPersona: string) => {
    setPersona(newPersona);
    setUserNeeds(undefined); // Reset needs when persona changes
  };

  return {
    data,
    isLoading,
    error,
    refine,
    changePersona,
    currentPersona: persona,
    currentUserNeeds: userNeeds,
    refresh: () => getRecommendations(persona, userNeeds)
  };
}
