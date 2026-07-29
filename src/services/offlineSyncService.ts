import { getApiHeaders, getApiUrl, parseResponsePayload, throwApiError } from './apiClient'

export type OfflineResource = 'playground_run' | 'capsule_draft' | 'mission_progress' | 'preference' | 'bookmark'
export type OfflineOperation = { operationId: string, resourceType: OfflineResource, resourceId: string, baseRevision: number | null, payload: unknown, deleted?: boolean, attempts: number, nextAttemptAt: number }
export type SyncResult = { operationId: string, status: 'accepted' | 'merged' | 'conflict' | 'rejected', revision?: number, remoteRevision?: number }

const DB_NAME = 'sit-offline-sync'
const STORE = 'operations'
const TAB_CHANNEL = 'sit-offline-sync-v1'
const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(TAB_CHANNEL)

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'operationId' }) }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function all(): Promise<OfflineOperation[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => { const request = db.transaction(STORE, 'readonly').objectStore(STORE).getAll(); request.onsuccess = () => resolve(request.result as OfflineOperation[]); request.onerror = () => reject(request.error) })
}

async function put(item: OfflineOperation) {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => { const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(item); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error) })
}

async function remove(operationId: string) {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => { const request = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(operationId); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error) })
}

export async function queueOfflineChange(resourceType: OfflineResource, resourceId: string, payload: unknown, baseRevision: number | null = 0, deleted = false) {
  const operation: OfflineOperation = { operationId: crypto.randomUUID().replace(/-/g, ''), resourceType, resourceId, baseRevision, payload, deleted, attempts: 0, nextAttemptAt: Date.now() }
  await put(operation)
  channel?.postMessage({ type: 'changed' })
  return operation
}

export const listOfflineChanges = all

export async function syncOfflineChanges(): Promise<SyncResult[]> {
  const due = (await all()).filter(item => item.nextAttemptAt <= Date.now()).slice(0, 25)
  if (!due.length || !navigator.onLine) return []
  try {
    const response = await fetch(`${getApiUrl()}/api/sync/push`, { method: 'POST', credentials: 'include', headers: { ...getApiHeaders(), 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID().replace(/-/g, '') }, body: JSON.stringify({ version: 1, operations: due }) })
    const payload = await parseResponsePayload(response)
    if (!response.ok) throwApiError(response.status, payload, 'Unable to synchronize offline work.', false)
    const results = (payload as { results?: SyncResult[] }).results ?? []
    for (const operation of due) {
      const result = results.find(candidate => candidate.operationId === operation.operationId)
      if (result && result.status !== 'conflict') await remove(operation.operationId)
    }
    channel?.postMessage({ type: 'changed' })
    return results
  } catch (error) {
    await Promise.all(due.map(async operation => put({ ...operation, attempts: operation.attempts + 1, nextAttemptAt: Date.now() + Math.min(60_000, 1000 * 2 ** operation.attempts) })))
    throw error
  }
}

export async function resolveConflict(operationId: string, choice: 'local' | 'remote') {
  if (choice === 'remote') return remove(operationId)
  const operations = await all(); const operation = operations.find(item => item.operationId === operationId)
  if (operation) await put({ ...operation, operationId: crypto.randomUUID().replace(/-/g, ''), baseRevision: null, nextAttemptAt: Date.now() })
}

