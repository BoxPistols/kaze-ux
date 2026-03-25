# Kaze UX アーキテクチャドキュメント

## 1. プロジェクト概要

Kaze UX は MUI v7 + Tailwind CSS + Storybook で構築されたモダンな React デザインシステム。
コンポーネントライブラリとしての配布に加え、3 つのデモアプリケーションを同一モノレポ内で開発・デプロイする。

### 設計目標

- **一貫性**: デザイントークンとテーマによる UI 統一
- **開発速度**: 再利用可能なコンポーネントとレイアウト
- **AI 連携**: MCP / Skills / IDE Rules による AI エージェント統合
- **アクセシビリティ**: WAI-ARIA 準拠、Storybook a11y アドオン
- **ドキュメント駆動**: Storybook をコンポーネントカタログ兼ガイドとして運用

---

## 2. テックスタック

### コア技術

| カテゴリ          | 技術              | バージョン | 役割                   |
| ----------------- | ----------------- | ---------- | ---------------------- |
| UI フレームワーク | MUI (Material UI) | v7         | コンポーネント基盤     |
| スタイリング      | Tailwind CSS      | v3         | ユーティリティ CSS     |
| CSS-in-JS         | Emotion           | v11        | MUI テーマスタイリング |
| 言語              | TypeScript        | v5.9       | strict mode 有効       |
| ビュー            | React             | v18        | UI レンダリング        |
| 状態管理          | Zustand           | v5         | グローバル状態         |
| ルーティング      | React Router      | v6         | SPA ルーティング       |
| アニメーション    | Framer Motion     | v12        | アニメーション         |

### 開発・ビルド

| カテゴリ       | 技術                     | 役割                   |
| -------------- | ------------------------ | ---------------------- |
| ドキュメント   | Storybook 10             | コンポーネントカタログ |
| ビルド         | Vite 5                   | バンドル・開発サーバー |
| テスト         | Vitest + Testing Library | ユニットテスト         |
| リント         | ESLint (flat config)     | コード品質             |
| フォーマット   | Prettier                 | コードスタイル         |
| Git フック     | Husky + lint-staged      | コミット前チェック     |
| パッケージ管理 | pnpm (workspace)         | モノレポ管理           |
| ビルド最適化   | Turbo                    | モノレポビルド         |
| デプロイ       | Vercel                   | ホスティング           |

### バリアント技術

| カテゴリ   | 技術                        | 役割                  |
| ---------- | --------------------------- | --------------------- |
| CVA        | class-variance-authority    | バリアント管理        |
| クラス結合 | clsx + tailwind-merge       | Tailwind クラス結合   |
| 日時       | Day.js                      | 日時操作              |
| 検索       | Fuse.js                     | ファジー検索          |
| マップ     | MapLibre GL / Mapbox GL     | 地図表示              |
| Markdown   | react-markdown + remark-gfm | Markdown レンダリング |
| トースト   | Sonner                      | 通知                  |
| D&D        | @dnd-kit                    | ドラッグ&ドロップ     |

---

## 3. ディレクトリ構造

