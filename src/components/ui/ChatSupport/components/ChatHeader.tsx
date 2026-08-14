// チャットヘッダーコンポーネント
// - タイトル行（戻るボタン or アバター + タイトル/ページ名）
// - ツールバー（UI切替 / 設定 / ダウンロード / クリア / 閉じる）
// - モデル名表示

import {
  alpha,
  Avatar,
  Box,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import {
  X,
  Bot,
  ChevronLeft,
  PanelRight,
  MessageSquare,
  Settings,
  Download,
  Trash2,
} from 'lucide-react'

import { isBackendMode } from '../chatAiService'
import { DEFAULT_API_KEY, DEFAULT_MODEL } from '../chatSupportConstants'

import type {
  ChatSupportConfig,
  CurrentStoryContext,
} from '../chatSupportTypes'

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
            ? alpha(theme.palette.primary.main, 0.55)
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
            <IconButton
              size='small'
              color='inherit'
              onClick={onBack}
              title='チャットに戻る'
              aria-label='チャットに戻る'>
              <ChevronLeft size={20} />
            </IconButton>
          ) : (
            <Avatar
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
              <Bot size={20} />
            </Avatar>
          )}
          <Box>
            <Typography
              variant='subtitle2'
              sx={{ fontWeight: 700, lineHeight: 1.2 }}>
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

        {/* 閉じるはヘッダー右上に固定する。
            ツールバーに混ぜると「パネルを終了する」操作が他のツール操作と
            同列に見えるうえ、設定画面では兄弟が消えて左端に取り残される */}
        <IconButton
          size='small'
          color='inherit'
          onClick={onClose}
          title='閉じる'
          aria-label='閉じる'>
          <X size={18} />
        </IconButton>
      </Stack>

      {/* ツールバー + モデル名。
          設定画面では中身が全て消えるため、行ごと出さない
          （空の行が残ると、そのぶんヘッダーが間延びする） */}
      {!showSettings && (
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          sx={{ px: 1.5, pb: 1, pt: 0.5 }}>
          <Stack direction='row' alignItems='center'>
            <IconButton
              size='small'
              color='inherit'
              onClick={onToggleUiMode}
              title={
                config.uiMode === 'widget'
                  ? 'サイドバーに切替'
                  : 'ウィジェットに切替'
              }
              aria-label={
                config.uiMode === 'widget'
                  ? 'サイドバーに切替'
                  : 'ウィジェットに切替'
              }>
              {config.uiMode === 'widget' ? (
                <PanelRight size={18} />
              ) : (
                <MessageSquare size={18} />
              )}
            </IconButton>
            <IconButton
              size='small'
              color='inherit'
              onClick={onToggleSettings}
              title='AI設定'
              aria-label='AI設定'>
              <Settings size={18} />
            </IconButton>
            <IconButton
              size='small'
              color='inherit'
              onClick={onDownload}
              title='Markdownでダウンロード'
              aria-label='Markdownでダウンロード'>
              <Download size={18} />
            </IconButton>
            <IconButton
              size='small'
              color='inherit'
              onClick={onClearChat}
              title='履歴クリア'
              aria-label='履歴クリア'>
              <Trash2 size={18} />
            </IconButton>
          </Stack>
          <Typography sx={{ opacity: 0.6, fontSize: 12, whiteSpace: 'nowrap' }}>
            {!config.apiKey && !DEFAULT_API_KEY && !isBackendMode()
              ? 'FAQモード'
              : config.model || DEFAULT_MODEL}
          </Typography>
        </Stack>
      )}
    </Box>
  )
}
