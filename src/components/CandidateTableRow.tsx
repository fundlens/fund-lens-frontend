import { Link } from 'react-router-dom'
import type { CandidateList } from '../types/api'

interface CandidateTableRowProps {
  candidate: CandidateList
  rank: number
  showRace?: boolean
  hideOfficeColumn?: boolean
  stateCode?: string
  showLevelAndState?: boolean
}

export default function CandidateTableRow({ candidate, rank, showRace = false, hideOfficeColumn = false, stateCode, showLevelAndState = false }: CandidateTableRowProps) {
  const getPartyColor = (party: string | null) => {
    if (!party) return 'bg-gray-100 text-gray-800'
    const p = party.toUpperCase()
    if (p.includes('DEM')) return 'bg-blue-100 text-blue-800'
    if (p.includes('REP')) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
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

  const getLevel = (office: string) => {
    if (['H', 'S', 'P'].includes(office.toUpperCase())) {
      return 'Federal'
    }
    return 'State & Local'
  }

  const getRaceDisplay = (office: string, district: string | null) => {
    if (office === 'H') {
      if (district && stateCode) {
        return `${stateCode}-${district} - U.S. House`
      }
      return district ? `U.S. House - District ${district}` : 'U.S. House'
    }
    if (office === 'S') return 'U.S. Senate'
    if (office === 'P') return 'U.S. President'
    return office
  }

  const getOfficeDisplay = (office: string, district: string | null, state: string | null) => {
    if (office === 'H' && district && state) {
      return `U.S. House ${state}-${district}`
    }
    if (office === 'S') {
      return 'U.S. Senate'
    }
    if (office === 'P') {
      return 'U.S. President'
    }
    return office
  }

  const totalRaised = candidate.stats?.total_amount || 0
  const totalContributors = candidate.stats?.unique_contributors || 0
  const totalContributions = candidate.stats?.total_contributions || 0

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {rank}
      </td>
      <td className="px-6 py-4">
        <Link
          to={`/candidates/${candidate.id}`}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {candidate.name}
        </Link>
      </td>
      {showLevelAndState && (
        <>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {getLevel(candidate.office)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {candidate.state || 'N/A'}
          </td>
        </>
      )}
      {!hideOfficeColumn && (
        <>
          {showRace ? (
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {getRaceDisplay(candidate.office, candidate.district)}
            </td>
          ) : showLevelAndState ? (
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {getOfficeDisplay(candidate.office, candidate.district, candidate.state)}
            </td>
          ) : (
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {stateCode && candidate.district ? `${stateCode}-${candidate.district}` : `District ${candidate.district}`}
            </td>
          )}
        </>
      )}
      <td className="px-6 py-4 whitespace-nowrap">
        {candidate.party && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPartyColor(candidate.party)}`}>
            {candidate.party}
          </span>
        )}
      </td>
      {showLevelAndState && (
        <>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
            {formatNumber(totalContributors)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
            {formatNumber(totalContributions)}
          </td>
        </>
      )}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
        {formatCurrency(totalRaised)}
      </td>
    </tr>
  )
}
