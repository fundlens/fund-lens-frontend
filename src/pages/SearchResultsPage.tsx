import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useSearchCandidates, useSearchContributors, useSearchCommittees } from '../hooks/useApi'
import { usePageTitle } from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || 'candidates'

  usePageTitle(query ? `Search: ${query}` : 'Search')

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Search Results' }
  ]

  const handleCategoryChange = (newCategory: string) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('category', newCategory)
    setSearchParams(newParams)
  }

  const getOfficeDisplay = (office: string, district: string | null, candidateState: string | null) => {
    if (office === 'H' && district && candidateState) {
      return `U.S. House - ${candidateState}-${district}`
    }
    if (office === 'S') {
      return 'U.S. Senate'
    }
    if (office === 'P') {
      return 'President'
    }
    return office
  }

  const getPartyColor = (party: string | null) => {
    if (!party) return 'bg-gray-100 text-gray-800'
    const p = party.toUpperCase()
    if (p.includes('DEM')) return 'bg-blue-100 text-blue-800'
    if (p.includes('REP')) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  // Fetch search results for all categories to show counts
  const { data: candidateResults, isLoading: candidatesLoading } = useSearchCandidates(
    { q: query, page_size: 50 },
    query.length > 0
  )

  const { data: contributorResults, isLoading: contributorsLoading } = useSearchContributors(
    { q: query, page_size: 50 },
    query.length > 0
  )

  const { data: committeeResults, isLoading: committeesLoading } = useSearchCommittees(
    { q: query, page_size: 50 },
    query.length > 0
  )

  const isLoading = candidatesLoading || contributorsLoading || committeesLoading

  const getResultsCount = () => {
    if (category === 'candidates') return candidateResults?.meta.total_items || 0
    if (category === 'contributors') return contributorResults?.meta.total_items || 0
    if (category === 'committees') return committeeResults?.meta.total_items || 0
    return 0
  }

  const getCategoryLabel = () => {
    if (category === 'candidates') return 'Candidates'
    if (category === 'contributors') return 'Contributors'
    if (category === 'committees') return 'Committees'
    return ''
  }

  if (!query) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumbs items={breadcrumbs} />
        <div className="text-center py-12">
          <p className="text-gray-600">Please enter a search query.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search Results
        </h1>
        <p className="text-gray-600">
          Searching for "{query}"
        </p>
      </div>

      {/* Category Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleCategoryChange('candidates')}
              className={`${
                category === 'candidates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Candidates
              {candidateResults && (
                <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100">
                  {candidateResults.meta.total_items}
                </span>
              )}
            </button>
            <button
              onClick={() => handleCategoryChange('committees')}
              className={`${
                category === 'committees'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Committees
              {committeeResults && (
                <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100">
                  {committeeResults.meta.total_items}
                </span>
              )}
            </button>
            <button
              onClick={() => handleCategoryChange('contributors')}
              className={`${
                category === 'contributors'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Contributors
              {contributorResults && (
                <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100">
                  {contributorResults.meta.total_items}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Searching...</p>
        </div>
      ) : (
        <>
          {/* Candidates Results */}
          {category === 'candidates' && candidateResults && (
            <div>
              {candidateResults.items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No candidates found matching "{query}".</p>
                </div>
              ) : (
                <>
                  {/* Table view for wide viewports */}
                  <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Race
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Party
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            State
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Active
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {candidateResults.items.map((candidate) => (
                          <tr key={candidate.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <Link
                                to={`/candidates/${candidate.id}`}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {candidate.name}
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {getOfficeDisplay(candidate.office, candidate.district, candidate.state)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {candidate.party ? (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPartyColor(candidate.party)}`}>
                                  {candidate.party}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-500">N/A</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {candidate.state || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                candidate.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {candidate.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Card view for narrow viewports */}
                  <div className="md:hidden space-y-4">
                    {candidateResults.items.map((candidate) => (
                      <Link
                        key={candidate.id}
                        to={`/candidates/${candidate.id}`}
                        className="block bg-white rounded-lg shadow hover:shadow-md transition p-6 border border-gray-200 hover:border-blue-300"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {candidate.name}
                        </h3>
                        <div className="space-y-2 mb-3">
                          <div className="flex gap-2 items-center">
                            <span className="text-sm text-gray-700 font-medium">Race:</span>
                            <span className="text-sm text-gray-900">
                              {getOfficeDisplay(candidate.office, candidate.district, candidate.state)}
                            </span>
                          </div>
                          {candidate.party && (
                            <div className="flex gap-2 items-center">
                              <span className="text-sm text-gray-700 font-medium">Party:</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPartyColor(candidate.party)}`}>
                                {candidate.party}
                              </span>
                            </div>
                          )}
                          <div className="flex gap-2 items-center">
                            <span className="text-sm text-gray-700 font-medium">State:</span>
                            <span className="text-sm text-gray-900">
                              {candidate.state || 'N/A'}
                            </span>
                          </div>
                          <div className="flex gap-2 items-center">
                            <span className="text-sm text-gray-700 font-medium">Active:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              candidate.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {candidate.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Contributors Results */}
          {category === 'contributors' && contributorResults && (
            <div>
              {contributorResults.items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No contributors found matching "{query}".</p>
                </div>
              ) : (
                <>
                  {/* Table view for wide viewports */}
                  <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Entity Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employer
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Occupation
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {contributorResults.items.map((contributor) => (
                          <tr key={contributor.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <Link
                                to={`/contributors/${contributor.id}`}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {contributor.name}
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {contributor.city && contributor.state ? `${contributor.city}, ${contributor.state}` : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {contributor.entity_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {contributor.employer || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {contributor.occupation || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Card view for narrow viewports */}
                  <div className="md:hidden space-y-4">
                    {contributorResults.items.map((contributor) => (
                      <Link
                        key={contributor.id}
                        to={`/contributors/${contributor.id}`}
                        className="block bg-white rounded-lg shadow hover:shadow-md transition p-6 border border-gray-200 hover:border-blue-300"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {contributor.name}
                        </h3>
                        <div className="space-y-2 mb-3">
                          {contributor.city && contributor.state && (
                            <div className="flex gap-2 items-center">
                              <span className="text-sm text-gray-700 font-medium">Location:</span>
                              <span className="text-sm text-gray-900">
                                {contributor.city}, {contributor.state}
                              </span>
                            </div>
                          )}
                          <div className="flex gap-2 items-center">
                            <span className="text-sm text-gray-700 font-medium">Entity Type:</span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {contributor.entity_type}
                            </span>
                          </div>
                          {contributor.employer && (
                            <div className="flex gap-2 items-center">
                              <span className="text-sm text-gray-700 font-medium">Employer:</span>
                              <span className="text-sm text-gray-900">
                                {contributor.employer}
                              </span>
                            </div>
                          )}
                          {contributor.occupation && (
                            <div className="flex gap-2 items-center">
                              <span className="text-sm text-gray-700 font-medium">Occupation:</span>
                              <span className="text-sm text-gray-900">
                                {contributor.occupation}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Committees Results */}
          {category === 'committees' && committeeResults && (
            <div>
              {committeeResults.items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No committees found matching "{query}".</p>
                </div>
              ) : (
                <>
                  {/* Table view for wide viewports */}
                  <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            State
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Active
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {committeeResults.items.map((committee) => (
                          <tr key={committee.id} className="hover:bg-gray-50">
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
                                {committee.committee_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {committee.state || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                committee.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {committee.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Card view for narrow viewports */}
                  <div className="md:hidden space-y-4">
                    {committeeResults.items.map((committee) => (
                      <Link
                        key={committee.id}
                        to={`/committees/${committee.id}`}
                        className="block bg-white rounded-lg shadow hover:shadow-md transition p-6 border border-gray-200 hover:border-blue-300"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {committee.name}
                        </h3>
                        <div className="space-y-2 mb-3">
                          <div className="flex gap-2 items-center">
                            <span className="text-sm text-gray-700 font-medium">Type:</span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {committee.committee_type}
                            </span>
                          </div>
                          <div className="flex gap-2 items-center">
                            <span className="text-sm text-gray-700 font-medium">State:</span>
                            <span className="text-sm text-gray-900">
                              {committee.state || 'N/A'}
                            </span>
                          </div>
                          <div className="flex gap-2 items-center">
                            <span className="text-sm text-gray-700 font-medium">Active:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              committee.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {committee.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
