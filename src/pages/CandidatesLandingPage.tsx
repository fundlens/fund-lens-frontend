import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { useCandidates, useCandidateStates, useCandidateOffices } from '../hooks/useApi'
import { usePageTitle } from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'
import CandidateTableRow from '../components/CandidateTableRow'
import CandidateCard from '../components/CandidateCard'
import type { StateMetadata, OfficeMetadata } from '../types/api'

export default function CandidatesLandingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const levelParam = searchParams.get('level')
  const stateParam = searchParams.get('state')
  const officeParam = searchParams.get('office')
  const partyParam = searchParams.get('party')
  const districtParam = searchParams.get('district')

  // If there are any filter parameters, render the browse view
  const hasBrowseParams = levelParam || stateParam || officeParam || partyParam || districtParam

  usePageTitle('Candidates')
  const [displayLimit, setDisplayLimit] = useState(25)
  const [showLevelMenu, setShowLevelMenu] = useState(false)
  const [showStateMenu, setShowStateMenu] = useState(false)
  const [showOfficeMenu, setShowOfficeMenu] = useState(false)
  const [showPartyMenu, setShowPartyMenu] = useState(false)
  const [showDistrictMenu, setShowDistrictMenu] = useState(false)

  // Fetch metadata for browse menus
  const { data: candidateStates } = useCandidateStates(true)
  const { data: candidateOffices } = useCandidateOffices(true)

  // Fetch candidates based on filters
  const filters = {
    level: levelParam || undefined,
    state: stateParam || undefined,
    office: officeParam || undefined,
    party: partyParam || undefined,
    district: districtParam || undefined,
    include_stats: true,
    min_total_amount: 0.01,  // Only fetch candidates with active fundraising
    sort_by: 'total_amount',
    order: 'desc',
    page_size: 500
  }

  const { data: candidatesResponse, isLoading, error } = useCandidates(filters)
  const allCandidates = candidatesResponse?.items || []
  const totalCandidatesCount = candidatesResponse?.meta?.total_items || 0

  // Backend now filters by min_total_amount, so all returned candidates have fundraising
  const candidatesWithFundraising = allCandidates

  // Sort by total amount raised (descending)
  const sortedCandidates = [...candidatesWithFundraising].sort((a, b) => {
    const aAmount = a.stats?.total_amount || 0
    const bAmount = b.stats?.total_amount || 0
    return bAmount - aAmount
  })

  // Only show candidates with fundraising > $0 in browse views
  const candidatesToDisplay = sortedCandidates

  // Calculate available filter options based on candidates with active fundraising
  const getLevel = (office: string) => {
    if (['H', 'S', 'P'].includes(office.toUpperCase())) {
      return 'federal'
    }
    return 'state'
  }

  const availableLevels = Array.from(new Set(candidatesWithFundraising.map(c => getLevel(c.office))))
  const availableParties = Array.from(new Set(candidatesWithFundraising.map(c => c.party).filter(Boolean)))
  const availableStates = Array.from(new Set(candidatesWithFundraising.map(c => c.state).filter(Boolean)))
  const availableOffices = Array.from(new Set(candidatesWithFundraising.map(c => c.office)))
  // Get unique state-district combinations for House races
  const availableDistricts = Array.from(
    new Map(
      candidatesWithFundraising
        .filter(c => c.office === 'H' && c.state && c.district)
        .map(c => [`${c.state}-${c.district}`, { state: c.state, district: c.district }])
    ).values()
  ).sort((a, b) => {
    // Sort by state first, then district number
    if (a.state !== b.state) return a.state.localeCompare(b.state)
    return parseInt(a.district) - parseInt(b.district)
  })

  // Display top candidates in table
  const displayedCandidates = candidatesToDisplay.slice(0, displayLimit)
  const hasMore = candidatesToDisplay.length > displayLimit

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Candidates' }
  ]

  const allLevels = [
    { code: 'federal', label: 'Federal' },
    { code: 'state', label: 'State & Local' }
  ]

  const allParties = [
    { code: 'DEM', label: 'Democratic' },
    { code: 'REP', label: 'Republican' },
    { code: 'LIB', label: 'Libertarian' },
    { code: 'GRE', label: 'Green' },
    { code: 'IND', label: 'Independent' },
    { code: 'OTH', label: 'Other' }
  ]

  // Filter to only show options with active fundraising
  const levels = allLevels.filter(l => availableLevels.includes(l.code))
  const parties = allParties.filter(p => availableParties.includes(p.code))

  // Helper functions to get display labels
  const getLevelLabel = (code: string) => {
    const level = levels.find(l => l.code === code)
    return level?.label || code
  }

  const getOfficeLabel = (code: string) => {
    const office = (candidateOffices as OfficeMetadata[])?.find(o => o.code === code)
    return office?.label || code
  }

  const getStateName = (code: string) => {
    const state = (candidateStates as StateMetadata[])?.find(s => s.code === code)
    return state?.name || code
  }

  const getPartyLabel = (code: string) => {
    const party = parties.find(p => p.code === code)
    return party?.label || code
  }

  const addFilter = (filterType: 'level' | 'state' | 'office' | 'party' | 'district', value: string) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set(filterType, value)
    setSearchParams(newParams)
    setShowLevelMenu(false)
    setShowStateMenu(false)
    setShowOfficeMenu(false)
    setShowPartyMenu(false)
    setShowDistrictMenu(false)
  }

  const removeFilter = (filterType: 'level' | 'state' | 'office' | 'party' | 'district') => {
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
          Candidates
        </h1>
        <p className="text-lg text-gray-600">
          Explore federal and state candidates running for office
        </p>
      </div>

      {/* Filters Section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="text-sm font-medium text-gray-700">Filter by:</span>

            {/* Level Filter */}
            <div className="relative">
              <button
                onClick={() => setShowLevelMenu(!showLevelMenu)}
                className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm font-medium flex items-center gap-2"
              >
                <span>Level</span>
                <svg className={`w-4 h-4 transition-transform ${showLevelMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showLevelMenu && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {levels.map((level) => (
                    <button
                      key={level.code}
                      onClick={() => addFilter('level', level.code)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm first:rounded-t-lg last:rounded-b-lg"
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* State Filter */}
            <div className="relative">
              <button
                onClick={() => setShowStateMenu(!showStateMenu)}
                className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm font-medium flex items-center gap-2"
              >
                <span>State</span>
                <svg className={`w-4 h-4 transition-transform ${showStateMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showStateMenu && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-10">
                  {(candidateStates as StateMetadata[])?.filter(state => availableStates.includes(state.code)).map((state) => (
                    <button
                      key={state.code}
                      onClick={() => addFilter('state', state.code)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm first:rounded-t-lg last:rounded-b-lg"
                    >
                      {state.code} - {state.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Office Filter */}
            <div className="relative">
              <button
                onClick={() => setShowOfficeMenu(!showOfficeMenu)}
                className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm font-medium flex items-center gap-2"
              >
                <span>Office</span>
                <svg className={`w-4 h-4 transition-transform ${showOfficeMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showOfficeMenu && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-10">
                  {(candidateOffices as OfficeMetadata[])?.filter(office => availableOffices.includes(office.code)).map((office) => (
                    <button
                      key={office.code}
                      onClick={() => addFilter('office', office.code)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm first:rounded-t-lg last:rounded-b-lg"
                    >
                      {office.code} - {office.label}
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
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {parties.map((party) => (
                    <button
                      key={party.code}
                      onClick={() => addFilter('party', party.code)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm first:rounded-t-lg last:rounded-b-lg"
                    >
                      {party.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* District Filter - only show when U.S. House is selected */}
            {officeParam === 'H' && availableDistricts.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowDistrictMenu(!showDistrictMenu)}
                  className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm font-medium flex items-center gap-2"
                >
                  <span>District</span>
                  <svg className={`w-4 h-4 transition-transform ${showDistrictMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showDistrictMenu && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-10">
                    {availableDistricts.map((districtInfo) => (
                      <button
                        key={`${districtInfo.state}-${districtInfo.district}`}
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams)
                          newParams.set('state', districtInfo.state)
                          newParams.set('district', districtInfo.district)
                          setSearchParams(newParams)
                          setShowDistrictMenu(false)
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm first:rounded-t-lg last:rounded-b-lg"
                      >
                        {districtInfo.state}-{districtInfo.district}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {!hasBrowseParams ? (
              <span className="text-sm text-gray-500 italic">No filters applied</span>
            ) : (
              <>
                <span className="text-sm text-gray-600">Active:</span>
                {levelParam && (
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <span>Level: {getLevelLabel(levelParam)}</span>
                    <button
                      onClick={() => removeFilter('level')}
                      className="ml-1 hover:text-blue-900"
                      title="Remove level filter"
                    >
                      ×
                    </button>
                  </div>
                )}
                {stateParam && (
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <span>State: {getStateName(stateParam)}</span>
                    <button
                      onClick={() => removeFilter('state')}
                      className="ml-1 hover:text-blue-900"
                      title="Remove state filter"
                    >
                      ×
                    </button>
                  </div>
                )}
                {officeParam && (
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <span>Office: {getOfficeLabel(officeParam)}</span>
                    <button
                      onClick={() => removeFilter('office')}
                      className="ml-1 hover:text-blue-900"
                      title="Remove office filter"
                    >
                      ×
                    </button>
                  </div>
                )}
                {partyParam && (
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <span>Party: {getPartyLabel(partyParam)}</span>
                    <button
                      onClick={() => removeFilter('party')}
                      className="ml-1 hover:text-blue-900"
                      title="Remove party filter"
                    >
                      ×
                    </button>
                  </div>
                )}
                {districtParam && (
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <span>District: {stateParam ? `${stateParam}-${districtParam}` : districtParam}</span>
                    <button
                      onClick={() => removeFilter('district')}
                      className="ml-1 hover:text-blue-900"
                      title="Remove district filter"
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Top Fundraising Candidates
        </h2>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading candidates...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading candidate data.</p>
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
                      Level
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      State
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Office
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Party
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
                  {displayedCandidates.map((candidate, index) => (
                    <CandidateTableRow
                      key={candidate.id}
                      candidate={candidate}
                      rank={index + 1}
                      stateCode={candidate.state || undefined}
                      showLevelAndState={true}
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

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 mb-4">
                Showing {displayedCandidates.length} of {totalCandidatesCount} candidates
              </p>
              {hasMore && (
                <button
                  onClick={() => setDisplayLimit(prev => prev + 25)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Show 25 more
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No candidate data available.</p>
          </div>
        )}
      </section>
    </div>
  )
}
