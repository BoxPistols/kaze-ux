// 設定状態管理 hook
// - config: API キー/モデル/UI モード/ショートカット → localStorage 永続化
// - 設定パネル UI 状態 (showSettings, showApiKey, testResult 等)
// - handleTestConnection / handleShortcutInputKeyDown / resetShortcuts / toggleUiMode

import { useState, useEffect, useCallback } from 'react'

import { callAI } from '../chatAiService'
import {
  CONFIG_STORAGE_KEY,
  DEFAULT_API_KEY,
  DEFAULT_MODEL,
  MODIFIER_ONLY_KEYS,
  createDefaultShortcuts,
  formatShortcutLabel,
  isMac,
  loadChatConfig,
  normalizeShortcutKey,
} from '../chatSupportConstants'

import type {
  ChatSupportConfig,
  ShortcutActionId,
  ShortcutBinding,
} from '../chatSupportTypes'

export const useChatConfig = () => {
  const [config, setConfig] = useState<ChatSupportConfig>(() => loadChatConfig())

  const [confirmResetOpen, setConfirmResetOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  // APIキー入力欄のローカル state（paste 問題の回避）
  const [apiKeyDraft, setApiKeyDraft] = useState(() => {
    const c = loadChatConfig()
    return !c.apiKey || c.apiKey === DEFAULT_API_KEY ? '' : c.apiKey
  })

  const isUsingDefaultKey = !config.apiKey || config.apiKey === DEFAULT_API_KEY

  const submitShortcutLabel = formatShortcutLabel(config.shortcuts.sendMessage)

  // config 変化時: localStorage 保存
  useEffect(() => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config))
  }, [config])

  const handleTestConnection = async () => {
    if (!config.apiKey) {
      setTestResult({ success: false, message: 'APIキーを入力してください。' })
      return
    }
    setIsTesting(true)
    setTestResult(null)
    try {
      await callAI(config, [{ role: 'user', content: 'Say OK' }], true)
      setTestResult({ success: true, message: '接続成功！AIと対話可能です。' })
    } catch (error: unknown) {
      setTestResult({
        success: false,
        message: `接続失敗: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleShortcutInputKeyDown =
    (shortcutId: ShortcutActionId) =>
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Tab') return
      event.preventDefault()
      event.stopPropagation()

      const normalizedKey = normalizeShortcutKey(event.key)
      if (MODIFIER_ONLY_KEYS.has(normalizedKey)) return

      const nextShortcut: ShortcutBinding = {
        key: normalizedKey,
        mod: isMac ? event.metaKey : event.ctrlKey,
        shift: event.shiftKey,
        alt: event.altKey,
      }
      setConfig((prev) => ({
        ...prev,
        shortcuts: {
          ...prev.shortcuts,
          [shortcutId]: nextShortcut,
        },
      }))
    }

  const resetShortcuts = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      shortcuts: createDefaultShortcuts(),
    }))
  }, [])

  const toggleUiMode = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      uiMode: prev.uiMode === 'widget' ? 'sidebar' : 'widget',
    }))
  }, [])

  return {
    config,
    setConfig,
    apiKeyDraft,
    setApiKeyDraft,
    isUsingDefaultKey,
    showSettings,
    setShowSettings,
    showApiKey,
    setShowApiKey,
    testResult,
    setTestResult,
    isTesting,
    confirmResetOpen,
    setConfirmResetOpen,
    submitShortcutLabel,
    handleTestConnection,
    handleShortcutInputKeyDown,
    resetShortcuts,
    toggleUiMode,
    DEFAULT_API_KEY,
    DEFAULT_MODEL,
  }
}
