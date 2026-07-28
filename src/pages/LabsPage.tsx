import { useEffect, useMemo, useState } from 'react'
import { labApi, type LabDifficulty, type LabOperation, type LabPreset, type LabResult } from '../services/labService'
import { encodeTextToSit } from '../utils/encoder'
import { validateSit } from '../utils/validator'

const difficulties: LabDifficulty[] = ['easy', 'medium', 'hard']
const fallbackPresets: LabPreset[] = [
  { id: 'legacy-hello', title: 'Encode a greeting', difficulty: 'easy', operation: 'encode', input: 'HELLO' },
  { id: 'legacy-invalid-symbol', title: 'Find an invalid symbol', difficulty: 'easy', operation: 'verify', input: '6766677x' },
  { id: 'legacy-invalid-length', title: 'Find an incomplete SYTE', difficulty: 'medium', operation: 'verify', input: '6766677' },
  { id: 'legacy-corrupted-decode', title: 'Repair a corrupted payload', difficulty: 'hard', operation: 'decode', input: '67666677 6766677' },
]

function localResult(operation: LabOperation, input: string): LabResult {
  const validation = validateSit(input)
  if (operation === 'encode') {
    const output = encodeTextToSit(input)
    return { contractVersion: '1', operation, protocolVersion: '1.0', ok: true, input, normalizedInput: input, output, tokens: output.split(/\s+/), bytes: Array.from(new TextEncoder().encode(input)), errors: [], warnings: [], steps: [{ label: 'Normalize', value: input }, { label: 'Map bits', value: '0 → 6, 1 → 7' }, { label: 'SIT Legacy output', value: output }] }
  }
  const ok = operation === 'verify' ? validation.valid && input.replace(/\s/g, '').length % 8 === 0 : false
  const message = validation.valid ? 'Each SYTE must contain eight symbols.' : validation.error
  return { contractVersion: '1', operation, protocolVersion: '1.0', ok, input, normalizedInput: input.replace(/\s/g, ''), output: ok ? 'Compliant Legacy payload' : null, tokens: input.match(/[67]{1,8}/g) ?? [], bytes: [], errors: ok ? [] : [{ code: 'invalid_legacy_payload', message, rule: 'A Legacy payload contains only 6/7 and has a multiple of eight symbols.', rfc: 'RFC-0001' }], warnings: [], steps: [{ label: 'Normalize', value: input.replace(/\s/g, '') || '—' }, { label: 'Validate', value: ok ? 'Passed' : message }] }
}

export function LabsPanel() {
  const [presets, setPresets] = useState<LabPreset[]>(fallbackPresets)
  const [difficulty, setDifficulty] = useState<LabDifficulty>('easy')
  const [selectedId, setSelectedId] = useState(fallbackPresets[0].id)
  const [input, setInput] = useState(fallbackPresets[0].input)
  const [result, setResult] = useState<LabResult | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const visiblePresets = useMemo(() => presets.filter((preset) => preset.difficulty === difficulty), [difficulty, presets])
  const activePreset = useMemo(() => visiblePresets.find((preset) => preset.id === selectedId) ?? visiblePresets[0] ?? presets[0], [presets, selectedId, visiblePresets])

  useEffect(() => {
    void labApi.presets().then(({ presets: responsePresets }) => {
      setPresets(responsePresets)
      setSelectedId(responsePresets[0]?.id ?? fallbackPresets[0].id)
      setInput(responsePresets[0]?.input ?? fallbackPresets[0].input)
    }).catch(() => setUsingFallback(true))
  }, [])

  useEffect(() => {
    const next = visiblePresets[0]
    if (next && !visiblePresets.some((preset) => preset.id === selectedId)) {
      setSelectedId(next.id)
      setInput(next.input)
      setResult(null)
    }
  }, [selectedId, visiblePresets])

  if (!activePreset) return null
  const choosePreset = (preset: LabPreset) => { setSelectedId(preset.id); setInput(preset.input); setResult(null) }
  const runExperiment = () => { void labApi.run(activePreset.operation, input).then(setResult).catch(() => { setUsingFallback(true); setResult(localResult(activePreset.operation, input)) }) }

  return <section className="space-y-5" aria-labelledby="labs-title">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="native-live">SIT LABS</p><h2 id="labs-title" className="mt-2 text-2xl font-semibold">Guided protocol experiments</h2><p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-300">Choose a difficulty, edit the input, and inspect every transformation or violated rule.</p></div><span className="text-xs text-slate-500">{usingFallback ? 'Local fallback' : 'SIT Core contract'}</span></div>
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Lab difficulty">{difficulties.map((item) => <button key={item} type="button" role="tab" aria-selected={difficulty === item} className={difficulty === item ? 'native-tab native-tab-active capitalize' : 'native-tab capitalize'} onClick={() => setDifficulty(item)}>{item}</button>)}</div>
    <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)]"><aside className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><h3 className="px-2 pb-2 text-sm font-semibold capitalize">{difficulty} experiments</h3><div className="space-y-2">{visiblePresets.map((preset) => <button key={preset.id} type="button" className={activePreset.id === preset.id ? 'native-tab native-tab-active w-full text-left' : 'native-tab w-full text-left'} onClick={() => choosePreset(preset)}><span className="block font-semibold">{preset.title}</span><span className="text-xs opacity-70">{preset.operation}</span></button>)}</div></aside>
      <div className="native-card space-y-5"><div><p className="native-live">GUIDED EXPERIMENT</p><h3 className="mt-2 text-xl font-semibold">{activePreset.title}</h3></div><label className="block text-sm font-semibold" htmlFor="lab-input">Input<textarea id="lab-input" className="native-input native-input-long mt-2 min-h-28" value={input} onChange={(event) => setInput(event.target.value)} spellCheck={false} /></label><button type="button" className="native-copy-btn" onClick={runExperiment}>Run experiment</button>{result ? <div className="space-y-5" aria-live="polite"><div className={result.ok ? 'rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100' : 'rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-900 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-100'}><strong>{result.ok ? 'Experiment completed' : 'Rule discovered'}</strong><p className="mt-1 text-sm">{result.output ?? result.errors[0]?.message}</p></div><div><h4 className="font-semibold">Transformation timeline</h4><ol className="mt-3 space-y-3 border-l border-slate-300 pl-4 dark:border-slate-700">{result.steps.map((step) => <li key={step.label}><strong className="text-sm">{step.label}</strong><pre className="mt-1 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{step.value}</pre></li>)}</ol></div>{result.errors.map((error) => <article key={error.code} className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/30"><strong>{error.code}</strong><p className="mt-1">{error.rule}</p><a className="mt-2 inline-block underline" href="#/docs">{error.rfc}: learn the rule</a></article>)}</div> : null}</div>
    </div>
  </section>
}

export default LabsPanel
