import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  UserCircleIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  ChartBarIcon,
  StarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  LockClosedIcon,
  SparklesIcon,
  CodeBracketIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline'
import { clearSitToken, getSitToken } from '../utils/authToken'

// ---------------------------------------------------------------------------
// Types — mirrors GET /api/profile/:researcherId response exactly
// ---------------------------------------------------------------------------

interface ResearcherProfile {
  researcherId: string
  displayName: string
  rank: string
  xp: number
  level: number
  preferredVersion: string
  messagesEncoded: number
  messagesDecoded: number
  syteProcessed: number
}

interface MeProfile extends ResearcherProfile {
  preferredLanguage: string
  autoTranslation: boolean
  createdAt: string
  updatedAt: string
}

interface MeSummary {
  achievementCount: number
  linkedAccountCount: number
  recentTranslationCount: number
  lastTranslationAt: string | null
}

interface RecentTranslation {
  id: number
  messageId: string
  guildId: string
  channelId: string
  sourceContent: string
  decodedContent: string
  detectedStandard: string
  compliance: number
  syteCount: number
  createdAt: string
}

interface AchievementAward {
  awardedAt: string
  achievement: {
    code: string
    title: string
    description: string
    xpReward: number
  }
}

interface LinkedAccount {
  provider: string
  providerId: string
  createdAt: string
  updatedAt: string
}

interface MeResponse {
  profile: MeProfile
  summary: MeSummary
  recentTranslations: RecentTranslation[]
  achievements: AchievementAward[]
  linkedAccounts: LinkedAccount[]
}

type JwtPayload = {
  exp?: number
  iat?: number
  sub?: string
  [key: string]: unknown
}

// ---------------------------------------------------------------------------
// Demo data — matches the real API response shape
// ---------------------------------------------------------------------------

const DEMO_PROFILE: ResearcherProfile = {
  researcherId: 'SIT-000007',
  displayName: 'Dr. Elena Six',
  rank: 'Research Assistant',
  xp: 420,
  level: 3,
  preferredVersion: 'LEGACY',
  messagesEncoded: 70,
  messagesDecoded: 90,
  syteProcessed: 1500,
}

const RANK_COLORS: Record<string, string> = {
  'Research Assistant': 'text-slate-600 dark:text-slate-300',
  'Junior Researcher': 'text-slate-600 dark:text-slate-300',
  'Researcher': 'text-blue-600 dark:text-blue-300',
  'Senior Researcher': 'text-violet-600 dark:text-violet-300',
  'Principal Researcher': 'text-amber-600 dark:text-amber-300',
  'Distinguished Fellow': 'text-emerald-600 dark:text-emerald-300',
}

const RANK_BADGE_COLORS: Record<string, string> = {
  'Research Assistant': 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60',
  'Junior Researcher': 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60',
  'Researcher': 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40',
  'Senior Researcher': 'border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-950/40',
  'Principal Researcher': 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40',
  'Distinguished Fellow': 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40',
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({ label, value, icon: Icon, accent = 'blue' }: { label: string; value: string | number; icon: React.ElementType; accent?: string }) {
  const accentMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
  }
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentMap[accent] ?? accentMap.blue}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-slate-100">{value.toLocaleString()}</p>
      </div>
    </div>
  )
}

function XpBar({ xp, level }: { xp: number; level: number }) {
  const xpPerLevel = 1000
  const progress = Math.min((xp % xpPerLevel) / xpPerLevel, 1)
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Level {level}</span>
        <span>{xp % xpPerLevel} / {xpPerLevel} XP</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-700"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  )
}

