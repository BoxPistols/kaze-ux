// 再帰レンダラー: JSONノード → React要素
//
// ここは AI の出力をそのまま描画する場所なので、想定外の形が来ることを
// 前提にする。壊れ方が「パネルが白紙になって理由が出ない」になると、
// 何を直せばいいのかが利用者にも作った側にも分からない。

import { Box, Typography } from '@mui/material'
import { Component, createElement } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

import { COMPONENT_REGISTRY } from './componentRegistry'

import type { ComponentNode } from './editorTypes'

const MAX_DEPTH = 10

/**
 * そのまま渡すと DOM やレンダリングの制御を奪える props。
 *
 * COMPONENT_REGISTRY で部品はホワイトリスト制御しているのに、props は
 * 無検査で spread していた。`dangerouslySetInnerHTML` と `ref` は MUI の
 * root DOM まで素通りする
 */
const UNSAFE_PROPS = new Set(['dangerouslySetInnerHTML', 'ref'])

// 描画できないノード用の表示（未知の部品 / 形が違うノード）
const Notice = ({ label, detail }: { label: string; detail: string }) => (
  <Box
    sx={{
      border: '2px dashed',
      borderColor: 'error.main',
      borderRadius: 1,
      p: 1,
      my: 0.5,
    }}>
    <Typography variant='caption' color='error'>
      {label}: {detail}
    </Typography>
  </Box>
)

/** レンダラーが扱える形か。`component` が文字列であることが最低条件 */
const isComponentNode = (value: unknown): value is ComponentNode =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { component?: unknown }).component === 'string'

// 単一ノードをReact要素に変換
const renderNode = (node: unknown, depth: number, index: number): ReactNode => {
  if (depth > MAX_DEPTH) return null

  // `generateLayout` は `Array.isArray(parsed.layout)` しか見ないので、
  // `[null]` や children の中の null がそのままここへ来る。形を確かめずに
  // `node.component` を読むと描画中に TypeError になり、パネルが白紙になる
  if (!isComponentNode(node)) {
    return (
      <Notice
        key={index}
        label='Invalid node'
        detail={JSON.stringify(node) ?? String(node)}
      />
    )
  }

  const Component_ = COMPONENT_REGISTRY[node.component]
  if (!Component_) {
    return <Notice key={index} label='Unknown' detail={node.component} />
  }

  // props組み立て（危険なものは落とす。key は spread の後に付ける）
  const props: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(node.props ?? {})) {
    if (!UNSAFE_PROPS.has(k)) props[k] = v
  }
  props.key = index
  if (node.sx) props.sx = node.sx
  if (node.className) props.className = node.className

  // children
  let children: ReactNode = undefined
  if (typeof node.children === 'string') {
    children = node.children
  } else if (Array.isArray(node.children)) {
    children = node.children.map((child, i) => renderNode(child, depth + 1, i))
  }

  // 第 3 引数を常に渡すと、props に入れた children が undefined で潰れる。
  // children が無いときは渡さない
  return children === undefined
    ? createElement(Component_, props)
    : createElement(Component_, props, children)
}

/**
 * プレビューが落ちても、何が来たのかを画面に残す。
 *
 * React の error boundary は現状クラスでしか書けない（フックの API が
 * 無い）。このリポジトリの他の部品は関数で書くが、ここだけは例外。
 * 境界が無いと、描画中の例外でパネルごと白紙になり理由も出ない。
 */
class PreviewErrorBoundary extends Component<
  { children: ReactNode },
  { message: string | null }
> {
  state: { message: string | null } = { message: null }

  static getDerivedStateFromError(error: unknown) {
    return { message: error instanceof Error ? error.message : String(error) }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('[VisualEditor] プレビューの描画に失敗:', error, info)
  }

  render() {
    if (this.state.message !== null) {
      return <Notice label='Render failed' detail={this.state.message} />
    }
    return this.props.children
  }
}

// レイアウト全体をレンダリング
export const ComponentRenderer = ({ nodes }: { nodes: ComponentNode[] }) => (
  <PreviewErrorBoundary>
    {Array.isArray(nodes) ? (
      nodes.map((node, i) => renderNode(node, 0, i))
    ) : (
      <Notice label='Invalid layout' detail={String(nodes)} />
    )}
  </PreviewErrorBoundary>
)
