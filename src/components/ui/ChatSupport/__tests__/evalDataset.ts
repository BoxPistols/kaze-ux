// 評価用質問-回答データセット

import type { Persona } from '../chatSupportConstants'

// ---------------------------------------------------------------------------
// 評価ケース型定義
// ---------------------------------------------------------------------------

export interface EvalCase {
  /** 質問テキスト */
  query: string
  /** 期待ペルソナ */
  persona: Persona
  /** 質問カテゴリ */
  category: string
  /** 回答に含まれるべきキーワード */
  expectedKeywords: string[]
  /** 回答に含まれてはいけないキーワード */
  prohibitedKeywords?: string[]
  /** 回答特性 */
  traits?: {
    /** コード例が含まれるべきか */
    hasCode?: boolean
    /** URLが含まれるべきか */
    hasUrl?: boolean
    /** 目標最大文字数 */
    maxLength?: number
  }
}

// ---------------------------------------------------------------------------
// デザイナー向け評価ケース
// ---------------------------------------------------------------------------

const DESIGNER_CASES: EvalCase[] = [
  {
    query: '余白はどれくらいにすればいい?',
    persona: 'designer',
    category: 'spacing',
    expectedKeywords: ['8px', 'スペーシング', 'spacing', '16px'],
    traits: { maxLength: 1000 },
  },
  {
    query: 'カードの角丸はいくつ?',
    persona: 'designer',
    category: 'component',
    expectedKeywords: ['12px', 'borderRadius', 'Card'],
    traits: { maxLength: 800 },
  },
  {
    query: 'Figma連携どうやる?',
    persona: 'designer',
    category: 'workflow',
    expectedKeywords: ['Figma', 'html.to.design', 'トークン'],
  },
  {
    query: 'エラー状態のデザインどうする?',
    persona: 'designer',
    category: 'state',
    expectedKeywords: ['Error', 'ステート', '5状態'],
  },
  {
    query: '色の指定方法は?',
    persona: 'designer',
    category: 'color',
    expectedKeywords: ['primary.main', 'トークン', 'カラー'],
  },
  {
    query: 'ボタンのデザインルール',
    persona: 'designer',
    category: 'component',
    expectedKeywords: ['Button', 'contained', 'outlined'],
  },
  {
    query: 'フォントサイズの基準',
    persona: 'designer',
    category: 'typography',
    expectedKeywords: ['14px', 'Inter', 'Noto Sans JP'],
  },
  {
    query: 'コンポーネントの一覧が見たい',
    persona: 'designer',
    category: 'component',
    expectedKeywords: ['Button', 'Card', 'Storybook'],
  },
  {
    query: 'ダークモード対応どうなってる?',
    persona: 'designer',
    category: 'theme',
    expectedKeywords: ['ダーク', 'WCAG', 'トークン'],
  },
  {
    query: 'アイコンはどこから持ってくる?',
    persona: 'designer',
    category: 'asset',
    expectedKeywords: ['lucide-react', 'currentColor'],
  },
  {
    query: 'マテリアルデザインって何?',
    persona: 'designer',
    category: 'foundation',
    expectedKeywords: ['Material', 'Google', 'MUI'],
  },
  {
    query: 'UIの5状態って?',
    persona: 'designer',
    category: 'state',
    expectedKeywords: ['Empty', 'Loading', 'Error', 'Partial', 'Ideal'],
  },
  {
    query: '設計6原則を教えて',
    persona: 'designer',
    category: 'principle',
    expectedKeywords: ['間接化', 'カプセル化', '制約'],
  },
  {
    query: 'Storybookの構成は?',
    persona: 'designer',
    category: 'storybook',
    expectedKeywords: ['Guide', 'Design Tokens', 'Components'],
  },
  {
    query: '新しいコンポーネントを提案したい',
    persona: 'designer',
    category: 'workflow',
    expectedKeywords: ['提案', '既存', 'Storybook'],
  },
]

// ---------------------------------------------------------------------------
// エンジニア向け評価ケース
// ---------------------------------------------------------------------------

