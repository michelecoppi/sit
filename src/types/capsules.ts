export type CapsuleEdition = '1.0' | '2.0'
export type CapsuleVisibility = 'private' | 'unlisted' | 'public'
export type ArtifactVerificationStatus = 'valid' | 'invalid' | 'revoked' | 'expired'

export interface CapsuleOwner {
  researcherId: string
  displayName: string
}

export interface ArtifactIntegrity {
  algorithm: 'sha256'
  digest: string
  verified: boolean
}

export interface ArtifactVerification {
  publicId: string
  status: ArtifactVerificationStatus
  integrity: ArtifactIntegrity
  expiresAt: string | null
}

export interface Capsule {
  id: string
  publicId: string | null
  edition: CapsuleEdition
  payload: string
  title: string
  description: string | null
  visibility: CapsuleVisibility
  expiresAt: string | null
  createdAt: string
  updatedAt: string
  revokedAt: string | null
  integrity?: ArtifactIntegrity
  owner: CapsuleOwner | null
}

export interface PublicCapsule {
  publicId: string
  edition: CapsuleEdition
  payload: string
  title: string
  description: string | null
  visibility: Exclude<CapsuleVisibility, 'private'>
  expiresAt: string | null
  createdAt: string
  updatedAt: string
  integrity?: ArtifactIntegrity
  owner: CapsuleOwner | null
}

export interface CapsulePage {
  items: Capsule[]
  nextCursor: string | null
}

export interface CreateCapsuleInput {
  edition: CapsuleEdition
  payload: string
  title: string
  description?: string | null
  visibility: CapsuleVisibility
  expiresAt?: string | null
}

export interface UpdateCapsuleInput {
  title?: string
  description?: string | null
  visibility?: CapsuleVisibility
  expiresAt?: string | null
}
