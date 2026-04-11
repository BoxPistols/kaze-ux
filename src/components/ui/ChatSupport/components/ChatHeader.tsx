// チャットヘッダーコンポーネント
// - タイトル行（戻るボタン or アバター + タイトル/ページ名）
// - ツールバー（UI切替 / 設定 / ダウンロード / クリア / 閉じる）
// - モデル名表示

import { Avatar, Box, IconButton, Stack, Typography, useTheme } from '@mui/material'
import {
  X, Bot, ChevronLeft, PanelRight, MessageSquare,
  Settings, Download, Trash2,
} from 'lucide-react'

import { DEFAULT_API_KEY, DEFAULT_MODEL } from '../chatSupportConstants'

import type { ChatSupportConfig, CurrentStoryContext } from '../chatSupportTypes'

interface ChatHeaderProps {
  showSettings: boolean
  currentStory: CurrentStoryContext | null | undefined
  config: ChatSupportConfig
  onBack: () => void
  onToggleUiMode: () => void
  onToggleSettings: () => void
  onDownload: () => void
  onClearChat: () => void
  onClose: () => void
}

export const ChatHeader = ({
  showSettings,
  currentStory,
  config,
  onBack,
  onToggleUiMode,
  onToggleSettings,
  onDownload,
  onClearChat,
  onClose,
}: ChatHeaderProps) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        bgcolor:
          theme.palette.mode === 'dark'
            ? 'rgba(14,173,184,0.55)'
            : 'primary.main',
        color: '#ffffff',
        backdropFilter: 'blur(12px)',
      }}>
      {/* タイトル行 */}
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
        <Stack direction='row' spacing={1.5} alignItems='center'>
          {showSettings ? (
            <IconButton size='small' color='inherit' onClick={onBack}>
              <ChevronLeft size={20} />
            </IconButton>
          ) : (
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
              <Bot size={20} />
            </Avatar>
          )}
          <Box>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {showSettings
                ? 'AI設定'
                : currentStory
                  ? currentStory.name
                  : 'Concierge'}
            </Typography>
            {!showSettings && currentStory && (
              <Typography
                variant='caption'
                sx={{ opacity: 0.8, display: 'block', lineHeight: 1.4 }}>
                {currentStory.title}
              </Typography>
            )}
          </Box>
        </Stack>
      </Stack>

      {/* ツールバー + モデル名 */}
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        sx={{ px: 1.5, pb: 1, pt: 0.5 }}>
        <Stack direction='row' alignItems='center'>
          {!showSettings && (
            <>
              <IconButton
                size='small'
                color='inherit'
                onClick={onToggleUiMode}
                title={config.uiMode === 'widget' ? 'サイドバーに切替' : 'ウィジェットに切替'}>
                {config.uiMode === 'widget' ? (
                  <PanelRight size={18} />
                ) : (
                  <MessageSquare size={18} />
                )}
              </IconButton>
              <IconButton size='small' color='inherit' onClick={onToggleSettings}>
                <Settings size={18} />
              </IconButton>
              <IconButton
                size='small'
                color='inherit'
                onClick={onDownload}
                title='Markdownでダウンロード'>
                <Download size={18} />
              </IconButton>
              <IconButton size='small' color='inherit' onClick={onClearChat} title='履歴クリア'>
                <Trash2 size={18} />
              </IconButton>
            </>
          )}
          <IconButton size='small' color='inherit' onClick={onClose}>
            <X size={18} />
          </IconButton>
        </Stack>
        {!showSettings && (
          <Typography sx={{ opacity: 0.6, fontSize: 12, whiteSpace: 'nowrap' }}>
            {!config.apiKey && !DEFAULT_API_KEY
              ? 'FAQモード'
              : config.model || DEFAULT_MODEL}
          </Typography>
        )}
      </Stack>
    </Box>
  )
}
