# Generated data

- **`high-contrast-presets.json`** — committed dataset (~8k codes). `/high-contrast-presets` loads this file when
  present; otherwise it falls back to `lib/accessible-preset-codes.ts`.

Regenerate (from `apps/shadcnpreset`):

```bash
pnpm generate:high-contrast-dataset
```

Bigger or smaller:

```bash
pnpm exec node --import tsx/esm ./scripts/find-perfect-contrast-presets.ts --random --target 12000 --max-tries 30000000 --out ./data/high-contrast-presets.json
```

Criteria: 100% AA (4.5:1) on all token pairs in light and dark; zero unresolved colors in the checker.
