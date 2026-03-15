# Kaze Design System — 設計思想

## Core Belief

> コンポーネントからプロダクトへ。人間にも、AIにも、読めるデザインシステム。

Kaze は「風」。軽快で一貫したUIを、デザイナーにもエンジニアにも AI エージェントにも届ける。

## 7 Principles

### 1. Token-First

色・文字・余白・影・角丸はすべてデザイントークンで定義。ハードコード値は禁止。

### 2. Semantic Naming

`primary.main` / `text.secondary` / `background.paper` — 意味ベースの命名で、テーマ切替時に自動対応。

### 3. Multi-Scheme

Light / Dark + 複数カラースキーム（Dracula, Kaze, Monotone）を MUI テーマで切替。

### 4. Accessibility by Default

WCAG 2.1 AA 準拠。コントラスト比 4.5:1 以上。`aria-*` 属性をコンポーネントに組み込み。

### 5. AI-Ready

CLAUDE.md + metadata JSON + MCP サーバーで、AI エージェントが正確な UI コードを生成可能。

### 6. Storybook as Knowledge Base

Storybook を「カタログ」ではなく「対話できるナレッジベース」に。ページ文脈認識 AI チャット搭載。

### 7. Product-Proven

SaaS Dashboard / KazeEats の2プロダクトで実証済み。理論ではなく実戦で鍛えた設計。

## Brand Identity

- **Primary**: `#0EADB8`（ティール）— 清涼感・信頼・先進性
- **Font**: Inter + Noto Sans JP
- **Grid**: 4px 基準、8px 推奨
- **Border Radius**: xs(4) / sm(6) / md(8) / lg(10) / xl(12) / 2xl(16)
