import { LinkIcon } from '@heroicons/react/24/outline'
import ProviderAvatar from './ProviderAvatar'
import ProviderStatusBadge from './ProviderStatusBadge'
import type { ConnectedAccount } from '../../types/account'

function providerLabel(provider: string) {
  return provider.toLowerCase().split('_').map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1)).join(' ')
}

export default function ProviderCard({
  provider,
  isActionBusy,
  onConnect,
}: {
  provider: ConnectedAccount
  isActionBusy: boolean
  onConnect: (providerName: string) => void
}) {
  const canConnect = !provider.connected && provider.status !== 'LOADING' && !isActionBusy
  const isDiscord = provider.provider === 'discord'
  const profileCaption = provider.displayName ?? provider.username ?? (provider.connected ? 'Account linked' : 'No linked profile yet')

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <ProviderAvatar provider={provider.provider} avatarUrl={provider.avatarUrl} displayName={provider.displayName} />
          <div className="min-w-0">
            <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{providerLabel(provider.provider)}</h5>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{profileCaption}</p>
            {provider.connectedAt && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Connected since {new Date(provider.connectedAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>
        <ProviderStatusBadge status={provider.status} />
      </div>

      <div className="mt-4 flex justify-end">
        {provider.connected ? (
          <button
            type="button"
            disabled
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500"
          >
            Manage
          </button>
        ) : (
          <button
            type="button"
            disabled={!canConnect}
            onClick={() => onConnect(provider.provider)}
            aria-label={`Connect ${providerLabel(provider.provider)}`}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isDiscord ? 'bg-[#5865F2] hover:bg-[#4752C4]' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            {isDiscord ? 'Continue with Discord' : 'Connect'}
          </button>
        )}
      </div>
    </div>
  )
}
