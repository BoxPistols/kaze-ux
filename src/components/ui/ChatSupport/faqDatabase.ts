// ChatSupport FAQ知識ベース

import Fuse from 'fuse.js'

import { STORY_GUIDE_MAP } from './storyGuideMap'

import type { FaqEntry } from './chatSupportTypes'

// ---------------------------------------------------------------------------
// 同義語マップ: クエリ前処理で同義語をキーワードに展開
// ---------------------------------------------------------------------------

const SYNONYM_MAP: Record<string, string[]> = {
  余白: ['スペーシング', 'spacing', 'gap', 'margin', 'padding'],
  色: ['カラー', 'color', 'パレット'],
  文字: ['フォント', 'タイポグラフィ', 'font', 'テキスト'],
  部品: ['コンポーネント', 'component', 'パーツ'],
  隙間: ['スペーシング', 'spacing'],
  角丸: ['borderRadius', 'border-radius', 'radius'],
  影: ['elevation', 'shadow', 'シャドウ'],
  配置: ['レイアウト', 'layout', 'grid'],
  間隔: ['スペーシング', 'spacing', 'gap'],
  大きさ: ['サイズ', 'size', 'width', 'height'],
  動き: ['アニメーション', 'motion', 'transition'],
  使い分け: ['比較', 'vs', '違い'],
  テスト: ['test', 'vitest', 'testing'],
  型: ['type', 'TypeScript', 'interface'],
  コマンド: ['pnpm', 'npm', 'スクリプト'],
}

// ---------------------------------------------------------------------------
// FAQ: AI無しでも機能するローカル知識ベース
// ---------------------------------------------------------------------------

