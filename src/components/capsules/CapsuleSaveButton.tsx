import { useEffect, useRef, useState } from 'react'
import {
  ArchiveBoxArrowDownIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  LockClosedIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { createCapsule, getCapsuleShareUrl } from '../../services/capsuleService'
import { queueOfflineChange } from '../../services/offlineSyncService'
import type { CapsuleEdition, CapsuleVisibility } from '../../types/capsules'

const MAX_GUIDED_PAYLOAD_BYTES = 32 * 1024

type CapsuleSaveButtonProps = {
  edition: CapsuleEdition
  payload: string
  decodedPreview?: string
  suggestedTitle?: string
  className?: string
  authenticated?: boolean
}

function expirationFromPreset(preset: string) {
  if (preset === 'never') return null
  const hours = Number(preset)
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
}

export default function CapsuleSaveButton({
  edition,
  payload,
  decodedPreview,
  suggestedTitle = `SIT ${edition} capsule`,
  className = '',
  authenticated = false,
}: CapsuleSaveButtonProps) {
  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(suggestedTitle)
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<CapsuleVisibility>('unlisted')
  const [expiration, setExpiration] = useState('168')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const payloadBytes = new TextEncoder().encode(payload).length
  const payloadReady = payload.trim().length > 0 && payloadBytes <= MAX_GUIDED_PAYLOAD_BYTES

  useEffect(() => {
    if (!open) return
    titleInputRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) setOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open, saving])

  useEffect(() => {
    setTitle(suggestedTitle)
  }, [suggestedTitle])

  const start = () => {
    if (!authenticated) {
      window.location.hash = '#/profile'
      return
    }
    setError(null)
    setShareUrl(null)
    setCopied(false)
    setOpen(true)
  }

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const capsule = await createCapsule({
        edition,
        payload,
        title: title.trim(),
        description: description.trim() || null,
        visibility,
        expiresAt: expirationFromPreset(expiration),
      })
      await queueOfflineChange('capsule_draft', capsule.publicId || crypto.randomUUID(), { edition, payload, title: title.trim(), description: description.trim() || null, visibility })
      setShareUrl(capsule.publicId ? getCapsuleShareUrl(capsule.publicId) : null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save this capsule.')
    } finally {
      setSaving(false)
    }
  }

  const copyShareUrl = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
    } catch {
      setError('Clipboard access is blocked. Copy the URL manually.')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={start}
        disabled={!payloadReady}
        title={payloadBytes > MAX_GUIDED_PAYLOAD_BYTES ? 'Payload exceeds the 32 KB client-side guidance.' : undefined}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        {authenticated ? <ArchiveBoxArrowDownIcon className="h-4 w-4" /> : <LockClosedIcon className="h-4 w-4" />}
        Save as capsule
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={() => !saving && setOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="capsule-dialog-title"
            className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-[2rem] sm:p-7 dark:border-slate-700 dark:bg-slate-900"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.24em] text-violet-600">SIT Capsule Registry</p>
                <h2 id="capsule-dialog-title" className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  {shareUrl ? 'Capsule sealed' : 'Seal this result'}
                </h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} disabled={saving} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close capsule dialog">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {shareUrl ? (
              <div className="mt-6">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
                  <CheckCircleIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-300" />
                  <p className="mt-3 font-semibold text-emerald-900 dark:text-emerald-100">Stable public coordinate issued</p>
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">The backend remains authoritative for visibility, revocation and expiry.</p>
                </div>
                <label className="mt-5 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Share URL
                  <input readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-950" />
                </label>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={() => void copyShareUrl()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white">
                    <ClipboardDocumentIcon className="h-4 w-4" /> {copied ? 'Link copied' : 'Copy link'}
                  </button>
                  <button type="button" onClick={() => { window.location.hash = '#/capsules' }} className="min-h-11 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700">
                    Open capsule library
                  </button>
                </div>
              </div>
            ) : (
              <form className="mt-6 space-y-5" onSubmit={(event) => void save(event)}>
                <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4 dark:border-violet-900 dark:bg-violet-950/30">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <strong>SIT {edition}</strong>
                    <span>{payloadBytes.toLocaleString()} / {MAX_GUIDED_PAYLOAD_BYTES.toLocaleString()} bytes</span>
                  </div>
                  <pre className="mt-3 max-h-24 overflow-auto text-xs text-slate-600 dark:text-slate-300">{payload}</pre>
                  {decodedPreview ? <p className="mt-3 truncate text-sm text-slate-500 dark:text-slate-400">Preview: {decodedPreview}</p> : null}
                </div>

                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Title
                  <input ref={titleInputRef} required maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal dark:border-slate-700 dark:bg-slate-950" />
                </label>

                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Registry note <span className="font-normal text-slate-500">(optional)</span>
                  <textarea maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal dark:border-slate-700 dark:bg-slate-950" />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Visibility
                    <select value={visibility} onChange={(event) => setVisibility(event.target.value as CapsuleVisibility)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal dark:border-slate-700 dark:bg-slate-950">
                      <option value="private">Private — only you</option>
                      <option value="unlisted">Unlisted — anyone with link</option>
                      <option value="public">Public — registry visible</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Automatic expiry
                    <select value={expiration} onChange={(event) => setExpiration(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal dark:border-slate-700 dark:bg-slate-950">
                      <option value="24">After 24 hours</option>
                      <option value="168">After 7 days</option>
                      <option value="720">After 30 days</option>
                      <option value="never">Never</option>
                    </select>
                  </label>
                </div>

                {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p> : null}

                <div className="flex flex-wrap justify-end gap-3">
                  <button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700">Cancel</button>
                  <button type="submit" disabled={saving || !title.trim()} className="min-h-11 rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
                    {saving ? 'Sealing capsule…' : 'Seal and issue URL'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      ) : null}
    </>
  )
}

