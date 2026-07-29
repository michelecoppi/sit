import { useCallback, useEffect, useRef, useState } from 'react'
import { getApiUrl } from '../services/apiClient'
import type { ActivityEvent } from '../services/researcherExperienceService'

const STORAGE_KEY = 'sit.activity.lastEventId'

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

  const connect = useCallback(() => {
    const cursor = savedCursor()
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
    const stream = new EventSource(`${getApiUrl()}/api/events/stream${query}`, {
      withCredentials: true,
    })

    stream.addEventListener('open', () => setState('open'))
    stream.addEventListener('error', () => setState('offline'))
    stream.addEventListener('activity', (message) => {
      try {
        const event = JSON.parse((message as MessageEvent<string>).data) as ActivityEvent
        if (!event.eventId || seen.current.has(event.eventId)) return
        seen.current.add(event.eventId)
        window.sessionStorage.setItem(STORAGE_KEY, event.eventId)
        onActivityRef.current(event)
      } catch {
        // Ignore malformed frames; the persisted cursor keeps recovery safe.
      }
    })

    return () => stream.close()
  }, [])

  useEffect(() => connect(), [connect])
  return state
}
