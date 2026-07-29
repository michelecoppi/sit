# SIT Core API contract

The optional `VITE_API_URL` integration targets the OpenAPI document published
by SIT Core at `/api/docs`. The frontend deliberately uses cookie sessions
(`credentials: 'include'`) and never reads or stores a JWT.

## Verified client operations

| Frontend service | SIT Core endpoints | Contract checked |
| --- | --- | --- |
| `authService` | `POST /api/auth/login-ticket`, `GET /api/auth/login-status`, `POST /api/auth/logout`, `GET /api/oauth/discord/login` | Telegram tickets contain `ticket`, `loginUrl`, and `expiresAt`; the status response is one of `PENDING`, `COMPLETED`, `EXPIRED`, or `USED`. |
| `profileService` | `GET /api/me`, `GET /api/profile/statistics`, `GET /api/statistics`, `GET /api/statistics/snapshot` | Statistics are non-negative integers and timestamps are valid ISO dates. |
| `accountService` | `GET /api/account/providers`, `POST /api/account/link` | The UI supports the backend's linkable Discord and Telegram providers and preserves the temporary code/OAuth URL response. |
| `missionService` | `GET /api/missions/dashboard`, `GET /api/missions/history` | The dashboard combines active missions, rotation and streak in one request. A `404` fallback keeps compatibility with older Core deployments by calling `GET /api/missions` and `GET /api/missions/streak`. Requests are authenticated and cursor values are URL encoded. |
| `capsuleService` | `/api/capsules*` | Create, list, update, revoke, and safe public-resolution request and response shapes are parsed before rendering. |
| `teamService` | `/api/teams*`, `/api/team-invites*` | Team mutations, owner/admin/member/viewer authorization, membership operations, invitations, and cursor pagination match the documented route parameters. |
| `workspaceService` | `/api/teams/{teamId}/missions*`, `/api/teams/{teamId}/capsules*` | Mission creation sends an activity metric, target and optional real team member, but never difficulty, XP or a due date. A blank assignee means the creator. Core derives difficulty and `teamXpReward`, closes the mission at the next UTC midnight, enforces the single daily slot, and awards Team XP once on completion. Mission progress sends an idempotency key and consumes individual/aggregate state. Mission and capsule writes send `expectedRevision`; 409 conflicts remain distinct from transport failures so the UI can reload. |
| `teamService` progression | `/api/teams*` | Team summaries and details expose Team XP, derived level, current/next thresholds, unlocks, daily mission availability and Core-calculated activity/target reward bands. The UI treats this payload as authoritative for derived difficulty gates and level presentation. |
| `labService` | `GET /api/lab/presets`, `POST /api/lab/run` | Lab results are contract version `1`, deterministic for equal input/version, include steps plus rule-linked errors, and group presets into `easy`, `medium`, and `hard`. |
| `nativeProtocolService` | `GET /api/native/registry`, `GET /api/native/dictionary`, `POST /api/native/encode`, `POST /api/native/decode`, `POST /api/native/validate` | The UI consumes registry version/checksum, the 2.0/2.1 capability matrix and structured errors (`code`, `position`, `suggestion`). HTTP 422 remains a typed validation result; transport failures activate the read-only local cache. |

The contract is exercised by the service tests. When SIT Core changes its
OpenAPI contract, update the relevant parser, test fixture, and this table in
the same change.

