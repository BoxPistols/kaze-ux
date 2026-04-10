// ChatSupport AI API呼び出しサービス（AI SDK v6ベース）
// - 手動fetch / URL切替 / レスポンス抽出ロジックを AI SDK v6 に一任
// - OpenAI / Gemini / OpenAI Responses API を SDK 内部で透過的に処理
// - タイムアウトは AbortSignal.timeout による宣言的制御

import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText, type ModelMessage } from 'ai'

import type { ChatSupportConfig } from './chatSupportTypes'

// ---------------------------------------------------------------------------
// モデルプロバイダの解決
// ---------------------------------------------------------------------------

const resolveModel = (config: ChatSupportConfig) => {
  const isGemini = config.model.includes('gemini')
  if (isGemini) {
    const google = createGoogleGenerativeAI({ apiKey: config.apiKey })
    return google(config.model)
  }
  const openai = createOpenAI({ apiKey: config.apiKey })
  return openai(config.model)
}

// ---------------------------------------------------------------------------
// モデル別 maxOutputTokens の決定
// - nano 系: 4000 で十分
// - mini/reasoning 系: 推論トークン消費を見込んで 16000
// - テスト接続: 50 固定
// ---------------------------------------------------------------------------

const resolveMaxOutputTokens = (model: string, isTest: boolean): number => {
  if (isTest) return 50
  if (model.includes('nano')) return 4000
  if (model.includes('gpt-5') || model.includes('o1') || model.includes('o3')) {
    return 16000
  }
  return 4000
}

// ---------------------------------------------------------------------------
// メッセージ変換: 独自形式 → AI SDK v6 の ModelMessage 配列
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
// AI 呼び出し（OpenAI / Gemini 両対応・AI SDK v6）
// - 戻り値は生成テキスト文字列
// - 既存呼び出し側互換のため extractContent もパススルーで維持
// ---------------------------------------------------------------------------

export const callAI = async (
  config: ChatSupportConfig,
  messagesPayload: { role: string; content: string }[],
  isTest = false
): Promise<string> => {
  const model = resolveModel(config)
  const maxOutputTokens = resolveMaxOutputTokens(config.model, isTest)

  // タイムアウト60秒（AI SDK v6のabortSignal経由）
  const abortSignal = AbortSignal.timeout(60000)

  try {
    const result = await generateText({
      model,
      messages: toModelMessages(messagesPayload),
      maxOutputTokens,
      abortSignal,
    })

    // finish_reason が 'length' でテキストが空の場合はフォールバックメッセージ
    if (!result.text && result.finishReason === 'length') {
      return '(回答生成中にトークン上限に達しました。もう少し短い質問で再度お試しください)'
    }

    return result.text
  } catch (error: unknown) {
    // AbortSignal.timeout は TimeoutError、従来は AbortError
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
// 後方互換: 旧API extractContent
// - 新 callAI は文字列を直接返すため、単なるパススルー
// - 既存の ChatSupport.tsx の `extractContent(data)` 呼び出しを壊さない
// ---------------------------------------------------------------------------

export const extractContent = (data: unknown): string => {
  if (typeof data === 'string') return data
  console.error('[Concierge] extractContent: unexpected data shape', data)
  return '(レスポンスの解析に失敗しました)'
}
