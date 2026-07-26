import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  archiveTeam,
  changeTeamMemberRole,
  createTeam,
  createTeamInvite,
  discoverTeams,
  getTeam,
  getTeamInvite,
  getTeamLeaderboard,
  getTeamMembers,
  leaveTeam,
  removeTeamMember,
  respondToTeamInvite,
  transferTeamOwnership,
  updateTeam,
} from '../services/teamService'
import type { TeamDetail, TeamInvite, TeamMember, TeamSummary, TeamVisibility } from '../types/teams'

function ErrorNotice({ message }: { message: string }) {
  return <div className="team-notice team-notice-error" role="alert">{message}</div>
}

function TeamCard({ team, rank }: { team: TeamSummary, rank?: number }) {
  return (
    <article className="team-card">
      {rank ? <span className="team-rank" aria-label={`Rank ${rank}`}>{rank}</span> : null}
      <div>
        <p className="team-eyebrow">{team.visibility} research team</p>
        <h2><Link to={`/teams/${team.slug}`}>{team.name}</Link></h2>
        <p>{team.description || 'No public research abstract has been filed.'}</p>
      </div>
      <dl className="team-metrics">
        <div><dt>Members</dt><dd>{team.memberCount.toLocaleString()}</dd></div>
        <div><dt>XP</dt><dd>{team.totalXp.toLocaleString()}</dd></div>
        <div><dt>Contributions</dt><dd>{team.totalContributions.toLocaleString()}</dd></div>
      </dl>
      {team.archivedAt ? <span className="team-state">Archived</span> : null}
    </article>
  )
}

function CreateTeamForm({ onCreated }: { onCreated: (team: TeamDetail) => void }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const data = new FormData(event.currentTarget)
    try {
      const team = await createTeam({
        name: String(data.get('name') ?? '').trim(),
        slug: String(data.get('slug') ?? '').trim().toLowerCase(),
        description: String(data.get('description') ?? '').trim(),
        visibility: data.get('visibility') as TeamVisibility,
      })
      onCreated(team)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to create the team.')
      setBusy(false)
    }
  }

  if (!open) return <button className="button-primary" type="button" onClick={() => setOpen(true)}>Register a team</button>
  return (
    <form className="team-form" onSubmit={submit}>
      <h2>Register a research team</h2>
      {error ? <ErrorNotice message={error} /> : null}
      <label>Team name<input required minLength={2} maxLength={80} name="name" autoComplete="organization" /></label>
      <label>Registry slug<input required pattern="[a-z0-9-]+" maxLength={64} name="slug" placeholder="symbolic-systems-lab" /></label>
      <label>Public abstract<textarea maxLength={500} name="description" rows={3} /></label>
      <label>Visibility<select name="visibility" defaultValue="public"><option value="public">Public</option><option value="private">Private</option></select></label>
      <div className="team-actions">
        <button className="button-primary" disabled={busy}>{busy ? 'Registering…' : 'Create team'}</button>
        <button className="button-secondary" type="button" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  )
}

