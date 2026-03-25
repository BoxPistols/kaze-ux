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

<!-- claude-memory-sync: auto-generated -->

## グローバル設計方針

# グローバル設計方針

## コンポーネント設計

- 単一責任。1コンポーネント1責務
- Props は必ず型定義。any 禁止
- 副作用は hooks に分離する

## 命名規則

- コンポーネント: PascalCase
- hooks: use プレフィックス
- 定数: UPPER_SNAKE_CASE

## Claude への指示スタイル

- 差分だけ返す。ファイル全体を返さない
- 変更理由を1行コメントで添える
- 選択肢がある場合は推奨を1つ明示してから提示する

## 禁止パターン

- any の使用
- console.log の commit
- ハードコードされた文字列（i18n対象はすべて定数化）

---

## AI チャット汎用パターン

### ハイブリッド AI 戦略（オフライン + オンライン）

- 常にオフライン動作可能: FAQ ローカル検索（Fuse.js ファジーマッチ）
- AI があれば強化: Embedding セマンティック検索 + LLM 生成
- AI エラー時: FAQ フォールバック
- 3層: Semantic Search → Keyword Search → Hardcoded Suggestions

### OpenAI/Gemini デュアル対応

- Gemini は OpenAI 互換エンドポイント (`generativelanguage.googleapis.com/v1beta/openai/`) 経由
- Bearer 認証統一。`model.includes('gemini')` で分岐
- レスポンス抽出: OpenAI標準 / Responses API / Gemini native の3形式を正規化

### Embedding セマンティック検索

- `text-embedding-3-small` (512次元に短縮でコスト削減)
- インメモリ VectorIndex（バッチ100件単位でAPI呼び出し）
- コサイン類似度: `dot / (norm_a * norm_b)`, threshold=0.3, topK=5

### ページ文脈認識パターン

- 現在のページ情報 `{ title, name, description }` をシステムプロンプトに動的注入
- 指示語解決: 「このUI何?」→ 現在ページのコンポーネントを特定
- 応用: ドキュメントビューア等で「現在地」パラメータを渡すだけで同じ仕組みが使える

### ペルソナ検出

- ページシグナル(+2点) + 語彙シグナル(+1点/match) でスコアリング
- 閾値2以上で判定（designer/engineer/unknown）
- ペルソナ別プロンプト拡張を動的注入

### APIキー管理パターン

- ビルド時デフォルト (`import.meta.env`) → ユーザー入力上書き (localStorage)
- モデル互換性チェック（defaultKey 使用時に制限）
- 接続テスト UI

### ショートカット管理

- KeyDown 捕捉 + IME対応 (`e.nativeEvent.isComposing`)
- 修飾キー正規化（Mac: Cmd / Windows: Ctrl 自動判定）
- localStorage 永続化 + リセット機能

## Storybook 汎用パターン

### テーマ切替

- toolbar globalTypes で複数テーマを定義
- `parseThemeValue()` で "dark-scheme" → mode + scheme に分離
- `data-theme-transitioning` 属性で切替トランジション制御（350ms）
- 初回マウントはトランジションなし

### Decorator 多重ラップ

- Emotion ThemeProvider → MUI ThemeProvider → CacheProvider → CssBaseline
- パラメータ制御: noPadding / fullscreenNoPadding / blockLinks
- コンテキスト注入: viewMode 判定で docs 時は特定コンポーネント非表示

### Story カテゴリ設計

- 番号プレフィックス (00-Guide, 01-Philosophy, 02-Tokens, ...) でソート順を制御
- storySort で明示的順序指定

## デザインシステム汎用パターン

### マルチスキーム対応

- ColorSet: { main, dark, light, lighter, contrastText } の統一インターフェース
- lighter スロットをスキーム環境色で上書き（セマンティック色は固有 lighter を保持）
- CSS Variables で Tailwind と MUI を色共有

### CVA (class-variance-authority) パターン

- variant × size のマトリクスで型安全なバリエーション管理
- Tailwind utility + CVA = styled-components 不要
- shadcn/ui 互換の設計

### MUI + Tailwind 共存

- MUI: 複雑な UI コンポーネント（Dialog, DataGrid 等）→ theme.palette トークン参照
- Tailwind: シンプルなコンポーネント（Button, Card）→ CVA + CSS Variables
- tailwind.config で `var(--color-*)` を colors に定義 → テーマ自動切替

### W3C DTCG トークン

- `$value` + `$type` 形式で機械可読
- light/dark を同一ファイルに構造化
- Figma / デザインツール連携可能

