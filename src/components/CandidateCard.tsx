import { Link } from 'react-router-dom'
import type { CandidateList } from '../types/api'

interface CandidateCardProps {
  candidate: CandidateList
  rank?: number
  totalRaised?: number
}

export default function CandidateCard({ candidate, rank, totalRaised }: CandidateCardProps) {
  const getPartyColor = (party: string | null) => {
    if (!party) return 'bg-gray-100 text-gray-800'
    const p = party.toUpperCase()
    if (p.includes('DEM')) return 'bg-blue-100 text-blue-800'
    if (p.includes('REP')) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getOfficeDisplay = (office: string, district: string | null) => {
    if (office === 'H' && district) {
      return `U.S. House - District ${district}`
    }
    if (office === 'S') {
      return 'U.S. Senate'
    }
    if (office === 'P') {
      return 'President'
    }
    return office
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Link
      to={`/candidates/${candidate.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition p-6 border border-gray-200 hover:border-blue-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {rank !== undefined && (
              <span className="text-blue-600 mr-2">#{rank}</span>
            )}
            {candidate.name}
          </h3>
          <p className="text-gray-600 mb-3">
            {getOfficeDisplay(candidate.office, candidate.district)}
          </p>
          <div className="flex gap-2 flex-wrap">
            {candidate.party && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPartyColor(candidate.party)}`}>
                {candidate.party}
              </span>
            )}
            {candidate.state && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {candidate.state}
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              candidate.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
            }`}>
              {candidate.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          {totalRaised !== undefined && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Raised:</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(totalRaised)}
                </span>
              </div>
            </div>
          )}
        </div>
        <svg
          className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0"
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
  )
}
