# SERVICES LAYER

The **only** place that talks to the backend. Components must never call `fetch`/`axios` directly.

## FILES

| File | Size | Endpoints / Storage | Role |
|------|------|---------------------|------|
| `songService.ts` | 15.2KB | `GET /api/songs`, `/api/songs/:id`, `/api/songs/hot` + 12 hardcoded fallback songs | Song search + offline library |
| `exportService.ts` | 5.2KB | (client-side only) | TXT / LRC (timed) / LRC (plain) / HTML export via Blob |
| `authService.ts` | 3.9KB | `POST /api/auth/{register,login,refresh}`, `GET /api/auth/me` | JWT token storage in localStorage |
| `rhymeService.ts` | — | (client-side only) | pinyin-based rhyme check (`checkRyme`, `getLastCharPinyin`, `extractYunmu`, `isPing`, `isZe`) |
| `rhymeLibrary.ts` | 3.9KB | (static data) | 6 yunmu categories × ~10 words each |
| `lyricService.ts` | — | localStorage | Lyric parsing utilities |
| `versionService.ts` | — | localStorage + `GET/POST/DELETE /api/versions` | Version persistence, index management |

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Add new API endpoint | Pick or create service file | Components import the function, not the URL |
| Change response shape | The service file that owns the endpoint | Service normalizes backend response into frontend types |
| Modify offline fallback songs | `songService.ts` | Hardcoded 12-song list, used when backend unreachable |
| Add export format | `exportService.ts` | Use `Blob` + `URL.createObjectURL` |
| Change rhyme word library | `rhymeLibrary.ts` | Add to existing yunmu or add new category |
| Tune rhyme rules | `rhymeService.ts` | Pure functions, no state |
| Token refresh logic | `authService.ts` | Uses `lyriclab_access_token` / `lyriclab_refresh_token` in localStorage |

## CONVENTIONS

- All service functions return `Promise<T>` or sync `T`. Async services throw on HTTP error.
- API errors are caught and converted to user-friendly toasts in components, NOT re-thrown as raw `Error`.
- Token attach: `authService` adds `Authorization: Bearer <token>` for authed requests. Unauthed endpoints (search) skip it.
- localStorage keys are namespaced with `lyriclab_` prefix.
- **localStorage keys in use**:
  - `lyriclab_access_token`, `lyriclab_refresh_token`, `lyriclab_user` (auth)
  - `lyriclab_autosave` (current editor state, debounced 2s)
  - `lyriclab_version_{timestamp}` (version snapshots)
  - `lyriclab_version_index` (version metadata index)

## GOTCHAS

- `songService.ts` is 15KB because it ships **12 hardcoded fallback songs**. Editor works fully offline; tests don't need backend.
- `authService` reads tokens from localStorage on every request — no in-memory cache, which means a fresh tab always re-attaches.
- `versionService` does **dual storage**: localStorage always works, cloud sync (via `/api/versions`) only for authed users. Auth-gating is in the service, not the component.
- `rhymeService` uses `pinyin-pro`'s `pinyin()` which returns array — last char is `lines[lines.length - 1]`. Multi-char punctuation (e.g. `？`) breaks the assumption.
- `exportService` for LRC with timestamps uses **fixed 5s intervals** starting at 00:00.00 — not actual song timing. Adequate for placeholder, not production.
- `lyricService` is a misnomer — it's primarily a text parser, not an API service. The actual lyric CRUD goes through `versionService` / `songService`.
