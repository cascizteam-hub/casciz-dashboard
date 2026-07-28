# Motion System

Motion is treated as part of the design system, not an afterthought.
These are the rules for adding animation anywhere in Tech Studio.

## Principles

1. **Motion explains state changes.** Use it to show what appeared,
   moved, or was replaced — not for decoration with no informational role.
2. **Consistent timing.** Two durations, two easings, defined once:
   - `--motion-duration-fast` (~150ms) — micro-interactions (hover, focus,
     toggle).
   - `--motion-duration-base` (~300ms) — scene/content transitions.
   - `--motion-ease-out` for things entering/responding to input.
   - `--motion-ease-in-out` for things transitioning between two states.
3. **Respect reduced motion.** Every animation must have a
   `prefers-reduced-motion` fallback (instant or cross-fade instead of
   movement).
4. **CSS first.** Prefer CSS transitions/animations for simple state
   changes. Reach for a JS animation library only when a scene needs
   orchestration CSS can't express (staggered sequences, physics-based
   motion, gesture-driven interaction) — record that decision in
   `DIGITAL_CORE.md` when it happens.

## Where Motion Lives

- Shared timing/easing tokens: `src/styles/tokens.css`.
- Reusable transition behavior (e.g. enter/exit wrappers): a hook in
  `src/hooks/`, not duplicated per scene.
- Scene-level transitions (moving between scenes): owned by the scene
  itself, using shared tokens.

## Anti-Patterns

- Hard-coded durations/easings inside component styles.
- Animating layout-triggering properties (`width`, `top`, `left`) instead
  of `transform`/`opacity`.
- Motion that can't be disabled via reduced-motion preference.