export function TeamsPage() {
  const { status } = useAuth()
  const navigate = useNavigate()
  const [teams, setTeams] = useState<TeamSummary[]>([])
  const [leaders, setLeaders] = useState<TeamSummary[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (cursor?: string) => {
    try {
      const [page, leaderboard] = await Promise.all([discoverTeams(cursor), cursor ? Promise.resolve(null) : getTeamLeaderboard()])
      setTeams((current) => cursor ? [...current, ...page.items] : page.items)
      setNextCursor(page.nextCursor)
      if (leaderboard) setLeaders(leaderboard.items)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load research teams.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  if (loading) return <div className="route-loader" role="status">Loading research team registry…</div>
  return (
    <section className="team-page">
      <header className="team-hero">
        <p className="team-eyebrow">Collaborative research registry</p>
        <h1>Research teams</h1>
        <p>Coordinate canonical SIT identities, shared progress and public rankings through SIT Core.</p>
        {status === 'authenticated'
          ? <CreateTeamForm onCreated={(team) => navigate(`/teams/${team.slug}/workspace`)} />
          : <Link className="button-primary" to="/profile">Sign in to create a team</Link>}
      </header>
      {error ? <ErrorNotice message={error} /> : null}
      {leaders.length ? <section aria-labelledby="leaderboard-title"><h2 id="leaderboard-title">Team leaderboard</h2><div className="team-grid">{leaders.map((team, index) => <TeamCard key={team.id} team={team} rank={index + 1} />)}</div></section> : null}
      <section aria-labelledby="directory-title"><h2 id="directory-title">Public directory</h2><div className="team-grid">{teams.map((team) => <TeamCard key={team.id} team={team} />)}</div></section>
      {nextCursor ? <button className="button-secondary team-load-more" onClick={() => void load(nextCursor)}>Load more teams</button> : null}
    </section>
  )
}

export function TeamProfilePage() {
  const { slug = '' } = useParams()
  const [team, setTeam] = useState<TeamDetail | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void getTeam(slug).then(async (result) => {
      if (!active) return
      setTeam(result)
      if (result.visibility === 'public' || result.currentMember) {
        const page = await getTeamMembers(result.id)
        if (active) setMembers(page.items)
      }
    }).catch((caught) => active && setError(caught instanceof Error ? caught.message : 'Unable to load this team.'))
    return () => { active = false }
  }, [slug])

  if (error) return <section className="team-page"><ErrorNotice message={error} /><Link to="/teams">Return to team registry</Link></section>
  if (!team) return <div className="route-loader" role="status">Resolving team registry entry…</div>
  return (
    <section className="team-page">
      <header className="team-hero">
        <p className="team-eyebrow">{team.visibility} team · {team.archivedAt ? 'archived' : 'active'}</p>
        <h1>{team.name}</h1>
        <p>{team.description}</p>
        {team.currentMember ? <Link className="button-primary" to={`/teams/${team.slug}/workspace`}>Open team workspace</Link> : null}
      </header>
      <dl className="team-total-strip">
        <div><dt>Verified members</dt><dd>{team.memberCount}</dd></div>
        <div><dt>Collective XP</dt><dd>{team.totalXp.toLocaleString()}</dd></div>
        <div><dt>Contributions</dt><dd>{team.totalContributions.toLocaleString()}</dd></div>
      </dl>
      {team.visibility === 'public' ? (
        <section><h2>Public contributors</h2><div className="member-list">{members.map((member) => <div className="member-row" key={member.researcherId}><div><strong>{member.displayName}</strong><small>{member.researcherId}</small></div><span>{member.contributions.toLocaleString()} contributions</span></div>)}</div></section>
      ) : <div className="team-notice">Membership details are restricted to verified team members.</div>}
    </section>
  )
}

function MemberControls({ team, member, onChanged }: { team: TeamDetail, member: TeamMember, onChanged: () => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  const canManage = team.permissions.manageMembers && member.role !== 'owner'
  const run = async (action: () => Promise<unknown>, prompt: string) => {
    if (!window.confirm(prompt)) return
    setBusy(true)
    try { await action(); await onChanged() } finally { setBusy(false) }
  }
  if (!canManage && !team.permissions.transferOwnership) return null
  return (
    <div className="member-actions">
      {team.permissions.changeRoles && member.role !== 'owner' ? (
        <select aria-label={`Role for ${member.displayName}`} disabled={busy} value={member.role} onChange={(event) => void run(
          () => changeTeamMemberRole(team.id, member.researcherId, event.target.value as 'admin' | 'member'),
          `Change ${member.displayName}'s role?`,
        )}><option value="member">Member</option><option value="admin">Admin</option></select>
      ) : null}
      {team.permissions.transferOwnership && member.role !== 'owner' ? <button disabled={busy} onClick={() => void run(() => transferTeamOwnership(team.id, member.researcherId), `Transfer ownership to ${member.displayName}? You will lose owner privileges.`)}>Transfer ownership</button> : null}
      {canManage ? <button className="danger-link" disabled={busy} onClick={() => void run(() => removeTeamMember(team.id, member.researcherId), `Remove ${member.displayName} from the team?`)}>Remove</button> : null}
    </div>
  )
}

export function TeamWorkspacePage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const [team, setTeam] = useState<TeamDetail | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invite, setInvite] = useState<TeamInvite | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const result = await getTeam(slug)
    if (!result.currentMember) throw new Error('This workspace is available to verified team members only.')
    setTeam(result)
    setMembers((await getTeamMembers(result.id)).items)
  }, [slug])

  useEffect(() => { void load().catch((caught) => setError(caught instanceof Error ? caught.message : 'Unable to load workspace.')) }, [load])

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!team) return
    const data = new FormData(event.currentTarget)
    try {
      await updateTeam(team.id, {
        name: String(data.get('name')),
        slug: String(data.get('slug')),
        description: String(data.get('description')),
        visibility: data.get('visibility') as TeamVisibility,
      })
      setMessage('Team settings saved.')
      await load()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to save settings.') }
  }

  if (error && !team) return <section className="team-page"><ErrorNotice message={error} /></section>
  if (!team) return <div className="route-loader" role="status">Opening team workspace…</div>
  return (
    <section className="team-page">
      <header className="team-hero"><p className="team-eyebrow">Authenticated team workspace</p><h1>{team.name}</h1><p>Permissions below are supplied by SIT Core for your canonical researcher identity.</p></header>
      {error ? <ErrorNotice message={error} /> : null}
      {message ? <div className="team-notice" role="status">{message}</div> : null}
      {team.permissions.editTeam ? <form className="team-form" onSubmit={saveSettings}><h2>Registry settings</h2><label>Name<input name="name" defaultValue={team.name} required /></label><label>Slug<input name="slug" defaultValue={team.slug} required /></label><label>Description<textarea name="description" defaultValue={team.description} /></label><label>Visibility<select name="visibility" defaultValue={team.visibility}><option value="public">Public</option><option value="private">Private</option></select></label><button className="button-primary">Save settings</button></form> : null}
      {team.permissions.inviteMembers ? <section><h2>Invite researchers</h2><p>Invitations expire automatically and inherit only the selected backend role.</p><button className="button-secondary" onClick={() => void createTeamInvite(team.id, 'member', 72).then(setInvite).catch((caught) => setError(caught.message))}>Create 72-hour invite</button>{invite ? <div className="invite-box"><code>{invite.inviteUrl ?? `${window.location.origin}${window.location.pathname}#/team-invites/${invite.token}`}</code><button onClick={() => void navigator.clipboard.writeText(invite.inviteUrl ?? `${window.location.origin}${window.location.pathname}#/team-invites/${invite.token}`)}>Copy</button></div> : null}</section> : null}
      <section><h2>Members</h2><div className="member-list">{members.map((member) => <div className="member-row" key={member.researcherId}><div><strong>{member.displayName}</strong><small>{member.role} · {member.contributions.toLocaleString()} contributions</small></div><MemberControls team={team} member={member} onChanged={load} /></div>)}</div></section>
      <div className="team-danger-zone">
        {team.permissions.leaveTeam ? <button className="danger-button" onClick={() => { if (window.confirm(`Leave ${team.name}?`)) void leaveTeam(team.id).then(() => navigate('/teams')) }}>Leave team</button> : null}
        {team.permissions.archiveTeam ? <button className="danger-button" onClick={() => { if (window.confirm(`Archive ${team.name}? This removes it from active discovery.`)) void archiveTeam(team.id).then(() => navigate(`/teams/${team.slug}`)) }}>Archive team</button> : null}
      </div>
    </section>
  )
}

