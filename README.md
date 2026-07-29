# SIT Standard

SIT is a fictional encoding standard designed as a polished parody of technical specifications. The site is built to look like a serious standards body while showcasing a live browser-based implementation of the protocol.

## What SIT is

SIT stands for Symbolic Information Token. The core encoding rule is:

- `6` represents binary `0`
- `7` represents binary `1`

A byte such as `01000011` becomes:

```text
01000011
↓
67666677
```

## Editions

- **SIT 1.0 (Legacy)**: text → UTF-8 bytes → binary → SIT symbols. Supported in the playground hub.
- **SIT 2.0 (Native)**: semantic tokens and concept-first encoding with an official SIT alphabet, grammar, dictionary and explorer.

## Features

The website includes:

- Home page with overview, features and example output
- Documentation page describing the standard and implementation details
- Playground hub with two editions:
  - SIT 1.0 legacy encoder, decoder, binary converter, batch packaging and compliance checker
  - SIT 2.0 native semantic playground with encoder, decoder and concept explorer
- About page with history, working group and initiative details
- RFC registry page listing SIT documents
- Roadmap page with completed milestones and future work
- Native section with alphabet, grammar, dictionary, semantic engine and explorer pages
- Dark mode, responsive layout and animated UI transitions

## How it works

### Encoding

Text is encoded as UTF-8 bytes, then each byte is converted to an 8-bit binary string and mapped into SIT symbols:

- `0` → `6`
- `1` → `7`

SIT bytes are grouped into rows of four for readability.

### Decoding

SIT payloads are split into whitespace-separated 8-symbol blocks, validated for the alphabet, converted back to binary and decoded as UTF-8 text.

### Binary conversion

The playground supports direct conversion of raw binary to SIT and SIT back to binary.

### Batch mode

KiloSYTE batch mode encodes multiple lines of text into structured SIT blocks and decodes them back into separate output lines.

### Native mode

SIT 2.0 introduces a native registry of semantic tokens, a symbolic grammar, a dictionary lookup and a semantic engine for concept-driven encoding.
With `VITE_API_URL` configured, the workspace loads the canonical registry,
checksum, supported versions and capability matrix from SIT Core. The selected
version controls encode/decode features; canonical decode is enabled only when
the server advertises it. If Core is unavailable, the bundled registry remains
available as a clearly labelled read-only cache.

### Compliance

A valid SIT payload may contain only:

- `6`
- `7`
- spaces
- newlines

Any other character is considered non-compliant.

## Project structure

- `src/components` – layout, navigation and shared UI components
- `src/pages` – home, documentation, playground, roadmap, about, RFC pages and SIT 2.0 native pages
- `src/utils` – text encoding, decoding, binary conversion, batch packaging and validation helpers
- `src/data` – native token registry and semantic mappings
- `src/App.tsx` – navigation and route definitions
- `src/index.css` – Tailwind theme, native styling and responsive utilities

## Tech stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Heroicons

## Run locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Documentation and contribution workflow

The interactive reference is available at `/docs` and covers the standard,
implementation, ecosystem and contributor workflow. Normative material lives
in `SPECIFICATION.md`, `SPECIFICATION_2.md` and the RFC registry.

Documentation is maintained with the code: changes to behavior, routes, APIs,
configuration, architecture or workflow must update the relevant documentation
in the same pull request. See [CONTRIBUTING.md](CONTRIBUTING.md) and
[AGENTS.md](AGENTS.md) for the checklist used by human and coding-agent
contributors.

## Optional SIT Core integration

Set `VITE_API_URL` to enable the live SIT Core integration. The frontend uses
the backend OpenAPI contract and HttpOnly cookie sessions; the verified endpoint
mapping is maintained in [docs/API_CONTRACT.md](docs/API_CONTRACT.md).

Native validation errors preserve the server-provided code, token position and
suggestion, and their JSON payload can be copied for reproducible reports.

Authenticated team workspaces combine four Core-authoritative areas: member
roles and invitations, assigned mission progress, versioned capsule drafts and
publication. Owner/admin controls are rendered only from the permission matrix
returned by Core; members can contribute, while viewers remain read-only.
Mission updates use optimistic UI with rollback. Capsule edits send the current
revision and surface a reload action when Core reports a 409 conflict.

The team experience uses responsive Tailwind layouts and explicit light/dark
form colors so native selects remain readable across browsers. Team missions
are limited to one creation per UTC day and end automatically at the next UTC
midnight. Administrators select an activity, a target and up to the
Core-published number of real team members. The limit starts at five, grows
with the team level and caps at ten; no selection assigns only the creator.
Core derives difficulty and collaboration-adjusted Team XP from the same
activity bands used by personal missions. Completion awards Team XP once,
drives the team level, and
progressively unlocks advanced/critical targets plus visual team treatments.
The target control uses Core-published minimums: 3 encoded messages, 3 decoded
messages or 64 processed SYTE.

## Notes

This project is intentionally playful, but it is implemented as a real web app with working encoding tools and a complete front-end experience.