```
kaze-ux/
├── src/                         メインライブラリソース
│   ├── components/              UI コンポーネント
│   │   ├── ui/                  汎用 UI (Button, Card, Dialog, ChatSupport...)
│   │   │   ├── button/          CVA ベース Button (loadingButton, saveButton)
│   │   │   ├── ChatSupport/     AI チャットウィジェット
│   │   │   ├── dialog/          ConfirmDialog 等
│   │   │   ├── card/            Card コンポーネント
│   │   │   ├── accordion/       Accordion
│   │   │   ├── avatar/          Avatar
│   │   │   ├── calendar/        Calendar
│   │   │   ├── chip/            Chip
│   │   │   ├── fab/             FloatingActionButton
│   │   │   ├── feedback/        フィードバック系
│   │   │   ├── icon/            アイコン
│   │   │   ├── icon-button/     IconButton
│   │   │   ├── menu/            Menu
│   │   │   ├── pagination/      Pagination
│   │   │   ├── split-button/    SplitButton
│   │   │   ├── table/           Table
│   │   │   ├── tag/             Tag
│   │   │   ├── text/            Text
│   │   │   ├── themeToggle/     テーマ切替
│   │   │   ├── toast/           Toast (Sonner)
│   │   │   ├── toggle-button/   ToggleButton
│   │   │   └── tooltip/         Tooltip
│   │   ├── Form/                フォームコンポーネント
│   │   │   ├── CustomTextField/ テキストフィールド
│   │   │   ├── CustomSelect/    セレクト
│   │   │   ├── SimpleSelect/    シンプルセレクト
│   │   │   ├── MultipleSelect/  マルチセレクト
│   │   │   ├── MultiSelectAutocomplete/ オートコンプリート
│   │   │   ├── DateTimePicker/  日時ピッカー
│   │   │   └── RegisterForm/    登録フォーム
│   │   ├── Table/               DataGrid テーブル
│   │   ├── Map3D/               3D マップ
│   │   ├── MapLibre/            MapLibre マップ
│   │   └── examples/            サンプル実装
│   ├── stories/                 Storybook ストーリー
│   │   ├── 00-Guide/            ガイド・チュートリアル
│   │   ├── 01-DesignPhilosophy/ 設計思想
│   │   ├── 02-DesignTokens/     デザイントークン
│   │   ├── 03-Layout/           レイアウト
│   │   ├── 04-Components/       コンポーネント
│   │   ├── 05-Patterns/         パターン
│   │   └── _shared/             共有ユーティリティ
│   ├── themes/                  テーマ定義
│   │   ├── colorToken.ts        カラートークン (Light/Dark x 3スキーム)
│   │   ├── theme.ts             MUI テーマ生成
│   │   ├── typography.ts        タイポグラフィ設定
│   │   └── breakpoints.ts       ブレイクポイント定義
│   ├── layouts/                 レイアウトコンポーネント
│   │   ├── layout/              メインレイアウト
│   │   ├── sidebar/             サイドバー
│   │   ├── header/              ヘッダー
│   │   ├── sideNav/             サイドナビゲーション
│   │   └── settingDrawer/       設定ドロワー
│   ├── hooks/                   カスタムフック
│   ├── contexts/                React Context
│   ├── store/                   Zustand ストア
│   ├── services/                サービス層
│   ├── pages/                   LP ページ
│   ├── types/                   TypeScript 型定義
│   ├── utils/                   ユーティリティ
│   ├── mocks/                   モックデータ
│   ├── constants/               定数
│   ├── styles/                  グローバルスタイル
│   ├── test/                    テストセットアップ
│   └── assets/                  静的アセット
├── apps/                        デモアプリケーション
│   ├── saas-dashboard/          SaaS Dashboard (CRUD, DataGrid, Calendar, Map)
│   ├── ubereats-clone/          KazeEats (レストラン検索, カート, 注文)
│   └── sky-kaze/                KazeLogistics (配送監視, リアルタイム地図)
├── packages/
│   └── system-design-export/    CLI: テーマ → W3C DTCG トークン変換
├── mcp/                         MCP サーバー
│   └── src/
│       ├── server.ts            サーバー本体
│       ├── tools/               4 ツール (get_token, get_component, check_rule, search)
│       └── utils/               ローダー・ユーティリティ
├── figma-plugin/                Figma プラグイン「System Design」
├── foundations/                  設計基盤
│   ├── design_philosophy.md     7 つの設計原則
│   ├── prohibited.md            30+ 禁止パターン (ID 付き)
│   └── ai-architect.md          AI アーキテクト設計ドキュメント
├── metadata/
│   └── components.json          コンポーネントメタデータ
├── design-tokens/
│   └── tokens.json              W3C DTCG 形式デザイントークン
├── docs/                        ドキュメント
├── scripts/                     ビルド・自動化スクリプト
├── .storybook/                  Storybook 設定
├── .claude/skills/              Claude Code スキル (3 つ)
└── .cursor/rules/               Cursor IDE ルール
```

---

## 4. テーマシステム

### 概要

`src/themes/` 配下で MUI テーマを構築。Light / Dark 各モードに 3 つのカラースキーム (Kaze, Dracula, Monotone) を提供し、ランタイムで切替可能。

### カラートークン (`colorToken.ts`)

```
ColorScheme = 'dracula' | 'kaze' | 'monotone'

createLightThemeColors(scheme) → ThemeColors
createDarkThemeColors(scheme)  → ThemeColors
```

**ThemeColors の構造**:

```typescript
interface ThemeColors {
  primary: ColorSet // main, dark, light, lighter, contrastText
  secondary: ColorSet
  success: ColorSet
  info: ColorSet
  warning: ColorSet
  error: ColorSet
  grey: GreyShades // 50-900 (11段階)
  text: { primary; secondary; disabled; white }
  background: { default; paper }
  action: { hover; selected; disabled; active }
  surface: { background; backgroundDark; backgroundDisabled }
  icon: { white; light; dark; action; disabled }
  divider: string
  common: { black; white }
}
```

