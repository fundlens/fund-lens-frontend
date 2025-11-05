import { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import UniversalSearch from './UniversalSearch'

export default function Layout() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-8">
            <Link to="/" className="flex items-center flex-shrink-0">
              <img
                src="/fundlens-wordmark.png"
                alt="FundLens"
                className="h-12"
              />
            </Link>
            {/* Desktop search - hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-2xl">
              <UniversalSearch />
            </div>
            {/* Mobile search toggle button */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="font-medium">Search</span>
            </button>
          </div>
        </div>
        {/* Mobile search form - appears below header when toggled */}
        {mobileSearchOpen && (
          <div className="md:hidden border-t border-gray-700 bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <UniversalSearch />
            </div>
          </div>
        )}
      </header>

      {/* Data Coverage Disclaimer */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Data Notice:</span> This site currently contains FEC data for federal races in Maryland for the 2025-2026 election cycle only.
            </p>
          </div>
        </div>
      </div>

      <main>
        <Outlet />
      </main>
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} FundLens. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
