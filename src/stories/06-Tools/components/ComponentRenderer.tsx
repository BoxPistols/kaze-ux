// 再帰レンダラー: JSONノード → React要素

import { Box, Typography } from '@mui/material'
import { createElement } from 'react'

import { COMPONENT_REGISTRY } from './componentRegistry'

import type { ComponentNode } from './editorTypes'

const MAX_DEPTH = 10

// 未知コンポーネント用のエラー表示
const UnknownComponent = ({ name }: { name: string }) => (
  <Box
    sx={{
      border: '2px dashed',
      borderColor: 'error.main',
      borderRadius: 1,
      p: 1,
      my: 0.5,
    }}>
    <Typography variant='caption' color='error'>
      Unknown: {name}
    </Typography>
  </Box>
)

// 単一ノードをReact要素に変換
const renderNode = (
  node: ComponentNode,
  depth: number,
  index: number
): React.ReactNode => {
  if (depth > MAX_DEPTH) return null

  const Component = COMPONENT_REGISTRY[node.component]
  if (!Component) {
    return <UnknownComponent key={index} name={node.component} />
  }

  // props組み立て
  const props: Record<string, unknown> = {
    ...node.props,
    key: index,
  }
  if (node.sx) props.sx = node.sx
  if (node.className) props.className = node.className

  // children
  let children: React.ReactNode = undefined
  if (typeof node.children === 'string') {
    children = node.children
  } else if (Array.isArray(node.children)) {
    children = node.children.map((child, i) => renderNode(child, depth + 1, i))
  }

  return createElement(Component, props, children)
}

// レイアウト全体をレンダリング
export const ComponentRenderer = ({ nodes }: { nodes: ComponentNode[] }) => (
  <>{nodes.map((node, i) => renderNode(node, 0, i))}</>
)
