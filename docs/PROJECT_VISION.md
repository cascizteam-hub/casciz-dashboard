# Project Vision

## What Tech Studio Is

Tech Studio is a scene-driven front-end platform: a small set of composable
"scenes" (top-level views) built from a shared component and motion system,
rather than a conventional page-by-page site. The goal is a product that
feels like a single continuous experience as users move between sections,
not a stack of disconnected pages.

## Who It's For

- Visitors evaluating the studio's work and capabilities.
- Internal team members assembling new scenes/pages from existing building
  blocks without re-deriving layout, motion, or style decisions each time.

## Design Principles

1. **One system, many scenes.** Every scene is composed from the same
   component library, tokens, and motion primitives — no one-off styling.
2. **Motion communicates state, not decoration.** Animation exists to show
   relationships (what moved where, what caused what), not to impress.
3. **Content-first scenes.** Scenes are thin — they arrange existing
   components and hooks; they should rarely contain novel layout logic.
4. **Progressive complexity.** The scaffold starts minimal (plain React +
   Vite) and only adopts heavier dependencies (3D, animation libraries)
   when a concrete scene needs them.

## Non-Goals (for now)

- A general-purpose CMS or multi-tenant theming system.
- Backend/data-layer concerns — this repo is front-end only until a
  concrete integration is scoped.

## Status

Early scaffold stage. See `ROADMAP.md` for sequencing and `ARCHITECTURE.md`
for the current technical shape.
