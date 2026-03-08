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
