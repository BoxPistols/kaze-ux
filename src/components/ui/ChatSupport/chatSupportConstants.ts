// ChatSupport 定数・ユーティリティ

import type {
  ChatSupportConfig,
  ShortcutBinding,
  ShortcutMap,
  ShortcutMetadata,
} from './chatSupportTypes'

// ---------------------------------------------------------------------------
// システムプロンプト
// ---------------------------------------------------------------------------

export const SYSTEM_PROMPT = `あなたは Kaze UX デザインシステム のページ補足コンシェルジュ。ユーザーが今見ているStorybookページの理解を助け、デザインシステムの疑問に答える。

## ユーザー像
主な利用者はUIデザイナー。Figmaでの画面制作が本業で、コードやデザインシステムの仕組みには不慣れ。エンジニアリングの概念は「Figmaでいうと何？」に置き換えて説明する。コードを見せる場合は「Figmaのこの操作がコードではこう書かれている」という橋渡しを添える。

## 最優先ルール: ページの文脈に答える
ユーザーが「これ」「このUI」「このコンポーネント」と言ったら、今見ているページのコンポーネントについて答える。概要や理論で始めず、「はい、これはMUI標準のBreadcrumbsコンポーネントです」のように結論から入る。

## 模範回答（この品質・長さを厳守）

Q: このUIはMUI標準？（パンくずリストパターンのページで）
A: はい、これはMUI標準の **Breadcrumbs** コンポーネントです。パスの階層をリンクで表示し、ユーザーが現在位置を把握できるナビゲーション要素です。

Figmaでいうと、Auto Layoutで横並びにしたテキストリンクの間に「>」区切りを入れたものと同じ構造です。

| Figmaの操作 | Kaze UXでの実装 |
|------------|-------------|
| テキストリンクを横並び | Breadcrumbs コンポーネント |
| 「>」区切り | separator propで自動挿入 |
| 最後の項目だけ太字・リンクなし | Typography（color="text.primary"） |

\`\`\`tsx
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

<Breadcrumbs aria-label="パンくずリスト">
  <Link href="/">ホーム</Link>
  <Link href="/projects">プロジェクト</Link>
  <Typography color="text.primary">詳細</Typography>
</Breadcrumbs>
\`\`\`

Kaze UXではNavigationカテゴリで使用しています。詳しくは https://mui.com/material-ui/react-breadcrumbs/ を参照してください。

---
Q: デザイントークンとは？
A: Figmaの「カラースタイル」「テキストスタイル」と同じ考え方です。色やフォントに名前を付けて一元管理し、直接値を書かずに名前で参照します。

| Figmaの概念 | Kaze UXでの対応 | 例 |
|------------|-------------|-----|
| カラースタイル | デザイントークン(色) | primary.main = #0EADB8 |
| テキストスタイル | デザイントークン(文字) | body1 = 14px/1.6 |
| スペーシング変数 | spacing単位 | spacing(2) = 16px |

\`\`\`tsx
// NG: 値を直接書く（Figmaでスタイルを使わずHEXを直書きするのと同じ）
<Box sx={{ color: '#0EADB8', fontSize: 14, gap: '16px' }}>

// OK: トークンで参照する（Figmaのカラースタイルを適用するのと同じ）
<Box sx={{ color: 'primary.main', fontSize: 'body1.fontSize', gap: 2 }}>
\`\`\`

Figmaでスタイルを変更すれば全画面に反映されるのと同じように、トークンの定義元を1箇所変えれば全体に反映されます。Kaze UXの定義元: \`src/themes/colorToken.ts\`（色）、\`src/themes/typography.ts\`（文字）。

---
Q: sxとclassNameはどう使い分ける？
A: Figmaの操作に例えると、**sx = コンポーネントのデザイン属性を変える**、**className = フレーム上での配置を決める**です。

| やりたいこと | 使うもの | Figmaの操作 |
|------------|---------|------------|
| 色・影・hover効果 | sx | 塗り・効果の変更 |
| 余白・配置・並び順 | className(Tailwind) | Auto Layoutの設定 |
| MUI固有の微調整 | sx | コンポーネントのオーバーライド |

\`\`\`tsx
// sx: デザイン属性（色・影・状態変化）
<Button sx={{ color: 'primary.main', boxShadow: 2, '&:hover': { bgcolor: 'action.hover' } }}>
  保存
</Button>

// className: レイアウト（余白・配置）
<Box className="flex items-center justify-between gap-4 mt-6 px-4">
  <Typography variant="h6">設定</Typography>
  <Button variant="contained">保存</Button>
</Box>
\`\`\`

1つの要素にsxとclassNameを混ぜると優先順位が不明確になるため、どちらか一方を使ってください。詳しくは https://mui.com/system/getting-started/the-sx-prop/ を参照してください。

## 回答ルール
- 上の模範回答と同じ構成・長さで書く。模範より短い回答は禁止
- 質問に直接答えてから補足する。「概要」「背景」「マテリアルデザインとは」で始めるな
- コードを見せる場合は、Figmaの何に対応するか一言添える
- コード不要の質問（「これはMUI標準？」「何に使う？」）にはコードなしで答えてよい。コードが役立つ場面でのみコードを含める
- 「〜できます」ではなく「〜してください」で行動を促す
- URLは末尾に「詳しくは URL を参照してください」で添える
- 「〜を示します」「〜を整理します」「〜していきます」で終わるな。結論文で終えろ
- 曖昧語（「様々な」「基本的に」「適切に」）を避け、具体値を書く
- MUI公式リファレンスが注入されている場合、その情報を正確に引用して回答する

## Kaze UX設計ルール
- コンポーネント=PascalCase、props=camelCase、色=意味ベース(primary, error)
- MUI v7 Grid: size={{ xs: 12, sm: 6 }}（旧item禁止）
- 8pxグリッド基準。lucide-reactアイコン。React.FC禁止

## デザイントークン早見表
### カラー
primary=#0EADB8, secondary=#696881, success=#46ab4a, info=#1dafc2, warning=#eb8117, error=#da3737
text.primary=#1a1a2e, text.secondary=#4a5568, background=#f8fafc | ダークモード完全対応（WCAG AA）

### タイポグラフィ
Inter + Noto Sans JP | 1rem=14px
32px(ページ見出し) / 20px(セクション見出し) / 18px(小見出し) / 14px(本文) / 12px(補助) / 10px(特殊)

### スペーシング(8px基準)
0.5=4px, 1=8px, 2=16px, 3=24px, 4=32px

### ブレークポイント
sm=768px, md=1366px(メイン), lg=1920px | タッチ最小44px

### コンポーネント一覧
UI: Button, Card, Accordion, Alert, Badge/Chip, Tooltip, FAB, Pagination, SplitButton, ThemeToggle
Form: CustomTextField, CustomSelect, MultiSelectAutocomplete, DateTimePicker
Layout: MainGrid, SettingDrawer | Map: Map3D, MapLibre
Navigation: AppBar+Drawer, Breadcrumbs, Tabs
Table: CustomTable

### Figma→コード変換表
| Figma | Kaze UX / MUI |
|-------|-----------|
| Auto Layout (横) | Stack direction="row" / className="flex" |
| Auto Layout (縦) | Stack direction="column" / className="flex flex-col" |
| Frame | Box |
| Fill Container | className="w-full" / fullWidth prop |
| Fixed Size | sx={{ width: 200 }} |
| カラースタイル | デザイントークン (primary.main等) |
| テキストスタイル | Typography variant (h4, body1等) |
| コンポーネントインスタンス | MUIコンポーネント (Button, Card等) |
| バリアント | variant / color / size prop |
| Constraints | レスポンシブブレークポイント |`

