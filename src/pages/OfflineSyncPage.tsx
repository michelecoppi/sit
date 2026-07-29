import { useEffect, useState } from 'react'
import { ArrowPathIcon, CloudArrowUpIcon, ExclamationTriangleIcon, WifiIcon } from '@heroicons/react/24/outline'
import { getApiHeaders, getApiUrl, parseResponsePayload, throwApiError } from '../services/apiClient'

type SyncResult = { operationId: string, status: 'accepted' | 'merged' | 'conflict' | 'rejected', revision?: number, remoteRevision?: number }
type QueueItem = { operationId: string, resourceType: 'preference', resourceId: string, baseRevision: number | null, payload: { updatedAt: string } }

const storageKey = 'sit-offline-sync-demo-v1'

function readQueue(): QueueItem[] {
  try { return JSON.parse(localStorage.getItem(storageKey) ?? '[]') as QueueItem[] } catch { return [] }
}

export default function OfflineSyncPage() {
  const [queue, setQueue] = useState<QueueItem[]>(readQueue)
  const [online, setOnline] = useState(navigator.onLine)
  const [state, setState] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle')
  const [results, setResults] = useState<SyncResult[]>([])
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const refresh = () => setOnline(navigator.onLine)
    window.addEventListener('online', refresh); window.addEventListener('offline', refresh)
    return () => { window.removeEventListener('online', refresh); window.removeEventListener('offline', refresh) }
  }, [])

  const stagePreference = () => {
    const item: QueueItem = {
      operationId: crypto.randomUUID().replace(/-/g, ''),
      resourceType: 'preference',
      resourceId: 'offline-sync-demo',
      baseRevision: queue.at(-1)?.baseRevision ?? 0,
      payload: { updatedAt: new Date().toISOString() },
    }
    const next = [...queue, item]
    localStorage.setItem(storageKey, JSON.stringify(next))
    setQueue(next)
    setMessage('A local preference update is queued. It will remain here until a successful sync.')
  }

  const sync = async () => {
    if (!queue.length || !online) return
    setState('syncing'); setMessage(null)
    try {
      const response = await fetch(getApiUrl() + '/api/sync/push', {
        method: 'POST',
        headers: { ...getApiHeaders(), 'Idempotency-Key': crypto.randomUUID().replace(/-/g, '') },
        credentials: 'include',
        body: JSON.stringify({ version: 1, operations: queue }),
      })
      const payload = await parseResponsePayload(response)
      if (!response.ok) throwApiError(response.status, payload, 'Unable to synchronize offline work.')
      const nextResults = (payload as { results?: SyncResult[] }).results ?? []
      setResults(nextResults)
      const unresolved = queue.filter((entry) => nextResults.some((result) => result.operationId === entry.operationId && result.status === 'conflict'))
      localStorage.setItem(storageKey, JSON.stringify(unresolved))
      setQueue(unresolved)
      setState('done')
      setMessage(unresolved.length ? 'A conflict needs an explicit choice; the affected local item remains queued.' : 'All queued changes were synchronized.')
    } catch (cause) {
      setState('error')
      setMessage(cause instanceof Error ? cause.message : 'Unable to synchronize offline work.')
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-5">
      <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-cyan-50 to-violet-50 p-6 shadow-sm sm:p-10 dark:border-slate-800 dark:from-slate-900 dark:via-cyan-950/30 dark:to-slate-950">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[.24em] text-cyan-700 dark:text-cyan-300">Offline workspace</p><h1 className="mt-2 text-3xl font-semibold sm:text-5xl">Your work waits safely.</h1><p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">Queue small researcher updates locally, then send them through the versioned SIT Core sync protocol.</p></div>
          <span className={online ? 'inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200' : 'inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200'}><WifiIcon className="h-4 w-4" />{online ? 'Online' : 'Offline'}</span>
        </div>
      </section>
      {message ? <p role={state === 'error' ? 'alert' : 'status'} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">{message}</p> : null}
      <section className="grid gap-5 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-600">Local queue</p><p className="mt-3 text-4xl font-semibold">{queue.length}</p><p className="mt-1 text-sm text-slate-500">Pending operation{queue.length === 1 ? '' : 's'}</p><button type="button" onClick={stagePreference} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-slate-300 px-4 text-sm font-semibold dark:border-slate-700">Queue a local update</button></div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-600">Sync control</p><p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Sync only removes accepted or merged changes. Conflicts stay visible until the user resolves them.</p><button type="button" disabled={!online || !queue.length || state === 'syncing'} onClick={() => void sync()} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-violet-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><CloudArrowUpIcon className="h-4 w-4" />{state === 'syncing' ? 'Synchronizing…' : 'Synchronize now'}</button></div>
      </section>
      {results.length ? <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h2 className="text-xl font-semibold">Latest result</h2><div className="mt-4 space-y-3">{results.map((result) => <div key={result.operationId} className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4 text-sm sm:flex-row sm:items-center sm:justify-between dark:bg-slate-950"><code className="overflow-x-auto">{result.operationId}</code><span className={result.status === 'conflict' ? 'font-semibold text-amber-700 dark:text-amber-300' : 'font-semibold text-emerald-700 dark:text-emerald-300'}>{result.status === 'conflict' ? <><ExclamationTriangleIcon className="mr-1 inline h-4 w-4" />Conflict: choose explicitly</> : result.status}</span></div>)}</div></section> : null}
      <button type="button" onClick={() => void sync()} disabled={!online || !queue.length} className="sr-only"><ArrowPathIcon /></button>
    </main>
  )
}
