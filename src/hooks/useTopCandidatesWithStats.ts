import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import type { CandidateList, CandidateStats } from '../types/api';

export interface CandidateWithStats extends CandidateList {
  stats: CandidateStats | null;
}

// Helper to process in batches to avoid overwhelming the API
async function fetchInBatches<T, R>(
  items: T[],
  batchSize: number,
  fetchFn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fetchFn));
    results.push(...batchResults);
  }

  return results;
}

export function useTopCandidatesWithStats(state: string, limit = 10, office?: string) {
  return useQuery({
    queryKey: ['top-candidates-with-stats', state, limit, office],
    queryFn: async () => {
      // Get all active candidates for the state
      const candidates = await apiClient.getCandidatesByState(state);
      let activeCandidates = candidates.filter(c => c.is_active);

      // Filter by office if specified
      if (office) {
        activeCandidates = activeCandidates.filter(c => c.office === office);
      }

      // Fetch stats in batches of 10 to avoid overwhelming the API
      const candidatesWithStats = await fetchInBatches(
        activeCandidates,
        10,
        async (candidate) => {
          try {
            const stats = await apiClient.getCandidateStats(candidate.id);
            return { ...candidate, stats };
          } catch (error) {
            console.error(`Failed to fetch stats for candidate ${candidate.id}:`, error);
            return { ...candidate, stats: null };
          }
        }
      );

      // Filter to only those with fundraising > 0 and sort
      const withFundraising = candidatesWithStats
        .filter(c => (c.stats?.total_amount || 0) > 0)
        .sort((a, b) => {
          const aAmount = a.stats?.total_amount || 0;
          const bAmount = b.stats?.total_amount || 0;
          return bAmount - aAmount;
        });

      // Return top N
      return withFundraising.slice(0, limit);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1, // Only retry once on failure
  });
}
