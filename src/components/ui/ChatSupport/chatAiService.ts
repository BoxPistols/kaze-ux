// ChatSupport AI API呼び出しサービス（AI SDK v6 + ハイブリッドモード）
//
// モード切替:
// - VITE_API_BASE が設定されていれば → バックエンドプロキシ (/api/ai) 経由
// - 設定されていなければ → ブラウザから AI SDK 直接呼び出し（旧来動作）
//
// バックエンド経由のメリット:
// - APIキーがブラウザに露出しない（サーバー env vars に保管）
// - サーバー側 lib/ratelimit.ts による DAILY_LIMIT 適用
// - X-User-API-Key ヘッダーで自前キー利用時はレート制限免除
// - requiresUserKey なモデルはサーバー側でも拒否

import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText, type ModelMessage } from 'ai'

import type { ChatSupportConfig } from './chatSupportTypes'

// ---------------------------------------------------------------------------
// モード判定
// ---------------------------------------------------------------------------

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) || ''
const isBackendMode = (): boolean => API_BASE.length > 0

// ---------------------------------------------------------------------------
// 構造化エラー: UI 側でクォータ表示・自前キー入力 CTA を出すために型で区別
// ---------------------------------------------------------------------------

export class AIQuotaError extends Error {
  constructor(
    public readonly remaining: number,
    public readonly limit: number,
    public readonly reset: number
  ) {
    super(
      `本日の無料枠 (${limit}回) を使い切りました。明日リセットされます。設定から自前APIキーを入力すると無制限利用できます。`
    )
    this.name = 'AIQuotaError'
  }
}

export class AIUserKeyRequiredError extends Error {
  constructor() {
    super(
      'このモデルは自分のAPIキーが必要です。設定からキーを入力してください。'
    )
    this.name = 'AIUserKeyRequiredError'
  }
}

// ---------------------------------------------------------------------------
// 共通: モデル別 maxOutputTokens の決定
// ---------------------------------------------------------------------------

// Gemini 2.5 系は reasoning tokens を maxOutputTokens に消費するため buffer 加算が必須
// 不足すると finishReason='length' で本文が空になる
const GEMINI_REASONING_BUFFER = 1200

const resolveMaxOutputTokens = (model: string, isTest: boolean): number => {
  const isGemini25 = model.includes('gemini-2.5')

  if (isTest) {
    // Gemini 2.5 は reasoning 消費で 50 では不足、buffer+最低出力 10 を確保
    return isGemini25 ? GEMINI_REASONING_BUFFER + 10 : 50
  }
  if (model.includes('nano')) return 4000
  if (model.includes('gpt-5') || model.includes('o1') || model.includes('o3')) {
    return 16000
  }
  if (isGemini25) return 4000 + GEMINI_REASONING_BUFFER
  return 4000
}

// ---------------------------------------------------------------------------
// 共通: メッセージ変換
// ---------------------------------------------------------------------------

const toModelMessages = (
  payload: { role: string; content: string }[]
): ModelMessage[] =>
  payload.map((m) => {
    if (m.role === 'system') {
      return { role: 'system', content: m.content }
    }
    if (m.role === 'assistant') {
      return { role: 'assistant', content: m.content }
    }
    return { role: 'user', content: m.content }
  })

// ---------------------------------------------------------------------------
// バックエンドモード: /api/ai 経由
// ---------------------------------------------------------------------------

interface BackendResponse {
  text: string
  finishReason?: string
  usedSharedPool?: boolean
  sharedPoolLimit?: number
}

const callViaBackend = async (
  config: ChatSupportConfig,
  messagesPayload: { role: string; content: string }[],
  isTest: boolean
): Promise<string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // 自前 APIキーがあればヘッダーで送信 → サーバー側でレート制限免除
  if (config.apiKey) {
    headers['X-User-API-Key'] = config.apiKey
  }

  const response = await fetch(`${API_BASE}/api/ai`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages: messagesPayload,
      model: config.model,
      maxOutputTokens: resolveMaxOutputTokens(config.model, isTest),
    }),
    signal: AbortSignal.timeout(60000),
  })

  // 429: クォータ超過 → AIQuotaError
  if (response.status === 429) {
    const data = (await response.json().catch(() => ({}))) as {
      remaining?: number
      limit?: number
      reset?: number
    }
    throw new AIQuotaError(
      data.remaining ?? 0,
      data.limit ?? 30,
      data.reset ?? 0
    )
  }

  // 403: モデル制限（USER_KEY_REQUIRED）or オリジン拒否
  if (response.status === 403) {
    const data = (await response.json().catch(() => ({}))) as {
      code?: string
      error?: string
    }
    if (data.code === 'USER_KEY_REQUIRED') {
      throw new AIUserKeyRequiredError()
    }
    throw new Error(data.error || 'Forbidden')
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      error?: string
    }
    throw new Error(data.error || `HTTP ${response.status}`)
  }

  const data = (await response.json()) as BackendResponse

  // finishReason=length で空テキストの場合のフォールバック
  if (!data.text && data.finishReason === 'length') {
    return '(回答生成中にトークン上限に達しました。もう少し短い質問で再度お試しください)'
  }

  return data.text
}

// ---------------------------------------------------------------------------
// ダイレクトモード: ブラウザから AI SDK 直接呼び出し（旧来動作）
// ---------------------------------------------------------------------------

const resolveModelDirect = (config: ChatSupportConfig) => {
  const isGemini = config.model.includes('gemini')
  if (isGemini) {
    const google = createGoogleGenerativeAI({ apiKey: config.apiKey })
    return google(config.model)
  }
  const openai = createOpenAI({ apiKey: config.apiKey })
  return openai(config.model)
}

const callDirect = async (
  config: ChatSupportConfig,
  messagesPayload: { role: string; content: string }[],
  isTest: boolean
): Promise<string> => {
  const model = resolveModelDirect(config)
  const maxOutputTokens = resolveMaxOutputTokens(config.model, isTest)
  const abortSignal = AbortSignal.timeout(60000)

  const result = await generateText({
    model,
    messages: toModelMessages(messagesPayload),
    maxOutputTokens,
    abortSignal,
  })

  if (!result.text && result.finishReason === 'length') {
    return '(回答生成中にトークン上限に達しました。もう少し短い質問で再度お試しください)'
  }

  return result.text
}

// ---------------------------------------------------------------------------
// 公開 API: callAI（ハイブリッドディスパッチャー）
// ---------------------------------------------------------------------------

export const callAI = async (
  config: ChatSupportConfig,
  messagesPayload: { role: string; content: string }[],
  isTest = false
): Promise<string> => {
  try {
    if (isBackendMode()) {
      return await callViaBackend(config, messagesPayload, isTest)
    }
    return await callDirect(config, messagesPayload, isTest)
  } catch (error: unknown) {
    // 構造化エラーはそのまま再スロー（UI 側で型分岐するため）
    if (
      error instanceof AIQuotaError ||
      error instanceof AIUserKeyRequiredError
    ) {
      throw error
    }

    // タイムアウト系
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        throw new Error('リクエストがタイムアウトしました (60秒)')
      }
      throw error
    }
    throw new Error(`AI呼び出しに失敗しました: ${String(error)}`)
  }
}

// ---------------------------------------------------------------------------
// 後方互換: extractContent（パススルー）
// ---------------------------------------------------------------------------

export const extractContent = (data: unknown): string => {
  if (typeof data === 'string') return data
  console.error('[Concierge] extractContent: unexpected data shape', data)
  return '(レスポンスの解析に失敗しました)'
}
