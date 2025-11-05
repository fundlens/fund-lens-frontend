import type {
  PaginatedResponse,
  CandidateList,
  CandidateDetail,
  CandidateStats,
  CandidateFilters,
  CommitteeList,
  CommitteeDetail,
  CommitteeStats,
  CommitteeFilters,
  ContributorList,
  ContributorDetail,
  ContributorStats,
  ContributorFilters,
  TopContributor,
  ContributorsByEntityResponse,
  SearchParams,
  StateMetadata,
  EntityTypeMetadata,
  CommitteeTypeMetadata,
  OfficeMetadata,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fundlens.org';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private buildQueryString(params: Record<string, unknown>): string {
    const filtered = Object.entries(params).filter(([_, value]) => value !== undefined && value !== null);
    if (filtered.length === 0) return '';

    const searchParams = new URLSearchParams();
    filtered.forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    return `?${searchParams.toString()}`;
  }

  // Candidate endpoints
  async getCandidates(filters?: CandidateFilters): Promise<PaginatedResponse<CandidateList>> {
    const query = filters ? this.buildQueryString(filters) : '';
    return this.request<PaginatedResponse<CandidateList>>(`/candidates${query}`);
  }

  async searchCandidates(params: SearchParams): Promise<PaginatedResponse<CandidateList>> {
    const query = this.buildQueryString(params);
    return this.request<PaginatedResponse<CandidateList>>(`/candidates/search${query}`);
  }

  async getStatesWithCandidates(): Promise<string[]> {
    return this.request<string[]>('/candidates/states');
  }

  async getCandidatesByState(state: string, filters?: CandidateFilters): Promise<PaginatedResponse<CandidateList>> {
    const query = filters ? this.buildQueryString(filters) : '';
    return this.request<PaginatedResponse<CandidateList>>(`/candidates/by-state/${state}${query}`);
  }

  async getCandidate(candidateId: number): Promise<CandidateDetail> {
    return this.request<CandidateDetail>(`/candidates/${candidateId}`);
  }

  async getCandidateStats(candidateId: number): Promise<CandidateStats> {
    return this.request<CandidateStats>(`/candidates/${candidateId}/stats`);
  }

  // Committee endpoints
  async getCommittees(filters?: CommitteeFilters): Promise<PaginatedResponse<CommitteeList>> {
    const query = filters ? this.buildQueryString(filters) : '';
    return this.request<PaginatedResponse<CommitteeList>>(`/committees${query}`);
  }

  async searchCommittees(params: SearchParams): Promise<PaginatedResponse<CommitteeList>> {
    const query = this.buildQueryString(params);
    return this.request<PaginatedResponse<CommitteeList>>(`/committees/search${query}`);
  }

  async getCommitteesByState(state: string): Promise<CommitteeList[]> {
    return this.request<CommitteeList[]>(`/committees/by-state/${state}`);
  }

  async getCommittee(committeeId: number): Promise<CommitteeDetail> {
    return this.request<CommitteeDetail>(`/committees/${committeeId}`);
  }

  async getCommitteeStats(committeeId: number): Promise<CommitteeStats> {
    return this.request<CommitteeStats>(`/committees/${committeeId}/stats`);
  }

  // Contributor endpoints
  async getContributors(filters?: ContributorFilters): Promise<PaginatedResponse<ContributorList>> {
    const query = filters ? this.buildQueryString(filters) : '';
    return this.request<PaginatedResponse<ContributorList>>(`/contributors${query}`);
  }

  async searchContributors(params: SearchParams): Promise<PaginatedResponse<ContributorList>> {
    const query = this.buildQueryString(params);
    return this.request<PaginatedResponse<ContributorList>>(`/contributors/search${query}`);
  }

  async getTopContributors(limit = 10, state?: string, entityType?: string): Promise<PaginatedResponse<TopContributor>> {
    const params: Record<string, unknown> = { limit };
    if (state) params.state = state;
    if (entityType) params.entity_type = entityType;
    const query = this.buildQueryString(params);
    return this.request<PaginatedResponse<TopContributor>>(`/contributors/top${query}`);
  }

  async getContributor(contributorId: number): Promise<ContributorDetail> {
    return this.request<ContributorDetail>(`/contributors/${contributorId}`);
  }

  async getContributorStats(contributorId: number): Promise<ContributorStats> {
    return this.request<ContributorStats>(`/contributors/${contributorId}/stats`);
  }

  async getContributorsByCandidate(candidateId: number, filters?: ContributorFilters): Promise<ContributorsByEntityResponse> {
    const query = filters ? this.buildQueryString(filters) : '';
    return this.request<ContributorsByEntityResponse>(`/contributors/by-candidate/${candidateId}${query}`);
  }

  async getCommitteesByCandidate(candidateId: number, filters?: CommitteeFilters): Promise<CommitteeList[]> {
    const query = filters ? this.buildQueryString(filters) : '';
    return this.request<CommitteeList[]>(`/committees/by-candidate/${candidateId}${query}`);
  }

  async getContributorsByCommittee(committeeId: number, filters?: ContributorFilters): Promise<ContributorsByEntityResponse> {
    const query = filters ? this.buildQueryString(filters) : '';
    return this.request<ContributorsByEntityResponse>(`/contributors/by-committee/${committeeId}${query}`);
  }

  // Metadata endpoints
  async getContributorStates(includeNames = false): Promise<string[] | StateMetadata[]> {
    const query = includeNames ? '?include_names=true' : '';
    return this.request<string[] | StateMetadata[]>(`/metadata/contributors/states${query}`);
  }

  async getContributorEntityTypes(includeLabels = false): Promise<string[] | EntityTypeMetadata[]> {
    const query = includeLabels ? '?include_labels=true' : '';
    return this.request<string[] | EntityTypeMetadata[]>(`/metadata/contributors/entity-types${query}`);
  }

  async getCommitteeStates(includeNames = false): Promise<string[] | StateMetadata[]> {
    const query = includeNames ? '?include_names=true' : '';
    return this.request<string[] | StateMetadata[]>(`/metadata/committees/states${query}`);
  }

  async getCommitteeTypes(includeLabels = false): Promise<string[] | CommitteeTypeMetadata[]> {
    const query = includeLabels ? '?include_labels=true' : '';
    return this.request<string[] | CommitteeTypeMetadata[]>(`/metadata/committees/types${query}`);
  }

  async getCandidateStates(includeNames = false): Promise<string[] | StateMetadata[]> {
    const query = includeNames ? '?include_names=true' : '';
    return this.request<string[] | StateMetadata[]>(`/metadata/candidates/states${query}`);
  }

  async getCandidateOffices(includeLabels = false): Promise<string[] | OfficeMetadata[]> {
    const query = includeLabels ? '?include_labels=true' : '';
    return this.request<string[] | OfficeMetadata[]>(`/metadata/candidates/offices${query}`);
  }

  async getAllStates(includeNames = false): Promise<string[] | StateMetadata[]> {
    const query = includeNames ? '?include_names=true' : '';
    return this.request<string[] | StateMetadata[]>(`/metadata/states${query}`);
  }

  // Health endpoints
  async healthCheck(): Promise<Record<string, string>> {
    return this.request<Record<string, string>>('/health');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
