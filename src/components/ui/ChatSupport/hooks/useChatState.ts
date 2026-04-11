// チャットの基本状態管理 hook
// - isOpen: sessionStorage に永続化
// - messages: localStorage に永続化
// - scrollRef / inputRef: DOM 参照
// - clearChat / executeClearChat: 履歴クリア

import { useState, useRef, useEffect, useCallback } from 'react'

import { CHAT_STORAGE_KEY } from '../chatSupportConstants'
import { INITIAL_GREETING } from '../faqDatabase'

import type { Message } from '../chatSupportTypes'

export const useChatState = () => {
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
        if (restored[0]?.sender === 'bot' && restored[0]?.text !== INITIAL_GREETING) {
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

  // messages 変化時: localStorage 保存 + 自動スクロール
  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const [confirmClearOpen, setConfirmClearOpen] = useState(false)

  const clearChat = useCallback(() => {
    setConfirmClearOpen(true)
  }, [])

  const executeClearChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        text: INITIAL_GREETING,
        sender: 'bot',
        timestamp: new Date(),
      },
    ])
    setConfirmClearOpen(false)
  }, [])

  return {
    isOpen,
    setIsOpen,
    message,
    setMessage,
    messages,
    setMessages,
    scrollRef,
    inputRef,
    confirmClearOpen,
    setConfirmClearOpen,
    clearChat,
    executeClearChat,
  }
}
