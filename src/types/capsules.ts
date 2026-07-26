export type CapsuleEdition = '1.0' | '2.0'
export type CapsuleVisibility = 'private' | 'unlisted' | 'public'

export interface CapsuleOwner {
  researcherId: string
  displayName: string
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
