export type LoginTicketStatus = 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'USED'

export interface CreateLoginTicketResponse {
  ticket: string
  loginUrl: string
  expiresAt: string
}

export interface LoginStatusPendingResponse {
  status: 'PENDING' | 'EXPIRED' | 'USED'
}

export interface LoginStatusCompletedResponse {
  status: 'COMPLETED'
  token: string
}

export type LoginStatusResponse = LoginStatusPendingResponse | LoginStatusCompletedResponse

export interface TelegramLoginTicketSnapshot {
  ticket: string
  loginUrl: string
  expiresAt: string
  startedAt: number
}
