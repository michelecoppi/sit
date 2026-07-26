import { useEffect, useState } from 'react'
import { ArrowRightIcon, FireIcon, TrophyIcon } from '@heroicons/react/24/outline'
import { getMissionDashboard } from '../../services/missionService'
import type { MissionDashboard } from '../../types/missions'

export default function ProfileMissionSummary() {
  const [dashboard, setDashboard] = useState<MissionDashboard | null>(null)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    let active = true
    void getMissionDashboard()
      .then((result) => {
        if (active) setDashboard(result)
      })
      .catch(() => {
        if (active) setUnavailable(true)
      })
    return () => {
      active = false
    }
  }, [])

  if (unavailable) {
    return (
      <a href="#/missions" className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm shadow-sm transition hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800">
        <span><strong className="block text-slate-900 dark:text-white">Mission control</strong><span className="mt-1 block text-slate-500">Progress is temporarily unavailable. Open the field board to retry.</span></span>
        <ArrowRightIcon className="h-5 w-5 shrink-0" />
      </a>
    )
  }

  if (!dashboard) {
    return <div className="h-24 animate-pulse rounded-[1.5rem] bg-slate-200 motion-reduce:animate-none dark:bg-slate-800" aria-label="Loading mission summary" />
  }

  const complete = dashboard.missions.filter((mission) => mission.state === 'completed').length
  return (
    <a href="#/missions" className="group flex flex-wrap items-center justify-between gap-5 rounded-[1.5rem] border border-blue-200 bg-gradient-to-r from-blue-50 to-violet-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none dark:border-blue-900 dark:from-blue-950/30 dark:to-violet-950/20">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white"><TrophyIcon className="h-6 w-6" /></span>
        <div>
          <p className="font-semibold text-slate-950 dark:text-white">Research mission control</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{complete} of {dashboard.missions.length} active directives complete</p>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-orange-600 dark:text-orange-300"><FireIcon className="h-5 w-5" /> {dashboard.streak.current} day streak</span>
        <ArrowRightIcon className="h-5 w-5 transition group-hover:translate-x-1 motion-reduce:transition-none" />
      </div>
    </a>
  )
}
