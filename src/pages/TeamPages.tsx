import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRightIcon,
  BoltIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrophyIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
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
  const initials = team.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase()
  return (
    <article className={`team-card${rank ? ' team-card-ranked' : ''}`}>
      <div className="team-card-topline">
        <span className="team-avatar" aria-hidden="true">{initials}</span>
        {rank ? <span className="team-rank" aria-label={`Rank ${rank}`}><TrophyIcon aria-hidden="true" /> #{rank}</span> : null}
        <span className={`team-visibility team-visibility-${team.visibility}`}>
          {team.visibility === 'public' ? <GlobeAltIcon aria-hidden="true" /> : <LockClosedIcon aria-hidden="true" />}
          {team.visibility}
        </span>
      </div>
      <div className="team-card-copy">
        <h3><Link to={`/teams/${team.slug}`}>{team.name}</Link></h3>
        <p>{team.description || 'No public research abstract has been filed.'}</p>
      </div>
      <dl className="team-metrics">
        <div><dt>Members</dt><dd>{team.memberCount.toLocaleString()}</dd></div>
        <div><dt>XP</dt><dd>{team.totalXp.toLocaleString()}</dd></div>
        <div><dt>Contributions</dt><dd>{team.totalContributions.toLocaleString()}</dd></div>
      </dl>
      <Link className="team-card-link" to={`/teams/${team.slug}`}>
        View team <ArrowRightIcon aria-hidden="true" />
      </Link>
      {team.archivedAt ? <span className="team-state">Archived</span> : null}
    </article>
  )
}

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string, title: string, copy: string }) {
  return (
    <div className="team-section-heading">
      <div><p className="team-eyebrow">{eyebrow}</p><h2>{title}</h2></div>
      <p>{copy}</p>
    </div>
  )
}

