# Kaze UX Architecture Document

## 1. Project Overview

Kaze UX is a modern React design system built with MUI v7, Tailwind CSS, and Storybook. In addition to serving as a distributable component library, it develops and deploys 3 demo applications within the same monorepo.

### Design Goals

- **Consistency**: Unified UI through design tokens and theming
- **Development Speed**: Reusable components and layouts
- **AI Integration**: AI agent support via MCP / Skills / IDE Rules
- **Accessibility**: WAI-ARIA compliant with Storybook a11y addon
- **Documentation-driven**: Storybook serves as both component catalog and guide

---

## 2. Tech Stack

### Core Technologies

| Category     | Technology        | Version | Role                    |
| ------------ | ----------------- | ------- | ----------------------- |
| UI Framework | MUI (Material UI) | v7      | Component foundation    |
| Styling      | Tailwind CSS      | v3      | Utility CSS             |
| CSS-in-JS    | Emotion           | v11     | MUI theme styling       |
| Language     | TypeScript        | v5.9    | strict mode enabled     |
| View         | React             | v18     | UI rendering            |
| State        | Zustand           | v5      | Global state management |
| Routing      | React Router      | v6      | SPA routing             |
| Animation    | Framer Motion     | v12     | Animation               |

### Development & Build

| Category           | Technology               | Role                 |
| ------------------ | ------------------------ | -------------------- |
| Documentation      | Storybook 10             | Component catalog    |
| Build              | Vite 5                   | Bundler & dev server |
| Testing            | Vitest + Testing Library | Unit testing         |
| Linting            | ESLint (flat config)     | Code quality         |
| Formatting         | Prettier                 | Code style           |
| Git Hooks          | Husky + lint-staged      | Pre-commit checks    |
| Package Management | pnpm (workspace)         | Monorepo management  |
| Build Optimization | Turbo                    | Monorepo builds      |
| Deployment         | Vercel                   | Hosting              |

### Additional Libraries

| Category      | Technology                  | Role                   |
| ------------- | --------------------------- | ---------------------- |
| CVA           | class-variance-authority    | Variant management     |
| Class merging | clsx + tailwind-merge       | Tailwind class merging |
| Date/Time     | Day.js                      | Date manipulation      |
| Search        | Fuse.js                     | Fuzzy search           |
| Maps          | MapLibre GL / Mapbox GL     | Map rendering          |
| Markdown      | react-markdown + remark-gfm | Markdown rendering     |
| Toast         | Sonner                      | Notifications          |
| D&D           | @dnd-kit                    | Drag and drop          |

---

## 3. Directory Structure

