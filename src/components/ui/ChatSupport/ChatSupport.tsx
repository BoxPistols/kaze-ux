import {
  Avatar,
  Box,
  Fab,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Zoom,
  useTheme,
  CircularProgress,
  MenuItem,
  InputAdornment,
  Divider,
  Button,
  Alert,
  Slide,
  Link,
  Chip,
} from '@mui/material'
import {
  X,
  Send,
  User,
  Bot,
  Trash2,
  Sparkles,
  Settings,
  Eye,
  EyeOff,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  PanelRight,
  MessageSquare,
  Download,
  Copy,
  Check,
  Keyboard,
} from 'lucide-react'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { findStoryGuide } from './storyGuideMap'

import type { StoryGuideEntry } from './storyGuideMap'

const BookConciergeIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'>
    <path
      d='M12 6.25C10.5 4.75 7.75 3.75 5 3.75c-1 0-1.75.12-2 .18v14.14c.25-.06 1-.18 2-.18 2.75 0 5.5 1 7 2.5'
      strokeWidth={1.65}
    />
    <path
      d='M12 6.25c1.5-1.5 4.25-2.5 7-2.5 1 0 1.75.12 2 .18v14.14c-.25-.06-1-.18-2-.18-2.75 0-5.5 1-7 2.5'
      strokeWidth={1.65}
    />
    <path d='M12 6.25v14.14' strokeWidth={1.65} />
  </svg>
)

export interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export interface CurrentStoryContext {
  /** Storybook meta title（例: "Guide/MUI + Tailwind CSS"） */
  title: string
  /** ストーリー名（例: "Overview"） */
  name: string
  /** meta description（あれば） */
  description?: string
}

interface ChatSupportProps {
  /** 現在表示中のストーリー情報 */
  currentStory?: CurrentStoryContext
}

const SYSTEM_PROMPT = `あなたは Kaze UX デザインシステム コンシェルジュ。回答は必ず以下のルールに従うこと:

## 回答ルール
1. 冗長にしない。要点を3-5行で端的に伝える
2. 「〜できます」ではなく「〜してください」で行動を促す
3. コード例は最小限、コピペ可能な形で
4. MUI公式ドキュメントのURLを関連する回答に含める（例: https://mui.com/material-ui/react-button/）
5. 「やるべきこと」セクションは付けない。次のアクションが必要なら1行で端的に添える

## デザインシステム理論（コンポーネント設計6原則）
1. **間接化**: UIを直接ハードコードせずトークン・変数経由で制御する。色=#2642beではなくprimary.mainで参照
2. **カプセル化**: 内部実装を隠し、公開APIだけで操作する。variant/size/colorで制御、内部CSSは触らせない
3. **制約**: 選択肢を意図的に狭める。Booleanは2択、Enumは3-7択。自由入力よりセレクトボックス
4. **意味の符号化**: 見た目ではなく意味で命名。red/blueではなくerror/primary、sm/md/lgではなくcompact/default/comfortable
5. **合成**: 小さなコンポーネントを組み合わせて大きなUIを作る。Button+Icon=IconButton、Card+List=CardList
6. **慣習**: チーム内の共通ルール遵守。MUI v7 Grid API、React.FC禁止、8px基準スペーシング

## デザインシステム理論（設計知識）
- **経路依存性**: 初期決定が将来を制約する。トークン設計・命名は最初に慎重に決める
- **追加>削除**: コンポーネント追加は容易だが削除は困難（依存関係が生まれる）。最小限から始める
- **UIステートスタック**: 全UIに5状態を設計する → Empty(空)/Loading(読込)/Error(異常)/Partial(一部)/Ideal(理想)
- **レイアウト責任分離**: margin=親の責任、padding=自分の責任。コンポーネント自体にmarginを持たせない
- **サイジング**: Fill(親幅いっぱい)/Hug(中身に合わせる)/Fixed(固定値) の3パターン
- **変数の型**: Boolean(2択: isOpen)→Enum(3-7択: variant='primary'|'secondary')→自由入力は最終手段
- **命名規則**: コンポーネント=PascalCase(ServiceCard)、props=camelCase(isDisabled)、意味ベース(色:primary,サイズ:compact)

## デザインシステム理論（応用知識）
- **関心の分離**: 見た目/データ、構造/スタイル、汎用/ドメインの3レイヤーで分離
- **一貫性の価値**: 学習コスト↓、ブランド信頼↑、再利用性↑。一貫しているからこそ逸脱がシグナルになる
- **意図的な妥協**: 「なぜ今こうするか」を残す。後で直しやすい方向に倒す。「今はやらない」≠「やらなくていい」
- **構築戦略**: 汎用ライブラリ(MUI)→Headless(Radix)→フルスクラッチ。Kaze UXはMUIベースハイブリッド
- **汎用vsドメイン**: Button=汎用(どこでも使える)、ServiceCard=ドメイン(特定データ依存)。混ぜない
- **早すぎる共通化**: 見た目が似ている≠目的が同じ。3回登場まで待つ(Rule of Three)
- **スロット**: propsにコンポーネントを渡す。Figma Instance Swap=Code ReactNode。バリアント爆発を防ぐ
- **直交性**: size変更がvariant(色)に影響しない設計。1プロパティ1関心事
- **破壊的変更**: 追加=安全、名前変更/削除=破壊的。Deprecation→移行期間→削除の手順
- **インタラクション状態**: Hover/Pressed/Disabled/Focusをトークンで統一（例:黒8%オーバーレイ）
- **オーバーフロー**: テキスト→省略(ellipsis)or折り返し。コンテンツ→スクロールorページネーション
- **アセット**: アイコン=SVG+currentColor(テーマ自動追従)。Kaze UX=lucide-react

## 基礎知識
- **React**: UIを関数(コンポーネント)で構築。props=外からの入力、state=内部状態(useState)、JSXでUI記述
- **Material Design**: Googleの設計体系。elevation(影深度)、ripple(波紋)、8pxグリッド、明快な階層。MUI=React実装
- **人間工学**: Fittsの法則(大きいターゲット=速い)、Hickの法則(選択肢が少ない=迷わない)、認知負荷の最小化
- **AIとデザインシステム**: トークン・コンポーネント体系があればAI指示が一意に。プロンプト=設計言語

## デザイントークン
### カラー
primary.main=#2642be, primary.dark=#1a2c80, primary.light=#4d68d4, secondary.main=#696881
success=#46ab4a, info=#1dafc2, warning=#eb8117, error=#da3737
text.primary=#1a1a2e, text.secondary=#4a5568, background=#f8fafc
ダークモード完全対応（WCAG AA）

### タイポグラフィ
Inter, Noto Sans JP | 1rem=14px
32px(見出し大)/20px(見出し)/18px(小見出し)/14px(本文)/12px(補助,最小原則)/10px(特殊)
ウェイト: 300/400/500/700 | 行高: 1.8/1.6/1.4

### スペーシング(8px基準)
0.5=4px, 1=8px, 2=16px(標準), 3=24px, 4=32px

### ブレークポイント
xs=0px, sm=768px, md=1366px(メイン), lg=1920px(メイン) | タッチ最小44px

### コンポーネント
UI: Button, Card, Accordion, Alert, Badge/Chip, Tooltip, FAB, Pagination, SplitButton, ThemeToggle, ConnectionStatusChip, ServiceCard, CustomToaster, NotFoundView
Form: CustomTextField, CustomSelect, MultiSelectAutocomplete, DateTimePicker
Layout: MainGrid, SettingDrawer | Map: Map3D, MapLibre, DIDMap
Domain: LayerControlPanel, RestrictionLegend, StatusIndicators, ZoneStatusChip
Table: CustomTable

### MUI v7ルール
Grid: size={{ xs: 12, sm: 6 }} (旧item禁止) | React.FC完全禁止 | any型禁止
Button: 角丸6px,最小幅80px | Card: elevation=0,角丸12px | Input: size=small
コンテナ幅: 1280px(標準), 960px(フォーム), 1600px(ダッシュボード), 100%(マップ)

### Storybook構成
Guide(使い方) > DesignPhilosophy(理念) > DesignTokens(色/字/余白) > Layout(グリッド) > Components(UI/Form/Map/Domain) > Patterns(複合UI)`

