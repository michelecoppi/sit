import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import type { TeamDetail } from '../../types/teams'
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

function MissionBoard({ team }: { team: TeamDetail }) {
  const [missions, setMissions] = useState<WorkspaceMission[]>([])
  const [status, setStatus] = useState<WorkspaceMissionStatus | 'all'>('active')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
        xpReward: Number(data.get('xpReward')),
        dueAt: String(data.get('dueAt') ?? '').trim() || null,
        assigneeResearcherId: String(data.get('assigneeResearcherId') ?? '').trim() || null,
      })
      setMissions((current) => [mission, ...current])
      form.reset()
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
    <section className="workspace-board" aria-labelledby="workspace-missions-title">
      <div className="workspace-board-header">
        <div><p className="team-eyebrow">Shared objectives</p><h2 id="workspace-missions-title">Mission board</h2></div>
        <label>Filter
          <select value={status} onChange={(event) => setStatus(event.target.value as WorkspaceMissionStatus | 'all')}>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
            <option value="all">All</option>
          </select>
        </label>
      </div>
      {error ? <div className="team-notice team-notice-error" role="alert">{error}</div> : null}
      {team.permissions.manageMissions ? (
        <form className="workspace-create-grid" onSubmit={createMission}>
          <label>Mission title<input name="title" required minLength={2} maxLength={120} /></label>
          <label>Target<input name="target" type="number" defaultValue={1} min={1} required /></label>
          <label>XP reward<input name="xpReward" type="number" defaultValue={0} min={0} required /></label>
          <label>Due date<input name="dueAt" type="datetime-local" /></label>
          <label>Assignee ID<input name="assigneeResearcherId" placeholder="Optional SIT-000067" /></label>
          <label className="workspace-span">Mission brief<textarea name="description" maxLength={2000} /></label>
          <button className="button-primary workspace-span">Create mission</button>
        </form>
      ) : null}
      {loading ? <div className="route-loader" role="status">Synchronizing team missions…</div> : null}
      {!loading && !missions.length ? <div className="workspace-empty">No missions match this filter.</div> : null}
      <div className="workspace-card-grid">
        {missions.map((mission) => (
          <article className="workspace-card" key={mission.id}>
            <div className="workspace-card-topline">
              <span className={`workspace-state workspace-state-${mission.status}`}>{mission.status}</span>
              <span>rev {mission.revision}</span>
            </div>
            <h3>{mission.title}</h3>
            <p>{mission.description || 'No mission brief supplied.'}</p>
            <dl className="workspace-meta">
              <div><dt>Assignee</dt><dd>{mission.assignee?.displayName ?? 'Whole team'}</dd></div>
              <div><dt>Due</dt><dd>{mission.dueAt ? new Date(mission.dueAt).toLocaleString() : 'Open'}</dd></div>
              <div><dt>Reward</dt><dd>{mission.xpReward} XP</dd></div>
            </dl>
            <div className="workspace-progress">
              <div><span>Individual {mission.individualProgress}/{mission.target}</span><span>{progressPercent(mission.individualProgress, mission.target)}%</span></div>
              <progress max={mission.target} value={mission.individualProgress} />
              <small>Aggregate {mission.aggregateProgress}/{mission.target} · updated {new Date(mission.updatedAt).toLocaleString()}</small>
            </div>
            {team.permissions.contribute && mission.status === 'active' ? (
              <form className="workspace-progress-form" onSubmit={(event) => {
                event.preventDefault()
                const value = Number(new FormData(event.currentTarget).get('progress'))
                void updateProgress(mission, value)
              }}>
                <label>Set progress<input name="progress" type="number" min={0} max={mission.target} defaultValue={mission.individualProgress} /></label>
                <button className="button-secondary" disabled={busyId === mission.id}>{busyId === mission.id ? 'Syncing…' : 'Update'}</button>
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
    <section className="workspace-board" aria-labelledby="workspace-capsules-title">
      <div className="workspace-board-header">
        <div><p className="team-eyebrow">Versioned artifacts</p><h2 id="workspace-capsules-title">Capsule studio</h2></div>
        <label>Filter
          <select value={filter} onChange={(event) => setFilter(event.target.value as WorkspaceCapsuleStatus | 'all')}>
            <option value="draft">Drafts</option>
            <option value="published">Published</option>
            <option value="all">All</option>
          </select>
        </label>
      </div>
      {error ? <div className="team-notice team-notice-error" role="alert">{error}{conflict ? <button className="button-secondary" onClick={() => void load()}>Reload Core revision</button> : null}</div> : null}
      {loading ? <div className="route-loader" role="status">Loading capsule revisions…</div> : (
        <div className="capsule-workspace-grid">
          <aside className="capsule-list">
            {team.permissions.contribute ? <button className="button-secondary" onClick={() => { setSelectedId(null); setDraft({ title: '', description: '', payload: '' }); setConflict(false) }}>New draft</button> : null}
            {!capsules.length ? <div className="workspace-empty">No capsules match this filter.</div> : capsules.map((capsule) => (
              <button className={selectedId === capsule.id ? 'capsule-list-item capsule-list-item-active' : 'capsule-list-item'} key={capsule.id} onClick={() => setSelectedId(capsule.id)}>
                <strong>{capsule.title}</strong><span>{capsule.status} · rev {capsule.revision}</span>
              </button>
            ))}
          </aside>
          <form className="team-form capsule-editor" onSubmit={save}>
            <div className="workspace-card-topline"><span>{selected ? `${selected.status} · revision ${selected.revision}` : 'new draft'}</span><span>{selected?.contributors.length ?? 1} contributor(s)</span></div>
            <label>Title<input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} required disabled={!team.permissions.contribute || selected?.status === 'published'} /></label>
            <label>Description<textarea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} disabled={!team.permissions.contribute || selected?.status === 'published'} /></label>
            <label>Capsule payload<textarea className="capsule-payload" value={draft.payload} onChange={(event) => setDraft((current) => ({ ...current, payload: event.target.value }))} required disabled={!team.permissions.contribute || selected?.status === 'published'} /></label>
            <div className="team-actions">
              {team.permissions.contribute && selected?.status !== 'published' ? <button className="button-primary" disabled={busy}>{busy ? 'Synchronizing…' : selected ? 'Save revision' : 'Create draft'}</button> : null}
              {selected && team.permissions.publishCapsules && selected.status === 'draft' ? <button className="button-secondary" type="button" disabled={busy} onClick={() => void publish()}>Publish</button> : null}
            </div>
            {selected && team.permissions.manageMembers ? (
              <label>Add contributor
                <span className="workspace-inline">
                  <input name="contributor" placeholder="SIT-000067" />
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

export default function TeamWorkspaceBoards({ team }: { team: TeamDetail }) {
  if (!team.currentMember) {
    return <div className="team-notice team-notice-error" role="alert">This workspace is restricted to verified team members.</div>
  }
  return (
    <div className="workspace-verticals">
      <MissionBoard team={team} />
      <CapsuleWorkspace team={team} />
    </div>
  )
}