```
kaze-ux/
├── src/                         Main library source
│   ├── components/              UI components
│   │   ├── ui/                  General UI (Button, Card, Dialog, ChatSupport...)
│   │   │   ├── button/          CVA-based Button (loadingButton, saveButton)
│   │   │   ├── ChatSupport/     AI chat widget
│   │   │   ├── dialog/          ConfirmDialog etc.
│   │   │   ├── card/            Card component
│   │   │   ├── accordion/       Accordion
│   │   │   ├── avatar/          Avatar
│   │   │   ├── calendar/        Calendar
│   │   │   ├── chip/            Chip
│   │   │   ├── fab/             FloatingActionButton
│   │   │   ├── feedback/        Feedback components
│   │   │   ├── icon/            Icon
│   │   │   ├── icon-button/     IconButton
│   │   │   ├── menu/            Menu
│   │   │   ├── pagination/      Pagination
│   │   │   ├── split-button/    SplitButton
│   │   │   ├── table/           Table
│   │   │   ├── tag/             Tag
│   │   │   ├── text/            Text
│   │   │   ├── themeToggle/     Theme toggle
│   │   │   ├── toast/           Toast (Sonner)
│   │   │   ├── toggle-button/   ToggleButton
│   │   │   └── tooltip/         Tooltip
│   │   ├── Form/                Form components
│   │   │   ├── CustomTextField/ Text field
│   │   │   ├── CustomSelect/    Select
│   │   │   ├── SimpleSelect/    Simple select
│   │   │   ├── MultipleSelect/  Multi-select
│   │   │   ├── MultiSelectAutocomplete/ Autocomplete
│   │   │   ├── DateTimePicker/  DateTime picker
│   │   │   └── RegisterForm/    Registration form
│   │   ├── Table/               DataGrid table
│   │   ├── Map3D/               3D map
│   │   ├── MapLibre/            MapLibre map
│   │   └── examples/            Sample implementations
│   ├── stories/                 Storybook stories
│   │   ├── 00-Guide/            Guides & tutorials
│   │   ├── 01-DesignPhilosophy/ Design philosophy
│   │   ├── 02-DesignTokens/     Design tokens
│   │   ├── 03-Layout/           Layout
│   │   ├── 04-Components/       Components
│   │   ├── 05-Patterns/         Patterns
│   │   └── _shared/             Shared utilities
│   ├── themes/                  Theme definitions
│   │   ├── colorToken.ts        Color tokens (Light/Dark x 3 schemes)
│   │   ├── theme.ts             MUI theme generation
│   │   ├── typography.ts        Typography settings
│   │   └── breakpoints.ts       Breakpoint definitions
│   ├── layouts/                 Layout components
│   │   ├── layout/              Main layout
│   │   ├── sidebar/             Sidebar
│   │   ├── header/              Header
│   │   ├── sideNav/             Side navigation
│   │   └── settingDrawer/       Settings drawer
│   ├── hooks/                   Custom hooks
│   ├── contexts/                React Context
│   ├── store/                   Zustand store
│   ├── services/                Service layer
│   ├── pages/                   Landing page
│   ├── types/                   TypeScript type definitions
│   ├── utils/                   Utilities
│   ├── mocks/                   Mock data
│   ├── constants/               Constants
│   ├── styles/                  Global styles
│   ├── test/                    Test setup
│   └── assets/                  Static assets
├── apps/                        Demo applications
│   ├── saas-dashboard/          SaaS Dashboard (CRUD, DataGrid, Calendar, Map)
│   ├── ubereats-clone/          KazeEats (Restaurant search, cart, ordering)
│   └── sky-kaze/                KazeLogistics (Delivery monitoring, real-time maps)
├── packages/
│   └── system-design-export/    CLI: Theme to W3C DTCG token conversion
├── mcp/                         MCP server
│   └── src/
│       ├── server.ts            Server implementation
│       ├── tools/               4 tools (get_token, get_component, check_rule, search)
│       └── utils/               Loaders & utilities
├── figma-plugin/                Figma plugin "System Design"
├── foundations/                  Design foundations
│   ├── design_philosophy.md     7 design principles
│   ├── prohibited.md            30+ prohibited patterns (with IDs)
│   └── ai-architect.md          AI architect design document
├── metadata/
│   └── components.json          Component metadata
├── design-tokens/
│   └── tokens.json              W3C DTCG format design tokens
├── docs/                        Documentation
├── scripts/                     Build & automation scripts
├── .storybook/                  Storybook configuration
├── .claude/skills/              Claude Code skills (3)
└── .cursor/rules/               Cursor IDE rules
```

---

## 4. Theme System

### Overview

The theme system under `src/themes/` builds MUI themes with 3 color schemes (Kaze, Dracula, Monotone) for both Light and Dark modes, switchable at runtime.

### Color Tokens (`colorToken.ts`)

```
ColorScheme = 'dracula' | 'kaze' | 'monotone'

createLightThemeColors(scheme) -> ThemeColors
createDarkThemeColors(scheme)  -> ThemeColors
```

**ThemeColors structure**:

```typescript
interface ThemeColors {
  primary: ColorSet // main, dark, light, lighter, contrastText
  secondary: ColorSet
  success: ColorSet
  info: ColorSet
  warning: ColorSet
  error: ColorSet
  grey: GreyShades // 50-900 (11 steps)
  text: { primary; secondary; disabled; white }
  background: { default; paper }
  action: { hover; selected; disabled; active }
  surface: { background; backgroundDark; backgroundDisabled }
  icon: { white; light; dark; action; disabled }
  divider: string
  common: { black; white }
}
```

**Scheme-specific color design**:

