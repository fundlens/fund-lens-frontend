import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCandidatesByState, useCandidateStates } from '../hooks/useApi'
import { usePageTitle } from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'
import CandidateCard from '../components/CandidateCard'
import CandidateTableRow from '../components/CandidateTableRow'
import type { StateMetadata } from '../types/api'

export default function FederalLandingPage() {
  usePageTitle('Federal Races')

  const [displayLimit, setDisplayLimit] = useState(10)
  const [showTypeSection, setShowTypeSection] = useState(false)
  const [showLocationSection, setShowLocationSection] = useState(false)

  // Fetch metadata for browse menus
  const { data: candidateStates } = useCandidateStates(true)

  // Fetch top federal candidates across all races (MD only for now)
  const { data: candidatesWithStatsResponse, isLoading, error } = useCandidatesByState('MD', {
    include_stats: true,
    sort_by: 'total_amount',
    order: 'desc',
    page_size: 50
  })
  const candidatesWithStats = candidatesWithStatsResponse?.items

  // Filter to only candidates with fundraising > $0
  const candidatesWithFundraising = candidatesWithStats?.filter(
    c => c.stats && c.stats.total_amount > 0
  ) || []

  const displayedCandidates = candidatesWithFundraising.slice(0, displayLimit)
  const hasMoreCandidates = candidatesWithFundraising.length > displayLimit

  const handleShowMore = () => {
    setDisplayLimit(prev => Math.min(prev + 10, candidatesWithFundraising.length))
  }

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Federal Races' }
  ]

  const races = [
    {
      title: 'U.S. President',
      description: 'Presidential candidates and their campaign finances',
      path: '/federal/states/md/us-president',
      image: '/Seal_of_the_President_of_the_United_States.svg'
    },
    {
      title: 'U.S. Senate',
      description: 'Senate candidates and their campaign finances',
      path: '/federal/states/md/us-senate',
      image: '/Seal_of_the_United_States_Senate.svg.png'
    },
    {
      title: 'U.S. House of Representatives',
      description: 'House candidates and their campaign finances',
      path: '/federal/states/md/us-house',
      image: '/Seal_of_the_United_States_House_of_Representatives.svg'
    }
  ]


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mb-12">
        <div className="flex items-center gap-6 mb-4">
          <img
            src="/Great_Seal_of_the_United_States_(obverse).svg.webp"
            alt="Great Seal of the United States"
            className="w-20 h-20 object-contain"
          />
          <h1 className="text-4xl font-bold text-gray-900">
            Federal Campaign Finance
          </h1>
        </div>
        <p className="text-lg text-gray-600">
          Explore campaign finance data for federal elections: President, Senate, and House of Representatives
        </p>
      </div>

      {/* Browse by Candidate Type */}
      <section className="mb-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <button
            onClick={() => setShowTypeSection(!showTypeSection)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-xl font-bold text-gray-900">Browse by Candidate Type</h2>
            <span className="text-xl text-gray-600">{showTypeSection ? '−' : '+'}</span>
          </button>
          {showTypeSection && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {races.map((race) => (
                <Link
                  key={race.path}
                  to={race.path}
                  className="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex justify-center mb-4">
                    <img
                      src={race.image}
                      alt={race.title}
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {race.title}
                  </h3>
                  <p className="text-gray-600">{race.description}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Browse by Candidate Location */}
      <section className="mb-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <button
            onClick={() => setShowLocationSection(!showLocationSection)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-xl font-bold text-gray-900">Browse by Candidate Location</h2>
            <span className="text-xl text-gray-600">{showLocationSection ? '−' : '+'}</span>
          </button>
          {showLocationSection && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {(candidateStates as StateMetadata[])?.map((state) => (
                <Link
                  key={state.code}
                  to={`/federal/states/${state.code.toLowerCase()}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200 hover:border-blue-300"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {state.code} - {state.name}
                  </h3>
                  <p className="text-sm text-gray-600">All federal races</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Fundraisers */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Top Federal Fundraisers
        </h2>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading top fundraisers...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading fundraising data.</p>
          </div>
        ) : displayedCandidates && displayedCandidates.length > 0 ? (
          <>
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
                      Office
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
                      stateCode="MD"
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
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No fundraising data available.</p>
          </div>
        )}
      </section>
    </div>
  )
}
