/**
 * Page Builder 型定義
 */

// キャンバス上の1要素
export interface CanvasNode {
  id: string
  componentId: string
  props: Record<string, unknown>
  children: CanvasNode[]
  layout: LayoutConfig
}

export interface LayoutConfig {
  gridSize?: { xs?: number; sm?: number; md?: number; lg?: number }
  spacing?: number
  direction?: 'row' | 'column'
  justifyContent?: string
  alignItems?: string
  padding?: number
}

// ページ全体の状態
export interface PageState {
  id: string
  name: string
  rootNodes: CanvasNode[]
  updatedAt: string
}

// コンポーネントカテゴリ
export type ComponentCategory =
  | 'layout'
  | 'text'
  | 'action'
  | 'input'
  | 'display'
  | 'feedback'

// プロパティスキーマ
export interface PropSchema {
  name: string
  type: 'string' | 'number' | 'boolean' | 'select'
  label: string
  defaultValue: unknown
  options?: string[]
}

// コンポーネントレジストリエントリ
export interface BuilderComponentMeta {
  id: string
  name: string
  category: ComponentCategory
  icon: string
  description: string
  component: React.ComponentType<Record<string, unknown>>
  defaultProps: Record<string, unknown>
  propSchema: PropSchema[]
  acceptsChildren: boolean
  importPath: string
  importName: string
}

// キャンバスアクション
export type CanvasAction =
  | { type: 'ADD_NODE'; parentId: string | null; node: CanvasNode }
  | { type: 'REMOVE_NODE'; nodeId: string }
  | { type: 'UPDATE_PROPS'; nodeId: string; props: Record<string, unknown> }
  | { type: 'UPDATE_LAYOUT'; nodeId: string; layout: Partial<LayoutConfig> }
  | {
      type: 'MOVE_NODE'
      nodeId: string
      newParentId: string | null
      index: number
    }
  | { type: 'SET_STATE'; state: PageState }
  | { type: 'CLEAR' }