- **Semantic colors** (primary, secondary): Switch environment color via scheme's `lighter`
- **Status colors** (success, info, warning, error): Shared across schemes with fixed `lighter`
- **Environment colors** (background, text, action, surface, icon, divider): Completely different color sets per scheme

### Theme Generation (`theme.ts`)

```typescript
// Common options
commonThemeOptions = {
  spacing: 4,              // 4px base
  shape: { borderRadius: 8 },
  typography: typographyOptions,
  breakpoints: muiBreakpoints,
  shadows: [...]           // Tailwind shadow scale aligned
}

// Theme generators
lightTheme       = createTheme(commonThemeOptions + lightColors)
createDarkTheme(scheme) = createTheme(commonThemeOptions + darkColors(scheme))
```

### Typography (`typography.ts`)

- **Base font**: Inter, Noto Sans JP, sans-serif
- **Base size**: 14px (`htmlFontSize: 16`, `fontSize: 14`)
- **Custom variants**: displayLarge / displayMedium / displaySmall / xxl / xl / lg / ml / md / sm / xs
- **Font weights**: Light(300) / Regular(400) / Medium(500) / Bold(700)

### Breakpoints (`breakpoints.ts`)

| Key     | Value  | Target                     |
| ------- | ------ | -------------------------- |
| mobile  | 0px    | Smartphones                |
| tablet  | 768px  | Tablets                    |
| laptop  | 1366px | Laptops (minimum baseline) |
| desktop | 1920px | Desktops (recommended)     |

Both MUI standard keys (xs/sm/md/lg/xl) and Tailwind breakpoints are supported.

**Container max widths**:

| Variant  | Value  | Usage              |
| -------- | ------ | ------------------ |
| standard | 1280px | Pages with sidebar |
| narrow   | 960px  | Forms, articles    |
| wide     | 1600px | Dashboards, tables |
| full     | 100%   | Maps, fullscreen   |

---

## 5. Component Design

### Two Approaches

1. **CVA-based** (Pure Tailwind): `Button`, `Card`, etc. MUI-independent and lightweight
2. **MUI Customized**: `CustomTextField`, `ConfirmDialog`, `DataGrid`, etc. Styled via theme tokens

### CVA Button (`src/components/ui/Button.tsx`)

```typescript
// class-variance-authority manages variants and sizes
const buttonVariants = cva('base-classes...', {
  variants: {
    variant: { default, destructive, outline, secondary, ghost, link },
    size: { default, sm, lg, icon },
  },
})

// Uses React.forwardRef for ref forwarding
// React.FC is prohibited -> typed via ButtonHTMLAttributes + VariantProps
```

### ConfirmDialog (`src/components/ui/dialog/ConfirmDialog.tsx`)

Replacement for `window.confirm()`. Based on MUI Dialog with loading state and custom content support.

### Component Naming Conventions

- **Component names**: PascalCase (English)
- **File names**: PascalCase.tsx
- **Props types**: `ComponentNameProps` (defined with `type`)
- **Exports**: named export (`export const`)
- **Comments**: Japanese

### Prohibited Patterns (Excerpt)

| Pattern                | Correct Approach                  |
| ---------------------- | --------------------------------- |
| `React.FC` / `FC`      | Plain function + typed props      |
| `any` type             | Proper type definitions           |
| Semicolons             | Prettier `semi: false`            |
| Double quotes          | `singleQuote: true`               |
| `<Grid item xs={12}>`  | `<Grid size={{ xs: 12 }}>`        |
| Hardcoded color values | Token references (`primary.main`) |
| `window.confirm()`     | `ConfirmDialog` component         |
| default export         | named export                      |

Full list: `foundations/prohibited.md`

---

## 6. ChatSupport (AI Chat)

### Architecture

```
ChatSupport.tsx
  ├── chatAiService.ts      OpenAI / Gemini API calls
  ├── embeddingSearch.ts     Semantic search logic
  ├── embeddingService.ts    text-embedding-3-small API
  ├── faqDatabase.ts         Offline FAQ database
  ├── storyGuideMap.ts       Story-specific guide map
  ├── muiKnowledge.ts        MUI knowledge base
  ├── chatSupportConstants.ts Constants & configuration
  ├── chatSupportTypes.ts    Type definitions
  ├── writingPatterns.ts     Writing style patterns
  ├── CodeBlock.tsx          Code block rendering
  ├── BookConciergeIcon.tsx  Icon
  └── useResize.ts           Resize hook
```

