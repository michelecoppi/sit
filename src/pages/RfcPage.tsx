import { motion } from 'framer-motion'

export default function RfcPage() {
  return (
    <div className="space-y-8">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">RFC-0001</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">The Symbolic Information Token Standard</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">Status: Informational. Obsolete by design. Intended for use in scenarios requiring unusual confidence and no practical benefit.</p>
      </motion.section>

      <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Abstract</h2>
        <p className="mt-4 text-slate-600 dark:text-slate-400">This memo defines the SIT framework as a symbolic encoding scheme using a restricted alphabet centered on the values 6 and 7. The goal is to ensure a communication channel that is both technically plausible and surprisingly difficult to explain in a sentence.</p>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60">
          <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Example</div>
          <pre className="mt-3 overflow-x-auto text-sm text-slate-700 dark:text-slate-300">{`01000011 -> 67666677`}</pre>
        </div>
      </motion.article>
    </div>
  )
}
