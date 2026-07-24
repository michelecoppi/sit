import { Suspense, lazy, useEffect } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import { useAuth } from './context/AuthContext'
import { setOAuthCallbackError } from './utils/oauthCallbackState'

function consumeOAuthResult() {
  const params = new URLSearchParams(window.location.search)
  const auth = params.get('auth')?.trim().toLowerCase() ?? null
  const error = params.get('error')?.trim() ?? params.get('oauth_error')?.trim() ?? null

  if (!auth && !error) return null

  params.delete('auth')
  params.delete('error')
  params.delete('oauth_error')
  const search = params.toString()
  window.history.replaceState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`)

  return { auth, error }
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

function OAuthCallbackHandler() {
  const { completeLogin } = useAuth()

  useEffect(() => {
    const result = consumeOAuthResult()
    if (!result) return

    window.location.hash = '#/profile'

    if (result.error || result.auth !== 'success') {
      setOAuthCallbackError(result.error ?? 'oauth_failed')
      return
    }

    void completeLogin().catch(() => {
      setOAuthCallbackError('invalid_session')
    })
  }, [completeLogin])

  return null
}

function App() {
  return (
    <HashRouter>
      <OAuthCallbackHandler />
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
