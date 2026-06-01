# CRAWLER MODULE

Scheduled lyric fetching from public music sites. Runs on server boot via `node-cron`.

## STRUCTURE

```
crawler/
├── index.ts            # cron entry, exports startCrawlerScheduler() + triggerManualCrawl()
├── parser.ts           # HTML/lyric text cleaner, section title detection
└── sources/
    ├── neteaseMusic.ts # NetEase Cloud Music adapter
    └── qqMusic.ts      # QQ Music adapter
```

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Change schedule | `index.ts` or `CRAWL_INTERVAL` env var | Default: `0 2 * * *` (daily 2 AM) |
| Add new music source | `sources/<site>.ts` + register in `index.ts` | Must implement `fetchHotSongs(limit)` + `fetchLyric(songId)` |
| Parse a new lyric format | `parser.ts` | Add parser, dispatch by `sourcePlatform` |
| Disable crawler | Unset `CRAWL_INTERVAL` env OR comment `startCrawlerScheduler()` in `app.ts:53` | |
| Manual trigger | `POST /api/crawler/trigger` (auth required) | Calls `triggerManualCrawl()` |
| View crawl history | `prisma.crawlLog.findMany()` | Logs written per source per run |

## KEY CONCEPTS

- **Adapter pattern**: every source is an async module exporting `{ fetchHotSongs(limit), fetchLyric(songId) }`. Same interface, different impl.
- **Cron**: `node-cron` reads `process.env.CRAWL_INTERVAL` (cron expression). If unset, scheduler is not started.
- **Deduplication**: insert checks `title + artist` match before adding a `Song` row. Updates `crawledAt` if already present.
- **Logs**: every crawl writes a `CrawlLog` row with `{platform, status, songsFound, errorMessage, crawledAt}`. `status ∈ {'success', 'failed', 'partial'}`.
- **Manual trigger**: `triggerManualCrawl()` runs all sources once, returns a Promise. Used by `/api/crawler/trigger` and tests.

## CONVENTIONS

- Source adapters never write to the DB directly. Return raw data, `crawlerService` handles persistence.
- All HTTP requests set a custom `User-Agent` identifying the bot. Respect `robots.txt`.
- Per-source request delay ≥ 2s (configurable per source).
- Failures in one source don't block others — wrap each source's `run` in try/catch.
- Section title parsing: matches patterns like `[主歌]`, `[副歌]`, `[Verse]`, `[Chorus]`. Fall back to `主歌` if no marker.

## GOTCHAS

- **Scheduler starts on every server boot**. Dev restart = re-schedule (no double-run, but logs are noisy).
- Music sites change their HTML/JSON structure frequently. Adapters break silently. Monitor `CrawlLog.status = 'failed'`.
- Lyric text from sources may contain HTML tags, ads, or artist names mixed in. `parser.ts` strips these but expect edge cases.
- `parser.ts` is line-based. Multi-line lyrics (rare in CN pop) may be split incorrectly.
- `crawlerService` (in `server/src/services/`) owns the DB writes — keep `crawler/` dir pure (fetching + parsing) and let `services/` do persistence.
- `triggerManualCrawl()` is async and can take minutes with many sources. The HTTP route awaits it but may timeout if your reverse proxy has a short timeout.
