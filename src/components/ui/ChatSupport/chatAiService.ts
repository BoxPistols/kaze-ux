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
    // gpt-5系: nanoは4000で十分、miniは推論トークン消費が多いため余裕を持たせる
    const isNano = config.model.includes('nano')
    body.max_completion_tokens = isTest ? 50 : isNano ? 4000 : 16000
  } else {
    body.max_tokens = isTest ? 50 : 4000
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

    // choicesまたはoutput（Responses API）の存在を確認
    const choices = data.choices as Record<string, unknown>[] | undefined
    const output = data.output as Record<string, unknown>[] | undefined
    if ((!choices || !choices[0]) && !output) {
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
    // 1. OpenAI標準: data.choices[0].message.content
    const choices = data.choices as Record<string, unknown>[] | undefined
    if (choices?.[0]) {
      const msg = choices[0].message as Record<string, unknown> | undefined
      if (msg?.content) return String(msg.content)
      // content が null でも refusal がある場合
      if (msg?.refusal) return String(msg.refusal)
      // Gemini互換: choices[0].text
      if (choices[0].text) return String(choices[0].text)
      // 推論モデル: contentが空でfinish_reason=length（推論トークンで上限到達）
      if (
        choices[0].finish_reason === 'length' &&
        msg &&
        (msg.content === '' || msg.content === null)
      ) {
        return '(回答生成中にトークン上限に達しました。もう少し短い質問で再度お試しください)'
      }
    }

    // 2. OpenAI Responses API: data.output[].content[].text
    const output = data.output as Record<string, unknown>[] | undefined
    if (output) {
      for (const item of output) {
        if (item.type === 'message') {
          const contentArr = item.content as
            | Record<string, unknown>[]
            | undefined
          if (contentArr) {
            for (const part of contentArr) {
              if (part.type === 'output_text' && part.text)
                return String(part.text)
            }
          }
        }
      }
    }

    // 3. Gemini native: data.candidates[0].content.parts[0].text
    const candidates = data.candidates as Record<string, unknown>[] | undefined
    if (candidates?.[0]) {
      const content = candidates[0].content as
        | Record<string, unknown>
        | undefined
      const parts = content?.parts as Record<string, unknown>[] | undefined
      if (parts?.[0]?.text) return String(parts[0].text)
    }

    // 4. フラットな text フィールド（一部プロバイダー）
    if (data.text) return String(data.text)

    // 5. 深層探索: レスポンス内の最初の text/content 文字列を探す
    const deepSearch = (obj: unknown, depth: number): string | null => {
      if (depth > 4 || !obj || typeof obj !== 'object') return null
      const record = obj as Record<string, unknown>
      for (const key of ['text', 'content', 'message']) {
        if (typeof record[key] === 'string' && record[key]) {
          return String(record[key])
        }
      }
      for (const val of Object.values(record)) {
        if (Array.isArray(val)) {
          for (const item of val) {
            const found = deepSearch(item, depth + 1)
            if (found) return found
          }
        } else if (typeof val === 'object' && val !== null) {
          const found = deepSearch(val, depth + 1)
          if (found) return found
        }
      }
      return null
    }
    const fallback = deepSearch(data, 0)
    if (fallback) return fallback

    console.error(
      '[Concierge] content抽出失敗。レスポンスキー:',
      Object.keys(data),
      'データ:',
      JSON.stringify(data).slice(0, 500)
    )
    return `(レスポンス形式を解析できませんでした。DevToolsコンソールを確認してください)`
  } catch (e) {
    console.error('[Concierge] extractContent エラー:', e)
    return '(レスポンスの解析に失敗しました)'
  }
}
