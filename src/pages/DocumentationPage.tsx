import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import {
  CheckCircleIcon,
  ClipboardDocumentIcon,
  CommandLineIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  QueueListIcon,
} from '@heroicons/react/24/outline'

const sections = [
  { title: 'Introduction', body: 'The SIT Encoding Standard defines a symbolic representation of information using a restricted alphabet of 6 and 7, preserving the precision of binary while introducing a more distinctive symbolic layer.', tag: 'Overview' },
  { title: 'Motivation', body: 'SIT provides a compact, deterministic and inspectable representation that can be understood without opaque encoders or remote infrastructure.', tag: 'Overview' },
  { title: 'Definitions', body: 'A Symbolic Information Token is any sequence of 8 symbols, each drawn from the alphabet {6,7}. These tokens are the fundamental units of the legacy-compatible standard.', tag: 'Core' },
  { title: 'Encoding', body: 'Each byte is converted to an 8-bit binary string, where 0 becomes 6 and 1 becomes 7. The resulting token is emitted as a sequence of 8 characters.', tag: 'Core' },
  { title: 'Examples', body: 'The string CIAO becomes a sequence of SIT tokens that can be copied into a browser, downloaded as a .sit file, or safely passed through a text pipeline.', tag: 'Reference' },
  { title: 'Compliance', body: 'A conforming input contains only 6, 7, spaces, and newlines. Any other character triggers a precise compliance error with the invalid symbol identified.', tag: 'Reference' },
  { title: 'Performance', body: 'The reference implementation runs locally in the browser, uses route-level code splitting and performs conversion without network requests.', tag: 'Operations' },
  { title: 'Future Work', body: 'Native SIT extends the system with canonical concepts, grammar, punctuation and a language-independent semantic layer.', tag: 'Roadmap' },
  { title: 'References', body: 'The RFC registry records the normative SIT 1.0 specification and all proposals that define the native SIT 2.0 ecosystem.', tag: 'Reference' },
  { title: 'Peer Review', body: 'The public repository is the review surface for implementation details, open proposals and compatibility decisions.', tag: 'Operations' },
]

const slugify = (value: string) => value.toLowerCase().replace(/\s+/g, '-')

export default function DocumentationPage() {
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(false)
  const filteredSections = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return sections
    return sections.filter((section) => `${section.title} ${section.body} ${section.tag}`.toLowerCase().includes(normalized))
  }, [query])

  const copyExample = async () => {
    await navigator.clipboard.writeText('67666677')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const selectedSection = new URLSearchParams(location.search).get('section')

  useEffect(() => {
    if (!selectedSection) return

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(selectedSection)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [selectedSection])

  const sectionLink = (section: string) => `/docs?section=${encodeURIComponent(section)}`

  return (
    <div className="docs-page">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="docs-hero">
        <div>
          <p className="docs-kicker"><DocumentTextIcon aria-hidden="true" /> SIT reference manual</p>
          <h1>Documentation that gets you from zero to <span>6 &amp; 7.</span></h1>
          <p>The complete guide to encoding, validating and building with the Symbolic Information Token standard.</p>
        </div>
        <div className="docs-meta">
          <div><strong>2.0</strong><span>Current standard</span></div>
          <div><strong>10</strong><span>Core chapters</span></div>
          <div><strong>2026</strong><span>Last revision</span></div>
        </div>
      </motion.section>

      <div className="docs-toolbar">
        <label htmlFor="docs-search">
          <MagnifyingGlassIcon aria-hidden="true" />
          <input
            id="docs-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the documentation…"
          />
          <span>{filteredSections.length} sections</span>
        </label>
        <Link to={sectionLink('reference-example')}><CommandLineIcon aria-hidden="true" /> View quick example</Link>
      </div>

      <div className="docs-layout">
        <aside className="docs-sidebar">
          <div>
            <p><QueueListIcon aria-hidden="true" /> On this page</p>
            <nav aria-label="Documentation chapters">
              {sections.map((section, index) => (
                <Link
                  key={section.title}
                  to={sectionLink(slugify(section.title))}
                  onClick={() => setQuery('')}
                  aria-current={selectedSection === slugify(section.title) ? 'location' : undefined}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>{section.title}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <div className="docs-content" aria-live="polite">
          {filteredSections.length ? filteredSections.map((section, index) => (
            <motion.article
              key={section.title}
              id={slugify(section.title)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * .025 }}
              className="docs-article"
            >
              <div className="docs-article-index">{String(sections.indexOf(section) + 1).padStart(2, '0')}</div>
              <div>
                <span className="docs-tag">{section.tag}</span>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </div>
            </motion.article>
          )) : (
            <div className="docs-empty">
              <MagnifyingGlassIcon aria-hidden="true" />
              <h2>No matching chapters</h2>
              <p>Try “encoding”, “compliance” or “native”.</p>
              <button type="button" onClick={() => setQuery('')}>Clear search</button>
            </div>
          )}
        </div>

        <aside id="reference-example" className="docs-reference">
          <div className="reference-card">
            <div className="reference-card-heading">
              <span><CommandLineIcon aria-hidden="true" /> Quick reference</span>
              <span className="reference-ready"><i aria-hidden="true" /> Valid</span>
            </div>
            <div className="reference-code">
              <span>INPUT / UTF-8</span>
              <code>C</code>
              <span>BINARY</span>
              <code>01000011</code>
              <span>SIT TOKEN</span>
              <code className="reference-token">67666677</code>
            </div>
            <button type="button" onClick={copyExample}>
              {copied ? <CheckCircleIcon aria-hidden="true" /> : <ClipboardDocumentIcon aria-hidden="true" />}
              {copied ? 'Token copied' : 'Copy token'}
            </button>
          </div>
          <div className="docs-note">
            <strong>Need the formal record?</strong>
            <p>RFC-0001 is the normative reference for legacy-compatible encoding.</p>
            <a href="#/rfc">Open RFC registry →</a>
          </div>
        </aside>
      </div>
    </div>
  )
}
