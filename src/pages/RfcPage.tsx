import { motion } from 'framer-motion'
import {
  BeakerIcon,
  CheckBadgeIcon,
  ClipboardDocumentListIcon,
  DocumentMagnifyingGlassIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline'

const rfcs = [
  {
    id: 'RFC-0001',
    title: 'Original SIT Standard',
    body: 'Historical binary translation and SYTE reference.',
    status: 'Stable',
    icon: ClipboardDocumentListIcon,
  },
  {
    id: 'RFC-0002',
    title: 'Native Alphabet',
    body: 'The official semantic tokens and their native sequences.',
    status: 'Stable',
    icon: LanguageIcon,
  },
  {
    id: 'RFC-0003',
    title: 'Grammar',
    body: 'Composition rules for concepts, actions, relations and modifiers.',
    status: 'Draft',
    icon: DocumentMagnifyingGlassIcon,
  },
  {
    id: 'RFC-0004',
    title: 'Semantic Layer',
    body: 'Language-independent concept interpretation.',
    status: 'Draft',
    icon: BeakerIcon,
  },
  {
    id: 'RFC-0005',
    title: 'Legacy Compatibility',
    body: 'ASCII and binary interoperability for older applications.',
    status: 'Review',
    icon: CheckBadgeIcon,
  },
]

export default function RfcPage() {
  return (
    <div className="space-y-8">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">SIT document registry</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Requests for Symbolism</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">The formal record of SIT 1.0 history and the recommended SIT 2.0 native standard.</p>
      </motion.section>

      <div className="grid gap-4 md:grid-cols-2">
        {rfcs.map((rfc, index) => {
          const Icon = rfc.icon
          const statusStyles =
            rfc.status === 'Stable'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
              : rfc.status === 'Review'
                ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
                : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300'

          return (
          <motion.article
            key={rfc.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                <Icon className="h-5 w-5" />
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles}`}>
                {rfc.status}
              </span>
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-300">{rfc.id}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{rfc.title}</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">{rfc.body}</p>
            <button
              type="button"
              className="mt-5 inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-300"
            >
              Read memo
            </button>
          </motion.article>
          )
        })}
      </div>
    </div>
  )
}
