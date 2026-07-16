import { useEffect, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  DocumentTextIcon,
  BeakerIcon,
  MapIcon,
  InformationCircleIcon,
  AcademicCapIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
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
]

export default function Layout({ children, title }: LayoutProps) {
  const [showSecret, setShowSecret] = useState(false)
  useEffect(() => {
    document.title = `${title} | SIT Standard`
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute('content', 'The world\'s most advanced symbolic encoding standard based on the {6,7} alphabet.')
    }
  }, [title])

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--foreground)] transition-colors duration-300">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => {
              setShowSecret(true)
            }}
            className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-lg font-semibold text-white">
              SIT
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold tracking-[0.2em] text-slate-900 dark:text-slate-100">SIT</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Symbolic Information Token</div>
            </div>
          </button>
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
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
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200"
          >
            <SparklesIcon className="h-4 w-4" />
            GitHub
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>

      <footer className="border-t border-slate-200 bg-slate-50/80 py-10 dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8 dark:text-slate-400">
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">International SIT Consortium</div>
            <div>Established 2026</div>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="https://github.com" className="transition hover:text-blue-600">GitHub</a>
            <a href="/rfc" className="transition hover:text-blue-600">RFC</a>
            <a href="/docs" className="transition hover:text-blue-600">License</a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showSecret ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4"
            onClick={() => setShowSecret(false)}
          >
            <motion.div
              initial={{ y: 24, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 16, scale: 0.98 }}
              className="max-w-lg rounded-3xl border border-blue-200 bg-white p-8 text-center shadow-2xl dark:border-blue-900 dark:bg-slate-900"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-semibold text-white">
                SIT
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Welcome to the International SIT Consortium.</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-400">Your curiosity has earned you access to the official ceremonial hall of the standard.</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
