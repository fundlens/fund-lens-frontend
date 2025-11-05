import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import type {
  CandidateFilters,
  CommitteeFilters,
  ContributorFilters,
  SearchParams,
} from '../types/api';

// Candidate hooks
export function useCandidates(filters?: CandidateFilters) {
  return useQuery({
    queryKey: ['candidates', filters],
    queryFn: () => apiClient.getCandidates(filters),
  });
}

export function useSearchCandidates(params: SearchParams, enabled = true) {
  return useQuery({
    queryKey: ['candidates', 'search', params],
    queryFn: () => apiClient.searchCandidates(params),
    enabled: enabled && params.q.length > 0,
  });
}

export function useStatesWithCandidates() {
  return useQuery({
    queryKey: ['candidates', 'states'],
    queryFn: () => apiClient.getStatesWithCandidates(),
  });
}

export function useCandidatesByState(state: string, filters?: CandidateFilters) {
  return useQuery({
    queryKey: ['candidates', 'by-state', state, filters],
    queryFn: () => apiClient.getCandidatesByState(state, filters),
  });
}

export function useCandidate(candidateId: number) {
  return useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: () => apiClient.getCandidate(candidateId),
  });
}

export function useCandidateStats(candidateId: number) {
  return useQuery({
    queryKey: ['candidate', candidateId, 'stats'],
    queryFn: () => apiClient.getCandidateStats(candidateId),
  });
}

// Committee hooks
export function useCommittees(filters?: CommitteeFilters) {
  return useQuery({
    queryKey: ['committees', filters],
    queryFn: () => apiClient.getCommittees(filters),
  });
}

export function useSearchCommittees(params: SearchParams, enabled = true) {
  return useQuery({
    queryKey: ['committees', 'search', params],
    queryFn: () => apiClient.searchCommittees(params),
    enabled: enabled && params.q.length > 0,
  });
}

export function useCommitteesByState(state: string) {
  return useQuery({
    queryKey: ['committees', 'by-state', state],
    queryFn: () => apiClient.getCommitteesByState(state),
  });
}

export function useCommittee(committeeId: number) {
  return useQuery({
    queryKey: ['committee', committeeId],
    queryFn: () => apiClient.getCommittee(committeeId),
  });
}

export function useCommitteeStats(committeeId: number) {
  return useQuery({
    queryKey: ['committee', committeeId, 'stats'],
    queryFn: () => apiClient.getCommitteeStats(committeeId),
  });
}

// Contributor hooks
export function useContributors(filters?: ContributorFilters) {
  return useQuery({
    queryKey: ['contributors', filters],
    queryFn: () => apiClient.getContributors(filters),
  });
}

export function useSearchContributors(params: SearchParams, enabled = true) {
  return useQuery({
    queryKey: ['contributors', 'search', params],
    queryFn: () => apiClient.searchContributors(params),
    enabled: enabled && params.q.length > 0,
  });
}

export function useTopContributors(limit = 10, state?: string, entityType?: string) {
  return useQuery({
    queryKey: ['contributors', 'top', { limit, state, entityType }],
    queryFn: () => apiClient.getTopContributors(limit, state, entityType),
  });
}

export function useContributor(contributorId: number) {
  return useQuery({
    queryKey: ['contributor', contributorId],
    queryFn: () => apiClient.getContributor(contributorId),
  });
}

export function useContributorStats(contributorId: number) {
  return useQuery({
    queryKey: ['contributor', contributorId, 'stats'],
    queryFn: () => apiClient.getContributorStats(contributorId),
  });
}

export function useContributorsByCandidate(candidateId: number, filters?: ContributorFilters) {
  return useQuery({
    queryKey: ['contributors', 'by-candidate', candidateId, filters],
    queryFn: () => apiClient.getContributorsByCandidate(candidateId, filters),
  });
}

export function useCommitteesByCandidate(candidateId: number, filters?: CommitteeFilters) {
  return useQuery({
    queryKey: ['committees', 'by-candidate', candidateId, filters],
    queryFn: () => apiClient.getCommitteesByCandidate(candidateId, filters),
  });
}

export function useContributorsByCommittee(committeeId: number, filters?: ContributorFilters) {
  return useQuery({
    queryKey: ['contributors', 'by-committee', committeeId, filters],
    queryFn: () => apiClient.getContributorsByCommittee(committeeId, filters),
  });
}

// Metadata hooks
export function useContributorStates(includeNames = false) {
  return useQuery({
    queryKey: ['metadata', 'contributors', 'states', { includeNames }],
    queryFn: () => apiClient.getContributorStates(includeNames),
  });
}

export function useContributorEntityTypes(includeLabels = false) {
  return useQuery({
    queryKey: ['metadata', 'contributors', 'entity-types', { includeLabels }],
    queryFn: () => apiClient.getContributorEntityTypes(includeLabels),
  });
}

export function useCommitteeStates(includeNames = false) {
  return useQuery({
    queryKey: ['metadata', 'committees', 'states', { includeNames }],
    queryFn: () => apiClient.getCommitteeStates(includeNames),
  });
}

export function useCommitteeTypes(includeLabels = false) {
  return useQuery({
    queryKey: ['metadata', 'committees', 'types', { includeLabels }],
    queryFn: () => apiClient.getCommitteeTypes(includeLabels),
  });
}

export function useCandidateStates(includeNames = false) {
  return useQuery({
    queryKey: ['metadata', 'candidates', 'states', { includeNames }],
    queryFn: () => apiClient.getCandidateStates(includeNames),
  });
}

export function useCandidateOffices(includeLabels = false) {
  return useQuery({
    queryKey: ['metadata', 'candidates', 'offices', { includeLabels }],
    queryFn: () => apiClient.getCandidateOffices(includeLabels),
  });
}

export function useAllStates(includeNames = false) {
  return useQuery({
    queryKey: ['metadata', 'states', { includeNames }],
    queryFn: () => apiClient.getAllStates(includeNames),
  });
}
