import { ClipboardDocumentCheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { useEffect, useMemo, useState } from 'react'

function formatRemaining(seconds: number) {
  const mm = Math.floor(seconds / 60)
  const ss = seconds % 60
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

export default function LinkCodeBox({ code, expiresInSeconds, onExpired }: { code: string; expiresInSeconds: number; onExpired: () => void }) {
  const [remainingSeconds, setRemainingSeconds] = useState(expiresInSeconds)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setRemainingSeconds(expiresInSeconds)
  }, [expiresInSeconds])

  useEffect(() => {
    if (remainingSeconds <= 0) {
      onExpired()
      return
    }

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId)
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [onExpired, remainingSeconds])

  const codeDisabled = remainingSeconds <= 0
  const countdown = useMemo(() => formatRemaining(remainingSeconds), [remainingSeconds])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
      <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">Generated Code</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <code className={`rounded-xl border px-3 py-2 font-mono text-2xl tracking-wider ${codeDisabled ? 'border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500' : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300'}`}>
          {code}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          disabled={codeDisabled}
          aria-label="Copy link code"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {copied ? <ClipboardDocumentCheckIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        Expires in <span className="font-mono font-semibold">{countdown}</span>
      </p>
    </div>
  )
}
