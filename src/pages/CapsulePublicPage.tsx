import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowDownTrayIcon,
  BeakerIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  ShareIcon,
} from '@heroicons/react/24/outline'
import { nativeDecode } from '../data/native'
import { getPublicCapsule } from '../services/capsuleService'
import type { PublicCapsule } from '../types/capsules'
import { decodeSitToText } from '../utils/decoder'

export default function CapsulePublicPage() {
  const { publicId = '' } = useParams()
  const navigate = useNavigate()
  const [capsule, setCapsule] = useState<PublicCapsule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offline, setOffline] = useState(!navigator.onLine)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setCapsule(null)
    setError(null)
    void getPublicCapsule(publicId)
      .then((result) => {
        if (!active) return
        setCapsule(result)
        document.title = `${result.title} | SIT Capsule`
        const description = document.querySelector('meta[name="description"]')
        description?.setAttribute('content', result.description ?? `A shared SIT ${result.edition} capsule.`)
      })
      .catch((cause) => {
        if (active) setError(offline ? 'You appear to be offline. Reconnect to resolve this capsule.' : cause instanceof Error ? cause.message : 'This capsule is unavailable.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [offline, publicId])

  const preview = useMemo(() => {
    if (!capsule) return ''
    try {
      return capsule.edition === '2.0' ? nativeDecode(capsule.payload) : decodeSitToText(capsule.payload)
    } catch {
      return ''
    }
  }, [capsule])

  const copy = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setFeedback(message)
    } catch {
      setFeedback('Clipboard access is blocked. Select the payload manually.')
    }
  }

  const openInPlayground = () => {
    if (!capsule) return
    sessionStorage.setItem('sit-capsule-playground-draft', JSON.stringify({
      edition: capsule.edition,
      payload: capsule.payload,
    }))
    navigate(`/playground?edition=${encodeURIComponent(capsule.edition)}`)
  }

  const download = () => {
    if (!capsule) return
    const url = URL.createObjectURL(new Blob([capsule.payload], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${capsule.publicId ?? 'sit-capsule'}.sit`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="route-loader" role="status"><span className="route-loader-mark" aria-hidden="true"><i>6</i><i>7</i></span><span><strong>Resolving capsule</strong><small>Checking visibility and expiry with SIT Core…</small></span></div>

  if (!capsule || error) {
    return (
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-amber-500" />
        <p className="mt-5 text-xs font-semibold uppercase tracking-[.24em] text-amber-600">Coordinate unavailable</p>
        <h1 className="mt-2 text-3xl font-semibold">This capsule cannot be opened</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-300">{error ?? 'It may be private, expired, revoked, malformed or unknown. No cached capsule content is displayed.'}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-full bg-violet-600 px-5 font-semibold text-white">Try again</button>
          <Link to="/playground" className="inline-flex min-h-11 items-center rounded-full border border-slate-300 px-5 font-semibold dark:border-slate-700">Open playground</Link>
        </div>
      </section>
    )
  }

  return (
    <article className="mx-auto max-w-5xl space-y-6">
      {offline ? <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">You are offline. This already-resolved view remains visible, but visibility changes cannot be revalidated.</p> : null}
      <header className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-950 p-7 text-white shadow-xl sm:p-10">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">SIT {capsule.edition}</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold capitalize">{capsule.visibility}</span>
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-semibold sm:text-5xl">{capsule.title}</h1>
          {capsule.description ? <p className="mt-4 max-w-2xl text-violet-100/80">{capsule.description}</p> : null}
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-violet-200">
            {capsule.owner ? <span>Issued by {capsule.owner.displayName} · {capsule.owner.researcherId}</span> : null}
            <span>Created {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(capsule.createdAt))}</span>
            <span>{capsule.expiresAt ? `Expires ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(capsule.expiresAt))}` : 'No automatic expiry'}</span>
          </div>
        </div>
      </header>

      {feedback ? <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">{feedback}</p> : null}

      <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-600">Authoritative payload</p><h2 className="mt-1 text-xl font-semibold">Symbolic content</h2></div><button type="button" onClick={() => void copy(capsule.payload, 'Payload copied.')} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-300 px-3 text-xs font-semibold dark:border-slate-700"><ClipboardDocumentIcon className="h-4 w-4" /> Copy</button></div>
          <pre className="mt-4 max-h-[28rem] overflow-auto rounded-2xl bg-slate-950 p-5 font-mono text-sm leading-6 text-slate-100">{capsule.payload}</pre>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-emerald-600">Local semantic preview</p>
          <h2 className="mt-1 text-xl font-semibold">Decoded interpretation</h2>
          <div className="mt-4 min-h-40 rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700 dark:bg-slate-950/70 dark:text-slate-200">{preview || 'No local preview is available for this payload.'}</div>
          <p className="mt-3 text-xs text-slate-500">Preview is derived locally for convenience; the stored payload remains the canonical artifact.</p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <button type="button" onClick={openInPlayground} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-violet-600 px-4 text-sm font-semibold text-white"><BeakerIcon className="h-4 w-4" /> Open in SIT {capsule.edition} playground</button>
        <button type="button" onClick={download} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 px-4 text-sm font-semibold dark:border-slate-700"><ArrowDownTrayIcon className="h-4 w-4" /> Download .sit</button>
        <button type="button" onClick={() => void copy(window.location.href, 'Share URL copied.')} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 px-4 text-sm font-semibold dark:border-slate-700"><ShareIcon className="h-4 w-4" /> Copy share URL</button>
      </div>
    </article>
  )
}
