# system-design-export CLI Design (Phase 2)

## Overview

CLI tool that extracts design tokens from various frontend frameworks
and outputs W3C DTCG format JSON compatible with the System Design Figma plugin.

## Usage

```bash
# From MUI theme (theme.ts / createTheme)
npx system-design-export --from mui --input src/themes/theme.ts

# From Tailwind config
npx system-design-export --from tailwind --input tailwind.config.js

# From CSS custom properties
npx system-design-export --from css-vars --input src/styles/variables.css

# Output options
npx system-design-export --from mui -o design-tokens/tokens.json
npx system-design-export --from mui --stdout | pbcopy
```

## Architecture

```
packages/system-design-export/
  src/
    cli.ts              # Entry point (commander)
    extractors/
      mui.ts            # MUI theme → DTCG
      tailwind.ts       # Tailwind config → DTCG
      css-vars.ts       # CSS Variables → DTCG
    formatter.ts        # DTCG JSON formatter
    types.ts            # Shared types
  package.json
  tsconfig.json
```

## Extractor: MUI

- Parse `createTheme()` call via TypeScript AST
- Extract: palette, typography, spacing, shape.borderRadius, shadows, breakpoints
- Map to DTCG format with light/dark support

## Extractor: Tailwind

- `require()` the config file
- Resolve `theme.extend` merges
- Extract: colors, fontSize, spacing, borderRadius, boxShadow, screens

## Extractor: CSS Variables

- Parse CSS file for `--` custom properties
- Group by prefix convention (e.g., `--color-*`, `--spacing-*`)
- Infer $type from value format (hex → color, px → dimension)

## Output Format

Same W3C DTCG JSON as `design-tokens/tokens.json` —
directly loadable by the System Design Figma plugin.

## Package Details

- Name: `system-design-export`
- Bin: `system-design-export`
- Dependencies: `commander`, `typescript` (for AST parsing)
- Zero framework dependencies (no React, no MUI at runtime)
- Publishable to npm as standalone package
