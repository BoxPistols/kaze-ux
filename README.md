# Kaze UX

A modern React design system built with MUI v7, Tailwind CSS, and Storybook.

## Features

- **MUI v7 + Tailwind CSS** hybrid styling system
- **Light/Dark mode** with smooth transitions
- **60+ documented UI components** with Storybook stories
- **AI-powered Storybook Concierge** (ChatSupport) for interactive component discovery
- **Design token system** in DTCG format
- **TypeScript strict mode** with zero `any` types
- **Accessibility (WCAG AA)** compliant components
- **Comprehensive Storybook documentation** with live examples

## Quick Start

```bash
# Clone
git clone https://github.com/your-username/kaze-ux.git
cd kaze-ux

# Install dependencies
pnpm install

# Run Storybook
pnpm storybook

# Start development server
pnpm dev
```

## Tech Stack

| Technology   | Version | Purpose                 |
| ------------ | ------- | ----------------------- |
| React        | 18      | UI library              |
| MUI          | v7      | Component framework     |
| Tailwind CSS | v3      | Utility-first styling   |
| TypeScript   | 5       | Type safety             |
| Storybook    | v10     | Component documentation |
| Vite         | 5       | Build tool              |
| Vitest       | Latest  | Unit testing            |
| MapLibre GL  | Latest  | Map visualization       |

## Project Structure

```
src/
  components/     # Reusable UI components
  stories/        # Storybook stories and documentation
  themes/         # MUI theme configuration and design tokens
  types/          # TypeScript type definitions
  utils/          # Utility functions and helpers
.storybook/       # Storybook configuration
.github/          # GitHub Actions workflows
```

## Available Scripts

| Command                | Description                    |
| ---------------------- | ------------------------------ |
| `pnpm dev`             | Start Vite development server  |
| `pnpm storybook`       | Start Storybook on port 6006   |
| `pnpm build`           | Production build               |
| `pnpm build-storybook` | Build static Storybook         |
| `pnpm lint`            | Run ESLint                     |
| `pnpm format`          | Run Prettier                   |
| `pnpm fix`             | Run lint + format              |
| `pnpm test`            | Run tests in watch mode        |
| `pnpm test:run`        | Run tests once                 |
| `pnpm test:all`        | Run tests with coverage report |

## AI Concierge

Kaze UX includes an AI-powered **ChatSupport** component integrated into Storybook. This concierge feature allows users to:

- Ask questions about available components in natural language
- Get real-time suggestions for component selection and usage
- Explore the design system interactively through conversation
- Receive code examples and implementation guidance

The AI Concierge is a key differentiator, making the design system more accessible and discoverable for both designers and developers.

## Design Tokens

The design system uses DTCG (Design Token Community Group) format for design tokens, ensuring compatibility with modern design tools and workflows. Tokens cover:

- Color palettes (light and dark modes)
- Typography scales
- Spacing and sizing
- Border radius and shadows
- Breakpoints

## Component Guidelines

- All components use **TypeScript strict mode** (no `any` types)
- **React.FC is prohibited** -- use plain function declarations with typed props
- Components follow **MUI v7 Grid API** (`size` prop instead of `item`/`xs`/`sm`)
- **Tailwind CSS** is the primary styling approach
- Every component has a corresponding **Storybook story**
- **Accessibility** is a first-class concern (WCAG AA compliance)

## Contributing

We welcome contributions. Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to get started.

## License

[MIT](./LICENSE)