export const FAQ_DATABASE: FaqEntry[] = [
  {
    keywords: [
      'カラー',
      'パレット',
      '色',
      'color',
      'primary',
      'secondary',
      '拡張',
      '追加',
      '変更',
      'カスタマイズ',
    ],
    title: 'カラーパレットの使い方と拡張方法',
    answer: `## カラーパレットの使い方

### 色を使う方法
\`\`\`tsx
// MUIコンポーネント: sx propでトークン名を指定
<Button sx={{ bgcolor: 'primary.main' }}>ボタン</Button>

// テーマオブジェクト経由
const theme = useTheme()
<Box sx={{ color: theme.palette.success.main }}>成功</Box>

// Tailwind CSS
<div className="text-primary-main bg-error-light">...</div>
\`\`\`

### 色を拡張・カスタマイズする方法
1. **トークンファイルを編集**: \`src/themes/colorToken.ts\` でカラーセットを追加・変更
2. **テーマに反映**: \`src/themes/theme.ts\` の \`createTheme()\` でパレットに追加
3. **ダークモード対応**: Light/Dark 両方の色を定義する（\`createLightThemeColors\` / \`createDarkThemeColors\`）

### 主要トークン一覧
| トークン | 用途 |
|---|---|
| \`primary.main\` | ボタン、リンク、主要アクション |
| \`secondary.main\` | 補助的な要素 |
| \`success/error/warning/info\` | セマンティック（意味ベース）カラー |

### 注意事項
- \`#0EADB8\` のような **ハードコードは禁止**。必ずトークン名で指定
- 新色追加時は **意味ベース命名**（\`brand-blue\` ではなく \`primary\`）
- Storybook → **Design Tokens > Colors** で全色を確認`,
  },
  {
    keywords: [
      'タイポグラフィ',
      'フォント',
      'font',
      'typography',
      '文字',
      'テキスト',
    ],
    title: 'タイポグラフィ',
    answer: `## タイポグラフィ

**フォント**: Inter, Noto Sans JP, sans-serif（1rem = 14px）

| 用途 | サイズ | ウェイト | 行高 |
|---|---|---|---|
| 見出し大 | 32px | 700 | 1.4 |
| 見出し | 20px | 700 | 1.4 |
| 小見出し | 18px | 500 | 1.6 |
| **本文** | **14px** | **400** | **1.6** |
| 補助 | 12px | 400 | 1.4 |
| 注釈 | 10px | 300 | 1.4 |

## やるべきこと
1. 本文は **14px / Regular / 行高1.6**
2. 最小フォントサイズは原則 **12px**
3. Storybook → **Design Tokens > Typography** で確認`,
  },
  {
    keywords: [
      'スペーシング',
      'spacing',
      '余白',
      'マージン',
      'パディング',
      'gap',
    ],
    title: 'スペーシング',
    answer: `## スペーシング（8px基準）

| トークン | 値 | 使い分け |
|---|---|---|
| \`0.5\` | 4px | アイコンとテキストの間 |
| \`1\` | 8px | 密接な要素間 |
| \`2\` | **16px** | **標準の要素間隔** |
| \`3\` | 24px | セクション内の区切り |
| \`4\` | 32px | セクション間 |

MUI: \`sx={{ p: 2 }}\` = 16px, \`sx={{ m: 3 }}\` = 24px

## やるべきこと
1. 余白は **8の倍数** で指定
2. 迷ったら **16px（トークン2）** を使用
3. Storybook → **Design Tokens > Spacing** で確認`,
  },
  {
    keywords: ['コンポーネント', '一覧', 'component', 'リスト', '部品'],
    title: 'コンポーネント一覧',
    answer: `## コンポーネント一覧

| カテゴリ | コンポーネント |
|---|---|
| **UI** | Button, Card, Accordion, Alert, Badge/Chip, Tooltip, FAB, Pagination, SplitButton, ThemeToggle |
| **Form** | CustomTextField, CustomSelect, MultiSelectAutocomplete, DateTimePicker |
| **Layout** | MainGrid, SettingDrawer |
| **Map** | Map3D, MapLibre |
| **Table** | CustomTable |

## やるべきこと
1. **新規設計前**にこの一覧から既存コンポーネントを探す
2. Storybook → **Components** で各コンポーネントの動作を確認
3. Controlsタブで variant / color / size を試す
4. 既存にないコンポーネントはエンジニアと相談`,
  },
  {
    keywords: ['button', 'ボタン'],
    title: 'Button',
    answer: `## Button

角丸6px / 最小幅80px

\`\`\`tsx
<Button variant="contained" color="primary">主要アクション</Button>
<Button variant="outlined">副次アクション</Button>
<Button variant="contained" color="error">削除</Button>
<Button size="small">小</Button>
\`\`\`

## やるべきこと
1. 主要アクション → \`contained\` + \`primary\`
2. 副次 → \`outlined\` / 破壊的 → \`error\`
3. Storybook → **Components > UI > Button** で全バリエーション確認`,
  },
  {
    keywords: [
      'grid',
      'グリッド',
      'レイアウト',
      'layout',
      'レスポンシブ',
      'ブレークポイント',
      'breakpoint',
    ],
    title: 'Grid API (MUI v7)',
    answer: `## Grid API (MUI v7)

\`\`\`tsx
// MUI v7（必須）
<Grid container spacing={2}>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <Card />
  </Grid>
</Grid>

// 禁止: <Grid item xs={12}> は使用不可
\`\`\`

| ブレークポイント | 値 | 対象 |
|---|---|---|
| xs | 0px | モバイル（将来対応） |
| sm | 768px | タブレット |
| **md** | **1366px** | **ノートPC（メイン）** |
| **lg** | **1920px** | **デスクトップ（メイン）** |

## やるべきこと
1. \`size={{ }}\` 形式を使用（旧 \`item xs={}\` 禁止）
2. メインターゲットは **1366px** と **1920px**
3. Storybook → **Layout** で確認`,
  },
  {
    keywords: ['ダーク', 'dark', 'テーマ', 'theme', 'モード', 'mode', 'ライト'],
    title: 'ダークモード',
    answer: `## ダークモード

全コンポーネント対応済み（WCAG AA準拠）。

\`\`\`tsx
sx={{
  bgcolor: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(0,0,0,0.04)',
}}
\`\`\`

## やるべきこと
1. Storybookツールバーの丸アイコンでテーマ切替確認
2. ハードコードした色（\`#fff\`, \`#000\`）を避け、トークンを使用
3. コントラスト比 **4.5:1以上** を維持`,
  },
  {
    keywords: ['card', 'カード'],
    title: 'Card',
    answer: `## Card

elevation=0 / 角丸12px / border=1px solid divider

\`\`\`tsx
<Card variant="outlined" sx={{ borderRadius: 3 }}>
  <CardContent>
    <Typography variant="h6">タイトル</Typography>
    <Typography variant="body2" color="text.secondary">説明</Typography>
  </CardContent>
</Card>
\`\`\`

## やるべきこと
1. \`variant="outlined"\` をデフォルト使用
2. 角丸は **12px** (\`borderRadius: 3\`)
3. Storybook → **Components > UI > Card** で確認`,
  },
  {
    keywords: ['storybook', 'ストーリーブック', '構成', '使い方'],
    title: 'Storybook構成',
    answer: `## Storybook構成

| セクション | 内容 |
|---|---|
| **Guide** | 使い方ガイド、デザイナー向け |
| **Design Philosophy** | ブランド理念、デザイン原則 |
| **Design Tokens** | カラー、タイポグラフィ、スペーシング |
| **Layout** | グリッド、レスポンシブ |
| **Components** | UI / Form / Map |
| **Patterns** | 複合UIパターン |

## やるべきこと
1. まず **Guide > Introduction** を読む
2. デザイナー → **Guide > For Designers**
3. \`K\` キーでコンポーネント検索
4. Controlsタブでpropsを変更して動作確認`,
  },
  {
    keywords: ['react', 'fc', '実装', 'ルール', '禁止'],
    title: 'React実装ルール',
    answer: `## React実装ルール

**禁止**: \`React.FC\`, \`FC\`, \`FunctionComponent\` は使用不可

\`\`\`tsx
// 正しい書き方
interface Props { title: string }
const MyComponent = ({ title }: Props) => { ... }
\`\`\`

- TypeScript strict（any型禁止）
- MUI v7 Grid: \`size={{ }}\` 形式
- アイコン: lucide-react
- スタイル: \`sx\` prop or Tailwind

## やるべきこと
1. 上記の禁止パターンを見つけたら即削除して通常関数に変更
2. Propsは \`interface\` で定義
3. pre-commitフックが自動検出`,
  },
  {
    keywords: [
      '原則',
      'principle',
      '設計原則',
      '間接化',
      'カプセル化',
      '制約',
      '意味',
      '合成',
      '慣習',
      'デザインシステム',
      '理論',
    ],
    title: 'コンポーネント設計6原則',
    answer: `## コンポーネント設計6原則

| 原則 | 意味 | 実践例 |
|---|---|---|
| **間接化** | 直接値を使わず変数・トークン経由 | \`#0EADB8\`ではなく\`primary.main\` |
| **カプセル化** | 内部実装を隠しAPIで操作 | variant/size/colorだけ公開 |
| **制約** | 選択肢を意図的に狭める | 自由入力よりEnum(3-7択) |
| **意味の符号化** | 見た目でなく意味で命名 | \`red\`ではなく\`error\` |
| **合成** | 小部品を組み合わせる | Button+Icon=IconButton |
| **慣習** | チームルール遵守 | MUI v7 API、React.FC禁止 |

参考: デザイナーのためのコンポーネント設計ガイド

## やるべきこと
1. Figmaで色を指定する際は **トークン名**（例: primary.main）を使う（間接化）
2. コンポーネントは variant/size/color の **props のみ** で制御する（カプセル化）
3. 自由テキスト入力より **セレクト/ラジオ** を使う（制約）
4. 変数名は見た目でなく **意味** で付ける（意味の符号化）`,
  },
  {
    keywords: [
      '経路依存',
      'path dependency',
      '追加',
      '削除',
      '破壊的変更',
      'breaking',
      '非対称',
    ],
    title: '経路依存性と追加・削除の非対称性',
    answer: `## 経路依存性と追加・削除の非対称性

### 経路依存性
初期のデザイン決定が将来の選択肢を制約する。トークン名・コンポーネント構造は最初に慎重に設計する。

例: \`primary\`を\`brand-blue\`に後から変更 → 全ファイル修正 + Figma更新 + ドキュメント修正

### 追加と削除の非対称性
- **追加**: 簡単。既存に影響しない
- **削除/変更**: 困難。使っている箇所すべてに影響（破壊的変更）

**鉄則**: 最小限のAPIで始め、必要に応じて拡張する

## やるべきこと
1. 新しいトークン・コンポーネント名は **意味ベース** で付ける（後で変えにくい）
2. props は最小限から始める（後から追加は容易）
3. 既存コンポーネントを削除/変更する前に **影響範囲を調査**
4. 破壊的変更は **deprecation（非推奨化）→ 移行期間 → 削除** の手順で`,
  },
  {
    keywords: [
      'ステート',
      'state',
      '状態',
      'empty',
      'loading',
      'error',
      'スタック',
      '5状態',
      '空',
      '読み込み',
    ],
    title: 'UIステートスタック（5状態）',
    answer: `## UIステートスタック

すべてのUIコンポーネントは **5つの状態** を設計する:

| 状態 | 説明 | 例 |
|---|---|---|
| **Empty** | データなし | 「データがありません」+アクションボタン |
| **Loading** | 読み込み中 | スケルトン/スピナー表示 |
| **Error** | 異常発生 | エラーメッセージ+リトライボタン |
| **Partial** | 一部データのみ | 一部表示+「もっと見る」 |
| **Ideal** | 理想状態 | 全データ正常表示 |

**よくある間違い**: Ideal状態だけ設計してEmpty/Errorを忘れる

## やるべきこと
1. 新コンポーネント設計時に **5状態すべて** のデザインを用意
2. Figmaで各状態のフレームを作成
3. Storybookのストーリーで各状態を定義
4. 特に **Empty** と **Error** を忘れずに設計`,
  },
  {
    keywords: [
      'レイアウト',
      'margin',
      'padding',
      '責任',
      'fill',
      'hug',
      'fixed',
      'サイジング',
      '余白設計',
    ],
    title: 'レイアウト責任の分離',
    answer: `## レイアウト責任の分離

### margin vs padding
| 種類 | 責任 | ルール |
|---|---|---|
| **margin** | 親（外側の余白） | コンポーネント自体に持たせない。親がGap/Stackで制御 |
| **padding** | 自分（内側の余白） | コンポーネント内部で自分が制御 |

**鉄則**: コンポーネントに \`margin\` を直接書かない。親の \`Stack spacing\` や \`Grid spacing\` で制御する。

### サイジング3パターン
| パターン | 動作 | Figma | CSS |
|---|---|---|---|
| **Fill** | 親幅いっぱい | Fill container | \`width: 100%\` |
| **Hug** | 中身に合わせる | Hug contents | \`width: fit-content\` |
| **Fixed** | 固定値 | Fixed width | \`width: 320px\` |

## やるべきこと
1. コンポーネントに \`margin\` を書かない。親の \`spacing\` で制御
2. ボタン/バッジ → **Hug**、カード/フォーム → **Fill**、アイコン → **Fixed**
3. Figmaの Auto Layout 設定と CSS の対応を確認
4. MUI: \`<Stack spacing={2}>\` で要素間の余白を統一`,
  },
  {
    keywords: [
      '命名',
      'naming',
      '名前',
      'コンポーネント名',
      'props名',
      'PascalCase',
      'camelCase',
    ],
    title: '命名規則',
    answer: `## 命名規則

### コンポーネント名
- **PascalCase**: \`ServiceCard\`, \`CustomTextField\`, \`ZoneStatusChip\`
- 意味ベース: \`PrimaryButton\`ではなく\`Button variant="contained"\`
- 汎用的な名前を避ける: \`Box1\`, \`Section2\` は禁止

### Props名
- **camelCase**: \`isDisabled\`, \`onClick\`, \`maxWidth\`
- Boolean: \`is-\`/\`has-\` prefix → \`isOpen\`, \`hasError\`
- ハンドラ: \`on-\` prefix → \`onClick\`, \`onChange\`

### 意味ベースの命名
| 悪い例 | 良い例 | 理由 |
|---|---|---|
| \`red\` | \`error\` | 色ではなく意味 |
| \`big\` | \`comfortable\` | 相対的でなく用途 |
| \`style1\` | \`outlined\` | 番号でなく特徴 |
| \`leftPanel\` | \`navigationPanel\` | 位置でなく役割 |

## やるべきこと
1. コンポーネント名は **役割・用途** で命名
2. Props名は **camelCase** + 意味を表すprefix
3. 色名・位置名を避け、**意味・役割** で命名
4. Storybook → **Design Philosophy** でチーム規約を確認`,
  },
  {
    keywords: [
      '変数',
      'variable',
      'boolean',
      'enum',
      'バリアント',
      'variant',
      '型',
      'Figma変数',
      'props設計',
    ],
    title: '変数の型とprops設計',
    answer: `## 変数の型とprops設計

コンポーネントのpropsは **制約が強い型** から選ぶ:

| 型 | 選択肢 | 使いどころ | 例 |
|---|---|---|---|
| **Boolean** | 2択 | ON/OFF切替 | \`isDisabled\`, \`isLoading\` |
| **Enum** | 3-7択 | バリエーション | \`variant: 'contained' \\| 'outlined'\` |
| **Number** | 数値範囲 | サイズ、カウント | \`maxWidth: 320\` |
| **String** | 自由入力 | ラベル、テキスト | \`title: string\` |

**優先順位**: Boolean > Enum > Number > String（制約が強いほど安全）

### FigmaとCodeの対応
| Figma | Code (React/MUI) |
|---|---|
| Boolean property | \`isOpen?: boolean\` |
| Instance swap | \`icon?: ReactNode\` |
| Variant | \`variant: 'contained' \\| 'outlined'\` |
| Text | \`label: string\` |

## やるべきこと
1. 新しいpropsは **Booleanで済まないか** をまず検討
2. 選択肢が3つ以上なら **Enum（Union型）** を使う
3. 自由入力（string）は **最後の手段**
4. Figmaの Component properties と Code の props を対応させる`,
  },
  {
    keywords: [
      '分割',
      'split',
      '分離',
      'いつ分ける',
      'コンポーネント分割',
      '粒度',
      'atomic',
    ],
    title: 'コンポーネント分割の判断基準',
    answer: `## コンポーネント分割の判断基準

### 分割すべきタイミング
1. **再利用される**: 2箇所以上で同じUIパターンが出現
2. **独立した状態を持つ**: 自分だけのstate/ロジックがある
3. **テスト単位として意味がある**: 単独でテスト可能
4. **300行を超えた**: 1ファイルが大きすぎる兆候

### 分割しすぎの兆候
1. props drilling（3階層以上のバケツリレー）が発生
2. 1つの変更で5ファイル以上を修正
3. コンポーネント名が \`XxxWrapper\`, \`XxxContainer\` ばかり

### 構築戦略
| 戦略 | 方法 | 適用場面 |
|---|---|---|
| **トップダウン** | ページ全体→分割 | 既存UIのコンポーネント化 |
| **ボトムアップ** | 小部品→組み合わせ | 新規デザインシステム構築 |

**Kaze UX推奨**: ボトムアップ。Design Tokensから始めて、小さなコンポーネントを組み合わせる

## やるべきこと
1. まず **Design Tokens > Components** の既存部品を確認
2. 再利用パターンが見えたらコンポーネント化を検討
3. 300行超えたら分割を検討
4. props drilling が起きたら構造を見直す`,
  },
  {
    keywords: [
      'マインドセット',
      '建築',
      '絵を描く',
      'なぜ',
      'デザインシステムとは',
      '目的',
    ],
    title: 'デザインシステムのマインドセット',
    answer: `## デザインシステムのマインドセット

### 「絵を描く」から「建築する」へ
Photoshop時代のデザインは一枚の絵を描く仕事。デザインシステムでは **レゴブロックの突起の形を設計し、誰でも城を作れるようにする** 仕事に変わる。

### なぜコンポーネント設計を学ぶのか
1. **エンジニアとの会話が変わる** - 「この変更は破壊的ですか？」と問えるようになる
2. **影響範囲が見える** - Figmaの変更がコード側でどれほど影響するか想像できる
3. **チーム生産性にレバレッジ** - デザイナーの運用方法が開発工数を大きく左右する

### AI時代の文脈
AI(Cursor, Copilot)がコードを書く時代だからこそ、**構造の設計理解**の価値が高まる。デザインシステムが整備されていれば「Button, Card, Badgeで実装して」とAIに指示するだけで一貫したコードが生成される。

## やるべきこと
1. UIを「画面の絵」ではなく **「部品の設計図」** として捉える
2. エンジニアと **設計言語（トークン名、props名）** を揃える
3. Figmaの変更前に **コード側の影響** を考える習慣をつける`,
  },
  {
    keywords: [
      '関心の分離',
      'separation',
      'カプセル化',
      'レイヤー',
      '見た目とデータ',
      '構造とスタイル',
      '汎用とドメイン',
    ],
    title: 'カプセル化の3レイヤーと関心の分離',
    answer: `## カプセル化の3レイヤーと関心の分離

6原則の共通基盤が **関心の分離（Separation of Concerns）**。カプセル化は3つのレイヤーで実践する:

| レイヤー | 分離するもの | 例 |
|---|---|---|
| **見た目とデータ** | コンポーネントは表示に専念、データ取得は呼び出し側 | Cardはデータを知らない。親がpropsで渡す |
| **構造とスタイル** | 骨組みと装飾を切り離す | HTMLの構造 + CSSの装飾 = 独立して変更可能 |
| **汎用とドメイン** | どこでも使える部品 vs 特定機能特化の部品 | Button(汎用) vs FlightStatusCard(ドメイン) |

### ボタンの複雑さ
シンプルに見えるボタンでも: サイズ、色、角丸、影、アイコン位置、ローディング状態、無効状態、クリックハンドラ...膨大な設計判断がカプセル化されている。

## やるべきこと
1. コンポーネントに **データ取得ロジック** を含めない（表示に専念）
2. 汎用コンポーネント(Button)に **ドメイン知識**（特定のAPI名など）を混ぜない
3. 見た目の変更がロジックに影響しないか確認
4. Storybook → **Design Philosophy** で分離方針を確認`,
  },
  {
    keywords: [
      '一貫性',
      '妥協',
      'consistency',
      '逸脱',
      '一般化',
      '個別化',
      'バランス',
    ],
    title: '一貫性と意図的な妥協',
    answer: `## 一貫性と意図的な妥協

### 一貫性の3つの価値
1. **使いやすさ**: ユーザーの学習コストが下がる
2. **ブランド信頼**: 細部まで統一されたプロダクトは規律を伝える
3. **再利用性**: 一貫した設計が再利用の前提条件

**本質**: 一貫しているからこそ、**意図的な逸脱がシグナルとして機能する**（例: 赤いボタン=危険な操作）

### 意図的な妥協の3習慣
1. **「なぜ今こうするか」を一言残す**（コメント、Figmaメモ）
2. **後で直しやすい方向に倒す**（一意な名前、厳密な型への移行容易性）
3. **「今はやらない」と「やらなくていい」を区別する**

### 一般化と個別化のバランス
- 一般化しすぎ → プロパティが膨張（God Component化）
- 個別化しすぎ → 似た部品が乱立

## やるべきこと
1. 例外を作る前に **「なぜ逸脱するのか」** をドキュメントに残す
2. 場当たり的対応には **期限付きTODO** を付ける
3. 汎用コンポーネントのpropsが **7個超えたら** 分割を検討`,
  },
  {
    keywords: [
      '構築',
      'strategy',
      'ライブラリ',
      'headless',
      'radix',
      'スクラッチ',
      'ハイブリッド',
      '後発導入',
      '導入',
    ],
    title: '構築戦略',
    answer: `## 構築戦略

| 戦略 | 特徴 | 向いているケース |
|---|---|---|
| **汎用ライブラリ** | MUI, Chakra UI。すぐ開発開始。デザイン画一化リスク | 初期フェーズ、管理画面 |
| **フルスクラッチ** | ゼロから自社専用。設計思想100%反映、コスト高 | 大規模、ブランド重視 |
| **Headless UI** | Radix UI等。機能だけ借り見た目は自作 | 独自デザイン+アクセシビリティ |
| **ハイブリッド** | 上記を組み合わせ | **多くの組織の現実解** |

**Kaze UX**: MUIベースのハイブリッド戦略（汎用=MUI、ドメイン=独自）

### 後発導入の3ステップ（稼働中プロダクトに導入する場合）
1. **デザイントークンから入る** - 色・余白をトークン化、見た目を変えずにコード整理
2. **新規画面から準拠** - 既存は触らず、新しい画面だけシステムを使う
3. **既存画面は優先度をつけて移行** - 利用頻度が高い画面から段階的に

## やるべきこと
1. 新コンポーネントは **MUIベース** で作れないかまず検討
2. MUIにない機能は **lucide-react + sx prop** で独自実装
3. 既存画面の移行は **利用頻度順** で計画
4. Storybook → **Components** で既存実装を確認してから新規作成`,
  },
  {
    keywords: [
      '汎用',
      'ドメイン',
      '共通化',
      'generic',
      'domain',
      '乱立',
      'Rule of Three',
      '3回',
    ],
    title: '汎用vsドメインと早すぎる共通化',
    answer: `## 汎用vsドメインコンポーネント

| 種類 | 特徴 | 例 |
|---|---|---|
| **汎用** | どのサービスでも使える。データ構造に依存しない | Button, Card, Input, Alert |
| **ドメイン** | 特定のデータ・ビジネスロジックに依存 | ServiceCard, FlightStatusChip, ZoneStatusChip |

**鉄則**: この2つを **明確に区別** することでプロパティの肥大化を防ぐ

### 早すぎる共通化の罠
見た目が似ている ≠ 目的が同じ。無理に共通化すると無関係なプロパティが混在する。

**具体例**: ECの商品カードとSNSの投稿カードは見た目が似ているが、\`hasLikeButton\`と\`isSwipeable\`のような無関係なpropsが混在→破綻

### Rule of Three
**3回以上**登場するまでコンポーネント化を待つ。1-2回の時点で共通化すると、実は別物だったケースでpropsが肥大化する。

## やるべきこと
1. 新コンポーネントは **汎用かドメインか** を最初に判断
2. 汎用コンポーネントに **ドメイン固有のprops** を混ぜない
3. 似たUIが **3回出現するまで** 共通化を待つ
4. 既存の汎用コンポーネントを **Storybook > Components** で確認`,
  },
  {
    keywords: [
      'スロット',
      'slot',
      'element',
      'instance swap',
      'children',
      'composition',
      'configuration',
      'array',
      'object',
      'リスト',
      '配列',
    ],
    title: 'スロットと合成パターン',
    answer: `## スロットと合成パターン

### Element（スロット）
propsにデータではなく **コンポーネントそのもの** を渡す方法。

| Figma | Code |
|---|---|
| Instance Swap Property | \`icon?: ReactNode\` |
| Auto Layout子要素 | \`children: ReactNode\` |

**利点**: 「左アイコンあり」「右アイコンあり」とバリアント増やす代わり、**好きなものを入れられるスロット** を用意→バリアント爆発を防止

### Configuration vs Composition
| 方針 | 特徴 | 適用 |
|---|---|---|
| **Configuration** | propsで全て制御。設定の山 | シンプルな部品 |
| **Composition** | 小部品を自由に組み合わせ | 複雑・拡張性重視 |

### Array / Object
- **Array**: リストデータ。0件/1件/大量の3パターンを設計
- **Object**: データの束（ユーザー情報等）をひとまとまりで渡す

## やるべきこと
1. アイコン/ボタン等の差し替え可能部分は **スロット(ReactNode)** で設計
2. バリアントが5個超えたら **Composition** への移行を検討
3. リスト表示は **0件・1件・大量** の3パターンを設計
4. Figma Instance Swap = Code \`ReactNode\` の対応を意識`,
  },
  {
    keywords: [
      '直交',
      'orthogonal',
      'トークン共有',
      'Figma',
      'ズレ',
      '条件付き',
      'プロパティ数',
    ],
    title: '直交性とFigma-Code連携',
    answer: `## 直交性とFigma-Code連携

### 直交性: 組み合わせが壊れない設計
あるpropsを変えても他のpropsに影響しない状態。

**良い例**: \`size\`を変えても\`variant\`(色)は変わらない
**悪い例**: 1つのpropsに複数の関心（色の種類+強さ）を混ぜる→例外処理が増加

**鉄則**: 1プロパティ = 1つの関心事

### トークン共有
Tag, Callout, Alert の色を共通のセマンティックトークン(\`info\`, \`success\`)で管理→トークン修正で全コンポーネント一括変更

### Figmaとコードのプロパティ数のズレ
| Figma | Code | 理由 |
|---|---|---|
| トグル + テキスト入力 = 2プロパティ | \`subtitle?: string\` = 1プロパティ | テキストの有無で表示制御 |
| \`icon\` | \`iconLeft\` | 将来\`iconRight\`追加に備え先読み |

**必須と任意**: よく使う値を**デフォルト値**にし入力を省けるように

## やるべきこと
1. propsは **1つの関心事** だけを扱う（sizeとcolorを混ぜない）
2. 色トークンは **コンポーネント横断** で共有する
3. Figmaのプロパティ数 ≠ コードのprops数 を理解する
4. 将来の拡張を見越した **プロパティ名の先読み** をする`,
  },
  {
    keywords: [
      '破壊的',
      'deprecation',
      '非推奨',
      'ライフサイクル',
      '廃止',
      '安全な変更',
      'detach',
      '不確実',
    ],
    title: '破壊的変更とライフサイクル',
    answer: `## 破壊的変更とライフサイクル

### 安全な変更 vs 破壊的変更
| 種類 | 操作 | リスク |
|---|---|---|
| **安全** | バリアント追加、新props追加 | 既存に影響なし |
| **破壊的** | 名前変更、選択肢削除、props削除 | 全使用箇所に影響 |

**注意**: Figmaでは簡単な変更でも、コード側では甚大な影響が出ることがある

### 不確実性が高い時の設計
- **意味論を弱く** して破綻を防ぐ（\`primary\`/\`secondary\`のような序列命名）
- **スロット** で未知のバリエーションに備える
- 中身は後から埋めるが **器の形だけ先に決める**

### 既存コンポーネントで実現できない時の4選択肢
1. **組み合わせ** で解決できないか？
2. **バリアント/props追加** で対応できないか？
3. **新規コンポーネント** として切り出すべきか？
4. **一回限りの例外** として許容するか？

### ライフサイクル
作るのと同じくらい **終わらせる設計** が重要。[Deprecated]マークで明示し、削除トリガーを決めておく。

## やるべきこと
1. Figmaの変更前に **「これは破壊的変更か？」** を確認
2. 安易にDetachせず **上記4選択肢** を順に検討
3. 廃止するコンポーネントは **[Deprecated]** を明示
4. 破壊的変更は **deprecation → 移行期間 → 削除** の手順で`,
  },
  {
    keywords: [
      'hover',
      'pressed',
      'focus',
      'disabled',
      'インタラクション',
      'interaction',
      'partial',
      'フォールバック',
      'fallback',
    ],
    title: 'インタラクション状態とPartial State',
    answer: `## インタラクション状態とPartial State

### インタラクション状態の統一ルール
個別にデザインせず **トークンで統一** するのが効率的:

| 状態 | ルール例 | 用途 |
|---|---|---|
| **Hover** | 黒の8%オーバーレイ | マウスオーバー |
| **Pressed** | 黒の12%オーバーレイ | クリック中 |
| **Disabled** | opacity: 0.38 | 操作不可 |
| **Focus** | 2px outline + offset | キーボード操作時 |

MUI: \`sx={{ '&:hover': { opacity: 0.88 } }}\` で統一適用

### Partial State（不完全状態）
「名前はあるがアイコンがない」「住所は入力済みだが電話番号が空」など。

**対処**: 項目ごとの **フォールバック（代替表示）** ルールを決めておく
- アイコンなし → イニシャルアバター
- テキストなし → 「未設定」プレースホルダ
- 画像なし → デフォルト画像

## やるべきこと
1. Hover/Pressed/Disabled/Focus を **トークンベース** で統一
2. 各コンポーネントに **フォールバック表示** を定義
3. Disabled状態は **opacity: 0.38** を標準に
4. Storybook → **Components** の各ストーリーで状態を確認`,
  },
  {
    keywords: [
      'overflow',
      'オーバーフロー',
      '省略',
      'ellipsis',
      '折り返し',
      '区切り線',
      'divider',
      'truncate',
    ],
    title: 'オーバーフローと区切り線',
    answer: `## オーバーフローと区切り線

### オーバーフロー設計
テキストやコンテンツが想定を超えた時の振る舞いを **仕様として定義** する:

| パターン | 方法 | 用途 |
|---|---|---|
| **テキスト省略** | \`text-overflow: ellipsis\` | カードタイトル、リスト項目 |
| **テキスト折り返し** | \`word-break: break-word\` | 説明文、チャット |
| **スクロール** | \`overflow: auto\` | テーブル、長いリスト |
| **ページネーション** | ページ切替 | 検索結果、大量データ |
| **数値上限** | \`999+\` 表記 | バッジ、通知カウント |

### 区切り線の責任
コンポーネント内に線を含めるより、**親がDividerを挟む** か、最後の要素だけ線を消せる仕組み（\`showDivider\`）を用意:

\`\`\`tsx
<Stack divider={<Divider />} spacing={0}>
  <ListItem />
  <ListItem />
</Stack>
\`\`\`

## やるべきこと
1. カードタイトル等は **1行省略** (\`noWrap\` + \`textOverflow\`)
2. 説明文は **折り返し** を基本とする
3. 区切り線は **親のStack/List** で制御（コンポーネントに含めない）
4. 数値バッジは **上限値**（999+等）を定義`,
  },
  {
    keywords: [
      'アセット',
      'asset',
      'アイコン',
      'icon',
      'SVG',
      'currentColor',
      '画像',
      'image',
      'lucide',
    ],
    title: 'アセット管理',
    answer: `## アセット管理

### コード実装 vs 画像埋め込み
| 判断基準 | コード実装(SVG) | 画像埋め込み |
|---|---|---|
| **色変更の可能性** | あり → コード | なし → 画像 |
| **ダークモード対応** | 必須 → コード | 不要 → 画像 |
| **アニメーション** | あり → コード | なし → 画像 |
| **装飾的** | - | 装飾的 → 画像 |

### SVGアイコンの色制御
\`fill="#000"\` ではなく **\`currentColor\`** を使う → 親のテキスト色に自動追従（ダークモード/ホバー自動対応）

\`\`\`tsx
// Kaze UX: lucide-reactを使用
import { AlertCircle } from 'lucide-react'
<AlertCircle size={20} /> // currentColor自動適用
\`\`\`

### 既存ライブラリ vs 独自制作
| 方針 | メリット | デメリット |
|---|---|---|
| **既存ライブラリ** (lucide-react) | 低コスト、一貫性 | 独自性が薄い |
| **独自制作** | ブランド表現 | 高コスト、保守負担 |

**Kaze UX方針**: lucide-react + MUI Icons を標準使用

## やるべきこと
1. アイコンは **lucide-react** から選ぶ（独自SVGは最終手段）
2. SVGの色は **currentColor** を使用（ハードコード禁止）
3. ダークモード対応が必要なビジュアルは **コード実装**
4. 装飾的画像は \`alt=""\` で **スクリーンリーダーから隠す**`,
  },
  {
    keywords: [
      'react',
      'コンポーネント',
      'props',
      'state',
      'useState',
      'hooks',
      'JSX',
      '基礎',
      '入門',
    ],
    title: 'React基礎',
    answer: `## React基礎

### 核心概念
Reactは **UIを関数（コンポーネント）で構築する** ライブラリ。

| 概念 | 説明 | 例 |
|---|---|---|
| **コンポーネント** | UIの再利用可能な部品（関数） | \`const Button = (props) => ...\` |
| **props** | 外から受け取る入力（読み取り専用） | \`{ label, onClick, variant }\` |
| **state** | 内部の状態（変更可能） | \`const [open, setOpen] = useState(false)\` |
| **JSX** | HTMLライクなUI記述構文 | \`<Button variant="contained">送信</Button>\` |

### デザイナーが知るべきポイント
- **単方向データフロー**: データは親→子に流れる（propsで渡す）
- **宣言的UI**: 「この状態の時はこう見える」と宣言する
- **再レンダリング**: stateが変わると自動でUIが更新される

### Kaze UXルール
- **React.FC禁止**: \`const MyComponent = ({ title }: Props) => ...\` 形式を使用
- **TypeScript必須**: すべてのpropsに型定義
- **MUI v7**: コンポーネントライブラリとして使用

## やるべきこと
1. コンポーネント = **関数** 、props = **引数** と理解する
2. Figmaのプロパティパネル = Reactの **props** と対応づける
3. Storybook Controls = **propsをリアルタイムに変更するUI**
4. 詳細は Storybook → **Guide > Component Development** を参照`,
  },
  {
    keywords: [
      'material',
      'マテリアルデザイン',
      'MUI',
      'Material UI',
      'elevation',
      'ripple',
      'Google',
    ],
    title: 'マテリアルデザイン概要',
    answer: `## マテリアルデザイン概要

Googleが提唱する設計体系。Kaze UXは **MUI（Material UI）v7** を通じてこの体系をベースにしている。

### 核心原則
| 原則 | 説明 | Kaze UXでの適用 |
|---|---|---|
| **Material is the metaphor** | 物理的な紙・インクの比喩 | Card, Paper, elevation |
| **Bold, graphic, intentional** | 大胆で意図的なタイポグラフィ・色・空間 | 明確な色階層、8pxグリッド |
| **Motion provides meaning** | 動きが意味を伝える | Fade/Slide遷移、ripple効果 |

### 重要概念
- **Elevation（影の深度）**: 0=フラット、1-24=浮き上がり。Kaze UXはCard=elevation 0（フラット）を基本
- **Ripple（波紋）**: タッチ/クリック時の波紋エフェクト。MUIボタン標準搭載
- **8pxグリッド**: 全スペーシングを8の倍数で統一。Kaze UXも同様
- **色システム**: Primary/Secondary/Error/Warning/Info/Success

### MUI v7の特徴
- **新Grid API**: \`size={{ xs: 12 }}\` 形式
- **sx prop**: インラインでテーマ対応スタイリング
- **Pigment CSS**: 新しいゼロランタイムCSSエンジン

## やるべきこと
1. elevationは **0（フラット）** を基本、浮き上がりは意図的に使う
2. スペーシングは **8pxの倍数** を遵守
3. 色は **セマンティックトークン** (primary, error等)で指定
4. MUIドキュメント: https://mui.com/material-ui/`,
  },
  {
    keywords: [
      '人間工学',
      'エルゴノミクス',
      'ergonomics',
      'Fitts',
      'Hick',
      '認知',
      'UX',
      'ユーザビリティ',
      'アクセシビリティ',
      'a11y',
    ],
    title: '人間工学とUX原則',
    answer: `## 人間工学とUX原則

### 基本法則
| 法則 | 内容 | UI設計への影響 |
|---|---|---|
| **Fittsの法則** | ターゲットが大きく近いほど速く操作できる | ボタン最小44px、主要アクションを大きく |
| **Hickの法則** | 選択肢が増えると決定時間が増加 | メニュー7項目以下、段階的開示 |
| **Millerの法則** | 短期記憶は7(+-2)チャンク | ナビ項目5-9個、情報をグループ化 |
| **Jakobの法則** | ユーザーは他サイトの慣習を期待する | 標準的なUIパターンを採用 |

### 認知負荷の最小化
- **視覚的階層**: サイズ・色・太さで重要度を伝える
- **近接の法則**: 関連する要素は近くに配置
- **一貫性**: 同じ操作は同じ見た目（前述の6原則「慣習」）

### アクセシビリティ (a11y)
- **色だけに頼らない**: アイコン・テキストでも状態を伝える
- **コントラスト比**: 通常テキスト4.5:1以上（WCAG AA）
- **キーボード操作**: Tab/Enter/Escで全操作可能に
- **ARIA属性**: スクリーンリーダーに意味を伝える

### タッチターゲット
最小 **44x44px**。指の平均接触面積に基づく（Apple/Google共通ガイドライン）

## やるべきこと
1. ボタン・リンクは **最小44px** を確保
2. 選択肢は **7個以下** に絞る（Hickの法則）
3. コントラスト比 **4.5:1以上** を検証
4. 色だけで状態を伝えず **アイコン+テキスト** を併用`,
  },
  // --- Phase 2: ギャップ分析で追加されたFAQ ---

  {
    keywords: [
      'sx',
      'tailwind',
      'className',
      'スタイル',
      'style',
      'css',
      '使い分け',
      'sx prop',
    ],
    title: 'sx prop vs Tailwind CSS 使い分け',
    answer: `## sx prop vs Tailwind CSS 使い分け

| 場面 | 使うもの | 理由 |
|---|---|---|
| MUIコンポーネント | \`sx\` prop | テーマトークンに直接アクセス可能 |
| 純HTML要素 | Tailwind CSS | className で宣言的にスタイリング |
| テーマ依存値 | \`sx\` prop | \`sx={{ color: 'primary.main' }}\` |
| レスポンシブ | どちらでも可 | sx: \`{ xs: 1, md: 2 }\` / Tailwind: \`md:p-2\` |

\`\`\`tsx
// MUIコンポーネント → sx
<Button sx={{ px: 3, borderRadius: 2 }}>保存</Button>

// 純HTML → Tailwind
<div className="flex gap-2 p-4">...</div>

// 混在禁止: MUIコンポーネントにclassNameでレイアウトしない
\`\`\`

**cn()ユーティリティ**: \`src/utils/className.ts\` の \`cn()\` で条件付きクラス結合`,
  },
  {
    keywords: [
      'テスト',
      'test',
      'vitest',
      'testing',
      'テスト規約',
      'テスト書き方',
      'ユニットテスト',
    ],
    title: 'テスト規約',
    answer: `## テスト規約

**フレームワーク**: Vitest + React Testing Library

\`\`\`tsx
import { describe, it, expect } from 'vitest'

describe('MyComponent', () => {
  it('タイトルが表示される', () => {
    // Arrange → Act → Assert パターン
  })
})
\`\`\`

| ルール | 内容 |
|---|---|
| 配置 | \`__tests__/\` ディレクトリまたは \`.test.ts(x)\` |
| 命名 | \`describe\` は対象名、\`it\` は振る舞い |
| コマンド | \`pnpm test\` (実行) / \`pnpm test:watch\` (監視) |
| カバレッジ | \`pnpm test:coverage\` |
| モック | \`vi.fn()\`, \`vi.spyOn()\`, \`vi.stubGlobal()\` |`,
  },
  {
    keywords: [
      'TypeScript',
      '型定義',
      'interface',
      'type',
      '型ルール',
      'any',
      'strict',
      'generics',
    ],
    title: 'TypeScript型定義ルール',
    answer: `## TypeScript型定義ルール

| ルール | 内容 |
|---|---|
| strict mode | 必須。\`tsconfig.json\` で有効 |
| any禁止 | 使用時は理由をコメントで明記 |
| Props定義 | \`interface\` で定義 |
| 配置 | 共通型は \`src/types/\` に集約 |

\`\`\`tsx
// Props型定義
interface CardProps {
  title: string
  variant?: 'outlined' | 'elevation'
  onClose?: () => void
}

const MyCard = ({ title, variant = 'outlined', onClose }: CardProps) => {
  // ...
}
\`\`\`

**優先順位**: \`interface\`(拡張可能) > \`type\`(Union/交差型に使用)`,
  },
  {
    keywords: [
      'pnpm',
      'コマンド',
      'スクリプト',
      'npm',
      'ビルド',
      'build',
      'dev',
      '開発サーバー',
    ],
    title: 'pnpmコマンドリファレンス',
    answer: `## pnpmコマンドリファレンス

| コマンド | 用途 |
|---|---|
| \`pnpm dev\` | 開発サーバー起動 |
| \`pnpm storybook\` | Storybook起動 (port 6006) |
| \`pnpm lint\` | ESLintチェック + 自動修正 |
| \`pnpm format\` | Prettierフォーマット |
| \`pnpm fix\` | lint + format 一括実行 |
| \`pnpm test\` | テスト実行 |
| \`pnpm test:watch\` | テスト監視モード |
| \`pnpm test:coverage\` | カバレッジ付きテスト |
| \`pnpm build\` | 本番ビルド |

**注意**: \`npm\` は使用禁止。必ず \`pnpm\` を使用`,
  },
  {
    keywords: [
      'アニメーション',
      'animation',
      'motion',
      'transition',
      'トランジション',
      'easing',
      '動き',
    ],
    title: 'アニメーション/モーショントークン',
    answer: `## アニメーション/モーショントークン

| 用途 | 時間 | イージング |
|---|---|---|
| マイクロインタラクション | 150-300ms | ease-in-out |
| ページ遷移 | 300-500ms | cubic-bezier |
| ホバー/フォーカス | 150ms | ease |

\`\`\`tsx
// MUI transitions
sx={{
  transition: theme.transitions.create(['opacity', 'transform'], {
    duration: theme.transitions.duration.short, // 250ms
  }),
}}

// Tailwind
className="transition-opacity duration-200 ease-in-out"
\`\`\`

**注意**: \`prefers-reduced-motion\` への対応必須。アクセシビリティ設定でアニメーション無効化を尊重する`,
  },
  {
    keywords: [
      'figma',
      'フィグマ',
      '連携',
      'デザインツール',
      'html.to.design',
      'プラグイン',
    ],
    title: 'Figma連携ワークフロー',
    answer: `## Figma連携ワークフロー

### StorybookからFigmaへの取り込み
1. **html.to.design** プラグインでStorybookコンポーネントをFigmaに取り込み可能
2. トークン値は \`src/themes/colorToken.ts\` に全色定義あり
3. タイポグラフィは \`src/themes/typography.ts\` に全サイズ定義あり

### FigmaとCodeの対応
| Figma | Code |
|---|---|
| Component Property | Props (interface) |
| Instance Swap | \`ReactNode\` slot |
| Boolean Property | \`isOpen?: boolean\` |
| Variant | \`variant: 'contained' \\| 'outlined'\` |
| Auto Layout | Flexbox / Stack |

### トークン参照
Figmaで色指定する際は **トークン名** を使用（例: \`primary.main\`）。ハードコード値（\`#0EADB8\`）は禁止`,
  },
  {
    keywords: [
      '提案',
      '新規コンポーネント',
      '新しい部品',
      '作成プロセス',
      'ワークフロー',
      '開発フロー',
    ],
    title: 'コンポーネント提案プロセス',
    answer: `## コンポーネント提案プロセス

### 新規コンポーネント作成の手順
1. **既存確認**: Storybook > Components で類似コンポーネントを探す
2. **設計検討**: 6原則（間接化、カプセル化、制約、意味の符号化、合成、慣習）に基づく
3. **Props設計**: Boolean > Enum > Number > String の優先順位
4. **5状態設計**: Empty / Loading / Error / Partial / Ideal
5. **実装**: Component.tsx + Component.stories.tsx をセットで作成
6. **レビュー**: Storybookで全バリエーション確認

### ファイル構成
\`\`\`
src/components/ui/
  MyComponent/
    MyComponent.tsx          # コンポーネント本体
    MyComponent.stories.tsx  # Storybookストーリー
    __tests__/
      MyComponent.test.tsx   # テスト
\`\`\`

**React.FC禁止**: \`const MyComponent = ({ title }: Props) => { ... }\` 形式を使う`,
  },
  {
    keywords: [
      'AI',
      'プロンプト',
      'prompt',
      'Cursor',
      'Copilot',
      'コード生成',
      '自動',
      'Claude',
      'ChatGPT',
    ],
    title: 'AIとデザインシステム',
    answer: `## AIとデザインシステム

### なぜデザインシステムがAIの精度を上げるのか
デザインシステムが整備されていれば、AIへの指示が **一意** になる:

| 指示の質 | プロンプト例 | 結果 |
|---|---|---|
| **曖昧** | 「青いボタンを作って」 | AIが色・サイズ・角丸を勝手に決める |
| **明確** | 「Button variant=contained color=primary」 | トークンに基づく一意なコード生成 |

### AI時代にデザイナーが持つべき知識
1. **構造の理解**: コンポーネントの分割方針、props設計
2. **設計言語**: トークン名、バリアント名を正確に使える
3. **影響範囲**: AIが生成したコードが既存にどう影響するか判断

### 実践: AIへの効果的な指示
\`\`\`
// 良い指示（デザインシステム知識あり）
「ServiceCardコンポーネントを作成。
 - variant: outlined
 - padding: spacing(3)
 - 色: primary.main
 - 状態: Loading, Empty, Error, Ideal の4パターン」
\`\`\`

### Kaze UXでの活用
- **Storybook**: コンポーネント仕様の参照元としてAIに与える
- **デザイントークン**: AIがコード生成時にトークンを参照
- **このコンシェルジュ**: 設計判断の相談相手として活用

## やるべきこと
1. AIに指示する時は **トークン名・variant名** を正確に使う
2. AIが生成したコードが **既存コンポーネントと矛盾しないか** 確認
3. 「どう見えるか」より **「どういう意味か」** をAIに伝える
4. 生成コードは必ず **Storybook** で動作確認`,
  },
]

