import { XMarkIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import LinkCodeBox from './LinkCodeBox'
import type { ProviderType } from '../../types/account'

export default function LinkProviderModal({
  provider,
  code,
  expiresInSeconds,
  isOpen,
  isExpired,
  onExpired,
  onConfirmCompleted,
  onGenerateNewCode,
  onClose,
}: {
  provider: ProviderType
  code: string
  expiresInSeconds: number
  isOpen: boolean
  isExpired: boolean
  onExpired: () => void
  onConfirmCompleted: () => void
  onGenerateNewCode: () => void
  onClose: () => void
}) {
  if (!isOpen) return null

  const providerLabel = provider.charAt(0).toUpperCase() + provider.slice(1)
  const isTelegram = provider === 'telegram'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Connect ${providerLabel}`}>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Connect {providerLabel}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Link this provider to your SIT identity using the temporary code below.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close link provider modal"
            className="rounded-full border border-slate-300 p-1.5 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <LinkCodeBox code={code} expiresInSeconds={expiresInSeconds} onExpired={onExpired} />

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <p className="font-medium text-slate-900 dark:text-slate-100">Instructions</p>
            {isTelegram ? (
              <>
                <p className="mt-2">1. Open Telegram and start the SIT bot chat.</p>
                <p>2. Send <span className="font-mono">/link {code}</span>.</p>
                <p>3. Return here and use <span className="font-semibold">Ho completato</span> to refresh linked providers.</p>
              </>
            ) : (
              <>
                <p className="mt-2">1. Open {providerLabel}.</p>
                <p>2. Send <span className="font-mono">/link {code}</span>.</p>
                <p>3. Return here and click <span className="font-semibold">Ho completato</span>.</p>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onConfirmCompleted}
              className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Ho completato
            </button>

            <button
              type="button"
              onClick={onGenerateNewCode}
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Rigenera codice
            </button>
          </div>

          {isExpired && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
              Codice scaduto. Rigenera un nuovo codice per continuare.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