### コンポーネントメタデータ

- JSON で name/category/path/variants/sizes/accessibility/prohibited/sample を定義
- AI エージェントがコンポーネント仕様を自動認識可能

## LP 汎用パターン

### framer-motion アニメーション

- `useInView({ once: true })` + stagger (index \* delay) でスクロールトリガー
- `useScroll` + `useTransform` でパララックス効果
- カスタムイージング: `[0.25, 0.1, 0, 1]` でモダンな減速感
- グラデーションオーブ: `radial-gradient` + `blur` + keyframes で有機的な背景

### ダークモード分岐

- `const isDark = theme.palette.mode === 'dark'`
- alpha 値で分岐: dark=0.15, light=0.12（色付きシャドウ）
- bgcolor/borderColor を三項演算子で切替

### ホバー効果統一パターン

- `transition: 'border-color 0.2s ease, box-shadow 0.2s ease'`
- `&:hover: { boxShadow: '0 12px 40px rgba(brand,alpha)', borderColor: 'primary.main' }`
- 全カード系コンポーネントで共通化

### レスポンシブ

- CONTAINER_SX: `{ maxWidth: 1120, mx: 'auto', px: { xs: 2.5, sm: 3, md: 4 } }`
- Grid: `gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }`
- フォント: `fontSize: { xs: '2rem', md: '2.8rem' }`

## モノレポ汎用パターン

### pnpm workspace + Turborepo

- `pnpm-workspace.yaml` でパッケージ定義
- `workspace:*` でルートパッケージを apps から参照
- turbo.json: `dependsOn: ["^build"]` で依存順ビルド、dev は `cache: false, persistent: true`

### 統合ビルド・デプロイ（Vercel）

- ビルドスクリプトで全アプリを `dist/` サブディレクトリに出力
- `vercel.json` の rewrites でパスルーティング（`/app-name/(.*)` → `/app-name/$1`）
- 各アプリは `VITE_BASE_PATH=/app-name/` でビルド

### ポート管理

- デフォルトポートを定数定義
- localStorage で上書き可能（開発者向け設定パネル）
- ポート生存確認: HEAD fetch + timeout → 隣接ポートスキャン
- ローカル/本番リンク自動切替: `isDev ? localhost:PORT : origin + path`

### dev:all 一括起動

- `pnpm dev & pnpm storybook & pnpm -F app1 dev & ... & wait`
- 個別起動: `pnpm --filter app-name dev`

---

<!-- このファイルは claude-memory-sync が管理します -->
<!-- 自由に編集してください。cm コマンドで同期されます -->

## プロジェクト固有の記憶（kaze-ux）

# kaze-ux プロジェクト記憶

## モノレポ構成

- pnpm workspace + Turborepo
- ワークスペース: `.`(ルート), `apps/*`, `packages/*`, `mcp`
- アプリは `workspace:*` でルートの共有コンポーネント・テーマを参照
- `dev:all` で5プロセス同時起動（LP:5173, Storybook:6007, SaaS:3001, KazeEats:3002, KazeLogistics:3003）
- `appLinks.ts` でローカル/本番のリンク自動切替（isDev → localhost:PORT, 本番 → origin + path）
- ポートは localStorage で上書き可能（DevPortSettings パネル、DEV環境のみ表示）
- Vercel: `scripts/vercel-build.mjs` で全アプリを `dist/` に統合ビルド → rewrites でルーティング

## Storybook

- Storybook 10 + `@storybook/react-vite`
- アドオン: a11y, links, docs, mcp
- テーマ切替: Light / Dark(Dracula) / Dark(Kaze) の3モード（toolbar globalTypes）
- `parseThemeValue()` で `dark-dracula` → mode=dark, scheme=dracula に分離
- Decorator: MUI ThemeProvider + Emotion CacheProvider + CssBaseline の多重ラップ
- ChatSupport: `viewMode !== 'docs'` のとき全 Story に自動注入
- パラメータ制御: `noPadding`, `fullscreenNoPadding`, `blockLinks`, `forceDarkTheme`
- manager.ts: Kaze 独自テーマ（dark base, #0EADB8 primary, Inter + Noto Sans JP）
- Story カテゴリ: 00-Guide → 01-DesignPhilosophy → 02-DesignTokens → 03-Layout → 04-Components → 05-Patterns → 06-Tools
- ビルド設定: env を `viteFinal` で define 注入、パスワード認証は managerHead で注入

