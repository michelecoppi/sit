import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import type { TeamDetail, TeamMember } from '../../types/teams'
import type { WorkspaceCapsule, WorkspaceCapsuleStatus, WorkspaceMission, WorkspaceMissionStatus } from '../../types/workspace'
import {
  WorkspaceConflictError,
  addWorkspaceCapsuleContributor,
  createWorkspaceCapsule,
  createWorkspaceMission,
  listWorkspaceCapsules,
  listWorkspaceMissions,
  publishWorkspaceCapsule,
  recordWorkspaceMissionProgress,
  updateWorkspaceCapsule,
} from '../../services/workspaceService'

function messageOf(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function progressPercent(value: number, target: number) {
  return Math.min(100, Math.round((value / Math.max(1, target)) * 100))
}

const fieldClass = 'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:disabled:bg-slate-900'
const selectClass = `${fieldClass} appearance-auto [color-scheme:light] dark:[color-scheme:dark]`
const labelClass = 'text-sm font-medium text-slate-700 dark:text-slate-200'

function MissionBoard({ team, members }: { team: TeamDetail, members: TeamMember[] }) {
  const [missions, setMissions] = useState<WorkspaceMission[]>([])
  const [status, setStatus] = useState<WorkspaceMissionStatus | 'all'>('active')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [metric, setMetric] = useState<WorkspaceMission['metric']>('messages_encoded')
  const [target, setTarget] = useState(3)
  const [assigneeIds, setAssigneeIds] = useState<string[]>([])
  const [createdToday, setCreatedToday] = useState(!team.progression.missionPolicy.canCreateToday)
  const activity = team.progression.missionPolicy.activityTypes.find((entry) => entry.metric === metric)
  const derivedBand = activity?.bands.find((entry) => entry.maxTarget === null || target <= entry.maxTarget)
  const assigneeCount = Math.max(1, assigneeIds.length)
  const derivedReward = derivedBand?.rewards.find((entry) => entry.assigneeCount === assigneeCount)?.teamXp
    ?? derivedBand?.assignedReward
    ?? 0

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const page = await listWorkspaceMissions(team.id, status === 'all' ? undefined : status)
      setMissions(page.items)
    } catch (caught) {
      setError(messageOf(caught, 'Unable to load team missions.'))
    } finally {
      setLoading(false)
    }
  }, [status, team.id])

  useEffect(() => { void load() }, [load])

  async function createMission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setError(null)
    try {
      const mission = await createWorkspaceMission(team.id, {
        title: String(data.get('title') ?? '').trim(),
        description: String(data.get('description') ?? '').trim(),
        target: Number(data.get('target')),
        metric,
        assigneeResearcherIds: assigneeIds,
      })
      setMissions((current) => [mission, ...current])
      setCreatedToday(true)
      form.reset()
      setMetric('messages_encoded')
      setTarget(3)
      setAssigneeIds([])
    } catch (caught) {
      setError(messageOf(caught, 'Unable to create mission.'))
    }
  }

  async function updateProgress(mission: WorkspaceMission, nextProgress: number) {
    const previous = missions
    const capped = Math.min(mission.target, Math.max(0, nextProgress))
    const delta = capped - mission.individualProgress
    setBusyId(mission.id)
    setError(null)
    setMissions((current) => current.map((entry) => entry.id === mission.id ? {
      ...entry,
      individualProgress: capped,
      aggregateProgress: Math.max(0, entry.aggregateProgress + delta),
    } : entry))
    try {
      const updated = await recordWorkspaceMissionProgress(
        team.id,
        mission.id,
        capped,
        `web-${mission.id}-${Date.now()}`,
      )
      setMissions((current) => current.map((entry) => entry.id === mission.id ? updated : entry))
    } catch (caught) {
      setMissions(previous)
      setError(messageOf(caught, 'Progress could not be synchronized; the optimistic update was rolled back.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8 dark:border-slate-800 dark:bg-slate-900" aria-labelledby="workspace-missions-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Shared objectives</p>
          <h2 id="workspace-missions-title" className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Mission board</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">One verified team objective per UTC day.</p>
        </div>
        <label className={`${labelClass} w-full sm:w-48`}>Filter
          <select className={selectClass} value={status} onChange={(event) => setStatus(event.target.value as WorkspaceMissionStatus | 'all')}>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
            <option value="all">All</option>
          </select>
        </label>
      </div>
      {error ? <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200" role="alert">{error}</div> : null}
      {team.permissions.manageMissions ? (
        <form className="mt-6 grid gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 sm:grid-cols-2 xl:grid-cols-4 dark:border-indigo-950 dark:bg-indigo-950/20" onSubmit={createMission}>
          <label className={`${labelClass} sm:col-span-2`}>Mission title<input className={fieldClass} name="title" required minLength={2} maxLength={120} disabled={createdToday} /></label>
          <label className={labelClass}>Activity
            <select className={selectClass} name="metric" value={metric} disabled={createdToday} onChange={(event) => setMetric(event.target.value as WorkspaceMission['metric'])}>
              {team.progression.missionPolicy.activityTypes.map((entry) => (
                <option className="bg-white text-slate-950 dark:bg-slate-900 dark:text-white" key={entry.metric} value={entry.metric}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>Target ({activity?.unit ?? 'units'})<input className={fieldClass} name="target" type="number" value={target} min={1} required disabled={createdToday} onChange={(event) => setTarget(Math.max(1, Number(event.target.value)))} /></label>
          <fieldset className="sm:col-span-2 xl:col-span-4" disabled={createdToday}>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <legend className={labelClass}>Assignees</legend>
              <span className="text-xs text-slate-500 dark:text-slate-400">{assigneeIds.length || 1}/{team.progression.missionPolicy.maxAssignees} · limit grows with team level</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Select up to {team.progression.missionPolicy.maxAssignees} members. No selection means only you.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3" role="group" aria-label="Mission assignees">
              {members.map((member) => {
                const selected = assigneeIds.includes(member.researcherId)
                const atLimit = !selected && assigneeIds.length >= team.progression.missionPolicy.maxAssignees
                return (
                  <button
                    aria-pressed={selected}
                    className={`flex min-w-0 items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition ${selected ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm' : 'border-slate-300 bg-white text-slate-900 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100'} disabled:cursor-not-allowed disabled:opacity-50`}
                    disabled={createdToday || atLimit}
                    key={member.researcherId}
                    onClick={() => setAssigneeIds((current) => selected
                      ? current.filter((id) => id !== member.researcherId)
                      : [...current, member.researcherId])}
                    type="button"
                  >
                    <span className="min-w-0"><strong className="block truncate">{member.displayName}</strong><span className={`block truncate text-xs ${selected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>{member.researcherId} · {member.role}</span></span>
                    <span aria-hidden="true">{selected ? '✓' : '+'}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>
          <label className={`${labelClass} sm:col-span-2 xl:col-span-4`}>Mission brief<textarea className={`${fieldClass} min-h-24 resize-y`} name="description" maxLength={2000} disabled={createdToday} /></label>
          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between xl:col-span-4">
            <div className="text-sm text-slate-600 dark:text-slate-300">
              {createdToday
                ? <>Daily slot used. Next mission {team.progression.missionPolicy.nextCreationAt ? new Date(team.progression.missionPolicy.nextCreationAt).toLocaleString() : 'tomorrow (UTC)'}.</>
                : derivedBand?.unlocked === false
                  ? <><strong className="text-amber-700 dark:text-amber-300">Unlocks at team level {derivedBand.requiredLevel}</strong><span className="block text-xs">Reduce the target or level up the team before creating this mission.</span></>
                  : <><strong className="text-slate-950 dark:text-white">Core result: {derivedBand?.difficulty ?? 'routine'} · {derivedReward} Team XP · {assigneeCount} participant{assigneeCount === 1 ? '' : 's'}</strong><span className="block text-xs">{activity?.description} Difficulty and collaboration reward are derived by Core; the mission ends at midnight UTC.</span></>}
            </div>
            <button className="button-primary w-full sm:w-auto" disabled={createdToday || derivedBand?.unlocked === false}>{createdToday ? 'Daily mission already created' : derivedBand?.unlocked === false ? 'Target locked' : 'Create daily mission'}</button>
          </div>
        </form>
      ) : null}
      {loading ? <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500 dark:bg-slate-950/50 dark:text-slate-400" role="status">Synchronizing team missions…</div> : null}
      {!loading && !missions.length ? <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No missions match this filter.</div> : null}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {missions.map((mission) => (
          <article className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-950/40" key={mission.id}>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span><span className={`workspace-state workspace-state-${mission.status}`}>{mission.status}</span> · {mission.difficulty} · {mission.metric.replaceAll('_', ' ')}</span>
              <span>rev {mission.revision}</span>
            </div>
            <h3 className="mt-4 break-words text-lg font-bold text-slate-950 dark:text-white">{mission.title}</h3>
            <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">{mission.description || 'No mission brief supplied.'}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div><dt>Assignees</dt><dd>{mission.assignees.map((entry) => entry.displayName).join(', ')}</dd></div>
              <div><dt>Daily window</dt><dd>{mission.dueAt ? `Ends ${new Date(mission.dueAt).toLocaleString()}` : 'Ends at UTC reset'}</dd></div>
              <div><dt>Reward</dt><dd>{mission.teamXpReward} Team XP</dd></div>
            </dl>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300"><span>Individual {mission.individualProgress}/{mission.target}</span><span>{progressPercent(mission.individualProgress, mission.target)}%</span></div>
              <progress className="h-2 w-full overflow-hidden rounded-full accent-indigo-600" max={mission.target} value={mission.individualProgress} />
              <small className="mt-2 block text-xs text-slate-500">Aggregate {mission.aggregateProgress}/{mission.target} · updated {new Date(mission.updatedAt).toLocaleString()}</small>
            </div>
            {team.permissions.contribute && mission.status === 'active' && mission.assignees.some((entry) => entry.researcherId === team.currentMember?.researcherId) ? (
              <form className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:items-end" onSubmit={(event) => {
                event.preventDefault()
                const value = Number(new FormData(event.currentTarget).get('progress'))
                void updateProgress(mission, value)
              }}>
                <label className={`${labelClass} flex-1`}>Set progress<input className={fieldClass} name="progress" type="number" min={0} max={mission.target} defaultValue={mission.individualProgress} /></label>
                <button className="button-secondary w-full sm:w-auto" disabled={busyId === mission.id}>{busyId === mission.id ? 'Syncing…' : 'Update'}</button>
              </form>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

function CapsuleWorkspace({ team }: { team: TeamDetail }) {
  const [capsules, setCapsules] = useState<WorkspaceCapsule[]>([])
  const [filter, setFilter] = useState<WorkspaceCapsuleStatus | 'all'>('draft')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState({ title: '', description: '', payload: '' })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [conflict, setConflict] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const selected = useMemo(() => capsules.find((capsule) => capsule.id === selectedId) ?? null, [capsules, selectedId])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const page = await listWorkspaceCapsules(team.id, filter === 'all' ? undefined : filter)
      setCapsules(page.items)
      setSelectedId((current) => current && page.items.some((item) => item.id === current) ? current : page.items[0]?.id ?? null)
      setConflict(false)
    } catch (caught) {
      setError(messageOf(caught, 'Unable to load workspace capsules.'))
    } finally {
      setLoading(false)
    }
  }, [filter, team.id])

  useEffect(() => { void load() }, [load])
  useEffect(() => {
    if (selected) setDraft({ title: selected.title, description: selected.description, payload: selected.payload })
  }, [selected])

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setConflict(false)
    try {
      const updated = selected
        ? await updateWorkspaceCapsule(team.id, selected.id, selected.revision, draft)
        : await createWorkspaceCapsule(team.id, draft)
      setCapsules((current) => selected
        ? current.map((item) => item.id === updated.id ? updated : item)
        : [updated, ...current])
      setSelectedId(updated.id)
    } catch (caught) {
      setConflict(caught instanceof WorkspaceConflictError)
      setError(messageOf(caught, 'Unable to save capsule.'))
    } finally {
      setBusy(false)
    }
  }

  async function publish() {
    if (!selected) return
    setBusy(true)
    setError(null)
    try {
      const published = await publishWorkspaceCapsule(team.id, selected.id, selected.revision)
      setCapsules((current) => current.map((item) => item.id === published.id ? published : item))
    } catch (caught) {
      setConflict(caught instanceof WorkspaceConflictError)
      setError(messageOf(caught, 'Unable to publish capsule.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8 dark:border-slate-800 dark:bg-slate-900" aria-labelledby="workspace-capsules-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">Versioned artifacts</p><h2 id="workspace-capsules-title" className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Capsule studio</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Draft, review and publish without overwriting newer work.</p></div>
        <label className={`${labelClass} w-full sm:w-48`}>Filter
          <select className={selectClass} value={filter} onChange={(event) => setFilter(event.target.value as WorkspaceCapsuleStatus | 'all')}>
            <option value="draft">Drafts</option>
            <option value="published">Published</option>
            <option value="all">All</option>
          </select>
        </label>
      </div>
      {error ? <div className="mt-4 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200" role="alert"><span>{error}</span>{conflict ? <button className="button-secondary" onClick={() => void load()}>Reload Core revision</button> : null}</div> : null}
      {loading ? <div className="route-loader" role="status">Loading capsule revisions…</div> : (
        <div className="mt-6 grid min-w-0 gap-5 lg:grid-cols-[minmax(13rem,0.7fr)_minmax(0,2fr)]">
          <aside className="flex min-w-0 gap-2 overflow-x-auto pb-2 lg:max-h-[40rem] lg:flex-col lg:overflow-y-auto lg:pb-0">
            {team.permissions.contribute ? <button className="button-secondary shrink-0" onClick={() => { setSelectedId(null); setDraft({ title: '', description: '', payload: '' }); setConflict(false) }}>New draft</button> : null}
            {!capsules.length ? <div className="min-w-56 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">No capsules match this filter.</div> : capsules.map((capsule) => (
              <button className={selectedId === capsule.id ? 'min-w-56 rounded-xl border border-indigo-400 bg-indigo-50 p-3 text-left text-slate-950 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-white' : 'min-w-56 rounded-xl border border-slate-200 bg-white p-3 text-left text-slate-700 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'} key={capsule.id} onClick={() => setSelectedId(capsule.id)}>
                <strong>{capsule.title}</strong><span>{capsule.status} · rev {capsule.revision}</span>
              </button>
            ))}
          </aside>
          <form className="min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-950/40" onSubmit={save}>
            <div className="flex flex-wrap justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500"><span>{selected ? `${selected.status} · revision ${selected.revision}` : 'new draft'}</span><span>{selected?.contributors.length ?? 1} contributor(s)</span></div>
            <label className={labelClass}>Title<input className={fieldClass} value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} required disabled={!team.permissions.contribute || selected?.status === 'published'} /></label>
            <label className={labelClass}>Description<textarea className={`${fieldClass} min-h-20 resize-y`} value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} disabled={!team.permissions.contribute || selected?.status === 'published'} /></label>
            <label className={labelClass}>Capsule payload<textarea className={`${fieldClass} min-h-56 resize-y font-mono`} value={draft.payload} onChange={(event) => setDraft((current) => ({ ...current, payload: event.target.value }))} required disabled={!team.permissions.contribute || selected?.status === 'published'} /></label>
            <div className="flex flex-col gap-3 sm:flex-row">
              {team.permissions.contribute && selected?.status !== 'published' ? <button className="button-primary" disabled={busy}>{busy ? 'Synchronizing…' : selected ? 'Save revision' : 'Create draft'}</button> : null}
              {selected && team.permissions.publishCapsules && selected.status === 'draft' ? <button className="button-secondary" type="button" disabled={busy} onClick={() => void publish()}>Publish</button> : null}
            </div>
            {selected && team.permissions.manageMembers ? (
              <label className={labelClass}>Add contributor
                <span className="mt-1 flex flex-col gap-2 sm:flex-row">
                  <input className={fieldClass} name="contributor" placeholder="SIT-000067" />
                  <button className="button-secondary" type="button" onClick={(event) => {
                    const input = event.currentTarget.parentElement?.querySelector('input')
                    if (!input?.value.trim()) return
                    setBusy(true)
                    void addWorkspaceCapsuleContributor(team.id, selected.id, input.value.trim())
                      .then((updated) => setCapsules((current) => current.map((item) => item.id === updated.id ? updated : item)))
                      .catch((caught) => setError(messageOf(caught, 'Unable to add contributor.')))
                      .finally(() => setBusy(false))
                  }}>Add</button>
                </span>
              </label>
            ) : null}
          </form>
        </div>
      )}
    </section>
  )
}

export default function TeamWorkspaceBoards({ team, members }: { team: TeamDetail, members: TeamMember[] }) {
  if (!team.currentMember) {
    return <div className="team-notice team-notice-error" role="alert">This workspace is restricted to verified team members.</div>
  }
  return (
    <div className="mt-8 space-y-6 sm:space-y-8">
      <MissionBoard team={team} members={members} />
      <CapsuleWorkspace team={team} />
    </div>
  )
}
