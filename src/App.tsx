import { Suspense, lazy, useEffect } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'

const extractOAuthToken = () => {
  const searchParams = new URLSearchParams(window.location.search)
  const fromSearch = searchParams.get('token')
  if (fromSearch) return fromSearch

  const hash = window.location.hash
  const hashQueryIndex = hash.indexOf('?')
  if (hashQueryIndex === -1) return null

  const hashParams = new URLSearchParams(hash.slice(hashQueryIndex + 1))
  return hashParams.get('token')
}

const removeOAuthTokenFromUrl = () => {
  const searchParams = new URLSearchParams(window.location.search)
  if (searchParams.has('token')) {
    searchParams.delete('token')
  }

  let cleanedHash = window.location.hash
  const hashQueryIndex = cleanedHash.indexOf('?')
  if (hashQueryIndex !== -1) {
    const hashPath = cleanedHash.slice(0, hashQueryIndex)
    const hashParams = new URLSearchParams(cleanedHash.slice(hashQueryIndex + 1))
    if (hashParams.has('token')) {
      hashParams.delete('token')
      const hashQuery = hashParams.toString()
      cleanedHash = hashQuery ? `${hashPath}?${hashQuery}` : hashPath
    }
  }

  const search = searchParams.toString()
  const cleanUrl = `${window.location.pathname}${search ? `?${search}` : ''}${cleanedHash}`
  window.history.replaceState(null, '', cleanUrl)
}

// Handle OAuth redirect from both search params and hash-based routes.
const oauthToken = extractOAuthToken()
if (oauthToken) {
  localStorage.setItem('sit_token', oauthToken)
  removeOAuthTokenFromUrl()
}

const HomePage = lazy(() => import('./pages/HomePage'))
const DocumentationPage = lazy(() => import('./pages/DocumentationPage'))
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const RfcPage = lazy(() => import('./pages/RfcPage'))
const PlaygroundHub = lazy(() => import('./pages/PlaygroundHub'))
const NativePage = lazy(() => import('./pages/NativePages').then((module) => ({ default: module.NativePage })))
const AlphabetPage = lazy(() => import('./pages/NativePages').then((module) => ({ default: module.AlphabetPage })))
const GrammarPage = lazy(() => import('./pages/NativePages').then((module) => ({ default: module.GrammarPage })))
const PunctuationPage = lazy(() => import('./pages/NativePages').then((module) => ({ default: module.PunctuationPage })))
const DictionaryPage = lazy(() => import('./pages/NativePages').then((module) => ({ default: module.DictionaryPage })))
const SemanticPage = lazy(() => import('./pages/NativePages').then((module) => ({ default: module.SemanticPage })))
const CharacterExplorerPage = lazy(() => import('./pages/NativePages').then((module) => ({ default: module.CharacterExplorerPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Layout title="SIT Standard">
        <Suspense fallback={<div className="native-card">Loading SIT registry...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/docs" element={<DocumentationPage />} />
            <Route path="/playground" element={<PlaygroundHub />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/rfc" element={<RfcPage />} />
            <Route path="/native" element={<NativePage />} />
            <Route path="/alphabet" element={<AlphabetPage />} />
            <Route path="/grammar" element={<GrammarPage />} />
            <Route path="/punctuation" element={<PunctuationPage />} />
            <Route path="/dictionary" element={<DictionaryPage />} />
            <Route path="/semantic" element={<SemanticPage />} />
            <Route path="/explorer" element={<CharacterExplorerPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Suspense>
      </Layout>
    </HashRouter>
  )
}

export default App
