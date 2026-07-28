# Digital Core

"Digital Core" is the set of foundational, framework-level decisions that
every scene and component builds on. It's the layer beneath the design
system: not what things look like, but how the app is put together.

## Principles

1. **Explicit over magic.** No implicit global state, no ambient context
   unless a concrete cross-scene need justifies it.
2. **Hooks own behavior, components own presentation.** Logic (data
   fetching, derived state, side effects) lives in `src/hooks/`; components
   in `src/components/` and `src/scenes/` stay declarative.
3. **`lib/` is framework-agnostic.** Anything in `src/lib/` should be
   plain TypeScript, testable without React, and free of DOM/browser APIs
   unless the function's whole purpose requires them.
4. **Scenes compose, they don't implement.** A scene wires hooks and
   components together; it should rarely contain its own business logic.

## Current Core

- **Runtime:** React 18 + TypeScript, bundled with Vite.
- **Routing:** not yet introduced — single scene today. Add a router only
  when a second top-level scene needs independent navigation (see
  `ROADMAP.md`).
- **State:** local component/hook state only. No global store until a
  concrete cross-scene state need appears.

## Extension Points

When a new capability is needed (routing, data fetching, animation
library), document the decision here with a one-line rationale before
adding the dependency — this file is the log of "why we depend on X."
