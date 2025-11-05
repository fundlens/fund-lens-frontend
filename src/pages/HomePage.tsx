import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export default function HomePage() {
  usePageTitle('Home')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to FundLens
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Explore campaign finance data for federal, state, and local candidates
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Browse Campaign Finance Data
          </h2>
          <p className="text-gray-600 mb-6">
            Currently showing data for the 2025-26 election cycle.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/candidates"
              className="block p-8 bg-blue-50 rounded-lg hover:bg-blue-100 transition border-2 border-blue-200 hover:border-blue-400"
            >
              <div className="flex justify-center mb-4">
                <img
                  src="/Great_Seal_of_the_United_States_(obverse).svg.webp"
                  alt="Candidates"
                  className="w-24 h-24 object-contain"
                />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Candidates
              </h3>
              <p className="text-gray-600 mb-4">
                Federal and state candidates running for office
              </p>
              <div className="flex items-center text-blue-600 font-medium">
                Browse Candidates
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>

            <Link
              to="/committees"
              className="block p-8 bg-green-50 rounded-lg hover:bg-green-100 transition border-2 border-green-200 hover:border-green-400"
            >
              <div className="flex justify-center mb-4">
                <svg className="w-24 h-24 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Committees
              </h3>
              <p className="text-gray-600 mb-4">
                Campaign committees, PACs, and political organizations
              </p>
              <div className="flex items-center text-green-600 font-medium">
                Browse Committees
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>

            <Link
              to="/contributors"
              className="block p-8 bg-purple-50 rounded-lg hover:bg-purple-100 transition border-2 border-purple-200 hover:border-purple-400"
            >
              <div className="flex justify-center mb-4">
                <svg className="w-24 h-24 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Contributors
              </h3>
              <p className="text-gray-600 mb-4">
                Individual and organizational campaign contributors
              </p>
              <div className="flex items-center text-purple-600 font-medium">
                Browse Contributors
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            About FundLens
          </h2>
          <p className="text-gray-600 mb-4">
            FundLens provides transparent access to campaign finance data for federal,
            state, and local candidates. Search and browse contribution information,
            candidate details, and committee data.
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Browse candidates by state, office, and party
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              View detailed contribution statistics
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Search contributors and committees
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
