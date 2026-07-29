import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowPathIcon, ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { getPublicCapsule, verifyArtifact } from '../services/capsuleService'
import type { ArtifactVerification, PublicCapsule } from '../types/capsules'

function digest(value: string) {
  return value.slice(0, 16) + '…' + value.slice(-12)
}

export default function ArtifactVerifyPage() {
  const { publicId = '' } = useParams()
  const [artifact, setArtifact] = useState<PublicCapsule | null>(null)
  const [result, setResult] = useState<ArtifactVerification | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const resolved = await getPublicCapsule(publicId)
      const verified = await verifyArtifact(publicId)
      setArtifact(resolved)
      setResult(verified)
    } catch (cause) {
      setArtifact(null)
      setResult(null)
      setError(cause instanceof Error ? cause.message : 'Artifact verification is unavailable.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [publicId])

  if (loading) return <div className="route-loader" role="status"><span className="route-loader-mark" aria-hidden="true"><i>6</i><i>7</i></span><span><strong>Verifying artifact</strong><small>Comparing the public payload with SIT Core…</small></span></div>

  if (error || !artifact || !result) {
    return (
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-center sm:p-10 dark:border-amber-900 dark:bg-amber-950/30">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-amber-600" />
        <h1 className="mt-4 text-2xl font-semibold">Verification unavailable</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600 dark:text-slate-300">{error ?? 'The artifact is unavailable, revoked, expired or cannot be verified.'}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => void load()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-violet-600 px-5 font-semibold text-white"><ArrowPathIcon className="h-4 w-4" /> Try again</button>
          <Link to="/playground" className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 px-5 font-semibold dark:border-slate-700">Open playground</Link>
        </div>
      </section>
    )
  }

  const valid = result.status === 'valid'
  return (
    <main className="mx-auto max-w-3xl space-y-5">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className={valid ? 'rounded-2xl bg-emerald-100 p-4 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'rounded-2xl bg-rose-100 p-4 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'}>
            <ShieldCheckIcon className="h-10 w-10" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.24em] text-violet-600">SIT artifact verification</p>
            <h1 className="mt-2 break-words text-3xl font-semibold">{valid ? 'Artifact verified' : 'Artifact is not valid'}</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">{valid ? 'SIT Core confirmed that the current public payload matches its SHA-256 checksum.' : 'SIT Core did not confirm this artifact as valid. Do not rely on its contents.'}</p>
          </div>
        </div>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Artifact</dt><dd className="mt-1 break-all font-mono text-sm">{artifact.publicId}</dd></div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</dt><dd className="mt-1 font-semibold capitalize">{result.status}</dd></div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950 sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">SHA-256 digest</dt><dd className="mt-1 overflow-x-auto font-mono text-sm">{digest(result.integrity.digest)}</dd></div>
        </dl>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link to={'/capsule/' + encodeURIComponent(artifact.publicId)} className="inline-flex min-h-11 items-center justify-center rounded-full bg-violet-600 px-5 text-sm font-semibold text-white">Open artifact</Link>
          <button type="button" onClick={() => void load()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-300 px-5 text-sm font-semibold dark:border-slate-700"><ArrowPathIcon className="h-4 w-4" /> Verify again</button>
        </div>
      </section>
    </main>
  )
}
