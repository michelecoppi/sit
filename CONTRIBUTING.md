# Contributing to the SIT Standard

The International SIT Consortium accepts external contributions. Read
[LORE.md](LORE.md) before writing any copy — new material must fit the
existing canon, not contradict it.

## Setup

```bash
npm install
npm run dev      # vite dev server
```

## Before opening a PR

```bash
npm run build    # tsc -b && vite build — must pass
npm test         # vitest run
npm run lint     # oxlint
```

## Conventions

- Single quotes and 2-space indent — match existing files.
- Avoid statement-ending semicolons in app code; keep surrounding file style
  when editing TypeScript types/interfaces.
- Encoding logic (the `6`/`7` mapping, grouping, validation) lives in
  `src/utils/`, framework-free, and needs a test. Don't put standard logic in
  components.
- New route → lazy import in `src/App.tsx`.
- Don't add a dependency for what a few lines of code can do.

## API Integration Notes

- This project works in standalone mode by default.
- Optional SIT Core integration is enabled via `VITE_API_URL`.
- If you touch profile/auth flows (`src/App.tsx` and `src/pages/ProfilePage.tsx`),
  ensure behavior is correct both with and without `VITE_API_URL` configured.
- Do not log, commit, or expose real auth tokens in code, tests, screenshots,
  or issues.

## Testing Expectations

- UI/route changes should include or update relevant tests when practical.
- Changes to API-dependent behavior should validate graceful fallback behavior
  when API is unavailable.

## Tone

This is a parody of a real standards body. Copy should read as a legitimate
spec first and reveal the joke only on closer reading. Keep RFCs, lore and
UI copy deadpan — no winking at the reader, no "lol" energy. When in doubt,
prefer the driest version of the joke.

The word "byte" should almost never appear. Use "SYTE" instead.

## Reporting bugs / proposing features

Use the issue templates. Bug reports and Standard proposals (new RFCs,
alphabet changes, grammar changes) are triaged differently — say which one
you're filing.

## Branching

Fork the repo, branch off `master`, open a PR against `master`. Never push
directly to `master` — `deploy.yml` ships to GitHub Pages on every push to
it.
