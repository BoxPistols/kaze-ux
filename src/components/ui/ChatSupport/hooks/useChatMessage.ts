// メッセージ送受信 hook
// - isTyping: AI 応答中フラグ
// - storyGuide / contextualPrompt: ページ文脈 (memo)
// - addBotMessage / handleSend / handleSuggestionClick
// - handleDownload: Markdown エクスポート
// - Embedding インデックス初期化 effect

import { useState, useMemo, useEffect, useCallback } from 'react'

import { callAI, extractContent } from '../chatAiService'
import { DEFAULT_API_KEY, SYSTEM_PROMPT } from '../chatSupportConstants'
import {
  buildSemanticContext,
  findSemanticFaqAnswer,
  getEmbeddingIndex,
  initEmbeddingIndex,
  semanticSearch,
} from '../embeddingSearch'
import { FAQ_DATABASE, findFaqAnswer, INITIAL_GREETING } from '../faqDatabase'
import { findStoryGuide } from '../storyGuideMap'

import type {
  ChatSupportConfig,
  CurrentStoryContext,
  Message,
} from '../chatSupportTypes'
import type { StoryGuideEntry } from '../storyGuideMap'

interface UseChatMessageProps {
  currentStory: CurrentStoryContext | null | undefined
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  config: ChatSupportConfig
}

export const useChatMessage = ({
  currentStory,
  messages,
  setMessages,
  config,
}: UseChatMessageProps) => {
  const [isTyping, setIsTyping] = useState(false)

  // 現在のページのガイド情報
  const storyGuide: StoryGuideEntry | null = useMemo(
    () => (currentStory ? findStoryGuide(currentStory.title) : null),
    [currentStory]
  )

  // ページ文脈付きシステムプロンプト
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

  // Embedding インデックス初期化（APIキーがある場合のみ、1回実行）
  useEffect(() => {
    if (!config.apiKey || config.apiKey === DEFAULT_API_KEY) return
    if (getEmbeddingIndex()?.isReady()) return
    initEmbeddingIndex(config.apiKey).catch(() => {
      // エラーは initEmbeddingIndex 内でログ済み
    })
  }, [config.apiKey])

  const addBotMessage = useCallback(
    (text: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text,
          sender: 'bot' as const,
          timestamp: new Date(),
        },
      ])
    },
    [setMessages]
  )

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

  /** 現在のページに関する FAQ 回答を生成 */
  const buildPageContextAnswer = useCallback(
    (query?: string): string | null => {
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
        lines.push(
          '',
          '**参考:**',
          ...storyGuide.references.map((r) => `- ${r}`)
        )
      }
      if (storyGuide.related?.length) {
        lines.push('', `関連: ${storyGuide.related.join(' / ')}`)
      }
      return lines.join('\n')
    },
    [currentStory, storyGuide]
  )

  /** FAQ 回答から「やるべきこと」セクションを除去し端的にする */
  const trimFaqAnswer = (text: string): string =>
    text.replace(/\n+## やるべきこと[\s\S]*$/, '').trimEnd()

  const respondWithFaq = useCallback(
    (query: string) => {
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
    },
    [addBotMessage, buildPageContextAnswer]
  )

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

  const handleSend = useCallback(
    async (inputMessage: string, clearInput: () => void) => {
      if (!inputMessage.trim() || isTyping) return
      const userText = inputMessage
      const newUserMessage: Message = {
        id: Date.now().toString(),
        text: userText,
        sender: 'user',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, newUserMessage])
      clearInput()

      if (!config.apiKey) {
        respondWithFaq(userText)
        return
      }

      setIsTyping(true)
      try {
        let enrichedPrompt = contextualPrompt
        const embeddingResults = await semanticSearch(config.apiKey, userText)
        if (embeddingResults.length > 0) {
          enrichedPrompt += buildSemanticContext(embeddingResults)
        }
        const payload = [
          { role: 'system', content: enrichedPrompt },
          ...messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
          { role: 'user', content: userText },
        ]
        const data = await callAI(config, payload)
        addBotMessage(extractContent(data))
      } catch (error: unknown) {
        const errMsg =
          error instanceof Error
            ? error.name === 'AbortError'
              ? 'タイムアウト: 応答に時間がかかりすぎています。'
              : error.message
            : String(error)
        const embeddingFaq = await semanticSearch(
          config.apiKey,
          userText
        ).catch(() => [])
        const semanticAnswer = findSemanticFaqAnswer(embeddingFaq)
        const faqAnswer = semanticAnswer ?? findFaqAnswer(userText)
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
    },
    [
      isTyping,
      config,
      messages,
      setMessages,
      contextualPrompt,
      addBotMessage,
      respondWithFaq,
    ]
  )

  const handleSuggestionClick = useCallback(
    (query: string) => {
      if (isTyping) return
      const userMsg: Message = {
        id: Date.now().toString(),
        text: query,
        sender: 'user',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])

      if (!config.apiKey) {
        respondWithFaq(query)
        return
      }

      setIsTyping(true)
      semanticSearch(config.apiKey, query)
        .catch(() => [])
        .then((embeddingResults) => {
          let enrichedPrompt = contextualPrompt
          if (embeddingResults.length > 0) {
            enrichedPrompt += buildSemanticContext(embeddingResults)
          }
          const payload = [
            { role: 'system', content: enrichedPrompt },
            ...messages.map((m) => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
            { role: 'user', content: query },
          ]
          return callAI(config, payload)
        })
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
            addBotMessage(
              `*AI接続エラー*\n\n---\n\n${trimFaqAnswer(faqAnswer)}`
            )
          } else {
            addBotMessage(`エラー: ${errMsg}`)
          }
        })
        .finally(() => setIsTyping(false))
    },
    [
      isTyping,
      config,
      messages,
      setMessages,
      contextualPrompt,
      addBotMessage,
      respondWithFaq,
    ]
  )

  const hasUserMessages = messages.some((m) => m.sender === 'user')

  return {
    isTyping,
    storyGuide,
    contextualPrompt,
    addBotMessage,
    buildPageContextAnswer,
    handleDownload,
    handleSend,
    handleSuggestionClick,
    hasUserMessages,
    INITIAL_GREETING,
  }
}
