import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useContributor, useContributorStats, useCommitteeTypes, useCommitteeStates } from '../hooks/useApi'
import { usePageTitle } from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../services/api'
import type { CommitteeTypeMetadata, StateMetadata } from '../types/api'

export default function ContributorDetailPage() {
  const { contributorId, entityType: routeEntityType, state: routeState } = useParams<{
    contributorId: string
    entityType?: string
    state?: string
  }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const id = parseInt(contributorId || '0', 10)

  const [activeTab, setActiveTab] = useState<'recipients' | 'contributions'>('recipients')
  const [recipientsLimit, setRecipientsLimit] = useState(25)
  const [contributionsLimit, setContributionsLimit] = useState(25)
  const [contributionsPage, setContributionsPage] = useState(1)
  const [recipientsPage, setRecipientsPage] = useState(1)
  const [allContributions, setAllContributions] = useState<any[]>([])
  const [allRecipientsContributions, setAllRecipientsContributions] = useState<any[]>([])
  const [sortBy, setSortBy] = useState<'recipient' | 'date' | 'amount'>('amount')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Filter state
  const typeParam = searchParams.get('type')
  const locationParam = searchParams.get('location')
  const partyParam = searchParams.get('party')
  const [showTypeMenu, setShowTypeMenu] = useState(false)
  const [showLocationMenu, setShowLocationMenu] = useState(false)
  const [showPartyMenu, setShowPartyMenu] = useState(false)

  const { data: contributor, isLoading: contributorLoading, error: contributorError } = useContributor(id)
  const { data: stats, isLoading: statsLoading } = useContributorStats(id)

  // Fetch contributions data for Contributions tab (with pagination and sorting)
  const { data: contributionsData, isLoading: contributionsLoading, error: contributionsError } = useQuery({
    queryKey: ['contributor', id, 'contributions', contributionsPage, sortBy, sortDirection],
    queryFn: async () => {
      return apiClient.request<any>(`/contributors/${id}/contributions?page=${contributionsPage}&page_size=100&sort_by=${sortBy}&sort_direction=${sortDirection}`)
    },
    enabled: !!id && activeTab === 'contributions'
  })

  // Fetch contributions data for Recipients tab (no sorting, just pagination)
  const { data: recipientsData, isLoading: recipientsLoading, error: recipientsError } = useQuery({
    queryKey: ['contributor', id, 'recipients-contributions', recipientsPage],
    queryFn: async () => {
      return apiClient.request<any>(`/contributors/${id}/contributions?page=${recipientsPage}&page_size=100`)
    },
    enabled: !!id && activeTab === 'recipients'
  })

  // Fetch metadata for filters
  const { data: committeeTypes } = useCommitteeTypes(true)
  const { data: committeeStates } = useCommitteeStates(true)

  // Accumulate contributions for Contributions tab as new pages are loaded
  useEffect(() => {
    if (contributionsData?.contributions) {
      if (contributionsPage === 1) {
        setAllContributions(contributionsData.contributions)
      } else {
        setAllContributions(prev => [...prev, ...contributionsData.contributions])
      }
    }
  }, [contributionsData, contributionsPage])

  // Accumulate contributions for Recipients tab as new pages are loaded
  useEffect(() => {
    if (recipientsData?.contributions) {
      if (recipientsPage === 1) {
        setAllRecipientsContributions(recipientsData.contributions)
      } else {
        setAllRecipientsContributions(prev => [...prev, ...recipientsData.contributions])
      }
    }
  }, [recipientsData, recipientsPage])

  // Handle sort changes - reset to page 1 and clear accumulated data
  const handleSortChange = (newSortBy: 'recipient' | 'date' | 'amount') => {
    if (sortBy === newSortBy) {
      // Toggle direction if same column
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      // New column, set to descending by default (except recipient name)
      setSortBy(newSortBy)
      setSortDirection(newSortBy === 'recipient' ? 'asc' : 'desc')
    }
    // Reset to first page when sort changes
    setContributionsPage(1)
    setAllContributions([])
  }

  usePageTitle(`${contributor?.name || 'Contributor Details'}`)

  // Filter helper functions
  const addFilter = (filterType: 'type' | 'location' | 'party', value: string) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set(filterType, value)
    setSearchParams(newParams)
    setShowTypeMenu(false)
    setShowLocationMenu(false)
    setShowPartyMenu(false)
  }

  const removeFilter = (filterType: 'type' | 'location' | 'party') => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete(filterType)
    setSearchParams(newParams)
  }

  const clearAllFilters = () => {
    setSearchParams({})
  }

  const getCommitteeTypeLabel = (code: string) => {
    const type = (committeeTypes as CommitteeTypeMetadata[])?.find(t => t.code === code)
    return type?.label || code
  }

  const getCommitteeTypeDisplay = (code: string) => {
    const type = (committeeTypes as CommitteeTypeMetadata[])?.find(t => t.code === code)
    return type ? `${code} - ${type.label}` : code
  }

  const getLocationName = (code: string) => {
    const state = (committeeStates as StateMetadata[])?.find(s => s.code === code)
    return state?.name || code
  }

  // Define available parties
  const allParties = [
    { code: 'DEM', label: 'Democratic' },
    { code: 'REP', label: 'Republican' },
    { code: 'LIB', label: 'Libertarian' },
    { code: 'GRE', label: 'Green' },
    { code: 'IND', label: 'Independent' },
    { code: 'OTH', label: 'Other' }
  ]

  const getPartyLabel = (code: string) => {
    const party = allParties.find(p => p.code === code)
    return party?.label || code
  }

  // Apply filters to contributions data for Contributions tab
  const filteredContributions = allContributions.filter(contribution => {
    if (typeParam && contribution.committee_type !== typeParam) return false
    if (locationParam && contribution.committee_state !== locationParam) return false
    if (partyParam && contribution.committee_party !== partyParam) return false
    return true
  })

  // Apply filters to contributions data for Recipients tab
  const filteredRecipientsContributions = allRecipientsContributions.filter(contribution => {
    if (typeParam && contribution.committee_type !== typeParam) return false
    if (locationParam && contribution.committee_state !== locationParam) return false
    if (partyParam && contribution.committee_party !== partyParam) return false
    return true
  })

  // Calculate available filter options from unfiltered data (use recipients data as it's not affected by sorting)
  const availableTypes = Array.from(new Set(allRecipientsContributions.map(c => c.committee_type).filter(Boolean)))
  const availableStates = Array.from(new Set(allRecipientsContributions.map(c => c.committee_state).filter(Boolean)))
  const availableParties = Array.from(new Set(allRecipientsContributions.map(c => c.committee_party).filter(Boolean)))
  const parties = allParties.filter(p => availableParties.includes(p.code))

  if (contributorLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading contributor details...</p>
        </div>
      </div>
    )
  }

  if (contributorError || !contributor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading contributor details.</p>
        </div>
        <Link to="/contributors" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
          &larr; Back to Contributors
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Contributors', path: '/contributors' },
    { label: contributor.name }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs items={breadcrumbs} />

      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="border-b pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {contributor.name}
          </h1>
          <div className="flex gap-2 flex-wrap">
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              {contributor.entity_type}
            </span>
            {contributor.state && (
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {contributor.state}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
            <p className="text-gray-900">
              {contributor.city && contributor.state
                ? `${contributor.city}, ${contributor.state} ${contributor.zip || ''}`
                : contributor.state || 'N/A'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Employer</h3>
            <p className="text-gray-900">{contributor.employer || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Occupation</h3>
            <p className="text-gray-900">{contributor.occupation || 'N/A'}</p>
          </div>
          {contributor.match_confidence !== null && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Match Confidence</h3>
              <p className="text-gray-900">
                {(contributor.match_confidence * 100).toFixed(0)}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contributor Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Contribution Statistics</h2>
        {statsLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Total Contributed</h3>
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
                <h3 className="text-sm font-medium text-purple-800 mb-2">Unique Recipients</h3>
                <p className="text-3xl font-bold text-purple-900">
                  {formatNumber(stats.unique_recipients)}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-6">
                <h3 className="text-sm font-medium text-orange-800 mb-2">Average Contribution</h3>
                <p className="text-3xl font-bold text-orange-900">
                  {formatCurrency(stats.avg_contribution)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">First Contribution</h3>
                <p className="text-gray-900">{formatDate(stats.first_contribution_date)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Most Recent Contribution</h3>
                <p className="text-gray-900">{formatDate(stats.last_contribution_date)}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-600">No statistics available.</p>
        )}
      </div>

      {/* Contribution Recipients and Contributions Tabs */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('recipients')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'recipients'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recipients
            </button>
            <button
              onClick={() => setActiveTab('contributions')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'contributions'
                  ? 'border-purple-600 text-purple-600'
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
                      {(committeeTypes as CommitteeTypeMetadata[])?.filter(type => availableTypes.includes(type.code)).map((type) => (
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
                      {(committeeStates as StateMetadata[])?.filter(state => availableStates.includes(state.code)).map((state) => (
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

              {/* Party Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowPartyMenu(!showPartyMenu)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium flex items-center gap-2"
                >
                  <span>Party</span>
                  <svg className={`w-4 h-4 transition-transform ${showPartyMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showPartyMenu && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="p-2">
                      {parties.map((party) => (
                        <button
                          key={party.code}
                          onClick={() => addFilter('party', party.code)}
                          className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                        >
                          {party.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {!typeParam && !locationParam && !partyParam ? (
                <span className="text-sm text-gray-500 italic">No filters applied</span>
              ) : (
                <>
                  <span className="text-sm text-gray-600">Active:</span>
                  {typeParam && (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <span>Type: {getCommitteeTypeLabel(typeParam)}</span>
                      <button
                        onClick={() => removeFilter('type')}
                        className="ml-1 hover:text-green-900"
                        title="Remove type filter"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {locationParam && (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <span>Location: {getLocationName(locationParam)}</span>
                      <button
                        onClick={() => removeFilter('location')}
                        className="ml-1 hover:text-green-900"
                        title="Remove location filter"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {partyParam && (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <span>Party: {getPartyLabel(partyParam)}</span>
                      <button
                        onClick={() => removeFilter('party')}
                        className="ml-1 hover:text-green-900"
                        title="Remove party filter"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-green-600 hover:text-green-800 underline"
                  >
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {activeTab === 'recipients' ? (
          recipientsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">Loading recipient data...</p>
            </div>
          ) : recipientsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Error loading recipient data.</p>
            </div>
          ) : (
            <TopRecipientsTab
              contributions={filteredRecipientsContributions}
              displayLimit={recipientsLimit}
              setDisplayLimit={setRecipientsLimit}
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
              getCommitteeTypeDisplay={getCommitteeTypeDisplay}
              allContributions={allRecipientsContributions}
              onLoadMore={() => setRecipientsPage(prev => prev + 1)}
              isLoadingMore={recipientsLoading && recipientsPage > 1}
            />
          )
        ) : (
          contributionsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">Loading contribution data...</p>
            </div>
          ) : contributionsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Error loading contribution data.</p>
            </div>
          ) : (
            <TopContributionsTab
              contributions={filteredContributions}
              displayLimit={contributionsLimit}
              setDisplayLimit={setContributionsLimit}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              totalCount={stats?.total_contributions || 0}
              onLoadMore={() => setContributionsPage(prev => prev + 1)}
              isLoadingMore={contributionsLoading && contributionsPage > 1}
              getCommitteeTypeDisplay={getCommitteeTypeDisplay}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
            />
          )
        )}
      </div>
    </div>
  )
}

function TopRecipientsTab({
  contributions,
  displayLimit,
  setDisplayLimit,
  formatCurrency,
  formatNumber,
  getCommitteeTypeDisplay,
  allContributions,
  onLoadMore,
  isLoadingMore,
}: {
  contributions: any[]
  displayLimit: number
  setDisplayLimit: (fn: (prev: number) => number) => void
  formatCurrency: (amount: number) => string
  formatNumber: (num: number) => string
  getCommitteeTypeDisplay: (code: string) => string
  allContributions: any[]
  onLoadMore: () => void
  isLoadingMore: boolean
}) {
  const [sortColumn, setSortColumn] = useState<'recipient' | 'contributions' | 'total'>('total')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Group contributions by recipient and calculate totals
  const recipientMap = new Map<number, { name: string; id: number; total: number; count: number; type: string; state: string | null; party: string | null }>()

  contributions.forEach((contribution: any) => {
    const recipientId = contribution.committee_id
    const recipientName = contribution.committee_name || 'Unknown Committee'
    const amount = parseFloat(contribution.amount)

    if (recipientId && amount > 0) {
      if (recipientMap.has(recipientId)) {
        const existing = recipientMap.get(recipientId)!
        existing.total += amount
        existing.count += 1
      } else {
        recipientMap.set(recipientId, {
          id: recipientId,
          name: recipientName,
          total: amount,
          count: 1,
          type: contribution.committee_type || 'N/A',
          state: contribution.committee_state || null,
          party: contribution.committee_party || null
        })
      }
    }
  })

  // Handle sort
  const handleSort = (column: 'recipient' | 'contributions' | 'total') => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New column, set to descending by default (except recipient name)
      setSortColumn(column)
      setSortDirection(column === 'recipient' ? 'asc' : 'desc')
    }
  }

  // Convert to array and apply sorting
  const recipients = Array.from(recipientMap.values()).sort((a, b) => {
    let comparison = 0

    switch (sortColumn) {
      case 'recipient':
        comparison = a.name.localeCompare(b.name)
        break
      case 'contributions':
        comparison = a.count - b.count
        break
      case 'total':
        comparison = a.total - b.total
        break
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })

  const displayedRecipients = recipients.slice(0, displayLimit)

  // Calculate total unique recipients from all loaded contributions (not just filtered)
  const totalUniqueRecipients = new Set(allContributions.map(c => c.committee_id)).size

  // Check if we have more recipients to display from currently loaded data
  const hasMoreToDisplay = displayLimit < recipients.length

  // Check if we might have more recipients to load from server
  // We need to load more if we haven't loaded all contributions yet
  const allUniqueRecipientsLoaded = new Set(allContributions.map(c => c.committee_id))
  const hasMoreToLoad = allUniqueRecipientsLoaded.size >= displayLimit && allContributions.length > 0

  const handleShowMore = () => {
    // If we're near the end of loaded data, fetch more from server
    if (displayLimit + 25 >= recipients.length && hasMoreToLoad) {
      onLoadMore()
    }
    setDisplayLimit(prev => prev + 25)
  }

  // Sort indicator component
  const SortIndicator = ({ column }: { column: 'recipient' | 'contributions' | 'total' }) => {
    if (sortColumn !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  return (
    <>
      {displayedRecipients.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('recipient')}
                      className="group flex items-center gap-1 hover:text-gray-700 transition"
                    >
                      <span>Recipient</span>
                      <SortIndicator column="recipient" />
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Party
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('contributions')}
                      className="group flex items-center gap-1 hover:text-gray-700 transition ml-auto"
                    >
                      <span>Contributions</span>
                      <SortIndicator column="contributions" />
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('total')}
                      className="group flex items-center gap-1 hover:text-gray-700 transition ml-auto"
                    >
                      <span>Total Contributed</span>
                      <SortIndicator column="total" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedRecipients.map((recipient, index) => (
                  <tr key={recipient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/committees/${recipient.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {recipient.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {getCommitteeTypeDisplay(recipient.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {recipient.state || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {recipient.party || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatNumber(recipient.count)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                      {formatCurrency(recipient.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 text-center">
            {(hasMoreToDisplay || hasMoreToLoad) ? (
              <button
                onClick={handleShowMore}
                disabled={isLoadingMore}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Loading...
                  </>
                ) : (
                  `Load 25 more (${displayedRecipients.length} of ${totalUniqueRecipients.toLocaleString()})`
                )}
              </button>
            ) : recipients.length > 0 ? (
              <p className="text-gray-600 font-medium">
                {recipients.length.toLocaleString()} {recipients.length === 1 ? 'recipient' : 'recipients'}
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <p className="text-center py-12 text-gray-600">No recipients found.</p>
      )}
    </>
  )
}

function TopContributionsTab({
  contributions,
  displayLimit,
  setDisplayLimit,
  formatCurrency,
  formatDate,
  totalCount,
  onLoadMore,
  isLoadingMore,
  getCommitteeTypeDisplay,
  sortBy,
  sortDirection,
  onSortChange,
}: {
  contributions: any[]
  displayLimit: number
  setDisplayLimit: (fn: (prev: number) => number) => void
  formatCurrency: (amount: number) => string
  formatDate: (dateString: string | null) => string
  totalCount: number
  onLoadMore: () => void
  isLoadingMore: boolean
  getCommitteeTypeDisplay: (code: string) => string
  sortBy: 'recipient' | 'date' | 'amount'
  sortDirection: 'asc' | 'desc'
  onSortChange: (column: 'recipient' | 'date' | 'amount') => void
}) {
  // Filter contributions (server handles sorting)
  const filteredContributions = contributions.filter((c: any) => parseFloat(c.amount) > 0)

  const displayedContributions = filteredContributions.slice(0, displayLimit)
  const hasMoreToDisplay = displayLimit < filteredContributions.length
  const hasMoreToLoad = filteredContributions.length < totalCount

  const handleShowMore = () => {
    // If we're near the end of loaded data, fetch more from server
    if (displayLimit + 25 >= filteredContributions.length && hasMoreToLoad) {
      onLoadMore()
    }
    setDisplayLimit(prev => prev + 25)
  }

  // Sort indicator component
  const SortIndicator = ({ column }: { column: 'recipient' | 'date' | 'amount' }) => {
    if (sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  return (
    <>
      {displayedContributions.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => onSortChange('recipient')}
                      className="group flex items-center gap-1 hover:text-gray-700 transition"
                    >
                      <span>Recipient</span>
                      <SortIndicator column="recipient" />
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Party
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => onSortChange('date')}
                      className="group flex items-center gap-1 hover:text-gray-700 transition"
                    >
                      <span>Date</span>
                      <SortIndicator column="date" />
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => onSortChange('amount')}
                      className="group flex items-center gap-1 hover:text-gray-700 transition ml-auto"
                    >
                      <span>Amount</span>
                      <SortIndicator column="amount" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedContributions.map((contribution: any, index: number) => (
                  <tr key={contribution.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/committees/${contribution.committee_id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {contribution.committee_name || 'Unknown Committee'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {contribution.committee_type ? getCommitteeTypeDisplay(contribution.committee_type) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contribution.committee_state || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contribution.committee_party || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(contribution.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                      {formatCurrency(parseFloat(contribution.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 text-center">
            {(hasMoreToDisplay || hasMoreToLoad) ? (
              <button
                onClick={handleShowMore}
                disabled={isLoadingMore}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Loading...
                  </>
                ) : (
                  `Load 25 more (${displayedContributions.length.toLocaleString()} of ${totalCount.toLocaleString()})`
                )}
              </button>
            ) : filteredContributions.length > 0 ? (
              <p className="text-gray-600 font-medium">
                {totalCount.toLocaleString()} {totalCount === 1 ? 'item' : 'items'}
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <p className="text-center py-12 text-gray-600">No contributions found.</p>
      )}
    </>
  )
}