## AI チャット (ChatSupport)

- OpenAI/Gemini デュアル対応: Gemini は OpenAI 互換エンドポイント経由、Bearer 認証統一
- `callAI()` → `extractContent()` で複数レスポンス形式を正規化（OpenAI標準/Responses API/Gemini native）
- セマンティック検索: `text-embedding-3-small` (512次元), インメモリ VectorIndex, コサイン類似度, topK=5, threshold=0.3
- 知識ベース3層: FAQ(faqDatabase) + StoryGuide(storyGuideMap) + MUI Knowledge(muiKnowledge)
- オフライン動作: Fuse.js ファジー検索 + 同義語展開（SYNONYM_MAP）
- フォールバック: Semantic Search → FAQ Keyword → Hardcoded Suggestions
- ページ文脈認識: `currentStory: { title, name, description }` → システムプロンプトに動的注入
- ペルソナ検出: ページシグナル(+2) + 語彙シグナル(+1/match) → designer/engineer/unknown
- ペルソナ別プロンプト拡張: デザイナー向け（Figma橋渡し）/ エンジニア向け（コードファースト）
- 設定: localStorage に apiKey/model/uiMode/sidebarWidth/shortcuts を永続化
- ショートカット: 8アクション、IME対応（isComposing チェック）、Mac/Windows 自動判定
- UI: ウィジェット（FAB + 浮遊パネル）/ サイドバー（リサイズ可能）切替
- Storybook 専用として維持。他アプリ設置は費用対効果が低い（contextMap 新規作成が必要）

## デザインシステム

- カラー: マルチスキーム（Kaze/Dracula/Monotone）× Light/Dark = 6テーマ
- プライマリ: #0EADB8（ティール）、フォント: Inter + Noto Sans JP、baseFontSize=14px
- spacing: 4px基準、borderRadius: xs=4/sm=6/md=8/lg=10/xl=12/2xl=16
- ブレイクポイント: mobile(0)/tablet(768)/laptop(1366)/desktop(1920)
- CVA (class-variance-authority): Button/Card で shadcn 互換バリアントパターン
- MUI + Tailwind 共存: MUI は複雑 UI、Tailwind は CVA コンポーネント。CSS Variables で色共有
- W3C DTCG トークン: `design-tokens/tokens.json` で機械可読
- メタデータ: `metadata/components.json` で全コンポーネント仕様を AI 可読に
- 禁止: React.FC / any / セミコロン / ダブルクォート / Grid item旧API / ハードコード色 / window.confirm()

## LP (ランディングページ)

- framer-motion: グラデーションオーブ3層 + グリッド + パーティクル8個 + 装飾リング
- キーフレーム: orbDrift(16s), orbFloat(12s), particle(6-22s), ringRotate(24-30s)
- スクロール連動: `useScroll` + `useTransform` でヒーローの opacity/scale 変換（0-15%範囲）
- ProductCard: `useInView` + stagger(index\*0.15s) + カスタムイージング [0.25,0.1,0,1]
- ホバー効果統一: `boxShadow: '0 12px 40px rgba(14,173,184,0.15/0.12)'` + `borderColor: primary.main`
- isDark 分岐: `theme.palette.mode === 'dark'` で alpha/bgcolor/borderColor を切替
- セクション: Hero → Products(4) → Features(6) → TechStack(8) → GettingStarted(3) → AI Chat → Footer
- CONTAINER_SX: `{ maxWidth: 1120, mx: 'auto', px: { xs: 2.5, sm: 3, md: 4 } }`
- BauhausDivider: 3バリアント(a/b/c) + flip + スクロール連動アニメーション

## Visual Editor

- `src/stories/06-Tools/` に配置。Storybook「Tools」カテゴリ
- ChatSupport の AI インフラ（callAI, extractContent, loadChatConfig）を再利用
- COMPONENT_REGISTRY でホワイトリスト制御（23コンポーネント登録）
- MAX_DEPTH=10 で再帰レンダリングの安全弁
- 3パネル: ComponentPalette(左) + LivePreview(中央) + PromptInput(下)
- プリセット4種: KPI Dashboard / Registration Form / Activity Feed / Settings Page
- プロトタイプ段階。テストコードなし

## ブランチ・PR 運用

- feature ブランチから main への PR は squash merge
- PR #18-#21: マージ済み
- PR #22: Visual Editor + ServiceCard ホバー効果（レビュー済み、マージ待ち）

---

<!-- このファイルは claude-memory-sync が管理します -->
