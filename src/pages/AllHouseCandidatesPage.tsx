import { useMemo, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { useCandidatesByState } from '../hooks/useApi'
import { usePageTitle } from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'
import CandidateCard from '../components/CandidateCard'
import CandidateTableRow from '../components/CandidateTableRow'

// Map state codes to full names
const STATE_NAMES: Record<string, string> = {
  'MD': 'Maryland',
  // Add more states as they become available
}

export default function AllHouseCandidatesPage() {
  const { state } = useParams<{ state: string }>()
  const location = useLocation()
  const stateCode = state?.toUpperCase() || 'MD'
  const stateName = STATE_NAMES[stateCode] || stateCode

  const isNewStructure = location.pathname.startsWith('/federal/states/')
  const baseStatePath = isNewStructure ? `/federal/states/${stateCode.toLowerCase()}` : `/${stateCode.toLowerCase()}`

  usePageTitle(`U.S. House - ${stateCode}`)

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    ...(isNewStructure ? [{ label: 'Federal Races', path: '/federal' }] : []),
    { label: stateName, path: baseStatePath },
    { label: 'U.S. House' }
  ]

  const [isDistrictMenuOpen, setIsDistrictMenuOpen] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(10)

  // Fetch all House candidates for district navigation (without stats)
  const { data: allHouseCandidatesResponse } = useCandidatesByState(stateCode, { office: 'H' })
  const allHouseCandidates = allHouseCandidatesResponse?.items

  // Fetch House candidates with stats
  const { data: candidatesWithStatsResponse, isLoading, error } = useCandidatesByState(stateCode, {
    office: 'H',
    include_stats: true,
    sort_by: 'total_amount',
    order: 'desc',
    page_size: 50
  })
  const candidatesWithStats = candidatesWithStatsResponse?.items

  // Get unique districts for navigation
  const houseDistricts = useMemo(() => {
    if (!allHouseCandidates || !Array.isArray(allHouseCandidates)) return []

    const districts = allHouseCandidates
      .filter(c => c.district)
      .map(c => c.district as string)

    return Array.from(new Set(districts)).sort((a, b) => {
      const numA = parseInt(a)
      const numB = parseInt(b)
      return numA - numB
    })
  }, [allHouseCandidates])

  // Filter to only candidates with fundraising > $0
  const candidatesWithFundraising = candidatesWithStats?.filter(
    c => c.stats && c.stats.total_amount > 0
  ) || []

  // Candidates are already filtered and sorted by the API
  const displayedCandidates = candidatesWithFundraising.slice(0, displayLimit)
  const hasMoreCandidates = candidatesWithFundraising.length > displayLimit

  const handleShowMore = () => {
    setDisplayLimit(prev => Math.min(prev + 10, candidatesWithFundraising.length))
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading House candidates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading candidates. Please try again later.</p>
        </div>
        <Link to={baseStatePath} className="mt-4 inline-block text-blue-600 hover:text-blue-800">
          &larr; Back to {stateName}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <img
            src="/Seal_of_the_United_States_House_of_Representatives.svg"
            alt="Seal of the United States House of Representatives"
            className="w-16 h-16 object-contain"
          />
          <h1 className="text-3xl font-bold text-gray-900">
            U.S. House - {stateCode}
          </h1>
        </div>
        <p className="text-gray-600">
          2025-26 Election Cycle
        </p>
      </div>

      {/* View by District */}
      {houseDistricts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <button
            onClick={() => setIsDistrictMenuOpen(!isDistrictMenuOpen)}
            className="w-full flex items-center justify-between text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900">View by District</h2>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isDistrictMenuOpen ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isDistrictMenuOpen && (
            <div className="space-y-3 mt-4">
              {houseDistricts.map((district) => (
                <Link
                  key={district}
                  to={`${baseStatePath}/us-house/${stateCode.toLowerCase()}-${district}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{stateCode}-{district} - U.S. House</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Top Fundraisers */}
      {displayedCandidates && displayedCandidates.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Top Fundraisers - U.S. House - {stateCode}
          </h2>

          {/* Table view for medium and larger screens */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    District
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Party
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Raised
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedCandidates.map((candidate, index) => (
                  <CandidateTableRow
                    key={candidate.id}
                    candidate={candidate}
                    rank={index + 1}
                    showRace={false}
                    stateCode={stateCode}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Stacked card view for small screens */}
          <div className="md:hidden space-y-3 mb-6">
            {displayedCandidates.map((candidate, index) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                rank={index + 1}
                totalRaised={candidate.stats?.total_amount || 0}
              />
            ))}
          </div>

          {/* Show More Button */}
          {hasMoreCandidates && (
            <div className="text-center mt-6">
              <button
                onClick={handleShowMore}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Show More Candidates
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
