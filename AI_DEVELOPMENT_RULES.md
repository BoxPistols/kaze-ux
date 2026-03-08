# AI Development Rules & Guidelines / AI開発ルール・ガイドライン (Single Source of Truth)

## AI Development Mode Startup / AI開発モード開始通知

```text
Kaze UX Design System - AI Development Assistant activated

Project Settings:
- Project name: Kaze UX Design System
- Tech stack: MUI v7, Tailwind CSS v3, TypeScript, React, Storybook
- Development rules: This file "AI_DEVELOPMENT_RULES.md" is the Single Source of Truth for all rules.

Required Checks:
- Zero ESLint errors
- MUI v7 new Grid API usage
- TypeScript strict mode compliance
- Follow existing patterns

AI Tool References:
- Claude: .claude/CLAUDE.md
- Cursor: .cursorrules
- Other AI: AGENTS.md

Starting development with emphasis on type safety and component quality.
```

## 1. Project Overview / プロジェクト概要

Kaze UX Design System - A UI component library and design system.

### 1.1. Tech Stack / 技術スタック

- **UI Framework**: MUI v7 (Material-UI)
- **Styling**: Tailwind CSS v3
- **Language**: TypeScript (strict mode required)
- **UI Library**: React
- **Documentation**: Storybook
- **Package Manager**: pnpm
- **Linting/Formatting**: ESLint, Prettier

### 1.2. Project Structure / プロジェクト構造

```bash
src/
├── components/     # Reusable components / 再利用可能なコンポーネント
├── stories/        # Storybook stories / Storybookストーリー
├── themes/         # MUI theme config / MUIテーマ設定
├── types/          # TypeScript types / TypeScript型定義
└── utils/          # Utilities / ユーティリティ関数
```

## 2. Commands / 重要なコマンド

| Category        | Command          | Description              |
| :-------------- | :--------------- | :----------------------- |
| **Development** | `pnpm dev`       | Start development server |
|                 | `pnpm storybook` | Start Storybook          |
| **Quality**     | `pnpm lint`      | Run ESLint               |
|                 | `pnpm format`    | Run Prettier             |
|                 | `pnpm fix`       | Run lint + format        |
| **Build**       | `pnpm build`     | Production build         |

## 3. Development Rules / 開発ルールとガイドライン

### 3.1. Core Principles / 基本原則

1. **ESLint compliance**: Zero errors required.
2. **Type safety**: TypeScript strict mode, `any` type is prohibited.
3. **Component reuse**: Always check for existing components before creating new ones.
4. **Bilingual**: User-facing messages and code comments in Japanese. Variable/function names in English (camelCase).
5. **No emoji**: Emoji usage is prohibited in AI-generated code and comments.
6. **Default branch**: The default branch is `main`.

### 3.2. MUI v7 Component Implementation / MUI v7 コンポーネント実装規約

#### Grid Component

- **New API (required)**: `<Grid size={{ xs: 12, sm: 6, md: 4 }}>`
- **Old API (deprecated)**: `<Grid item xs={12} sm={6} md={4}>` -- do not use

#### Component Props Type Definitions / コンポーネントのprops型定義

**IMPORTANT: React.FC / FC / FunctionComponent usage is completely prohibited**

```typescript
// Good: Plain function definition with explicit type
interface UserCardProps {
  name: string
  email: string
  avatar?: string
  onEdit?: () => void
}

export const UserCard = ({ name, email, avatar, onEdit }: UserCardProps) => {
  return null
}

// Bad: React.FC usage (PROHIBITED)
import { FC } from 'react'
export const UserCard: FC<UserCardProps> = ({ name, email }) => {
  // React.FC is prohibited
}

// Bad: any type usage
export const UserCard = (props: any) => {
  // any type is prohibited
}
```

**Why React.FC should not be used:**

- Implicit children type allows unintended props
- Limitations with generic types
- Limited defaultProps support in React 18+
- React team does not recommend React.FC

**See `.claude/skills/react-patterns/SKILL.md` for details.**

### 3.3. Naming Conventions / 命名規則

