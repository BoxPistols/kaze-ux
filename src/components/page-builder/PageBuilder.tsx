/**
 * Page Builder メインコンポーネント
 * 3ペイン構成: パレット | キャンバス | プロパティ
 */

import { Box, Divider, IconButton, Tooltip, Typography } from '@mui/material'
import { Undo2, Redo2, Trash2, Code2, Copy } from 'lucide-react'
import { useState, useCallback } from 'react'

import { ComponentPalette } from './ComponentPalette'
import { useCanvasState } from './hooks/useCanvasState'
import { PageBuilderCanvas } from './PageBuilderCanvas'
import { PropertyEditor } from './PropertyEditor'
import { getComponentMeta } from './registry'
import { generateComponentFile } from './serializer'

import type { CanvasNode } from './types'

export const PageBuilder = () => {
  const { state, dispatch, undo, redo, canUndo, canRedo, findNode } =
    useCanvasState()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCode, setShowCode] = useState(false)

  const selectedNode = selectedId ? findNode(selectedId) : null

  // コンポーネント追加
  const handleAddComponent = useCallback(
    (componentId: string) => {
      const meta = getComponentMeta(componentId)
      if (!meta) return

      const newNode: CanvasNode = {
        id: crypto.randomUUID(),
        componentId,
        props: { ...meta.defaultProps },
        children: [],
        layout: {},
      }

      // 選択中のノードが children を受け付ける場合は子として追加
      const parentId =
        selectedNode &&
        getComponentMeta(selectedNode.componentId)?.acceptsChildren
          ? selectedId
          : null

      dispatch({ type: 'ADD_NODE', parentId, node: newNode })
      setSelectedId(newNode.id)
    },
    [dispatch, selectedId, selectedNode]
  )

  // プロパティ更新
  const handleUpdateProps = useCallback(
    (nodeId: string, props: Record<string, unknown>) => {
      dispatch({ type: 'UPDATE_PROPS', nodeId, props })
    },
    [dispatch]
  )

  // ノード削除
  const handleRemoveNode = useCallback(
    (nodeId: string) => {
      dispatch({ type: 'REMOVE_NODE', nodeId })
      if (selectedId === nodeId) setSelectedId(null)
    },
    [dispatch, selectedId]
  )

  // コード生成
  const generatedCode = generateComponentFile(state.name, state.rootNodes)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ツールバー */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mr: 2 }}>
          Page Builder
        </Typography>

        <Tooltip title='Undo'>
          <span>
            <IconButton size='small' onClick={undo} disabled={!canUndo}>
              <Undo2 size={16} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title='Redo'>
          <span>
            <IconButton size='small' onClick={redo} disabled={!canRedo}>
              <Redo2 size={16} />
            </IconButton>
          </span>
        </Tooltip>

        <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

        <Tooltip title='Clear All'>
          <IconButton
            size='small'
            onClick={() => {
              dispatch({ type: 'CLEAR' })
              setSelectedId(null)
            }}>
            <Trash2 size={16} />
          </IconButton>
        </Tooltip>

        <Box sx={{ flex: 1 }} />

        <Tooltip title={showCode ? 'Canvas' : 'Code'}>
          <IconButton size='small' onClick={() => setShowCode(!showCode)}>
            <Code2 size={16} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 3ペイン */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左: パレット */}
        <Box
          sx={{
            width: 180,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            flexShrink: 0,
          }}>
          <ComponentPalette onAddComponent={handleAddComponent} />
        </Box>

        {/* 中央: キャンバス or コード */}
        {showCode ? (
          <Box sx={{ flex: 1, overflow: 'auto', position: 'relative' }}>
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
              }}>
              <Tooltip title='Copy'>
                <IconButton
                  size='small'
                  onClick={() => navigator.clipboard.writeText(generatedCode)}>
                  <Copy size={14} />
                </IconButton>
              </Tooltip>
            </Box>
            <Box
              component='pre'
              sx={{
                m: 0,
                p: 2,
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                lineHeight: 1.6,
                overflow: 'auto',
                height: '100%',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? '#1e1e22' : '#f8f9fa',
              }}>
              {generatedCode}
            </Box>
          </Box>
        ) : (
          <PageBuilderCanvas
            nodes={state.rootNodes}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        )}

        {/* 右: プロパティ */}
        <Box
          sx={{
            width: 220,
            borderLeft: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            flexShrink: 0,
          }}>
          <PropertyEditor
            selectedNode={selectedNode}
            onUpdateProps={handleUpdateProps}
            onRemoveNode={handleRemoveNode}
          />
        </Box>
      </Box>
    </Box>
  )
}
