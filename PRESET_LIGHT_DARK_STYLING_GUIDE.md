# Preset Light/Dark Styling Guide

Use this as the default pattern whenever a route/component needs to render preset-driven styling in both light and dark modes.

## When to use this

Applies to surfaces that:

- render preset theme tokens,
- need mode-aware output (light/dark),
- must avoid style bleed and hydration mismatch.

Current examples in this repo:

- `apps/shadcnpreset/components/preset-swatch/components/preset-card-1-style-overview.tsx`
- `apps/shadcnpreset/app/(preset)/dna/[slug]/dna-surface.tsx`

## Recommended approach

### 1) Build a `registryTheme` on the server

Use `buildRegistryTheme(...)` with decoded preset values to get stable `cssVars.light` / `cssVars.dark`.

### 2) Render through `PresetThemeSurface`

Use `PresetThemeSurface` as the wrapper for the preview content. This scopes vars/fonts/styles to the component boundary and matches existing preview-card behavior.

### 3) Resolve mode in a client orchestrator

For mode-specific UI branches, use a client surface component with:

- `useTheme()` for `resolvedTheme`,
- `useMounted()` to avoid SSR/client mismatch on first paint.

Typical mode selection:

- `const mode = resolvedTheme === "dark" ? "dark" : "light"`

### 4) Keep presentational pieces dumb

Put token configuration and contrast logic in utility modules, and keep visual sections (swatches, typography, etc.) in small presentational components.

## Contrast/readability pattern (charts)

For chart swatch labels, select text token via Culori:

1. Parse chart color + candidate text colors (`foreground`, `background`).
2. Compare `wcagContrast(foreground, chart)` vs `wcagContrast(background, chart)`.
3. Use whichever yields higher contrast.

This is implemented for DNA in:

- `apps/shadcnpreset/app/(preset)/dna/[slug]/swatch-utils.ts`

## Avoid

- Rewriting global CSS selectors (e.g. `:root` -> custom scope) when `PresetThemeSurface` can scope the surface directly.
- Rendering duplicate light/dark DOM blocks and hiding one with classes when a single mode-aware render path is enough.

