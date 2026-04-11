// ChatSupport — Storybook AI コンシェルジュ
// ロジックは hooks/ に、UI は components/ に分割済み。
// このファイルはレイアウト構成のみを担当する (~170行)。

import { Box, Fab, Paper, Slide, Zoom, useTheme } from '@mui/material'
import { useCallback } from 'react'

import BookConciergeIcon from './BookConciergeIcon'
import { ChatHeader } from './components/ChatHeader'
import { ChatInput } from './components/ChatInput'
import { ChatMessageList } from './components/ChatMessageList'
import { ChatPageContextChip } from './components/ChatPageContextChip'
import { ChatSettings } from './components/ChatSettings'
import { useChatConfig } from './hooks/useChatConfig'
import { useChatMessage } from './hooks/useChatMessage'
import { useChatShortcuts } from './hooks/useChatShortcuts'
import { useChatState } from './hooks/useChatState'
import { useWidgetResize, useSidebarResize } from './useResize'
import { ConfirmDialog } from '../dialog/confirmDialog'

import type { CurrentStoryContext, ChatSupportProps } from './chatSupportTypes'

// 後方互換のための re-export
export type { CurrentStoryContext }

export const ChatSupport = ({ currentStory }: ChatSupportProps) => {
  const theme = useTheme()

  // --- 状態 hooks ---
  const {
    isOpen, setIsOpen,
    message, setMessage,
    messages, setMessages,
    scrollRef, inputRef,
    confirmClearOpen, setConfirmClearOpen,
    clearChat, executeClearChat,
  } = useChatState()

  const {
    config, setConfig,
    apiKeyDraft, setApiKeyDraft,
    isUsingDefaultKey,
    showSettings, setShowSettings,
    showApiKey, setShowApiKey,
    testResult, setTestResult,
    isTesting,
    confirmResetOpen, setConfirmResetOpen,
    submitShortcutLabel,
    handleTestConnection,
    handleShortcutInputKeyDown,
    resetShortcuts,
    toggleUiMode,
    DEFAULT_API_KEY,
    DEFAULT_MODEL,
  } = useChatConfig()

  const {
    isTyping,
    storyGuide,
    addBotMessage,
    buildPageContextAnswer,
    handleDownload,
    handleSend,
    handleSuggestionClick,
    hasUserMessages,
  } = useChatMessage({ currentStory, messages, setMessages, config })

  // handleSend のクロージャ（message / setMessage を束縛）
  const onSend = useCallback(
    () => handleSend(message, () => setMessage('')),
    [handleSend, message, setMessage]
  )

  const { handleKeyDown } = useChatShortcuts({
    config, isOpen, setIsOpen, setShowSettings,
    clearChat, handleDownload, toggleUiMode, inputRef,
  })

  const { widgetSize, handleResizeStart } = useWidgetResize()
  const { handleSidebarResize } = useSidebarResize(
    config.sidebarWidth,
    useCallback(
      (width: number) => setConfig((prev) => ({ ...prev, sidebarWidth: width })),
      [setConfig]
    )
  )

  // --- チャット本体 JSX ---
  const ChatContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'transparent' }}>
      <ChatHeader
        showSettings={showSettings}
        currentStory={currentStory}
        config={config}
        onBack={() => setShowSettings(false)}
        onToggleUiMode={toggleUiMode}
        onToggleSettings={() => setShowSettings(true)}
        onDownload={handleDownload}
        onClearChat={clearChat}
        onClose={() => setIsOpen(false)}
      />

      {!showSettings && (
        <ChatPageContextChip
          storyGuide={storyGuide}
          currentStory={currentStory}
          onExplain={() => {
            const answer = buildPageContextAnswer()
            if (answer) addBotMessage(answer)
          }}
        />
      )}

      {showSettings ? (
        <ChatSettings
          config={config}
          setConfig={setConfig}
          apiKeyDraft={apiKeyDraft}
          setApiKeyDraft={setApiKeyDraft}
          isUsingDefaultKey={isUsingDefaultKey}
          showApiKey={showApiKey}
          setShowApiKey={setShowApiKey}
          testResult={testResult}
          setTestResult={setTestResult}
          isTesting={isTesting}
          onTestConnection={handleTestConnection}
          onResetShortcuts={resetShortcuts}
          onShortcutInputKeyDown={handleShortcutInputKeyDown}
          onResetApiKey={() => setConfirmResetOpen(true)}
        />
      ) : (
        <>
          <ChatMessageList
            messages={messages}
            isTyping={isTyping}
            scrollRef={scrollRef}
            storyGuide={storyGuide}
            currentStory={currentStory}
            hasUserMessages={hasUserMessages}
            onSuggestionClick={handleSuggestionClick}
          />
          <ChatInput
            message={message}
            isTyping={isTyping}
            submitShortcutLabel={submitShortcutLabel}
            hasApiKey={!!config.apiKey}
            inputRef={inputRef}
            onMessageChange={setMessage}
            onKeyDown={(e) => handleKeyDown(e, onSend)}
            onSend={onSend}
          />
        </>
      )}
    </Box>
  )

  return (
    <>
      {/* サイドバーモード */}
      <Slide direction='left' in={isOpen && config.uiMode === 'sidebar'} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed', top: 0, right: 0, bottom: 0,
            width: { xs: '100%', sm: config.sidebarWidth || 400 },
            zIndex: 1200, display: 'flex',
            borderLeft: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.palette.divider}`,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(28,28,32,0.95)' : 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)',
          }}>
          <Box
            onMouseDown={handleSidebarResize}
            sx={{
              width: 6, flexShrink: 0, cursor: 'ew-resize',
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center', justifyContent: 'center',
              transition: 'background-color 0.2s',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              },
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {ChatContent}
          </Box>
        </Paper>
      </Slide>

      {/* FAB + ウィジェットモード */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}>
        <Zoom in={!isOpen}>
          <Fab
            onClick={() => setIsOpen(true)}
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(14,173,184,0.5)' : 'rgba(14,173,184,0.85)',
              color: '#fff', backdropFilter: 'blur(16px)',
              boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(14,173,184,0.3)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.18)'}`,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(14,173,184,0.65)' : 'rgba(14,173,184,0.95)',
                boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(14,173,184,0.45)',
              },
            }}>
            <BookConciergeIcon size={24} />
          </Fab>
        </Zoom>
        {config.uiMode === 'widget' && (
          <Zoom in={isOpen}>
            <Paper
              elevation={12}
              sx={{
                position: 'absolute', bottom: 0, right: 0,
                width: { xs: 'calc(100vw - 48px)', sm: widgetSize.width },
                height: widgetSize.height,
                minWidth: 320, minHeight: 400,
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden', borderRadius: 2,
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(28,28,32,0.92)' : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
              }}>
              {/* リサイズハンドル: 上辺 */}
              <Box onMouseDown={handleResizeStart('top')} sx={{ position: 'absolute', top: 0, left: 16, right: 16, height: 6, cursor: 'n-resize', zIndex: 10 }} />
              {/* リサイズハンドル: 左辺 */}
              <Box onMouseDown={handleResizeStart('left')} sx={{ position: 'absolute', left: 0, top: 16, bottom: 0, width: 6, cursor: 'ew-resize', zIndex: 10 }} />
              {/* リサイズハンドル: 左上角 */}
              <Box onMouseDown={handleResizeStart('top-left')} sx={{ position: 'absolute', left: 0, top: 0, width: 16, height: 16, cursor: 'nw-resize', zIndex: 11 }} />
              {/* リサイズインジケーター */}
              <Box
                onMouseDown={handleResizeStart('top')}
                sx={{
                  position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)',
                  width: 32, height: 4, borderRadius: 1, cursor: 'n-resize', zIndex: 12,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
                  opacity: 0.5, transition: 'opacity 0.2s', '&:hover': { opacity: 1 },
                }}
              />
              {ChatContent}
            </Paper>
          </Zoom>
        )}
      </Box>

      {/* 確認ダイアログ */}
      <ConfirmDialog
        open={confirmResetOpen}
        title='APIキーのリセット'
        message={`APIキーをリセットしてデフォルト(${DEFAULT_MODEL})に戻しますか?`}
        confirmText='リセット'
        confirmColor='warning'
        onConfirm={() => {
          setApiKeyDraft('')
          setConfig((prev) => ({ ...prev, apiKey: DEFAULT_API_KEY, model: DEFAULT_MODEL }))
          setTestResult(null)
          setShowApiKey(false)
          setConfirmResetOpen(false)
        }}
        onCancel={() => setConfirmResetOpen(false)}
        disableEnforceFocus
      />
      <ConfirmDialog
        open={confirmClearOpen}
        title='履歴の削除'
        message='チャット履歴を削除しますか？'
        confirmText='削除'
        confirmColor='error'
        onConfirm={executeClearChat}
        onCancel={() => setConfirmClearOpen(false)}
        disableEnforceFocus
      />
    </>
  )
}
