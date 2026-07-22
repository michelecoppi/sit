export type StatisticsProvider = string

export interface StatisticsSummary {
  registeredUsers: number
  totalMessages: number
  totalEncodings: number
  totalDecodings: number
  totalSyte: number
  mostActiveUser: string
}

export interface StatisticsSnapshotResponse {
  providers: StatisticsProvider[]
  snapshot: {
    global: StatisticsSummary
    byProvider: Record<string, StatisticsSummary>
  }
}
