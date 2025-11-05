import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCandidatesByState } from '../hooks/useApi'
import { useTopCandidatesWithStats } from '../hooks/useTopCandidatesWithStats'
import CandidateCard from '../components/CandidateCard'
import CandidateTableRow from '../components/CandidateTableRow'

export default function MarylandPage() {
  // Fetch all Maryland candidates for race navigation
  const { data: allCandidates } = useCandidatesByState('MD')

  // Fetch top 10 candidates with stats (optimized to fetch in batches)
  const { data: topCandidates, isLoading, error } = useTopCandidatesWithStats('MD', 10)

  // Get unique races that have candidates
  const availableRaces = useMemo(() => {
    if (!allCandidates) return []

    const offices = Array.from(new Set(allCandidates.map(c => c.office)))
    const raceMap: { office: string; label: string; path: string }[] = []

    if (offices.includes('H')) {
      raceMap.push({ office: 'H', label: 'U.S. House of Representatives', path: '/states/MD/us-house' })
    }
    if (offices.includes('S')) {
      raceMap.push({ office: 'S', label: 'U.S. Senate', path: '/states/MD/us-senate' })
    }
    if (offices.includes('P')) {
      raceMap.push({ office: 'P', label: 'U.S. President', path: '/states/MD/us-president' })
    }

    return raceMap
  }, [allCandidates])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading Maryland candidates...</p>
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
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Maryland Federal Candidates
        </h1>
        <p className="text-gray-600">
          2025-26 Election Cycle
        </p>
      </div>

      {/* View by Race */}
      {availableRaces.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">View by Race</h2>
          <div className="space-y-3">
            {availableRaces.map((race) => (
              <Link
                key={race.office}
                to={race.path}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition border border-gray-200 hover:border-blue-300"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{race.label}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Top 10 Fundraisers across all races */}
      {topCandidates && topCandidates.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {topCandidates.length === 10 ? 'Top 10 Fundraisers - Maryland - All Races' : 'Top Fundraisers - Maryland - All Races'}
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
                    Race
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
                {topCandidates.map((candidate, index) => (
                  <CandidateTableRow
                    key={candidate.id}
                    candidate={candidate}
                    rank={index + 1}
                    showRace={true}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Stacked card view for small screens */}
          <div className="md:hidden space-y-3 mb-6">
            {topCandidates.map((candidate, index) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                rank={index + 1}
                totalRaised={candidate.stats?.total_amount || 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