// ---------------------------------------------------------------------------
// 同義語展開: クエリに同義語を追加してマッチ率を向上
// ---------------------------------------------------------------------------

export const expandSynonyms = (query: string): string => {
  let expanded = query
  for (const [word, synonyms] of Object.entries(SYNONYM_MAP)) {
    if (query.includes(word)) {
      expanded += ' ' + synonyms.join(' ')
    }
  }
  return expanded
}

// ---------------------------------------------------------------------------
// Fuse.js ファジーマッチ用インスタンス（遅延初期化）
// ---------------------------------------------------------------------------

let fuseInstance: Fuse<FaqEntry> | null = null

const getFuse = (): Fuse<FaqEntry> => {
  if (!fuseInstance) {
    fuseInstance = new Fuse(FAQ_DATABASE, {
      keys: [
        { name: 'keywords', weight: 0.7 },
        { name: 'title', weight: 0.3 },
      ],
      threshold: 0.4,
      includeScore: true,
    })
  }
  return fuseInstance
}

// ---------------------------------------------------------------------------
// FAQ検索（同義語展開 → キーワードマッチ → Fuse.jsフォールバック）
// ---------------------------------------------------------------------------

export const findFaqAnswer = (query: string): string | null => {
  if (!query.trim()) return null

  // Step 1: 同義語展開 → キーワードマッチ（高速・確定的）
  const expanded = expandSynonyms(query)
  const q = expanded.toLowerCase()
  let best: { score: number; answer: string } | null = null
  for (const faq of FAQ_DATABASE) {
    let score = 0
    for (const kw of faq.keywords) {
      if (q.includes(kw.toLowerCase())) score += kw.length
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { score, answer: faq.answer }
    }
  }

  // キーワードマッチで十分なスコアがあればそれを返す
  if (best && best.score >= 3) return best.answer

  // Step 2: Fuse.jsファジーマッチ（フォールバック）
  const fuse = getFuse()
  const results = fuse.search(query)
  if (results.length > 0 && results[0].score !== undefined) {
    // Fuse.jsのスコアは0に近いほど良い
    if (results[0].score < 0.5) {
      return results[0].item.answer
    }
  }

  // キーワードマッチで低スコアでもあった場合はそれを返す
  if (best) return best.answer

  return null
}

