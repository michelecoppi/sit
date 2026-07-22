import { ChatBubbleLeftRightIcon, GlobeAltIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import type { ProviderType } from '../../types/account'

const PROVIDER_STYLES: Record<string, string> = {
  discord: 'from-indigo-500 to-indigo-700',
  telegram: 'from-sky-500 to-blue-700',
  github: 'from-slate-700 to-slate-900',
  google: 'from-red-500 to-orange-500',
  microsoft: 'from-cyan-500 to-blue-700',
  slack: 'from-fuchsia-500 to-violet-700',
  matrix: 'from-emerald-500 to-teal-700',
}

function getProviderInitial(provider: ProviderType) {
  return provider.slice(0, 1)
}

function getProviderIcon(provider: ProviderType) {
  if (provider === 'telegram') return ChatBubbleLeftRightIcon
  if (provider === 'website_credentials') return UserCircleIcon
  return GlobeAltIcon
}

export default function ProviderAvatar({ provider, avatarUrl, displayName }: { provider: ProviderType; avatarUrl?: string; displayName?: string }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${displayName ?? provider} avatar`}
        className="h-11 w-11 rounded-xl border border-slate-200 object-cover dark:border-slate-700"
      />
    )
  }

  const Icon = getProviderIcon(provider)
  const gradient = PROVIDER_STYLES[provider] ?? 'from-slate-500 to-slate-700'

  return (
    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
      {provider.length <= 2 ? (
        <span className="text-sm font-semibold">{provider}</span>
      ) : (
        <>
          <Icon className="h-4 w-4" />
          <span className="sr-only">{getProviderInitial(provider)}</span>
        </>
      )}
    </div>
  )
}
