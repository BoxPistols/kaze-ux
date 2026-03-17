import {
  Avatar,
  Box,
  Fab,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Zoom,
  useTheme,
  CircularProgress,
  MenuItem,
  InputAdornment,
  Divider,
  Button,
  Alert,
  Slide,
  Link,
  Chip,
} from '@mui/material'
import {
  X,
  Send,
  User,
  Bot,
  Trash2,
  Sparkles,
  Settings,
  Eye,
  EyeOff,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  PanelRight,
  MessageSquare,
  Download,
  Keyboard,
  Info,
  Lock,
} from 'lucide-react'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import BookConciergeIcon from './BookConciergeIcon'
import { callAI, extractContent } from './chatAiService'
import {
  SYSTEM_PROMPT,
  isMac,
  SHORTCUT_METADATA,
  createDefaultShortcuts,
  normalizeShortcutKey,
  formatShortcutLabel,
  MODIFIER_ONLY_KEYS,
  CHAT_STORAGE_KEY,
  CONFIG_STORAGE_KEY,
  DEFAULT_API_KEY,
  DEFAULT_MODEL,
  OPENAI_MODELS,
  GEMINI_MODELS,
  loadChatConfig,
  isShortcutMatch,
} from './chatSupportConstants'
import CodeBlock, { CodeBlockPre } from './CodeBlock'
import {
  FAQ_DATABASE,
  findFaqAnswer,
  QUICK_SUGGESTIONS,
  INITIAL_GREETING,
} from './faqDatabase'
import { findStoryGuide } from './storyGuideMap'
import { useWidgetResize, useSidebarResize } from './useResize'

import type {
  Message,
  CurrentStoryContext,
  ChatSupportProps,
  ChatSupportConfig,
  ShortcutActionId,
  ShortcutBinding,
} from './chatSupportTypes'
import type { StoryGuideEntry } from './storyGuideMap'

// 後方互換のためのre-export
export type { Message, CurrentStoryContext }