// ---------------------------------------------------------------------------
// プラットフォーム判定
// ---------------------------------------------------------------------------

export const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad/.test(navigator.userAgent)
export const MOD_KEY = isMac ? 'Cmd' : 'Ctrl'

// ---------------------------------------------------------------------------
// ショートカット定義・ユーティリティ
// ---------------------------------------------------------------------------

export const SHORTCUT_METADATA: ShortcutMetadata[] = [
  { id: 'sendMessage', desc: 'メッセージ送信' },
  { id: 'focusInput', desc: '入力欄にフォーカス' },
  { id: 'toggleChat', desc: 'チャット開閉' },
  { id: 'toggleSettings', desc: '設定パネル切替' },
  { id: 'downloadHistory', desc: '履歴ダウンロード' },
  { id: 'toggleUiMode', desc: 'サイドバー/ウィジェット切替' },
  { id: 'clearHistory', desc: '履歴クリア' },
  { id: 'closeChat', desc: 'チャットを閉じる' },
]

const DEFAULT_SHORTCUTS: ShortcutMap = {
  sendMessage: { key: 'Enter', mod: false, shift: false, alt: false },
  focusInput: { key: '/', mod: true, shift: false, alt: false },
  toggleChat: { key: 'k', mod: true, shift: true, alt: false },
  toggleSettings: { key: 'x', mod: true, shift: true, alt: false },
  downloadHistory: { key: 'd', mod: true, shift: true, alt: false },
  toggleUiMode: { key: 'l', mod: true, shift: true, alt: false },
  clearHistory: { key: 'Backspace', mod: true, shift: true, alt: false },
  closeChat: { key: 'Escape', mod: false, shift: false, alt: false },
}

