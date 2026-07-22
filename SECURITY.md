# Security Policy

## Reporting a Legacy Vulnerability

The SIT Standard has no backend, no auth, no database and no network calls —
it's a static browser encoder/decoder. Report anything security-relevant
anyway (XSS, dependency CVEs, build pipeline issues) via a
[private security advisory](../../security/advisories/new) on this repo.
Do not open a public issue for it.

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
