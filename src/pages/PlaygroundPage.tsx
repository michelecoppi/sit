import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { ArrowDownTrayIcon, ClipboardDocumentIcon, CubeTransparentIcon, DocumentTextIcon, MagnifyingGlassCircleIcon, SparklesIcon, SwatchIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline'
import { encodeTextToSit } from '../utils/encoder'
import { decodeSitToText } from '../utils/decoder'
import { encodeBinaryToSit, decodeSitToBinary } from '../utils/binary'
import { encodeBatchToSit, decodeBatchToText } from '../utils/batch'
import { validateSit } from '../utils/validator'

const tabs = ['Encoder', 'Decoder', 'Binary Converter', 'KiloSYTE', 'Compliance Checker'] as const

type Tab = (typeof tabs)[number]

const tabMeta: Record<Tab, { icon: ReactElement; accent: string }> = {
  Encoder: { icon: <WrenchScrewdriverIcon className="h-4 w-4" />, accent: 'text-blue-600' },
  Decoder: { icon: <DocumentTextIcon className="h-4 w-4" />, accent: 'text-emerald-600' },
  'Binary Converter': { icon: <CubeTransparentIcon className="h-4 w-4" />, accent: 'text-violet-600' },
  KiloSYTE: { icon: <SwatchIcon className="h-4 w-4" />, accent: 'text-amber-600' },
  'Compliance Checker': { icon: <MagnifyingGlassCircleIcon className="h-4 w-4" />, accent: 'text-rose-600' },
}

const panelClassName = 'rounded-[1.6rem] border border-slate-200/70 bg-gradient-to-br from-white via-slate-50/90 to-blue-50/70 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/70 sm:p-6 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950/80 dark:ring-slate-800/60'
const inputPanelClassName = 'rounded-[1.6rem] border border-slate-200/70 bg-white/90 p-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-5 dark:border-slate-800 dark:bg-slate-950/70 dark:ring-slate-800/60'
const textareaClassName = 'mt-3 min-h-32 w-full rounded-[1.2rem] border border-slate-200/80 bg-white/95 p-4 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition-colors duration-200 placeholder:text-slate-400 selection:bg-blue-100 focus:border-blue-500 focus:bg-white focus:text-slate-900 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:selection:bg-blue-950/70'
const outputClassName = 'mt-3 min-h-32 overflow-auto rounded-[1.2rem] border border-slate-200/80 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 shadow-[inset_0_2px_8px_rgba(2,8,23,0.35)] ring-1 ring-slate-800/70'
const hintClassName = 'mt-3 rounded-[1.1rem] border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300'
const actionButtonClassName = 'inline-flex min-h-11 items-center gap-1.5 rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200'

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Encoder')
  const [encoderInput, setEncoderInput] = useState('CIAO')
  const [decoderInput, setDecoderInput] = useState('67666677')
  const [binaryInput, setBinaryInput] = useState('01001111')
  const [sitInput, setSitInput] = useState('67667777')
  const [batchInput, setBatchInput] = useState('HI\nBY')
  const [batchPayload, setBatchPayload] = useState('6766777767667777\n\n6766667767667777')
  const [validatorInput, setValidatorInput] = useState('67678667')
  const [conversionCount, setConversionCount] = useState(0)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const encodedOutput = useMemo(() => encodeTextToSit(encoderInput), [encoderInput])
  const decodedOutput = useMemo(() => decodeSitToText(decoderInput), [decoderInput])
  const binaryToSit = useMemo(() => encodeBinaryToSit(binaryInput), [binaryInput])
  const sitToBinary = useMemo(() => decodeSitToBinary(sitInput), [sitInput])
  const batchToSit = useMemo(() => encodeBatchToSit(batchInput), [batchInput])
  const sitToBatch = useMemo(() => decodeBatchToText(batchPayload), [batchPayload])
  const validation = useMemo(() => validateSit(validatorInput), [validatorInput])

  useEffect(() => {
    if (!statusMessage) {
      return
    }

    const timeout = window.setTimeout(() => setStatusMessage(null), 1800)
    return () => window.clearTimeout(timeout)
  }, [statusMessage])

  const handleCopy = async (value: string) => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard unavailable')
      }

      await navigator.clipboard.writeText(value)
      setStatusMessage('Copied SIT payload to the clipboard.')
    } catch {
      setStatusMessage('Clipboard is unavailable, so the output is ready to copy manually.')
    }

    setConversionCount((value) => value + 1)
  }

  const downloadFile = (value: string, filename: string) => {
    const blob = new Blob([value], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    setConversionCount((value) => value + 1)
    setStatusMessage(`Downloaded ${filename}.`)
  }

  const achievement = conversionCount >= 10 ? 'Certified SIT Engineer' : null

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-blue-50/70 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/70 sm:p-8 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 dark:ring-slate-800/60">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.08),transparent_45%)]" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-blue-600">SIT Operations</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">Encoding Playground</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-300">A polished workspace for encoding, decoding, converting, validating, and packaging SIT payloads with the clarity of a formal protocol toolkit.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-full border border-slate-200/80 bg-white/75 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200">Professional workflow • multi-step</div>
            <div className="rounded-full border border-blue-200/80 bg-blue-50/90 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">Premium workspace</div>
          </div>
        </div>
        <div className="relative mt-6 flex flex-wrap gap-3">
          {['Protocol-first', 'Audit-ready', 'Zero-friction'].map((item) => (
            <div key={item} className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">{item}</div>
          ))}
        </div>
      </section>

      {statusMessage ? (
        <div className="rounded-[1.2rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          {statusMessage}
        </div>
      ) : null}

      <div className="rounded-[1.4rem] border border-slate-200/80 bg-white/90 p-2 shadow-[0_10px_30px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/70 sm:rounded-[2rem] sm:p-3 dark:border-slate-800 dark:bg-slate-900/80 dark:ring-slate-800/60">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const meta = tabMeta[tab]
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 sm:w-auto ${isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_6px_16px_rgba(59,130,246,0.16)]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-sm dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}`}
              >
                <span className={isActive ? 'text-white' : meta.accent}>{meta.icon}</span>
                {tab}
              </button>
            )
          })}
        </div>

        <div className="mt-6 rounded-[1.6rem] border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:p-6 dark:border-slate-800 dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/80">
          {activeTab === 'Encoder' ? (
            <div className="space-y-6">
              <div className={panelClassName}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Encoder</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Encode plain text into SIT notation</h2>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">Transform readable text into compact SIT rows suitable for exchange, documentation, and archival workflows.</p>
                  </div>
                  <div className="rounded-full border border-blue-200 bg-blue-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700 shadow-sm dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">Protocol-ready</div>
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className={inputPanelClassName}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Input</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">Plain text</h3>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">ASCII / UTF-8</span>
                  </div>
                  <textarea value={encoderInput} onChange={(event) => setEncoderInput(event.target.value)} className={textareaClassName} spellCheck={false} />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={() => handleCopy(encodedOutput)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                      <ClipboardDocumentIcon className="h-4 w-4" /> Copy SIT
                    </button>
                    <button type="button" onClick={() => downloadFile(encodedOutput, 'sample.sit')} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200">
                      <ArrowDownTrayIcon className="h-4 w-4" /> Download .sit
                    </button>
                  </div>
                </div>
                <div className={inputPanelClassName}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Output</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">SIT payload</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handleCopy(encodedOutput)} className={actionButtonClassName}>
                        <ClipboardDocumentIcon className="h-3.5 w-3.5" /> Copy output
                      </button>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">Readable rows</span>
                    </div>
                  </div>
                  <pre className={outputClassName}>{encodedOutput || '...'}</pre>
                  <div className={hintClassName}>ASCII and UTF-8 are both supported. Long phrases are wrapped in compact rows of four SIT bytes for readability.</div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'Decoder' ? (
            <div className="space-y-6">
              <div className={panelClassName}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Decoder</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Decode SIT payloads back to readable text</h2>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">Reconstruct human-readable content from SIT rows with a clean, review-friendly interface.</p>
                  </div>
                  <div className="rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">Recovery mode</div>
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className={inputPanelClassName}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Input</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">SIT payload</h3>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">Rows / spaces</span>
                  </div>
                  <textarea value={decoderInput} onChange={(event) => setDecoderInput(event.target.value)} className={textareaClassName} spellCheck={false} />
                </div>
                <div className={inputPanelClassName}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Output</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">Decoded text</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handleCopy(decodedOutput)} className={actionButtonClassName}>
                        <ClipboardDocumentIcon className="h-3.5 w-3.5" /> Copy output
                      </button>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">Plain text</span>
                    </div>
                  </div>
                  <pre className={outputClassName}>{decodedOutput || '...'}</pre>
                  <div className={hintClassName}>Input may contain multiple SIT rows separated by spaces or line breaks.</div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'Binary Converter' ? (
            <div className="space-y-6">
              <div className={panelClassName}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-600">Binary Converter</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Move between binary and SIT with formal precision</h2>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">Bridge the symbolic notation and the binary representation without sacrificing readability.</p>
                  </div>
                  <div className="rounded-full border border-violet-200 bg-violet-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-violet-700 shadow-sm dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300">Dual path</div>
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className={inputPanelClassName}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Input</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">Binary</h3>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">Bits</span>
                  </div>
                  <textarea value={binaryInput} onChange={(event) => setBinaryInput(event.target.value)} className={textareaClassName} spellCheck={false} />
                  <div className={hintClassName}>Example: 01001111 → 67667777</div>
                </div>
                <div className={inputPanelClassName}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Output</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">SIT</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handleCopy(binaryToSit)} className={actionButtonClassName}>
                        <ClipboardDocumentIcon className="h-3.5 w-3.5" /> Copy output
                      </button>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">Symbolic</span>
                    </div>
                  </div>
                  <pre className={outputClassName}>{binaryToSit || '...'}</pre>
                </div>
                <div className={inputPanelClassName}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Input</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">SIT</h3>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">Symbols</span>
                  </div>
                  <textarea value={sitInput} onChange={(event) => setSitInput(event.target.value)} className={textareaClassName} spellCheck={false} />
                </div>
                <div className={inputPanelClassName}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Output</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">Binary</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handleCopy(sitToBinary)} className={actionButtonClassName}>
                        <ClipboardDocumentIcon className="h-3.5 w-3.5" /> Copy output
                      </button>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">Bits</span>
                    </div>
                  </div>
                  <pre className={outputClassName}>{sitToBinary || '...'}</pre>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'KiloSYTE' ? (
            <div className="space-y-6">
              <div className={panelClassName}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-600">KiloSYTE</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Package multiple messages as a formal SIT batch</h2>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">Encode several lines together and decode them back with a structured, multi-block workflow.</p>
                  </div>
                  <div className="rounded-full border border-amber-200 bg-amber-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 shadow-sm dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">Batch mode</div>
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className={inputPanelClassName}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Input</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">Plain text lines</h3>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">Multi-line</span>
                  </div>
                  <textarea value={batchInput} onChange={(event) => setBatchInput(event.target.value)} className={textareaClassName} spellCheck={false} />
                  <div className={hintClassName}>KiloSYTE introduces multi-line SIT packaging so several messages can be encoded and decoded together.</div>
                </div>
                <div className={inputPanelClassName}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Output</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">Batch SIT output</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handleCopy(batchToSit)} className={actionButtonClassName}>
                        <ClipboardDocumentIcon className="h-3.5 w-3.5" /> Copy output
                      </button>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">Structured blocks</span>
                    </div>
                  </div>
                  <pre className={outputClassName}>{batchToSit || '...'}</pre>
                </div>
                <div className={inputPanelClassName}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Input</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">Batch SIT payload</h3>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">Composite</span>
                  </div>
                  <textarea value={batchPayload} onChange={(event) => setBatchPayload(event.target.value)} className={textareaClassName} spellCheck={false} />
                </div>
                <div className={inputPanelClassName}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Output</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">Decoded text</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handleCopy(sitToBatch)} className={actionButtonClassName}>
                        <ClipboardDocumentIcon className="h-3.5 w-3.5" /> Copy output
                      </button>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">Multi-line</span>
                    </div>
                  </div>
                  <pre className={outputClassName}>{sitToBatch || '...'}</pre>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'Compliance Checker' ? (
            <div className="space-y-6">
              <div className={panelClassName}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-600">Compliance Checker</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Validate payloads against SIT compliance rules</h2>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">Inspect a payload for prohibited characters and classify it according to the compliance posture of the protocol.</p>
                  </div>
                  <div className="rounded-full border border-rose-200 bg-rose-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-rose-700 shadow-sm dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">Validation suite</div>
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className={inputPanelClassName}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Input</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">Candidate payload</h3>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">Character scan</span>
                  </div>
                  <textarea value={validatorInput} onChange={(event) => setValidatorInput(event.target.value)} className={textareaClassName} spellCheck={false} />
                </div>
                <div className={inputPanelClassName}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Result</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">Compliance report</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handleCopy(`${validation.message}\n${validation.error}`)} className={actionButtonClassName}>
                        <ClipboardDocumentIcon className="h-3.5 w-3.5" /> Copy output
                      </button>
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium ${validation.valid ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'}`}>{validation.valid ? 'Compliant' : 'Review needed'}</span>
                    </div>
                  </div>
                  <pre className={outputClassName}>{validation.message}\n{validation.error}</pre>
                  <div className={hintClassName}>Only the symbols 6, 7, spaces, and line breaks are considered compliant within the SIT standard.</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {achievement ? (
        <div className="rounded-[1.5rem] border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 text-sm font-medium text-amber-700 shadow-sm dark:border-amber-900 dark:from-amber-950/40 dark:to-orange-950/30 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5" /> {achievement}
          </div>
        </div>
      ) : null}
    </div>
  )
}
