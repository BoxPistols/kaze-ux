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

export const SYSTEM_PROMPT = `あなたは Kaze UX デザインシステム コンシェルジュ。回答は必ず以下のルールに従うこと:

## 回答ルール
1. 冗長にしない。要点を3-5行で端的に伝える
2. 「〜できます」ではなく「〜してください」で行動を促す
3. コード例は最小限、コピペ可能な形で
4. MUI公式ドキュメントのURLを関連する回答に含める（例: https://mui.com/material-ui/react-button/ ）
5. URLの直後には必ず半角スペースを入れること。日本語テキストとURLが結合するとリンクが壊れるため厳守
6. 「やるべきこと」セクションは付けない。次のアクションが必要なら1行で端的に添える

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
UTM: LayerControlPanel, RestrictionLegend, StatusIndicators, ZoneStatusChip
Table: CustomTable

### MUI v7ルール
Grid: size={{ xs: 12, sm: 6 }} (旧item禁止) | React.FC完全禁止 | any型禁止
Button: 角丸6px,最小幅80px | Card: elevation=0,角丸12px | Input: size=small
コンテナ幅: 1280px(標準), 960px(フォーム), 1600px(ダッシュボード), 100%(マップ)

### Storybook構成
Guide(使い方) > DesignPhilosophy(理念) > DesignTokens(色/字/余白) > Layout(グリッド) > Components(UI/Form/Map/UTM) > Patterns(複合UI)`

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
  sendMessage: { key: 'Enter', mod: true, shift: false, alt: false },
  focusInput: { key: '/', mod: true, shift: false, alt: false },
  toggleChat: { key: 'k', mod: true, shift: true, alt: false },
  toggleSettings: { key: 's', mod: true, shift: true, alt: false },
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
    features: [
      'GPT-5系の推論能力',
      '高速レスポンス',
      'nano価格帯で高品質',
    ],
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
  model: import.meta.env.VITE_OPENAI_MODEL || DEFAULT_MODEL,
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
    return normalizeChatConfig(JSON.parse(saved))
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
