# Storybook Page Builder 計画書

## 課題の本質

### 現状の構造的問題

```
デザイナー ──Figma──→ 静的な絵 ──テキスト議論──→ 不毛なコメント合戦
                                                      │
                                                      ▼
エンジニア(1人) ←── Figmaの尻拭い ←── 実装の全責任 ←── 深夜作業
```

- **Figmaの限界**: ダイアログの開閉・状態変化・画面遷移など「時間軸」を持つUIをFigmaで議論すること自体が不可能
- **Storybookの壁**: デザイナーにとって「エンジニアの領域のツール」に見え、心理的・技術的ハードルが高い
- **属人化**: 情報設計→UI実装→レビュー→修正の全責務が1人に集中

### 目指す姿

```
デザイナー/ビジネス ──Storybook Page Builder──→ 動くプロトタイプ(実コード)
        │                                              │
        └──────── AI Chat で相談 ────────────────────────┘
                                                        │
                                                        ▼
                                               コードレビュー → デプロイ
```

**議論の場を「動くコード」に強制移行する。**
Figmaは初期ワイヤーフレームに限定し、動的UI・状態変化・遷移の議論はすべてStorybook上で行う。

---

## コンセプト: Kaze Page Builder

Storybook上で動作する**ビジュアルページ構成ツール**。
ホームページビルダーのように、Kaze UXのMUIコンポーネントをドラッグ&ドロップで配置し、
プロパティを調整し、**そのまま実コードとしてエクスポート**できる。

### 3つのモード

| モード               | 対象ユーザー         | 操作方法                                               |
| -------------------- | -------------------- | ------------------------------------------------------ |
| **ビジュアルモード** | デザイナー・ビジネス | D&Dでコンポーネント配置、GUIでプロパティ編集           |
| **AIモード**         | 全員                 | 自然言語で「ログインフォームを作って」→ AIが構成を生成 |
| **コードモード**     | エンジニア           | 生成されたJSX/TSXを直接編集、コピー                    |

### ユーザーシナリオ

**シナリオ1: デザイナーがダイアログ付きフォームを作る**

1. Page Builder を開く
2. 左パネルから「Card」をキャンバスにドラッグ
3. Card内に「TextField」×3、「Button」をドラッグ
4. Buttonのプロパティで `onClick → Dialog表示` を設定
5. 「ConfirmDialog」を追加、メッセージを入力
6. **プレビュータブ**で実際にボタンを押してダイアログ動作を確認
7. URLを共有 → ビジネスサイドが実際に触って確認
8. 「コードをエクスポート」→ エンジニアがレビュー

**シナリオ2: AIチャットでページを生成**

1. ChatSupport で「ユーザー一覧テーブルにフィルターとページネーションをつけて」
2. AI が ResourceTable + TableToolbar + Pagination を組み合わせたレイアウトを生成
3. Page Builder のキャンバスに反映
4. デザイナーが微調整（カラム幅、ボタン配置）
5. コードエクスポート

---

## 技術アーキテクチャ

### 全体構成

```
.storybook/
  main.cjs              ← Page Builder ストーリーパスを追加
  preview.tsx            ← 既存のまま (テーマ・ChatSupport統合済み)

src/
  stories/
    06-PageBuilder/
      PageBuilder.stories.tsx   ← Storybookエントリポイント
      PageBuilder.tsx           ← メインコンポーネント

  components/
    page-builder/
      PageBuilderCanvas.tsx     ← D&Dキャンバス (中央)
      ComponentPalette.tsx      ← コンポーネント一覧 (左パネル)
      PropertyEditor.tsx        ← プロパティ編集 (右パネル)
      CodeExporter.tsx          ← コード生成・エクスポート
      PreviewPane.tsx           ← ライブプレビュー
      LayoutGrid.tsx            ← グリッドレイアウト制御
      types.ts                  ← 型定義
      registry.ts               ← コンポーネント登録情報
      serializer.ts             ← JSON ↔ JSXシリアライズ
      hooks/
        useDragDrop.ts          ← D&D状態管理
        useCanvasState.ts       ← キャンバス状態管理
        useCodeGeneration.ts    ← コード生成ロジック
        useHistory.ts           ← Undo/Redo
```

### コンポーネントレジストリ

各コンポーネントをPage Builderで使えるようにするための**メタデータ登録**:

