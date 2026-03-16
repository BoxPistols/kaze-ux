/**
 * キャンバス（中央パネル）
 * ノードツリーを再帰的にレンダリング。クリックで選択
 */

import { Box, Typography } from '@mui/material'

import { getComponentMeta } from './registry'

import type { CanvasNode } from './types'

interface CanvasNodeRendererProps {
  node: CanvasNode
  selectedId: string | null
  onSelect: (id: string) => void
  depth?: number
}

const CanvasNodeRenderer = ({
  node,
  selectedId,
  onSelect,
  depth = 0,
}: CanvasNodeRendererProps) => {
  const meta = getComponentMeta(node.componentId)
  if (!meta) return null

  const isSelected = selectedId === node.id
  const Component = meta.component

  // children プロパティを渡す（テキスト系コンポーネント用）
  const childrenText =
    typeof node.props.children === 'string' ? node.props.children : undefined

  return (
    <Box
      onClick={(e) => {
        e.stopPropagation()
        onSelect(node.id)
      }}
      sx={{
        position: 'relative',
        border: '1px dashed',
        borderColor: isSelected ? 'primary.main' : 'transparent',
        borderRadius: 1,
        transition: 'all 0.15s',
        cursor: 'pointer',
        minHeight: 32,
        '&:hover': {
          borderColor: isSelected ? 'primary.main' : 'action.disabled',
        },
      }}>
      {/* ラベル */}
      <Box
        sx={{
          position: 'absolute',
          top: -10,
          left: 4,
          px: 0.5,
          bgcolor: isSelected ? 'primary.main' : 'background.paper',
          color: isSelected ? '#fff' : 'text.secondary',
          fontSize: '0.6rem',
          fontWeight: 600,
          borderRadius: 0.5,
          zIndex: 1,
          lineHeight: 1.4,
          opacity: isSelected ? 1 : 0,
          transition: 'opacity 0.15s',
          '.MuiBox-root:hover > &': { opacity: 1 },
        }}>
        {meta.name}
      </Box>

      {/* コンポーネント本体 */}
      {node.children.length > 0 ? (
        <Component {...node.props}>
          {node.children.map((child) => (
            <CanvasNodeRenderer
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </Component>
      ) : childrenText ? (
        <Component {...node.props}>{childrenText}</Component>
      ) : (
        <Component {...node.props} />
      )}
    </Box>
  )
}

interface PageBuilderCanvasProps {
  nodes: CanvasNode[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export const PageBuilderCanvas = ({
  nodes,
  selectedId,
  onSelect,
}: PageBuilderCanvasProps) => {
  return (
    <Box
      onClick={() => onSelect(null)}
      sx={{
        flex: 1,
        p: 3,
        overflow: 'auto',
        bgcolor: 'background.default',
        minHeight: '100%',
      }}>
      {nodes.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 300,
            border: '2px dashed',
            borderColor: 'action.disabled',
            borderRadius: 2,
            color: 'text.secondary',
          }}>
          <Typography sx={{ fontSize: '0.9rem', mb: 1 }}>
            コンポーネントを追加してください
          </Typography>
          <Typography sx={{ fontSize: '0.75rem' }}>
            左パネルからクリックで追加
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {nodes.map((node) => (
            <CanvasNodeRenderer
              key={node.id}
              node={node}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}
