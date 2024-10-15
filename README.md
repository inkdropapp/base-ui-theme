# Base styles of the UI theme for Inkdrop

This module provides the default styles and CSS variables for customizing Inkdrop's UI.
It is built on top of [Semantic UI](http://semantic-ui.com/).

Read [the documentation](https://developers.inkdrop.app/guides/create-a-theme) for detailed instructions.

## Requirements

- [Bun](https://bun.sh/)

## How to build

To build the module and generate CSS variable name list, run the following commands:

```
bun install
bun run build
bun run generate-variable-names
```

## Which files to edit

- [`src/site/globals/site.overrides`](src/site/globals/site.overrides)
  - This file contains the CSS variables used throughout the theme.
