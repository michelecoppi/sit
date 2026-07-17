import { useEffect } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import DocumentationPage from './pages/DocumentationPage'
import RoadmapPage from './pages/RoadmapPage'
import AboutPage from './pages/AboutPage'
import RfcPage from './pages/RfcPage'
import { AlphabetPage, CharacterExplorerPage, DictionaryPage, GrammarPage, NativePage, SemanticPage } from './pages/NativePages'
import PlaygroundHub from './pages/PlaygroundHub'

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
          <Route path="/dictionary" element={<DictionaryPage />} />
          <Route path="/semantic" element={<SemanticPage />} />
          <Route path="/explorer" element={<CharacterExplorerPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}

export default App
