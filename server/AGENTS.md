# SERVER PACKAGE

Express + TypeScript + Prisma + PostgreSQL. CommonJS module system, no path aliases.

## STRUCTURE

```
server/
├── prisma/
│   └── schema.prisma       # User, Song, Lyric, CrawlLog, UserVersion
├── .env.example            # DATABASE_URL, JWT_*, CRAWL_INTERVAL, PORT, FRONTEND_URL
└── src/
    ├── app.ts              # Express entry, mounts routes, starts crawler
    ├── routes/             # /api/auth, /api/songs, /api/versions (see routes/AGENTS.md)
    ├── services/           # Business logic (auth, song, crawler)
    ├── middleware/         # auth (JWT), errorHandler (AppError → JSON)
    ├── crawler/            # Scheduled lyric fetcher (see crawler/AGENTS.md)
    ├── db/seed.ts          # 13.7KB seed script
    └── lib/prisma.ts       # PrismaClient singleton via globalThis
```

## PRISMA MODELS

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| `User` | Auth identity | has many `UserVersion` |
| `Song` | Song metadata | has many `Lyric`, has many `UserVersion` |
| `Lyric` | Section + line | belongs to `Song` (cascade delete) |
| `CrawlLog` | Crawler run history | standalone |
| `UserVersion` | Saved adaptation | belongs to `User` + optional `Song` |

Indexes: `Song.title`, `Song.artist`, `Lyric.songId`, `UserVersion.userId`, `UserVersion.songId`.

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add API endpoint | `routes/` + register in `app.ts` |
| Add business logic | `services/` |
| Add DB model | `prisma/schema.prisma` → `npm run db:migrate` |
| Add middleware | `middleware/` + apply in `app.ts` |
| Add crawler source | `crawler/sources/<site>.ts` |
| Check env vars | `.env.example` |

## CONVENTIONS (server-specific)

- CommonJS imports. `import x from 'y'` works via `tsx` but compiles to `require()`.
- No path aliases — use relative imports like `../services/authService`.
- Throw `AppError(message, statusCode)` for expected errors. `errorHandler` middleware converts to `{code, message}` JSON.
- `prisma` is a singleton via `globalThis` trick in `lib/prisma.ts` to survive HMR in dev.
- Use `optionalAuthMiddleware` when auth is optional (e.g. `GET /songs` works for guests); `authMiddleware` for required.

## KEY ENTRY POINTS

- `app.ts` — mounts `/api/auth`, `/api/songs`, `/api/versions`, `/api/health`, `/api/crawler/trigger`. **Crawler scheduler starts on boot** — disable by unsetting `CRAWL_INTERVAL` or commenting out `startCrawlerScheduler()` in `app.ts:53`.
- `lib/prisma.ts` — single `prisma` instance, all queries go through it.

## GOTCHAS

- `prisma migrate dev` **regenerates** `node_modules/.prisma/client` — restart `tsx watch` if types are stale.
- `.env` is gitignored but a working `.env` is committed pointing at the docker-compose DB (`postgres:123456@localhost:5432/lyric_lab`).
- `server/prisma/migrations/` is gitignored — must regenerate via `npm run db:migrate`.
- `startCrawlerScheduler()` runs on every server boot. In dev, restart = re-schedule (no double-run, but logs repeat).
- `cors` origin defaults to `FRONTEND_URL` env var. Set explicitly in prod.
- `express.json({ limit: '2mb' })` — large lyric payloads are OK, but uploading files will fail.