const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad/.test(navigator.userAgent)
const MOD_KEY = isMac ? 'Cmd' : 'Ctrl'

type ShortcutActionId =
  | 'sendMessage'
  | 'focusInput'
  | 'toggleChat'
  | 'toggleSettings'
  | 'downloadHistory'
  | 'toggleUiMode'
  | 'clearHistory'
  | 'closeChat'

interface ShortcutBinding {
  key: string
  mod: boolean
  shift: boolean
  alt: boolean
}

type ShortcutMap = Record<ShortcutActionId, ShortcutBinding>

interface ShortcutMetadata {
  id: ShortcutActionId
  desc: string
}

interface ChatSupportConfig {
  apiKey: string
  model: string
  uiMode: 'widget' | 'sidebar'
  sidebarWidth: number
  shortcuts: ShortcutMap
}

const SHORTCUT_METADATA: ShortcutMetadata[] = [
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
  sendMessage: { key: 'Enter', mod: true, shift: false, alt: false },
  focusInput: { key: '/', mod: true, shift: false, alt: false },
  toggleChat: { key: 'k', mod: true, shift: true, alt: false },
  toggleSettings: { key: 's', mod: true, shift: true, alt: false },
  downloadHistory: { key: 'd', mod: true, shift: true, alt: false },
  toggleUiMode: { key: 'l', mod: true, shift: true, alt: false },
  clearHistory: { key: 'Backspace', mod: true, shift: true, alt: false },
  closeChat: { key: 'Escape', mod: false, shift: false, alt: false },
}

const createDefaultShortcuts = (): ShortcutMap => ({
  sendMessage: { ...DEFAULT_SHORTCUTS.sendMessage },
  focusInput: { ...DEFAULT_SHORTCUTS.focusInput },
  toggleChat: { ...DEFAULT_SHORTCUTS.toggleChat },
  toggleSettings: { ...DEFAULT_SHORTCUTS.toggleSettings },
  downloadHistory: { ...DEFAULT_SHORTCUTS.downloadHistory },
  toggleUiMode: { ...DEFAULT_SHORTCUTS.toggleUiMode },
  clearHistory: { ...DEFAULT_SHORTCUTS.clearHistory },
  closeChat: { ...DEFAULT_SHORTCUTS.closeChat },
})

