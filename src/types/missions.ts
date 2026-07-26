export type MissionCadence = 'daily' | 'weekly'
export type MissionState = 'active' | 'completed'

export interface Mission {
  code: string
  title: string
  description: string
  cadence: MissionCadence
  metric: string
  target: number
  progress: number
  remaining: number
  xpReward: number
  state: MissionState
  startsAt: string
  resetsAt: string
  completedAt: string | null
}

export interface MissionStreak {
  current: number
  best: number
  lastQualifiedDate: string | null
  timezone: 'UTC'
  rules: string
}

export interface MissionDashboard {
  missions: Mission[]
  streak: MissionStreak
  serverTime: string
}

export interface MissionHistoryPage {
  items: Mission[]
  nextCursor: string | null
}
