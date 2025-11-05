import { useState } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'

export default function StateLandingPage() {
  usePageTitle('State & Local Races')

  const [showLocationSection, setShowLocationSection] = useState(false)

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'State & Local Races' }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mb-12">
        <div className="flex items-center gap-6 mb-4">
          <img
            src="/Blank_US_Map_(states_only).svg"
            alt="United States Map"
            className="w-20 h-20 object-contain"
          />
          <h1 className="text-4xl font-bold text-gray-900">
            State & Local Campaign Finance
          </h1>
        </div>
        <p className="text-lg text-gray-600">
          Explore campaign finance data for state and local elections
        </p>
      </div>

      {/* Browse by Candidate Location - Empty for now */}
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
            <div className="mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">🏛️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Coming Soon
                </h3>
                <p className="text-gray-600">
                  State and local campaign finance data will be added in future updates.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Top Fundraisers - Empty for now */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Top State & Local Fundraisers
        </h2>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">
            No state or local fundraising data available yet.
          </p>
        </div>
      </section>
    </div>
  )
}
