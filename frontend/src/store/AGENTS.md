# ZUSTAND STORES

Global state — editor and auth. Two stores only. Don't add more without good reason.

## STORES

| Store | Size | Owns | Key State |
|-------|------|------|-----------|
| `editorStore.ts` | 12.6KB | Lyric editor state | `currentSong`, `sections[]`, `rhymeRule`, `charLimit`, `undoStack`, `redoStack`, `dirty` |
| `authStore.ts` | — | User auth | `user`, `accessToken`, `refreshToken`, `loading`, `error` |

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Add editor action | `editorStore.ts` | Add action, push to undo stack if state-mutating |
| Modify undo/redo | `editorStore.ts` | **Cap = 50 entries** |
| Add auth action (logout) | `authStore.ts` | Clear tokens from localStorage too |
| Tune auto-save | `editorStore.ts` | Debounced 2s, key `lyriclab_autosave` |
| Read store in component | `useEditorStore(selector)` or `useAuthStore(selector)` | Selectors prevent re-render storms |

## KEY CONCEPTS

- **Undo/redo**: command-pattern-ish, capped at **50 entries** in `editorStore`. Triggered automatically when actions mutate state.
- **Auto-save**: store subscribes to state changes, debounces 2s, writes to `localStorage.lyriclab_autosave`. Restored on app mount.
- **Auth bootstrap**: `authStore` rehydrates from localStorage on app mount, validates `accessToken` via `GET /api/auth/me`, refreshes if expired.
- **Editor state structure**: `editorStore.currentSong.sections[].lines[]` where each line has `{id, text, adaptedText, ...}`. Always read `line.adaptedText ?? line.text`.

## CONVENTIONS

- Stores export a single hook (`useEditorStore`, `useAuthStore`) and the raw store for non-React access (`editorStore.getState()`).
- Actions are part of the store object, not separate exports. `useEditorStore(s => s.setRhymeRule)` not `setRhymeRule`.
- Mutations push to undo stack **only if** the action is user-initiated (not initial load, not autosave restore).
- Selectors should return primitives or shallow-equal objects to avoid unnecessary re-renders.
- No async work in the store body — actions can be async, but `set` must be called with explicit state, not side effects.

## GOTCHAS

- `editorStore` is the second-largest file in the repo (12.6KB) because it owns undo/redo logic, autosave subscription, AND state shape. Splitting = high risk of breaking the undo boundary.
- **Undo/redo cap = 50 is enforced in code**, not config. If you add 100 undo entries during a paste-all operation, the oldest 50 are silently dropped.
- Autosave subscription **must** be set up in module init, not in a component effect — otherwise HMR can leak listeners.
- `authStore` stores tokens in plain localStorage (NOT httpOnly cookies). XSS risk is accepted for simplicity — do not store other sensitive data this way.
- On logout, clear: `authStore` state + `localStorage. {lyriclab_access_token, lyriclab_refresh_token, lyriclab_user}` + `editorStore` state (or warn user first).
