# Component Guidelines

Rules for anything added to `src/components/`.

## What Belongs Here

- Presentational, reusable UI: buttons, cards, layout shells, badges.
- Components that take data via props and render it — no fetching, no
  routing, no scene-specific business logic.

Scene-specific composition belongs in `src/scenes/`, not here. If a
component is only ever used by one scene and has no reuse potential,
prefer keeping it colocated in that scene until a second use case proves
it's shared.

## File Structure

```
src/components/
  Button/
    Button.tsx
    Button.module.css   (or scoped class names — see DESIGN_SYSTEM.md)
```

One component per file; the file name matches the exported component
name (`StudioLayout.tsx` exports `StudioLayout`).

## Props

- Explicit `interface`/`type` for props, no `any`.
- Prefer composition (`children`, render props) over boolean flags that
  fork rendering paths (`variant`, not `isSecondary` + `isDanger` + ...).
- Style inputs (color, size) should map to design tokens, not raw values
  passed through props.

## Styling

- Reference tokens from `src/styles/tokens.css` — never hard-code colors,
  spacing, or type sizes in a component.
- Motion follows `MOTION_SYSTEM.md` (shared duration/easing tokens,
  `prefers-reduced-motion` fallback).

## State

- Local UI state (`useState`) is fine inside a component.
- Anything reused across components, or involving side effects, belongs
  in a hook (`src/hooks/`), not duplicated inline.

## Accessibility

- Semantic HTML first; ARIA attributes only to fill real gaps.
- All interactive elements keyboard-operable and visibly focusable.

## Before Adding a Component

Check whether an existing component already covers the need with a prop
change, before creating a new one.
