// 中央パネル: ライブプレビュー

import { Alert, Box, Typography } from '@mui/material'

import { ComponentRenderer } from './ComponentRenderer'

import type { EditorLayout } from './editorTypes'

interface LivePreviewProps {
  layout: EditorLayout | null
  error: string | null
  isGenerating: boolean
}

export const LivePreview = ({
  layout,
  error,
  isGenerating,
}: LivePreviewProps) => (
  <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
    {/* エラー表示 */}
    {error && (
      <Alert severity='error' sx={{ mb: 2 }}>
        {error}
      </Alert>
    )}

    {/* 生成中 */}
    {isGenerating && (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}>
        <Typography color='text.secondary' sx={{ fontSize: 14 }}>
          コンポーネントを生成中...
        </Typography>
      </Box>
    )}

    {/* 空状態 */}
    {!layout && !isGenerating && !error && (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 1,
          opacity: 0.5,
        }}>
        <Typography sx={{ fontSize: 32 }}>⬡</Typography>
        <Typography color='text.secondary' sx={{ fontSize: 13 }}>
          プリセットを選択するか、プロンプトを入力してUIを生成
        </Typography>
      </Box>
    )}

    {/* レンダリング結果 */}
    {layout && !isGenerating && <ComponentRenderer nodes={layout.layout} />}
  </Box>
)
