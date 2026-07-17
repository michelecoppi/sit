import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  BeakerIcon,
  CheckBadgeIcon,
  ClipboardDocumentListIcon,
  DocumentMagnifyingGlassIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline'

type RfcRecord = {
  id: string
  title: string
  body: string
  status: 'Stable' | 'Draft' | 'Review'
  icon: typeof ClipboardDocumentListIcon
  memo: {
    updated: string
    summary: string
    highlights: string[]
    readMorePath?: string
    readMoreLabel?: string
  }
}

const rfcs: RfcRecord[] = [
  {
    id: 'RFC-0001',
    title: 'Original SIT Standard',
    body: 'Historical binary translation and SYTE reference.',
    status: 'Stable',
    icon: ClipboardDocumentListIcon,
    memo: {
      updated: '2026-03-14',
      summary: 'Defines SIT 1.0 as a byte-preserving symbolic layer where 0 maps to 6 and 1 maps to 7.',
      highlights: [
        'Compatibility with legacy ASCII and binary pipelines is mandatory.',
        'A token is valid when it contains only symbols 6 and 7 in groups of 8.',
        'Reference encoder and decoder behavior are considered normative.',
      ],
      readMorePath: '/docs',
      readMoreLabel: 'Open documentation',
    },
  },
  {
    id: 'RFC-0002',
    title: 'Native Alphabet',
    body: 'The official semantic tokens and their native sequences.',
    status: 'Stable',
    icon: LanguageIcon,
    memo: {
      updated: '2026-04-02',
      summary: 'Introduces the native SIT alphabet as first-class symbols rather than binary substitutions.',
      highlights: [
        'Each native token maps to a concept group and a usage category.',
        'Dictionary and explorer pages are the canonical registry for current symbols.',
        'Legacy mappings remain available as a non-primary compatibility layer.',
      ],
      readMorePath: '/alphabet',
      readMoreLabel: 'View alphabet',
    },
  },
  {
    id: 'RFC-0003',
    title: 'Grammar',
    body: 'Composition rules for concepts, actions, relations and modifiers.',
    status: 'Draft',
    icon: DocumentMagnifyingGlassIcon,
    memo: {
      updated: '2026-05-21',
      summary: 'Draft grammar defines symbolic sentence structure with explicit role blocks.',
      highlights: [
        'Proposed slots include Subject, Verb, Object, Modifier and Connector.',
        'Validation must reject ambiguous ordering for deterministic decoding.',
        'Open question: compact notation for optional modifiers in chained clauses.',
      ],
      readMorePath: '/grammar',
      readMoreLabel: 'Open grammar page',
    },
  },
  {
    id: 'RFC-0004',
    title: 'Semantic Layer',
    body: 'Language-independent concept interpretation.',
    status: 'Draft',
    icon: BeakerIcon,
    memo: {
      updated: '2026-06-07',
      summary: 'Describes concept-level encoding where output text is derived from semantic intent.',
      highlights: [
        'Semantic tokens should resolve to multiple natural languages from one source sequence.',
        'Concept fidelity is prioritized over exact phrase preservation.',
        'Resolver behavior is currently experimental and under review.',
      ],
      readMorePath: '/semantic',
      readMoreLabel: 'Open semantic engine',
    },
  },
  {
    id: 'RFC-0005',
    title: 'Legacy Compatibility',
    body: 'ASCII and binary interoperability for older applications.',
    status: 'Review',
    icon: CheckBadgeIcon,
    memo: {
      updated: '2026-06-29',
      summary: 'Specifies adapters that keep SIT 2.0 interoperable with systems still bound to legacy formats.',
      highlights: [
        'Round-trip conversion accuracy is required for constrained byte ranges.',
        'Compatibility mode is explicitly opt-in and tracked in diagnostics.',
        'Migration guidance recommends progressive switch to native SIT sequences.',
      ],
      readMorePath: '/playground',
      readMoreLabel: 'Try legacy tools',
    },
  },
  {
    id: 'RFC-0006',
    title: 'Punctuation and Symbolic Operators',
    body: 'Formal grammar for punctuation, grouping and operator-style native symbols in SIT 2.0.',
    status: 'Review',
    icon: DocumentMagnifyingGlassIcon,
    memo: {
      updated: '2026-07-17',
      summary: 'Defines punctuation marks and symbolic operators as first-class native tokens with deterministic spacing and grouping behavior.',
      highlights: [
        'Grouping symbols such as (), [], {}, and <> must decode with stable enclosure ordering.',
        'Operators including +, =, |, &, *, @, #, / and \\ are valid native tokens when registered in the canonical alphabet.',
        'Decoders should expose both natural rendering and canonical token names when diagnostic mode is requested.',
      ],
      readMorePath: '/punctuation',
      readMoreLabel: 'Open punctuation page',
    },
  },
]

export default function RfcPage() {
  const [selectedRfc, setSelectedRfc] = useState<RfcRecord | null>(null)

  useEffect(() => {
    if (!selectedRfc) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedRfc(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedRfc])

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
              onClick={() => setSelectedRfc(rfc)}
              aria-label={`Read memo for ${rfc.id}`}
              aria-haspopup="dialog"
              className="mt-5 inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-300"
            >
              Read memo
            </button>
          </motion.article>
          )
        })}
      </div>

      <AnimatePresence>
        {selectedRfc ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-4"
            onClick={() => setSelectedRfc(null)}
          >
            <motion.div
              initial={{ y: 24, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 12, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 240, damping: 24 }}
              role="dialog"
              aria-modal="true"
              aria-label={`${selectedRfc.id} memo`}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-300">Consortium memo</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{selectedRfc.id}: {selectedRfc.title}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Updated {selectedRfc.memo.updated}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRfc(null)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200"
                >
                  Close
                </button>
              </div>

              <p className="mt-5 text-slate-700 dark:text-slate-300">{selectedRfc.memo.summary}</p>

              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {selectedRfc.memo.highlights.map((highlight) => (
                  <li key={highlight} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/60">
                    {highlight}
                  </li>
                ))}
              </ul>

              {selectedRfc.memo.readMorePath ? (
                <Link
                  to={selectedRfc.memo.readMorePath}
                  onClick={() => setSelectedRfc(null)}
                  className="mt-6 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                >
                  {selectedRfc.memo.readMoreLabel ?? 'Read more'}
                </Link>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
