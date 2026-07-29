import type {
  ArtifactIntegrity,
  ArtifactVerification,
  Capsule,
  CapsuleEdition,
  CapsulePage,
  PublicCapsule,
  CapsuleVisibility,
  CreateCapsuleInput,
  UpdateCapsuleInput,
} from '../types/capsules'
import { getApiHeaders, getApiUrl, parseResponsePayload, throwApiError } from './apiClient'

const EDITIONS = new Set(['1.0', '2.0'])
const VISIBILITIES = new Set(['private', 'unlisted', 'public'])

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function parseIntegrity(value: unknown): ArtifactIntegrity | undefined {
  if (value === undefined) return undefined
  if (!isObject(value) || value.algorithm !== 'sha256' || !isText(value.digest) || typeof value.verified !== 'boolean') {
    throw new Error('Invalid artifact integrity payload.')
  }
  return { algorithm: 'sha256', digest: value.digest, verified: value.verified }
}

function parseOwner(value: unknown) {
  if (value === null) return null
  if (!isObject(value) || !isText(value.researcherId) || !isText(value.displayName)) {
    throw new Error('Invalid capsule payload.')
  }
  return { researcherId: value.researcherId, displayName: value.displayName }
}

export function parseCapsule(payload: unknown): Capsule {
  if (!isObject(payload)) throw new Error('Invalid capsule payload.')

  const { id, publicId, edition, title, description, visibility, expiresAt, createdAt, updatedAt, revokedAt, owner } = payload
  if (!isText(id) || (publicId !== null && !isText(publicId)) || typeof edition !== 'string' || !EDITIONS.has(edition)
    || !isText(payload.payload) || !isText(title) || (description !== null && typeof description !== 'string')
    || typeof visibility !== 'string' || !VISIBILITIES.has(visibility) || (expiresAt !== null && !isIsoDate(expiresAt))
    || !isIsoDate(createdAt) || !isIsoDate(updatedAt) || (revokedAt !== null && !isIsoDate(revokedAt))) {
    throw new Error('Invalid capsule payload.')
  }

  return {
    id, publicId, edition: edition as CapsuleEdition, payload: payload.payload, title, description,
    visibility: visibility as CapsuleVisibility, expiresAt, createdAt, updatedAt, revokedAt,
    integrity: parseIntegrity(payload.integrity), owner: parseOwner(owner),
  }
}

export function parsePublicCapsule(payload: unknown): PublicCapsule {
  if (!isObject(payload) || 'id' in payload || 'revokedAt' in payload) {
    throw new Error('Invalid public capsule payload.')
  }

  const { publicId, edition, title, description, visibility, expiresAt, createdAt, updatedAt, owner } = payload
  if (!isText(publicId) || typeof edition !== 'string' || !EDITIONS.has(edition) || !isText(payload.payload)
    || !isText(title) || (description !== null && typeof description !== 'string')
    || (visibility !== 'unlisted' && visibility !== 'public') || (expiresAt !== null && !isIsoDate(expiresAt))
    || !isIsoDate(createdAt) || !isIsoDate(updatedAt)) {
    throw new Error('Invalid public capsule payload.')
  }

  return {
    publicId, edition: edition as CapsuleEdition, payload: payload.payload, title, description, visibility,
    expiresAt, createdAt, updatedAt, integrity: parseIntegrity(payload.integrity), owner: parseOwner(owner),
  }
}

export function parseCapsulePage(payload: unknown): CapsulePage {
  if (!isObject(payload) || !Array.isArray(payload.items) || (payload.nextCursor !== null && typeof payload.nextCursor !== 'string')) {
    throw new Error('Invalid capsule list payload.')
  }
  return { items: payload.items.map(parseCapsule), nextCursor: payload.nextCursor }
}

function parseArtifactVerification(payload: unknown): ArtifactVerification {
  if (!isObject(payload) || !isText(payload.publicId)
    || (payload.status !== 'valid' && payload.status !== 'invalid' && payload.status !== 'revoked' && payload.status !== 'expired')
    || (payload.expiresAt !== null && !isIsoDate(payload.expiresAt))) {
    throw new Error('Invalid artifact verification payload.')
  }
  const integrity = parseIntegrity(payload.integrity)
  if (!integrity) throw new Error('Invalid artifact verification payload.')
  return { publicId: payload.publicId, status: payload.status, integrity, expiresAt: payload.expiresAt }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  publicRequest?: boolean
}

async function request(path: string, fallback: string, options: RequestOptions = {}) {
  const response = await fetch(`${getApiUrl()}${path}`, {
    method: options.method ?? 'GET',
    headers: getApiHeaders(),
    credentials: options.publicRequest ? 'omit' : 'include',
    cache: 'no-store',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  const payload = await parseResponsePayload(response)
  if (!response.ok) throwApiError(response.status, payload, fallback, !options.publicRequest)
  return payload
}

export async function createCapsule(input: CreateCapsuleInput): Promise<Capsule> {
  return parseCapsule(await request('/api/capsules', 'Unable to save this capsule.', { method: 'POST', body: input }))
}

export async function listCapsules(cursor?: string): Promise<CapsulePage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
  return parseCapsulePage(await request(`/api/capsules${query}`, 'Unable to load your capsules.'))
}

export async function updateCapsule(id: string, input: UpdateCapsuleInput): Promise<Capsule> {
  return parseCapsule(await request(`/api/capsules/${encodeURIComponent(id)}`, 'Unable to update this capsule.', { method: 'PATCH', body: input }))
}

export async function revokeCapsule(id: string): Promise<void> {
  await request(`/api/capsules/${encodeURIComponent(id)}`, 'Unable to revoke this capsule.', { method: 'DELETE' })
}

export async function getPublicCapsule(publicId: string): Promise<PublicCapsule> {
  let capsule: PublicCapsule
  try {
    capsule = parsePublicCapsule(await request(`/api/artifacts/${encodeURIComponent(publicId)}`, 'This capsule is unavailable.', { publicRequest: true }))
  } catch {
    try {
      capsule = parsePublicCapsule(await request(`/api/capsules/public/${encodeURIComponent(publicId)}`, 'This capsule is unavailable.', { publicRequest: true }))
    } catch {
      throw new Error('This capsule is unavailable.')
    }
  }
  if (capsule.expiresAt && Date.parse(capsule.expiresAt) <= Date.now()) throw new Error('This capsule is unavailable.')
  return capsule
}

export async function verifyArtifact(publicId: string): Promise<ArtifactVerification> {
  return parseArtifactVerification(await request(
    `/api/artifacts/${encodeURIComponent(publicId)}/verify`,
    'Artifact verification is unavailable.',
    { publicRequest: true },
  ))
}

export function getCapsuleShareUrl(publicId: string) {
  return `${window.location.origin}${window.location.pathname}#/capsule/${encodeURIComponent(publicId)}`
}
