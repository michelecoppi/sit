# Security Policy

## Reporting a Legacy Vulnerability

The SIT Standard is primarily a static browser app, but it can optionally
integrate with SIT Core through `VITE_API_URL` for authentication and profile
lookup features. Report anything security-relevant anyway (XSS, dependency
CVEs, token handling, OAuth flow issues, API integration risks, build pipeline
issues) via a
[private security advisory](../../security/advisories/new) on this repo.
Do not open a public issue for it.

## Scope

Security reports are especially useful for:

- Client-side XSS or injection vectors.
- Unsafe handling of auth tokens in browser storage or URL parameters.
- API misuse, CORS misconfiguration assumptions, or insecure transport usage
  when `VITE_API_URL` is configured.
- Dependency and supply-chain vulnerabilities.
- CI/CD and deployment pipeline weaknesses.

When reporting API-related issues, include the endpoint, expected behavior,
observed behavior, and whether the issue occurs only with SIT Core enabled.

## Response

The Working Group meets every 67 days and no meeting has ever ended on
time. Security reports are the exception â€” expect a response within a few
days, not a fiscal quarter.

## Updating Reusable Workflows

Reusable workflows from other repositories must be pinned to a full, 40-character
commit SHA. Branches and tags are mutable and must not be used as workflow refs.

To update a pinned workflow:

1. Review the upstream changes and select a trusted commit from the upstream
   repository's commit history.
2. Verify that the commit contains the expected reusable workflow, then copy its
   full SHA from GitHub.
3. Replace only the SHA after `@` in the caller workflow. Keep the abbreviated
   SHA in the adjacent comment in sync for readability.
4. Open a pull request containing the pin update and review the resulting diff.
5. Run the caller with `workflow_dispatch` and confirm that the expected upstream
   commit is used and the sync job succeeds before merging.

Search `.github/workflows` for job-level `uses:` entries as part of each update
to ensure that no reusable workflow reference uses a branch or tag.

## Supported Versions

| Version | Supported |
|---------|-----------|
| SIT 2.0 (Native) | Yes |
| SIT 1.0 (Legacy) | Yes |
| Binary | Legacy, patched only if trivial |
| ASCII | Transitional technology, not our problem |

