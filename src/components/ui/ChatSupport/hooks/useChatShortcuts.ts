// グローバルキーボードショートカット hook
// - グローバルハンドラ: document.addEventListener('keydown', ...)
// - handleKeyDown: TextField レベルのショートカット（送信キー）

import { useEffect } from 'react'

import { isShortcutMatch } from '../chatSupportConstants'

import type { ChatSupportConfig } from '../chatSupportTypes'

interface UseChatShortcutsProps {
  config: ChatSupportConfig
  isOpen: boolean
  setIsOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>
  clearChat: () => void
  handleDownload: () => void
  toggleUiMode: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
}

export const useChatShortcuts = ({
  config,
  isOpen,
  setIsOpen,
  setShowSettings,
  clearChat,
  handleDownload,
  toggleUiMode,
  inputRef,
}: UseChatShortcutsProps) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.isComposing) return

      const tag = (e.target as HTMLElement)?.tagName
      const isInputFocused =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        (e.target as HTMLElement)?.isContentEditable

      // チャット開閉（入力欄フォーカス中でも動作）
      if (isShortcutMatch(e, config.shortcuts.toggleChat)) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
        return
      }

      if (!isOpen) return
      if (isInputFocused) return

      if (isShortcutMatch(e, config.shortcuts.closeChat)) {
        setIsOpen(false)
        return
      }
      if (isShortcutMatch(e, config.shortcuts.focusInput)) {
        e.preventDefault()
        inputRef.current?.focus()
        return
      }
      if (isShortcutMatch(e, config.shortcuts.toggleSettings)) {
        e.preventDefault()
        setShowSettings((prev) => !prev)
        return
      }
      if (isShortcutMatch(e, config.shortcuts.downloadHistory)) {
        e.preventDefault()
        handleDownload()
        return
      }
      if (isShortcutMatch(e, config.shortcuts.toggleUiMode)) {
        e.preventDefault()
        toggleUiMode()
        return
      }
      if (isShortcutMatch(e, config.shortcuts.clearHistory)) {
        e.preventDefault()
        clearChat()
        return
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [
    config.shortcuts,
    isOpen,
    setIsOpen,
    setShowSettings,
    clearChat,
    handleDownload,
    toggleUiMode,
    inputRef,
  ])

  // TextField レベルのキーダウン（送信ショートカット）
  const handleKeyDown = (e: React.KeyboardEvent, handleSendFn: () => void) => {
    if (e.nativeEvent.isComposing) return
    if (isShortcutMatch(e.nativeEvent, config.shortcuts.sendMessage)) {
      e.preventDefault()
      handleSendFn()
    }
  }

  return { handleKeyDown }
}
