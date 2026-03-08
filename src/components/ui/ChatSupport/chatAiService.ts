// ChatSupport AI API呼び出しサービス

import type { ChatSupportConfig } from './chatSupportTypes'

// ---------------------------------------------------------------------------
// AI API呼び出し（OpenAI / Gemini 両対応）
// ---------------------------------------------------------------------------

export const callAI = async (
  config: ChatSupportConfig,
  messagesPayload: { role: string; content: string }[],
  isTest = false
): Promise<Record<string, unknown>> => {
  const isGemini = config.model.includes('gemini')
  const isNewGenOpenAI =
    config.model.includes('gpt-5') || config.model.includes('o1')

  let url = 'https://api.openai.com/v1/chat/completions'
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
  }

  if (isGemini) {
    url =
      'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
    // OpenAI互換エンドポイントはBearer認証を使用
    headers.Authorization = `Bearer ${config.apiKey}`
  }

  const body: Record<string, unknown> = {
    model: config.model,
    messages: messagesPayload,
  }

  if (isNewGenOpenAI) {
    body.max_completion_tokens = isTest ? 50 : 2000
  } else {
    body.max_tokens = isTest ? 50 : 2000
    body.temperature = 0.7
  }

  // タイムアウト設定（60秒）
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60000)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    let data: Record<string, unknown>
    try {
      data = await response.json()
    } catch {
      throw new Error(
        `レスポンスの解析に失敗しました (HTTP ${response.status})`
      )
    }

    if (!response.ok) {
      const err = data.error as Record<string, unknown> | undefined
      const errorMsg =
        err?.message ||
        (data.message as string) ||
        `API Error: ${response.status}`
      throw new Error(String(errorMsg))
    }

    const choices = data.choices as Record<string, unknown>[] | undefined
    if (!choices || !choices[0]) {
      throw new Error(
        `レスポンス形式が不正です: ${JSON.stringify(Object.keys(data))}`
      )
    }

    return data
  } finally {
    clearTimeout(timeoutId)
  }
}

// ---------------------------------------------------------------------------
// レスポンスからテキストを安全に抽出（OpenAI / Gemini両対応）
// ---------------------------------------------------------------------------

export const extractContent = (data: Record<string, unknown>): string => {
  try {
    // OpenAI標準: data.choices[0].message.content
    const choices = data.choices as Record<string, unknown>[] | undefined
    if (choices?.[0]) {
      const msg = choices[0].message as Record<string, unknown> | undefined
      if (msg?.content) return String(msg.content)
      // Gemini互換: choices[0].text
      if (choices[0].text) return String(choices[0].text)
    }
    // Gemini native: data.candidates[0].content.parts[0].text
    const candidates = data.candidates as Record<string, unknown>[] | undefined
    if (candidates?.[0]) {
      const content = candidates[0].content as
        | Record<string, unknown>
        | undefined
      const parts = content?.parts as Record<string, unknown>[] | undefined
      if (parts?.[0]?.text) return String(parts[0].text)
    }
    console.error('[Concierge] content抽出失敗。レスポンス:', data)
    return `(レスポンス形式を解析できませんでした。DevToolsコンソールを確認してください)`
  } catch (e) {
    console.error('[Concierge] extractContent エラー:', e)
    return '(レスポンスの解析に失敗しました)'
  }
}
