import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import DocumentationPage from './pages/DocumentationPage'
import PlaygroundPage from './pages/PlaygroundPage'
import RoadmapPage from './pages/RoadmapPage'
import AboutPage from './pages/AboutPage'
import RfcPage from './pages/RfcPage'

function App() {
  return (
    <HashRouter>
      <Layout title="SIT Standard">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/docs" element={<DocumentationPage />} />
          <Route path="/playground" element={<PlaygroundPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/rfc" element={<RfcPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}

export default App
