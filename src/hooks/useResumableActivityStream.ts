Exit code: 0
Wall time: 0.3 seconds
Output:
import { useEffect, useRef, useState } from 'react'
import { getApiUrl } from '../services/apiClient'
import type { ActivityEvent } from '../services/researcherExperienceService'

const STORAGE_KEY = 'sit.activity.lastEventId'
const MAX_SEEN_EVENTS = 500

type StreamState = 'connecting' | 'open' | 'offline'

function savedCursor() {
  return window.sessionStorage.getItem(STORAGE_KEY) ?? undefined
}

/**
 * Authenticated resumable SSE stream. It persists the last accepted event id,
 * deduplicating at-least-once delivery after a reconnect or a tab reload.
 */
export function useResumableActivityStream(onActivity: (event: ActivityEvent) => void) {
  const onActivityRef = useRef(onActivity)
  const seen = useRef(new Set<string>())
  const [state, setState] = useState<StreamState>('connecting')

  useEffect(() => {
    onActivityRef.current = onActivity
  }, [onActivity])

  useEffect(() => {
    let stream: EventSource | undefined
    let retryTimer: number | undefined
    let stopped = false
    let attempts = 0

    const clearStream = () => {
      stream?.close()
      stream = undefined
    }

    const scheduleReconnect = () => {
      if (stopped || retryTimer) return
      setState('offline')
      const delay = Math.min(30_000, 1_000 * 2 ** attempts++)
      retryTimer = window.setTimeout(() => {
        retryTimer = undefined
        connect()
      }, delay)
    }

    const connect = () => {
      if (stopped || document.visibilityState === 'hidden') return
      clearStream()
      setState('connecting')
      try {
        const cursor = savedCursor()
        const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
        stream = new EventSource(`${getApiUrl()}/api/events/stream${query}`, { withCredentials: true })
        stream.addEventListener('open', () => {
          attempts = 0
          setState('open')
        })
        stream.addEventListener('error', () => {
          clearStream()
          scheduleReconnect()
        })
        stream.addEventListener('activity', (message) => {
          try {
            const event = JSON.parse((message as MessageEvent<string>).data) as ActivityEvent
            if (!event.eventId || seen.current.has(event.eventId)) return
            seen.current.add(event.eventId)
            if (seen.current.size > MAX_SEEN_EVENTS) seen.current.delete(seen.current.values().next().value as string)
            window.sessionStorage.setItem(STORAGE_KEY, event.eventId)
            onActivityRef.current(event)
          } catch {
            // Ignore malformed frames; the persisted cursor keeps recovery safe.
          }
        })
      } catch {
        scheduleReconnect()
      }
    }

    const reconnectWhenVisible = () => {
      if (document.visibilityState === 'visible' && !stream) connect()
    }
    window.addEventListener('online', reconnectWhenVisible)
    document.addEventListener('visibilitychange', reconnectWhenVisible)
    connect()
    return () => {
      stopped = true
      if (retryTimer) window.clearTimeout(retryTimer)
      clearStream()
      window.removeEventListener('online', reconnectWhenVisible)
      document.removeEventListener('visibilitychange', reconnectWhenVisible)
    }
  }, [])
  return state
}

