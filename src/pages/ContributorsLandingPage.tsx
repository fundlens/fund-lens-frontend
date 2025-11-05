import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTopContributors, useContributorStates, useContributorEntityTypes } from '../hooks/useApi'
import { usePageTitle } from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'
import type { StateMetadata, EntityTypeMetadata } from '../types/api'

export default function ContributorsLandingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const typeParam = searchParams.get('type')
  const locationParam = searchParams.get('location')

  const hasBrowseParams = typeParam || locationParam

  usePageTitle('Contributors')

  const [displayLimit, setDisplayLimit] = useState(25)
  const [showTypeMenu, setShowTypeMenu] = useState(false)
  const [showLocationMenu, setShowLocationMenu] = useState(false)

  // Fetch metadata for filter menus
  const { data: contributorStates } = useContributorStates(true)
  const { data: entityTypes } = useContributorEntityTypes(true)

  // Fetch contributors based on filters
  const { data: contributorsResponse, isLoading, error } = useTopContributors(
    500,
    locationParam || undefined,
    typeParam || undefined
  )

  // Backend already filters contributors to only those with contributions > $100
  const contributorsWithContributions = contributorsResponse?.items || []

  // Backend now returns pagination metadata with accurate total count
  const totalContributorsCount = contributorsResponse?.meta?.total_items || 0

  // Calculate available filter options based on contributors with contributions
  const availableTypes = Array.from(new Set(contributorsWithContributions.map(c => c.contributor?.entity_type || c.entity_type).filter(Boolean)))
  const availableStates = Array.from(new Set(contributorsWithContributions.map(c => c.contributor?.state || c.state).filter(Boolean)))

  // Display top contributors in table
  const displayedContributors = contributorsWithContributions.slice(0, displayLimit)
  const hasMore = contributorsWithContributions.length > displayLimit

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

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Contributors' }
  ]

  // Helper functions to get display labels
  const getEntityTypeLabel = (code: string) => {
    const type = (entityTypes as EntityTypeMetadata[])?.find(t => t.code === code)
    return type?.label || code
  }

  const getLocationName = (code: string) => {
    const state = (contributorStates as StateMetadata[])?.find(s => s.code === code)
    return state?.name || code
  }

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Campaign Contributors
        </h1>
        <p className="text-lg text-gray-600">
          Explore individual and organizational campaign contributors
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
                  {(entityTypes as EntityTypeMetadata[])?.filter(type => availableTypes.includes(type.code)).map((type) => (
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
                  {(contributorStates as StateMetadata[])?.filter(state => availableStates.includes(state.code)).map((state) => (
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
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {!hasBrowseParams ? (
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

      {/* Top Contributors */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Top Contributors Overall
        </h2>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading contributors...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading contributor data.</p>
          </div>
        ) : displayedContributors && displayedContributors.length > 0 ? (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipients
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contributions
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Contributed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedContributors.map((item, index) => (
                    <tr key={item.contributor?.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/contributors/${item.contributor?.id || item.contributor_id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {item.contributor?.name || item.contributor_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {item.contributor?.entity_type || item.entity_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(item.contributor?.city || item.city) && (item.contributor?.state || item.state)
                          ? `${item.contributor?.city || item.city}, ${item.contributor?.state || item.state}`
                          : (item.contributor?.state || item.state) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatNumber(item.unique_recipients || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatNumber(item.contribution_count || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                        {formatCurrency(item.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 mb-4">
                Showing {displayedContributors.length} of {totalContributorsCount} contributors
              </p>
              {hasMore && (
                <button
                  onClick={() => setDisplayLimit(prev => prev + 25)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  Show 25 more
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No contributor data available.</p>
          </div>
        )}
      </section>
    </div>
  )
}
