# Kaze UX Design System

## Project Overview

Kaze UX is a modern React design system built with MUI v7, Tailwind CSS v3, and Storybook v10. It provides a comprehensive set of UI components with light/dark mode support, design tokens, and accessibility compliance.

## Tech Stack

- **UI Framework**: MUI v7 (Material-UI)
- **Styling**: Tailwind CSS v3
- **Language**: TypeScript (strict mode)
- **UI Library**: React 18
- **Documentation**: Storybook v10
- **Build Tool**: Vite 5
- **Testing**: Vitest
- **Package Manager**: pnpm

## Key Rules

- **React.FC prohibition**: Never use `React.FC`, `FC`, or `FunctionComponent`. Use plain function declarations with typed props instead.
- **TypeScript strict mode**: No `any` types. All code must pass strict type checking.
- **No semicolons**: Prettier is configured to omit semicolons.
- **Single quotes**: Use single quotes for strings.
- **MUI v7 Grid API**: Use `<Grid size={{ xs: 12, sm: 6 }}>` (new API), not `<Grid item xs={12}>` (deprecated).
- **Arrow functions**: Use `const fn = () => {}` pattern for all functions.
- **Named exports**: Use `export const` instead of default exports.

## Commands

| Command                | Description              |
| ---------------------- | ------------------------ |
| `pnpm dev`             | Start development server |
| `pnpm storybook`       | Start Storybook          |
| `pnpm lint`            | Run ESLint               |
| `pnpm format`          | Run Prettier             |
| `pnpm fix`             | Run lint + format        |
| `pnpm test`            | Run tests (watch mode)   |
| `pnpm test:run`        | Run tests once           |
| `pnpm test:all`        | Run tests with coverage  |
| `pnpm build`           | Production build         |
| `pnpm build-storybook` | Build Storybook          |

## Project Structure

```
src/
  components/     # Reusable UI components
  stories/        # Storybook stories
  themes/         # MUI theme configuration
  types/          # TypeScript type definitions
  utils/          # Utility functions
```

## Bilingual Project

This project uses both Japanese and English:

- Code comments: Japanese preferred
- Variable/function names: English (camelCase)
- Component names: English (PascalCase)
- Documentation: Bilingual (Japanese + English)
