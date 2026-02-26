# StudySpace

A customizable study environment web app with ambient sounds, note-taking, learning outcome tracking, and coverage analytics.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS v4
- **Icons**: Lucide React
- **Routing**: React Router v7
- **Backend** (planned): Cloudflare Workers + Hono.js
- **Database** (planned): Cloudflare D1 (SQLite)
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

### Planned
- [ ] Cloudflare D1 backend (replace localStorage)
- [ ] File upload to R2 (PDF/CSV)
- [ ] Workers AI: auto-extract LOs from documents
- [ ] Workers AI: auto-suggest note-to-LO links
- [ ] Workers AI: gap analysis feedback
- [ ] Deploy to Cloudflare Pages
- [ ] Audio files for ambiance mixer

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
  components/    - Reusable UI components (Layout, AmbiancePlayer, NoteEditor)
  pages/         - Route pages (StudySpace, Notes, LearningOutcomes, Dashboard)
  store/         - State management hooks (useNotes, useLearningOutcomes, useAmbiance)
  types/         - TypeScript interfaces
public/
  audio/         - Ambiance sound files (to be added)
```

## Progress Log

- **2026-02-27**: Phase 1 complete - Full frontend scaffold with all 4 pages, ambiance mixer, note editor with LO linking, coverage dashboard with gap feedback.