```typescript
// registry.ts
interface BuilderComponentMeta {
  // 識別情報
  id: string // 例: 'mui-button'
  name: string // 例: 'ボタン'
  category: ComponentCategory // 例: 'action'
  icon: string // lucide-react アイコン名
  description: string // 日本語の簡単な説明

  // コンポーネント情報
  component: React.ComponentType<unknown>
  defaultProps: Record<string, unknown>

  // プロパティ定義 (PropertyEditor用)
  propSchema: PropSchema[]

  // レイアウト制約
  acceptsChildren: boolean // 子要素を持てるか
  allowedChildren?: string[] // 許可する子コンポーネントID
  allowedParents?: string[] // 配置可能な親コンポーネントID

  // コード生成
  importPath: string // '@/components/ui/button'
  importName: string // 'Button'
}

type ComponentCategory =
  | 'layout' // Grid, Box, Card, Paper
  | 'navigation' // Breadcrumbs, Tabs, Stepper
  | 'input' // TextField, Select, DatePicker
  | 'action' // Button, FAB, IconButton
  | 'display' // Avatar, Chip, Badge, Table
  | 'feedback' // Alert, Dialog, Snackbar, Progress
  | 'text' // PageTitle, SectionTitle, Typography

interface PropSchema {
  name: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'icon' | 'action'
  label: string // 日本語ラベル
  defaultValue: unknown
  options?: string[] // type='select' の選択肢
  group?: string // プロパティグループ名
}
```

### 登録対象コンポーネント (初期リリース)

| カテゴリ   | コンポーネント                             | 優先度 |
| ---------- | ------------------------------------------ | ------ |
| layout     | Grid, Box, Card, Paper, Stack              | 必須   |
| text       | PageTitle, SectionTitle, Typography        | 必須   |
| action     | Button, IconButton, LoadingButton          | 必須   |
| input      | TextField, Select, MultiSelectAutocomplete | 必須   |
| display    | Avatar, Chip, Badge, Table                 | 高     |
| feedback   | Alert, Dialog, ConfirmDialog, Snackbar     | 高     |
| navigation | Breadcrumbs, Tabs, Stepper                 | 中     |
| layout     | Drawer, LayoutWithSidebar                  | 中     |

### キャンバスデータモデル

```typescript
// types.ts

// キャンバス上の1要素
interface CanvasNode {
  id: string // UUID
  componentId: string // registry のID
  props: Record<string, unknown> // 現在のプロパティ値
  children: CanvasNode[] // ネストされた子要素
  layout: LayoutConfig // 配置情報
}

interface LayoutConfig {
  gridSize?: { xs?: number; sm?: number; md?: number; lg?: number }
  spacing?: number
  direction?: 'row' | 'column'
  justifyContent?: string
  alignItems?: string
  padding?: number
  margin?: number
}

// ページ全体の状態
interface PageState {
  id: string
  name: string
  description: string
  rootNodes: CanvasNode[]
  theme: 'light' | 'dark-dracula' | 'dark-blue'
  breakpoint: 'mobile' | 'tablet' | 'laptop' | 'desktop'
  createdAt: string
  updatedAt: string
}
```

### D&D実装: @dnd-kit

```
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

選定理由:

- **ヘッドレス設計**: UIをフルカスタマイズ可能
- **アクセシビリティ**: キーボード操作・スクリーンリーダー対応
- **Tree-shakeable**: 必要な部分だけバンドル
- **TypeScript対応**: 型安全
- **ネスト対応**: コンポーネントの入れ子配置に必要

### コード生成エンジン

```typescript
// serializer.ts

// CanvasNode → JSXコード変換
const generateJSX = (nodes: CanvasNode[], indent = 0): string => {
  return nodes
    .map((node) => {
      const meta = getComponentMeta(node.componentId)
      const propsStr = generatePropsString(node.props, meta.defaultProps)
      const indentStr = '  '.repeat(indent)

      if (node.children.length === 0) {
        return `${indentStr}<${meta.importName}${propsStr} />`
      }

      const childrenStr = generateJSX(node.children, indent + 1)
      return [
        `${indentStr}<${meta.importName}${propsStr}>`,
        childrenStr,
        `${indentStr}</${meta.importName}>`,
      ].join('\n')
    })
    .join('\n')
}

// import文の自動生成
const generateImports = (nodes: CanvasNode[]): string => {
  const imports = collectImports(nodes)
  return imports
    .map(({ path, names }) => `import { ${names.join(', ')} } from '${path}'`)
    .join('\n')
}

