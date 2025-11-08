import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type SearchCategory = 'candidates' | 'contributors' | 'committees'

interface UniversalSearchProps {
  onSearch?: (query: string, category: SearchCategory) => void
}

export default function UniversalSearch({ onSearch }: UniversalSearchProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<SearchCategory>('candidates')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) return

    // Navigate to search results page or trigger callback
    if (onSearch) {
      onSearch(query, category)
    } else {
      // Navigate to global search page
      const searchPath = `/search?q=${encodeURIComponent(query)}&category=${category}`
      navigate(searchPath)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as SearchCategory)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="candidates">Candidates</option>
          <option value="committees">Committees</option>
          <option value="contributors">Contributors</option>
        </select>

        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${category}...`}
            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Search
        </button>
      </div>
    </form>
  )
}
