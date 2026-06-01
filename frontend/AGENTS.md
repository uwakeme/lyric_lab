# FRONTEND PACKAGE

React 18 + Vite + Zustand + Tailwind. Own `package.json`, `node_modules`, configs.

## STRUCTURE

```
frontend/
├── vite.config.ts          # @/ alias, /api proxy → :3001
├── tailwind.config.js      # primary + accent + Inter/JetBrains Mono
├── tsconfig.json           # ESNext, strict, noUnused, @/* alias
└── src/
    ├── main.tsx            # React root
    ├── App.tsx             # Top-level layout + routing
    ├── types.ts            # Song, LyricLine, LyricSection
    ├── assets/index.css    # Tailwind directives + globals
    ├── components/         # Feature-grouped (see editor/AGENTS.md)
    ├── services/           # API layer (see services/AGENTS.md)
    ├── store/              # Zustand (see store/AGENTS.md)
    └── utils/              # charCount, pinyin helpers
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add API call | `services/*.ts` | Components never call `fetch` |
| Add new global state | `store/` | New Zustand store |
| Add UI primitive | `components/common/` | Button, Modal, Toast, Input, Skeleton, Onboarding |
| Add feature panel | `components/<feature>/` | Match existing `editor/`, `import/`, `version/` pattern |
| Add type | `types.ts` | All shared interfaces live here |
| Char counting | `utils/charCount.ts` | CJK + alphanum = 1, punct = 0 |
| Pinyin extraction | `utils/pinyin.ts` | Wraps `pinyin-pro` |

## COMPONENT GROUPS

| Group | Purpose |
|-------|---------|
| `auth/` | AuthModal, UserAvatar |
| `common/` | Button, Modal, Input, Toast, Skeleton, Onboarding |
| `editor/` | LyricEditor (17KB), EditorToolbar, RhymePanel — **the core** |
| `export/` | ExportPanel |
| `import/` | ImportPanel (7.4KB) — search/paste/manual |
| `preview/` | Preview |
| `version/` | VersionPanel |

Each group has an `index.ts` barrel.

## CONVENTIONS (frontend-specific)

- All imports use `@/` alias. Never `../../services/`. Enforced by `tsconfig.json paths` + `vite.config.ts resolve.alias`.
- ESM only (`"type": "module"` in `package.json`). Import with `.ts` extensions only if Vite needs it.
- One barrel `index.ts` per component group. Re-export named exports.
- Zustand stores expose actions as part of the store object (not separate exports).
- `noUnusedLocals` + `noUnusedParameters` **fail the build**. Clean up as you go.

## KEY ENTRY POINTS

- `main.tsx` → mounts `<App />` into `#root`
- `App.tsx` → top-level layout, error boundary, auth bootstrap
- `components/editor/LyricEditor.tsx` → the actual lyric editing surface (largest file in repo)

## GOTCHAS

- Vite dev proxies `/api/*` to `:3001` — backend must be running for network calls. Editor works offline via hardcoded fallbacks in `songService.ts`.
- Tailwind animations `animate-scale-in` / `animate-fade-in` on dropdown containers have known issues — avoid on dropdowns.
- `assets/index.css` is large (13.6KB) — Tailwind base + custom component classes live here, not in components.
- Path alias `@/*` resolves to `src/*` only when both Vite and tsconfig agree. If TS complains but Vite works → tsconfig path is wrong.
