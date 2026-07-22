import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  DocumentTextIcon,
  BeakerIcon,
  MapIcon,
  InformationCircleIcon,
  AcademicCapIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

type LayoutProps = {
  children: ReactNode
  title: string
}

const navItems = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/docs', label: 'Documentation', icon: DocumentTextIcon },
  { href: '/playground', label: 'Playground', icon: BeakerIcon },
  { href: '/roadmap', label: 'Roadmap', icon: MapIcon },
  { href: '/about', label: 'About', icon: InformationCircleIcon },
  { href: '/rfc', label: 'RFC', icon: AcademicCapIcon },
  { href: '/profile', label: 'Profile', icon: UserCircleIcon },
]

export default function Layout({ children, title }: LayoutProps) {
  const [showSecret, setShowSecret] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoClicks, setLogoClicks] = useState(0)

  const closeSecret = () => setShowSecret(false)

  const footerLinks = useMemo(
    () => [
      { href: 'https://github.com/michelecoppi/sit', label: 'GitHub', external: true },
      { href: '/rfc', label: 'RFC', external: false },
      { href: '/docs', label: 'Documentation', external: false },
    ],
    [],
  )

  useEffect(() => {
    document.title = `${title} | SIT Standard`
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute('content', 'The world\'s most advanced symbolic encoding standard based on the {6,7} alphabet.')
    }
  }, [title])

  useEffect(() => {
    if (!showSecret) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSecret()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showSecret])

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--foreground)] transition-colors duration-300">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-6 sm:py-4 lg:px-8">
          <button
            type="button"
            onClick={() => {
              const clicks = logoClicks + 1
              setLogoClicks(clicks)
              if (clicks >= 7) { setShowSecret(true); setLogoClicks(0) }
            }}
            aria-label="Open ceremonial hall"
            className="flex shrink-0 items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 text-lg font-semibold text-white">
              <img src={`${import.meta.env.BASE_URL}sit-icon.svg`} alt="SIT icon" className="h-full w-full object-cover" />
            </div>
            <div className="hidden text-left sm:block">
              <div className="text-sm font-semibold tracking-[0.2em] text-slate-900 dark:text-slate-100">SIT</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Symbolic Information Token</div>
            </div>
          </button>
          <nav className="hidden min-w-0 items-center gap-1 xl:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-medium transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/michelecoppi/sit"
              target="_blank"
              rel="noreferrer"
              className="hidden shrink-0 2xl:inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200"
            >
              <SparklesIcon className="h-4 w-4" />
              GitHub
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 p-2 text-slate-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200 xl:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 xl:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                )
              })}
              <a
                href="https://github.com/michelecoppi/sit"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200"
              >
                <SparklesIcon className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">{children}</main>

      <footer className="border-t border-slate-200 bg-slate-50/80 py-10 dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8 dark:text-slate-400">
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">International SIT Consortium</div>
            <div>Established 2026</div>
          </div>
          <div className="flex flex-wrap gap-4">
            {footerLinks.map((link) => (
              link.external ? (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="transition hover:text-blue-600">
                  {link.label}
                </a>
              ) : (
                <NavLink key={link.label} to={link.href} className="transition hover:text-blue-600">
                  {link.label}
                </NavLink>
              )
            ))}
          </div>
        </div>
      </footer>

      {showSecret ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4"
          onClick={() => setShowSecret(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Ceremonial hall"
            className="max-w-lg rounded-3xl border border-blue-200 bg-white p-5 text-center shadow-2xl sm:p-8 dark:border-blue-900 dark:bg-slate-900"
          >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xl font-semibold text-white">
                <img src={`${import.meta.env.BASE_URL}sit-icon.svg`} alt="SIT icon" className="h-full w-full object-cover" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">International SIT Consortium Terminal</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-400">Access unlocked. Try the native alphabet, grammar, dictionary, roadmap, or RFC registry.</p>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  closeSecret()
                }}
                className="mt-6 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200"
              >
                Close
              </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