function CreateTeamForm({ onCreated }: { onCreated: (team: TeamDetail) => void }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) setOpen(false)
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [busy, open])

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

  return (
    <>
      <button className="button-primary" type="button" onClick={() => setOpen(true)}>Register a team</button>
      {open ? (
        <div className="team-dialog-backdrop" onMouseDown={() => { if (!busy) setOpen(false) }}>
          <div
            className="team-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-team-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="team-dialog-header">
              <div>
                <p className="team-eyebrow">Research team registry</p>
                <h2 id="create-team-title">Register a research team</h2>
              </div>
              <button
                className="team-dialog-close"
                type="button"
                aria-label="Close team registration"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                <XMarkIcon aria-hidden="true" />
              </button>
            </div>
            <form className="team-form team-create-form" onSubmit={submit}>
              {error ? <ErrorNotice message={error} /> : null}
              <label>Team name<input autoFocus required minLength={2} maxLength={80} name="name" autoComplete="organization" /></label>
              <label>Registry slug<input required pattern="[a-z0-9-]+" maxLength={64} name="slug" placeholder="symbolic-systems-lab" /></label>
              <label>Public abstract<textarea maxLength={500} name="description" rows={3} /></label>
              <label>Visibility<select name="visibility" defaultValue="public"><option value="public">Public</option><option value="private">Private</option></select></label>
              <div className="team-actions">
                <button className="button-primary" disabled={busy}>{busy ? 'Registering…' : 'Create team'}</button>
                <button className="button-secondary" type="button" disabled={busy} onClick={() => setOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
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
    <section className="team-page team-directory-page">
      <header className="team-hero team-directory-hero">
        <div className="team-hero-copy">
          <div className="team-hero-badge"><SparklesIcon aria-hidden="true" /> Collaborative research registry</div>
          <h1>Research,<br /><span>together.</span></h1>
          <p>Build a shared SIT identity, combine verified contributions and move up the global research rankings.</p>
          <div className="team-hero-actions">
            {status === 'authenticated'
              ? <CreateTeamForm onCreated={(team) => navigate(`/teams/${team.slug}/workspace`)} />
              : <Link className="button-primary" to="/profile">Create your team <ArrowRightIcon aria-hidden="true" /></Link>}
            <a className="team-text-link" href="#team-directory">Explore teams <ArrowRightIcon aria-hidden="true" /></a>
          </div>
          <div className="team-hero-proof" aria-label="Team platform benefits">
            <span><ShieldCheckIcon aria-hidden="true" /> Core-authorized</span>
            <span><BoltIcon aria-hidden="true" /> Live totals</span>
            <span><GlobeAltIcon aria-hidden="true" /> Public rankings</span>
          </div>
        </div>
        <div className="team-protocol-card" aria-label="Research team protocol summary">
          <div className="team-protocol-chrome"><span><i aria-hidden="true" /> TEAM PROTOCOL</span><small>CORE: ONLINE</small></div>
          <div className="team-protocol-mark"><UserGroupIcon aria-hidden="true" /><span>67</span></div>
          <div className="team-protocol-copy"><p>Shared workspace</p><strong>One identity.<br />Every contribution.</strong></div>
          <div className="team-protocol-grid">
            <span><small>IDENTITY</small><strong>Canonical</strong></span>
            <span><small>PROGRESS</small><strong>Verified</strong></span>
            <span><small>RANKING</small><strong>Global</strong></span>
          </div>
        </div>
      </header>
      {error ? <ErrorNotice message={error} /> : null}
      {leaders.length ? <section className="team-section team-leaderboard-section" aria-labelledby="leaderboard-title"><SectionHeading eyebrow="Global standings" title="Leading research teams" copy="Ranked by verified XP and contributions recorded by SIT Core." /><div className="team-grid team-leader-grid">{leaders.map((team, index) => <TeamCard key={team.id} team={team} rank={index + 1} />)}</div></section> : null}
      <section id="team-directory" className="team-section" aria-labelledby="directory-title">
        <SectionHeading eyebrow="Open registry" title="Find your collaborators" copy="Explore public teams, their focus and the researchers moving the standard forward." />
        {teams.length
          ? <div className="team-grid team-directory-grid">{teams.map((team) => <TeamCard key={team.id} team={team} />)}</div>
          : <div className="team-empty-state"><span><UserGroupIcon aria-hidden="true" /></span><div><h3>The registry is ready</h3><p>Public teams will appear here as soon as SIT Core publishes them.</p></div></div>}
      </section>
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
    <section className="team-page team-workspace-page">
      <header className="team-hero team-workspace-hero"><p className="team-eyebrow">Authenticated team workspace</p><h1>{team.name}</h1><p>Permissions below are supplied by SIT Core for your canonical researcher identity.</p></header>
      {error ? <ErrorNotice message={error} /> : null}
      {message ? <div className="team-notice" role="status">{message}</div> : null}
      <div className={`team-workspace-grid${team.permissions.editTeam ? '' : ' team-workspace-grid-single'}`}>
        {team.permissions.editTeam ? <form className="team-form team-workspace-settings" onSubmit={saveSettings}><h2>Registry settings</h2><label>Name<input name="name" defaultValue={team.name} required /></label><label>Slug<input name="slug" defaultValue={team.slug} required /></label><label>Description<textarea name="description" defaultValue={team.description} /></label><label>Visibility<select name="visibility" defaultValue={team.visibility}><option value="public">Public</option><option value="private">Private</option></select></label><button className="button-primary">Save settings</button></form> : null}
        <div className="team-workspace-rail">
          {team.permissions.inviteMembers ? <section className="team-workspace-panel"><h2>Invite researchers</h2><p>Invitations expire automatically and inherit only the selected backend role.</p><button className="button-secondary" onClick={() => void createTeamInvite(team.id, 'member', 72).then(setInvite).catch((caught) => setError(caught.message))}>Create 72-hour invite</button>{invite ? <div className="invite-box"><code>{invite.inviteUrl ?? `${window.location.origin}${window.location.pathname}#/team-invites/${invite.token}`}</code><button onClick={() => void navigator.clipboard.writeText(invite.inviteUrl ?? `${window.location.origin}${window.location.pathname}#/team-invites/${invite.token}`)}>Copy</button></div> : null}</section> : null}
          <section className="team-workspace-panel"><h2>Members</h2><div className="member-list">{members.map((member) => <div className="member-row" key={member.researcherId}><div><strong>{member.displayName}</strong><small>{member.role} · {member.contributions.toLocaleString()} contributions</small></div><MemberControls team={team} member={member} onChanged={load} /></div>)}</div></section>
          <div className="team-danger-zone">
            {team.permissions.leaveTeam ? <button className="danger-button" onClick={() => { if (window.confirm(`Leave ${team.name}?`)) void leaveTeam(team.id).then(() => navigate('/teams')) }}>Leave team</button> : null}
            {team.permissions.archiveTeam ? <button className="danger-button" onClick={() => { if (window.confirm(`Archive ${team.name}? This removes it from active discovery.`)) void archiveTeam(team.id).then(() => navigate(`/teams/${team.slug}`)) }}>Archive team</button> : null}
          </div>
        </div>
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
