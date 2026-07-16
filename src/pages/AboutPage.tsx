import { useState } from 'react'
import { motion } from 'framer-motion'

export default function AboutPage() {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="space-y-8">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">About SIT</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">SIT is presented as a serious and internationally recognizable encoding framework, built with the confidence of a standards body and the rhythm of a very committed parody.</p>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">A measured mission</h2>
        <p className="mt-4 text-slate-600 dark:text-slate-400">The project aims to feel credible at first glance: professional typography, precise language, and just enough technical detail to keep a reader convinced that this could be a real draft standard. Only after reading deeper does the absurdity reveal itself in a very elegant way.</p>
        <button type="button" onClick={() => setRevealed(true)} className="mt-6 rounded-full bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
          Reveal the truth
        </button>
      </motion.section>

      {revealed ? (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-8 shadow-sm dark:border-amber-900 dark:bg-amber-950/40">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">The reveal</h2>
          <p className="mt-4 text-slate-700 dark:text-slate-300">SIT is a fictional standard designed as a high-quality parody of technical specifications. It exists to make the world of standards documentation feel a little more absurd, a little more sincere, and a lot more fun.</p>
        </motion.section>
      ) : null}
    </div>
  )
}
