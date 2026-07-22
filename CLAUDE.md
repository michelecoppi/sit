# CLAUDE.md

Guidance for Claude Code working in this repo.

## What this is

**SIT Standard** — a fictional encoding standard presented as a polished parody of a real
standards body (IEEE/ISO/RFC/W3C vibe). It's a real, working React SPA, no backend, everything
runs in the browser. The joke: `0`→`6`, `1`→`7`, so binary `01000011` becomes SIT `67666677`.
A "SYTE" is 8 SIT symbols (the parody's "byte").

Keep the bit intact: the site should read as a legitimate standard first, reveal the satire only
on closer reading. Match that deadpan tone in copy, RFCs and lore. See `LORE.md` for the fictional
canon (timeline, org names, quotes, RFC list) — reuse it, don't contradict it. Specs:
`SPECIFICATION.md` (SIT 1.0) and `SPECIFICATION_2.md` (SIT 2.0 native).

## ⚠️ Deploy on push to master

`.github/workflows/deploy.yml` runs on **push to `master`** → builds → deploys to GitHub Pages.
Any push to `master` is outward-facing and hard to reverse. Never push to `master`; use a feature
branch. Push only on explicit request.

## Commands

```bash
npm run dev      # vite dev server
npm run build    # tsc -b && vite build  (run before claiming a build works)
npm test         # vitest run
npm run lint     # oxlint
```

Tests are colocated `*.test.ts(x)` (vitest + jsdom + Testing Library, globals on). Config lives in
`vite.config.ts` (single file, also holds the vitest `test` block).

## Architecture

- `src/App.tsx` — **HashRouter** (GitHub Pages, no server rewrites), all routes, lazy-loaded pages.
- `src/utils/` — pure encoding logic, framework-free. `encoder.ts` `decoder.ts` `binary.ts`
  `ascii.ts` `validator.ts` `batch.ts`. **This is where the standard is defined** — the `6`/`7`
  mapping and grouping-in-fours live here. Change logic here, not in components. Tested.
- `src/data/native.ts` — SIT 2.0 native alphabet / dictionary / semantic registry (fictional data).
- `src/pages/` — one file per route; SIT 2.0 native pages are all in `NativePages.tsx`.
- `src/components/` — `Layout.tsx` (nav/footer), `AlphabetTable`, `DictionarySearch`, `GrammarCard`.
- `src/index.css` — Tailwind v4 theme + `native-*` styles + dark mode (follows system).

## Conventions

- No semicolons, single quotes, 2-space indent — match existing files.
- Stack: React 19, TS (strict), Vite, Tailwind v4 (`@tailwindcss/vite`), React Router 7, Framer
  Motion, Heroicons. Don't add deps for what a few lines do.
- `base` path is set automatically from `GITHUB_REPOSITORY` in CI — don't hardcode it.
- New encoding behavior → add to `src/utils/` **with a test**. New route → lazy import in `App.tsx`.
