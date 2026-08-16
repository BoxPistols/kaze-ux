# Contributing to Kaze UX

Thank you for your interest in contributing to Kaze UX. This guide will help you get started.

## Getting Started

### Prerequisites

- **Node.js** 22 or later
- **pnpm** 9 or later (do not use npm or yarn)

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/kaze-ux.git
cd kaze-ux

# Install dependencies
pnpm install

# Start Storybook for development
pnpm storybook
```

## Development Workflow

### Before You Start

1. Check existing components to avoid duplication
2. Review the design token system in `src/themes/`
3. Read `AI_DEVELOPMENT_RULES.md` for coding standards

### Making Changes

1. Create a feature branch from `main`
2. Implement your changes following the coding standards below
3. Write or update Storybook stories for any component changes
4. Run quality checks before committing

### Quality Checks

```bash
# Lint and format
pnpm fix

# Run tests
pnpm test:run

# Build Storybook
pnpm build-storybook
```

CI also runs these. Run them locally to avoid surprises:

```bash
pnpm check:rules       # prohibited patterns are actually held
pnpm check:quickref    # CLAUDE.md Quick Reference matches the theme
pnpm check:ds-core     # the framework-agnostic core has no UI-library dependency
pnpm check:mcp         # the registered MCP server starts and answers
```

Two more run in CI with a browser (`pnpm exec playwright install chromium` first):
`check:a11y`, `check:css-vars`, `check:tailwind-consumer`.

### Generated files — do not edit by hand

These four are generated. CI regenerates them and fails if anything differs:

| File                            | Regenerate with        |
| ------------------------------- | ---------------------- |
| `design-tokens/tokens.json`     | `pnpm export-tokens`   |
| `design-tokens/kaze-tokens.css` | `pnpm export-css`      |
| `metadata/components.json`      | `pnpm export-metadata` |
| `foundations/prohibited.md`     | `pnpm export-rules`    |

**Regenerating only one of them will fail CI**, because the freshness check looks at
all of them together. `/sync-tokens` (Claude Code skill) runs all four plus the checks.

To add a component to `components.json`, write a Storybook story — it is picked up
automatically. Only things a story cannot express (prohibited patterns, accessibility
notes) go in `metadata/curated.json`, keyed by the generated key.

## Coding Standards

### TypeScript

- **Strict mode** is required -- no `any` types
- Use explicit type annotations for function parameters and return types
- Prefer `interface` for object shapes and `type` for unions/intersections

### React Components

- **Never use `React.FC`**, `FC`, or `FunctionComponent`
- Use plain function declarations with typed props:

```typescript
interface ButtonProps {
  label: string
  onClick?: () => void
}

export const Button = ({ label, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{label}</button>
}
```

### Styling

- Use **Tailwind CSS** as the primary styling approach
- Use **MUI sx prop** for component-specific overrides
- Avoid inline styles and custom CSS files

### MUI v7 Grid

Use the new Grid API:

```tsx
// Correct
<Grid size={{ xs: 12, sm: 6, md: 4 }}>

// Incorrect (deprecated)
<Grid item xs={12} sm={6} md={4}>
```

### Code Style

- **No semicolons** (configured via Prettier)
- **Single quotes** for strings
- **2-space indentation**
- **Arrow functions** (`const fn = () => {}`)
- **Named exports** (`export const`)
- **Trailing commas** in objects and arrays

### Naming Conventions

| Type                | Convention        | Example              |
| ------------------- | ----------------- | -------------------- |
| Files               | camelCase         | `userCard.tsx`       |
| Components          | PascalCase        | `UserCard`           |
| Hooks               | use + PascalCase  | `useTheme`           |
| Functions/Variables | camelCase         | `getUserData`        |
| Constants           | UPPER_SNAKE_CASE  | `MAX_WIDTH`          |
| Event Handlers      | handle + Verb     | `handleClick`        |
| Boolean State       | is/has/can + Noun | `isOpen`, `hasError` |

## Storybook Stories

Every component should have a corresponding `.stories.tsx` file:

- Place stories alongside the component
- Include variants for all major states (default, loading, error, etc.)
- Add accessibility checks
- Document usage with clear descriptions

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat: add user card component
fix: correct theme color type definition
docs: update Storybook documentation
refactor: simplify theme provider logic
test: add unit tests for custom select
```

## Pull Request Process

1. Ensure `pnpm lint` and `pnpm build` pass
2. Update or add Storybook stories as needed
3. Write a clear PR description explaining what and why
4. Request review from maintainers

## Package Manager

This project uses **pnpm exclusively**. Do not use `npm` or `yarn` commands, and do not create `package-lock.json` or `yarn.lock` files.

## Questions?

If you have questions about contributing, please open a GitHub issue.