// ---------------------------------------------------------------------------
// クイック候補・初期メッセージ
// ---------------------------------------------------------------------------

export const QUICK_SUGGESTIONS = [
  { label: '設計6原則', query: 'コンポーネント設計原則' },
  { label: 'UIステート5状態', query: 'UIステートスタック' },
  { label: 'カラーパレット', query: 'カラーパレット' },
  { label: 'レイアウト責任', query: 'レイアウト責任の分離' },
  { label: 'コンポーネント一覧', query: 'コンポーネント一覧' },
  { label: '命名規則', query: '命名規則' },
  { label: '変数の型', query: '変数の型とprops設計' },
  { label: 'スペーシング', query: 'スペーシング' },
]

export const INITIAL_GREETING =
  'Kaze UX コンシェルジュです。トークン・コンポーネント・設計理論について質問できます。下のボタンか自由入力でどうぞ。'

// ---------------------------------------------------------------------------
// 動的サジェスト生成
// ---------------------------------------------------------------------------

export interface Suggestion {
  label: string
  query: string
}

const MAX_SUGGESTIONS = 6

// FAQ_DATABASEの小文字バージョンを事前計算（毎回toLowerCase()を呼ばない）
const FAQ_SEARCH_INDEX = FAQ_DATABASE.map((faq) => ({
  title: faq.title,
  titleLower: faq.title.toLowerCase(),
  keywordsLower: faq.keywords.map((kw) => kw.toLowerCase()),
}))

