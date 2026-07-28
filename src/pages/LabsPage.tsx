import { useEffect, useMemo, useState } from 'react'
import { BeakerIcon } from '@heroicons/react/24/outline'
import { labApi, type LabOperation, type LabPreset, type LabResult } from '../services/labService'
import { encodeTextToSit } from '../utils/encoder'
import { validateSit } from '../utils/validator'

const fallbackPresets: LabPreset[] = [
  { id: 'legacy-hello', title: 'Encode a greeting', difficulty: 'beginner', operation: 'encode', input: 'HELLO' },
  { id: 'legacy-invalid-symbol', title: 'Find an invalid symbol', difficulty: 'beginner', operation: 'verify', input: '6766677x' },
  { id: 'legacy-invalid-length', title: 'Find an incomplete SYTE', difficulty: 'intermediate', operation: 'verify', input: '6766677' },
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

export default function LabsPage() {
  const [presets, setPresets] = useState<LabPreset[]>(fallbackPresets)
  const [selected, setSelected] = useState(fallbackPresets[0])
  const [input, setInput] = useState(selected.input)
  const [result, setResult] = useState<LabResult | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    void labApi.presets().then(({ presets }) => {
      setPresets(presets)
      setSelected(presets[0] ?? fallbackPresets[0])
      setInput((presets[0] ?? fallbackPresets[0]).input)
    }).catch(() => setUsingFallback(true))
  }, [])

  const activePreset = useMemo(() => presets.find((preset) => preset.id === selected.id) ?? selected, [presets, selected])
  const runExperiment = () => {
    void labApi.run(activePreset.operation, input).then(setResult).catch(() => {
      setUsingFallback(true)
      setResult(localResult(activePreset.operation, input))
    })
  }

  return <div className="space-y-6">
    <section className="playground-header">
      <div><p><BeakerIcon aria-hidden="true" /> SIT Labs</p><h1>Learn the protocol by <span>changing it.</span></h1><p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">Choose a guided experiment, edit its input, and inspect each transformation or rule violation.</p></div>
      <div className="playground-switcher"><span>Lab engine</span><p>{usingFallback ? 'Local educational fallback' : 'Versioned SIT Core contract'}</p></div>
    </section>
    <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
      <aside className="native-card space-y-3" aria-label="Lab catalog"><h2 className="font-semibold">Experiments</h2>{presets.map((preset) => <button key={preset.id} type="button" className={activePreset.id === preset.id ? 'native-tab native-tab-active w-full text-left' : 'native-tab w-full text-left'} onClick={() => { setSelected(preset); setInput(preset.input); setResult(null) }}><span className="block font-semibold">{preset.title}</span><span className="text-xs opacity-70">{preset.difficulty} · {preset.operation}</span></button>)}</aside>
      <section className="native-card space-y-5"><div><p className="native-live">GUIDED EXPERIMENT</p><h2 className="mt-2 text-xl font-semibold">{activePreset.title}</h2><p className="mt-1 text-sm text-slate-500">Edit the input, then run the deterministic experiment.</p></div><label className="block text-sm font-semibold" htmlFor="lab-input">Input<textarea id="lab-input" className="native-input native-input-long mt-2 min-h-28" value={input} onChange={(event) => setInput(event.target.value)} spellCheck={false} /></label><button type="button" className="native-copy-btn" onClick={runExperiment}>Run experiment</button>{result ? <div className="space-y-5" aria-live="polite"><div className={result.ok ? 'rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100' : 'rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-900 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-100'}><strong>{result.ok ? 'Experiment completed' : 'Rule discovered'}</strong><p className="mt-1 text-sm">{result.output ?? result.errors[0]?.message}</p></div><div><h3 className="font-semibold">Transformation timeline</h3><ol className="mt-3 space-y-3 border-l border-slate-300 pl-4 dark:border-slate-700">{result.steps.map((step) => <li key={step.label}><strong className="text-sm">{step.label}</strong><pre className="mt-1 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{step.value}</pre></li>)}</ol></div>{result.errors.map((error) => <article key={error.code} className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/30"><strong>{error.code}</strong><p className="mt-1">{error.rule}</p><a className="mt-2 inline-block underline" href="#/docs">{error.rfc}: learn the rule</a></article>)}</div> : null}</section>
    </div>
  </div>
}
