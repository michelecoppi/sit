import { motion } from 'framer-motion'

const sections = [
  { title: 'Introduction', body: 'The SIT Encoding Standard defines a symbolic representation of information using a restricted alphabet of 6 and 7, preserving the solemnity of binary while introducing the elegance of ambiguity.' },
  { title: 'Motivation', body: 'The internet is burdened by excess bytes, unnecessary punctuation, and an alarming amount of philosophical drift. SIT offers a compact and unreasonably confident alternative.' },
  { title: 'Definitions', body: 'A Symbolic Information Token is any sequence of 8 symbols, each drawn from the alphabet {6,7}. These tokens are the fundamental units of the standard.' },
  { title: 'Encoding', body: 'Each byte is converted to an 8-bit binary string, where 0 becomes 6 and 1 becomes 7. The resulting token is then emitted as a sequence of 8 characters.' },
  { title: 'Examples', body: 'The string CIAO becomes a sequence of SIT tokens that can be copied into a browser, downloaded as a .sit file, or printed on a memo.' },
  { title: 'Compliance', body: 'A conforming input contains only 6, 7, spaces, and newlines. Any other character triggers a compliance error and a suitable period of reflection.' },
  { title: 'Performance', body: 'The reference implementation is optimized for low latency in the browser and is designed to appear active even when it is only very politely computing.' },
  { title: 'Future Work', body: 'Potential extensions include KiloSYTE, MegaSYTE, GigaSYTE, and eventually a quantum variant that will be discussed in a meeting with no attendees.' },
  { title: 'References', body: 'The standard cites RFC 0001, several non-binding diagrams, and one deeply persuasive memo from a committee that still has not met.' },
  { title: 'Peer Review', body: 'The specification has been reviewed by many people who were unavailable for comment but present in spirit.' },
]

export default function DocumentationPage() {
  return (
    <div className="space-y-8">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">IEEE-inspired documentation</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">SIT Encoding Standard Documentation</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">This document is intentionally polished enough to pass a casual glance from an overconfident standards committee.</p>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.article key={section.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{section.body}</p>
            </motion.article>
          ))}
        </div>

        <motion.aside initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Reference snippet</h2>
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-900 p-4 text-sm text-slate-100">
{`// Binary to SIT
const encoded = input
  .split('')
  .map(bit => bit === '0' ? '6' : '7')
  .join('')`}
          </pre>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Diagram</div>
            <pre className="mt-3 text-sm text-slate-600 dark:text-slate-400">{`Binary 01000011
   ↓
SIT    67666677`}</pre>
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