### Two-layer Search

1. **Offline search (Fuse.js)**: Works without API key. Fuzzy search over FAQ database
2. **Semantic search (OpenAI Embedding)**: Vectorized with `text-embedding-3-small` (512 dimensions). Cross-searches FAQ / StoryGuide / MUI Knowledge

### API Support

- **OpenAI**: GPT-5 series (nano, mini, etc.) + legacy models
- **Gemini**: Google Generative AI (OpenAI-compatible endpoint)

### Storybook Integration

Injected into all stories via the Decorator in `.storybook/preview.tsx`.
Passes `currentStory` (title, name, description) for page context awareness.

---

## 7. Applications

### Monorepo Structure

Managed via `pnpm-workspace.yaml`:

```yaml
packages:
  - '.' # Main library
  - 'apps/*' # Demo apps
  - 'packages/*' # CLI tools
  - 'mcp' # MCP server
```

### SaaS Dashboard (`apps/saas-dashboard/`)

SaaS admin panel demo with CRUD operations, MUI DataGrid, calendar, and maps.

- Vite + React + TypeScript
- Shares components and themes from the main library

### KazeEats (`apps/ubereats-clone/`)

Food delivery app demo with restaurant search, cart management, and order flow.

- Custom theme extensions
- Shared utilities

### KazeLogistics (`apps/sky-kaze/`)

Logistics app demo with delivery monitoring, real-time map display, and dashboard.

- MapLibre GL for map features
- Additional custom components

---

## 8. MCP Integration

### MCP Server (`mcp/`)

Model Context Protocol server enabling AI agents to programmatically access design system information.

**4 Tools**:

| Tool            | Description                                     |
| --------------- | ----------------------------------------------- |
| `get_token`     | Get design tokens by dot path                   |
| `get_component` | Get component specifications                    |
| `check_rule`    | Check code snippets against prohibited patterns |
| `search`        | Cross-search tokens and components              |

**3 Resources**: Loads tokens.json, components.json, and prohibited.md

### Storybook MCP Addon

`@storybook/addon-mcp` enabled in `.storybook/main.cjs`.
Exposes Storybook component information to external tools via MCP.

### Claude Code Skills (`.claude/skills/`)

| Skill              | Description                                     |
| ------------------ | ----------------------------------------------- |
| `design-review`    | Check files against DS rules, detect violations |
| `create-component` | Generate new component scaffold                 |
| `sync-tokens`      | Sync theme to tokens.json to Figma              |

### Cursor Rules (`.cursor/rules/`)

| Rule                     | Description        |
| ------------------------ | ------------------ |
| `kaze-design-system.mdc` | General DS rules   |
| `color-system.mdc`       | Color system rules |

---

## 9. Build & Deploy

### Vite Configuration (`vite.config.ts`)

Three build modes with conditional branching:

1. **Library mode**: ES/CJS output. Externalizes React, MUI, etc.
2. **Sandbox mode**: Builds LP as a web application
3. **GitHub Pages mode**: Sets base path to `/kaze-ux/`

**Emotion integration**: `@vitejs/plugin-react` + `@emotion/babel-plugin` for JSX pragma.

**Path alias**: `@/` maps to `src/`

### Vercel Deployment (`vercel.json` + `scripts/vercel-build.mjs`)

Consolidates all apps under `dist/`:

```
1. LP (sandbox) -> dist/
2. Storybook -> dist/storybook/
3. SaaS Dashboard -> dist/saas/
4. KazeEats -> dist/ubereats/
5. KazeLogistics -> dist/sky-kaze/
```

URL rewrites:

```json
{ "source": "/storybook/(.*)", "destination": "/storybook/$1" }
{ "source": "/saas/(.*)", "destination": "/saas/$1" }
{ "source": "/ubereats/(.*)", "destination": "/ubereats/$1" }
{ "source": "/sky-kaze/(.*)", "destination": "/sky-kaze/$1" }
```