function ProfileCard({ profile, isDemo = false }: { profile: ResearcherProfile; isDemo?: boolean }) {
  const rankColor = RANK_COLORS[profile.rank] ?? 'text-slate-600 dark:text-slate-300'
  const rankBadge = RANK_BADGE_COLORS[profile.rank] ?? RANK_BADGE_COLORS['Research Assistant']

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      {isDemo && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          <SparklesIcon className="h-4 w-4 shrink-0" />
          Demo profile — connect SIT Core to load live researcher data.
        </div>
      )}

      {/* Header */}
      <div className="rounded-[1.5rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-6 p-8 sm:grid-cols-[auto_1fr] sm:items-start">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-violet-600 text-3xl font-bold text-white shadow-lg">
            {profile.displayName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{profile.displayName}</h2>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${rankBadge} ${rankColor}`}>
                {profile.rank}
              </span>
            </div>
            <p className="mt-1 font-mono text-sm text-slate-500 dark:text-slate-400">{profile.researcherId}</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{profile.preferredVersion}</p>
            <div className="mt-4 max-w-xs">
              <XpBar xp={profile.xp} level={profile.level} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total XP" value={profile.xp} icon={StarIcon} accent="amber" />
        <StatCard label="Messages Encoded" value={profile.messagesEncoded} icon={CodeBracketIcon} accent="blue" />
        <StatCard label="Messages Decoded" value={profile.messagesDecoded} icon={ArrowsRightLeftIcon} accent="violet" />
        <StatCard label="Syte Processed" value={profile.syteProcessed} icon={ChartBarIcon} accent="emerald" />
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Login prompt shown when not authenticated
// ---------------------------------------------------------------------------

function LoginPrompt() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
        <LockClosedIcon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">Private profile</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
        Login with Discord to access your personal dashboard, achievements, translation history and full stats.
      </p>
      <button
        type="button"
        onClick={() => {
          const apiUrl = import.meta.env.VITE_API_URL
          if (apiUrl) {
            window.location.href = `${apiUrl}/api/oauth/discord/login`
          }
        }}
        disabled={!import.meta.env.VITE_API_URL}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#5865F2] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4752C4] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.003.025.015.05.031.062a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
        </svg>
        Login with Discord
      </button>
      {!import.meta.env.VITE_API_URL && (
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
          VITE_API_URL is not configured. Authentication requires SIT Core.
        </p>
      )}
    </motion.div>
  )
}

function decodeJwtPayload(token: string | null): JwtPayload | null {
  if (!token) return null

  const [, payload] = token.split('.')
  if (!payload) return null

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const decoded = atob(padded)
    return JSON.parse(decoded) as JwtPayload
  } catch {
    return null
  }
}

function getFirstStringClaim(payload: JwtPayload | null, keys: string[]) {
  if (!payload) return null
  for (const key of keys) {
    const value = payload[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return null
}

function formatUnixTimestamp(value: unknown) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'Not provided'
  return new Date(value * 1000).toLocaleString()
}

function formatIsoDate(value: string | null | undefined) {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not available'
  return date.toLocaleString()
}

function createTokenBackedProfile(payload: JwtPayload | null): ResearcherProfile | null {
  const researcherId = getFirstStringClaim(payload, ['researcherId', 'researcher_id', 'sub'])
  const displayName = getFirstStringClaim(payload, ['displayName', 'name', 'preferred_username', 'username'])
  const preferredVersion = getFirstStringClaim(payload, ['preferredVersion', 'preferred_version'])

  if (!researcherId && !displayName) return null

  return {
    ...DEMO_PROFILE,
    researcherId: researcherId ?? 'SIT-UNKNOWN',
    displayName: displayName ?? 'Authenticated Researcher',
    preferredVersion: preferredVersion ?? DEMO_PROFILE.preferredVersion,
  }
}

function AuthenticatedDashboard({ onLogout }: { onLogout: () => void }) {
  const token = getSitToken()
  const payload = decodeJwtPayload(token)
  const researcherId = getFirstStringClaim(payload, ['researcherId', 'researcher_id', 'sub'])
  const displayName = getFirstStringClaim(payload, ['displayName', 'name', 'preferred_username', 'username'])
  const [meData, setMeData] = useState<MeResponse | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL
    if (!apiUrl || !token) return

    let cancelled = false

    const loadProfile = async () => {
      setIsLoadingProfile(true)
      setProfileError(null)

      try {
        const response = await fetch(`${apiUrl}/api/me`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`profile_${response.status}`)
        }

        const data: MeResponse = await response.json()
        if (!cancelled) {
          setMeData(data)
        }
      } catch {
        if (!cancelled) {
          setProfileError('Live profile data is currently unavailable. Showing token-based details only.')
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProfile(false)
        }
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [token])

  const fallbackProfile = createTokenBackedProfile(payload)
  const liveProfile: ResearcherProfile | null = meData ? meData.profile : null
  const effectiveProfile = liveProfile ?? fallbackProfile
  const effectiveDisplayName = meData?.profile.displayName ?? displayName
  const effectiveResearcherId = meData?.profile.researcherId ?? researcherId

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-5">
      {effectiveProfile && <ProfileCard profile={effectiveProfile} isDemo={!meData && !import.meta.env.VITE_API_URL} />}

      {isLoadingProfile && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Loading live profile data...
        </div>
      )}

      {profileError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          {profileError}
        </div>
      )}

      {meData && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Achievements" value={meData.summary.achievementCount} icon={StarIcon} accent="amber" />
          <StatCard label="Linked Accounts" value={meData.summary.linkedAccountCount} icon={UserCircleIcon} accent="blue" />
          <StatCard label="Recent Translations" value={meData.summary.recentTranslationCount} icon={ArrowsRightLeftIcon} accent="violet" />
          <StatCard label="Last Translation" value={formatIsoDate(meData.summary.lastTranslationAt)} icon={ChartBarIcon} accent="emerald" />
        </div>
      )}

      {meData?.profile && (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Preferences</h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Version" value={meData.profile.preferredVersion} icon={CodeBracketIcon} accent="blue" />
            <StatCard label="Language" value={meData.profile.preferredLanguage.toUpperCase()} icon={BoltIcon} accent="violet" />
            <StatCard label="Auto Translation" value={meData.profile.autoTranslation ? 'Enabled' : 'Disabled'} icon={CheckCircleIcon} accent="emerald" />
            <StatCard label="Profile Updated" value={formatIsoDate(meData.profile.updatedAt)} icon={ArrowPathIcon} accent="amber" />
          </div>
        </div>
      )}

      {meData?.recentTranslations.length ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Translations</h4>
          <div className="mt-4 space-y-3">
            {meData.recentTranslations.slice(0, 5).map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{entry.detectedStandard} · {entry.compliance}% compliance</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatIsoDate(entry.createdAt)}</p>
                </div>
                <p className="mt-2 font-mono text-xs text-slate-500 dark:text-slate-400">Message ID: {entry.messageId}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{entry.decodedContent}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{entry.syteCount.toLocaleString()} SYTE processed</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {meData?.achievements.length ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Achievements</h4>
          <div className="mt-4 space-y-3">
            {meData.achievements.map((award) => (
              <div key={`${award.achievement.code}-${award.awardedAt}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{award.achievement.title}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{award.achievement.description}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">+{award.achievement.xpReward} XP · Awarded {formatIsoDate(award.awardedAt)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {meData?.linkedAccounts.length ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Linked Accounts</h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {meData.linkedAccounts.map((account) => (
              <div key={`${account.provider}-${account.providerId}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-sm font-semibold uppercase text-slate-900 dark:text-slate-100">{account.provider}</p>
                <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">{account.providerId}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Linked {formatIsoDate(account.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-8 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/30">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
          <CheckCircleIcon className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-center text-xl font-semibold text-slate-900 dark:text-slate-100">Discord account connected</h3>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-600 dark:text-slate-300">
          Your session is active. Session details and access controls are available below.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Display Name" value={effectiveDisplayName ?? 'Not available'} icon={UserCircleIcon} accent="blue" />
          <StatCard label="Researcher ID" value={effectiveResearcherId ?? 'Not available'} icon={CodeBracketIcon} accent="violet" />
          <StatCard label="Token Expires" value={formatUnixTimestamp(payload?.exp)} icon={LockClosedIcon} accent="emerald" />
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Log out
        </button>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Public profile lookup form
// ---------------------------------------------------------------------------

type LookupState = 'idle' | 'loading' | 'found' | 'not_found' | 'invalid_id' | 'error'

function PublicLookup() {
  const [inputValue, setInputValue] = useState('')
  const [state, setState] = useState<LookupState>('idle')
  const [profile, setProfile] = useState<ResearcherProfile | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const id = inputValue.trim()
    if (!id) return

    setState('loading')
    setProfile(null)

    const apiUrl = import.meta.env.VITE_API_URL
    if (!apiUrl) {
      // No API configured – show demo profile for any non-empty query
      await new Promise((resolve) => setTimeout(resolve, 600))
      setProfile({ ...DEMO_PROFILE, researcherId: id })
      setState('found')
      return
    }

    try {
      const response = await fetch(`${apiUrl}/api/profile/${encodeURIComponent(id)}`, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.status === 400) {
        // invalid_researcher_id
        setState('invalid_id')
        return
      }
      if (response.status === 404) {
        // profile_not_found
        setState('not_found')
        return
      }
      if (!response.ok) {
        setState('error')
        return
      }
      const data: ResearcherProfile = await response.json()
      setProfile(data)
      setState('found')
    } catch {
      setState('error')
    }
  }

  const reset = () => {
    setState('idle')
    setProfile(null)
    setInputValue('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter Researcher ID, e.g. SIT-0007"
            className="w-full rounded-full border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
        <button
          type="submit"
          disabled={!inputValue.trim() || state === 'loading'}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state === 'loading' ? (
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
          ) : (
            <MagnifyingGlassIcon className="h-4 w-4" />
          )}
          Search
        </button>
      </form>

      {state === 'invalid_id' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
          Invalid Researcher ID format.
          <button type="button" onClick={reset} className="ml-auto shrink-0 text-xs underline underline-offset-2">
            Clear
          </button>
        </motion.div>
      )}

      {state === 'not_found' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
          Researcher not found. Check the ID and try again.
          <button type="button" onClick={reset} className="ml-auto shrink-0 text-xs underline underline-offset-2">
            Clear
          </button>
        </motion.div>
      )}

      {state === 'error' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
          Could not reach SIT Core. Please try again later.
          <button type="button" onClick={reset} className="ml-auto shrink-0 text-xs underline underline-offset-2">
            Retry
          </button>
        </motion.div>
      )}

      {state === 'found' && profile && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircleIcon className="h-4 w-4" />
              Profile found
            </div>
            <button type="button" onClick={reset} className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
              Search another
            </button>
          </div>
          <ProfileCard profile={profile} isDemo={!import.meta.env.VITE_API_URL} />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const [tab, setTab] = useState<'public' | 'private'>('public')
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getSitToken()))

  const handleLogout = () => {
    clearSitToken()
    setIsAuthenticated(false)
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-8 md:p-12">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
              <UserCircleIcon className="mr-2 h-4 w-4" />
              Researcher Registry
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              Profiles
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Look up any registered SIT researcher by ID, or access your private dashboard after authenticating with Discord.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-5 bg-gradient-to-br from-blue-50 via-white to-slate-100 p-8 md:p-12 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
            <div className="grid gap-3">
              {[
                { icon: StarIcon, label: 'Achievements & XP' },
                { icon: BoltIcon, label: 'Encoding Activity' },
                { icon: ChartBarIcon, label: 'Statistics & Rank' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 backdrop-blur-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                  <Icon className="h-4 w-4 text-blue-500" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Tabs */}
      <div className="flex gap-2 rounded-2xl border border-slate-200 bg-slate-100/60 p-1 dark:border-slate-800 dark:bg-slate-800/40 w-fit">
        {(['public', 'private'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-xl px-5 py-2 text-sm font-semibold capitalize transition ${
              tab === t
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            {t === 'public' ? 'Public Lookup' : 'My Profile'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'public' ? (
        <motion.div key="public" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">Search Researcher</h2>
            <PublicLookup />
          </div>
        </motion.div>
      ) : (
        <motion.div key="private" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {isAuthenticated ? <AuthenticatedDashboard onLogout={handleLogout} /> : <LoginPrompt />}
        </motion.div>
      )}
    </div>
  )
}
