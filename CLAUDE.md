# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LyricLab is a full-stack lyric adaptation web application. Users import songs, edit lyrics character-by-character with rhyme detection, manage versions, and export in multiple formats.

Monorepo with two independent packages (no monorepo tool) — each has its own `package.json` and `node_modules`:
- `frontend/` — React 18 + Vite + Zustand + Tailwind CSS
- `server/` — Express + TypeScript + Prisma ORM + PostgreSQL

## Development Commands

### Frontend (`frontend/`)
```bash
npm run dev       # Dev server at http://localhost:5173
npm run build     # tsc && vite build
npm run preview   # Preview production build
```
Vite proxies `/api` → `http://localhost:3001` (no CORS issues in dev).

### Backend (`server/`)
```bash
npm run dev         # tsx watch src/app.ts on :3001
npm run build       # tsc → dist/
npm run start       # node dist/app.js (production)
npm run db:migrate  # prisma migrate dev
npm run db:seed     # tsx src/db/seed.ts (optional sample data)
```
**Order matters on first run**: `db:migrate` → start server.

### Database
PostgreSQL 14. Use the included `docker-compose.yml` (db: `lyric_lab`, user/pass: `postgres`/`123456`), or any local Postgres. Configure `server/.env` from `.env.example` (the included `.env` is committed and points at the docker-compose default).

## Module Systems

| Package  | Module system | tsconfig `module` |
|----------|---------------|-------------------|
| frontend | ESM (`"type": "module"`) | `ESNext` |
| server   | CommonJS (default) | `CommonJS` |

**Do not mix ESM/CJS syntax between packages.** Backend uses `require()`-style imports under the hood (`tsx` handles it).

## TypeScript Quirks

### Frontend
- `@/` path alias maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`). **Always use `@/` imports** — never relative paths like `../../services/`.
- `noUnusedLocals: true`, `noUnusedParameters: true` — TS6133 errors **fail the build**. Clean up unused imports/vars as you go.
- Strict mode enabled.

### Backend
- Standard CommonJS TypeScript. No path aliases.

## Architecture

### Frontend (`frontend/src/`)
- **State**: Zustand stores — `store/editorStore.ts` (editor, undo/redo) and `store/authStore.ts` (auth).
- **Services**: `services/*.ts` handles all API calls. **Components never call `fetch` directly.**
- **Editor**: Character-level — `CharBox` (single char input + drag-drop) inside `LineEditor` in `components/editor/LyricEditor.tsx`.
- **Components**: grouped by feature — `editor/`, `import/`, `export/`, `version/`, `preview/`, `auth/`, `common/`.
- **Types**: shared interfaces in `types.ts` (`Song`, `LyricLine`, `LyricSection`).

### Backend (`server/src/`)
- `routes/` — Express route handlers (auth, songs, versions)
- `services/` — Business logic
- `middleware/` — Auth middleware (JWT)
- `crawler/` — Scheduled lyric crawling (scheduled on boot, `node-cron`, default daily 2 AM via `CRAWL_INTERVAL` env)
- `db/` — Prisma schema and seed data
- `lib/` — Shared utilities (e.g. `AppError`, `apiResponse`)

## Data Model

`LyricLine` has two text fields:
- `text` — original lyrics (read-only reference)
- `adaptedText` — user's adapted lyrics (editable, stored separately)

**Always use `adaptedText` for user edits.** Rhyme detection and character counting run against `adaptedText` when present, falling back to `text` (i.e. `line.adaptedText ?? line.text`).

Schema: `server/prisma/schema.prisma` (User, Song, Lyric, Version). Prisma migrations are gitignored — always regenerate via `npx prisma migrate dev`.

## Rhyme Detection

Uses `pinyin-pro` library. Key functions in `frontend/src/services/rhymeService.ts`:
- `checkRhyme(line, rule, textToCheck?)` — checks last character against rule
- `getLastCharPinyin(text)` — extracts pinyin from final character
- `extractYunmu`, `isPing`, `isZe` — categorize pinyin properties

Rules: `none` | `yunmu` (specify value like `"ang"`) | `ping` (tones 1-2) | `ze` (tones 3-4).

Rhyme word library at `frontend/src/services/rhymeLibrary.ts` — 6 yunmu categories (ang, i, u, ai, ei, ou), ~10 words each.

## Character Counting

`frontend/src/utils/charCount.ts`: Chinese chars, numbers, English letters → 1 each. Punctuation → 0.

## Editor Persistence & Auth

- **Undo/redo**: Stack capped at **50 entries** in `editorStore`.
- **Auto-save**: Debounced 2s, key `lyriclab_autosave` in localStorage.
- **Auth tokens**: In localStorage (`lyriclab_access_token`, `lyriclab_refresh_token`, `lyriclab_user`) — **NOT httpOnly cookies**.
- **Offline mode**: 12 fallback songs hardcoded in `services/songService.ts`; editor fully works without backend.

## Z-Index Stacking

| Element | Z-index |
|---------|---------|
| Modal   | 60      |
| Onboarding | 55   |
| Toast   | 50      |
| Mobile nav | 30  |
| Header  | 20      |

## API Conventions (server)

Response format:
```json
// Success
{ "code": 0, "data": { ... } }
// Error
{ "code": 400, "message": "..." }
```

Error handling: `AppError` class (extends Error with `statusCode`) thrown anywhere → global error middleware catches it.

Auth middleware: `authMiddleware` (required) and `optionalAuthMiddleware` (attaches `req.user` if token present, continues otherwise). Both parse `Authorization: Bearer <token>`.

## Tailwind

Custom theme: `primary-50..900` (blue slate) + `accent-50..900` (purple). Fonts: Inter (sans) + JetBrains Mono (mono). Custom animations `fade-in`/`slide-in`/`scale-in` defined in `tailwind.config.js`. **Avoid adding `animate-scale-in`/`animate-fade-in` to dropdown containers** — known animation issues.

## No Tests

Zero test files, no Jest/Vitest config. Do not look for test runners or suggest adding tests unless asked.

## Notes

- Server starts the crawler scheduler on boot. Disable by unsetting `CRAWL_INTERVAL` or commenting out the boot call in `src/app.ts`.
- `.env` files are gitignored but a working `.env` is committed pointing at the docker-compose database.
- `dist/`, `node_modules/`, and `prisma/migrations/` are gitignored.
