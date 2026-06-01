# API ROUTES

Express route handlers, mounted under `/api/*` in `app.ts`.

## ENDPOINTS

| Method | Path | Auth | File | Purpose |
|--------|------|------|------|---------|
| POST | `/api/auth/register` | — | `auth.ts` | email + password → user record |
| POST | `/api/auth/login` | — | `auth.ts` | returns `{accessToken, refreshToken}` |
| POST | `/api/auth/refresh` | — | `auth.ts` | refreshToken → new accessToken |
| GET | `/api/auth/me` | required | `auth.ts` | current user info |
| GET | `/api/songs` | optional | `songs.ts` | `?keyword=&page=&limit=` ILIKE search |
| GET | `/api/songs/hot` | optional | `songs.ts` | homepage recommendations |
| GET | `/api/songs/:id` | optional | `songs.ts` | song + full lyrics |
| GET | `/api/versions` | required | `versions.ts` | user's saved versions |
| POST | `/api/versions` | required | `versions.ts` | create version (songId optional) |
| GET | `/api/versions/:id` | required | `versions.ts` | version detail (JSONB content) |
| DELETE | `/api/versions/:id` | required | `versions.ts` | delete version |
| POST | `/api/crawler/trigger` | required | `app.ts` (inline) | manual crawl trigger |
| GET | `/api/health` | — | `app.ts` (inline) | `{code: 0, status: "ok"}` |

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Add endpoint | `routes/<resource>.ts` + register in `app.ts` | |
| Change auth requirement | Apply `authMiddleware` or `optionalAuthMiddleware` | Two middlewares, pick by use case |
| Add admin-only endpoint | Use `authMiddleware` (no role check exists yet) | Future: add role middleware |
| Search songs | `songs.ts` → uses `prisma.song.findMany` with `ILIKE` | |

## CONVENTIONS

- All responses follow `{code: 0, data: ...}` success / `{code: <status>, message: ...}` error.
- Throw `new AppError(message, statusCode)` for expected errors. Global `errorHandler` middleware converts.
- `req.user` is set by `authMiddleware` (or `optionalAuthMiddleware`). Type augmentation in `middleware/auth.ts`.
- Routes that need auth: apply `authMiddleware` as second arg in `router.METHOD(path, authMiddleware, handler)`.
- Routes that work for guests but use user data if present: apply `optionalAuthMiddleware`.
- All async route handlers should NOT manually try/catch — let errors bubble to `errorHandler`.

## GOTCHAS

- `/api/crawler/trigger` and `/api/health` are defined **inline in `app.ts`**, not in `routes/`. If you add a new crawler endpoint, decide: inline (1-off) or extract to `routes/crawler.ts`.
- `versions.ts` returns `content` as JSONB from Postgres — Prisma returns it as already-parsed object, but if it was a string you'd need `JSON.parse`.
- `songs.ts` search uses `ILIKE` (case-insensitive). For Chinese titles, this is approximate. For real Chinese tokenization, add a `tsvector` column + GIN index.
- `authMiddleware` returns 401 with `{code: 401, message: "..."}` for missing/invalid token — different from `AppError` pattern but consistent in shape.
- No rate limiting, no request validation (zod/joi). Add if exposing publicly.
