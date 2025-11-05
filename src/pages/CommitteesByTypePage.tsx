import { Link, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { useCommittees } from '../hooks/useApi'
import { usePageTitle } from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'

export default function CommitteesByTypePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const type = searchParams.get('type')
  const location = searchParams.get('location')
  const typeCode = type?.toUpperCase() || ''
  const locationCode = location?.toUpperCase() || ''
  const [displayLimit, setDisplayLimit] = useState(25)
  const [showLocationMenu, setShowLocationMenu] = useState(false)

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

  usePageTitle(`${typeCode} - ${getCommitteeTypeLabel(typeCode)}`)

  // Fetch committees sorted by total received (we'll filter by type client-side)
  const { data: committeesResponse, isLoading, error } = useCommittees({
    include_stats: true,
    sort_by: 'total_received',
    order: 'desc',
    page_size: 100
  })
  const committees = committeesResponse?.items

  // Get unique states that have committees of this type with contributions
  const availableStates = Array.from(
    new Set(
      committees
        ?.filter(c =>
          c.stats &&
          c.stats.total_amount_received > 0 &&
          c.committee_type === typeCode &&
          c.state
        )
        .map(c => c.state as string)
    )
  ).sort()

  // Filter to only committees with fundraising > $0, matching type, and optionally matching location
  const filteredCommittees = committees?.filter(c =>
    c.stats &&
    c.stats.total_amount_received > 0 &&
    c.committee_type === typeCode &&
    (!locationCode || c.state === locationCode)
  ) || []

  const addLocationFilter = (state: string) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('location', state.toLowerCase())
    setSearchParams(newParams)
    setShowLocationMenu(false)
  }

  const removeFilter = (filterType: 'type' | 'location') => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete(filterType)
    if (newParams.toString()) {
      setSearchParams(newParams)
    } else {
      // If no params left, go back to committees landing
      window.location.href = '/committees'
    }
  }

  const clearAllFilters = () => {
    window.location.href = '/committees'
  }

  const displayedCommittees = filteredCommittees.slice(0, displayLimit)
  const hasMore = filteredCommittees.length > displayLimit

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
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
    { label: 'Committees', path: '/committees' },
    { label: `${typeCode} - ${getCommitteeTypeLabel(typeCode)}` }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {typeCode} - {getCommitteeTypeLabel(typeCode)}
        </h1>
        <p className="text-lg text-gray-600">
          Top fundraising committees
        </p>
      </div>

      {/* Active Filters and Browse Options */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Active Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Filters:</span>

              <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <span>Type: {typeCode}</span>
                <button
                  onClick={() => removeFilter('type')}
                  className="ml-1 hover:text-green-900"
                  title="Remove type filter"
                >
                  ×
                </button>
              </div>

              {locationCode && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <span>Location: {locationCode}</span>
                  <button
                    onClick={() => removeFilter('location')}
                    className="ml-1 hover:text-green-900"
                    title="Remove location filter"
                  >
                    ×
                  </button>
                </div>
              )}

              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear all
              </button>
            </div>

            {/* Browse by Location - only show if not already filtering by location */}
            {!locationCode && availableStates.length > 0 && (
              <div className="ml-auto relative">
                <button
                  onClick={() => setShowLocationMenu(!showLocationMenu)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium flex items-center gap-2"
                >
                  <span>+ Add Location Filter</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showLocationMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showLocationMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-10">
                    <div className="p-2">
                      {availableStates.map((state) => (
                        <button
                          key={state}
                          onClick={() => addLocationFilter(state)}
                          className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Fundraising Committees */}
      <section>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                        {committee.stats?.total_amount_received ? formatCurrency(committee.stats.total_amount_received) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setDisplayLimit(prev => prev + 25)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Show 25 more
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No committees found for this type.</p>
          </div>
        )}
      </section>
    </div>
  )
}
