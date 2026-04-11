// チャット入力エリア（TextField + 送信ボタン）

import { Box, IconButton, Stack, TextField, useTheme } from '@mui/material'
import { Send } from 'lucide-react'

interface ChatInputProps {
  message: string
  isTyping: boolean
  submitShortcutLabel: string
  hasApiKey: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
  onMessageChange: (v: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onSend: () => void
}

export const ChatInput = ({
  message,
  isTyping,
  submitShortcutLabel,
  hasApiKey,
  inputRef,
  onMessageChange,
  onKeyDown,
  onSend,
}: ChatInputProps) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        pt: '16px', pr: '4px', pb: '10px', pl: '16px',
        bgcolor:
          theme.palette.mode === 'dark'
            ? 'rgba(30,30,30,0.6)'
            : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.06)'
            : theme.palette.divider
        }`,
      }}>
      <Stack direction='row' spacing={1} alignItems='stretch'>
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={8}
          inputRef={inputRef}
          placeholder={
            hasApiKey
              ? `質問を入力... (${submitShortcutLabel}で送信)`
              : `FAQモード: 質問を入力... (${submitShortcutLabel}で送信)`
          }
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isTyping}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
        />
        <IconButton
          color='primary'
          disabled={!message.trim() || isTyping}
          onClick={onSend}
          sx={{
            alignSelf: 'stretch',
            width: 44,
            borderRadius: 1.5,
            bgcolor: message.trim() ? 'primary.main' : 'transparent',
            color: message.trim() ? 'primary.contrastText' : 'inherit',
            '&:hover': {
              bgcolor: message.trim() ? 'primary.dark' : 'action.hover',
            },
          }}>
          <Send size={18} />
        </IconButton>
      </Stack>
    </Box>
  )
}
