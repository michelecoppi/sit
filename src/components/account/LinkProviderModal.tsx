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
  onGenerateNewCode,
  onClose,
}: {
  provider: ProviderType
  code: string
  expiresInSeconds: number
  isOpen: boolean
  isExpired: boolean
  onExpired: () => void
  onGenerateNewCode: () => void
  onClose: () => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Connect ${provider}`}>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Connect {provider}</h3>
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
            <p className="mt-2">1. Open {provider}.</p>
            <p>2. Send <span className="font-mono">/link {code}</span>.</p>
            <p>3. Wait for confirmation. This dashboard will refresh automatically.</p>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
            QR placeholder: deep-link and QR generation will be supported in a future release.
          </div>

          {isExpired && (
            <button
              type="button"
              onClick={onGenerateNewCode}
              className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Generate New Code
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
