# Kaze UX Design System

## Project Overview

Kaze UX is a modern React design system built with MUI, Tailwind CSS, and Storybook. It provides a comprehensive set of UI components with light/dark mode support, design tokens, and accessibility compliance.

## Tech Stack

- **UI Framework**: MUI (Material-UI)
- **Styling**: Tailwind CSS
- **Language**: TypeScript (strict mode)
- **UI Library**: React
- **Documentation**: Storybook
- **Build Tool**: Vite
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

## AI Architect — 段階的読み込みガイド

このデザインシステムは AI エージェントが正確な UI コードを生成するための構造化データを提供する。

### Quick Reference（このファイルだけで基本 UI 生成可能）

**ブランドカラー**: `primary.main = #0EADB8` (ティール)
**フォント**: Inter + Noto Sans JP, baseFontSize = 14px
**スペーシング**: 4px 基準 (`spacing(1)=4px`, `spacing(2)=8px`)
**角丸**: xs=4, sm=6, md=8, lg=10, xl=12, 2xl=16, full=9999

**コンポーネント使用例**:

```tsx
// ボタン（CVA ベース）
<Button variant='outline' size='sm'>Click</Button>

// フォーム
<CustomTextField label='名前' required />
<CustomSelect label='都道府県' options={options} />

// レイアウト
<LayoutWithSidebar menuItems={items} appName='App'>
  <Grid size={{ xs: 12, sm: 6 }}>{content}</Grid>
</LayoutWithSidebar>
```

### タスク別読み込み

| タスク               | 読むファイル                                                       |
| -------------------- | ------------------------------------------------------------------ |
| 単体コンポーネント   | この CLAUDE.md のみ                                                |
| フォーム画面         | + `metadata/components.json` (Form カテゴリ)                       |
| テーマ/カラー変更    | + `src/themes/colorToken.ts` + `design-tokens/tokens.json`         |
| 新コンポーネント追加 | + `foundations/prohibited.md` + `foundations/design_philosophy.md` |
| Storybook Story 作成 | + `src/stories/` の既存 Story を参照                               |
| プロダクト画面構築   | + `apps/saas-dashboard/` or `apps/ubereats-clone/`                 |

### 禁止パターン（要約）

- `React.FC` / `any` / セミコロン / ダブルクォート
- `<Grid item xs={12}>` → `<Grid size={{ xs: 12 }}>`
- ハードコード色値 → トークン参照 (`primary.main`)
- `window.confirm()` → `ConfirmDialog` コンポーネント
- 詳細: `foundations/prohibited.md`

### 機械可読データ

| ファイル                           | 内容                                                                    |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `metadata/components.json`         | 20+ コンポーネントのメタデータ (variants, sizes, accessibility, sample) |
| `design-tokens/tokens.json`        | W3C DTCG 形式のデザイントークン                                         |
| `foundations/prohibited.md`        | 禁止パターン一覧                                                        |
| `foundations/design_philosophy.md` | 設計思想・7原則                                                         |