/**
 * 会話コンテキストから動的サジェストを生成(最大6件)
 * 優先度: レスポンス派生 > ページコンテキスト > 静的フォールバック
 */
export const generateSuggestions = (
  lastBotText: string | null,
  currentStoryTitle: string | null,
  usedQueries: Set<string>
): Suggestion[] => {
  const results: Suggestion[] = []
  const seen = new Set<string>()

  const add = (label: string, query: string): boolean => {
    if (results.length >= MAX_SUGGESTIONS) return false
    if (usedQueries.has(query) || seen.has(query)) return false
    seen.add(query)
    results.push({ label, query })
    return true
  }

  // 1. レスポンス派生: 直前のBot回答テキストからFAQタイトルをマッチング
  if (lastBotText) {
    const text = lastBotText.toLowerCase()
    for (const idx of FAQ_SEARCH_INDEX) {
      if (results.length >= MAX_SUGGESTIONS) break
      const titleMatch = text.includes(idx.titleLower)
      const keywordHits = idx.keywordsLower.filter((kw) =>
        text.includes(kw)
      ).length
      if (titleMatch || keywordHits >= 2) {
        add(idx.title, idx.title)
      }
    }
  }

  // 2. ページコンテキスト: currentStoryTitle の related からサジェスト生成
  if (currentStoryTitle) {
    const entry = STORY_GUIDE_MAP[currentStoryTitle]
    if (entry?.related) {
      for (const relatedTitle of entry.related) {
        if (results.length >= MAX_SUGGESTIONS) break
        // related はストーリータイトル("Guide/Introduction"等)なので短縮ラベルを生成
        const label = relatedTitle.includes('/')
          ? (relatedTitle.split('/').pop() ?? relatedTitle)
          : relatedTitle
        add(label, `${relatedTitle} について教えて`)
      }
    }
  }

  // 3. 静的フォールバック: QUICK_SUGGESTIONS から未使用分を補充
  for (const s of QUICK_SUGGESTIONS) {
    if (results.length >= MAX_SUGGESTIONS) break
    add(s.label, s.query)
  }

  return results
}