**スキーム別の色設計**:

- **セマンティックカラー** (primary, secondary): スキームの `lighter` で環境色を切替
- **ステータスカラー** (success, info, warning, error): スキーム共通。固有の `lighter` を維持
- **環境色** (background, text, action, surface, icon, divider): スキームごとに完全に異なる色セット

### テーマ生成 (`theme.ts`)

```typescript
// 共通設定
commonThemeOptions = {
  spacing: 4,              // 4px 基準
  shape: { borderRadius: 8 },
  typography: typographyOptions,
  breakpoints: muiBreakpoints,
  shadows: [...]           // Tailwind shadow scale 準拠
}

// テーマ生成関数
lightTheme       = createTheme(commonThemeOptions + lightColors)
createDarkTheme(scheme) = createTheme(commonThemeOptions + darkColors(scheme))
```

### タイポグラフィ (`typography.ts`)

- **ベースフォント**: Inter, Noto Sans JP, sans-serif
- **ベースサイズ**: 14px (`htmlFontSize: 16`, `fontSize: 14`)
- **カスタムバリアント**: displayLarge / displayMedium / displaySmall / xxl / xl / lg / ml / md / sm / xs
- **フォントウェイト**: Light(300) / Regular(400) / Medium(500) / Bold(700)

### ブレイクポイント (`breakpoints.ts`)

| キー    | 値     | 対象                 |
| ------- | ------ | -------------------- |
| mobile  | 0px    | スマートフォン       |
| tablet  | 768px  | タブレット           |
| laptop  | 1366px | ノート PC (最小基準) |
| desktop | 1920px | デスクトップ (推奨)  |

MUI 標準キー (xs/sm/md/lg/xl) と Tailwind ブレイクポイントの両方に対応。

**コンテナ最大幅**:

| バリアント | 値     | 用途                     |
| ---------- | ------ | ------------------------ |
| standard   | 1280px | サイドバー付きページ     |
| narrow     | 960px  | フォーム・記事           |
| wide       | 1600px | ダッシュボード・テーブル |
| full       | 100%   | マップ・フルスクリーン   |

---

## 5. コンポーネント設計方針

### 2 つのアプローチ

1. **CVA ベース** (Tailwind 純粋): `Button`, `Card` など。MUI 非依存で軽量
2. **MUI カスタマイズ**: `CustomTextField`, `ConfirmDialog`, `DataGrid` など。テーマトークンでスタイルを統一

### CVA Button (`src/components/ui/Button.tsx`)

```typescript
// class-variance-authority で variant と size を管理
const buttonVariants = cva('base-classes...', {
  variants: {
    variant: { default, destructive, outline, secondary, ghost, link },
    size: { default, sm, lg, icon },
  },
})

// React.forwardRef で ref 転送
// React.FC は使用禁止 → ButtonHTMLAttributes + VariantProps で型付け
```

### ConfirmDialog (`src/components/ui/dialog/ConfirmDialog.tsx`)

`window.confirm()` の代替。MUI Dialog ベースでローディング状態・カスタムコンテンツに対応。

### コンポーネント命名規則

- **コンポーネント名**: PascalCase (英語)
- **ファイル名**: PascalCase.tsx
- **Props 型**: `ComponentNameProps` (`type` で定義)
- **エクスポート**: named export (`export const`)
- **コメント**: 日本語

### 禁止パターン (抜粋)

| ID  | パターン              | 正しい方法                    |
| --- | --------------------- | ----------------------------- |
| -   | `React.FC` / `FC`     | plain function + typed props  |
| -   | `any` 型              | 適切な型定義                  |
| -   | セミコロン            | Prettier `semi: false`        |
| -   | ダブルクォート        | `singleQuote: true`           |
| -   | `<Grid item xs={12}>` | `<Grid size={{ xs: 12 }}>`    |
| -   | ハードコード色値      | トークン参照 (`primary.main`) |
| -   | `window.confirm()`    | `ConfirmDialog`               |
| -   | default export        | named export                  |

全リスト: `foundations/prohibited.md`

---

## 6. ChatSupport (AI チャット)

### アーキテクチャ

