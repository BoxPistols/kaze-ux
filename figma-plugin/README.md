# System Design — Figma Plugin

Import W3C Design Tokens (DTCG format) into Figma as Variables, Styles, and ComponentSets.

Works with any design system — framework-agnostic.

## Quick Start

```bash
# Build the plugin
npx esbuild figma-plugin/code.ts --bundle --outfile=figma-plugin/code.js --target=es2017 --format=iife

# Or if you have pnpm scripts configured:
pnpm figma-plugin:build
```

## Setup

1. Open Figma Desktop
2. Menu > Plugins > Development > **Import plugin from manifest**
3. Select `figma-plugin/manifest.json`
4. The plugin appears in Plugins > Development > **System Design**

## Usage

### Step 1: Import Variables

**Import** tab > **Import tokens.json** > Select your tokens.json file

| Collection    | Content                          | Modes        |
| ------------- | -------------------------------- | ------------ |
| Color         | primary, secondary, success, etc | Light / Dark |
| Typography    | fontSize, fontWeight, lineHeight | Single       |
| Spacing       | 4px - 96px                       | Single       |
| Border Radius | xs - full                        | Single       |
| Shadow        | none - 2xl                       | Single       |
| Breakpoint    | mobile - desktop                 | Single       |
| Component     | Component controls from stories  | Single       |

### Step 2: Link Storybook (Optional)

**Generate** tab > Enter **Storybook Base URL** > **Link Storybook to Frames**

Adds clickable Storybook links to captured `--docs` frames. No token import needed.

### Step 3: Generate Components

**Generate** tab > **Button** (or other components)

- Button: 54 variants (contained/outlined/text x 6 colors x 3 sizes)
- Auto-binds to imported Color Variables

### Step 4: Register Styles (Optional)

**Import** tab > **Register Styles**

- 10 Text Styles (Display, Heading, Body, Caption)
- Color Styles with Variable binding
- Effect Styles (CSS box-shadow to Figma effects)

## Token Format (W3C DTCG)

```json
{
  "color": {
    "light": {
      "primary": {
        "main": { "$value": "#1976d2", "$type": "color" }
      }
    },
    "dark": {
      "primary": {
        "main": { "$value": "#90caf9", "$type": "color" }
      }
    }
  },
  "spacing": {
    "1": { "$value": "4px", "$type": "dimension" }
  }
}
```

A `sample-tokens.json` is included for quick testing.

## Generate tokens.json

From MUI theme:

```bash
npx system-design-export --from mui --input src/themes/theme.ts -o design-tokens/tokens.json
```

From existing export script:

```bash
pnpm export-tokens
```

## File Structure

```
figma-plugin/
  manifest.json       # Figma plugin definition
  code.ts             # Plugin logic (TypeScript)
  code.js             # Compiled (Figma runtime reads this)
  ui.html             # Plugin UI (4 tabs: Import/Generate/Manage/Help)
  tsconfig.json       # TypeScript config (target: ES2017)
  sample-tokens.json  # Sample W3C DTCG tokens for testing
  README.md           # This file
```

## Manage

- View all Variable Collections
- Delete individual collections or all at once
- Remove duplicate variables
- Delete generated ComponentSets

## Limitations

- Figma Variables REST API / Code Connect requires Enterprise plan
- Plugin API is the only way to create Variables on free/pro plans
- Compile target is ES2017 (Figma plugin runtime constraint)
- Storybook capture requires browser foreground tab

## License

MIT
