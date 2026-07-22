import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import type { ProviderType } from '../../types/account'

export default function AccountLinkSuccessModal({ provider, isOpen, onClose }: { provider: ProviderType; isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${provider} connected`}>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
          <CheckCircleIcon className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-center text-xl font-semibold text-slate-900 dark:text-slate-100">{provider} Connected</h3>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-300">
          Your {provider} account is now linked to your SIT identity.
        </p>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  )
}
