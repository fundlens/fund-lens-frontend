import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import type { CandidateList, CandidateStats } from '../types/api';

export interface CandidateWithStats extends CandidateList {
  stats: CandidateStats | null;
}

export function useCandidatesWithStats(state: string, office?: string, activeOnly = false) {
  return useQuery({
    queryKey: ['candidates-with-stats', state, office, activeOnly],
    queryFn: async () => {
      // Get all candidates for the state
      const candidates = await apiClient.getCandidatesByState(state);

      // Filter by office if specified
      let filtered = office
        ? candidates.filter(c => c.office === office)
        : candidates;

      // Filter by active status if specified
      if (activeOnly) {
        filtered = filtered.filter(c => c.is_active);
      }

      // Fetch stats for each candidate
      const candidatesWithStats = await Promise.all(
        filtered.map(async (candidate) => {
          try {
            const stats = await apiClient.getCandidateStats(candidate.id);
            return { ...candidate, stats };
          } catch (error) {
            console.error(`Failed to fetch stats for candidate ${candidate.id}:`, error);
            return { ...candidate, stats: null };
          }
        })
      );

      return candidatesWithStats;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
