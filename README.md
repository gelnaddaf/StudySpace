# StudySpace

A customizable study environment web app with ambient sounds, note-taking, learning outcome tracking, and coverage analytics.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS v4
- **Icons**: Lucide React
- **Routing**: React Router v7
- **Backend**: Cloudflare Pages Functions + Hono.js
- **Database**: Cloudflare D1 (SQLite)
- **Storage** (planned): Cloudflare R2
- **AI** (planned): Cloudflare Workers AI

## Features

### Implemented
- [x] Project scaffold (Vite + React + TS + Tailwind)
- [x] Dark study-themed UI with custom color palette
- [x] Sidebar navigation with 4 main sections
- [x] Study Space page with theme selector + focus timer
- [x] Ambiance mixer with 6 sound channels (volume sliders)
- [x] Notes page with markdown editor + search
- [x] Note-to-LO linking panel
- [x] Learning Outcomes CRUD + CSV import
- [x] Dashboard with coverage stats, progress bar, and gap feedback
- [x] LocalStorage persistence for all data
- [x] Cloudflare D1 backend with Hono.js API (notes + LOs CRUD)
- [x] API-first store with localStorage fallback
- [x] D1 migration schema (notes, learning_outcomes, note_lo_links)
- [x] Procedural audio engine (Web Audio API) — all 6 ambient sounds generated in real-time

### Planned
- [ ] File upload to R2 (PDF/CSV)
- [ ] Workers AI: auto-extract LOs from documents
- [ ] Workers AI: auto-suggest note-to-LO links
- [ ] Workers AI: gap analysis feedback
- [ ] Deploy to Cloudflare Pages

## Getting Started

```bash
npm install

# Frontend only (localStorage mode)
npm run dev

# Full stack with D1 backend (run Vite first, then this)
npm run dev          # Terminal 1: starts Vite on port 5173
npm run dev:full     # Terminal 2: wrangler proxies to Vite + provides D1

# Run D1 migration locally
npm run migrate:local
```

## Project Structure

```
src/
  components/    - Reusable UI components (Layout, AmbiancePlayer, NoteEditor)
  pages/         - Route pages (StudySpace, Notes, LearningOutcomes, Dashboard)
  store/         - State management hooks with API + localStorage fallback
  lib/           - API client (fetch wrapper for D1 endpoints)
  types/         - TypeScript interfaces
functions/
  api/           - Cloudflare Pages Functions (Hono.js API routes)
migrations/
  0001_initial.sql - D1 schema (notes, learning_outcomes, note_lo_links)
public/
  audio/         - Ambiance sound files (to be added)
```

## Progress Log

- **2026-02-27**: Phase 1 complete - Full frontend scaffold with all 4 pages, ambiance mixer, note editor with LO linking, coverage dashboard with gap feedback.
- **2026-02-27**: UI overhaul - Glassmorphism, animated backgrounds, gradient accents, dense layouts.
- **2026-02-27**: Phase 2 complete - D1 backend with Hono.js API, CRUD for notes and LOs, many-to-many linking, API-first store with localStorage fallback.
- **2026-02-27**: Phase 3 complete - Procedural audio engine using Web Audio API. Brown noise, rain, fireplace, wind, thunder, birds all synthesized in real-time. No audio files needed.
