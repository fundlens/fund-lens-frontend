import { useSearchParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useCommittees, useCommitteeStates, useCommitteeTypes } from '../hooks/useApi'
import { usePageTitle } from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'
import type { StateMetadata, CommitteeTypeMetadata } from '../types/api'

export default function CommitteesLandingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const typeParam = searchParams.get('type')
  const locationParam = searchParams.get('location')
  const partyParam = searchParams.get('party')

  const hasBrowseParams = typeParam || locationParam || partyParam

  usePageTitle('Committees')
  const [displayLimit, setDisplayLimit] = useState(25)
  const [showTypeMenu, setShowTypeMenu] = useState(false)
  const [showLocationMenu, setShowLocationMenu] = useState(false)
  const [showPartyMenu, setShowPartyMenu] = useState(false)

  // Fetch metadata for filter menus
  const { data: committeeStates } = useCommitteeStates(true)
  const { data: committeeTypesMetadata } = useCommitteeTypes(true)

  // Fetch committees based on filters
  const filters = {
    committee_type: typeParam || undefined,
    state: locationParam || undefined,
    party: partyParam || undefined,
    include_stats: true,
    min_total_received: 0.01,  // Only fetch committees with active fundraising
    sort_by: 'total_received' as const,
    order: 'desc' as const,
    page_size: 1000
  }

  const { data: committeesResponse, isLoading, error } = useCommittees(filters)
  const allCommittees = committeesResponse?.items || []
  const totalCommitteesCount = committeesResponse?.meta?.total_items || 0

  // Backend now filters by min_total_received, so all returned committees have fundraising
  const committeesWithFundraising = allCommittees

  // Only show committees with fundraising > $0 in browse views
  const committeesToDisplay = committeesWithFundraising

  // Calculate available filter options based on committees with active fundraising
  const availableTypes = Array.from(new Set(committeesWithFundraising.map(c => c.committee_type)))
  const availableStates = Array.from(new Set(committeesWithFundraising.map(c => c.state).filter(Boolean)))
  const availableParties = Array.from(new Set(committeesWithFundraising.map(c => c.party).filter(Boolean)))

  // Party options for filter
  const allParties = [
    { code: 'DEM', label: 'Democratic' },
    { code: 'REP', label: 'Republican' },
    { code: 'LIB', label: 'Libertarian' },
    { code: 'GRE', label: 'Green' },
    { code: 'IND', label: 'Independent' },
    { code: 'OTH', label: 'Other' }
  ]
  const parties = allParties.filter(p => availableParties.includes(p.code))

  // Display top committees in table
  const displayedCommittees = committeesToDisplay.slice(0, displayLimit)
  const hasMore = committeesToDisplay.length > displayLimit

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

  const getPartyColor = (party: string | null) => {
    if (!party) return 'bg-gray-100 text-gray-800'
    const p = party.toUpperCase()
    if (p.includes('DEM')) return 'bg-blue-100 text-blue-800'
    if (p.includes('REP')) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Committees' }
  ]

  // Helper functions to get display labels
  const getCommitteeTypeLabel = (type: string) => {
    if (!committeeTypesMetadata) return type
    const typeData = (committeeTypesMetadata as CommitteeTypeMetadata[]).find(t => t.code === type)
    return typeData?.label || type
  }

  const getLocationName = (code: string) => {
    const state = (committeeStates as StateMetadata[])?.find(s => s.code === code)
    return state?.name || code
  }

  const getPartyLabel = (code: string) => {
    const party = allParties.find(p => p.code === code)
    return party?.label || code
  }

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Committees
        </h1>
        <p className="text-lg text-gray-600">
          Explore campaign committees, PACs, and political organizations
        </p>
      </div>

      {/* Filters Section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="text-sm font-medium text-gray-700">Filter by:</span>

            {/* Type Filter */}
            <div className="relative">
              <button
                onClick={() => setShowTypeMenu(!showTypeMenu)}
                className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm font-medium flex items-center gap-2"
              >
                <span>Type</span>
                <svg className={`w-4 h-4 transition-transform ${showTypeMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showTypeMenu && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-10">
                  {(committeeTypesMetadata as CommitteeTypeMetadata[])?.filter(type => availableTypes.includes(type.code)).map((type) => (
                    <button
                      key={type.code}
                      onClick={() => addFilter('type', type.code)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm first:rounded-t-lg last:rounded-b-lg"
                    >
                      {type.code} - {type.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location Filter */}
            <div className="relative">
              <button
                onClick={() => setShowLocationMenu(!showLocationMenu)}
                className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm font-medium flex items-center gap-2"
              >
                <span>Location</span>
                <svg className={`w-4 h-4 transition-transform ${showLocationMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showLocationMenu && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-10">
                  {(committeeStates as StateMetadata[])?.filter(state => availableStates.includes(state.code)).map((state) => (
                    <button
                      key={state.code}
                      onClick={() => addFilter('location', state.code)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm first:rounded-t-lg last:rounded-b-lg"
                    >
                      {state.code} - {state.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Party Filter */}
            <div className="relative">
              <button
                onClick={() => setShowPartyMenu(!showPartyMenu)}
                className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm font-medium flex items-center gap-2"
              >
                <span>Party</span>
                <svg className={`w-4 h-4 transition-transform ${showPartyMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showPartyMenu && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-10">
                  {parties.map((party) => (
                    <button
                      key={party.code}
                      onClick={() => addFilter('party', party.code)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm first:rounded-t-lg last:rounded-b-lg"
                    >
                      {party.code} - {party.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {!hasBrowseParams ? (
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

      {/* Top Fundraising Committees */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Top Fundraising Committees
        </h2>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading committees...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading committee data.</p>
          </div>
        ) : displayedCommittees && displayedCommittees.length > 0 ? (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Committee Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Party
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contributors
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contributions
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Raised
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedCommittees.map((committee, index) => (
                    <tr key={committee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/committees/${committee.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {committee.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {committee.committee_type} - {getCommitteeTypeLabel(committee.committee_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {committee.party ? (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPartyColor(committee.party)}`}>
                            {committee.party}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {committee.city && committee.state
                          ? `${committee.city}, ${committee.state}`
                          : committee.state || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatNumber(committee.stats?.unique_contributors || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatNumber(committee.stats?.total_contributions_received || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                        {committee.stats?.total_amount_received ? formatCurrency(committee.stats.total_amount_received) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 mb-4">
                Showing {displayedCommittees.length} of {totalCommitteesCount} committees
              </p>
              {hasMore && (
                <button
                  onClick={() => setDisplayLimit(prev => prev + 25)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Show 25 more
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No committee data available.</p>
          </div>
        )}
      </section>
    </div>
  )
}
