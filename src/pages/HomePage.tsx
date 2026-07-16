import { motion } from 'framer-motion'
import { ArrowRightIcon, CheckCircleIcon, CubeTransparentIcon, GlobeAltIcon, ShieldCheckIcon, SparklesIcon, CpuChipIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

const featureCards = [
  { title: 'Binary Compatible', description: 'Seamlessly bridges the gap between old school bits and new school symbolism.', icon: CubeTransparentIcon },
  { title: 'Open Source', description: 'The reference implementation is available for review, critique, and enthusiastic debate.', icon: GlobeAltIcon },
  { title: 'IEEE-ish', description: 'Structured with conspicuous authority and no immediate evidence of contradiction.', icon: ShieldCheckIcon },
  { title: 'Browser Encoder', description: 'Encode text directly in the browser without a server or suspicious middleware.', icon: CpuChipIcon },
  { title: 'Browser Decoder', description: 'Recover your symbolic payload with a reassuringly minimal interface.', icon: SparklesIcon },
  { title: 'Compliance Checker', description: 'Validate symbolic input and report any deviations with appropriate gravitas.', icon: CheckCircleIcon },
]

const benchmarks = [
  { label: 'Internet arguments', value: '100%', accent: 'from-blue-600 to-cyan-500' },
  { label: 'Storage', value: '0%', accent: 'from-slate-600 to-slate-500' },
  { label: 'Speed', value: '0%', accent: 'from-emerald-600 to-green-500' },
  { label: 'Terminology', value: '∞%', accent: 'from-violet-600 to-fuchsia-500' },
]

const certifications = ['Open Standard', 'RFC Compatible', 'ISO-ish', 'IEEE-ish', 'Peer Reviewed*']

export default function HomePage() {
  return (
    <div className="space-y-16">
      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
              <CheckCircleIcon className="mr-2 h-4 w-4" />
              Draft Standard • Public Review
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              SIT Encoding Standard
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
              A revolutionary symbolic encoding framework based exclusively on the {'{6,7}'} alphabet.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/docs" className="inline-flex items-center rounded-full bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
                Read Documentation
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
              <Link to="/playground" className="inline-flex items-center rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200">
                Open Playground
              </Link>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-inner dark:border-slate-800 dark:bg-slate-950/60">
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Reference Example</div>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-900 p-4 text-sm text-slate-100">
{`CIAO
↓
67666677
67667667
67666667
67667777`}
            </pre>
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              Compliance: Approved for ceremonial deployment.
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {featureCards.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.article key={feature.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.35 }} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 inline-flex rounded-2xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/40 dark:text-blue-200">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">{feature.description}</p>
            </motion.article>
          )
        })}
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Fake certifications</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {certifications.map((item) => (
              <span key={item} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">
                {item}
              </span>
            ))}
          </div>
          <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">*Terms and conditions may apply.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Humorous benchmarks</h2>
          <div className="mt-6 space-y-4">
            {benchmarks.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className={`h-3 rounded-full bg-gradient-to-r ${item.accent}`} style={{ width: '92%' }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  )
}
