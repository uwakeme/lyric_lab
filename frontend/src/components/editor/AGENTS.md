# EDITOR COMPONENTS

The core feature — character-level lyric editing with rhyme detection.

## FILES

| File | Size | Role |
|------|------|------|
| `LyricEditor.tsx` | 17.1KB | Main editor surface. Contains `LineEditor` + `CharBox` for char-level input/drag-drop. **Largest file in repo.** |
| `EditorToolbar.tsx` | 8.8KB | Rhyme rule selector, char limit, undo/redo, "check all" |
| `RhymePanel.tsx` | 5.4KB | Right sidebar — rhyme word library grouped by yunmu |
| `index.ts` | — | Barrel exports |

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Modify char drag/drop | `LyricEditor.tsx` | Look for `CharBox` component |
| Add toolbar button | `EditorToolbar.tsx` | Add action, wire to `editorStore` |
| Change rhyme rule UX | `EditorToolbar.tsx` | Rules: `none`/`yunmu`/`ping`/`ze` |
| Add yunmu category | `services/rhymeLibrary.ts` | NOT this dir — service owns the data |
| Change rhyme word panel | `RhymePanel.tsx` | Reads from `rhymeLibrary` |
| Char-by-char input handling | `LyricEditor.tsx` → `CharBox` | Per-character `onChange` |

## KEY CONCEPTS

- **LineEditor** wraps a row of `CharBox` instances. Each `CharBox` is a single-character input with drag-drop.
- **Rhyme detection** is computed per-line at render time, not stored. Uses `rhymeService.checkRhyme(line, rule)` against `line.adaptedText ?? line.text`.
- **Char limit** is per-section or global, validated live. Out-of-range lines get red border / warning icon.
- **Rhyme rules** stored in `editorStore` (global), applied per-line during render.
- **Section structure**: `LyricSection { title, lines[] }`. Editor renders sections in order with up/down/add/delete controls.

## CONVENTIONS

- All editor state mutations go through `editorStore` actions. Never call `setState` directly in components.
- Undo/redo is **50-entry capped**. Triggered by store actions, not component-level history.
- Reading `line.adaptedText ?? line.text` is the canonical fallback pattern — never read `text` directly.
- Toolbar buttons should be keyboard-accessible (44×44px touch target).

## GOTCHAS

- `LyricEditor.tsx` is large because it inlines `CharBox` + `LineEditor`. Refactoring to separate files = careful re-export through `index.ts`.
- Drag-drop on `CharBox` uses native HTML5 DnD (not react-dnd). Touch devices may not work — verify on mobile.
- Rhyme markers (green/red) re-compute on every render. With 100+ lines, debounce the rule change.
- `animate-scale-in` / `animate-fade-in` on toolbar dropdowns have known issues — use conditional rendering instead.