export function TeamInvitePage() {
  const { token = '' } = useParams()
  const { status } = useAuth()
  const navigate = useNavigate()
  const [invite, setInvite] = useState<TeamInvite | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { void getTeamInvite(token).then(setInvite).catch((caught) => setError(caught instanceof Error ? caught.message : 'Unable to load invitation.')) }, [token])
  if (error) return <section className="team-page"><ErrorNotice message={error} /></section>
  if (!invite) return <div className="route-loader" role="status">Verifying team invitation…</div>
  const expired = invite.status === 'expired' || Date.parse(invite.expiresAt) <= Date.now()
  return <section className="team-page"><div className="invite-card"><p className="team-eyebrow">Research team invitation</p><h1>{invite.team.name}</h1><p>You have been invited as <strong>{invite.role}</strong>. This invitation expires {new Date(invite.expiresAt).toLocaleString()}.</p>{expired ? <ErrorNotice message="This invitation has expired. Ask a team administrator for a new one." /> : invite.status !== 'pending' ? <div className="team-notice">This invitation is already {invite.status}.</div> : status !== 'authenticated' ? <Link className="button-primary" to="/profile">Sign in to respond</Link> : <div className="team-actions"><button className="button-primary" onClick={() => void respondToTeamInvite(token, 'accept').then((team) => navigate(team ? `/teams/${team.slug}/workspace` : '/teams')).catch((caught) => setError(caught.message))}>Accept invitation</button><button className="button-secondary" onClick={() => void respondToTeamInvite(token, 'decline').then(() => navigate('/teams')).catch((caught) => setError(caught.message))}>Decline</button></div>}</div></section>
}
