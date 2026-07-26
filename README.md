# shadcn-ui-fork

Fork of [shadcn/ui](https://github.com/shadcn-ui/ui) that hosts the **create/customizer** embedded by [shadcnpreset](https://github.com/morganfeeney/shadcnpreset).

The product site, tools, and Figma plugin live in the [shadcnpreset](https://github.com/morganfeeney/shadcnpreset) repo. This fork keeps only create/v4 plus the embed hooks (`?embed=1`, `postMessage`).

## Local

```bash
pnpm install
pnpm v4:dev
```

Create defaults to [http://localhost:4000](http://localhost:4000). Point the product app’s `NEXT_PUBLIC_V4_URL` at that origin.

## Upstream merges

See [UPSTREAM.md](./UPSTREAM.md). After merging upstream:

```bash
pnpm verify:shadcnpreset-fork
```

## License

Same as upstream shadcn/ui (MIT).
