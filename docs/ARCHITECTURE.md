# Architecture

## Stack

- **Build tool:** Vite
- **UI:** React 18 + TypeScript (strict mode)
- **Styling:** plain CSS with custom properties (see `DESIGN_SYSTEM.md`)
- **Path alias:** `@/*` → `src/*` (configured in `tsconfig.json` and
  `vite.config.ts`)

## Directory Layout

```
src/
  components/   Shared, reusable, presentational UI components
  scenes/       Top-level views; compose components + hooks
  hooks/        Reusable stateful/behavioral logic
  lib/          Framework-agnostic utilities (no React imports)
  styles/       Global CSS, design tokens
public/         Static assets served as-is
docs/           This documentation set
```

## Data Flow

```
scenes/  →  hooks/  →  lib/
   ↓
components/  (presentational only, receives data via props)
```

- `scenes/*` are the only files that assemble a full view; they import
  from `components/`, `hooks/`, and (rarely) `lib/` directly.
- `hooks/*` may call into `lib/*` but never import from `components/` or
  `scenes/`.
- `components/*` must not import from `scenes/` (one-directional
  dependency, prevents circular coupling).

## Adding a New Scene

1. Create `src/scenes/<Name>Scene.tsx`.
2. Compose it from existing `components/` where possible.
3. Extract any non-trivial state/behavior into a `src/hooks/use<Name>.ts`.
4. Wire it into `App.tsx` (or the router, once one exists — see
   `ROADMAP.md`).

## Build & Verify

```
npm install
npm run dev      # local dev server
npm run build    # tsc -b && vite build — must pass before merging
```
