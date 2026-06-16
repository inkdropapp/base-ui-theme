# Base styles of the UI theme for Inkdrop

This module provides the default styles and CSS variables for customizing Inkdrop's UI.
It is built on top of [Semantic UI](http://semantic-ui.com/).

Read [the documentation](https://developers.inkdrop.app/guides/create-a-theme) for detailed instructions.

## Requirements

- [Node.js](https://nodejs.org/) v22.18 or later (for native TypeScript support)
- [pnpm](https://pnpm.io/)

## How to build

To build the module, run the following commands:

```
pnpm install
pnpm run build
```

## File structure

```
src/
  semantic.less              Entry point — imports every component definition into a single @layer
  theme.config               Semantic UI theme selection (which variant each component uses)
  theme.less                 LESS helpers and shared mixins
  site/
    globals/
      site.variables         LESS variables (fonts, sizes, color palette) consumed at build time
      site.overrides         CSS custom properties exposed at :root — the main editing surface
      site-dark.overrides    Dark-mode overrides for the same custom properties
    elements/                Per-component .variables / .overrides for buttons, inputs, etc.
    collections/             Form, menu, message, table
    modules/                 Accordion, checkbox, dropdown, modal, popup, sticky, transition
  definitions/               Semantic UI source LESS that consumes the variables above
  themes/default/            Default variant assets referenced by theme.config
styles/theme.css             Build output
```

## How CSS variables are used

The theme is driven entirely by CSS custom properties declared on `:root`.

1. **LESS variables** in `site.variables` (and per-component `.variables` files) define the static palette and sizing tokens — these are resolved at compile time by `lessc`.
2. **CSS custom properties** in `site.overrides` are declared on `:root` and reference those LESS values (e.g. `--primary-color: var(--color-blue-500);`). These are what the rest of the theme consumes via `var(...)`.
3. **Component LESS files** under `src/definitions/` reference the custom properties, not the LESS variables — so consumers can override any token at runtime without rebuilding.

To customize a token, override the custom property in your own stylesheet:

```css
:root {
  --primary-color: hotpink;
}
```

## Dark mode

Dark-mode tokens live in [`src/site/globals/site-dark.overrides`](src/site/globals/site-dark.overrides). Inkdrop signals dark mode by adding a class to `<body>`, and the overrides are scoped with `:has()`:

```css
:root:has(body[class*="dark-ui"]),
:root:has(body.dark-mode) {
  --primary-color: hsl(var(--hsl-blue-400) / 80%);
  --page-background: var(--color-neutral-950);
  /* ... */
}
```

Only the custom properties that need to change in dark mode are redeclared here — everything else inherits from `site.overrides`. To add a dark variant for a new token, declare its light value in `site.overrides` and its dark value in `site-dark.overrides` using the same name.

## Which files to edit

- [`src/site/globals/site.overrides`](src/site/globals/site.overrides) — light-mode CSS variables used throughout the theme.
- [`src/site/globals/site-dark.overrides`](src/site/globals/site-dark.overrides) — dark-mode overrides for the same variables.
