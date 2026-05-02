# Preset preview routes (`/preset-preview/*`)

This folder implements **local** preset preview examples (dashboard, style overviews). Themes come from the same registry/style families as the main product, but CSS variables and class-scoped rules must apply **before first paint** and must still work for **portaled UI**.

## Files

| File | Role |
|------|------|
| `[example]/page.tsx` | Server Component: resolves preset from `?preset=`, builds theme CSS, emits initial HTML. |
| `[example]/preview-example-shell.tsx` | Client shell: theme sync from parent (`postMessage`), and body scope for portals. |
| `layout.tsx` | Shared layout (e.g. toasts). |

## Approach

### 1. Server: `<style>` + scoped wrapper (FOUC)

**Problem:** Applying theme only in `useLayoutEffect` caused a flash: the first paint had no injected variables and no `style-*` ancestor, so layout looked wrong until the client ran.

**Fix in `page.tsx`:**

- Wrap the example in a root `<div className="preset-preview-root … style-${style} base-color-${baseColor}">`.
- Emit preset CSS with a real `<style id="preset-preview-example-theme">` in the **initial HTML**, before the client boundary.

That gives:

- `:root` / `.dark` variable blocks from `getPresetThemeCssBundle()` as soon as the browser parses the tag.
- `.style-* …` rules from global style sheets matching **non-portaled** content under the wrapper.

### 2. Client: mirror scope onto `document.body` (drawers, dialogs, menus)

**Problem:** Libraries like **Vaul** portal drawer content to `document.body`. Selectors in style bundles are typically of the form `.style-luma .cn-drawer-content` (ancestor must carry `style-*`). A class only on `.preset-preview-root` does **not** wrap nodes appended directly under `body`, so portaled panels can be unstyled or invisible.

**Fix in `preview-example-shell.tsx`:**

- `useLayoutEffect` adds the same `style-*` and `base-color-*` classes to `document.body`.
- Cleanup on unmount removes them.

Non-portaled UI still benefits from the wrapper; portaled UI relies on `body` carrying the same scope.

### 3. Theme mode sync (iframe)

The shell listens for `postMessage` with type `shadcnpreset:theme-mode` so the preview iframe can follow light/dark from the parent dialog without a full reload.

## Adding another local example

1. Register the example in `lib/preset-preview.ts` (`LOCAL_PRESET_PREVIEW_EXAMPLES`, `PRESET_PREVIEW_VIEWS`).
2. Branch in `ExampleView` inside `preview-example-shell.tsx`.
3. Prefer `cn-ui/*` primitives for components that must respect `.style-*` / `cn-*` rules in style bundles.
