import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useCandidate, useCandidateStats, useContributorsByCandidate, useCommitteesByCandidate, useContributorEntityTypes, useContributorStates } from '../hooks/useApi'
import { usePageTitle } from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'
import type { EntityTypeMetadata, StateMetadata } from '../types/api'

export default function CandidateDetailPage() {
  const { candidateId } = useParams<{ candidateId: string; state?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const id = parseInt(candidateId || '0', 10)

  const [activeTab, setActiveTab] = useState<'contributors' | 'contributions'>('contributors')
  const [contributorsLimit, setContributorsLimit] = useState(25)
  const [contributionsLimit, setContributionsLimit] = useState(25)

  // Sort state for Top Contributors tab (server-side sorting)
  const [sortBy, setSortBy] = useState<'name' | 'contribution_count' | 'total_amount'>('total_amount')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Pagination state for fetching all contributors
  const [contributorsPage, setContributorsPage] = useState(1)
  const [allContributors, setAllContributors] = useState<any[]>([])

  // Filter state
  const typeParam = searchParams.get('type')
  const locationParam = searchParams.get('location')
  const [showTypeMenu, setShowTypeMenu] = useState(false)
  const [showLocationMenu, setShowLocationMenu] = useState(false)

  const { data: candidate, isLoading: candidateLoading, error: candidateError } = useCandidate(id)
  const { data: stats, isLoading: statsLoading } = useCandidateStats(id)
  const { data: contributorsData, isLoading: contributorsLoading, error: contributorsError } = useContributorsByCandidate(id, {
    page: contributorsPage,
    page_size: 100,
    include_contributions: true,
    sort_by: sortBy,
    order: sortDirection
  })
  const { data: committees, isLoading: committeesLoading } = useCommitteesByCandidate(id)

  // Handle sort changes for Top Contributors tab
  const handleSortChange = (newSortBy: 'name' | 'contribution_count' | 'total_amount') => {
    if (sortBy === newSortBy) {
      // Toggle direction if same column
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      // New column, set to descending by default (except name)
      setSortBy(newSortBy)
      setSortDirection(newSortBy === 'name' ? 'asc' : 'desc')
    }
    // Reset pagination when sort changes
    setContributorsPage(1)
    setAllContributors([])
  }

  // Accumulate contributors as pages load
  useEffect(() => {
    if (contributorsData?.contributors) {
      setAllContributors(prev => {
        const newContributors = contributorsPage === 1
          ? contributorsData.contributors
          : [...prev, ...contributorsData.contributors]
        return newContributors
      })

      // Check if there are more pages to fetch
      if (contributorsData.meta?.has_next) {
        setContributorsPage(prev => prev + 1)
      }
    }
  }, [contributorsData, contributorsPage])

  // Fetch metadata for filters
  const { data: entityTypes } = useContributorEntityTypes(true)
  const { data: contributorStates } = useContributorStates(true)

  usePageTitle(candidate?.name || 'Candidate Details')

  // Filter helper functions
  const addFilter = (filterType: 'type' | 'location', value: string) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set(filterType, value)
    setSearchParams(newParams)
    setShowTypeMenu(false)
    setShowLocationMenu(false)
  }

  const removeFilter = (filterType: 'type' | 'location') => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete(filterType)
    setSearchParams(newParams)
  }

  const clearAllFilters = () => {
    setSearchParams({})
  }

  const getEntityTypeLabel = (code: string) => {
    const type = (entityTypes as EntityTypeMetadata[])?.find(t => t.code === code)
    return type?.label || code
  }

  const getLocationName = (code: string) => {
    const state = (contributorStates as StateMetadata[])?.find(s => s.code === code)
    return state?.name || code
  }

  // Calculate available filter options from unfiltered data
  const availableTypes = Array.from(new Set(allContributors.map(c => c.entity_type).filter(Boolean)))
  const availableStates = Array.from(new Set(allContributors.map(c => c.state).filter(Boolean)))

  // Apply filters to contributors data
  const filteredContributors = allContributors.filter(contributor => {
    if (typeParam && contributor.entity_type !== typeParam) return false
    if (locationParam && contributor.state !== locationParam) return false
    return true
  })

  if (candidateLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading candidate details...</p>
        </div>
      </div>
    )
  }

  if (candidateError || !candidate) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading candidate details.</p>
        </div>
        <Link to="/candidates" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
          &larr; Back to Candidates
        </Link>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const getOfficeDisplay = () => {
    if (candidate.office === 'H' && candidate.district && candidate.state) {
      return `U.S. House - ${candidate.state}-${candidate.district}`
    }
    if (candidate.office === 'S') {
      return 'U.S. Senate'
    }
    if (candidate.office === 'P') {
      return 'President'
    }
    return candidate.office
  }

  const getPartyColor = (party: string | null) => {
    if (!party) return 'bg-gray-100 text-gray-800'
    const p = party.toUpperCase()
    if (p.includes('DEM')) return 'bg-blue-100 text-blue-800'
    if (p.includes('REP')) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getCommitteeTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'C': 'Communication cost',
      'D': 'Delegate committee',
      'E': 'Electioneering communication',
      'H': 'House',
      'I': 'Independent expenditor (person or group)',
      'N': 'PAC - nonqualified',
      'O': 'Independent expenditure-only (Super PACs)',
      'P': 'Presidential',
      'Q': 'PAC - qualified',
      'S': 'Senate',
      'U': 'Single-candidate independent expenditure',
      'V': 'Hybrid PAC (with Non-Contribution Account) - Nonqualified',
      'W': 'Hybrid PAC (with Non-Contribution Account) - Qualified',
      'X': 'Party - nonqualified',
      'Y': 'Party - qualified',
      'Z': 'National party nonfederal account',
      'UNKNOWN': 'Unknown'
    }
    return typeMap[type] || type
  }

  const getOfficeSeal = () => {
    if (candidate.office === 'P') {
      return {
        src: '/Seal_of_the_President_of_the_United_States.svg',
        alt: 'Seal of the President of the United States'
      }
    }
    if (candidate.office === 'S') {
      return {
        src: '/Seal_of_the_United_States_Senate.svg.png',
        alt: 'Seal of the United States Senate'
      }
    }
    if (candidate.office === 'H') {
      return {
        src: '/Seal_of_the_United_States_House_of_Representatives.svg',
        alt: 'Seal of the United States House of Representatives'
      }
    }
    return null
  }

  const officeSeal = getOfficeSeal()

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Candidates', path: '/candidates' },
    { label: candidate.name }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs items={breadcrumbs} />

      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="border-b pb-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            {officeSeal && (
              <img
                src={officeSeal.src}
                alt={officeSeal.alt}
                className="w-16 h-16 object-contain flex-shrink-0"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {candidate.name}
              </h1>
              <p className="text-xl text-gray-600">
                {getOfficeDisplay()}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {candidate.party && (
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getPartyColor(candidate.party)}`}>
                {candidate.party}
              </span>
            )}
            {candidate.state && (
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {candidate.state}
              </span>
            )}
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              candidate.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
            }`}>
              {candidate.is_active ? 'Active Campaign' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">FEC Candidate ID</h3>
            <p className="text-gray-900">{candidate.fec_candidate_id || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">State Candidate ID</h3>
            <p className="text-gray-900">{candidate.state_candidate_id || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Campaign Finance Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Campaign Finance Statistics</h2>
        {statsLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Total Raised</h3>
              <p className="text-3xl font-bold text-blue-900">
                {formatCurrency(stats.total_amount)}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-sm font-medium text-green-800 mb-2">Total Contributions</h3>
              <p className="text-3xl font-bold text-green-900">
                {formatNumber(stats.total_contributions)}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-sm font-medium text-purple-800 mb-2">Unique Contributors</h3>
              <p className="text-3xl font-bold text-purple-900">
                {formatNumber(stats.unique_contributors)}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-6">
              <h3 className="text-sm font-medium text-orange-800 mb-2">Average Contribution</h3>
              <p className="text-3xl font-bold text-orange-900">
                {formatCurrency(stats.avg_contribution)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No statistics available.</p>
        )}
      </div>

      {/* Associated Committees */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Associated Committees</h2>
        {committeesLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : committees && committees.length > 0 ? (
          <div className="space-y-4">
            {committees.map((committee) => (
              <Link
                key={committee.id}
                to={`/committees/${committee.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{committee.name}</h3>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {committee.committee_type} - {getCommitteeTypeLabel(committee.committee_type)}
                  </span>
                  {committee.party && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {committee.party}
                    </span>
                  )}
                  {committee.state && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {committee.state}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No associated committees found.</p>
        )}
      </div>

      {/* Top Contributors and Contributions Tabs */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('contributors')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'contributors'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contributors
            </button>
            <button
              onClick={() => setActiveTab('contributions')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'contributions'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contributions
            </button>
          </nav>
        </div>

        {/* Filters Section */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-sm font-medium text-gray-700">Filter by:</span>

              {/* Type Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowTypeMenu(!showTypeMenu)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium flex items-center gap-2"
                >
                  <span>Type</span>
                  <svg className={`w-4 h-4 transition-transform ${showTypeMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showTypeMenu && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-10">
                    <div className="p-2">
                      {(entityTypes as EntityTypeMetadata[])?.filter(type => availableTypes.includes(type.code)).map((type) => (
                        <button
                          key={type.code}
                          onClick={() => addFilter('type', type.code)}
                          className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                        >
                          {type.code} - {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Location Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowLocationMenu(!showLocationMenu)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium flex items-center gap-2"
                >
                  <span>Location</span>
                  <svg className={`w-4 h-4 transition-transform ${showLocationMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showLocationMenu && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-10">
                    <div className="p-2">
                      {(contributorStates as StateMetadata[])?.filter(state => availableStates.includes(state.code)).map((state) => (
                        <button
                          key={state.code}
                          onClick={() => addFilter('location', state.code)}
                          className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                        >
                          {state.code} - {state.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {!typeParam && !locationParam ? (
                <span className="text-sm text-gray-500 italic">No filters applied</span>
              ) : (
                <>
                  <span className="text-sm text-gray-600">Active:</span>
                  {typeParam && (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      <span>Type: {getEntityTypeLabel(typeParam)}</span>
                      <button
                        onClick={() => removeFilter('type')}
                        className="ml-1 hover:text-purple-900"
                        title="Remove type filter"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {locationParam && (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      <span>Location: {getLocationName(locationParam)}</span>
                      <button
                        onClick={() => removeFilter('location')}
                        className="ml-1 hover:text-purple-900"
                        title="Remove location filter"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-purple-600 hover:text-purple-800 underline"
                  >
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {contributorsLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading contributors...</p>
          </div>
        ) : contributorsError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading contributor data: {String(contributorsError)}</p>
          </div>
        ) : activeTab === 'contributors' ? (
          <TopContributorsTab
            contributors={filteredContributors}
            displayLimit={contributorsLimit}
            setDisplayLimit={setContributorsLimit}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
          />
        ) : (
          <TopContributionsTab
            contributors={filteredContributors}
            displayLimit={contributionsLimit}
            setDisplayLimit={setContributionsLimit}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    </div>
  )
}

// Top Contributors Tab Component
function TopContributorsTab({
  contributors,
  displayLimit,
  setDisplayLimit,
  formatCurrency,
  formatNumber,
  sortBy,
  sortDirection,
  onSortChange,
}: {
  contributors: any[]
  displayLimit: number
  setDisplayLimit: (fn: (prev: number) => number) => void
  formatCurrency: (amount: number) => string
  formatNumber: (num: number) => string
  sortBy: 'name' | 'contribution_count' | 'total_amount'
  sortDirection: 'asc' | 'desc'
  onSortChange: (column: 'name' | 'contribution_count' | 'total_amount') => void
}) {
  const filteredContributors = contributors.filter(c => c.total_amount > 0)
  const displayedContributors = filteredContributors.slice(0, displayLimit)
  const hasMore = filteredContributors.length > displayLimit

  // Sort indicator component
  const SortIndicator = ({ column }: { column: 'name' | 'contribution_count' | 'total_amount' }) => {
    if (sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  if (displayedContributors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No contributors found.</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => onSortChange('name')}
                  className="group flex items-center gap-1 hover:text-gray-700 transition"
                >
                  <span>Contributor Name</span>
                  <SortIndicator column="name" />
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => onSortChange('contribution_count')}
                  className="group flex items-center gap-1 hover:text-gray-700 transition ml-auto"
                >
                  <span>Contributions</span>
                  <SortIndicator column="contribution_count" />
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => onSortChange('total_amount')}
                  className="group flex items-center gap-1 hover:text-gray-700 transition ml-auto"
                >
                  <span>Total Amount</span>
                  <SortIndicator column="total_amount" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedContributors.map((contributor, index) => (
              <tr key={contributor.contributor_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4">
                  <Link
                    to={`/contributors/${contributor.contributor_id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {contributor.contributor_name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {contributor.entity_type || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {contributor.city && contributor.state
                    ? `${contributor.city}, ${contributor.state}`
                    : contributor.state || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatNumber(contributor.contribution_count)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                  {formatCurrency(contributor.total_amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-center mt-6">
        {hasMore ? (
          <button
            onClick={() => setDisplayLimit(prev => prev + 25)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            Load 25 more ({displayedContributors.length} of {filteredContributors.length})
          </button>
        ) : filteredContributors.length > 0 ? (
          <p className="text-gray-600 font-medium">
            {filteredContributors.length} {filteredContributors.length === 1 ? 'item' : 'items'}
          </p>
        ) : null}
      </div>
    </>
  )
}

// Top Contributions Tab Component
function TopContributionsTab({
  contributors,
  displayLimit,
  setDisplayLimit,
  formatCurrency,
}: {
  contributors: any[]
  displayLimit: number
  setDisplayLimit: (fn: (prev: number) => number) => void
  formatCurrency: (amount: number) => string
}) {
  // Client-side sorting state
  const [sortColumn, setSortColumn] = useState<'name' | 'date' | 'amount'>('amount')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Handle sort change
  const handleSort = (column: 'name' | 'date' | 'amount') => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection(column === 'name' ? 'asc' : 'desc')
    }
  }

  // Sort indicator component
  const SortIndicator = ({ column }: { column: 'name' | 'date' | 'amount' }) => {
    if (sortColumn !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  // Flatten all individual contributions from all contributors
  const allContributions: Array<{
    id: number
    contributor_id: number
    contributor_name: string
    entity_type: string | null
    city: string | null
    state: string | null
    occupation: string | null
    date: string
    amount: number
    contribution_type: string
  }> = []

  contributors.forEach(contributor => {
    if (contributor.contributions && Array.isArray(contributor.contributions)) {
      contributor.contributions.forEach((contribution: any) => {
        allContributions.push({
          id: contribution.id,
          contributor_id: contributor.contributor_id,
          contributor_name: contributor.contributor_name,
          entity_type: contributor.entity_type,
          city: contributor.city,
          state: contributor.state,
          occupation: contributor.occupation,
          date: contribution.date,
          amount: parseFloat(contribution.amount),
          contribution_type: contribution.contribution_type
        })
      })
    }
  })

  // Filter out $0 contributions
  const filteredContributions = allContributions.filter(c => c.amount > 0)

  // Apply sorting
  const sortedContributions = [...filteredContributions].sort((a, b) => {
    let comparison = 0

    if (sortColumn === 'name') {
      comparison = a.contributor_name.localeCompare(b.contributor_name)
    } else if (sortColumn === 'date') {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
    } else if (sortColumn === 'amount') {
      comparison = a.amount - b.amount
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })

  const displayedContributions = sortedContributions.slice(0, displayLimit)
  const hasMore = sortedContributions.length > displayLimit

  if (displayedContributions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No contributions found.</p>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <>
      <div className="overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('name')}
                  className="group flex items-center gap-1 hover:text-gray-700 transition"
                >
                  <span>Contributor Name</span>
                  <SortIndicator column="name" />
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('date')}
                  className="group flex items-center gap-1 hover:text-gray-700 transition"
                >
                  <span>Date</span>
                  <SortIndicator column="date" />
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('amount')}
                  className="group flex items-center gap-1 hover:text-gray-700 transition ml-auto"
                >
                  <span>Amount</span>
                  <SortIndicator column="amount" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedContributions.map((contribution, index) => (
              <tr key={`${contribution.id}-${contribution.contributor_id}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4">
                  <Link
                    to={`/contributors/${contribution.contributor_id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {contribution.contributor_name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {contribution.entity_type || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {contribution.city && contribution.state
                    ? `${contribution.city}, ${contribution.state}`
                    : contribution.state || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(contribution.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                  {formatCurrency(contribution.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-center mt-6">
        {hasMore ? (
          <button
            onClick={() => setDisplayLimit(prev => prev + 25)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            Load 25 more ({displayedContributions.length} of {sortedContributions.length})
          </button>
        ) : sortedContributions.length > 0 ? (
          <p className="text-gray-600 font-medium">
            {sortedContributions.length} {sortedContributions.length === 1 ? 'item' : 'items'}
          </p>
        ) : null}
      </div>
    </>
  )
}
