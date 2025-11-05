// API Response Types based on OpenAPI spec

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// Candidate Types
export interface CandidateList {
  id: number;
  name: string;
  office: string;
  state: string | null;
  district: string | null;
  party: string | null;
  is_active: boolean;
  stats?: CandidateStats;  // Optional stats when include_stats=true
}

export interface CandidateDetail extends CandidateList {
  fec_candidate_id: string | null;
  state_candidate_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateStats {
  candidate_id?: number;
  total_contributions: number;
  total_amount: number;
  unique_contributors: number;
  avg_contribution: number;
}

// Committee Types
export interface CommitteeList {
  id: number;
  name: string;
  committee_type: string;
  party: string | null;
  state: string | null;
  city: string | null;
  is_active: boolean;
  candidate_id: number | null;
  stats?: CommitteeStats;  // Optional stats when include_stats=true
}

export interface CommitteeDetail extends CommitteeList {
  fec_committee_id: string | null;
  state_committee_id: string | null;
  created_at: string;
  updated_at: string;
  candidate?: {
    id: number;
    name: string;
    office: string;
    state: string | null;
    district: string | null;
    party: string | null;
    is_active: boolean;
  };
}

export interface CommitteeStats {
  committee_id: number;
  total_contributions_received: number;
  total_amount_received: number;
  unique_contributors: number;
  avg_contribution: number;
}

// Contributor Types
export interface ContributorList {
  id: number;
  name: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  entity_type: string;
  employer: string | null;
  occupation: string | null;
}

export interface ContributorDetail extends ContributorList {
  match_confidence: number | null;
  created_at: string;
  updated_at: string;
}

export interface ContributorStats {
  contributor_id: number;
  total_contributions: number;
  total_amount: number;
  unique_recipients: number;
  avg_contribution: number;
  first_contribution_date: string | null;
  last_contribution_date: string | null;
}

// Top Contributor Response (from /contributors/top endpoint)
export interface TopContributor {
  contributor?: {
    id: number;
    name: string;
    first_name: string | null;
    last_name: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    entity_type: string;
    employer: string | null;
    occupation: string | null;
  };
  // Legacy flat structure (for backwards compatibility)
  contributor_id?: number;
  contributor_name?: string;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  entity_type?: string;
  employer?: string | null;
  occupation?: string | null;
  // Common fields
  total_amount: number;
  contribution_count?: number;
  unique_recipients?: number;
  first_contribution_date?: string | null;
  last_contribution_date?: string | null;
}

// Contributors by Candidate/Committee Response
export interface ContributorsByEntityResponse {
  candidate?: {
    id: number;
    name: string;
    office: string;
    state: string | null;
    district: string | null;
    party: string | null;
  };
  committee?: {
    id: number;
    name: string;
    committee_type: string;
    state: string | null;
    candidate_id: number | null;
    candidate_name: string | null;
  };
  summary: {
    total_contributors: number;
    total_amount_raised: string | number;
    total_contributions: number;
    first_contribution: string | null;
    last_contribution: string | null;
  };
  contributors: TopContributor[];
  meta: PaginationMeta;
}

// Query Parameters
export interface CandidateFilters {
  page?: number;
  page_size?: number;
  level?: string;
  state?: string;
  office?: string;
  party?: string;
  is_active?: boolean;
  district?: string;
  has_fundraising?: boolean;
  include_stats?: boolean;
  min_total_amount?: number;
  sort_by?: 'name' | 'total_amount' | 'contribution_count';
  order?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface ContributorFilters {
  page?: number;
  page_size?: number;
  state?: string;
  city?: string;
  entity_type?: string;
  employer?: string;
  occupation?: string;
  min_amount?: number;
  max_amount?: number;
  sort_by?: 'total_amount' | 'contribution_count' | 'name' | 'first_date' | 'last_date';
  order?: 'asc' | 'desc';
  include_contributions?: boolean;
  [key: string]: unknown;
}

export interface CommitteeFilters {
  page?: number;
  page_size?: number;
  state?: string;
  committee_type?: string;
  party?: string;
  is_active?: boolean;
  candidate_id?: number;
  has_candidate?: boolean;
  include_stats?: boolean;
  min_total_received?: number;
  sort_by?: 'name' | 'total_received';
  order?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface SearchParams {
  q: string;
  page?: number;
  page_size?: number;
  state?: string;
  office?: string;
  party?: string;
  is_active?: boolean;
  has_fundraising?: boolean;
  include_stats?: boolean;
  sort_by?: string;
  order?: 'asc' | 'desc';
  [key: string]: unknown;
}

// Metadata Types
export interface StateMetadata {
  code: string;
  name: string;
}

export interface EntityTypeMetadata {
  code: string;
  label: string;
}

export interface CommitteeTypeMetadata {
  code: string;
  label: string;
}

export interface OfficeMetadata {
  code: string;
  label: string;
}
