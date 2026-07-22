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
time. Security reports are the exception — expect a response within a few
days, not a fiscal quarter.

## Supported Versions

| Version | Supported |
|---------|-----------|
| SIT 2.0 (Native) | Yes |
| SIT 1.0 (Legacy) | Yes |
| Binary | Legacy, patched only if trivial |
| ASCII | Transitional technology, not our problem |