```
ChatSupport.tsx
  ├── chatAiService.ts      OpenAI / Gemini API 呼び出し
  ├── embeddingSearch.ts     セマンティック検索ロジック
  ├── embeddingService.ts    text-embedding-3-small API
  ├── faqDatabase.ts         オフライン FAQ データベース
  ├── storyGuideMap.ts       ストーリー別ガイドマップ
  ├── muiKnowledge.ts        MUI 知識ベース
  ├── chatSupportConstants.ts 定数・設定
  ├── chatSupportTypes.ts    型定義
  ├── writingPatterns.ts     文体パターン
  ├── CodeBlock.tsx          コードブロック表示
  ├── BookConciergeIcon.tsx  アイコン
  └── useResize.ts           リサイズフック
```

### 検索の 2 層構造

1. **オフライン検索 (Fuse.js)**: API キーなしで動作。FAQ データベースをファジー検索
2. **セマンティック検索 (OpenAI Embedding)**: `text-embedding-3-small` (512 次元) でベクトル化。FAQ / StoryGuide / MUI Knowledge を横断検索

### API 対応

- **OpenAI**: GPT-5 系 (nano, mini 等) + レガシーモデル
- **Gemini**: Google Generative AI (OpenAI 互換エンドポイント)

### Storybook 統合

`.storybook/preview.tsx` の Decorator で全ストーリーに ChatSupport を注入。
`currentStory` (title, name, description) を渡してページ文脈認識を実現。

---

## 7. アプリケーション群

### モノレポ構成

`pnpm-workspace.yaml` で管理:

```yaml
packages:
  - '.' # メインライブラリ
  - 'apps/*' # デモアプリ
  - 'packages/*' # CLI ツール
  - 'mcp' # MCP サーバー
```

### SaaS Dashboard (`apps/saas-dashboard/`)

CRUD 操作、MUI DataGrid、カレンダー、マップを備えた SaaS 管理画面デモ。

- Vite + React + TypeScript
- メインライブラリのコンポーネントとテーマを共有

### KazeEats (`apps/ubereats-clone/`)

レストラン検索、カート管理、注文フローを実装したフードデリバリーアプリデモ。

- 独自テーマ拡張あり
- ユーティリティ共有

### KazeLogistics (`apps/sky-kaze/`)

配送監視、リアルタイム地図表示、ダッシュボードを備えた物流アプリデモ。

- MapLibre GL による地図機能
- 独自コンポーネント追加

---

## 8. MCP 統合

### MCP サーバー (`mcp/`)

Model Context Protocol サーバー。AI エージェントがデザインシステム情報にプログラマティックにアクセス。

**4 ツール**:

| ツール          | 説明                                 |
| --------------- | ------------------------------------ |
| `get_token`     | デザイントークンをドットパスで取得   |
| `get_component` | コンポーネント仕様を取得             |
| `check_rule`    | コードスニペットを禁止パターンに照合 |
| `search`        | トークン・コンポーネントを横断検索   |

**3 リソース**: tokens.json, components.json, prohibited.md を読み込み

### Storybook MCP アドオン

`@storybook/addon-mcp` を `.storybook/main.cjs` で有効化。
Storybook のコンポーネント情報を MCP 経由で外部ツールに公開。

### Claude Code Skills (`.claude/skills/`)

| スキル             | 説明                              |
| ------------------ | --------------------------------- |
| `design-review`    | DS ルール照合・違反検出           |
| `create-component` | 新コンポーネント scaffold 生成    |
| `sync-tokens`      | テーマ → tokens.json → Figma 同期 |

### Cursor Rules (`.cursor/rules/`)

| ルール                   | 説明                 |
| ------------------------ | -------------------- |
| `kaze-design-system.mdc` | DS 全般ルール        |
| `color-system.mdc`       | カラーシステムルール |

---

## 9. ビルド・デプロイ

### Vite 設定 (`vite.config.ts`)

3 つのビルドモードを条件分岐:

1. **Library モード**: ES/CJS 出力。React, MUI 等を external 化
2. **Sandbox モード**: LP をウェブアプリとしてビルド
3. **GitHub Pages モード**: ベースパス `/kaze-ux/` を設定

**Emotion 統合**: `@vitejs/plugin-react` + `@emotion/babel-plugin` で JSX pragma を設定。

**パスエイリアス**: `@/` → `src/`

### Vercel デプロイ (`vercel.json` + `scripts/vercel-build.mjs`)

全アプリを `dist/` 配下に統合:

```
1. LP (sandbox) → dist/
2. Storybook → dist/storybook/
3. SaaS Dashboard → dist/saas/
4. KazeEats → dist/ubereats/
5. KazeLogistics → dist/sky-kaze/
```

URL リライト:

