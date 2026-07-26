import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  BeakerIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  LockClosedIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { getCapsuleShareUrl, listCapsules, revokeCapsule, updateCapsule } from '../services/capsuleService'
import type { Capsule, CapsuleVisibility } from '../types/capsules'

function formatDate(value: string | null) {
  if (!value) return 'No expiry'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function visibilityIcon(visibility: CapsuleVisibility) {
  return visibility === 'private' ? LockClosedIcon : EyeIcon
}

export default function CapsuleLibraryPage() {
  const { status } = useAuth()
  const [capsules, setCapsules] = useState<Capsule[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Capsule | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editVisibility, setEditVisibility] = useState<CapsuleVisibility>('unlisted')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const load = useCallback(async (cursor?: string) => {
    if (status !== 'authenticated') return
    setLoading(true)
    setError(null)
    try {
      const page = await listCapsules(cursor)
      setCapsules((current) => cursor ? [...current, ...page.items] : page.items)
      setNextCursor(page.nextCursor)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load your capsules.')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    void load()
  }, [load])

  const openEdit = (capsule: Capsule) => {
    setEditing(capsule)
    setEditTitle(capsule.title)
    setEditDescription(capsule.description ?? '')
    setEditVisibility(capsule.visibility)
  }

  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editing) return
    setBusyId(editing.id)
    try {
      const updated = await updateCapsule(editing.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        visibility: editVisibility,
      })
      setCapsules((current) => current.map((item) => item.id === updated.id ? updated : item))
      setEditing(null)
      setFeedback('Capsule metadata updated.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update this capsule.')
    } finally {
      setBusyId(null)
    }
  }

  const revoke = async (capsule: Capsule) => {
    if (!window.confirm(`Revoke “${capsule.title}”? Existing links will stop resolving.`)) return
    setBusyId(capsule.id)
    try {
      await revokeCapsule(capsule.id)
      setCapsules((current) => current.filter((item) => item.id !== capsule.id))
      setFeedback('Capsule revoked. Public content was removed from this view.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to revoke this capsule.')
    } finally {
      setBusyId(null)
    }
  }

  const copyLink = async (capsule: Capsule) => {
    if (!capsule.publicId) return
    try {
      await navigator.clipboard.writeText(getCapsuleShareUrl(capsule.publicId))
      setFeedback(`Share link copied for “${capsule.title}”.`)
    } catch {
      setError('Clipboard access is blocked.')
    }
  }

  if (status === 'loading') return <div className="route-loader" role="status"><span className="route-loader-mark" aria-hidden="true"><i>6</i><i>7</i></span><span><strong>Opening capsule vault</strong><small>Resolving researcher session…</small></span></div>

  if (status === 'anonymous') {
    return (
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <LockClosedIcon className="mx-auto h-12 w-12 text-violet-600" />
        <h1 className="mt-5 text-3xl font-semibold">The capsule vault requires a researcher session</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">Public capsules remain readable without authentication. Sign in only to create and manage your own.</p>
        <Link to="/profile" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-violet-600 px-5 py-2.5 font-semibold text-white">Sign in to the vault</Link>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-violet-50 to-indigo-50 p-7 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-violet-950/30 dark:to-slate-950 sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.24em] text-violet-600"><ArchiveBoxIcon className="h-4 w-4" /> Capsule Registry</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">Portable protocol artifacts.</h1>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">Manage stable SIT coordinates, privacy boundaries and expiry without duplicating playground work.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900">
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`} /> Refresh
            </button>
            <Link to="/playground" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white"><BeakerIcon className="h-4 w-4" /> Create in playground</Link>
          </div>
        </div>
      </section>

      {feedback ? <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">{feedback}</p> : null}
      {error ? <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p> : null}

      {!loading && capsules.length === 0 && !error ? (
        <section className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <ArchiveBoxIcon className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 text-xl font-semibold">No sealed artifacts yet</h2>
          <p className="mt-2 text-sm text-slate-500">Create a result in either playground edition, then choose “Save as capsule”.</p>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {capsules.map((capsule) => {
          const VisibilityIcon = visibilityIcon(capsule.visibility)
          return (
            <article key={capsule.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">SIT {capsule.edition}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300"><VisibilityIcon className="h-3.5 w-3.5" /> {capsule.visibility}</span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold">{capsule.title}</h2>
                  {capsule.description ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{capsule.description}</p> : null}
                </div>
                <ArchiveBoxIcon className="h-7 w-7 shrink-0 text-violet-500" />
              </div>
              <pre className="mt-4 max-h-24 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">{capsule.payload}</pre>
              <p className="mt-3 text-xs text-slate-500">Expires: {formatDate(capsule.expiresAt)}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {capsule.publicId && capsule.visibility !== 'private' ? (
                  <>
                    <Link to={`/capsule/${encodeURIComponent(capsule.publicId)}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-violet-600 px-3 py-2 text-xs font-semibold text-white"><EyeIcon className="h-4 w-4" /> Open</Link>
                    <button type="button" onClick={() => void copyLink(capsule)} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700"><ClipboardDocumentIcon className="h-4 w-4" /> Copy link</button>
                  </>
                ) : null}
                <button type="button" onClick={() => openEdit(capsule)} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700"><PencilSquareIcon className="h-4 w-4" /> Edit</button>
                <button type="button" onClick={() => void revoke(capsule)} disabled={busyId === capsule.id} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 disabled:opacity-50 dark:border-rose-900 dark:text-rose-300"><TrashIcon className="h-4 w-4" /> Revoke</button>
              </div>
            </article>
          )
        })}
      </div>
      {nextCursor ? <button type="button" onClick={() => void load(nextCursor)} disabled={loading} className="min-h-11 w-full rounded-full border border-slate-300 text-sm font-semibold dark:border-slate-700">{loading ? 'Loading…' : 'Load more capsules'}</button> : null}

      {editing ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/65 p-0 sm:items-center sm:p-6" onMouseDown={() => setEditing(null)}>
          <form onSubmit={(event) => void saveEdit(event)} onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem] dark:bg-slate-900">
            <h2 className="text-2xl font-semibold">Edit capsule metadata</h2>
            <label className="mt-5 block text-sm font-semibold">Title<input required maxLength={120} value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal dark:border-slate-700 dark:bg-slate-950" /></label>
            <label className="mt-4 block text-sm font-semibold">Registry note<textarea maxLength={500} value={editDescription} onChange={(event) => setEditDescription(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal dark:border-slate-700 dark:bg-slate-950" /></label>
            <label className="mt-4 block text-sm font-semibold">Visibility<select value={editVisibility} onChange={(event) => setEditVisibility(event.target.value as CapsuleVisibility)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal dark:border-slate-700 dark:bg-slate-950"><option value="private">Private</option><option value="unlisted">Unlisted</option><option value="public">Public</option></select></label>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setEditing(null)} className="min-h-11 rounded-full border border-slate-300 px-4 dark:border-slate-700">Cancel</button><button type="submit" disabled={busyId === editing.id || !editTitle.trim()} className="min-h-11 rounded-full bg-violet-600 px-5 font-semibold text-white disabled:opacity-50">Save changes</button></div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