- **File names**: `camelCase` (e.g., `userCard.tsx`, `themeProvider.tsx`)
- **Component names**: `PascalCase` (e.g., `UserCard`, `ThemeProvider`)
- **Custom Hooks**: `use` + `PascalCase` (e.g., `useTheme`, `useBreakpoint`)
- **Event handlers**: `handle` + verb (e.g., `handleClick`, `handleChange`)
- **Boolean State**:
  - State check: `is` + adjective (e.g., `isOpen`, `isActive`, `isLoading`)
  - Ownership: `has` + noun (e.g., `hasError`, `hasData`)
  - Capability: `can` + verb (e.g., `canSubmit`, `canEdit`)
- **Functions/variables**: `camelCase` (e.g., `getUserData`, `themeColors`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_WIDTH`, `DEFAULT_THEME`)

### 3.4. Coding Style / コーディングスタイル

- **Indent**: 2 spaces
- **Line length**: Max 100 characters
- **Semicolons**: Omit (following Prettier config)
- **Quotes**: Single quotes (`'`) preferred
- **Trailing commas**: Required in objects, arrays, and TS type lists
- **Imports**: Use absolute paths, avoid deep relative paths (`../../`)
- **Functions**: Arrow functions (`const fn = () => {}`)
- **Exports**: Use `export const`

### 3.5. UI/UX Guidelines / UI/UX開発指針

- **Design system**: Maximize use of MUI v7 theme system and Tailwind CSS.
- **Styling**: Prefer Tailwind CSS, minimize custom CSS.
- **Accessibility**: Set proper `role` and `aria-*` attributes, ensure keyboard navigation.
- **Responsive design**: Mobile-first approach, verify all breakpoints.

### 3.6. Performance Optimization / パフォーマンス最適化

- **Component splitting**: Break large components into smaller ones.
- **Lazy loading**: Use `React.lazy` where appropriate.
- **Memoization**: Use `useMemo` for expensive computations, `useCallback` for callbacks.

### 3.7. Storybook Standards / Storybook 実装規約

- **Story placement**: Place `ComponentName.stories.tsx` in the same directory as the component
- **Variations**: Provide stories for key states (default, loading, error, etc.)
- **Documentation**: Clearly describe component usage
- **Accessibility**: Verify with Storybook addon-a11y

### 3.8. Anti-Patterns to Avoid / 避けるべきアンチパターン

- **`React.FC` / `FC` usage**: Completely prohibited (ESLint error)
- **`any` type usage**: Prohibited. If unavoidable, add a comment explaining why
- **Inline styles**: Use Tailwind CSS or MUI sx prop
- **console.log remnants**: Do not commit debug console.log
- **Deep nesting**: Max 4 levels of component nesting

## 4. Workflow / ワークフロー

### 4.1. Development Checklist / 開発フローのチェックリスト

- **Before implementation**:
  - [ ] Check for existing similar components
  - [ ] Review design system tokens
- **During implementation**:
  - [ ] TypeScript strict mode compliance
  - [ ] Accessibility considerations
  - [ ] Responsive design implementation
- **After implementation**:
  - [ ] Verify zero `pnpm lint` errors
  - [ ] Create Storybook stories
  - [ ] Run accessibility checks

### 4.2. Pull Request Guidelines / プルリクエストのガイドライン

- **Before PR**: Verify `pnpm lint` and `pnpm build` succeed
- **Commit messages**: Follow Conventional Commits format
  - Example: `feat: add user card component`
  - Example: `fix: correct theme color type definition`
  - Example: `docs: update Storybook documentation`
- **No emoji**: Do not use emoji in commit messages

## 5. AI-Driven Development / AI駆動開発プロセス

### 5.1. Core Principles / AI統合開発の基本原則

All AI agents (Claude, Cursor, etc.) should follow this process:

#### Task Analysis and Planning / タスク分析と計画

1. **Analyze instructions**: Summarize the main task concisely
2. **Check rules**: Always review this AI_DEVELOPMENT_RULES.md
3. **Identify requirements**: Identify key requirements and constraints
4. **Execution plan**: Determine concrete steps and optimal execution order

#### Preventing Duplicate Implementation / 重複実装の防止

Before implementation, verify:

- Existence of similar components
- Same or similar function/component names
- Opportunities for shared/common logic

#### Quality Management / 品質管理と問題対応

- Verify execution results promptly
- Follow error/inconsistency resolution process
- Check and fix lint errors

#### Final Review / 最終確認と報告

- Evaluate overall deliverables
- Verify alignment with original instructions
- Check for duplicate implementations

### 5.2. Constraints / 重要な制約事項

- **No unauthorized changes**: Report unasked changes as proposals, implement after approval
- **Design change restrictions**: Layout, color, font, spacing changes are prohibited by default
- **Fixed tech stack**: Do not change MUI v7, Tailwind CSS v3 versions without approval

### 5.3. Package Management / パッケージ管理ルール

**pnpm only**: npm commands are prohibited

- **Add dependency**: `pnpm add <package>`
- **Install dependencies**: `pnpm install`
- **Prohibited**: `npm install`, `npm` commands, creating `package-lock.json`

## 6. Claude Code Skills

This project has the following custom Skills:

### Available Skills / 利用可能なSkills

1. **react-patterns** - React component implementation patterns (critical)
   - React.FC prohibition rules
   - Recommended alternative patterns
   - TypeScript type definition best practices
   - Performance optimization patterns

2. **mui-v7-component** - MUI v7 component creation guide
   - New Grid API usage
   - TypeScript type definitions (no React.FC)
   - Tailwind CSS integration
   - Responsive design

3. **storybook-story** - Storybook story creation guide
   - Story structure
   - Variation definitions
   - Documentation
   - Accessibility checks

4. **theme-customization** - Theme customization guide
   - Color palette settings
   - Typography settings
   - Breakpoint definitions
   - Component style customization

Skills are activated automatically. See `.claude/skills/` directory for details.

## 7. AI Agent Instructions / AIエージェントへの特別指示

### For Claude

- Generate comprehensive component implementations
- Strictly define TypeScript types
- Generate Storybook stories alongside components
- Implement with accessibility in mind

### For Cursor

- Prioritize inline completion
- Learn from existing patterns
- Use MUI v7 new API

### For Other AI

- Always reference this AI_DEVELOPMENT_RULES.md
- Strictly enforce no-emoji rule
- Follow Japanese comments, English code convention

## 8. CI/CD and AI Review / CI/CD と AI レビュー設定

### 8.1. Automated Quality Checks / 自動品質チェック

The following checks run automatically on PR creation:

| Workflow            | Description                               |
| :------------------ | :---------------------------------------- |
| `quality-check.yml` | ESLint, TypeCheck, tests, Storybook build |
| `ci.yml`            | Build verification, Storybook build       |

### 8.2. AI Review Features / AI レビュー機能

#### Project Rule Check (automatic) / プロジェクトルールチェック

The following items are checked automatically:

- **`React.FC` / `FC` / `FunctionComponent` usage (critical)**
- `any` type usage
- Old MUI Grid API (`Grid item`) usage
- `console.log` remnants (excluding test/story files)
- Emoji usage

### 8.3. GitHub Copilot Settings / GitHub Copilot 設定

#### Copilot Instructions

Project-specific instructions are in `.github/copilot-instructions.md`.

#### Copilot Exclusions

`.copilotignore` excludes the following:

- Dependencies (`node_modules/`)
- Build artifacts (`dist/`, `build/`)
- Environment files (`.env*`)
- Auto-generated files (`*.min.js`, `*.d.ts`)

### 8.4. Multi-AI Agent System / マルチAIエージェント活用

| AI Agent       | Role                       | Config File                       |
| :------------- | :------------------------- | :-------------------------------- |
| Claude Code    | Main development assistant | `.claude/CLAUDE.md`               |
| GitHub Copilot | IDE code completion        | `.github/copilot-instructions.md` |
| Cursor         | Refactoring & type fixes   | `.cursorrules`                    |

## 9. Troubleshooting / トラブルシューティング

| Issue                     | Solution                                     |
| :------------------------ | :------------------------------------------- |
| **Type errors**           | Check TypeScript strict mode settings        |
| **Lint errors**           | Run `pnpm lint:fix` for auto-fix             |
| **Storybook won't start** | Run `pnpm install` to reinstall dependencies |
| **Build failures**        | Check `pnpm build` error messages            |

## 10. References / 参考資料

- [MUI v7 Documentation](https://mui.com/material-ui/)
- [MUI Grid Documentation](https://mui.com/material-ui/react-grid/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Storybook Documentation](https://storybook.js.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
