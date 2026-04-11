// Vercel Function: AI チャットエンドポイント
// - ChatSupport から呼ばれるバックエンドプロキシ
// - サーバー側で API キーを保持し、ブラウザに露出させない
// - X-User-API-Key ヘッダーで自前キー利用時はレート制限免除
// - requiresUserKey なモデル（gpt-5.4 等）はサーバー側でも拒否

import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText, type ModelMessage } from 'ai'

import { isAllowedOrigin, setCorsHeaders } from '../lib/cors.js'
import {
  checkRateLimit,
  getClientIdentifier,
  getDailyLimit,
} from '../lib/ratelimit.js'

// ---------------------------------------------------------------------------
// モデル別のサーバー側ポリシー
// ---------------------------------------------------------------------------

// requiresUserKey: 共有プールで使用不可（高コストモデル）
const REQUIRES_USER_KEY_MODELS = new Set<string>(['gpt-5.4'])

const DEFAULT_MODEL = 'gpt-5.4-nano'

// ---------------------------------------------------------------------------
// リクエスト/レスポンス型
// ---------------------------------------------------------------------------

interface AIRequestBody {
  messages: { role: string; content: string }[]
  model?: string
  system?: string
  maxOutputTokens?: number
}

interface VercelRequest {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body?: AIRequestBody | string
}

interface VercelResponse {
  status: (code: number) => VercelResponse
  setHeader: (name: string, value: string) => void
  json: (data: unknown) => void
  end: (data?: unknown) => void
}

// ---------------------------------------------------------------------------
// モデル解決
// ---------------------------------------------------------------------------

const resolveModel = (modelId: string, apiKey: string) => {
  if (modelId.includes('gemini')) {
    const google = createGoogleGenerativeAI({ apiKey })
    return google(modelId)
  }
  const openai = createOpenAI({ apiKey })
  return openai(modelId)
}

const resolveMaxOutputTokens = (model: string, requested?: number): number => {
  if (typeof requested === 'number' && requested > 0 && requested <= 32000) {
    return requested
  }
  if (model.includes('nano')) return 4000
  if (model.includes('gpt-5') || model.includes('o1') || model.includes('o3')) {
    return 16000
  }
  return 4000
}

const toModelMessages = (
  payload: { role: string; content: string }[],
  system?: string
): ModelMessage[] => {
  const messages: ModelMessage[] = []
  if (system) {
    messages.push({ role: 'system', content: system })
  }
  for (const m of payload) {
    if (m.role === 'system') {
      messages.push({ role: 'system', content: m.content })
    } else if (m.role === 'assistant') {
      messages.push({ role: 'assistant', content: m.content })
    } else {
      messages.push({ role: 'user', content: m.content })
    }
  }
  return messages
}

const headerToString = (
  value: string | string[] | undefined
): string | undefined => {
  if (!value) return undefined
  if (Array.isArray(value)) return value[0]
  return value
}

// ---------------------------------------------------------------------------
// ハンドラー本体
// ---------------------------------------------------------------------------

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = headerToString(req.headers.origin)
  setCorsHeaders(res, origin)

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // Origin allowlist チェック（本番のみ）
  if (process.env.NODE_ENV === 'production' && !isAllowedOrigin(origin)) {
    res.status(403).json({ error: 'Origin not allowed', code: 'ORIGIN_DENIED' })
    return
  }

  // リクエストボディのパース
  let body: AIRequestBody
  try {
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body) as AIRequestBody
    } else if (req.body) {
      body = req.body
    } else {
      res.status(400).json({ error: 'Missing request body' })
      return
    }
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' })
    return
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' })
    return
  }

  const modelId = body.model || DEFAULT_MODEL

  // 自前 API キー（ヘッダー）— レート制限を免除
  const userApiKey = headerToString(req.headers['x-user-api-key'])

  // requiresUserKey モデルのサーバー側強制
  if (REQUIRES_USER_KEY_MODELS.has(modelId) && !userApiKey) {
    res.status(403).json({
      error: 'This model requires a user-provided API key',
      code: 'USER_KEY_REQUIRED',
    })
    return
  }

  let apiKey: string
  let usedSharedPool = false

  if (userApiKey) {
    apiKey = userApiKey
  } else {
    // 共有プール使用：env var からキーを取得
    const isGemini = modelId.includes('gemini')
    apiKey = isGemini
      ? process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        process.env.GEMINI_API_KEY ||
        ''
      : process.env.OPENAI_API_KEY || ''

    if (!apiKey) {
      res.status(500).json({
        error: 'Server API key not configured',
        code: 'SERVER_KEY_MISSING',
      })
      return
    }

    // 共有プール使用時のみレート制限を適用
    const identifier = getClientIdentifier(req)
    const result = await checkRateLimit(identifier)

    res.setHeader('X-RateLimit-Limit', String(result.limit))
    res.setHeader('X-RateLimit-Remaining', String(result.remaining))
    res.setHeader('X-RateLimit-Reset', String(result.reset))

    if (!result.success) {
      res.status(429).json({
        error: 'Daily quota exceeded',
        code: 'RATE_LIMIT',
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      })
      return
    }

    usedSharedPool = true
  }

  // AI SDK 呼び出し
  try {
    const model = resolveModel(modelId, apiKey)
    const result = await generateText({
      model,
      messages: toModelMessages(body.messages, body.system),
      maxOutputTokens: resolveMaxOutputTokens(modelId, body.maxOutputTokens),
      abortSignal: AbortSignal.timeout(45000),
    })

    res.status(200).json({
      text: result.text,
      finishReason: result.finishReason,
      usedSharedPool,
      sharedPoolLimit: usedSharedPool ? getDailyLimit() : undefined,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    const statusCode =
      error instanceof Error && error.name === 'TimeoutError' ? 504 : 502
    res.status(statusCode).json({
      error: message,
      code: statusCode === 504 ? 'TIMEOUT' : 'AI_PROVIDER_ERROR',
    })
  }
}
