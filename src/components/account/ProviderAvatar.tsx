import { ChatBubbleLeftRightIcon, GlobeAltIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import type { ProviderType } from '../../types/account'

const PROVIDER_STYLES: Record<string, string> = {
  DISCORD: 'from-indigo-500 to-indigo-700',
  TELEGRAM: 'from-sky-500 to-blue-700',
  GITHUB: 'from-slate-700 to-slate-900',
  GOOGLE: 'from-red-500 to-orange-500',
  MICROSOFT: 'from-cyan-500 to-blue-700',
  SLACK: 'from-fuchsia-500 to-violet-700',
  MATRIX: 'from-emerald-500 to-teal-700',
}

function getProviderInitial(provider: ProviderType) {
  return provider.slice(0, 1)
}

function getProviderIcon(provider: ProviderType) {
  if (provider === 'TELEGRAM') return ChatBubbleLeftRightIcon
  if (provider === 'WEBSITE_CREDENTIALS') return UserCircleIcon
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
