import { Suspense, lazy, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BeakerIcon, BoltIcon, CommandLineIcon } from '@heroicons/react/24/outline'
import type { CapsuleEdition } from '../types/capsules'
import { useAuth } from '../context/AuthContext'
import { setPreferredLanguage } from '../services/profileService'
import { LabsPanel } from './LabsPage'

const LegacyPlayground = lazy(() => import('./PlaygroundPage'))
const NativePlayground = lazy(() => import('./NativePages').then((module) => ({ default: module.NativePlayground })))

const nativeLanguages = [
  { code: 'en', label: 'English', search: 'english inglese en' },
  { code: 'it', label: 'Italiano', search: 'italiano italian it' },
] as const

export default function PlaygroundHub() {
  const { status } = useAuth()
  const [searchParams] = useSearchParams()
  const requestedEdition = searchParams.get('edition')
  const [draft] = useState<{ edition: CapsuleEdition; payload: string } | null>(() => {
    const stored = sessionStorage.getItem('sit-capsule-playground-draft')
    if (!stored) return null
    sessionStorage.removeItem('sit-capsule-playground-draft')
    try {
      const parsed = JSON.parse(stored) as Record<string, unknown>
      if ((parsed.edition === '1.0' || parsed.edition === '2.0') && typeof parsed.payload === 'string') {
        return { edition: parsed.edition, payload: parsed.payload }
      }
    } catch {
      // Ignore malformed transient state.
    }
    return null
  })
  const [edition, setEdition] = useState<'1.0' | '2.0' | 'labs'>(
    draft?.edition ?? (requestedEdition === '2.0' ? '2.0' : '1.0'),
  )
  const [language, setLanguage] = useState(() => window.localStorage.getItem('sit-native-language') || 'en')
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [languageQuery, setLanguageQuery] = useState('')
  const selectedLanguage = nativeLanguages.find((item) => item.code === language) ?? nativeLanguages[0]
  const filteredLanguages = useMemo(() => {
    const query = languageQuery.trim().toLowerCase()
    return query ? nativeLanguages.filter((item) => `${item.label} ${item.search}`.includes(query)) : nativeLanguages
  }, [languageQuery])
  const changeLanguage = async (next: string) => {
    setLanguage(next)
    window.localStorage.setItem('sit-native-language', next)
    if (status === 'authenticated') await setPreferredLanguage(next).catch(() => undefined)
    setLanguageMenuOpen(false)
    setLanguageQuery('')
  }

  return <div className="space-y-6">
    <section className="playground-header">
      <div>
        <p><BeakerIcon aria-hidden="true" /> Interactive laboratory</p>
        <h1>{edition === 'labs' ? <>Learn by <span>experimenting.</span></> : <>Encode. Decode. <span>Experiment.</span></>}</h1>
        <div className="playground-benefits">
          <span><BoltIcon aria-hidden="true" /> Instant conversion</span>
          <span><CommandLineIcon aria-hidden="true" /> Runs locally</span>
        </div>
      </div>
      <div className="playground-switcher">
        <span>Choose a workspace</span>
        <div role="tablist" aria-label="Playground edition">
          <button type="button" role="tab" aria-selected={edition === '1.0'} onClick={() => setEdition('1.0')} className={edition === '1.0' ? 'native-tab native-tab-active' : 'native-tab'}>SIT 1.0 · Legacy</button>
          <button type="button" role="tab" aria-selected={edition === '2.0'} onClick={() => setEdition('2.0')} className={edition === '2.0' ? 'native-tab native-tab-v2-active' : 'native-tab native-tab-v2'}>SIT 2.0 · Native</button>
          <button type="button" role="tab" aria-selected={edition === 'labs'} onClick={() => setEdition('labs')} className={edition === 'labs' ? 'native-tab native-tab-active' : 'native-tab'}>SIT Labs</button>
        </div>
        <p>{edition === '1.0' ? 'ASCII, binary, batch conversion and compliance tools.' : edition === '2.0' ? 'Concept-first encoding, native decoding and semantic exploration.' : 'Guided experiments from easy to hard.'}</p>
        {edition === '2.0' || edition === 'labs' ? <div className="mt-5 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-[10rem_minmax(14rem,22rem)] sm:items-center dark:border-slate-700"><div className="contents"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Native language</span><div className="relative"><button type="button" aria-haspopup="listbox" aria-expanded={languageMenuOpen} onClick={() => setLanguageMenuOpen((open) => !open)} className="inline-flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"><span>{selectedLanguage.label}</span><span aria-hidden="true" className="text-slate-400">⌄</span></button>{languageMenuOpen ? <div className="absolute z-30 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"><label className="sr-only" htmlFor="native-language-search">Search language</label><input id="native-language-search" autoFocus value={languageQuery} onChange={(event) => setLanguageQuery(event.target.value)} placeholder="Search language…" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800" /><div role="listbox" aria-label="Native language" className="mt-2 max-h-52 space-y-1 overflow-auto">{filteredLanguages.map((item) => <button key={item.code} type="button" role="option" aria-selected={item.code === language} onClick={() => void changeLanguage(item.code)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${item.code === language ? 'bg-blue-50 font-semibold text-blue-800 dark:bg-blue-950/50 dark:text-blue-200' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}`}><span>{item.label}</span>{item.code === language ? <span aria-hidden="true">✓</span> : null}</button>)}{filteredLanguages.length === 0 ? <p className="px-3 py-2 text-sm text-slate-500">No languages found.</p> : null}</div></div> : null}</div></div><p className="text-xs leading-5 text-slate-500 sm:col-span-2 dark:text-slate-400">Changes Native input and decoded output only.</p></div> : null}
      </div>
    </section>
    <div className="playground-workspace">
      <div className="workspace-status">
        <span><i aria-hidden="true" /> Workspace ready</span>
        <span>{edition === '1.0' ? 'LEGACY ENGINE' : edition === '2.0' ? 'NATIVE ENGINE' : 'GUIDED LABS'}</span>
      </div>
      <Suspense fallback={<div className="route-loader"><span className="route-loader-mark" aria-hidden="true"><i>6</i><i>7</i></span><span><strong>Loading playground</strong><small>Preparing conversion tools…</small></span></div>}>
        {edition === '1.0'
          ? <LegacyPlayground initialPayload={draft?.edition === '1.0' ? draft.payload : undefined} authenticated={status === 'authenticated'} />
          : edition === '2.0' ? <div className="native-v2"><NativePlayground initialPayload={draft?.edition === '2.0' ? draft.payload : undefined} authenticated={status === 'authenticated'} locale={language === 'it' ? 'it' : 'en'} /></div> : <LabsPanel locale={language === 'it' ? 'it' : 'en'} />}
      </Suspense>
    </div>
  </div>
}
