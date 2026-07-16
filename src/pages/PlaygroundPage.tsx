import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardDocumentIcon, ArrowDownTrayIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { encodeTextToSit } from '../utils/encoder'
import { decodeSitToText } from '../utils/decoder'
import { encodeBinaryToSit, decodeSitToBinary } from '../utils/binary'
import { validateSit } from '../utils/validator'

const tabs = ['Encoder', 'Decoder', 'Binary Converter', 'Compliance Checker'] as const

type Tab = (typeof tabs)[number]

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Encoder')
  const [encoderInput, setEncoderInput] = useState('CIAO')
  const [decoderInput, setDecoderInput] = useState('67666677')
  const [binaryInput, setBinaryInput] = useState('01001111')
  const [sitInput, setSitInput] = useState('67667777')
  const [validatorInput, setValidatorInput] = useState('67678667')
  const [conversionCount, setConversionCount] = useState(0)

  const encodedOutput = useMemo(() => encodeTextToSit(encoderInput), [encoderInput])
  const decodedOutput = useMemo(() => decodeSitToText(decoderInput), [decoderInput])
  const binaryToSit = useMemo(() => encodeBinaryToSit(binaryInput), [binaryInput])
  const sitToBinary = useMemo(() => decodeSitToBinary(sitInput), [sitInput])
  const validation = useMemo(() => validateSit(validatorInput), [validatorInput])

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value)
    setConversionCount((value) => value + 1)
  }

  const downloadFile = (value: string, filename: string) => {
    const blob = new Blob([value], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
    setConversionCount((value) => value + 1)
  }

  const achievement = conversionCount >= 10 ? 'Certified SIT Engineer' : null

  return (
    <div className="space-y-8">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Encoding Playground</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">Try the browser-based encoder, decoder, binary converter, and compliance checker in a single polished workspace.</p>
      </motion.section>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/60">
          {activeTab === 'Encoder' ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Text input</label>
                <textarea value={encoderInput} onChange={(event) => setEncoderInput(event.target.value)} className="mt-3 min-h-32 w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={() => handleCopy(encodedOutput)} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                    <ClipboardDocumentIcon className="h-4 w-4" /> Copy SIT
                  </button>
                  <button type="button" onClick={() => downloadFile(encodedOutput, 'sample.sit')} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200">
                    <ArrowDownTrayIcon className="h-4 w-4" /> Download .sit
                  </button>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Output</div>
                <pre className="mt-3 min-h-32 rounded-2xl bg-slate-900 p-4 text-sm text-slate-100">{encodedOutput || '...'}</pre>
                <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">ASCII and UTF-8 are both supported.</div>
              </div>
            </div>
          ) : null}

          {activeTab === 'Decoder' ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">SIT input</label>
                <textarea value={decoderInput} onChange={(event) => setDecoderInput(event.target.value)} className="mt-3 min-h-32 w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Decoded output</div>
                <pre className="mt-3 min-h-32 rounded-2xl bg-slate-900 p-4 text-sm text-slate-100">{decodedOutput || '...'}</pre>
              </div>
            </div>
          ) : null}

          {activeTab === 'Binary Converter' ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Binary</label>
                <textarea value={binaryInput} onChange={(event) => setBinaryInput(event.target.value)} className="mt-3 min-h-24 w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">Example: 01001111 → 67667777</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">SIT</div>
                <pre className="mt-3 min-h-24 rounded-2xl bg-slate-900 p-4 text-sm text-slate-100">{binaryToSit || '...'}</pre>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">SIT</label>
                <textarea value={sitInput} onChange={(event) => setSitInput(event.target.value)} className="mt-3 min-h-24 w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Binary</div>
                <pre className="mt-3 min-h-24 rounded-2xl bg-slate-900 p-4 text-sm text-slate-100">{sitToBinary || '...'}</pre>
              </div>
            </div>
          ) : null}

          {activeTab === 'Compliance Checker' ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Input</label>
                <textarea value={validatorInput} onChange={(event) => setValidatorInput(event.target.value)} className="mt-3 min-h-32 w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Result</div>
                <pre className="mt-3 min-h-32 rounded-2xl bg-slate-900 p-4 text-sm text-slate-100">{validation.message}\n{validation.error}</pre>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {achievement ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5" /> {achievement}
          </div>
        </motion.div>
      ) : null}
    </div>
  )
}
