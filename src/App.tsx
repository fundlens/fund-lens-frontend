import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import FederalLandingPage from './pages/FederalLandingPage'
import StateLandingPage from './pages/StateLandingPage'
import StatePage from './pages/StatePage'
import SearchResultsPage from './pages/SearchResultsPage'
import AllHouseCandidatesPage from './pages/AllHouseCandidatesPage'
import SenateCandidatesPage from './pages/SenateCandidatesPage'
import PresidentCandidatesPage from './pages/PresidentCandidatesPage'
import DistrictCandidatesPage from './pages/DistrictCandidatesPage'
import CandidateDetailPage from './pages/CandidateDetailPage'
import CommitteeDetailPage from './pages/CommitteeDetailPage'
import ContributorDetailPage from './pages/ContributorDetailPage'
import CandidatesLandingPage from './pages/CandidatesLandingPage'
import CommitteesLandingPage from './pages/CommitteesLandingPage'
import CommitteesByTypePage from './pages/CommitteesByTypePage'
import CommitteesByLocationPage from './pages/CommitteesByLocationPage'
import ContributorsLandingPage from './pages/ContributorsLandingPage'
import ContributorsByTypePage from './pages/ContributorsByTypePage'
import ContributorsByLocationPage from './pages/ContributorsByLocationPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />

          {/* Main Context Routes - Browse pages use query params */}
          <Route path="candidates" element={<CandidatesLandingPage />} />
          <Route path="committees" element={<CommitteesLandingPage />} />
          <Route path="contributors" element={<ContributorsLandingPage />} />

          {/* Detail Pages */}
          <Route path="candidates/:candidateId" element={<CandidateDetailPage />} />
          <Route path="committees/:committeeId" element={<CommitteeDetailPage />} />
          <Route path="contributors/:contributorId" element={<ContributorDetailPage />} />

          {/* Search Results */}
          <Route path="search" element={<SearchResultsPage />} />

          {/* Legacy Federal and State/Local Landing Pages */}
          <Route path="federal" element={<FederalLandingPage />} />
          <Route path="state-local" element={<StateLandingPage />} />

          {/* Legacy Federal Races Routes */}
          <Route path="federal/states/:state" element={<StatePage />} />
          <Route path="federal/states/:state/search" element={<SearchResultsPage />} />
          <Route path="federal/states/:state/us-president" element={<PresidentCandidatesPage />} />
          <Route path="federal/states/:state/us-senate" element={<SenateCandidatesPage />} />
          <Route path="federal/states/:state/us-house" element={<AllHouseCandidatesPage />} />
          <Route path="federal/states/:state/us-house/:district" element={<DistrictCandidatesPage />} />

          {/* Legacy State Routes */}
          <Route path=":state" element={<StatePage />} />
          <Route path=":state/search" element={<SearchResultsPage />} />
          <Route path=":state/us-president" element={<PresidentCandidatesPage />} />
          <Route path=":state/us-senate" element={<SenateCandidatesPage />} />
          <Route path=":state/us-house" element={<AllHouseCandidatesPage />} />
          <Route path=":state/us-house/:district" element={<DistrictCandidatesPage />} />

          {/* Legacy Candidate Detail Routes */}
          <Route path="federal/president/:candidateId" element={<CandidateDetailPage />} />
          <Route path="federal/senate/:state/:candidateId" element={<CandidateDetailPage />} />
          <Route path="federal/house/:state/:candidateId" element={<CandidateDetailPage />} />

          {/* Legacy Contributor Detail Routes */}
          <Route path="contributors/type/:entityType/location/:state/:contributorId" element={<ContributorDetailPage />} />
          <Route path="contributors/type/:entityType/:contributorId" element={<ContributorDetailPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
