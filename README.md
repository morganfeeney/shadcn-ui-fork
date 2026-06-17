# shadcnpreset

<a href="https://vercel.com/open-source-program">
  <img alt="Vercel OSS Program" src="https://vercel.com/oss/program-badge-2026.svg" />
</a>
<br>
<br>
Find the perfect shadcn preset in seconds.

shadcnpreset is an open-source platform for discovering, generating, previewing, and working with shadcn/ui themes.

Instead of clicking random until something looks good, describe what you're building and let AI surface relevant
presets. Compare them visually, preview them on real UI, save your favourites, and use a growing collection of developer
tools to move from idea to implementation faster.

## Why?

shadcn/ui gives developers an incredible amount of flexibility.

It also creates millions of possible combinations of styles, themes, fonts, icons, chart palettes, and design decisions.

Finding a combination that actually feels right can take far longer than building the feature itself.

shadcnpreset helps you:

* Discover themes using AI
* Preview presets on real interfaces
* Compare design decisions visually
* Find accessible colour combinations
* Generate production-ready theme code
* Save and share presets with your team

## Features

### AI-powered preset discovery

Describe what you're building:

* SaaS dashboard
* fintech startup
* educational app
* developer tool
* marketing website

AI surfaces relevant presets and helps you explore styles that match your intent instead of forcing you to browse
endless combinations.

### Real UI previews

Preview presets on actual interfaces instead of isolated colour swatches.

See how a theme performs across real application layouts before committing to it. Community feedback has driven the
addition of dashboard, authentication, and other realistic preview experiences.

### Community-driven discovery

* Vote for presets
* Save favourites
* Share preset URLs
* Discover popular combinations

Find themes other developers actually want to use.

### Accessibility-first exploration

Browse WCAG-compliant presets and validate colour contrast before shipping.

## Developer Tools

shadcnpreset includes a growing collection of free developer tools.

### Preset Theme CSS Generator

Paste a preset code and generate ready-to-use CSS custom properties for your project.

* Decode preset codes
* Preview themes
* Export CSS variables
* Copy directly into your application

### Preset Contrast Checker

Validate theme token combinations and identify accessibility issues before they reach production.

### Figma Variables Generator

Generate light and dark mode variables from a preset code and keep designs aligned with implementation.

### Theme Generator

Generate new themes and design directions for your next project.

### Image Filter Generator

Create Tailwind and CSS image filters with live previews and exportable output.

## Built on shadcn/ui

This repository is based on the shadcn/ui monorepo and stays closely aligned with upstream development.

### Apps

* `apps/shadcnpreset` — Theme discovery platform and developer tools
* `apps/v4` — Integrated preview and customizer experience

### Packages

* `packages/shadcn` — shadcn CLI and supporting packages

## Open Source

shadcnpreset is free, open source, and built in public.

Contributions, ideas, bug reports, and feature requests are welcome.

## Development

```bash
pnpm v4:dev
pnpm shadcnpreset:dev
```

See:

* `UPSTREAM.md`
* `docs/shadcnpreset-fork-integration.md`

## License

MIT
