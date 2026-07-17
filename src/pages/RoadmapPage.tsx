import { motion } from 'framer-motion'

const completed = ['SIT 1.0: Binary Translation', 'SYTE', 'Browser Encoder', 'Browser Decoder', 'SIT 2.0: Native Alphabet', 'Grammar', 'Dictionary', 'Semantic Layer', 'Character Explorer']
const planned = ['SIT 3.0: Concept Compression', 'Distributed SIT', 'Quantum SYTE', 'Adaptive Grammar', 'Self-describing Messages', 'Native Operating System']

export default function RoadmapPage() {
  return (
    <div className="space-y-8">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Roadmap</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">The SIT ecosystem continues to expand with a measured cadence of ambition and ceremonial confidence.</p>
      </motion.section>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-8 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/40">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">SIT 1.0 → SIT 2.0</h2>
          <ul className="mt-6 space-y-3">
            {completed.map((item) => (
              <li key={item} className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:bg-slate-900/70 dark:text-slate-300">
                <span className="text-emerald-600">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">SIT 3.0 (Future)</h2>
          <ul className="mt-6 space-y-3">
            {planned.map((item) => (
              <li key={item} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
