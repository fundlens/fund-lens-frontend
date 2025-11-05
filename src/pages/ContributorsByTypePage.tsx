import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { useContributorStates } from '../hooks/useApi'
import Breadcrumbs from '../components/Breadcrumbs'
import { apiClient } from '../services/api'
import { useQuery } from '@tanstack/react-query'
import type { StateMetadata } from '../types/api'

// Map URL slugs to display names and filter values
const CONTRIBUTOR_TYPE_MAP: Record<string, { display: string, filter: string }> = {
  'ind': { display: 'Individual Contributors', filter: 'IND' },
  'org': { display: 'Organization Contributors', filter: 'ORG' },
  'pac': { display: 'Political Action Committee Contributors', filter: 'PAC' },
  'can': { display: 'Candidate Contributors', filter: 'CAN' },
  'com': { display: 'Committee Contributors', filter: 'COM' },
  'pty': { display: 'Party Contributors', filter: 'PTY' },
  'ccm': { display: 'Candidate Committee Contributors', filter: 'CCM' },
}

export default function ContributorsByTypePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const type = searchParams.get('type')
  const location = searchParams.get('location')
  const typeSlug = type || ''
  const locationCode = location?.toUpperCase() || ''
  const typeInfo = CONTRIBUTOR_TYPE_MAP[typeSlug]
  const [showLocationMenu, setShowLocationMenu] = useState(false)

  usePageTitle(typeInfo?.display || 'Contributors by Type')

  const [displayLimit, setDisplayLimit] = useState(25)

  // Fetch contributor states metadata for location filter
  const { data: contributorStates } = useContributorStates(true)

  // Fetch top contributors filtered by entity type and optionally by location
  const { data: contributorsResponse, isLoading, error } = useQuery({
    queryKey: ['contributors', 'top', { entity_type: typeInfo?.filter, state: locationCode, limit: 500 }],
    queryFn: () => apiClient.getTopContributors(500, locationCode || undefined, typeInfo?.filter),
    enabled: !!typeInfo
  })

  const contributors = contributorsResponse?.items || []
  const displayedContributors = contributors.slice(0, displayLimit)
  const hasMoreContributors = contributors.length > displayLimit

  const handleShowMore = () => {
    setDisplayLimit(prev => Math.min(prev + 25, contributors.length))
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
      // If no params left, go back to contributors landing
      window.location.href = '/contributors'
    }
  }

  const clearAllFilters = () => {
    window.location.href = '/contributors'
  }

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Contributors', path: '/contributors' },
    { label: typeInfo?.display || 'Type' }
  ]

  if (!typeInfo) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Invalid contributor type.</p>
        </div>
        <Link to="/contributors" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
          &larr; Back to Contributors
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {typeInfo.display}
        </h1>
        <p className="text-lg text-gray-600">
          Top {typeInfo.display.toLowerCase()} by total amount contributed
        </p>
      </div>

      {/* Active Filters and Browse Options */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Active Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Filters:</span>

              <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                <span>Type: {typeInfo.filter}</span>
                <button
                  onClick={() => removeFilter('type')}
                  className="ml-1 hover:text-purple-900"
                  title="Remove type filter"
                >
                  ×
                </button>
              </div>

              {locationCode && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  <span>Location: {locationCode}</span>
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
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear all
              </button>
            </div>

            {/* Browse by Location - only show if not already filtering by location */}
            {!locationCode && contributorStates && contributorStates.length > 0 && (
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
                      {(contributorStates as StateMetadata[]).map((state) => (
                        <button
                          key={state.code}
                          onClick={() => addLocationFilter(state.code)}
                          className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                        >
                          {state.code} - {state.name}
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

      {/* Top Contributors */}
      <section>
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
                    <tr key={item.contributor?.id || item.contributor_id || index} className="hover:bg-gray-50">
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

            {/* Show More Button */}
            <div className="text-center mt-6">
              {hasMoreContributors ? (
                <button
                  onClick={handleShowMore}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  Load 25 more ({displayedContributors.length} of {contributors?.length})
                </button>
              ) : contributors && contributors.length > 0 ? (
                <p className="text-gray-600 font-medium">
                  {contributors.length} {contributors.length === 1 ? 'item' : 'items'}
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No contributors found for this type.</p>
          </div>
        )}
      </section>
    </div>
  )
}
