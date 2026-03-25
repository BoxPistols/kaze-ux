// 下パネル: プロンプト入力 + プリセット

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { Box, Chip, Stack, TextField, useTheme } from '@mui/material'
import { useState, useCallback } from 'react'

import { Button } from '../../../components/ui/Button'

// プリセットテンプレート
const PRESETS = [
  {
    label: 'KPI Dashboard',
    prompt:
      'KPIカード4枚を2x2グリッドで。売上・ユーザー数・注文数・コンバージョン率。各カードにタイトル・数値・前月比を表示',
  },
  {
    label: 'Registration Form',
    prompt:
      'ユーザー登録フォーム。名前・メールアドレス・パスワード・都道府県選択・利用規約チェック・登録ボタン。Cardでラップ',
  },
  {
    label: 'Activity Feed',
    prompt:
      'アクティビティフィード。5件のリストアイテムにアバター・ユーザー名・アクション内容・時刻を表示。StatusTagでステータス表示',
  },
  {
    label: 'Settings Page',
    prompt:
      '設定画面。通知設定（メール通知・プッシュ通知のスイッチ）、表示設定（言語セレクト・テーマ切替）をCardでグループ化',
  },
] as const

interface PromptInputProps {
  onGenerate: (prompt: string) => void
  isGenerating: boolean
}

export const PromptInput = ({ onGenerate, isGenerating }: PromptInputProps) => {
  const [input, setInput] = useState('')
  const theme = useTheme()

  const handleSubmit = useCallback(() => {
    const text = input.trim()
    if (!text || isGenerating) return
    onGenerate(text)
  }, [input, isGenerating, onGenerate])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.nativeEvent.isComposing) return
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const handlePreset = useCallback(
    (prompt: string) => {
      setInput(prompt)
      onGenerate(prompt)
    },
    [onGenerate]
  )

  return (
    <Box
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        p: 2,
        bgcolor:
          theme.palette.mode === 'dark'
            ? 'rgba(0,0,0,0.2)'
            : 'rgba(0,0,0,0.02)',
      }}>
      {/* プリセット */}
      <Stack
        direction='row'
        spacing={0.5}
        sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
        {PRESETS.map((p) => (
          <Chip
            key={p.label}
            label={p.label}
            size='small'
            icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
            onClick={() => handlePreset(p.prompt)}
            disabled={isGenerating}
            sx={{ fontSize: 12 }}
          />
        ))}
      </Stack>

      {/* 入力欄 */}
      <Stack direction='row' spacing={1} alignItems='flex-end'>
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='作りたいUIを日本語で説明...'
          size='small'
          multiline
          maxRows={3}
          fullWidth
          disabled={isGenerating}
          slotProps={{
            input: { sx: { fontSize: 14 } },
          }}
        />
        <Button
          variant='default'
          size='sm'
          onClick={handleSubmit}
          disabled={!input.trim() || isGenerating}>
          {isGenerating ? '生成中...' : '生成'}
        </Button>
      </Stack>
    </Box>
  )
}
