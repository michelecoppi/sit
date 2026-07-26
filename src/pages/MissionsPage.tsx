import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowPathIcon,
  BoltIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  FireIcon,
  SparklesIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { getMissionDashboard, getMissionHistory } from '../services/missionService'
import type { Mission, MissionDashboard, MissionRotationWindow } from '../types/missions'

function formatReset(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(new Date(iso))
}

const metricLabels: Record<string, string> = {
  messages_encoded: 'Encoding',
  messages_decoded: 'Recovery',
  syte_processed: 'Throughput',
}

function formatTimeRemaining(resetsAt: string, serverTime: string) {
  const remaining = Math.max(0, Date.parse(resetsAt) - Date.parse(serverTime))
  const totalMinutes = Math.ceil(remaining / 60_000)
  const days = Math.floor(totalMinutes / 1_440)
  const hours = Math.floor((totalMinutes % 1_440) / 60)
  const minutes = totalMinutes % 60
  return [
    days ? `${days}d` : '',
    hours ? `${hours}h` : '',
    !days && minutes ? `${minutes}m` : '',
  ].filter(Boolean).join(' ') || 'now'
}

function RotationCard({ cadence, rotation, serverTime }: {
  cadence: 'daily' | 'weekly'
  rotation: MissionRotationWindow
  serverTime: string
}) {
  const daily = cadence === 'daily'
  return (
    <article className={`rounded-[1.5rem] border p-5 ${daily ? 'border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/20' : 'border-violet-200 bg-violet-50/70 dark:border-violet-900 dark:bg-violet-950/20'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-xs font-bold uppercase tracking-[.22em] ${daily ? 'text-blue-700 dark:text-blue-300' : 'text-violet-700 dark:text-violet-300'}`}>{daily ? 'Daily field brief' : 'Weekly programme'}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{rotation.missionCount} rotating directives</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${daily ? 'bg-blue-600 text-white' : 'bg-violet-600 text-white'}`}>
          {daily ? <BoltIcon className="h-6 w-6" /> : <CalendarDaysIcon className="h-6 w-6" />}
        </span>
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <ArrowPathIcon className="h-4 w-4" />
        New selection in {formatTimeRemaining(rotation.resetsAt, serverTime)}
        <span className="text-slate-400">·</span>
        {formatReset(rotation.resetsAt)}
      </p>
    </article>
  )
}

function MissionCard({ mission }: { mission: Mission }) {
  const percentage = Math.min(100, Math.round((mission.progress / mission.target) * 100))
  const complete = mission.state === 'completed'

  return (
    <article className={`relative overflow-hidden rounded-[1.5rem] border p-5 shadow-sm ${complete ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">{metricLabels[mission.metric] ?? mission.metric} · {mission.cadence}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
              <SparklesIcon className="h-3.5 w-3.5" /> +{mission.xpReward} XP
            </span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">{mission.title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{mission.description}</p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${complete ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300'}`}>
          {complete ? <CheckCircleIcon className="h-6 w-6" /> : <BoltIcon className="h-6 w-6" />}
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-end justify-between gap-4">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {complete ? 'Mission complete' : `${mission.remaining.toLocaleString()} remaining`}
          </p>
          <p className="font-mono text-sm text-slate-500 dark:text-slate-400">{mission.progress.toLocaleString()} / {mission.target.toLocaleString()}</p>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-label={`${mission.title} progress`} aria-valuemin={0} aria-valuemax={mission.target} aria-valuenow={Math.min(mission.progress, mission.target)}>
          <div className={`h-full rounded-full transition-[width] motion-reduce:transition-none ${complete ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-violet-500'}`} style={{ width: `${percentage}%` }} />
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <ClockIcon className="h-4 w-4" />
          {complete && mission.completedAt ? `Completed ${formatReset(mission.completedAt)}` : `Resets ${formatReset(mission.resetsAt)}`}
        </div>
      </div>
    </article>
  )
}

export default function MissionsPage() {
  const { status } = useAuth()
  const [dashboard, setDashboard] = useState<MissionDashboard | null>(null)
  const [history, setHistory] = useState<Mission[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    if (status !== 'authenticated') return
    setLoading(true)
    setError(null)
    try {
      setDashboard(await getMissionDashboard())
    } catch (cause) {
      setDashboard(null)
      setError(cause instanceof Error ? cause.message : 'Mission progress is currently unavailable.')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  const loadHistory = async () => {
    setHistoryLoading(true)
    try {
      const page = await getMissionHistory(nextCursor ?? undefined)
      setHistory((current) => [...current, ...page.items])
      setNextCursor(page.nextCursor)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Mission history is currently unavailable.')
    } finally {
      setHistoryLoading(false)
    }
  }

  const grouped = useMemo(() => ({
    daily: dashboard?.missions.filter((mission) => mission.cadence === 'daily') ?? [],
    weekly: dashboard?.missions.filter((mission) => mission.cadence === 'weekly') ?? [],
  }), [dashboard])

  if (status === 'loading') {
    return <div className="route-loader" role="status"><span className="route-loader-mark" aria-hidden="true"><i>6</i><i>7</i></span><span><strong>Loading mission control</strong><small>Resolving researcher session…</small></span></div>
  }

  if (status === 'anonymous') {
    return (
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300"><TrophyIcon className="h-8 w-8" /></span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[.24em] text-blue-600">Research Mission Control</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Your field board is identity-bound</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-300">Sign in to see progress unified across the website, Discord and Telegram. Encoding and decoding remain public.</p>
        <Link to="/profile" className="mt-7 inline-flex min-h-11 items-center rounded-full bg-blue-600 px-5 py-2.5 font-semibold text-white">Open researcher sign-in</Link>
      </section>
    )
  }

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 p-6 text-white shadow-xl sm:p-9 dark:border-slate-700">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.25em] text-blue-200"><TrophyIcon className="h-4 w-4" /> Research Mission Control</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Make today count.</h1>
            <p className="mt-3 max-w-2xl text-blue-100/80">A live field board for deliberate protocol work. SIT Core records progress; this console only reports it.</p>
          </div>
          <button type="button" onClick={() => void loadDashboard()} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/15 disabled:opacity-50">
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`} /> Refresh field data
          </button>
        </div>

        {dashboard ? (
          <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-widest text-blue-200">Current streak</p>
              <p className="mt-2 flex items-center gap-2 text-3xl font-semibold"><FireIcon className="h-7 w-7 text-orange-300" /> {dashboard.streak.current} days</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-widest text-blue-200">Personal best</p>
              <p className="mt-2 text-3xl font-semibold">{dashboard.streak.best} days</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-widest text-blue-200">Active directives</p>
              <p className="mt-2 text-3xl font-semibold">{dashboard.missions.length}</p>
            </div>
          </div>
        ) : null}
      </section>

      {dashboard?.rotation ? (
        <section className="grid gap-4 lg:grid-cols-2" aria-label="Mission rotation schedule">
          <RotationCard cadence="daily" rotation={dashboard.rotation.daily} serverTime={dashboard.serverTime} />
          <RotationCard cadence="weekly" rotation={dashboard.rotation.weekly} serverTime={dashboard.serverTime} />
        </section>
      ) : null}

      {error ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          <span>{error}</span>
          <button type="button" onClick={() => void loadDashboard()} className="font-semibold underline">Try again</button>
        </div>
      ) : null}

      {loading && !dashboard ? <div className="grid gap-4 lg:grid-cols-2" aria-label="Loading active missions">{[0, 1, 2, 3].map((item) => <div key={item} className="h-56 animate-pulse rounded-[1.5rem] bg-slate-200 motion-reduce:animate-none dark:bg-slate-800" />)}</div> : null}

      {dashboard && dashboard.missions.length === 0 ? (
        <section className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-9 text-center dark:border-slate-700 dark:bg-slate-900">
          <CheckCircleIcon className="mx-auto h-10 w-10 text-emerald-500" />
          <h2 className="mt-3 text-xl font-semibold">Field board clear</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No active missions were issued for this UTC window.</p>
        </section>
      ) : null}

      {(['daily', 'weekly'] as const).map((cadence) => grouped[cadence].length ? (
        <section key={cadence}>
          <div className="mb-4 flex items-center gap-2">
            {cadence === 'daily' ? <BoltIcon className="h-5 w-5 text-blue-600" /> : <CalendarDaysIcon className="h-5 w-5 text-violet-600" />}
            <h2 className="text-xl font-semibold capitalize">{cadence} directives</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">{grouped[cadence].map((mission) => <MissionCard key={mission.code} mission={mission} />)}</div>
        </section>
      ) : null)}

      {dashboard ? (
        <details className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
            <span className="flex items-center gap-2"><FireIcon className="h-5 w-5 text-orange-500" /> How streak qualification works</span>
            <ChevronDownIcon className="h-5 w-5 transition group-open:rotate-180 motion-reduce:transition-none" />
          </summary>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{dashboard.streak.rules}</p>
          <p className="mt-2 text-xs text-slate-500">All qualification dates and resets use {dashboard.streak.timezone}. Last qualified: {dashboard.streak.lastQualifiedDate ? formatReset(dashboard.streak.lastQualifiedDate) : 'not yet'}.</p>
        </details>
      ) : null}

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Completed field log</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Cursor-paginated records issued by SIT Core.</p>
          </div>
          {history.length === 0 ? <button type="button" onClick={() => void loadHistory()} disabled={historyLoading} className="min-h-11 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700">{historyLoading ? 'Loading…' : 'Load field log'}</button> : null}
        </div>
        {history.length ? (
          <div className="mt-5 space-y-3">
            {history.map((mission) => (
              <div key={`${mission.code}-${mission.completedAt}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                <div><strong>{mission.title}</strong><p className="mt-1 text-xs text-slate-500">{mission.completedAt ? formatReset(mission.completedAt) : 'Completed'}</p></div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">+{mission.xpReward} XP</span>
              </div>
            ))}
            {nextCursor ? <button type="button" onClick={() => void loadHistory()} disabled={historyLoading} className="mt-3 min-h-11 w-full rounded-full border border-slate-300 text-sm font-semibold dark:border-slate-700">{historyLoading ? 'Loading…' : 'Load older completions'}</button> : null}
          </div>
        ) : null}
      </section>
    </div>
  )
}
