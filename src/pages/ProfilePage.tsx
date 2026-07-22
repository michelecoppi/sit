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
  ChatBubbleLeftRightIcon,
  XCircleIcon,
  LockClosedIcon,
  SparklesIcon,
  CodeBracketIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline'
import AccountLinkSuccessModal from '../components/account/AccountLinkSuccessModal'
import ConnectedAccountsCard from '../components/account/ConnectedAccountsCard'
import LinkProviderModal from '../components/account/LinkProviderModal'
import { AccountProvider, useAccount } from '../context/AccountContext'
import { useAuth } from '../context/AuthContext'
import { createLoginTicket, getDiscordLoginUrl, getLoginStatus } from '../services/authService'
import { ApiClientError } from '../services/apiClient'
import type { LinkCodeResponse } from '../types/account'
import type { TelegramLoginTicketSnapshot } from '../types/auth'
import type { ResearcherProfile } from '../types/profile'

type JwtPayload = {
  exp?: number
  iat?: number
  sub?: string
  [key: string]: unknown
}

const DEFAULT_LINK_CODE_TTL_SECONDS = 10 * 60
const DEFAULT_LOGIN_POLL_INTERVAL_MS = 2000
const DEFAULT_LOGIN_POLL_TIMEOUT_MS = 180000
const TELEGRAM_LOGIN_TICKET_STORAGE_KEY = 'sit_telegram_login_ticket'
const OAUTH_ERROR_STORAGE_KEY = 'sit_oauth_callback_error'

function getPollIntervalMs() {
  const configured = Number(import.meta.env.VITE_LOGIN_POLL_INTERVAL_MS)
  if (!Number.isFinite(configured) || configured <= 0) return DEFAULT_LOGIN_POLL_INTERVAL_MS
  return configured
}

