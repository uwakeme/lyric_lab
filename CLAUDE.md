# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LyricLab is a full-stack lyric adaptation web application with a React frontend and Express/Prisma backend. Users can import songs, edit lyrics character-by-character with rhyme detection, manage versions, and export in multiple formats.

## Development Commands

### Frontend (E:/projects/LyricLab/frontend)
```bash
npm run dev      # Start dev server on http://localhost:5173
npm run build    # Build for production
```

### Backend (E:/projects/LyricLab/server)
```bash
npm run dev          # Start dev server with tsx watch on http://localhost:3001
npm run build        # Compile TypeScript
npx prisma migrate dev   # Run database migrations
npx tsx src/db/seed.ts   # Seed database with sample data
```

## Architecture

### Frontend Structure

- **State Management**: Zustand store (`src/store/editorStore.ts`) manages the current song, selected section/line, rhyme rules, char limits, and undo/redo stacks.
- **Services Layer**: `src/services/*.ts` handles API calls to backend, pinyin/rhyme logic, and version persistence.
- **Character-level Editor**: `src/components/editor/LyricEditor.tsx` contains `CharBox` (single character input with drag-drop) and `LineEditor` (one-to-one mapping between original and adapted chars).

### Data Model

`LyricLine` has two text fields:
- `text` — original lyrics (read-only reference)
- `adaptedText` — user's adapted lyrics (editable, stored separately)

Rhyme detection runs against `adaptedText` when present, falling back to `text`.

### Backend Structure

- `src/routes/` — Express route handlers (auth, songs, versions)
- `src/services/` — Business logic
- `src/middleware/` — Auth middleware (JWT verification)
- `src/crawler/` — Scheduled lyric crawling (预留接口)
- `src/db/` — Prisma schema and seed data

### Rhyme Detection

Uses `pinyin-pro` library. The `rhymeService.ts` exports:
- `checkRhyme(line, rule, textToCheck?)` — checks last character against rule
- `getLastCharPinyin(text)` — extracts pinyin from text's final character
- `extractYunmu/isPing/isZe` — categorize pinyin properties

Supported rules: `none`, `yunmu` (specific final vowel), `ping` (tones 1-2), `ze` (tones 3-4).

### Z-Index Stacking

Fixed elements use z-index scale: modal `[60]`, onboarding `[55]`, toast `[50]`. When adding new overlays, ensure proper stacking.

### Key Files

| File | Purpose |
|------|---------|
| `frontend/src/store/editorStore.ts` | Central Zustand store for editor state |
| `frontend/src/types.ts` | Shared TypeScript interfaces (Song, LyricLine, LyricSection) |
| `frontend/src/services/rhymeService.ts` | Rhyme detection logic |
| `frontend/src/components/editor/LyricEditor.tsx` | Character-level editing UI |
| `server/prisma/schema.prisma` | Database schema (User, Song, Lyric, Version) |

## Notes

- The `LyricLine.adaptedText` field was added to separate original from adapted lyrics — always use this field for user's edits.
- The editor toolbar settings dropdown had animation issues fixed by removing `animate-scale-in`/`animate-fade-in` from the dropdown container.
- TypeScript errors about unused variables (`TS6133`) are non-blocking warnings from `noUnusedLocals`/`noUnusedParameters` config — they're being cleaned up progressively.