import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import type { CandidateList, CandidateStats } from '../types/api';

export interface CandidateWithStats extends Omit<CandidateList, 'stats'> {
  stats: CandidateStats | null;
}

export function useCandidatesWithStats(state: string, office?: string, activeOnly = false) {
  return useQuery({
    queryKey: ['candidates-with-stats', state, office, activeOnly],
    queryFn: async () => {
      // Get all candidates for the state
      const candidatesResponse = await apiClient.getCandidatesByState(state);

      // Filter by office if specified
      let filtered = office
        ? candidatesResponse.items.filter((c: CandidateList) => c.office === office)
        : candidatesResponse.items;

      // Filter by active status if specified
      if (activeOnly) {
        filtered = filtered.filter((c: CandidateList) => c.is_active);
      }

      // Fetch stats for all candidates in a single batch request
      if (filtered.length === 0) {
        return [];
      }

      try {
        const candidateIds = filtered.map((c: CandidateList) => c.id);
        const statsMap = await apiClient.getBatchCandidateStats(candidateIds);

        // Map stats back to candidates
        const candidatesWithStats = filtered.map((candidate: CandidateList) => ({
          ...candidate,
          stats: statsMap[candidate.id] || null,
        }));

        return candidatesWithStats;
      } catch (error) {
        console.error('Failed to fetch batch candidate stats:', error);
        // Return candidates with null stats on error
        return filtered.map((candidate: CandidateList) => ({
          ...candidate,
          stats: null,
        }));
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
