import { Suspense, lazy, useEffect } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import { useAuth } from './context/AuthContext'
import { consumeOAuthBridgeToken, setSitToken } from './utils/authToken'
import { setOAuthCallbackError } from './utils/oauthCallbackState'

const OAUTH_DEBUG_STORAGE_KEY = 'sit_oauth_callback_debug'

function getFirstParamValue(params: URLSearchParams, keys: string[]) {
  for (const key of keys) {
    const value = params.get(key)
    if (value && value.trim()) return value.trim()
  }
  return null
}

function extractTokenFromRawUrl(rawUrl: string) {
  const pattern = /(?:\?|&|#)(?:token|access_token|jwt)=([^&#]+)/i
  const match = rawUrl.match(pattern)
  if (!match?.[1]) return null

  try {
    return decodeURIComponent(match[1]).trim()
  } catch {
    return match[1].trim()
  }
}

const extractOAuthCallback = () => {
  const tokenKeys = ['token', 'access_token', 'jwt']
  const errorKeys = ['error', 'oauth_error']

  const searchParams = new URLSearchParams(window.location.search)
  const fromSearch = getFirstParamValue(searchParams, tokenKeys)
  const fromSearchError = getFirstParamValue(searchParams, errorKeys)
  if (fromSearch || fromSearchError) {
    return {
      token: fromSearch,
      error: fromSearchError,
    }
  }

  const hash = window.location.hash
  const hashQueryIndex = hash.indexOf('?')
  if (hashQueryIndex !== -1) {
    const hashParams = new URLSearchParams(hash.slice(hashQueryIndex + 1))
    const fromHash = getFirstParamValue(hashParams, tokenKeys)
    const fromHashError = getFirstParamValue(hashParams, errorKeys)

    if (fromHash || fromHashError) {
      return {
        token: fromHash,
        error: fromHashError,
      }
    }
  }

  const fromRawUrl = extractTokenFromRawUrl(window.location.href)

  return {
    token: fromRawUrl,
    error: null,
  }
}

const removeOAuthCallbackFromUrl = () => {
  const searchParams = new URLSearchParams(window.location.search)
  searchParams.delete('token')
  searchParams.delete('access_token')
  searchParams.delete('jwt')
  searchParams.delete('error')
  searchParams.delete('oauth_error')

  let cleanedHash = window.location.hash
  const isHashParamOnly = /^#(?:token|access_token|jwt|error|oauth_error)=/i.test(cleanedHash)
  if (isHashParamOnly) {
    cleanedHash = ''
  }

  const hashQueryIndex = cleanedHash.indexOf('?')
  if (hashQueryIndex !== -1) {
    const hashPath = cleanedHash.slice(0, hashQueryIndex)
    const hashParams = new URLSearchParams(cleanedHash.slice(hashQueryIndex + 1))
    hashParams.delete('token')
    hashParams.delete('access_token')
    hashParams.delete('jwt')
    hashParams.delete('error')
    hashParams.delete('oauth_error')
    const hashQuery = hashParams.toString()
    cleanedHash = hashQuery ? `${hashPath}?${hashQuery}` : hashPath
  }

  const search = searchParams.toString()
  const cleanUrl = `${window.location.pathname}${search ? `?${search}` : ''}${cleanedHash}`
  window.history.replaceState(null, '', cleanUrl)
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

  const redirectToProfile = () => {
    window.location.hash = '#/profile'
  }

  useEffect(() => {
    const { token, error } = extractOAuthCallback()
    if (!token && !error) return

    const bridgeToken = consumeOAuthBridgeToken()
    const hasSearchParams = window.location.search.includes('=')
    const hasHashQuery = window.location.hash.includes('?')

    sessionStorage.setItem(OAUTH_DEBUG_STORAGE_KEY, JSON.stringify({
      hasToken: Boolean(token),
      hasError: Boolean(error),
      hasSearchParams,
      hasHashQuery,
      hashPrefix: window.location.hash.slice(0, 24),
    }))

    removeOAuthCallbackFromUrl()

    if (error) {
      if (bridgeToken) {
        setSitToken(bridgeToken)
      }
      setOAuthCallbackError(error)
      redirectToProfile()
      return
    }

    const normalizedToken = token?.trim() ?? ''
    if (!normalizedToken) {
      if (bridgeToken) {
        setSitToken(bridgeToken)
      }
      setOAuthCallbackError('missing_token')
      redirectToProfile()
      return
    }

    redirectToProfile()

    void completeLogin(normalizedToken).catch(() => {
      if (bridgeToken) {
        setSitToken(bridgeToken)
      }
      setOAuthCallbackError('invalid_token')
    })
  }, [completeLogin])

  return null
}

export function consumeOAuthCallbackDebug() {
  const payload = sessionStorage.getItem(OAUTH_DEBUG_STORAGE_KEY)
  if (!payload) return null
  sessionStorage.removeItem(OAUTH_DEBUG_STORAGE_KEY)
  return payload
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
