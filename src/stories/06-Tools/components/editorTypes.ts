// Visual Editor 型定義

export interface ComponentNode {
  /** レジストリのキー名（例: "Card", "Typography"） */
  component: string
  /** コンポーネントに渡すprops */
  props?: Record<string, unknown>
  /** 子要素（コンポーネント配列 or テキスト） */
  children?: ComponentNode[] | string
  /** MUI sx prop */
  sx?: Record<string, unknown>
  /** Tailwind CSSクラス */
  className?: string
}

export interface EditorLayout {
  layout: ComponentNode[]
}

export interface EditorHistoryEntry {
  prompt: string
  layout: EditorLayout
  timestamp: Date
}
