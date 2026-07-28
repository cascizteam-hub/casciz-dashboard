# Roadmap

Sequencing is deliberately conservative: add structure/dependencies only
when a concrete scene needs them (see `DIGITAL_CORE.md` principle 4).

## Phase 0 — Scaffold (done)

- [x] Vite + React + TypeScript project structure
- [x] `components/ scenes/ hooks/ lib/ styles/` layout with one sample
      module wired end-to-end
- [x] Build verified (`npm run build`)

## Phase 1 — Foundation docs & tokens

- [ ] Extract raw design tokens into `src/styles/tokens.css`
      (`DESIGN_SYSTEM.md`)
- [ ] Add motion timing/easing tokens (`MOTION_SYSTEM.md`)
- [ ] Document component authoring conventions
      (`COMPONENT_GUIDELINES.md`) and apply to existing sample components

## Phase 2 — Multi-scene navigation

- [ ] Introduce routing once a second scene is defined
- [ ] Scene-to-scene transition pattern (per `MOTION_SYSTEM.md`)

## Phase 3 — Content & real scenes

- [ ] Replace placeholder `HomeScene` with real content
- [ ] Add remaining scenes per product requirements (TBD — depends on
      what Tech Studio's actual sections are)

## Phase 4 — Quality bar

- [ ] Linting/formatting enforced in CI
- [ ] Component-level tests for shared `components/`
- [ ] Accessibility pass (focus states, reduced-motion, contrast)

## Open Questions

- What are the actual scenes/sections Tech Studio needs? (Not yet
  specified — Phase 3 is blocked on this.)
- Is a component/animation library (e.g. Framer Motion, react-three-fiber)
  needed, or does CSS-only motion cover the intended scenes?
