# Base styles of the UI theme for Inkdrop

This module provides the default styles for Inkdrop's UI. It is built on top of
[Semantic UI](http://semantic-ui.com/) and compiles to a single stylesheet, `styles/theme.css`.

The **design tokens** it consumes — the CSS custom properties you override to re-theme the app —
live in a separate package, [`@inkdropapp/css`](https://github.com/inkdropapp/css). This repo
reads them; it does not define them.

Read [the documentation](https://developers.inkdrop.app/guides/create-a-theme) for detailed instructions.

## Requirements

- [Node.js](https://nodejs.org/) v22.22.3 or later (required by `cssnano`)
- [pnpm](https://pnpm.io/)

## How to build

```
pnpm install
pnpm run build
```

`pnpm run build` runs [`scripts/build.mjs`](scripts/build.mjs), which compiles `src/semantic.less`
with LESS and then minifies the result with `cssnano`. The published output is minified
(~250 KB, down from ~750 KB unminified); `styles/` is generated and git-ignored.

## File structure

```
src/
  semantic.less              Entry point — imports the active component definitions into
                             @layer theme.ui.base. 22 are active; 23 are commented out
                             (icon, grid, card, sidebar, tab, search, all of views/, …)
  theme.config               Selects which variant each component uses
  theme.less                 Theme resolution engine — resolves @@element and imports the
                             matching .variables / .overrides files for each component
  definitions/               Semantic UI component LESS — the actual rules (the files you edit)
    globals/site.less        Base element styles, scrollbars, selection
    elements/                button, container, divider, header, image, input, label,
                             list, loader, segment
    collections/             form, menu, message, table
    modules/                 accordion, checkbox, dropdown, modal, popup, sticky, transition
    views/                   Inactive — not imported by semantic.less
  themes/default/            Default variant values — the LESS variables the definitions consume
  site/                      Per-site override scaffolding. Currently all empty placeholders;
                             kept because theme.less imports them unconditionally.
styles/theme.css             Build output (generated, git-ignored)
```

## How theming works

Components are authored so that every themeable value is read through a CSS custom property,
with the compile-time LESS value kept as a fallback:

```less
background: var(--input-background, @inputBackground);
```

- The **CSS custom property** (`--input-background`) is defined in `@inkdropapp/css/ui.css`.
  Overriding it re-themes the app at runtime, with no rebuild.
- The **LESS fallback** (`@inputBackground`) comes from `src/themes/default/**/*.variables` and is
  resolved at compile time. It applies only when the token is absent.

Migration to this pattern is partial — roughly a quarter of the LESS variable usages in
`src/definitions/` are wrapped so far. See [`.claude/rules/css-variables.md`](.claude/rules/css-variables.md)
for the procedure when converting more.

To customize a token, override the custom property in your own stylesheet:

```css
:root {
  --primary-color: hotpink;
}
```

## Dark mode

Dark mode is handled in `@inkdropapp/css/ui.css` using the CSS
[`light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) function,
so a single token declaration covers both appearances:

```css
--primary-color: light-dark(
  var(--color-blue-500),
  hsl(var(--hsl-blue-400) / 80%)
);
--input-background: light-dark(var(--white), var(--color-neutral-900));
```

There is no separate dark-mode stylesheet in this repo.

## Which files to edit

- **Component rules** — `src/definitions/<type>/<name>.less`, in this repo.
- **Default values for the LESS fallbacks** — `src/themes/default/<type>/<name>.variables`, in this repo.
- **Design tokens** (the `--custom-properties` themes override) — `ui.css` in the
  [`@inkdropapp/css`](https://github.com/inkdropapp/css) repo, not here. After adding one there,
  run `npm run generate-variable-names` in that repo and publish before consuming it.