const ENGINEER_CASES: EvalCase[] = [
  {
    query: 'Grid APIの使い方を教えて',
    persona: 'engineer',
    category: 'layout',
    expectedKeywords: ['size', 'container', 'spacing'],
    traits: { hasCode: true },
  },
  {
    query: 'sx propとTailwindの使い分け',
    persona: 'engineer',
    category: 'styling',
    expectedKeywords: ['sx', 'Tailwind', 'className'],
    traits: { hasCode: true },
  },
  {
    query: 'テストの書き方',
    persona: 'engineer',
    category: 'testing',
    expectedKeywords: ['vitest', 'describe', 'expect'],
    traits: { hasCode: true },
  },
  {
    query: 'TypeScript型定義のルール',
    persona: 'engineer',
    category: 'typescript',
    expectedKeywords: ['interface', 'strict', 'any'],
    traits: { hasCode: true },
  },
  {
    query: 'React.FCなぜ禁止?',
    persona: 'engineer',
    category: 'react',
    expectedKeywords: ['React.FC', '禁止'],
    traits: { hasCode: true },
  },
  {
    query: 'pnpmのコマンド一覧',
    persona: 'engineer',
    category: 'tooling',
    expectedKeywords: ['pnpm', 'lint', 'test'],
  },
  {
    query: 'コンポーネントの作成手順',
    persona: 'engineer',
    category: 'workflow',
    expectedKeywords: ['stories', 'Props', 'interface'],
    traits: { hasCode: true },
  },
  {
    query: 'ブレークポイントの値は?',
    persona: 'engineer',
    category: 'layout',
    expectedKeywords: ['xs', 'sm', 'md', 'lg'],
  },
  {
    query: 'カラートークンの定義場所',
    persona: 'engineer',
    category: 'theme',
    expectedKeywords: ['colorToken.ts', 'src/themes'],
  },
  {
    query: 'アニメーションのトークン',
    persona: 'engineer',
    category: 'motion',
    expectedKeywords: ['transition', 'duration'],
  },
]

// ---------------------------------------------------------------------------
// 汎用（ペルソナ不問）評価ケース
// ---------------------------------------------------------------------------

const GENERAL_CASES: EvalCase[] = [
  {
    query: '命名規則を教えて',
    persona: 'unknown',
    category: 'convention',
    expectedKeywords: ['PascalCase', 'camelCase'],
  },
  {
    query: 'スペーシングの基準',
    persona: 'unknown',
    category: 'spacing',
    expectedKeywords: ['8px', 'spacing'],
  },
  {
    query: '経路依存性ってなに',
    persona: 'unknown',
    category: 'theory',
    expectedKeywords: ['経路依存', '初期', '制約'],
  },
  {
    query: 'コンポーネント分割の基準',
    persona: 'unknown',
    category: 'architecture',
    expectedKeywords: ['分割', '再利用', '300行'],
  },
  {
    query: '一貫性の重要性',
    persona: 'unknown',
    category: 'principle',
    expectedKeywords: ['一貫性', 'ブランド', '再利用'],
  },
]

// ---------------------------------------------------------------------------
// 全データセット
// ---------------------------------------------------------------------------

export const EVAL_DATASET: EvalCase[] = [
  ...DESIGNER_CASES,
  ...ENGINEER_CASES,
  ...GENERAL_CASES,
]

// ギャップ分析用: デザイナーとエンジニアが実際に聞く質問パターン
export const GAP_ANALYSIS_QUERIES = [
  // デザイナー
  '余白どれくらい',
  'カードの角丸',
  'Figma連携',
  'エラーデザイン',
  'ボタンの大きさ',
  'タッチターゲットのサイズ',
  '影のレベル',
  'フォントウェイト',
  '行間の基準',
  'カラーのコントラスト',
  'アイコンの色変更',
  'ホバー時のスタイル',
  'disabled状態',
  'ローディング表示',
  'プレースホルダーのデザイン',
  'セレクトボックス',
  'フォームの余白',
  'モーダルのサイズ',
  'トースト通知',
  'バッジの表示',
  'ツールチップ',
  'アコーディオン',
  'テーブルのスタイル',
  '区切り線',
  '省略テキスト',
  // エンジニア
  'Grid使い方',
  'sx vs Tailwind',
  'テスト書き方',
  '型定義ルール',
  'React.FC使える?',
  'useState使い方',
  'useCallback',
  'コンポーネントの型',
  'Props設計',
  'pnpm lint',
  'Storybook起動',
  'import文',
  'MUI Typography',
  'MUI Stack',
  'MUI Box',
  'theme.spacing',
  'breakpoint値',
  'dark mode実装',
  'custom hook',
  'テーマカスタム',
  'cn() ユーティリティ',
  'Vitest設定',
  'カバレッジ',
  'ESLint設定',
  'any型回避',
]
