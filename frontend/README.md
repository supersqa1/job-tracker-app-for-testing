# SuperSQA Job Tracker Frontend

Next.js frontend for the job application tracker, styled with the Aura Executive design system.

See [docs/DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md) for UI rules and tokens.

## Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

## Run

```bash
npm run dev
```

App: http://localhost:8050

Requires the backend API running at `NEXT_PUBLIC_API_URL` (default `http://localhost:3050`).

## Structure

```
src/
  app/              # Next.js App Router pages
  components/
    applications/   # Kanban board, cards
    layout/         # Shell, nav, footer
    ui/             # Reusable design-system primitives
  lib/              # API client, types, constants
```
