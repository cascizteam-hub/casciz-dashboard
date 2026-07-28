# Design System

The design system is the single source of truth for visual decisions.
Components and scenes consume these tokens rather than hard-coding values.

## Tokens

Tokens live in `src/styles/` as CSS custom properties, layered as:

```
src/styles/
  tokens.css     -- raw values: color, spacing, radius, type scale
  global.css     -- resets + tokens applied to base elements
```

### Color

- Prefer semantic names (`--color-surface`, `--color-accent`,
  `--color-text-muted`) over raw hex references in components.
- Support both light and dark via `prefers-color-scheme` at the token
  layer — components should never branch on theme directly.

### Type Scale

- A single modular scale (e.g. 1.25 ratio) driving heading/body sizes.
- System font stack by default (`system-ui, sans-serif`); swap at the
  token layer only, never per-component.

### Spacing

- 4px base unit. Components reference spacing tokens (`--space-2`,
  `--space-4`, ...), not raw pixel values.

## Component Conventions

See `COMPONENT_GUIDELINES.md` for authoring rules. In short: components are
presentational, styled via CSS modules or scoped classes referencing
tokens, and take data via props — no direct data fetching inside
`src/components/`.

## Ownership

Changes to tokens (color, spacing, type) should be treated as design-system
changes, not local component tweaks — update this file and `tokens.css`
together so the two never drift.