export const ChatSupport = ({ currentStory }: ChatSupportProps) => {
  const [isOpen, setIsOpenRaw] = useState(() => {
    try {
      return sessionStorage.getItem('chat_support_open') === '1'
    } catch {
      return false
    }
  })
  const setIsOpen = useCallback((v: boolean | ((prev: boolean) => boolean)) => {
    setIsOpenRaw((prev) => {
      const next = typeof v === 'function' ? v(prev) : v
      try {
        sessionStorage.setItem('chat_support_open', next ? '1' : '0')
      } catch {
        // sessionStorage が無効な環境では無視
      }
      return next
    })
  }, [])
  const [isTyping, setIsTyping] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const [config, setConfig] = useState<ChatSupportConfig>(() =>
    loadChatConfig()
  )

  // APIキー入力欄のローカルstate（paste問題の回避）
  const [apiKeyDraft, setApiKeyDraft] = useState(() => {
    const c = loadChatConfig()
    return !c.apiKey || c.apiKey === DEFAULT_API_KEY ? '' : c.apiKey
  })

  // デフォルトAPIキー使用中かどうかの判定
  const isUsingDefaultKey = !config.apiKey || config.apiKey === DEFAULT_API_KEY

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>(() => {
    const defaultMsg: Message[] = [
      {
        id: '1',
        text: INITIAL_GREETING,
        sender: 'bot',
        timestamp: new Date(),
      },
    ]
    const saved = localStorage.getItem(CHAT_STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const restored = parsed.map((m: Message & { timestamp: string }) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }))
        // 初回メッセージが古い挨拶文なら新しいものに差し替え
        if (
          restored[0]?.sender === 'bot' &&
          restored[0]?.text !== INITIAL_GREETING
        ) {
          restored[0] = { ...restored[0], text: INITIAL_GREETING }
        }
        return restored
      } catch (e) {
        console.error(e)
      }
    }
    return defaultMsg
  })

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const theme = useTheme()

  // 現在のページのガイド情報
  const storyGuide: StoryGuideEntry | null = useMemo(
    () => (currentStory ? findStoryGuide(currentStory.title) : null),
    [currentStory]
  )

  // ページコンテキスト付きシステムプロンプト
  const contextualPrompt = useMemo(() => {
    if (!currentStory) return SYSTEM_PROMPT
    const parts = [SYSTEM_PROMPT]
    parts.push(
      `\n\n## 現在のページ情報\nユーザーは現在「${currentStory.title}」の「${currentStory.name}」ストーリーを見ています。`
    )
    if (currentStory.description) {
      parts.push(`ページ説明: ${currentStory.description}`)
    }
    if (storyGuide) {
      parts.push(`概要: ${storyGuide.summary}`)
      parts.push(
        `実装コンテキスト:\n${storyGuide.codeContext.map((c) => `- ${c}`).join('\n')}`
      )
      if (storyGuide.references?.length) {
        parts.push(
          `参考リンク:\n${storyGuide.references.map((r) => `- ${r}`).join('\n')}`
        )
      }
      if (storyGuide.related?.length) {
        parts.push(`関連ページ: ${storyGuide.related.join(', ')}`)
      }
    }
    parts.push(
      'ユーザーが「この画面」「今見てるページ」等と言った場合、上記コンテキストを基に具体的に回答してください。参考リンクがあれば回答に含めてください。'
    )
    return parts.join('\n')
  }, [currentStory, storyGuide])

  const { widgetSize, handleResizeStart } = useWidgetResize()

  const { handleSidebarResize } = useSidebarResize(
    config.sidebarWidth,
    useCallback(
      (width: number) =>
        setConfig((prev) => ({ ...prev, sidebarWidth: width })),
      []
    )
  )

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config))
  }, [config])

  const clearChat = useCallback(() => {
    if (confirm('履歴を削除？'))
      setMessages([
        {
          id: '1',
          text: INITIAL_GREETING,
          sender: 'bot',
          timestamp: new Date(),
        },
      ])
  }, [])

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

  const addBotMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        text,
        sender: 'bot' as const,
        timestamp: new Date(),
      },
    ])
  }

  /** ページ文脈クエリ判定キーワード */
  const isPageContextQuery = (q: string): boolean => {
    const keywords = [
      'この画面',
      'このページ',
      '今見てる',
      '今見ている',
      '今のページ',
      '今の画面',
      '何のページ',
      '何を見て',
      'ここは何',
      'ここって何',
      'ここは',
      'what is this',
      'what page',
    ]
    return keywords.some((kw) => q.toLowerCase().includes(kw))
  }

  /** 現在のページに関するFAQ回答を生成 */
  const buildPageContextAnswer = (query?: string): string | null => {
    if (!currentStory || !storyGuide) return null
    const q = query?.toLowerCase() || ''
    const isImplementation = q.includes('実装') || q.includes('コード')

    const lines = [
      `**${currentStory.title}** > ${currentStory.name}`,
      '',
      isImplementation ? '### 実装のポイント' : storyGuide.summary,
      '',
      ...storyGuide.codeContext.map((c) => `- ${c}`),
    ]
    if (storyGuide.references?.length) {
      lines.push('', '**参考:**', ...storyGuide.references.map((r) => `- ${r}`))
    }
    if (storyGuide.related?.length) {
      lines.push('', `関連: ${storyGuide.related.join(' / ')}`)
    }
    return lines.join('\n')
  }

  /** FAQ回答から「やるべきこと」セクションを除去し端的にする */
  const trimFaqAnswer = (text: string): string => {
    return text.replace(/\n+## やるべきこと[\s\S]*$/, '').trimEnd()
  }

  const respondWithFaq = (query: string) => {
    // ページ文脈クエリを優先チェック
    if (isPageContextQuery(query)) {
      const pageAnswer = buildPageContextAnswer(query)
      if (pageAnswer) {
        addBotMessage(pageAnswer)
        return
      }
    }

    const answer = findFaqAnswer(query)
    if (answer) {
      addBotMessage(trimFaqAnswer(answer))
    } else {
      addBotMessage(
        '該当するFAQが見つかりませんでした。以下のトピックをお試しください:\n\n' +
          FAQ_DATABASE.map((f) => `- **${f.title}**`).join('\n') +
          '\n\nAI接続すると自由な質問に対応できます。設定からAPIキーを入力してください。'
      )
    }
  }

  const handleDownload = useCallback(() => {
    const lines = [
      '# Concierge - チャット履歴',
      `> ${new Date().toLocaleDateString('ja-JP')} エクスポート`,
      '',
    ]
    for (const msg of messages) {
      if (msg.sender === 'user') {
        lines.push(`## Q: ${msg.text}`, '')
      } else {
        lines.push(msg.text, '')
      }
      lines.push('---', '')
    }
    const blob = new Blob([lines.join('\n')], {
      type: 'text/markdown;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `concierge-${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [messages])

  const handleSend = async () => {
    if (!message.trim() || isTyping) return
    const userText = message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newUserMessage])
    setMessage('')

    // APIキーなし → FAQ検索
    if (!config.apiKey) {
      respondWithFaq(userText)
      return
    }

    // AI呼び出し
    setIsTyping(true)
    try {
      const payload = [
        { role: 'system', content: contextualPrompt },
        ...messages.map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
        { role: 'user', content: userText },
      ]
      const data = await callAI(config, payload)
      const aiText = extractContent(data)
      addBotMessage(aiText)
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.name === 'AbortError'
            ? 'タイムアウト: 応答に時間がかかりすぎています。'
            : error.message
          : String(error)
      // AI失敗時もFAQで応答を試みる
      const faqAnswer = findFaqAnswer(userText)
      if (faqAnswer) {
        addBotMessage(
          `*AI接続エラー: ${errMsg}*\n\n---\n\nFAQから回答します:\n\n${trimFaqAnswer(faqAnswer)}`
        )
      } else {
        addBotMessage(`エラー: ${errMsg}`)
      }
    } finally {
      setIsTyping(false)
    }
  }

  const submitShortcutLabel = formatShortcutLabel(config.shortcuts.sendMessage)

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

  const resetShortcuts = () => {
    setConfig((prev) => ({
      ...prev,
      shortcuts: createDefaultShortcuts(),
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // IME入力中（日本語変換中）は無視
    if (e.nativeEvent.isComposing) return

    // 設定されたショートカットで送信
    if (isShortcutMatch(e.nativeEvent, config.shortcuts.sendMessage)) {
      e.preventDefault()
      handleSend()
    }
    // Enterのみ → 改行（multiline TextFieldのデフォルト動作）
    // Shift+Enter → 改行（同上）
  }

  const toggleUiMode = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      uiMode: prev.uiMode === 'widget' ? 'sidebar' : 'widget',
    }))
  }, [])

  // グローバルキーボードショートカット
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // IME変換中は無視
      if (e.isComposing) return

      // テキスト入力欄にフォーカス中はショートカットを無効化（paste等を妨げない）
      const tag = (e.target as HTMLElement)?.tagName
      const isInputFocused =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        (e.target as HTMLElement)?.isContentEditable

      // チャット開閉（入力欄フォーカス中でも動作させる）
      if (isShortcutMatch(e, config.shortcuts.toggleChat)) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
        return
      }

      // 以下はチャットが開いている時のみ
      if (!isOpen) return

      // 入力欄フォーカス中は残りのショートカットをスキップ
      if (isInputFocused) return

      // チャットを閉じる
      if (isShortcutMatch(e, config.shortcuts.closeChat)) {
        setIsOpen(false)
        return
      }

      // 入力欄にフォーカス
      if (isShortcutMatch(e, config.shortcuts.focusInput)) {
        e.preventDefault()
        inputRef.current?.focus()
        return
      }

      // 設定パネル切替
      if (isShortcutMatch(e, config.shortcuts.toggleSettings)) {
        e.preventDefault()
        setShowSettings((prev) => !prev)
        return
      }

      // ダウンロード
      if (isShortcutMatch(e, config.shortcuts.downloadHistory)) {
        e.preventDefault()
        handleDownload()
        return
      }

      // UI切替
      if (isShortcutMatch(e, config.shortcuts.toggleUiMode)) {
        e.preventDefault()
        toggleUiMode()
        return
      }

      // 履歴クリア
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
    clearChat,
    handleDownload,
    toggleUiMode,
  ])

  const hasUserMessages = messages.some((m) => m.sender === 'user')

  const handleSuggestionClick = (query: string) => {
    if (isTyping) return
    setMessage(query)
    // setMessageの後にhandleSendを呼ぶため、直接送信ロジックを実行
    const userMsg: Message = {
      id: Date.now().toString(),
      text: query,
      sender: 'user',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setMessage('')

    // APIキーなし → FAQ
    if (!config.apiKey) {
      respondWithFaq(query)
      return
    }

    // AI呼び出し
    setIsTyping(true)
    const payload = [
      { role: 'system', content: contextualPrompt },
      ...messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
      { role: 'user', content: query },
    ]

    callAI(config, payload)
      .then((data) => {
        addBotMessage(extractContent(data))
      })
      .catch((error: unknown) => {
        const errMsg =
          error instanceof Error
            ? error.name === 'AbortError'
              ? 'タイムアウト: 応答に時間がかかりすぎています。'
              : error.message
            : String(error)
        const faqAnswer = findFaqAnswer(query)
        if (faqAnswer) {
          addBotMessage(`*AI接続エラー*\n\n---\n\n${trimFaqAnswer(faqAnswer)}`)
        } else {
          addBotMessage(`エラー: ${errMsg}`)
        }
      })
      .finally(() => {
        setIsTyping(false)
      })
  }

  const ChatContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'transparent',
      }}>
      {/* ヘッダー */}
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
              <IconButton
                size='small'
                color='inherit'
                onClick={() => setShowSettings(false)}>
                <ChevronLeft size={20} />
              </IconButton>
            ) : (
              <Avatar
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  width: 32,
                  height: 32,
                }}>
                <Bot size={20} />
              </Avatar>
            )}
            <Box>
              <Typography
                variant='subtitle2'
                sx={{ fontWeight: 600, lineHeight: 1.2 }}>
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
        {/* アイコンツールバー + モデル名 */}
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
                  onClick={toggleUiMode}
                  title={
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
                  onClick={() => setShowSettings(true)}>
                  <Settings size={18} />
                </IconButton>
                <IconButton
                  size='small'
                  color='inherit'
                  onClick={handleDownload}
                  title='Markdownでダウンロード'>
                  <Download size={18} />
                </IconButton>
                <IconButton
                  size='small'
                  color='inherit'
                  onClick={clearChat}
                  title='履歴クリア'>
                  <Trash2 size={18} />
                </IconButton>
              </>
            )}
            <IconButton
              size='small'
              color='inherit'
              onClick={() => setIsOpen(false)}>
              <X size={18} />
            </IconButton>
          </Stack>
          {!showSettings && (
            <Typography
              sx={{
                opacity: 0.6,
                fontSize: 12,
                whiteSpace: 'nowrap',
              }}>
              {!config.apiKey && !DEFAULT_API_KEY
                ? 'FAQモード'
                : config.model || DEFAULT_MODEL}
            </Typography>
          )}
        </Stack>
      </Box>

      {/* ページ解説トリガー: スティッキー */}
      {!showSettings && storyGuide && currentStory && (
        <Box
          sx={{
            px: 1.5,
            py: 0.75,
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(14,173,184,0.3)'
                : 'rgba(63,81,181,0.08)',
            borderBottom: '1px solid',
            borderColor: 'divider',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}>
          <Chip
            icon={<Info size={14} />}
            label={`${currentStory.title} の解説を見る`}
            size='small'
            variant='outlined'
            onClick={() => {
              const pageAnswer = buildPageContextAnswer()
              if (pageAnswer) addBotMessage(pageAnswer)
            }}
            sx={{
              height: 28,
              fontSize: '0.75rem',
              cursor: 'pointer',
              borderColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.2)'
                  : 'primary.light',
              color:
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.9)'
                  : 'primary.main',
              '& .MuiChip-icon': {
                color: 'inherit',
              },
              '&:hover': {
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(63,81,181,0.12)',
              },
            }}
          />
        </Box>
      )}

      {/* 設定パネル or チャットエリア */}
      {showSettings ? (
        <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
          <Stack spacing={3}>
            {/* 現在の接続状態セクション */}
            <Box
              sx={{
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.03)',
                borderRadius: 1,
                p: 2,
              }}>
              <Typography
                variant='caption'
                sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                現在の設定
              </Typography>
              {isUsingDefaultKey ? (
                DEFAULT_API_KEY ? (
                  <>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: 'block', lineHeight: 1.6 }}>
                      {DEFAULT_MODEL} を使用中（プロジェクト提供）
                    </Typography>
                    <Stack
                      direction='row'
                      alignItems='center'
                      spacing={0.5}
                      sx={{ mt: 0.5 }}>
                      <CheckCircle2
                        size={14}
                        color={theme.palette.success.main}
                      />
                      <Typography variant='caption' color='success.main'>
                        AI対話モード
                      </Typography>
                    </Stack>
                  </>
                ) : (
                  <>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: 'block', lineHeight: 1.6 }}>
                      APIキー未設定
                    </Typography>
                    <Stack
                      direction='row'
                      alignItems='center'
                      spacing={0.5}
                      sx={{ mt: 0.5 }}>
                      <AlertCircle
                        size={14}
                        color={theme.palette.warning.main}
                      />
                      <Typography variant='caption' color='warning.main'>
                        FAQモードのみ（AI対話にはAPIキーが必要）
                      </Typography>
                    </Stack>
                  </>
                )
              ) : (
                <>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ display: 'block', lineHeight: 1.6 }}>
                    {config.model} を使用中（カスタムAPIキー）
                  </Typography>
                  <Stack
                    direction='row'
                    alignItems='center'
                    spacing={0.5}
                    sx={{ mt: 0.5 }}>
                    <CheckCircle2
                      size={14}
                      color={theme.palette.success.main}
                    />
                    <Typography variant='caption' color='success.main'>
                      AI対話モード
                    </Typography>
                  </Stack>
                </>
              )}
            </Box>

            <Divider />

            {/* カスタムAPI設定セクション */}
            <Box>
              <Typography
                variant='caption'
                sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                カスタムAPI設定（任意）
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', mb: 1.5, lineHeight: 1.6 }}>
                自分のAPIキーを使うと、より高性能なモデルを選択できます。
              </Typography>

              {/* プロバイダー選択タブ */}
              <Stack direction='row' spacing={1} sx={{ mb: 1.5 }}>
                {(['openai', 'gemini'] as const).map((provider) => {
                  const isGemini = config.model.includes('gemini')
                  const active =
                    (provider === 'gemini' && isGemini) ||
                    (provider === 'openai' && !isGemini)
                  return (
                    <Chip
                      key={provider}
                      label={provider === 'openai' ? 'OpenAI' : 'Google Gemini'}
                      size='small'
                      variant={active ? 'filled' : 'outlined'}
                      color={active ? 'primary' : 'default'}
                      onClick={() => {
                        const defaultModel =
                          provider === 'gemini'
                            ? GEMINI_MODELS[0].value
                            : OPENAI_MODELS[0].value
                        setConfig({ ...config, model: defaultModel })
                        setTestResult(null)
                      }}
                      sx={{
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                      }}
                    />
                  )
                })}
              </Stack>

              <TextField
                fullWidth
                size='small'
                type='text'
                autoComplete='off'
                value={apiKeyDraft}
                onChange={(e) => {
                  const v = e.target.value
                  setApiKeyDraft(v)
                  if (v) {
                    setConfig({ ...config, apiKey: v })
                  } else {
                    setConfig({
                      ...config,
                      apiKey: DEFAULT_API_KEY,
                      model: DEFAULT_MODEL,
                    })
                  }
                  setTestResult(null)
                }}
                placeholder={
                  config.model.includes('gemini') ? 'AIza...' : 'sk-proj-...'
                }
                inputProps={{
                  style:
                    !showApiKey && apiKeyDraft
                      ? ({ WebkitTextSecurity: 'disc' } as React.CSSProperties)
                      : undefined,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      {apiKeyDraft && (
                        <IconButton
                          size='small'
                          onClick={() => {
                            if (
                              window.confirm(
                                'APIキーをリセットしてデフォルト(gpt-4.1-nano)に戻しますか?'
                              )
                            ) {
                              setApiKeyDraft('')
                              setConfig({
                                ...config,
                                apiKey: DEFAULT_API_KEY,
                                model: DEFAULT_MODEL,
                              })
                              setTestResult(null)
                              setShowApiKey(false)
                            }
                          }}
                          title='デフォルトに戻す'>
                          <X size={16} />
                        </IconButton>
                      )}
                      <IconButton
                        size='small'
                        onClick={() => setShowApiKey(!showApiKey)}>
                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* モデル選択 — 常に表示 */}
            <Box>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', mb: 0.8, fontWeight: 600 }}>
                AIモデル
              </Typography>
              <TextField
                select
                fullWidth
                size='small'
                value={config.model}
                onChange={(e) => {
                  setConfig({ ...config, model: e.target.value })
                  setTestResult(null)
                }}>
                {(config.model.includes('gemini')
                  ? GEMINI_MODELS
                  : OPENAI_MODELS
                ).map((opt) => {
                  const isLocked = isUsingDefaultKey && !!opt.requiresUserKey
                  return (
                  <MenuItem
                    key={opt.value}
                    value={opt.value}
                    disabled={isLocked}
                    title={isLocked ? '自分のAPIキーを設定すると使用できます' : undefined}
                    sx={{ py: 1.5, alignItems: 'flex-start' }}>
                    <Box sx={{ width: '100%' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                          mb: 0.25,
                        }}>
                        {isLocked && (
                          <Lock size={12} />
                        )}
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {opt.label}
                        </Typography>
                        <Chip
                          label={
                            opt.tier === 'premium'
                              ? 'Premium'
                              : opt.tier === 'economy'
                                ? 'Economy'
                                : 'Standard'
                          }
                          size='small'
                          color={
                            opt.tier === 'premium'
                              ? 'primary'
                              : opt.tier === 'economy'
                                ? 'default'
                                : 'info'
                          }
                          variant='outlined'
                          sx={{
                            height: 18,
                            fontSize: '0.6rem',
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />
                      </Box>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ display: 'block', lineHeight: 1.4, mb: 0.5 }}>
                        {opt.description}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 0.5,
                        }}>
                        {opt.usecases.map((uc) => (
                          <Typography
                            key={uc}
                            variant='caption'
                            sx={{
                              fontSize: '0.65rem',
                              color: 'text.disabled',
                              lineHeight: 1.2,
                              '&::before': { content: '"- "' },
                            }}>
                            {uc}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  </MenuItem>
                  )
                })}
              </TextField>
            </Box>

            {/* カスタムキー入力時のみテストボタンを表示 */}
            {!!apiKeyDraft && (
              <>
                <Button
                  fullWidth
                  variant='outlined'
                  size='medium'
                  onClick={handleTestConnection}
                  disabled={isTesting || !config.apiKey}
                  sx={{ py: 1 }}
                  startIcon={
                    isTesting ? (
                      <CircularProgress size={16} color='inherit' />
                    ) : (
                      <Sparkles size={16} />
                    )
                  }>
                  {isTesting ? 'テスト中...' : 'API接続テスト'}
                </Button>
                {testResult && (
                  <Alert
                    severity={testResult.success ? 'success' : 'error'}
                    icon={
                      testResult.success ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <AlertCircle size={18} />
                      )
                    }>
                    <Typography variant='caption'>
                      {testResult.message}
                    </Typography>
                  </Alert>
                )}
              </>
            )}

            <Divider />
            <Typography variant='caption' color='text.secondary'>
              キーはブラウザにのみ保存されます。モデルを切り替えたらテストを推奨します。
            </Typography>
            <Box
              sx={{
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.03)',
                borderRadius: 1,
                p: 1.5,
              }}>
              <Typography
                variant='caption'
                sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                APIキーの取得方法
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                component='div'
                sx={{ lineHeight: 1.7 }}>
                <Box component='ul' sx={{ pl: 2, m: 0, '& li': { mb: 0.5 } }}>
                  <li>
                    <strong>OpenAI</strong>:{' '}
                    <Link
                      href='https://platform.openai.com/api-keys'
                      target='_blank'
                      rel='noopener noreferrer'
                      sx={{ fontSize: 'inherit' }}>
                      platform.openai.com
                    </Link>{' '}
                    でアカウント作成後、API Keysページでキーを発行（従量課金制）
                  </li>
                  <li>
                    <strong>Google Gemini</strong>:{' '}
                    <Link
                      href='https://aistudio.google.com/apikey'
                      target='_blank'
                      rel='noopener noreferrer'
                      sx={{ fontSize: 'inherit' }}>
                      aistudio.google.com
                    </Link>{' '}
                    でGoogleアカウントでログイン後、APIキーを発行（無料枠あり）
                  </li>
                </Box>
              </Typography>
            </Box>
            <Divider />
            <Box>
              <Stack
                direction='row'
                justifyContent='space-between'
                spacing={1}
                alignItems='center'
                sx={{ mb: 1 }}>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <Keyboard size={14} />
                  <Typography variant='caption' sx={{ fontWeight: 600 }}>
                    キーボードショートカット
                  </Typography>
                </Stack>
                <Button size='small' variant='text' onClick={resetShortcuts}>
                  既定値に戻す
                </Button>
              </Stack>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', mb: 1.2 }}>
                入力欄にフォーカスして希望のキーを押すと更新されます。
              </Typography>
              <Box
                component='table'
                sx={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  '& td': {
                    py: 0.6,
                    fontSize: 11,
                    verticalAlign: 'middle',
                  },
                  '& td:first-of-type': {
                    width: 160,
                    pr: 1,
                  },
                }}>
                <tbody>
                  {SHORTCUT_METADATA.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <TextField
                          size='small'
                          value={formatShortcutLabel(config.shortcuts[s.id])}
                          onKeyDown={handleShortcutInputKeyDown(s.id)}
                          InputProps={{
                            readOnly: true,
                            inputProps: {
                              'aria-label': `${s.desc} のショートカット`,
                              style: {
                                fontFamily: 'monospace',
                                fontSize: 10,
                                textAlign: 'center',
                                paddingTop: 4,
                                paddingBottom: 4,
                              },
                            },
                          }}
                        />
                      </td>
                      <td>
                        <Typography variant='caption' color='text.secondary'>
                          {s.desc}
                        </Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Box>
            </Box>
          </Stack>
        </Box>
      ) : (
        <>
          <Box
            ref={scrollRef}
            sx={{
              flexGrow: 1,
              px: 1.5,
              py: 1.5,
              overflowY: 'auto',
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(248,249,250,0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user'
              return (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                  }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: isUser ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      gap: 0.75,
                      maxWidth: '96%',
                    }}>
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        mt: 0.5,
                        flexShrink: 0,
                        bgcolor: isUser ? 'secondary.main' : 'primary.light',
                        fontSize: 12,
                      }}>
                      {isUser ? <User size={14} /> : <Bot size={14} />}
                    </Avatar>
                    <Box
                      sx={{
                        px: 2,
                        pt: '5px',
                        pb: '4px',
                        minWidth: 0,
                        overflow: 'hidden',
                        borderRadius: '12px',
                        borderTopLeftRadius: isUser ? '12px' : '2px',
                        borderTopRightRadius: isUser ? '2px' : '12px',
                        bgcolor: isUser
                          ? theme.palette.mode === 'dark'
                            ? 'rgba(14,173,184,0.45)'
                            : 'primary.main'
                          : theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.06)'
                            : 'background.paper',
                        color: isUser ? 'primary.contrastText' : 'text.primary',
                        boxShadow: 'none',
                      }}>
                      {isUser ? (
                        <Typography
                          variant='body2'
                          sx={{
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.7,
                            fontSize: 14,
                          }}>
                          {msg.text}
                        </Typography>
                      ) : (
                        <Box
                          sx={{
                            fontSize: 14,
                            lineHeight: 1.7,
                            wordBreak: 'break-word',
                            '& p': {
                              m: 0,
                              mb: 1,
                              '&:last-child': { mb: 0 },
                            },
                            '& h1, & h2, & h3, & h4, & h5, & h6': {
                              mt: 2,
                              mb: 1,
                              lineHeight: 1.5,
                              fontWeight: 600,
                            },
                            '& h1': { fontSize: 18 },
                            '& h2': { fontSize: 16 },
                            '& h3': { fontSize: 14 },
                            '& ul, & ol': { pl: 2.5, my: 1 },
                            '& li': { mb: 0.5 },
                            '& code': {
                              bgcolor:
                                theme.palette.mode === 'dark'
                                  ? 'rgba(255,255,255,0.07)'
                                  : 'rgba(0,0,0,0.06)',
                              px: 0.5,
                              py: 0.25,
                              border: 'none',
                              borderRadius: 0.5,
                              fontSize: 12,
                              fontFamily: '"Fira Code", "Consolas", monospace',
                              lineHeight: 1.75,
                            },
                            '& pre': {
                              bgcolor:
                                theme.palette.mode === 'dark'
                                  ? 'rgba(0,0,0,0.2)'
                                  : 'rgba(0,0,0,0.04)',
                              p: 1.5,
                              border: 'none',
                              borderRadius: 1,
                              overflowX: 'auto',
                              my: 1,
                              '& code': {
                                bgcolor: 'transparent',
                                border: 'none',
                                px: 0,
                                py: 0,
                              },
                            },
                            '& blockquote': {
                              borderLeft: '3px solid',
                              borderColor: 'divider',
                              pl: 1.5,
                              ml: 0,
                              my: 1,
                              opacity: 0.85,
                            },
                            '& a': {
                              color: 'primary.main',
                              textDecoration: 'underline',
                            },
                            '& table': {
                              borderCollapse: 'collapse',
                              my: 1,
                              width: '100%',
                              '& th, & td': {
                                border: '1px solid',
                                borderColor: 'divider',
                                px: 1,
                                py: 0.5,
                                fontSize: 12,
                              },
                              '& th': {
                                fontWeight: 600,
                                bgcolor:
                                  theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.04)'
                                    : 'rgba(0,0,0,0.03)',
                              },
                            },
                          }}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code: CodeBlock,
                              pre: CodeBlockPre,
                              a: ({ href, children: linkChildren }) => (
                                <a
                                  href={href}
                                  target='_blank'
                                  rel='noopener noreferrer'>
                                  {linkChildren}
                                </a>
                              ),
                            }}>
                            {msg.text}
                          </ReactMarkdown>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              )
            })}
            {!hasUserMessages && !isTyping && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.75,
                  mt: 0.5,
                  ml: 4.5,
                }}>
                {storyGuide && (
                  <>
                    <Chip
                      label='現在のページの解説'
                      size='small'
                      variant='outlined'
                      onClick={() =>
                        handleSuggestionClick('この画面の解説をお願いします')
                      }
                      sx={{
                        cursor: 'pointer',
                        fontSize: 12,
                        borderColor: 'success.main',
                        color: 'success.main',
                        '&:hover': {
                          bgcolor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(76,175,80,0.08)'
                              : 'rgba(76,175,80,0.06)',
                          borderColor: 'success.main',
                        },
                      }}
                    />
                    <Chip
                      label='実装のポイント'
                      size='small'
                      variant='outlined'
                      onClick={() =>
                        handleSuggestionClick(
                          'この画面の実装のポイントを教えて'
                        )
                      }
                      sx={{
                        cursor: 'pointer',
                        fontSize: 12,
                        borderColor: 'info.main',
                        color: 'info.main',
                        '&:hover': {
                          bgcolor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(29,175,194,0.08)'
                              : 'rgba(29,175,194,0.06)',
                          borderColor: 'info.main',
                        },
                      }}
                    />
                  </>
                )}
                {QUICK_SUGGESTIONS.map((s) => (
                  <Chip
                    key={s.label}
                    label={s.label}
                    size='small'
                    variant='outlined'
                    onClick={() => handleSuggestionClick(s.query)}
                    sx={{
                      cursor: 'pointer',
                      fontSize: 12,
                      borderColor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.12)'
                          : 'rgba(14,173,184,0.3)',
                      color:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.6)'
                          : 'primary.main',
                      '&:hover': {
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(14,173,184,0.06)',
                        borderColor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.25)'
                            : 'primary.main',
                      },
                    }}
                  />
                ))}
              </Box>
            )}
            {isTyping && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  ml: 1,
                }}>
                <CircularProgress size={14} />
                <Typography variant='caption' color='text.secondary'>
                  AI回答中...
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              pt: '16px',
              pr: '4px',
              pb: '10px',
              pl: '16px',
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(30,30,30,0.6)'
                  : 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(12px)',
              borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.palette.divider}`,
            }}>
            <Stack direction='row' spacing={1} alignItems='stretch'>
              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={8}
                inputRef={inputRef}
                placeholder={
                  config.apiKey
                    ? `質問を入力... (${submitShortcutLabel}で送信)`
                    : `FAQモード: 質問を入力... (${submitShortcutLabel}で送信)`
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
              <IconButton
                color='primary'
                disabled={!message.trim() || isTyping}
                onClick={handleSend}
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
        </>
      )}
    </Box>
  )

  return (
    <>
      {/* サイドバーモード（オーバーレイなし） */}
      <Slide
        direction='left'
        in={isOpen && config.uiMode === 'sidebar'}
        mountOnEnter
        unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: { xs: '100%', sm: config.sidebarWidth || 400 },
            zIndex: 1200,
            display: 'flex',
            borderLeft: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.palette.divider}`,
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(28,28,32,0.95)'
                : 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)',
          }}>
          <Box
            onMouseDown={handleSidebarResize}
            sx={{
              width: 6,
              flexShrink: 0,
              cursor: 'ew-resize',
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
              '&:hover': {
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.06)',
              },
            }}
          />
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
            }}>
            {ChatContent}
          </Box>
        </Paper>
      </Slide>

      {/* FABボタン + ウィジェットモード */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}>
        <Zoom in={!isOpen}>
          <Fab
            onClick={() => setIsOpen(true)}
            sx={{
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(14,173,184,0.5)'
                  : 'rgba(14,173,184,0.85)',
              color: '#fff',
              backdropFilter: 'blur(16px)',
              boxShadow:
                theme.palette.mode === 'dark'
                  ? '0 8px 32px rgba(0,0,0,0.4)'
                  : '0 8px 32px rgba(14,173,184,0.3)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.18)'}`,
              '&:hover': {
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(14,173,184,0.65)'
                    : 'rgba(14,173,184,0.95)',
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 8px 32px rgba(0,0,0,0.5)'
                    : '0 8px 32px rgba(14,173,184,0.45)',
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
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: { xs: 'calc(100vw - 48px)', sm: widgetSize.width },
                height: widgetSize.height,
                minWidth: 320,
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: 2,
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(28,28,32,0.92)'
                    : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
              }}>
              {/* リサイズハンドル: 上辺 */}
              <Box
                onMouseDown={handleResizeStart('top')}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 16,
                  right: 16,
                  height: 6,
                  cursor: 'n-resize',
                  zIndex: 10,
                }}
              />
              {/* リサイズハンドル: 左辺 */}
              <Box
                onMouseDown={handleResizeStart('left')}
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 16,
                  bottom: 0,
                  width: 6,
                  cursor: 'ew-resize',
                  zIndex: 10,
                }}
              />
              {/* リサイズハンドル: 左上角 */}
              <Box
                onMouseDown={handleResizeStart('top-left')}
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: 16,
                  height: 16,
                  cursor: 'nw-resize',
                  zIndex: 11,
                }}
              />
              {/* リサイズインジケーター（上部中央のバー） */}
              <Box
                onMouseDown={handleResizeStart('top')}
                sx={{
                  position: 'absolute',
                  top: 4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 32,
                  height: 4,
                  borderRadius: 1,
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.12)',
                  cursor: 'n-resize',
                  zIndex: 12,
                  opacity: 0.5,
                  transition: 'opacity 0.2s',
                  '&:hover': { opacity: 1 },
                }}
              />
              {ChatContent}
            </Paper>
          </Zoom>
        )}
      </Box>
    </>
  )
}