function getPollTimeoutMs() {
  const configured = Number(import.meta.env.VITE_LOGIN_POLL_TIMEOUT_MS)
  if (!Number.isFinite(configured) || configured <= 0) return DEFAULT_LOGIN_POLL_TIMEOUT_MS
  return configured
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
  const { completeLogin, authError, clearAuthError } = useAuth()
  const [discordLoading, setDiscordLoading] = useState(false)
  const [telegramLoading, setTelegramLoading] = useState(false)
  const [telegramStatus, setTelegramStatus] = useState<'idle' | 'pending' | 'completed' | 'expired' | 'used' | 'cancelled'>('idle')
  const [telegramError, setTelegramError] = useState<string | null>(null)
  const [oauthError, setOauthError] = useState<string | null>(null)
  const [ticketSnapshot, setTicketSnapshot] = useState<TelegramLoginTicketSnapshot | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const pollTimerRef = useRef<number | null>(null)
  const countdownTimerRef = useRef<number | null>(null)

  const stopPolling = (clearStoredTicket = false) => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
    if (clearStoredTicket) {
      sessionStorage.removeItem(TELEGRAM_LOGIN_TICKET_STORAGE_KEY)
    }
  }

  const recoverOauthError = () => {
    const code = sessionStorage.getItem(OAUTH_ERROR_STORAGE_KEY)
    if (!code) return

    sessionStorage.removeItem(OAUTH_ERROR_STORAGE_KEY)

    if (code === 'missing_token') {
      setOauthError('Callback Discord non valida: token mancante. Riprova il login.')
      return
    }

    if (code === 'invalid_token') {
      setOauthError('Callback Discord completata ma token non valido. Effettua di nuovo il login.')
      return
    }

    setOauthError('Login Discord non completato. Riprova dal pulsante di accesso.')
  }

  const startPolling = (snapshot: TelegramLoginTicketSnapshot) => {
    if (ticketSnapshot?.ticket === snapshot.ticket && pollTimerRef.current) return

    stopPolling(false)
    clearAuthError()
    setOauthError(null)
    setTelegramError(null)
    setTelegramStatus('pending')
    setTicketSnapshot(snapshot)

    const timeoutMs = getPollTimeoutMs()
    const pollIntervalMs = getPollIntervalMs()
    const startedAt = snapshot.startedAt
    const expireAtMs = new Date(snapshot.expiresAt).getTime()

    const tickCountdown = () => {
      const remaining = Math.max(0, Math.floor((expireAtMs - Date.now()) / 1000))
      setRemainingSeconds(remaining)
      if (remaining <= 0) {
        stopPolling(true)
        setTelegramStatus('expired')
      }
    }

    const pollOnce = async () => {
      const elapsed = Date.now() - startedAt
      if (elapsed > timeoutMs) {
        stopPolling(true)
        setTelegramError('Timeout di verifica raggiunto. Genera un nuovo ticket Telegram.')
        setTelegramStatus('cancelled')
        return
      }

      try {
        const statusResponse = await getLoginStatus(snapshot.ticket)
        if (statusResponse.status === 'COMPLETED') {
          stopPolling(true)
          setTelegramStatus('completed')
          await completeLogin(statusResponse.token)
          return
        }

        if (statusResponse.status === 'EXPIRED') {
          stopPolling(true)
          setTelegramStatus('expired')
          return
        }

        if (statusResponse.status === 'USED') {
          stopPolling(true)
          setTelegramStatus('used')
        }
      } catch (error) {
        if (error instanceof ApiClientError) {
          setTelegramError(error.message)
          if (error.code === 'expired_login_ticket') {
            stopPolling(true)
            setTelegramStatus('expired')
          }
          if (error.code === 'used_login_ticket') {
            stopPolling(true)
            setTelegramStatus('used')
          }
          return
        }
        setTelegramError('Errore temporaneo nel controllo ticket. Continuiamo a riprovare...')
      }
    }

    tickCountdown()
    void pollOnce()
    countdownTimerRef.current = window.setInterval(tickCountdown, 1000)
    pollTimerRef.current = window.setInterval(() => {
      void pollOnce()
    }, pollIntervalMs)
  }

  const createTelegramTicket = async () => {
    setTelegramLoading(true)
    setTelegramError(null)
    clearAuthError()
    setOauthError(null)

    try {
      const response = await createLoginTicket('telegram')
      const snapshot: TelegramLoginTicketSnapshot = {
        ticket: response.ticket,
        loginUrl: response.loginUrl,
        expiresAt: response.expiresAt,
        startedAt: Date.now(),
      }

      sessionStorage.setItem(TELEGRAM_LOGIN_TICKET_STORAGE_KEY, JSON.stringify(snapshot))
      window.open(response.loginUrl, '_blank', 'noopener,noreferrer')
      startPolling(snapshot)
    } catch (error) {
      setTelegramError(error instanceof Error ? error.message : 'Impossibile avviare il login Telegram.')
    } finally {
      setTelegramLoading(false)
    }
  }

  useEffect(() => {
    recoverOauthError()

    const rawTicket = sessionStorage.getItem(TELEGRAM_LOGIN_TICKET_STORAGE_KEY)
    if (!rawTicket) return

    try {
      const snapshot = JSON.parse(rawTicket) as TelegramLoginTicketSnapshot
      const expiresAt = new Date(snapshot.expiresAt).getTime()

      if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
        sessionStorage.removeItem(TELEGRAM_LOGIN_TICKET_STORAGE_KEY)
        return
      }

      startPolling(snapshot)
    } catch {
      sessionStorage.removeItem(TELEGRAM_LOGIN_TICKET_STORAGE_KEY)
    }

    return () => {
      stopPolling(false)
    }
  }, [])

  const formattedRemaining = `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`

  const handleDiscordLogin = () => {
    setDiscordLoading(true)
    clearAuthError()
    setTelegramError(null)
    setOauthError(null)

    try {
      window.location.href = getDiscordLoginUrl()
    } catch (error) {
      setDiscordLoading(false)
      setOauthError(error instanceof Error ? error.message : 'Impossibile avviare il login Discord.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
        <LockClosedIcon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-center text-xl font-semibold text-slate-900 dark:text-slate-100">Private profile</h3>
      <p className="mx-auto mt-2 max-w-sm text-center text-sm text-slate-500 dark:text-slate-400">
        Sign in with an available provider to access your personal dashboard, achievements, translation history and full stats.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleDiscordLogin}
          disabled={discordLoading || telegramLoading || !import.meta.env.VITE_API_URL}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4752C4] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {discordLoading ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
          Continua con Discord
        </button>

        <button
          type="button"
          onClick={() => {
            void createTelegramTicket()
          }}
          disabled={telegramLoading || discordLoading || !import.meta.env.VITE_API_URL}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-300 bg-sky-50 px-5 py-3 text-sm font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/40"
        >
          {telegramLoading ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <ChatBubbleLeftRightIcon className="h-4 w-4" />}
          Continua con Telegram
        </button>
      </div>

      {telegramStatus === 'pending' && ticketSnapshot && (
        <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300">
          <p className="font-semibold">In attesa conferma su Telegram</p>
          <p className="mt-1 break-all font-mono text-xs">Ticket: {ticketSnapshot.ticket}</p>
          <p className="mt-2">Scade tra <span className="font-mono font-semibold">{formattedRemaining}</span></p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={ticketSnapshot.loginUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-700"
            >
              Apri Telegram Bot
            </a>
            <button
              type="button"
              onClick={() => {
                stopPolling(true)
                setTicketSnapshot(null)
                setTelegramStatus('cancelled')
              }}
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Annulla polling
            </button>
          </div>
        </div>
      )}

      {telegramStatus === 'expired' && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          Ticket Telegram scaduto. Genera un nuovo ticket per continuare.
        </div>
      )}

      {telegramStatus === 'used' && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          Ticket gia usato. Genera un nuovo ticket e riprova.
        </div>
      )}

      {telegramStatus !== 'pending' && telegramStatus !== 'completed' && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => {
              void createTelegramTicket()
            }}
            disabled={telegramLoading || !import.meta.env.VITE_API_URL}
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Genera nuovo ticket
          </button>
        </div>
      )}

      {(telegramError || oauthError || authError) && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          <div className="flex items-start gap-2">
            <XCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{telegramError ?? oauthError ?? authError}</p>
          </div>
        </div>
      )}

      {!import.meta.env.VITE_API_URL && (
        <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
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

function resolveLinkCodeTtl(response: LinkCodeResponse) {
  if (typeof response.expiresInSeconds === 'number' && response.expiresInSeconds > 0) {
    return Math.max(1, Math.floor(response.expiresInSeconds))
  }

  if (response.expiresAt) {
    const expiryTime = new Date(response.expiresAt).getTime()
    if (!Number.isNaN(expiryTime)) {
      const remainingSeconds = Math.floor((expiryTime - Date.now()) / 1000)
      return Math.max(1, remainingSeconds)
    }
  }

  return DEFAULT_LINK_CODE_TTL_SECONDS
}

function AuthenticatedDashboard({ onLogout }: { onLogout: () => void }) {
  const { token, me, authError, clearAuthError } = useAuth()
  const payload = decodeJwtPayload(token)
  const researcherId = getFirstStringClaim(payload, ['researcherId', 'researcher_id', 'sub'])
  const displayName = getFirstStringClaim(payload, ['displayName', 'name', 'preferred_username', 'username'])
  const { providers, isLoading, providersError, refreshProviders, refreshProvidersOnly, generateLinkCode } = useAccount()
  const [actionProvider, setActionProvider] = useState<string | null>(null)
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null)
  const [linkCode, setLinkCode] = useState<string | null>(null)
  const [linkCodeTtlSeconds, setLinkCodeTtlSeconds] = useState(DEFAULT_LINK_CODE_TTL_SECONDS)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [isLinkExpired, setIsLinkExpired] = useState(false)
  const [successProvider, setSuccessProvider] = useState<string | null>(null)
  const [linkError, setLinkError] = useState<string | null>(null)

  const handleConnectProvider = async (providerName: string) => {
    setActionProvider(providerName)
    clearAuthError()
    setLinkError(null)

    try {
      const result = await generateLinkCode(providerName)
      setLinkingProvider(result.provider)
      setLinkCode(result.code)
      setLinkCodeTtlSeconds(resolveLinkCodeTtl(result))
      setIsLinkExpired(false)
      setIsLinkModalOpen(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start provider linking right now.'
      setLinkError(message)
    } finally {
      setActionProvider(null)
    }
  }

  useEffect(() => {
    if (!isLinkModalOpen || !linkingProvider) return

    let active = true
    const intervalId = window.setInterval(async () => {
      try {
        const latestProviders = await refreshProvidersOnly()
        const linkedProvider = latestProviders.find((provider) => provider.provider === linkingProvider)

        if (active && linkedProvider?.connected) {
          setIsLinkModalOpen(false)
          setSuccessProvider(linkingProvider)
          setIsLinkExpired(false)
          setLinkCode(null)
        }
      } catch {
        // Keep polling; refresh button and next poll can recover transient API issues.
      }
    }, 3000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [isLinkModalOpen, linkingProvider, refreshProvidersOnly])

  const fallbackProfile = createTokenBackedProfile(payload)
  const liveProfile: ResearcherProfile | null = me ? me.profile : null
  const effectiveProfile = liveProfile ?? fallbackProfile
  const effectiveDisplayName = me?.profile.displayName ?? displayName
  const effectiveResearcherId = me?.profile.researcherId ?? researcherId

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-5">
      {effectiveProfile && <ProfileCard profile={effectiveProfile} isDemo={!me && !import.meta.env.VITE_API_URL} />}

      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Loading live profile data...
        </div>
      )}

      {authError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          {authError}
        </div>
      )}

      {me && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Achievements" value={me.summary.achievementCount} icon={StarIcon} accent="amber" />
          <StatCard label="Linked Accounts" value={me.summary.linkedAccountCount} icon={UserCircleIcon} accent="blue" />
          <StatCard label="Recent Translations" value={me.summary.recentTranslationCount} icon={ArrowsRightLeftIcon} accent="violet" />
          <StatCard label="Last Translation" value={formatIsoDate(me.summary.lastTranslationAt)} icon={ChartBarIcon} accent="emerald" />
        </div>
      )}

      {me?.profile && (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Preferences</h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Version" value={me.profile.preferredVersion} icon={CodeBracketIcon} accent="blue" />
            <StatCard label="Language" value={me.profile.preferredLanguage.toUpperCase()} icon={BoltIcon} accent="violet" />
            <StatCard label="Auto Translation" value={me.profile.autoTranslation ? 'Enabled' : 'Disabled'} icon={CheckCircleIcon} accent="emerald" />
            <StatCard label="Profile Updated" value={formatIsoDate(me.profile.updatedAt)} icon={ArrowPathIcon} accent="amber" />
          </div>
        </div>
      )}

      {me?.recentTranslations.length ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Translations</h4>
          <div className="mt-4 space-y-3">
            {me.recentTranslations.slice(0, 5).map((entry) => (
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

      {me?.achievements.length ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Achievements</h4>
          <div className="mt-4 space-y-3">
            {me.achievements.map((award) => (
              <div key={`${award.achievement.code}-${award.awardedAt}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{award.achievement.title}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{award.achievement.description}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">+{award.achievement.xpReward} XP · Awarded {formatIsoDate(award.awardedAt)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <ConnectedAccountsCard
        providers={providers}
        isLoading={isLoading}
        error={linkError ?? providersError ?? authError}
        actionProvider={actionProvider}
        onRefresh={() => {
          void refreshProviders()
        }}
        onConnect={(providerName) => {
          void handleConnectProvider(providerName)
        }}
      />

      <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-8 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/30">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
          <CheckCircleIcon className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-center text-xl font-semibold text-slate-900 dark:text-slate-100">Researcher session active</h3>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-600 dark:text-slate-300">
          Your SIT identity is active. Profile details and account access controls are available below.
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

      {linkingProvider && linkCode && (
        <LinkProviderModal
          provider={linkingProvider}
          code={linkCode}
          expiresInSeconds={linkCodeTtlSeconds}
          isOpen={isLinkModalOpen}
          isExpired={isLinkExpired}
          onExpired={() => {
            setIsLinkExpired(true)
          }}
          onGenerateNewCode={() => {
            void handleConnectProvider(linkingProvider)
          }}
          onConfirmCompleted={() => {
            void refreshProvidersOnly()
          }}
          onClose={() => {
            setIsLinkModalOpen(false)
            setIsLinkExpired(false)
          }}
        />
      )}

      {successProvider && (
        <AccountLinkSuccessModal
          provider={successProvider}
          isOpen={Boolean(successProvider)}
          onClose={() => {
            setSuccessProvider(null)
          }}
        />
      )}
    </motion.div>
  )
}

function PrivateProfilePanel({ onLogout }: { onLogout: () => void }) {
  const { token } = useAuth()

  if (!token) return <LoginPrompt />

  return (
    <AccountProvider>
      <AuthenticatedDashboard onLogout={onLogout} />
    </AccountProvider>
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
  const { token, logout } = useAuth()

  const handleLogout = () => {
    logout()
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
              Look up any registered SIT researcher by ID, or access your private identity dashboard after authentication.
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
          {token ? <PrivateProfilePanel onLogout={handleLogout} /> : <LoginPrompt />}
        </motion.div>
      )}
    </div>
  )
}
