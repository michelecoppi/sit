Output:
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  AcademicCapIcon,
  ArchiveBoxIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  Bars3Icon,
  BeakerIcon,
  BoltIcon,
  CommandLineIcon,
  DocumentTextIcon,
  HomeIcon,
  InformationCircleIcon,
  MapIcon,
  MoonIcon,
  RocketLaunchIcon,
  SparklesIcon,
  SunIcon,
  TrophyIcon,
  UserCircleIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

type LayoutProps = {
  children: ReactNode
  title: string
}

type Theme = 'light' | 'dark'

const navItems = [
  { href: '/', label: 'Home', shortLabel: 'Home', icon: HomeIcon },
  { href: '/docs', label: 'Documentation', desktopLabel: 'Docs', shortLabel: 'Docs', icon: DocumentTextIcon },
  { href: '/playground', label: 'Playground', shortLabel: 'Playground', icon: BeakerIcon },
  { href: '/missions', label: 'Missions', shortLabel: 'Missions', icon: TrophyIcon },
  { href: '/teams', label: 'Research Teams', desktopLabel: 'Teams', shortLabel: 'Teams', icon: UserGroupIcon },
  { href: '/roadmap', label: 'Roadmap', shortLabel: 'Roadmap', icon: MapIcon },
  { href: '/rfc', label: 'RFC Registry', desktopLabel: 'RFCs', shortLabel: 'RFC', icon: AcademicCapIcon },
  { href: '/about', label: 'About SIT', shortLabel: 'About', icon: InformationCircleIcon },
]

const routeNames: Record<string, string> = {
  '/': 'Overview',
  '/docs': 'Documentation',
  '/playground': 'Encoding laboratory',
  '/roadmap': 'Product roadmap',
  '/about': 'About the standard',
  '/rfc': 'RFC registry',
  '/native': 'Native SIT',
  '/alphabet': 'Native alphabet',
  '/grammar': 'Native grammar',
  '/punctuation': 'Punctuation',
  '/dictionary': 'Dictionary',
  '/semantic': 'Semantic layer',
  '/explorer': 'Character explorer',
  '/profile': 'Researcher profile',
  '/missions': 'Research missions',
  '/notifications': 'Notifications and activity',
  '/capsules': 'Capsule library',
  '/teams': 'Research teams',
}

function resolveInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const saved = window.localStorage.getItem('sit-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function Layout({ children, title }: LayoutProps) {
  const location = useLocation()
  const [showSecret, setShowSecret] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoClicks, setLogoClicks] = useState(0)
  const [theme, setTheme] = useState<Theme>(resolveInitialTheme)

  const closeSecret = () => setShowSecret(false)
  const routeName = routeNames[location.pathname]
    ?? (location.pathname.startsWith('/capsule/') ? 'Shared SIT capsule'
      : location.pathname.startsWith('/team-invites/') ? 'Team invitation'
        : location.pathname.startsWith('/teams/') ? 'Research team'
          : 'SIT Standard')

  const footerLinks = useMemo(
    () => [
      { href: 'https://github.com/michelecoppi/sit', label: 'GitHub', external: true },
      { href: '/rfc', label: 'RFC Registry', external: false },
      { href: '/docs', label: 'Documentation', external: false },
      { href: '/roadmap', label: 'Roadmap', external: false },
    ],
    [],
  )

  useEffect(() => {
    document.title = `${routeName || title} | SIT Standard`
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute('content', 'The symbolic information standard built on the {6,7} alphabet.')
    }
  }, [routeName, title])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem('sit-theme', theme)
  }, [theme])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!showSecret && !menuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSecret()
        setMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen, showSecret])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>

      <header className="site-header">
        <div className="header-inner">
          <Link
            to="/"
            aria-label="SIT home"
            className="brand-lockup"
            onClick={() => {
              const clicks = logoClicks + 1
              setLogoClicks(clicks)
              if (clicks >= 7) {
                setShowSecret(true)
                setLogoClicks(0)
              }
            }}
          >
            <span className="brand-mark" aria-hidden="true">
              <img src={`${import.meta.env.BASE_URL}sit-icon.svg`} alt="" />
            </span>
            <span className="brand-copy">
              <span className="brand-name">SIT</span>
              <span className="brand-subtitle">Symbolic Information Token</span>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
                >
                  <Icon aria-hidden="true" />
                  <span className="nav-label-full">{item.desktopLabel ?? item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="header-actions">
            <Link to="/native" className="native-cta">
              <BoltIcon aria-hidden="true" />
              <span>Native 2.0</span>
            </Link>
            <Link to="/profile" className="icon-button profile-button" aria-label="Open researcher profile">
              <UserCircleIcon aria-hidden="true" />
            </Link>
            <Link to="/capsules" className="icon-button profile-button" aria-label="Open capsule library">
              <ArchiveBoxIcon aria-hidden="true" />
            </Link>
            <button
              type="button"
              className="icon-button theme-toggle"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              aria-pressed={theme === 'dark'}
              data-active-theme={theme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <SunIcon aria-hidden="true" /> : <MoonIcon aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="icon-button menu-button"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              {menuOpen ? <XMarkIcon aria-hidden="true" /> : <Bars3Icon aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className="context-bar" aria-label="Current location">
          <div className="context-bar-inner">
            <span className="context-pulse" aria-hidden="true" />
            <span>{routeName}</span>
            <span className="context-divider" aria-hidden="true">/</span>
            <span className="context-version">Standard v2.0 Â· Public registry</span>
          </div>
        </div>

        {menuOpen ? <div id="mobile-navigation" className="mobile-menu mobile-menu-open">
          <nav aria-label="Mobile navigation">
            <div className="mobile-menu-grid">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) => `mobile-nav-link${isActive ? ' mobile-nav-link-active' : ''}`}
                  >
                    <span className="mobile-nav-icon"><Icon aria-hidden="true" /></span>
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.href === '/' ? 'Start here' : `Open ${item.shortLabel.toLowerCase()}`}</small>
                    </span>
                    <ArrowRightIcon aria-hidden="true" />
                  </NavLink>
                )
              })}
            </div>
            <div className="mobile-menu-footer">
              <Link to="/native" className="mobile-feature-link">
                <SparklesIcon aria-hidden="true" />
                <span><strong>Explore Native SIT 2.0</strong><small>Alphabet, grammar and semantic tools</small></span>
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </div>
          </nav>
        </div> : null}
      </header>

      <main id="main-content" className="site-main" tabIndex={-1}>{children}</main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-mark"><CommandLineIcon aria-hidden="true" /></span>
            <div>
              <strong>International SIT Consortium</strong>
              <p>Building a more symbolic internet since 2026.</p>
            </div>
          </div>
          <div className="footer-links">
            {footerLinks.map((link) => (
              link.external ? (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                  {link.label}<ArrowTopRightOnSquareIcon aria-hidden="true" />
                </a>
              ) : (
                <NavLink key={link.label} to={link.href}>{link.label}</NavLink>
              )
            ))}
          </div>
          <div className="footer-status">
            <span className="status-dot" aria-hidden="true" />
            All symbolic systems operational
          </div>
        </div>
      </footer>

      {menuOpen ? <button type="button" className="menu-scrim" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} /> : null}

      {showSecret ? (
        <div className="modal-backdrop" onMouseDown={closeSecret}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ceremonial-title"
            className="ceremonial-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="ceremonial-glow" aria-hidden="true" />
            <span className="ceremonial-icon"><RocketLaunchIcon aria-hidden="true" /></span>
            <p className="ceremonial-kicker">Protocol 67 unlocked</p>
            <h2 id="ceremonial-title">International SIT Consortium Terminal</h2>
            <p>Access granted. The ceremonial layer confirms that your dedication to symbolic systems is statistically significant.</p>
            <div className="ceremonial-actions">
              <Link to="/native" onClick={closeSecret} className="button-primary">Enter native registry <ArrowRightIcon aria-hidden="true" /></Link>
              <button type="button" onClick={closeSecret} className="button-secondary">Close terminal</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

