# Rule: Promote LESS variables to themeable CSS variables

When asked to make a `src/definitions/<type>/<name>.less` rule themeable (or to "move/replace LESS variables with CSS variables"), follow this procedure.

## Why

Inkdrop re-themes at runtime by overriding CSS custom properties, so every value a theme should be able to change must be read through `var(--token, @lessFallback)` rather than a raw `@lessVar`.

**The tokens themselves no longer live in this repo.** They moved to the `@inkdropapp/css` package (`ui.css`), which this theme consumes. `src/site/globals/site.overrides` is now an empty stub — do not add tokens there.

So the task has two halves, usually in **two different repos**:

1. **Define** the token in `@inkdropapp/css` (only if it does not already exist).
2. **Consume** it here, replacing `@lessVar` with `var(--token, @lessVar)`.

Most of the time half 1 is already done — 1,638 tokens are exported today. Check before writing anything.

## File map

### This repo (`base-ui-theme`) — consumes tokens

- `src/definitions/<type>/<name>.less` — rule files that consume variables (e.g. `elements/input.less`, `modules/dropdown.less`).
- `src/themes/default/<type>/<name>.variables` — element/module-scoped LESS defs, **unprefixed** names (`@iconWidth`, `@selectionMenuBorderRadius`).
- `src/themes/default/globals/site.variables` — globals-scoped LESS vars (`@inputBackground`, `@glyphWidth`, `@defaultEasing`); available everywhere.
- `src/site/globals/site.overrides` — **stub. Do not add tokens here.**

### The `css` repo — defines tokens

- Local checkout: `/Users/nora/Developments/inkdrop/css` (github.com/inkdropapp/css)
- `ui.css` — the `@layer theme.ui.base { :root { … } }` token file, split into `/* Input */`, `/* Dropdown */`, … comment sections. **New UI tokens go here.**
- `tokens.css` — lower-level primitives (color ramps, sizes) that `ui.css` builds on.
- `variables.json` — **generated, never hand-edited.** `npm run generate-variable-names` rebuilds it from every `:root` declaration; Inkdrop reads it to know which variables a theme may override. Runs automatically on `prepublishOnly`.

## Before you start: does the token already exist?

```bash
grep -n '\-\-input-icon-width' node_modules/@inkdropapp/css/*.css
```

If it is already defined, skip to **How to wire the rule file** — this is the common case.

## How to define a NEW token (in the `css` repo)

1. Look up the LESS def in `src/themes/default/<type>/<name>.variables` to get its value + composition.
2. Re-express it as **plain CSS**. `ui.css` is a static stylesheet — there is no LESS compiler, so no `@var`, no `darken()`, no LESS arithmetic:
   - **Literal** → copy it (`@iconOpacity: 0.5` → `0.5`; `@iconOffset: -0.5em` → `-0.5em`).
   - **Computed** → rebuild with `calc()` + existing tokens (`@iconWidth: (@verticalPadding * 2) + @glyphWidth` → `calc(var(--input-vertical-padding) * 2 + var(--glyph-width))`).
   - **Color math** → `darken()`/`lighten()`/`saturate()` have no CSS equivalent that matches LESS exactly (`darken` is HSL-lightness subtraction; `color-mix(in srgb, …, black)` is not the same value). Prefer an existing ramp token from `tokens.css`, or bake the literal LESS already computes — do not hand-translate to `color-mix()` and assume it matches.
   - Prefer design-system tokens (`var(--default-corner-shape)`, `var(--default-squircle-radius)`) over hardcoding.
3. Name it `--<component>-<property>` (`--input-icon-width`, `--dropdown-selection-menu-border-radius`), matching that section's existing naming.
4. Place it in the matching `ui.css` section, grouped with related tokens. If it derives from another new token, chain via `var()`:
   `--input-icon-margin: calc(var(--input-icon-width) + var(--input-icon-distance))`
5. Run `npm run generate-variable-names` in the `css` repo so `variables.json` picks it up.
6. The token only reaches this repo once `@inkdropapp/css` is published and the dependency bumped here. **Say so explicitly** when handing back work that spans both repos — a green `npm run build` here does _not_ prove a new token exists.

## How to wire the rule file (in this repo)

Replace each usage with `var(--token, @lessFallback)` — **always keep the LESS var as the fallback** (preserves behavior and un-orphans the LESS var). Keep `!important` outside the `var()`:

```less
margin: var(--input-icon-margin, @iconMargin) !important;
```

## How to verify

1. `npm run build` must exit 0.
2. `grep` the new tokens + usages in `styles/theme.css` to confirm they emit and fallbacks resolved.
3. **Check the token is actually defined somewhere** — see the orphan check below. The build passes either way, so this is the only step that catches a typo'd or never-defined token.

## Gotchas

- **Never drop the `@lessVar` fallback.**
- **A `var()` reference is not proof the token exists.** The check below reports **70** tokens referenced in `src/` that `@inkdropapp/css` does not define — they silently fall back to the LESS value, so they look migrated but are not themeable. (Exactly one, `--label-border-color`, is declared locally in `src/`; the rest are defined nowhere at all.) Most are `--label-<color>-hover-*` and `--popup-inverted-*`. Find them with:

  ```bash
  grep -rhoE 'var\(--[a-z0-9-]+' src --include='*.less' --include='*.overrides' | sed 's/var(//' | sort -u > /tmp/used.txt
  grep -rhoE '^\s*--[a-z0-9-]+\s*:' node_modules/@inkdropapp/css/*.css | tr -d ' :' | sort -u > /tmp/declared.txt
  comm -23 /tmp/used.txt /tmp/declared.txt
  ```

  If the rule you are editing references one of these, defining it in `ui.css` is part of the job.

- Check whether the rule already consumes the token before editing (the dropdown selection box already had `corner-shape: var(--dropdown-selection-corner-shape, round)`).
- Migration is partial — roughly 27% of `@lessVar` usages in rule files are wrapped so far. `container.less`, `sticky.less` and `transition.less` are at 0%; `list.less` and `accordion.less` are near it.
