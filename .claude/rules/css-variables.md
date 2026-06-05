# Rule: Promote LESS variables to themeable CSS variables

When asked to make a `src/definitions/<type>/<name>.less` rule themeable (or to "move/replace LESS variables with CSS variables"), follow this procedure.

## Why

This theme exposes design tokens as CSS custom properties in `src/site/globals/site.overrides` (`:root`) so the Inkdrop app can re-theme at runtime without recompiling LESS. The recurring task is migrating a rule file from raw `@lessVar` usage to `var(--token, @lessVar)`.

## File map

- `src/definitions/<type>/<name>.less` — rule files that **consume** variables (e.g. `elements/input.less`, `modules/dropdown.less`).
- `src/themes/default/<type>/<name>.variables` — element/module-scoped LESS defs, **unprefixed** names (`@iconWidth`, `@selectionMenuBorderRadius`).
- `src/themes/default/globals/site.variables` — globals-scoped LESS vars (`@inputBackground`, `@glyphWidth`, `@defaultEasing`, `@borderRadius`); available everywhere.
- `src/site/globals/site.overrides` — the `:root` CSS-token file, split into `/* Input */`, `/* Dropdown */`, … comment sections.

## CRITICAL scope rule

`site.overrides` is a **globals** file compiled for **every** component, so it may only reference globals-scoped LESS vars. **Never** reference element/module-scoped vars (`@iconWidth`, `@selectionMenuBorderRadius`) there — they're undefined when other components compile site.overrides and the build breaks.

## How to define new CSS variables from existing LESS variables (per module/element)

1. Look up the LESS def in `src/themes/default/<type>/<name>.variables` to get its value + composition.
2. Re-express the value so it's valid in globals scope:
   - **Literal** → copy it (`@iconOpacity: 0.5` → `0.5`; `@iconOffset: -0.5em` → `-0.5em`).
   - **Computed** → rebuild with `calc()` + already-exposed CSS tokens (`@iconWidth: (@verticalPadding * 2) + @glyphWidth` → `calc(var(--input-vertical-padding) * 2 + var(--glyph-width))`).
   - **Shared/easing** → reuse globals tokens (`@defaultEasing` → `var(--default-easing)`).
   - Prefer design-system tokens (`var(--default-corner-shape)`, `var(--default-squircle-radius)`) over hardcoding so the element follows the theme.
3. Name it `--<component>-<property>` (`--input-icon-width`, `--dropdown-selection-menu-border-radius`), matching that section's existing naming.
4. Place it in the matching site.overrides section, grouped with related tokens; if it derives from another new token, chain via `var()` (`--input-icon-margin: calc(var(--input-icon-width) + var(--input-icon-distance))`).

## How to wire the rule file

Replace each usage with `var(--token, @lessFallback)` — **always keep the LESS var as the fallback** (preserves behavior and un-orphans the LESS var). Keep `!important` outside the `var()`: `var(--input-icon-margin, @iconMargin) !important`.

## How to verify

1. `npm run build` must exit 0 (this is the real test of the scope rule — a bad element-scoped reference breaks here).
2. `grep` the new tokens + usages in `styles/theme.css` to confirm they emit and fallbacks resolved.

## Gotchas

- Never drop the `@lessVar` fallback.
- A rule may already reference a `var(--token, …)` whose token was never defined (e.g. `--dropdown-selection-border-radius`) — you must still define it in site.overrides.
- Check whether the rule already consumes the token before editing the rule file (the selection box already had `corner-shape: var(--dropdown-selection-corner-shape, round)`).
