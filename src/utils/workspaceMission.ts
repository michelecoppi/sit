import type { WorkspaceMission } from '../types/workspace'

export function isMissionActive(mission: WorkspaceMission) {
  return mission.status === 'active'
    && (mission.dueAt === null || Date.parse(mission.dueAt) > Date.now())
}
