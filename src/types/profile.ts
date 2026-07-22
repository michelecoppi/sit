export interface ResearcherProfile {
  researcherId: string
  displayName: string
  rank: string
  xp: number
  level: number
  preferredVersion: string
  messagesEncoded: number
  messagesDecoded: number
  syteProcessed: number
}

export interface MeProfile extends ResearcherProfile {
  preferredLanguage: string
  autoTranslation: boolean
  createdAt: string
  updatedAt: string
}

export interface MeSummary {
  achievementCount: number
  linkedAccountCount: number
  recentTranslationCount: number
  lastTranslationAt: string | null
}

export interface RecentTranslation {
  id: number
  messageId: string
  guildId: string
  channelId: string
  sourceContent: string
  decodedContent: string
  detectedStandard: string
  compliance: number
  syteCount: number
  createdAt: string
}

export interface AchievementAward {
  awardedAt: string
  achievement: {
    code: string
    title: string
    description: string
    xpReward: number
  }
}

export interface LinkedAccountLegacy {
  provider: string
  providerId: string
  createdAt: string
  updatedAt: string
}

export interface MeResponse {
  profile: MeProfile
  summary: MeSummary
  recentTranslations: RecentTranslation[]
  achievements: AchievementAward[]
  linkedAccounts: LinkedAccountLegacy[]
}