const normalizeShortcutKey = (key: string): string => {
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

const formatShortcutLabel = (shortcut: ShortcutBinding): string => {
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

const MODIFIER_ONLY_KEYS = new Set(['Meta', 'Control', 'Shift', 'Alt'])
const normalizeSidebarWidth = (value: number): number =>
  Math.max(320, Math.min(800, value))

const CHAT_STORAGE_KEY = 'storybook_chat_history'
const CONFIG_STORAGE_KEY = 'storybook_chat_config'

const DEFAULT_MODELS = [
  { value: 'gpt-5-mini', label: 'gpt-5-mini (推奨)' },
  { value: 'gpt-4.1-mini', label: 'gpt-4.1-mini' },
  { value: 'gpt-4.1-nano', label: 'gpt-4.1-nano (高速)' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Google)' },
]

const DEFAULT_CHAT_CONFIG: ChatSupportConfig = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-5-mini',
  uiMode: 'widget',
  sidebarWidth: 400,
  shortcuts: createDefaultShortcuts(),
}

const normalizeChatConfig = (value: unknown): ChatSupportConfig => {
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

const loadChatConfig = (): ChatSupportConfig => {
  const saved = localStorage.getItem(CONFIG_STORAGE_KEY)
  if (!saved)
    return { ...DEFAULT_CHAT_CONFIG, shortcuts: createDefaultShortcuts() }
  try {
    return normalizeChatConfig(JSON.parse(saved))
  } catch (error) {
    console.error(error)
    return { ...DEFAULT_CHAT_CONFIG, shortcuts: createDefaultShortcuts() }
  }
}

// ---------------------------------------------------------------------------
// FAQ: AI無しでも機能するローカル知識ベース
// ---------------------------------------------------------------------------

interface FaqEntry {
  keywords: string[]
  title: string
  answer: string
}

const FAQ_DATABASE: FaqEntry[] = [
  {
    keywords: ['カラー', 'パレット', '色', 'color', 'primary', 'secondary'],
    title: 'カラーパレット',
    answer: `## カラーパレット

| トークン | 値 | 用途 |
|---|---|---|
| \`primary.main\` | \`#2642be\` | ボタン、リンク、主要アクション |
| \`primary.dark\` | \`#1a2c80\` | ホバー状態 |
| \`primary.light\` | \`#4d68d4\` | 背景のアクセント |
| \`secondary.main\` | \`#696881\` | 補助的な要素 |
| \`success.main\` | \`#46ab4a\` | 成功状態 |
| \`error.main\` | \`#da3737\` | エラー、削除 |
| \`warning.main\` | \`#eb8117\` | 警告 |
| \`info.main\` | \`#1dafc2\` | 情報 |

## やるべきこと
1. Figmaで色指定する際は **トークン名** を使用（例: \`primary.main\`）
2. \`#2642be\` のようなハードコードは禁止
3. Storybook → **Design Tokens > Colors** で全色を確認`,
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
| **Map** | Map3D, MapLibre, DIDMap |
| **Domain** | LayerControlPanel, RestrictionLegend, StatusIndicators, ZoneStatusChip |
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
    keywords: ['grid', 'グリッド', 'レイアウト', 'layout', 'レスポンシブ'],
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
| **Components** | UI / Form / Map / Domain |
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
| **間接化** | 直接値を使わず変数・トークン経由 | \`#2642be\`ではなく\`primary.main\` |
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
| **汎用とドメイン** | どこでも使える部品 vs 特定機能特化の部品 | Button(汎用) vs TaskStatusCard(ドメイン) |

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
| **ドメイン** | 特定のデータ・ビジネスロジックに依存 | ServiceCard, TaskStatusChip, ZoneStatusChip |

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

const findFaqAnswer = (query: string): string | null => {
  const q = query.toLowerCase()
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
  return best ? best.answer : null
}

const QUICK_SUGGESTIONS = [
  { label: '設計6原則', query: 'コンポーネント設計原則' },
  { label: 'UIステート5状態', query: 'UIステートスタック' },
  { label: 'カラーパレット', query: 'カラーパレット' },
  { label: 'レイアウト責任', query: 'レイアウト責任の分離' },
  { label: 'コンポーネント一覧', query: 'コンポーネント一覧' },
  { label: '命名規則', query: '命名規則' },
  { label: '変数の型', query: '変数の型とprops設計' },
  { label: 'スペーシング', query: 'スペーシング' },
]

const INITIAL_GREETING =
  'Kaze UX コンシェルジュです。トークン・コンポーネント・設計理論について質問できます。下のボタンか自由入力でどうぞ。'

// コピーボタン付きコードブロック
const CodeBlock = ({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) => {
  const [copied, setCopied] = useState(false)
  const codeText = String(children).replace(/\n$/, '')
  const isInline = !className

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(codeText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [codeText])

  if (isInline) {
    return <code className={className}>{children}</code>
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <IconButton
        size='small'
        onClick={handleCopy}
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          opacity: 0.6,
          color: 'text.secondary',
          '&:hover': { opacity: 1 },
        }}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </IconButton>
      <code className={className}>{children}</code>
    </Box>
  )
}

export const ChatSupport = ({ currentStory }: ChatSupportProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const [config, setConfig] = useState<ChatSupportConfig>(() =>
    loadChatConfig()
  )

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>(() => {
    const defaultMsg: Message[] = [
      {
        id: '1',
        text: INITIAL_GREETING,
        sender: 'bot',
        timestamp: new Date(),
      },
    ]
    const saved = localStorage.getItem(CHAT_STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const restored = parsed.map((m: Message & { timestamp: string }) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }))
        // 初回メッセージが古い挨拶文なら新しいものに差し替え
        if (
          restored[0]?.sender === 'bot' &&
          restored[0]?.text !== INITIAL_GREETING
        ) {
          restored[0] = { ...restored[0], text: INITIAL_GREETING }
        }
        return restored
      } catch (e) {
        console.error(e)
      }
    }
    return defaultMsg
  })

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const theme = useTheme()

  // 現在のページのガイド情報
  const storyGuide: StoryGuideEntry | null = useMemo(
    () => (currentStory ? findStoryGuide(currentStory.title) : null),
    [currentStory]
  )

  // ページコンテキスト付きシステムプロンプト
  const contextualPrompt = useMemo(() => {
    if (!currentStory) return SYSTEM_PROMPT
    const parts = [SYSTEM_PROMPT]
    parts.push(
      `\n\n## 現在のページ情報\nユーザーは現在「${currentStory.title}」の「${currentStory.name}」ストーリーを見ています。`
    )
    if (currentStory.description) {
      parts.push(`ページ説明: ${currentStory.description}`)
    }
    if (storyGuide) {
      parts.push(`概要: ${storyGuide.summary}`)
      parts.push(
        `実装コンテキスト:\n${storyGuide.codeContext.map((c) => `- ${c}`).join('\n')}`
      )
      if (storyGuide.references?.length) {
        parts.push(
          `参考リンク:\n${storyGuide.references.map((r) => `- ${r}`).join('\n')}`
        )
      }
      if (storyGuide.related?.length) {
        parts.push(`関連ページ: ${storyGuide.related.join(', ')}`)
      }
    }
    parts.push(
      'ユーザーが「この画面」「今見てるページ」等と言った場合、上記コンテキストを基に具体的に回答してください。参考リンクがあれば回答に含めてください。'
    )
    return parts.join('\n')
  }, [currentStory, storyGuide])

  const [widgetSize, setWidgetSize] = useState({ width: 400, height: 600 })

  const handleResizeStart = (direction: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const startW = widgetSize.width
    const startH = widgetSize.height

    const onMove = (ev: MouseEvent) => {
      const dx = startX - ev.clientX
      const dy = startY - ev.clientY
      setWidgetSize({
        width: direction.includes('left')
          ? Math.max(320, Math.min(800, startW + dx))
          : startW,
        height: direction.includes('top')
          ? Math.max(400, Math.min(900, startH + dy))
          : startH,
      })
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor =
      direction === 'top-left'
        ? 'nw-resize'
        : direction === 'top'
          ? 'n-resize'
          : 'ew-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const handleSidebarResize = (e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = config.sidebarWidth || 400

    const onMove = (ev: MouseEvent) => {
      const dx = startX - ev.clientX
      const newWidth = Math.max(320, Math.min(800, startW + dx))
      setConfig((prev) => ({
        ...prev,
        sidebarWidth: newWidth,
      }))
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config))
  }, [config])

  const clearChat = useCallback(() => {
    if (confirm('履歴を削除？'))
      setMessages([
        {
          id: '1',
          text: INITIAL_GREETING,
          sender: 'bot',
          timestamp: new Date(),
        },
      ])
  }, [])

  const callAI = async (
    messagesPayload: { role: string; content: string }[],
    isTest = false
  ) => {
    const isGemini = config.model.includes('gemini')
    const isNewGenOpenAI =
      config.model.includes('gpt-5') || config.model.includes('o1')

    let url = 'https://api.openai.com/v1/chat/completions'
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    }

    if (isGemini) {
      url =
        'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
      // OpenAI互換エンドポイントはBearer認証を使用
      headers.Authorization = `Bearer ${config.apiKey}`
    }

    const body: Record<string, unknown> = {
      model: config.model,
      messages: messagesPayload,
    }

    if (isNewGenOpenAI) {
      body.max_completion_tokens = isTest ? 50 : 2000
    } else {
      body.max_tokens = isTest ? 50 : 2000
      body.temperature = 0.7
    }

    // タイムアウト設定（60秒）
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      let data: Record<string, unknown>
      try {
        data = await response.json()
      } catch {
        throw new Error(
          `レスポンスの解析に失敗しました (HTTP ${response.status})`
        )
      }

      if (!response.ok) {
        const err = data.error as Record<string, unknown> | undefined
        const errorMsg =
          err?.message ||
          (data.message as string) ||
          `API Error: ${response.status}`
        throw new Error(String(errorMsg))
      }

      // レスポンス構造のデバッグ
      console.log('[Concierge] API response:', JSON.stringify(data, null, 2))

      const choices = data.choices as Record<string, unknown>[] | undefined
      if (!choices || !choices[0]) {
        throw new Error(
          `レスポンス形式が不正です: ${JSON.stringify(Object.keys(data))}`
        )
      }

      return data
    } finally {
      clearTimeout(timeoutId)
    }
  }

  // レスポンスからテキストを安全に抽出（OpenAI / Gemini両対応）
  const extractContent = (data: Record<string, unknown>): string => {
    try {
      // OpenAI標準: data.choices[0].message.content
      const choices = data.choices as Record<string, unknown>[] | undefined
      if (choices?.[0]) {
        const msg = choices[0].message as Record<string, unknown> | undefined
        if (msg?.content) return String(msg.content)
        // Gemini互換: choices[0].text
        if (choices[0].text) return String(choices[0].text)
      }
      // Gemini native: data.candidates[0].content.parts[0].text
      const candidates = data.candidates as
        | Record<string, unknown>[]
        | undefined
      if (candidates?.[0]) {
        const content = candidates[0].content as
          | Record<string, unknown>
          | undefined
        const parts = content?.parts as Record<string, unknown>[] | undefined
        if (parts?.[0]?.text) return String(parts[0].text)
      }
      console.error('[Concierge] content抽出失敗。レスポンス:', data)
      return `(レスポンス形式を解析できませんでした。DevToolsコンソールを確認してください)`
    } catch {
      return '(レスポンスの解析に失敗しました)'
    }
  }

  const handleTestConnection = async () => {
    if (!config.apiKey) {
      setTestResult({ success: false, message: 'APIキーを入力してください。' })
      return
    }
    setIsTesting(true)
    setTestResult(null)
    try {
      await callAI([{ role: 'user', content: 'Say OK' }], true)
      setTestResult({ success: true, message: '接続成功！AIと対話可能です。' })
    } catch (error: unknown) {
      setTestResult({
        success: false,
        message: `接続失敗: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsTesting(false)
    }
  }

  const addBotMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        text,
        sender: 'bot' as const,
        timestamp: new Date(),
      },
    ])
  }

  /** ページ文脈クエリ判定キーワード */
  const isPageContextQuery = (q: string): boolean => {
    const keywords = [
      'この画面',
      'このページ',
      '今見てる',
      '今見ている',
      '今のページ',
      '今の画面',
      '何のページ',
      '何を見て',
      'ここは何',
      'ここって何',
      'ここは',
      'what is this',
      'what page',
    ]
    return keywords.some((kw) => q.toLowerCase().includes(kw))
  }

  /** 現在のページに関するFAQ回答を生成 */
  const buildPageContextAnswer = (): string | null => {
    if (!currentStory || !storyGuide) return null
    const lines = [
      `**${currentStory.title}** > ${currentStory.name}`,
      '',
      storyGuide.summary,
      '',
      ...storyGuide.codeContext.map((c) => `- ${c}`),
    ]
    if (storyGuide.references?.length) {
      lines.push('', '**参考:**', ...storyGuide.references.map((r) => `- ${r}`))
    }
    if (storyGuide.related?.length) {
      lines.push('', `関連: ${storyGuide.related.join(' / ')}`)
    }
    return lines.join('\n')
  }

  /** FAQ回答から「やるべきこと」セクションを除去し端的にする */
  const trimFaqAnswer = (text: string): string => {
    return text.replace(/\n+## やるべきこと[\s\S]*$/, '').trimEnd()
  }

  const respondWithFaq = (query: string) => {
    // ページ文脈クエリを優先チェック
    if (isPageContextQuery(query)) {
      const pageAnswer = buildPageContextAnswer()
      if (pageAnswer) {
        addBotMessage(pageAnswer)
        return
      }
    }

    const answer = findFaqAnswer(query)
    if (answer) {
      addBotMessage(trimFaqAnswer(answer))
    } else {
      addBotMessage(
        '該当するFAQが見つかりませんでした。以下のトピックをお試しください:\n\n' +
          FAQ_DATABASE.map((f) => `- **${f.title}**`).join('\n') +
          '\n\nAI接続すると自由な質問に対応できます。設定からAPIキーを入力してください。'
      )
    }
  }

  const handleDownload = useCallback(() => {
    const lines = [
      '# Kaze UX Concierge - チャット履歴',
      `> ${new Date().toLocaleDateString('ja-JP')} エクスポート`,
      '',
    ]
    for (const msg of messages) {
      if (msg.sender === 'user') {
        lines.push(`## Q: ${msg.text}`, '')
      } else {
        lines.push(msg.text, '')
      }
      lines.push('---', '')
    }
    const blob = new Blob([lines.join('\n')], {
      type: 'text/markdown;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kaze-ux-concierge-${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [messages])

  const handleSend = async () => {
    if (!message.trim() || isTyping) return
    const userText = message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newUserMessage])
    setMessage('')

    // APIキーなし → FAQ検索
    if (!config.apiKey) {
      respondWithFaq(userText)
      return
    }

    // AI呼び出し
    setIsTyping(true)
    try {
      const payload = [
        { role: 'system', content: contextualPrompt },
        ...messages.map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
        { role: 'user', content: userText },
      ]
      const data = await callAI(payload)
      const aiText = extractContent(data)
      addBotMessage(aiText)
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.name === 'AbortError'
            ? 'タイムアウト: 応答に時間がかかりすぎています。'
            : error.message
          : String(error)
      // AI失敗時もFAQで応答を試みる
      const faqAnswer = findFaqAnswer(userText)
      if (faqAnswer) {
        addBotMessage(
          `*AI接続エラー: ${errMsg}*\n\n---\n\nFAQから回答します:\n\n${trimFaqAnswer(faqAnswer)}`
        )
      } else {
        addBotMessage(`エラー: ${errMsg}`)
      }
    } finally {
      setIsTyping(false)
    }
  }

  const submitShortcutLabel = formatShortcutLabel(config.shortcuts.sendMessage)

  const isShortcutMatch = useCallback(
    (
      event: Pick<
        KeyboardEvent,
        'key' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'
      >,
      shortcut: ShortcutBinding
    ) => {
      const normalizedKey = normalizeShortcutKey(event.key)
      const modPressed = isMac ? event.metaKey : event.ctrlKey
      return (
        normalizedKey === shortcut.key &&
        modPressed === shortcut.mod &&
        event.shiftKey === shortcut.shift &&
        event.altKey === shortcut.alt
      )
    },
    []
  )

  const handleShortcutInputKeyDown =
    (shortcutId: ShortcutActionId) =>
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Tab') return
      event.preventDefault()
      event.stopPropagation()

      const normalizedKey = normalizeShortcutKey(event.key)
      if (MODIFIER_ONLY_KEYS.has(normalizedKey)) return

      const nextShortcut: ShortcutBinding = {
        key: normalizedKey,
        mod: isMac ? event.metaKey : event.ctrlKey,
        shift: event.shiftKey,
        alt: event.altKey,
      }
      setConfig((prev) => ({
        ...prev,
        shortcuts: {
          ...prev.shortcuts,
          [shortcutId]: nextShortcut,
        },
      }))
    }

  const resetShortcuts = () => {
    setConfig((prev) => ({
      ...prev,
      shortcuts: createDefaultShortcuts(),
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // IME入力中（日本語変換中）は無視
    if (e.nativeEvent.isComposing) return

    // 設定されたショートカットで送信
    if (isShortcutMatch(e.nativeEvent, config.shortcuts.sendMessage)) {
      e.preventDefault()
      handleSend()
    }
    // Enterのみ → 改行（multiline TextFieldのデフォルト動作）
    // Shift+Enter → 改行（同上）
  }

  const toggleUiMode = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      uiMode: prev.uiMode === 'widget' ? 'sidebar' : 'widget',
    }))
  }, [])

  // グローバルキーボードショートカット
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // IME変換中は無視
      if (e.isComposing) return

      // チャット開閉
      if (isShortcutMatch(e, config.shortcuts.toggleChat)) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
        return
      }

      // 以下はチャットが開いている時のみ
      if (!isOpen) return

      // チャットを閉じる
      if (isShortcutMatch(e, config.shortcuts.closeChat)) {
        e.preventDefault()
        setIsOpen(false)
        return
      }

      // 入力欄にフォーカス
      if (isShortcutMatch(e, config.shortcuts.focusInput)) {
        e.preventDefault()
        inputRef.current?.focus()
        return
      }

      // 設定パネル切替
      if (isShortcutMatch(e, config.shortcuts.toggleSettings)) {
        e.preventDefault()
        setShowSettings((prev) => !prev)
        return
      }

      // ダウンロード
      if (isShortcutMatch(e, config.shortcuts.downloadHistory)) {
        e.preventDefault()
        handleDownload()
        return
      }

      // UI切替
      if (isShortcutMatch(e, config.shortcuts.toggleUiMode)) {
        e.preventDefault()
        toggleUiMode()
        return
      }

      // 履歴クリア
      if (isShortcutMatch(e, config.shortcuts.clearHistory)) {
        e.preventDefault()
        clearChat()
        return
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [
    config.shortcuts,
    isOpen,
    clearChat,
    handleDownload,
    isShortcutMatch,
    toggleUiMode,
  ])

  const hasUserMessages = messages.some((m) => m.sender === 'user')

  const handleSuggestionClick = (query: string) => {
    if (isTyping) return
    setMessage(query)
    // setMessageの後にhandleSendを呼ぶため、直接送信ロジックを実行
    const userMsg: Message = {
      id: Date.now().toString(),
      text: query,
      sender: 'user',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setMessage('')

    // APIキーなし → FAQ
    if (!config.apiKey) {
      respondWithFaq(query)
      return
    }

    // AI呼び出し
    setIsTyping(true)
    const payload = [
      { role: 'system', content: contextualPrompt },
      ...messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
      { role: 'user', content: query },
    ]

    callAI(payload)
      .then((data) => {
        addBotMessage(extractContent(data))
      })
      .catch((error: unknown) => {
        const errMsg =
          error instanceof Error
            ? error.name === 'AbortError'
              ? 'タイムアウト: 応答に時間がかかりすぎています。'
              : error.message
            : String(error)
        const faqAnswer = findFaqAnswer(query)
        if (faqAnswer) {
          addBotMessage(`*AI接続エラー*\n\n---\n\n${trimFaqAnswer(faqAnswer)}`)
        } else {
          addBotMessage(`エラー: ${errMsg}`)
        }
      })
      .finally(() => {
        setIsTyping(false)
      })
  }

  const ChatContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'transparent',
      }}>
      {/* ヘッダー */}
      <Box
        sx={{
          p: 2,
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'rgba(38,66,190,0.55)'
              : 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(12px)',
        }}>
        <Stack direction='row' spacing={1.5} alignItems='center'>
          {showSettings ? (
            <IconButton
              size='small'
              color='inherit'
              onClick={() => setShowSettings(false)}>
              <ChevronLeft size={20} />
            </IconButton>
          ) : (
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                width: 32,
                height: 32,
              }}>
              <Bot size={20} />
            </Avatar>
          )}
          <Box>
            <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
              {showSettings ? 'AI設定' : 'Kaze UX Concierge'}
            </Typography>
            {!showSettings && (
              <Typography
                variant='caption'
                sx={{ opacity: 0.8, display: 'block', lineHeight: 1 }}>
                {config.model}
              </Typography>
            )}
          </Box>
        </Stack>
        <Stack direction='row'>
          {!showSettings && (
            <>
              <IconButton
                size='small'
                color='inherit'
                onClick={toggleUiMode}
                title={
                  config.uiMode === 'widget'
                    ? 'サイドバーに切替'
                    : 'ウィジェットに切替'
                }>
                {config.uiMode === 'widget' ? (
                  <PanelRight size={18} />
                ) : (
                  <MessageSquare size={18} />
                )}
              </IconButton>
              <IconButton
                size='small'
                color='inherit'
                onClick={() => setShowSettings(true)}>
                <Settings size={18} />
              </IconButton>
              <IconButton
                size='small'
                color='inherit'
                onClick={handleDownload}
                title='Markdownでダウンロード'>
                <Download size={18} />
              </IconButton>
              <IconButton
                size='small'
                color='inherit'
                onClick={clearChat}
                title='履歴クリア'>
                <Trash2 size={18} />
              </IconButton>
            </>
          )}
          <IconButton
            size='small'
            color='inherit'
            onClick={() => setIsOpen(false)}>
            <X size={18} />
          </IconButton>
        </Stack>
      </Box>

      {/* 設定パネル or チャットエリア */}
      {showSettings ? (
        <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
          <Stack spacing={3}>
            <Box>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', mb: 0.8, fontWeight: 600 }}>
                プロバイダー APIキー
              </Typography>
              <TextField
                fullWidth
                size='small'
                type={showApiKey ? 'text' : 'password'}
                autoComplete='off'
                value={config.apiKey}
                onChange={(e) => {
                  setConfig({ ...config, apiKey: e.target.value })
                  setTestResult(null)
                }}
                placeholder={
                  config.model.includes('gemini') ? 'AIza...' : 'sk-proj-...'
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      {' '}
                      <IconButton
                        size='small'
                        onClick={() => setShowApiKey(!showApiKey)}>
                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </IconButton>{' '}
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', mb: 0.8, fontWeight: 600 }}>
                AIモデル
              </Typography>
              <TextField
                select
                fullWidth
                size='small'
                value={config.model}
                onChange={(e) => {
                  setConfig({ ...config, model: e.target.value })
                  setTestResult(null)
                }}>
                {DEFAULT_MODELS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Button
              fullWidth
              variant='outlined'
              size='medium'
              onClick={handleTestConnection}
              disabled={isTesting || !config.apiKey}
              sx={{ py: 1 }}
              startIcon={
                isTesting ? (
                  <CircularProgress size={16} color='inherit' />
                ) : (
                  <Sparkles size={16} />
                )
              }>
              {isTesting ? 'テスト中...' : 'API接続テスト'}
            </Button>
            {testResult && (
              <Alert
                severity={testResult.success ? 'success' : 'error'}
                icon={
                  testResult.success ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <AlertCircle size={18} />
                  )
                }>
                <Typography variant='caption'>{testResult.message}</Typography>
              </Alert>
            )}
            <Divider />
            <Typography variant='caption' color='text.secondary'>
              キーはブラウザにのみ保存されます。モデルを切り替えたらテストを推奨します。
            </Typography>
            <Box
              sx={{
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.03)',
                borderRadius: 1,
                p: 1.5,
              }}>
              <Typography
                variant='caption'
                sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                APIキーの取得方法
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                component='div'
                sx={{ lineHeight: 1.7 }}>
                <Box component='ul' sx={{ pl: 2, m: 0, '& li': { mb: 0.5 } }}>
                  <li>
                    <strong>OpenAI</strong>:{' '}
                    <Link
                      href='https://platform.openai.com/api-keys'
                      target='_blank'
                      rel='noopener noreferrer'
                      sx={{ fontSize: 'inherit' }}>
                      platform.openai.com
                    </Link>{' '}
                    でアカウント作成後、API Keysページでキーを発行（従量課金制）
                  </li>
                  <li>
                    <strong>Google Gemini</strong>:{' '}
                    <Link
                      href='https://aistudio.google.com/apikey'
                      target='_blank'
                      rel='noopener noreferrer'
                      sx={{ fontSize: 'inherit' }}>
                      aistudio.google.com
                    </Link>{' '}
                    でGoogleアカウントでログイン後、APIキーを発行（無料枠あり）
                  </li>
                </Box>
              </Typography>
            </Box>
            <Divider />
            <Box>
              <Stack
                direction='row'
                justifyContent='space-between'
                spacing={1}
                alignItems='center'
                sx={{ mb: 1 }}>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <Keyboard size={14} />
                  <Typography variant='caption' sx={{ fontWeight: 600 }}>
                    キーボードショートカット
                  </Typography>
                </Stack>
                <Button size='small' variant='text' onClick={resetShortcuts}>
                  既定値に戻す
                </Button>
              </Stack>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', mb: 1.2 }}>
                入力欄にフォーカスして希望のキーを押すと更新されます。
              </Typography>
              <Box
                component='table'
                sx={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  '& td': {
                    py: 0.6,
                    fontSize: 11,
                    verticalAlign: 'middle',
                  },
                  '& td:first-of-type': {
                    width: 160,
                    pr: 1,
                  },
                }}>
                <tbody>
                  {SHORTCUT_METADATA.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <TextField
                          size='small'
                          value={formatShortcutLabel(config.shortcuts[s.id])}
                          onKeyDown={handleShortcutInputKeyDown(s.id)}
                          InputProps={{
                            readOnly: true,
                            inputProps: {
                              'aria-label': `${s.desc} のショートカット`,
                              style: {
                                fontFamily: 'monospace',
                                fontSize: 10,
                                textAlign: 'center',
                                paddingTop: 4,
                                paddingBottom: 4,
                              },
                            },
                          }}
                        />
                      </td>
                      <td>
                        <Typography variant='caption' color='text.secondary'>
                          {s.desc}
                        </Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Box>
            </Box>
          </Stack>
        </Box>
      ) : (
        <>
          <Box
            ref={scrollRef}
            sx={{
              flexGrow: 1,
              px: 1.5,
              py: 1.5,
              overflowY: 'auto',
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(248,249,250,0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user'
              return (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                  }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: isUser ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      gap: 0.75,
                      maxWidth: '92%',
                    }}>
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        mt: 0.5,
                        flexShrink: 0,
                        bgcolor: isUser ? 'secondary.main' : 'primary.light',
                        fontSize: 12,
                      }}>
                      {isUser ? <User size={14} /> : <Bot size={14} />}
                    </Avatar>
                    <Box
                      sx={{
                        px: 2,
                        pt: '5px',
                        pb: '4px',
                        minWidth: 0,
                        overflow: 'hidden',
                        borderRadius: '12px',
                        borderTopLeftRadius: isUser ? '12px' : '2px',
                        borderTopRightRadius: isUser ? '2px' : '12px',
                        bgcolor: isUser
                          ? theme.palette.mode === 'dark'
                            ? 'rgba(38,66,190,0.45)'
                            : 'primary.main'
                          : theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.06)'
                            : 'background.paper',
                        color: isUser ? 'primary.contrastText' : 'text.primary',
                        boxShadow: 'none',
                      }}>
                      {isUser ? (
                        <Typography
                          variant='body2'
                          sx={{
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.7,
                            fontSize: 14,
                          }}>
                          {msg.text}
                        </Typography>
                      ) : (
                        <Box
                          sx={{
                            fontSize: 14,
                            lineHeight: 1.7,
                            wordBreak: 'break-word',
                            '& p': {
                              m: 0,
                              mb: 1,
                              '&:last-child': { mb: 0 },
                            },
                            '& h1, & h2, & h3, & h4, & h5, & h6': {
                              mt: 2,
                              mb: 1,
                              lineHeight: 1.5,
                              fontWeight: 600,
                            },
                            '& h1': { fontSize: 18 },
                            '& h2': { fontSize: 16 },
                            '& h3': { fontSize: 14 },
                            '& ul, & ol': { pl: 2.5, my: 1 },
                            '& li': { mb: 0.5 },
                            '& code': {
                              bgcolor:
                                theme.palette.mode === 'dark'
                                  ? 'rgba(255,255,255,0.07)'
                                  : 'rgba(0,0,0,0.06)',
                              px: 0.5,
                              py: 0.25,
                              border: 'none',
                              borderRadius: 0.5,
                              fontSize: 12,
                              fontFamily: '"Fira Code", "Consolas", monospace',
                            },
                            '& pre': {
                              bgcolor:
                                theme.palette.mode === 'dark'
                                  ? 'rgba(0,0,0,0.2)'
                                  : 'rgba(0,0,0,0.04)',
                              p: 1.5,
                              border: 'none',
                              borderRadius: 1,
                              overflowX: 'auto',
                              my: 1,
                              '& code': {
                                bgcolor: 'transparent',
                                border: 'none',
                                px: 0,
                                py: 0,
                              },
                            },
                            '& blockquote': {
                              borderLeft: '3px solid',
                              borderColor: 'divider',
                              pl: 1.5,
                              ml: 0,
                              my: 1,
                              opacity: 0.85,
                            },
                            '& a': {
                              color: 'primary.main',
                              textDecoration: 'underline',
                            },
                            '& table': {
                              borderCollapse: 'collapse',
                              my: 1,
                              width: '100%',
                              '& th, & td': {
                                border: '1px solid',
                                borderColor: 'divider',
                                px: 1,
                                py: 0.5,
                                fontSize: 12,
                              },
                              '& th': {
                                fontWeight: 600,
                                bgcolor:
                                  theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.04)'
                                    : 'rgba(0,0,0,0.03)',
                              },
                            },
                          }}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{ code: CodeBlock }}>
                            {msg.text}
                          </ReactMarkdown>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              )
            })}
            {!hasUserMessages && !isTyping && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.75,
                  mt: 0.5,
                  ml: 4.5,
                }}>
                {storyGuide && (
                  <Chip
                    label='この画面は？'
                    size='small'
                    variant='outlined'
                    onClick={() =>
                      handleSuggestionClick('この画面は何ですか？')
                    }
                    sx={{
                      cursor: 'pointer',
                      fontSize: 12,
                      borderColor: 'success.main',
                      color: 'success.main',
                      '&:hover': {
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(76,175,80,0.08)'
                            : 'rgba(76,175,80,0.06)',
                        borderColor: 'success.main',
                      },
                    }}
                  />
                )}
                {QUICK_SUGGESTIONS.map((s) => (
                  <Chip
                    key={s.label}
                    label={s.label}
                    size='small'
                    variant='outlined'
                    onClick={() => handleSuggestionClick(s.query)}
                    sx={{
                      cursor: 'pointer',
                      fontSize: 12,
                      borderColor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.12)'
                          : 'rgba(38,66,190,0.3)',
                      color:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.6)'
                          : 'primary.main',
                      '&:hover': {
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(38,66,190,0.06)',
                        borderColor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.25)'
                            : 'primary.main',
                      },
                    }}
                  />
                ))}
              </Box>
            )}
            {isTyping && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  ml: 1,
                }}>
                <CircularProgress size={14} />
                <Typography variant='caption' color='text.secondary'>
                  AI回答中...
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              pt: '16px',
              pr: '4px',
              pb: '10px',
              pl: '16px',
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(30,30,30,0.6)'
                  : 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(12px)',
              borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.palette.divider}`,
            }}>
            <Stack direction='row' spacing={1} alignItems='stretch'>
              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={8}
                inputRef={inputRef}
                placeholder={
                  config.apiKey
                    ? `質問を入力... (${submitShortcutLabel}で送信)`
                    : `FAQモード: 質問を入力... (${submitShortcutLabel}で送信)`
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
              <IconButton
                color='primary'
                disabled={!message.trim() || isTyping}
                onClick={handleSend}
                sx={{
                  alignSelf: 'stretch',
                  width: 44,
                  borderRadius: 1.5,
                  bgcolor: message.trim() ? 'primary.main' : 'transparent',
                  color: message.trim() ? 'primary.contrastText' : 'inherit',
                  '&:hover': {
                    bgcolor: message.trim() ? 'primary.dark' : 'action.hover',
                  },
                }}>
                <Send size={18} />
              </IconButton>
            </Stack>
          </Box>
        </>
      )}
    </Box>
  )

  return (
    <>
      {/* サイドバーモード（オーバーレイなし） */}
      <Slide
        direction='left'
        in={isOpen && config.uiMode === 'sidebar'}
        mountOnEnter
        unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: { xs: '100%', sm: config.sidebarWidth || 400 },
            zIndex: 1200,
            display: 'flex',
            borderLeft: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.palette.divider}`,
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(28,28,32,0.95)'
                : 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)',
          }}>
          <Box
            onMouseDown={handleSidebarResize}
            sx={{
              width: 6,
              flexShrink: 0,
              cursor: 'ew-resize',
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
              '&:hover': {
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.06)',
              },
            }}
          />
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
            }}>
            {ChatContent}
          </Box>
        </Paper>
      </Slide>

      {/* FABボタン + ウィジェットモード */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}>
        <Zoom in={!isOpen}>
          <Fab
            onClick={() => setIsOpen(true)}
            sx={{
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(38,66,190,0.5)'
                  : 'rgba(38,66,190,0.85)',
              color: '#fff',
              backdropFilter: 'blur(16px)',
              boxShadow:
                theme.palette.mode === 'dark'
                  ? '0 8px 32px rgba(0,0,0,0.4)'
                  : '0 8px 32px rgba(38,66,190,0.3)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.18)'}`,
              '&:hover': {
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(38,66,190,0.65)'
                    : 'rgba(38,66,190,0.95)',
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 8px 32px rgba(0,0,0,0.5)'
                    : '0 8px 32px rgba(38,66,190,0.45)',
              },
            }}>
            <BookConciergeIcon size={24} />
          </Fab>
        </Zoom>
        {config.uiMode === 'widget' && (
          <Zoom in={isOpen}>
            <Paper
              elevation={12}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: { xs: 'calc(100vw - 48px)', sm: widgetSize.width },
                height: widgetSize.height,
                minWidth: 320,
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: 2,
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(28,28,32,0.92)'
                    : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
              }}>
              {/* リサイズハンドル: 上辺 */}
              <Box
                onMouseDown={handleResizeStart('top')}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 16,
                  right: 16,
                  height: 6,
                  cursor: 'n-resize',
                  zIndex: 10,
                }}
              />
              {/* リサイズハンドル: 左辺 */}
              <Box
                onMouseDown={handleResizeStart('left')}
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 16,
                  bottom: 0,
                  width: 6,
                  cursor: 'ew-resize',
                  zIndex: 10,
                }}
              />
              {/* リサイズハンドル: 左上角 */}
              <Box
                onMouseDown={handleResizeStart('top-left')}
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: 16,
                  height: 16,
                  cursor: 'nw-resize',
                  zIndex: 11,
                }}
              />
              {/* リサイズインジケーター（上部中央のバー） */}
              <Box
                onMouseDown={handleResizeStart('top')}
                sx={{
                  position: 'absolute',
                  top: 4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 32,
                  height: 4,
                  borderRadius: 1,
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.12)',
                  cursor: 'n-resize',
                  zIndex: 12,
                  opacity: 0.5,
                  transition: 'opacity 0.2s',
                  '&:hover': { opacity: 1 },
                }}
              />
              {ChatContent}
            </Paper>
          </Zoom>
        )}
      </Box>
    </>
  )
}
