import { useState, useEffect, useCallback } from 'react';
import { fetchRecommendations } from '../api/recommendations';
import type { EnrichedRecommendationResponse } from '../types/api';

export function useRecommendations(initialPersona?: string) {
  const [data, setData] = useState<EnrichedRecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [persona, setPersona] = useState<string | undefined>(initialPersona);
  const [userNeeds, setUserNeeds] = useState<string | undefined>();
  const [refineTrigger, setRefineTrigger] = useState(0);
  const [isELI5, setIsELI5] = useState(false);

  const getRecommendations = useCallback(async (p?: string, needs?: string, eli5?: boolean) => {
    // Don't fetch if no persona is selected
    if (!p) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null); // Clear existing data so skeletons show during reload
    try {
      const result = await fetchRecommendations({ persona: p, userNeeds: needs, isELI5: eli5 });
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
    getRecommendations(persona, userNeeds, isELI5);
  }, [persona, userNeeds, refineTrigger, isELI5, getRecommendations]);

  const refine = (needs: string) => {
    setUserNeeds(needs);
    // Force re-fetch even when the same refine text is submitted repeatedly.
    setRefineTrigger((prev) => prev + 1);
  };

  const changePersona = (newPersona: string) => {
    setPersona(newPersona);
    setUserNeeds(undefined); // Reset needs when persona changes
    setRefineTrigger(0);
  };

  const toggleELI5 = () => {
    setIsELI5(prev => !prev);
  };

  return {
    data,
    isLoading,
    error,
    refine,
    changePersona,
    currentPersona: persona,
    currentUserNeeds: userNeeds,
    isELI5,
    toggleELI5,
    refresh: () => getRecommendations(persona, userNeeds, isELI5)
  };
}
