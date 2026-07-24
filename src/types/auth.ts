export type LoginTicketStatus = 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'USED'

export interface CreateLoginTicketResponse {
  ticket: string
  loginUrl: string
  expiresAt: string
}

export interface LoginStatusResponse {
  status: LoginTicketStatus
}

export interface TelegramLoginTicketSnapshot {
  ticket: string
  loginUrl: string
  expiresAt: string
  startedAt: number
}
