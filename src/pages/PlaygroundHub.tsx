import { Suspense, lazy, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BeakerIcon, BoltIcon, CommandLineIcon } from '@heroicons/react/24/outline'
import type { CapsuleEdition } from '../types/capsules'
import { useAuth } from '../context/AuthContext'
import { setPreferredLanguage } from '../services/profileService'
import { LabsPanel } from './LabsPage'

const LegacyPlayground = lazy(() => import('./PlaygroundPage'))
const NativePlayground = lazy(() => import('./NativePages').then((module) => ({ default: module.NativePlayground })))

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
  const nativeCopy = language === 'it'
    ? { choose: 'Scegli un ambiente', native: 'Concetti, decodifica Native ed esplorazione semantica.', language: 'Lingua Native', live: 'Lingua applicata al playground Native.' }
    : { choose: 'Choose a workspace', native: 'Concept-first encoding, native decoding and semantic exploration.', language: 'Native language', live: 'Language applied to the Native playground.' }
  const changeLanguage = async (next: string) => {
    setLanguage(next)
    window.localStorage.setItem('sit-native-language', next)
    if (status === 'authenticated') await setPreferredLanguage(next).catch(() => undefined)
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
        <span>{nativeCopy.choose}</span>
        <div role="tablist" aria-label="Playground edition">
          <button type="button" role="tab" aria-selected={edition === '1.0'} onClick={() => setEdition('1.0')} className={edition === '1.0' ? 'native-tab native-tab-active' : 'native-tab'}>SIT 1.0 · Legacy</button>
          <button type="button" role="tab" aria-selected={edition === '2.0'} onClick={() => setEdition('2.0')} className={edition === '2.0' ? 'native-tab native-tab-v2-active' : 'native-tab native-tab-v2'}>SIT 2.0 · Native</button>
          <button type="button" role="tab" aria-selected={edition === 'labs'} onClick={() => setEdition('labs')} className={edition === 'labs' ? 'native-tab native-tab-active' : 'native-tab'}>SIT Labs</button>
        </div>
        <p>{edition === '1.0' ? 'ASCII, binary, batch conversion and compliance tools.' : edition === '2.0' ? nativeCopy.native : 'Guided experiments from easy to hard.'}</p>
        {edition === '2.0' || edition === 'labs' ? <div className="mt-4 flex flex-wrap items-center gap-3"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{nativeCopy.language}</span><div role="group" aria-label={nativeCopy.language} className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900"><button type="button" onClick={() => void changeLanguage('en')} aria-pressed={language === 'en'} className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${language === 'en' ? 'bg-white text-blue-700 shadow dark:bg-slate-800 dark:text-blue-300' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>English</button><button type="button" onClick={() => void changeLanguage('it')} aria-pressed={language === 'it'} className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${language === 'it' ? 'bg-white text-blue-700 shadow dark:bg-slate-800 dark:text-blue-300' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>Italiano</button></div><span className="text-xs text-slate-500 dark:text-slate-400">{nativeCopy.live}</span></div> : null}
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
          : edition === '2.0' ? <div className="native-v2"><NativePlayground initialPayload={draft?.edition === '2.0' ? draft.payload : undefined} authenticated={status === 'authenticated'} /></div> : <LabsPanel />}
      </Suspense>
    </div>
  </div>
}
