# Contributing

This repository is a fork of [shadcn/ui](https://github.com/shadcn-ui/ui) used as the **create/customizer** for [shadcnpreset](https://shadcnpreset.com).

Product app changes belong in [morganfeeney/shadcnpreset](https://github.com/morganfeeney/shadcnpreset).

## Structure

| Path | Description |
|------|-------------|
| `apps/v4` | Create/customizer (iframe embed target) |
| `packages/shadcn` | shadcn CLI and supporting packages |

## Development

```bash
pnpm install
pnpm v4:dev
```

After merging upstream:

```bash
pnpm verify:shadcnpreset-fork
```

See [UPSTREAM.md](./UPSTREAM.md) for embed-integration conflict notes.

## Pull requests

Keep PRs focused on create/v4 and upstream sync. Prefer conventional commits, e.g. `fix(v4): …` or `chore(upstream): …`.
