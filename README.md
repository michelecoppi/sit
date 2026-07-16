# SIT Standard

SIT is a fictional but convincing encoding standard designed as a polished parody of technical specifications. The project presents itself as a serious international standard, but its real charm lies in the deliberate absurdity of the {6,7} alphabet and the ceremonious tone of the documentation.

## What SIT is

SIT stands for Symbolic Information Token. It is a browser-based encoding system built around a minimal alphabet:

- `6` represents binary `0`
- `7` represents binary `1`

This means a standard byte such as `01000011` becomes:

```text
01000011
↓
67666677
```

The reverse mapping works the same way.

## Features

The website includes:

- a polished landing page inspired by standards bodies
- documentation styled like an IEEE-style technical paper
- an interactive playground with:
  - encoder
  - decoder
  - binary converter
  - compliance checker
- a roadmap page for the fictional ecosystem
- an RFC-style page for RFC-0001
- lightweight animations and a responsive layout
- dark mode support

## How it works

### Encoding

Text is converted to ASCII or UTF-8 bytes, then each bit is transformed:

- `0` → `6`
- `1` → `7`

### Decoding

A SIT token is converted back by reversing the mapping:

- `6` → `0`
- `7` → `1`

### Compliance

A valid SIT payload may contain:

- `6`
- `7`
- space
- newline

Any other character generates an error.

## Project structure

- `src/components` – shared UI layout and navigation
- `src/pages` – home, docs, playground, roadmap, about, RFC pages
- `src/utils` – encoding, decoding, binary conversion, and validation helpers
- `src/App.tsx` – routing setup
- `src/index.css` – Tailwind and base styling

## Tech stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Framer Motion
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

## Notes

SIT is intentionally a parody, but the site is designed to look credible at first glance. The experience is meant to feel like a real technical standard before the underlying joke becomes clear.