export const createDefaultShortcuts = (): ShortcutMap => ({
  sendMessage: { ...DEFAULT_SHORTCUTS.sendMessage },
  focusInput: { ...DEFAULT_SHORTCUTS.focusInput },
  toggleChat: { ...DEFAULT_SHORTCUTS.toggleChat },
  toggleSettings: { ...DEFAULT_SHORTCUTS.toggleSettings },
  downloadHistory: { ...DEFAULT_SHORTCUTS.downloadHistory },
  toggleUiMode: { ...DEFAULT_SHORTCUTS.toggleUiMode },
  clearHistory: { ...DEFAULT_SHORTCUTS.clearHistory },
  closeChat: { ...DEFAULT_SHORTCUTS.closeChat },
})

export const normalizeShortcutKey = (key: string): string => {
  if (key === 'Esc') return 'Escape'
  if (key === ' ') return 'Space'
  return key.length === 1 ? key.toLowerCase() : key
}

const formatShortcutKey = (key: string): string => {
  const normalized = normalizeShortcutKey(key)
  if (normalized === 'Backspace') return 'Delete'
  if (normalized === 'Escape') return 'Esc'
  if (normalized === 'Space') return 'Space'
  return normalized.length === 1 ? normalized.toUpperCase() : normalized
}

export const formatShortcutLabel = (shortcut: ShortcutBinding): string => {
  const parts: string[] = []
  if (shortcut.mod) parts.push(MOD_KEY)
  if (shortcut.shift) parts.push('Shift')
  if (shortcut.alt) parts.push('Alt')
  parts.push(formatShortcutKey(shortcut.key))
  return parts.join('+')
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const normalizeShortcutBinding = (
  value: unknown,
  fallback: ShortcutBinding
): ShortcutBinding => {
  if (!isRecord(value)) return { ...fallback }
  const key =
    typeof value.key === 'string' ? normalizeShortcutKey(value.key) : ''
  if (!key) return { ...fallback }
  return {
    key,
    mod: typeof value.mod === 'boolean' ? value.mod : fallback.mod,
    shift: typeof value.shift === 'boolean' ? value.shift : fallback.shift,
    alt: typeof value.alt === 'boolean' ? value.alt : fallback.alt,
  }
}

const normalizeShortcuts = (value: unknown): ShortcutMap => {
  const defaults = createDefaultShortcuts()
  if (!isRecord(value)) return defaults
  return {
    sendMessage: normalizeShortcutBinding(
      value.sendMessage,
      defaults.sendMessage
    ),
    focusInput: normalizeShortcutBinding(value.focusInput, defaults.focusInput),
    toggleChat: normalizeShortcutBinding(value.toggleChat, defaults.toggleChat),
    toggleSettings: normalizeShortcutBinding(
      value.toggleSettings,
      defaults.toggleSettings
    ),
    downloadHistory: normalizeShortcutBinding(
      value.downloadHistory,
      defaults.downloadHistory
    ),
    toggleUiMode: normalizeShortcutBinding(
      value.toggleUiMode,
      defaults.toggleUiMode
    ),
    clearHistory: normalizeShortcutBinding(
      value.clearHistory,
      defaults.clearHistory
    ),
    closeChat: normalizeShortcutBinding(value.closeChat, defaults.closeChat),
  }
}

// ---------------------------------------------------------------------------
// 修飾キー判定
// ---------------------------------------------------------------------------

export const MODIFIER_ONLY_KEYS = new Set(['Meta', 'Control', 'Shift', 'Alt'])

// ---------------------------------------------------------------------------
// ストレージキー・モデル定数
// ---------------------------------------------------------------------------

export const CHAT_STORAGE_KEY = 'storybook_chat_history'
export const CONFIG_STORAGE_KEY = 'storybook_chat_config'

// デフォルトAPIキー（ビルド時に埋め込み）
export const DEFAULT_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''
export const DEFAULT_MODEL = 'gpt-4.1-nano'

export interface ModelOption {
  value: string
  label: string
  description: string
  features: string[]
  usecases: string[]
  tier: 'economy' | 'standard' | 'premium'
}

export const OPENAI_MODELS: ModelOption[] = [
  {
    value: 'gpt-5-mini',
    label: 'gpt-5-mini (推奨)',
    description: '高精度な推論と深い文脈理解。複雑なタスクに最適',
    features: [
      '高度な推論・思考連鎖',
      '長いコンテキスト理解',
      'コード品質が最も高い',
    ],
    usecases: [
      'アーキテクチャ設計・リファクタ提案',
      '複雑なバグの原因分析',
      'コンポーネント設計レビュー',
    ],
    tier: 'premium',
  },
  {
    value: 'gpt-4.1-mini',
    label: 'gpt-4.1-mini',
    description: '精度とコストのバランス型。日常的な開発補助に',
    features: [
      '安定した応答品質',
      'コスト効率が良い',
      '関数呼び出し・構造化出力に強い',
    ],
    usecases: [
      'コンポーネント実装・コード生成',
      'props設計・型定義の相談',
      'MUI/Tailwindのスタイリング相談',
    ],
    tier: 'standard',
  },
  {
    value: 'gpt-4.1-nano',
    label: 'gpt-4.1-nano (高速)',
    description: '最速応答・最低コスト。簡単な質問に',
    features: ['応答速度が最も速い', '低コスト', '軽量タスク向け'],
    usecases: [
      '用語・概念の簡単な質問',
      'コードスニペットの確認',
      'エラーメッセージの解説',
    ],
    tier: 'economy',
  },
  {
    value: 'gpt-5-nano',
    label: 'gpt-5-nano',
    description: '次世代の高速モデル。日常的なコード補助に',
    features: ['GPT-5系の推論能力', '高速レスポンス', 'nano価格帯で高品質'],
    usecases: [
      'テストコードの生成',
      'TypeScript型定義の補助',
      'コードレビュー・改善提案',
    ],
    tier: 'standard',
  },
]

export const GEMINI_MODELS: ModelOption[] = [
  {
    value: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash (Google)',
    description: '大きなコンテキスト窓。長文解析・要約に強い',
    features: [
      '100万トークンのコンテキスト',
      '無料枠が広い',
      'マルチモーダル対応',
    ],
    usecases: [
      '長いソースコードの読解・要約',
      'ドキュメント全体の分析',
      '複数ファイルの横断比較',
    ],
    tier: 'standard',
  },
]

/** 全モデル一覧（後方互換） */
export const DEFAULT_MODELS = [...OPENAI_MODELS, ...GEMINI_MODELS]

// ---------------------------------------------------------------------------
// Config正規化・ロード
// ---------------------------------------------------------------------------

export const DEFAULT_CHAT_CONFIG: ChatSupportConfig = {
  apiKey: DEFAULT_API_KEY,
  model: DEFAULT_MODEL,
  uiMode: 'widget',
  sidebarWidth: 400,
  shortcuts: createDefaultShortcuts(),
}

const normalizeSidebarWidth = (value: number): number =>
  Math.max(320, Math.min(800, value))

export const normalizeChatConfig = (value: unknown): ChatSupportConfig => {
  if (!isRecord(value)) {
    return { ...DEFAULT_CHAT_CONFIG, shortcuts: createDefaultShortcuts() }
  }
  return {
    apiKey:
      typeof value.apiKey === 'string'
        ? value.apiKey
        : DEFAULT_CHAT_CONFIG.apiKey,
    model:
      typeof value.model === 'string' ? value.model : DEFAULT_CHAT_CONFIG.model,
    uiMode: value.uiMode === 'sidebar' ? 'sidebar' : 'widget',
    sidebarWidth:
      typeof value.sidebarWidth === 'number'
        ? normalizeSidebarWidth(value.sidebarWidth)
        : 400,
    shortcuts: normalizeShortcuts(value.shortcuts),
  }
}

export const loadChatConfig = (): ChatSupportConfig => {
  const saved = localStorage.getItem(CONFIG_STORAGE_KEY)
  if (!saved)
    return { ...DEFAULT_CHAT_CONFIG, shortcuts: createDefaultShortcuts() }
  try {
    const config = normalizeChatConfig(JSON.parse(saved))

    // デフォルトAPIキー使用時はモデルもデフォルトに統一
    // （ユーザーはモデル選択UIからいつでも変更可能）
    const isDefaultKey = !config.apiKey || config.apiKey === DEFAULT_API_KEY
    if (isDefaultKey && config.model !== DEFAULT_MODEL) {
      config.model = DEFAULT_MODEL
    }

    return config
  } catch (error) {
    console.error(error)
    return { ...DEFAULT_CHAT_CONFIG, shortcuts: createDefaultShortcuts() }
  }
}

// ---------------------------------------------------------------------------
// ショートカット判定ヘルパー（コンポーネント内で使用）
// ---------------------------------------------------------------------------

export const isShortcutMatch = (
  e: KeyboardEvent,
  shortcut: ShortcutBinding
): boolean => {
  const modMatch = shortcut.mod
    ? e.metaKey || e.ctrlKey
    : !e.metaKey && !e.ctrlKey
  return (
    normalizeShortcutKey(e.key) === shortcut.key &&
    modMatch &&
    e.shiftKey === shortcut.shift &&
    e.altKey === shortcut.alt
  )
}

// React.KeyboardEvent用のオーバーロード
export const isReactShortcutMatch = (
  e: React.KeyboardEvent,
  shortcut: ShortcutBinding
): boolean => {
  const modMatch = shortcut.mod
    ? e.metaKey || e.ctrlKey
    : !e.metaKey && !e.ctrlKey
  return (
    normalizeShortcutKey(e.key) === shortcut.key &&
    modMatch &&
    e.shiftKey === shortcut.shift &&
    e.altKey === shortcut.alt
  )
}

// ---------------------------------------------------------------------------
// ペルソナ検出（行動心理学ベース）
// ---------------------------------------------------------------------------

export type Persona = 'designer' | 'engineer' | 'unknown'

// ページカテゴリによるペルソナ推定
const DESIGNER_PAGE_PREFIXES = [
  'Guide/',
  'Design Philosophy/',
  'Design Tokens/',
]
const ENGINEER_PAGE_PREFIXES = ['Components/', 'Layout/', 'Patterns/']

// 質問語彙によるペルソナ推定
const DESIGNER_VOCABULARY = [
  'figma',
  'デザイン',
  '色',
  '余白',
  'フォント',
  'ui',
  'カラー',
  '角丸',
  'アイコン',
  'レイアウト',
  'トークン',
  '間隔',
  'サイズ',
]
const ENGINEER_VOCABULARY = [
  '実装',
  'コード',
  'api',
  'prop',
  'sx',
  'import',
  'test',
  'テスト',
  '型',
  'interface',
  'hooks',
  'useState',
  'component',
  'tsx',
  'pnpm',
  'vitest',
  'TypeScript',
]

/**
 * ページカテゴリと質問内容からペルソナを推定する
 */
export const detectPersona = (
  pageTitle: string | undefined,
  query: string
): Persona => {
  let designerScore = 0
  let engineerScore = 0

  // ページカテゴリシグナル
  if (pageTitle) {
    if (DESIGNER_PAGE_PREFIXES.some((p) => pageTitle.startsWith(p))) {
      designerScore += 2
    }
    if (ENGINEER_PAGE_PREFIXES.some((p) => pageTitle.startsWith(p))) {
      engineerScore += 2
    }
  }

  // 質問語彙シグナル
  const q = query.toLowerCase()
  for (const word of DESIGNER_VOCABULARY) {
    if (q.includes(word.toLowerCase())) designerScore += 1
  }
  for (const word of ENGINEER_VOCABULARY) {
    if (q.includes(word.toLowerCase())) engineerScore += 1
  }

  if (designerScore > engineerScore && designerScore >= 2) return 'designer'
  if (engineerScore > designerScore && engineerScore >= 2) return 'engineer'
  return 'unknown'
}

// ---------------------------------------------------------------------------
// ペルソナ別プロンプト拡張（行動心理学ベース）
// ---------------------------------------------------------------------------

/** デザイナー向け（デフォルト）: Figma橋渡し、仕組み化の動機付け */
export const DESIGNER_PROMPT_EXTENSION = `
## デザイナー向け回答ガイドライン
ユーザーはデザイナーと推定される。以下のルールで回答する:

1. **Figma→コード橋渡し**: 「Auto Layout = Flexbox = MUI Stack」のように、Figmaの概念からコードの概念に変換して説明する
2. **仕組み化のメリットを具体的に**: 「トークンを使うと、Figmaのカラースタイル変更と同じように1箇所の変更で全画面に反映される」のように、デザイナーが既に理解している操作に例える
3. **次のアクション提示**: 「次にやること」を1つ具体的に示す
4. **技術的深さの制限**: 実装詳細には深入りしない。コードは「エンジニアに渡すときにこう伝えれば通じる」程度
5. **構造化**: テーブル・リストで情報を整理する。段落は3行以内`

/** エンジニア向け: コードファースト、Why重視 */
export const ENGINEER_PROMPT_EXTENSION = `
## エンジニア向け回答ガイドライン
ユーザーはエンジニアと推定される。以下のルールで回答する:

1. **コードファースト**: 説明の前にコピペ可能なコード例を示す（import文含む）
2. **Why重視**: ルールの背景理由を1文で添える（例: React.FC禁止 → ジェネリック型の推論が壊れるため）
3. **Kaze UX独自ルール明示**: MUI公式とKaze UXルールの差分がある場合は明確に区別する
4. **ファイルパス提示**: 関連ソースの場所を示す（例: \`src/themes/theme.ts\`）
5. **比較表**: 複数アプローチがある場合は比較表で違いを示す`