### Storybook Build

```javascript
// .storybook/main.cjs
framework: '@storybook/react-vite'
addons: ['addon-a11y', 'addon-links', 'addon-docs', 'addon-mcp']
```

Environment variables are explicitly injected via `viteFinal` (VITE_APP_PASSWORD, VITE_OPENAI_API_KEY, etc.).

---

## 10. Testing Strategy

### Configuration (`vitest.config.ts`)

- **Environment**: jsdom
- **Pool**: forks (memory isolation)
- **Coverage**: V8 provider
- **Reporters**: verbose, html, json
- **Excluded**: node_modules, dist, stories, config files, apps/

### Testing Utilities

- **Testing Library**: `@testing-library/react` + `@testing-library/user-event`
- **Matchers**: `@testing-library/jest-dom`

### Commands

| Command           | Description   |
| ----------------- | ------------- |
| `pnpm test`       | Single run    |
| `pnpm test:watch` | Watch mode    |
| `pnpm test:all`   | With coverage |
| `pnpm test:ui`    | Vitest UI     |

---

## 11. Code Conventions

### Prettier (`.prettierrc.json`)

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "jsxSingleQuote": true,
  "bracketSameLine": true
}
```

### ESLint (`eslint.config.js`)

Flat config format with the following plugins:

- `typescript-eslint`: TypeScript rules
- `eslint-plugin-react` + `react-hooks`: React rules
- `eslint-plugin-import`: Import ordering
- `eslint-plugin-unused-imports`: Remove unused imports
- `eslint-plugin-tailwindcss`: Tailwind CSS rules
- `eslint-config-prettier`: Prevent Prettier conflicts

### TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "paths": { "@/*": ["src/*"] }
  }
}
```

### Git Hooks (Husky + lint-staged)

```json
{
  "*.{js,jsx,ts,tsx}": ["pnpm run lint"],
  "*.{css,scss,json,md}": ["pnpm run format"]
}
```

---

## 12. Environment Requirements

| Requirement | Version         |
| ----------- | --------------- |
| Node.js     | 22.14.0 (Volta) |
| pnpm        | 10.2.1          |
| TypeScript  | 5.9             |

---

## 13. Storybook Structure

### Category Organization

```
00-Guide/              Getting started guides & tutorials
01-DesignPhilosophy/   Design philosophy
02-DesignTokens/       Colors, typography, spacing, shadows, etc.
03-Layout/             Layout patterns
04-Components/         UI / Form / Maps
05-Patterns/           Composite patterns
```

### Decorator (`preview.tsx`)

Provides to all stories:

- MUI ThemeProvider + Emotion CacheProvider
- Light / Dark theme switching (toolbar)
- Color scheme switching (Dracula / Kaze)
- Padding control
- ChatSupport widget injection
- Link navigation control (blockLinks parameter)

### Toolbar Controls

| Control | Description                          |
| ------- | ------------------------------------ |
| Theme   | Light / Dark (Dracula) / Dark (Kaze) |
| Padding | None / Standard                      |
| a11y    | Manual mode (default OFF)            |

---

## 14. Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Vercel (Production)                │
│  /           -> LP (Vite sandbox)                     │
│  /storybook/ -> Storybook 10                          │
│  /saas/      -> SaaS Dashboard                        │
│  /ubereats/  -> KazeEats                              │
│  /sky-kaze/  -> KazeLogistics                         │
└─────────────────────────────────────────────────────┘
         ^ scripts/vercel-build.mjs
         |
┌────────┴────────┐
│   pnpm workspace │
│                  │
│  src/ (core)     │ <- Themes, components, tokens
│  apps/*          │ <- Import core to build each app
│  packages/*      │ <- CLI tools
│  mcp/            │ <- AI agent API
└──────────────────┘
         |
    ┌────┴─────────────────┐
    │  AI Agent Integration │
    │                       │
    │  MCP Server           │ <- tokens.json + components.json
    │  Claude Skills        │ <- design-review, create-component
    │  Cursor Rules         │ <- kaze-design-system.mdc
    │  ChatSupport          │ <- OpenAI Embedding + FAQ
    └───────────────────────┘
```