// 完全なコンポーネントファイルを生成
const generateComponentFile = (page: PageState): string => {
  const imports = generateImports(flattenNodes(page.rootNodes))
  const jsx = generateJSX(page.rootNodes, 1)

  return `${imports}

const ${toPascalCase(page.name)} = () => {
  return (
${jsx}
  )
}

export { ${toPascalCase(page.name)} }
`
}
```

### AI統合 (既存ChatSupportとの連携)

```typescript
// ChatSupport → Page Builder 連携

// 1. AIがページ構成JSONを生成
const AI_PAGE_BUILDER_PROMPT = `
あなたはKaze UXデザインシステムのページビルダーアシスタントです。
ユーザーの要望をもとに、以下のJSON形式でページ構成を生成してください。

使用可能コンポーネント:
${registeredComponents.map((c) => `- ${c.id}: ${c.name} (${c.description})`).join('\n')}

出力形式:
{
  "nodes": [
    {
      "componentId": "mui-card",
      "props": { "variant": "outlined" },
      "children": [...]
    }
  ]
}
`

// 2. 生成されたJSONをキャンバスに反映
const applyAIGeneration = (json: PageState) => {
  setCanvasState(json)
  // キャンバスが即座に更新される
}

// 3. 部分更新: 「このボタンを赤くして」→ 特定ノードのprops更新
const applyPartialUpdate = (
  nodeId: string,
  propUpdates: Record<string, unknown>
) => {
  updateNode(nodeId, propUpdates)
}
```

---

## UI設計

### レイアウト (3ペイン構成)

```
┌─────────────────────────────────────────────────────────────┐
│ ツールバー: [保存] [Undo] [Redo] [プレビュー] [コード] [共有] │
│ ブレークポイント: [mobile] [tablet] [laptop] [desktop]       │
├──────────┬──────────────────────────────┬───────────────────┤
│          │                              │                   │
│ パレット  │      キャンバス               │ プロパティ         │
│          │                              │                   │
│ ▸ Layout │  ┌──────────────────────┐    │ ── Button ──      │
│   Grid   │  │ Card                 │    │                   │
│   Box    │  │  ┌────────────────┐  │    │ テキスト: 送信     │
│   Card   │  │  │ TextField      │  │    │ バリアント: ●contained │
│          │  │  └────────────────┘  │    │ カラー: primary   │
│ ▸ Action │  │  ┌────────────────┐  │    │ サイズ: medium    │
│   Button │  │  │ [送信ボタン]    │◄─┼────│ 無効: □           │
│   FAB    │  │  └────────────────┘  │    │ ローディング: □    │
│          │  └──────────────────────┘    │                   │
│ ▸ Input  │                              │ ── アクション ──   │
│   Text.. │                              │ onClick: Dialog    │
│   Select │                              │ 対象: confirm-1    │
│          │                              │                   │
│ ▸ Display│                              │                   │
│          │                              │                   │
│ ──────── │                              │ ──────────────── │
│ AI生成   │                              │ レイアウト         │
│ [テキスト │                              │ Grid: xs=12       │
│  入力欄] │                              │ Padding: 2        │
│ [生成]   │                              │ Margin: 0         │
├──────────┴──────────────────────────────┴───────────────────┤
│ ChatSupport (既存ウィジェット — Page Builder コンテキスト対応) │
└─────────────────────────────────────────────────────────────┘
```

### プレビューモード

キャンバスの編集枠を外し、実際のレンダリング結果を表示。
インタラクション（ボタンクリック→ダイアログ表示等）が実際に動作する。

### コードモード

```
┌─────────────────────────────────────────────┐
│ [JSX] [インポート] [フルファイル] [コピー]    │
├─────────────────────────────────────────────┤
│ import { Card } from '@/components/ui/Card' │
│ import { Button } from '@/components/ui/...'│
│ import { TextField } from '@mui/material'   │
│                                             │
│ const LoginForm = () => {                   │
│   return (                                  │
│     <Card>                                  │
│       <TextField label="メール" />           │
│       <TextField label="パスワード"           │
│         type="password" />                  │
│       <Button variant="contained">          │
│         送信                                 │
│       </Button>                             │
│     </Card>                                 │
│   )                                         │
│ }                                           │
└─────────────────────────────────────────────┘
```

---

## 実装フェーズ

### Phase 0: 基盤準備 (1-2日)

- [ ] `@dnd-kit/core`, `@dnd-kit/sortable` インストール
- [ ] `src/components/page-builder/` ディレクトリ作成
- [ ] `types.ts` — データモデル型定義
- [ ] `registry.ts` — コンポーネントレジストリ基盤

### Phase 1: 最小動作版 (3-5日)

**目標: コンポーネントをD&Dで配置し、コードをコピーできる**

- [ ] `ComponentPalette.tsx` — カテゴリ別コンポーネント一覧
- [ ] `PageBuilderCanvas.tsx` — D&Dキャンバス
- [ ] `PropertyEditor.tsx` — 基本プロパティ編集
- [ ] `CodeExporter.tsx` — JSXコード生成
- [ ] `PageBuilder.tsx` — 3ペイン統合
- [ ] `PageBuilder.stories.tsx` — Storybookストーリー
- [ ] 初期登録コンポーネント: Grid, Box, Card, Button, TextField, Typography (6種)

### Phase 2: インタラクション強化 (3-5日)

**目標: 実際に動くプロトタイプが作れる**

- [ ] `PreviewPane.tsx` — ライブプレビュー
- [ ] コンポーネント間のアクション接続 (Button → Dialog 等)
- [ ] ネスト対応 (Card内にGridを配置する等)
- [ ] Undo/Redo (`useHistory.ts`)
- [ ] ブレークポイント切替プレビュー
- [ ] 追加コンポーネント登録 (Dialog, Alert, Select, Table等 → 20種)

### Phase 3: AI統合 (2-3日)

**目標: 自然言語でページを生成できる**

- [ ] ChatSupport の Page Builder コンテキスト対応
- [ ] AI生成JSON → キャンバス反映パイプライン
- [ ] 部分更新 (「このボタンを赤くして」)
- [ ] AIモードUI (左パネル下部にテキスト入力)

### Phase 4: 永続化・共有 (2-3日)

**目標: 作ったページを保存・共有できる**

- [ ] localStorage 保存/読み込み
- [ ] URLパラメータによる状態共有 (圧縮JSON)
- [ ] テンプレートギャラリー (よくあるページパターン)
- [ ] エクスポート: ファイルダウンロード (.tsx)

### Phase 5: チーム導入 (継続的)

**目標: デザイナー・ビジネスが日常的に使う**

- [ ] 操作ガイドストーリー (`06-PageBuilder/HowToUse.mdx`)
- [ ] テンプレート充実 (ダッシュボード、フォーム、一覧、詳細)
- [ ] Figma → Page Builder 移行ワークフロー文書
- [ ] キックオフミーティング資料

---

## 技術的判断ポイント

### Q: Storybook Addon vs Story として実装？

**→ Story として実装する (推奨)**

| 比較項目     | Addon                | Story            |
| ------------ | -------------------- | ---------------- |
| 開発コスト   | 高 (Manager API学習) | 低 (通常のReact) |
| MUIテーマ    | 別途注入が必要       | 自動適用         |
| ChatSupport  | 統合困難             | そのまま使える   |
| URLアクセス  | パネル切替必要       | 直リンク可能     |
| 既存インフラ | 別世界               | 全て活用可能     |

Page Builder は `06-PageBuilder/` カテゴリのストーリーとして実装する。
Storybook内の1ページとしてアクセスでき、MUIテーマ・ChatSupport・既存コンポーネントが
すべてそのまま使える。デザイナーへの共有もURL1つで済む。

### Q: 状態管理は？

**→ useReducer + Context (推奨)**

- 外部ライブラリ (Zustand等) の追加を避ける
- キャンバス状態はコンポーネントツリーに閉じる
- Undo/Redo は reducer のアクション履歴で実装

### Q: コード生成の精度は？

生成コードは**Kaze UXの規約に完全準拠**:

- `React.FC` 不使用
- Arrow function パターン
- Named exports
- セミコロンなし
- シングルクォート
- MUI v7 Grid API (`size` prop)

### Q: 既存のStorybookパフォーマンスへの影響は？

- Page Builder は独立したストーリー → 他のストーリーに影響なし
- `@dnd-kit` は tree-shakeable → バンドルサイズ最小限
- 遅延読み込み: `React.lazy` でPage Builderを分離

---

## チーム導入戦略

### Figmaとの棲み分けルール

| フェーズ           | ツール                     | 成果物                             |
| ------------------ | -------------------------- | ---------------------------------- |
| 要件定義           | テキスト (Notion等)        | ユーザーストーリー                 |
| 情報設計           | Figma                      | ワイヤーフレーム (低忠実度)        |
| **UIプロトタイプ** | **Storybook Page Builder** | **動くプロトタイプ (実コード)**    |
| UI議論・レビュー   | **Storybook URL**          | **コメントは動く画面を触ってから** |
| 実装               | VS Code                    | プロダクションコード               |

### ルール: 「動的UIの議論はFigma禁止」

> ダイアログの開閉、状態変化（エラー、ローディング）、画面遷移など
> 「時間軸」が発生する要素について Figma上でコメントが付き始めたら即ストップ。
>
> 「その挙動は Page Builder で実際に作って確認しましょう」と Storybook へ誘導する。

### 段階的な導入アプローチ

**Step 1: デモ (Week 1)**

- Page Builder の最小動作版を見せる
- 「ボタンをドラッグして配置→プロパティ変更→コードコピー」の流れを実演
- デザイナーに「これなら自分でもできそう」と思わせる

**Step 2: ペアワーク (Week 2-3)**

- デザイナーと隣り合わせで Page Builder を使う
- 最初はデザイナーが口頭で指示、こちらが操作
- 徐々にデザイナー自身に操作を移行

**Step 3: AI活用 (Week 3-4)**

- ChatSupport で「こういう画面を作りたい」と入力
- AIが構成を生成 → デザイナーが微調整
- 「Figmaより速い」体験を実感させる

**Step 4: 自走 (Month 2~)**

- テンプレートから選んでカスタマイズ
- 作ったページURLをSlackで共有
- ビジネスサイドが動くプロトタイプでレビュー

---

## 期待される効果

### 定量的

| 指標                       | 現状    | 目標                      |
| -------------------------- | ------- | ------------------------- |
| Figmaコメント往復回数/画面 | 10-20回 | 2-3回 (初期WFのみ)        |
| UI議論→実装着手までの時間  | 3-5日   | 当日                      |
| UI修正の手戻り             | 頻繁    | 激減 (動くもので確認済み) |
| 深夜作業の発生             | 常態化  | 解消                      |

### 定性的

- **デザイナー**: 「自分で動くものを作れる」達成感。MUIコンポーネントの理解が深まる
- **ビジネス**: 「実際に触れる」ことで具体的なフィードバックが出せる
- **エンジニア**: Figma解読→実装の変換作業が消滅。レビューに集中できる
- **チーム全体**: 「コード」が共通言語になり、コミュニケーションの認知コストが激減

---

## リスクと対策

| リスク                            | 影響 | 対策                                         |
| --------------------------------- | ---- | -------------------------------------------- |
| デザイナーが使ってくれない        | 高   | ペアワーク期間を設ける。AI生成で敷居を下げる |
| 生成コードの品質が低い            | 中   | テンプレートベースで品質保証。lint自動適用   |
| Page Builder の保守コスト         | 中   | Story実装で既存インフラ活用。最小限のコード  |
| コンポーネント登録が面倒          | 低   | registry自動生成スクリプトを用意             |
| Storybookバージョンアップで壊れる | 低   | 標準React APIのみ使用。Addon APIに依存しない |

---

## 参考: 類似ツールとの差別化

| ツール                | 特徴                         | Kaze Page Builder との違い                      |
| --------------------- | ---------------------------- | ----------------------------------------------- |
| Figma Dev Mode        | デザイン→コード変換          | 静的コード。動的UIは表現不可                    |
| Plasmic               | ビジュアルビルダー           | 外部SaaS。自社コンポーネント統合が大変          |
| Builder.io            | ヘッドレスCMS + ビルダー     | 過剰。デザインシステムとの統合が薄い            |
| Storybook + Controls  | プロパティ操作               | 単一コンポーネント止まり。ページ構成不可        |
| **Kaze Page Builder** | **自社デザインシステム内蔵** | **MUIコンポーネント直結。AI統合。コード直出し** |

最大の差別化: **自分たちのデザインシステムのコンポーネントだけで構成される**ため、
生成コードがそのままプロダクションに使える。外部ツールでは実現できない。

---

## 次のアクション

1. **この計画書のレビュー** — チームに共有して意見を集める
2. **Phase 0 着手** — `@dnd-kit` インストール + 型定義
3. **Phase 1 の最小プロト** — 「コンポーネント3つをD&Dして配置→コードコピー」だけ動くものを作る
4. **デモ会** — 動くものを見せてフィードバックを得る
