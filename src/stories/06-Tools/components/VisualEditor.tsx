// Visual Editor メインコンテナ

import { Box, Stack, Typography, useTheme } from '@mui/material'
import { useState, useCallback } from 'react'

import { ComponentPalette } from './ComponentPalette'
import { generateLayout } from './editorAiService'
import { LivePreview } from './LivePreview'
import { PromptInput } from './PromptInput'

import type { EditorLayout } from './editorTypes'

export const VisualEditor = () => {
  const [layout, setLayout] = useState<EditorLayout | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const theme = useTheme()

  const handleGenerate = useCallback(async (prompt: string) => {
    setIsGenerating(true)
    setError(null)
    try {
      const result = await generateLayout(prompt)
      setLayout(result)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'レイアウト生成に失敗しました'
      setError(message)
    } finally {
      setIsGenerating(false)
    }
  }, [])

  // パレットからコンポーネント名を入力欄に追加（将来用）
  const handlePaletteSelect = useCallback((_name: string) => {
    // プロトタイプではクリック時のフィードバックのみ
  }, [])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: 'background.default',
      }}>
      {/* ヘッダー */}
      <Stack
        direction='row'
        alignItems='center'
        spacing={1}
        sx={{
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'rgba(14,173,184,0.08)'
              : 'rgba(14,173,184,0.04)',
        }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
          Visual Editor
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          kaze-ux コンポーネントで画面を組み立てる
        </Typography>
      </Stack>

      {/* メイン: パレット + プレビュー */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ComponentPalette onSelect={handlePaletteSelect} />
        <LivePreview
          layout={layout}
          error={error}
          isGenerating={isGenerating}
        />
      </Box>

      {/* 下部: プロンプト入力 */}
      <PromptInput onGenerate={handleGenerate} isGenerating={isGenerating} />
    </Box>
  )
}
