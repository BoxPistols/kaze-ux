// ChatSupport 共通型定義

export interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export interface CurrentStoryContext {
  /** Storybook meta title（例: "Guide/MUI + Tailwind CSS"） */
  title: string
  /** ストーリー名（例: "Overview"） */
  name: string
  /** meta description（あれば） */
  description?: string
  /**
   * Storybook の argTypes（あれば）
   * 現在ストーリーのコンポーネント props スキーマ。
   * AI 応答のプロンプトに注入して「このコンポーネントの props は？」型の質問に回答可能にする。
   * 将来 sdpf-theme / Matlens / kaze-ux の 3 プロジェクト共通型で正式化予定。
   */
  argTypes?: Record<string, unknown>
  /**
   * Storybook の args（あれば）
   * 現在ストーリーで使用中の props の値。
   * 「このボタンの variant は今何？」のような質問に回答可能にする。
   */
  args?: Record<string, unknown>
}

export interface ChatSupportProps {
  /** 現在表示中のストーリー情報 */
  currentStory?: CurrentStoryContext
}

export type ShortcutActionId =
  | 'sendMessage'
  | 'focusInput'
  | 'toggleChat'
  | 'toggleSettings'
  | 'downloadHistory'
  | 'toggleUiMode'
  | 'clearHistory'
  | 'closeChat'

export interface ShortcutBinding {
  key: string
  mod: boolean
  shift: boolean
  alt: boolean
}

export type ShortcutMap = Record<ShortcutActionId, ShortcutBinding>

export interface ShortcutMetadata {
  id: ShortcutActionId
  desc: string
}

export interface ChatSupportConfig {
  apiKey: string
  model: string
  uiMode: 'widget' | 'sidebar'
  sidebarWidth: number
  shortcuts: ShortcutMap
}

export interface FaqEntry {
  keywords: string[]
  title: string
  answer: string
}
