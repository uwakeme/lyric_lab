# LyricLab - AGENTS.md

Full-stack lyric adaptation web app. React+TS+Vite frontend, Express+Prisma+PostgreSQL backend.

## Project structure

Monorepo with two independent packages (no monorepo tool):

- `frontend/` — React 18 + Vite + Zustand + Tailwind CSS
- `server/` — Express + TypeScript + Prisma ORM + PostgreSQL

Each has its own `package.json` and `node_modules`.

## Development commands

### Frontend (`frontend/`)

```bash
npm run dev       # Dev server at http://localhost:5173
npm run build     # tsc && vite build
```

Vite proxies `/api` → `http://localhost:3001`. No CORS issues in dev.

### Backend (`server/`)

```bash
npm run dev         # tsx watch src/app.ts on :3001
npm run build       # tsc → CommonJS output to dist/
npx prisma migrate dev   # Required before first run
npx tsx src/db/seed.ts   # Optional: seed sample songs
```

**Order matters**: `prisma migrate dev` → start server.

## Module systems

| Package  | Module system | tsconfig `module` |
|----------|--------------|-------------------|
| frontend | ESM (`"type": "module"`) | `ESNext` |
| server   | CommonJS (default) | `CommonJS` |

**Do not mix ESM/CJS syntax between packages.** Backend uses `require()`-style imports under the hood (tsx handles it).

## TypeScript quirks

### Frontend
- `@/` path alias maps to `src/` (configured in both vite and tsconfig). Always use `@/` imports, never relative paths like `../../services/`.
- `noUnusedLocals: true`, `noUnusedParameters: true` — TS6133 errors on unused vars. Clean up unused imports/vars; they fail the build.
- Strict mode enabled.

### Backend
- Standard CommonJS TypeScript. No path aliases.
- Uses `tsx` (not ts-node) for dev execution.

## Data model key point

`LyricLine` has two text fields:
- `text` — original lyrics (read-only reference)
- `adaptedText` — user's adapted lyrics (editable)

**Always use `adaptedText` when reading/writing user edits.** Fallback: `line.adaptedText ?? line.text`.

## Frontend architecture

- **State**: Zustand stores at `src/store/editorStore.ts` (editor) and `src/store/authStore.ts` (auth)
- **Services**: `src/services/*.ts` handles all API calls — components never call `fetch` directly
- **Editor**: Character-level with `CharBox` (single char input + drag-drop) inside `LineEditor`
- **Undo/Redo**: Stack capped at **50 entries** in editorStore
- **Auto-save**: Debounced 2 seconds, key `lyriclab_autosave` in localStorage
- **Auth tokens**: Stored in localStorage (`lyriclab_access_token`, `lyriclab_refresh_token`, `lyriclab_user`) — NOT httpOnly cookies
- **Offline**: 12 fallback songs hardcoded in `src/services/songService.ts`, editor fully works without backend

## Rhyme detection

Uses `pinyin-pro` library. Key functions in `src/services/rhymeService.ts`:
- `checkRhyme(line, rule, textToCheck?)` — checks last character against rule
- `getLastCharPinyin(text)` — extracts pinyin from final character
- `extractYunmu`, `isPing`, `isZe` — categorize pinyin properties

Rules: `none` | `yunmu` (specify value like `"ang"`) | `ping` (tones 1-2) | `ze` (tones 3-4).

Rhyme word library at `src/services/rhymeLibrary.ts` — 6 yunmu categories (ang, i, u, ai, ei, ou), 10 words each.

## Character counting

`src/utils/charCount.ts`: Chinese chars, numbers, English letters → 1 each. Punctuation → 0.

## Z-index stacking

| Element | Z-index |
|---------|---------|
| Modal   | 60      |
| Onboarding | 55   |
| Toast   | 50      |
| Mobile nav | 30  |
| Header  | 20      |

## API conventions (server)

Response format:
```
// Success
{ code: 0, data: { ... } }
// Error
{ code: 400, message: "..." }
```

Error handling uses `AppError` class (extends Error with `statusCode`). Global error handler middleware catches all throws.

Auth middleware: `authMiddleware` (required) and `optionalAuthMiddleware` (attaches `req.user` if token present, continues otherwise). Both parse `Authorization: Bearer <token>`.

## Tailwind CSS

Custom theme colors: `primary-50..900` (blue slate) and `accent-50..900` (purple). Font: Inter (sans) + JetBrains Mono (mono). Custom animations: `fade-in`, `slide-in`, `scale-in` defined in `tailwind.config.js`.

## No tests

Zero test files. No Jest/Vitest configuration. Do not look for test runners.

## Notes

- Prisma migrations are gitignored (`server/prisma/migrations/`). Always regenerate via `npx prisma migrate dev`.
- `.env` files are gitignored. Use `server/.env.example` as template.
- Server starts crawler scheduler on boot (node-cron, default daily at 2 AM). Configure via `CRAWL_INTERVAL` env.
- CSS animations `animate-scale-in`/`animate-fade-in` on dropdown containers had known issues — avoid adding them to dropdown menus.
