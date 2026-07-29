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
| `teamService` | `/api/teams*`, `/api/team-invites*` | Team mutations, membership operations, invitations, and cursor pagination match the documented route parameters. |
| `labService` | `GET /api/lab/presets`, `POST /api/lab/run` | Lab results are contract version `1`, deterministic for equal input/version, include steps plus rule-linked errors, and group presets into `easy`, `medium`, and `hard`. |

The contract is exercised by the service tests. When SIT Core changes its
OpenAPI contract, update the relevant parser, test fixture, and this table in
the same change.

