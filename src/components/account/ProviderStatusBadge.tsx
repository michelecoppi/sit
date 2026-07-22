import type { ProviderStatus } from '../../types/account'

const STATUS_STYLES: Record<ProviderStatus, string> = {
  CONNECTED: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300',
  NOT_CONNECTED: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300',
  EXPIRED_LINK_CODE: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-300',
  ERROR: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300',
  LOADING: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300',
}

const STATUS_LABELS: Record<ProviderStatus, string> = {
  CONNECTED: 'Connected',
  NOT_CONNECTED: 'Not Connected',
  PENDING: 'Pending',
  EXPIRED_LINK_CODE: 'Expired Link Code',
  ERROR: 'Error',
  LOADING: 'Loading',
}

export default function ProviderStatusBadge({ status }: { status: ProviderStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
