import { ArrowPathIcon } from '@heroicons/react/24/outline'
import type { ConnectedAccount } from '../../types/account'
import ProviderCard from './ProviderCard'

export default function ConnectedAccountsCard({
  providers,
  isLoading,
  error,
  actionProvider,
  onRefresh,
  onConnect,
}: {
  providers: ConnectedAccount[]
  isLoading: boolean
  error: string | null
  actionProvider: string | null
  onRefresh: () => void
  onConnect: (providerName: string) => void
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Connected Accounts</h4>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage every authentication provider connected to your SIT identity.</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          {error}
        </div>
      )}

      {isLoading && !providers.length && (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading connected providers...</p>
      )}

      {!isLoading && !providers.length && !error && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
          <p>No providers available for this identity yet.</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Telegram is shown only when SIT Core returns it from /api/account/providers.
          </p>
        </div>
      )}

      {!!providers.length && (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.provider}
              provider={provider}
              isActionBusy={actionProvider === provider.provider}
              onConnect={onConnect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