```json
{ "source": "/storybook/(.*)", "destination": "/storybook/$1" }
{ "source": "/saas/(.*)", "destination": "/saas/$1" }
{ "source": "/ubereats/(.*)", "destination": "/ubereats/$1" }
{ "source": "/sky-kaze/(.*)", "destination": "/sky-kaze/$1" }
```

### Storybook ビルド

```javascript
// .storybook/main.cjs
framework: '@storybook/react-vite'
addons: ['addon-a11y', 'addon-links', 'addon-docs', 'addon-mcp']
```

環境変数を `viteFinal` で明示注入 (VITE_APP_PASSWORD, VITE_OPENAI_API_KEY 等)。

---

## 10. テスト戦略

### 設定 (`vitest.config.ts`)

- **環境**: jsdom
- **プール**: forks (メモリ分離)
- **カバレッジ**: V8 プロバイダー
- **レポーター**: verbose, html, json
- **除外**: node_modules, dist, stories, config ファイル, apps/

### テストユーティリティ

- **Testing Library**: `@testing-library/react` + `@testing-library/user-event`
- **マッチャー**: `@testing-library/jest-dom`

### 実行コマンド

| コマンド          | 説明           |
| ----------------- | -------------- |
| `pnpm test`       | 1 回実行       |
| `pnpm test:watch` | ウォッチモード |
| `pnpm test:all`   | カバレッジ付き |
| `pnpm test:ui`    | Vitest UI      |

---

## 11. コード規約

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

Flat config 形式。以下のプラグインを使用:

- `typescript-eslint`: TypeScript ルール
- `eslint-plugin-react` + `react-hooks`: React ルール
- `eslint-plugin-import`: インポート順序
- `eslint-plugin-unused-imports`: 未使用インポート削除
- `eslint-plugin-tailwindcss`: Tailwind CSS ルール
- `eslint-config-prettier`: Prettier 競合回避

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

### Git フック (Husky + lint-staged)

```json
{
  "*.{js,jsx,ts,tsx}": ["pnpm run lint"],
  "*.{css,scss,json,md}": ["pnpm run format"]
}
```

---

## 12. 環境要件

| 要件       | バージョン      |
| ---------- | --------------- |
| Node.js    | 22.14.0 (Volta) |
| pnpm       | 10.2.1          |
| TypeScript | 5.9             |

---

## 13. Storybook 構造

### カテゴリ構成

```
00-Guide/              入門ガイド・チュートリアル
01-DesignPhilosophy/   設計思想
02-DesignTokens/       カラー・タイポ・スペーシング・シャドウ等
03-Layout/             レイアウトパターン
04-Components/         UI / Form / Maps
05-Patterns/           複合パターン
```

### Decorator (`preview.tsx`)

全ストーリーに以下を提供:

- MUI ThemeProvider + Emotion CacheProvider
- Light / Dark テーマ切替 (ツールバー)
- カラースキーム切替 (Dracula / Kaze)
- パディング制御
- ChatSupport ウィジェット注入
- リンク遷移制御 (blockLinks パラメータ)

### ツールバー

| コントロール | 説明                                 |
| ------------ | ------------------------------------ |
| Theme        | Light / Dark (Dracula) / Dark (Kaze) |
| Padding      | なし / 標準                          |
| a11y         | 手動モード (デフォルト OFF)          |

---

## 14. データフロー図

```
┌─────────────────────────────────────────────────────┐
│                    Vercel (本番)                       │
│  /           → LP (Vite sandbox)                      │
│  /storybook/ → Storybook 10                           │
│  /saas/      → SaaS Dashboard                         │
│  /ubereats/  → KazeEats                               │
│  /sky-kaze/  → KazeLogistics                          │
└─────────────────────────────────────────────────────┘
         ↑ scripts/vercel-build.mjs
         │
┌────────┴────────┐
│   pnpm workspace │
│                  │
│  src/ (core)     │ ← テーマ・コンポーネント・トークン
│  apps/*          │ ← core を import して各アプリ構築
│  packages/*      │ ← CLI ツール
│  mcp/            │ ← AI エージェント向け API
└──────────────────┘
         │
    ┌────┴─────────────────┐
    │  AI エージェント連携   │
    │                      │
    │  MCP Server          │ ← tokens.json + components.json
    │  Claude Skills       │ ← design-review, create-component
    │  Cursor Rules        │ ← kaze-design-system.mdc
    │  ChatSupport         │ ← OpenAI Embedding + FAQ
    └──────────────────────┘
```
