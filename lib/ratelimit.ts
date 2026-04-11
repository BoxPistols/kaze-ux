// レート制限
// - Upstash Redis 設定があれば slidingWindow で本番運用
// - 設定がない場合は in-memory フォールバック（開発専用）
// - IP ベース、X-Vercel-Forwarded-For を優先

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ---------------------------------------------------------------------------
// 設定
// ---------------------------------------------------------------------------

const DEFAULT_DAILY_LIMIT = 30
const DAILY_LIMIT = (() => {
  const raw = process.env.DAILY_LIMIT
  if (!raw) return DEFAULT_DAILY_LIMIT
  const parsed = parseInt(raw, 10)
  return Number.isNaN(parsed) || parsed <= 0 ? DEFAULT_DAILY_LIMIT : parsed
})()

// ---------------------------------------------------------------------------
// Upstash インスタンス（lazy init）
// ---------------------------------------------------------------------------

let cachedRatelimit: Ratelimit | null = null
let upstashAvailable: boolean | null = null

const getUpstashRatelimit = (): Ratelimit | null => {
  if (cachedRatelimit) return cachedRatelimit
  if (upstashAvailable === false) return null

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    upstashAvailable = false
    return null
  }

  try {
    const redis = new Redis({ url, token })
    cachedRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(DAILY_LIMIT, '1 d'),
      analytics: true,
      prefix: 'kaze-ux/ai',
    })
    upstashAvailable = true
    return cachedRatelimit
  } catch (error) {
    console.error('[ratelimit] Upstash 初期化失敗:', error)
    upstashAvailable = false
    return null
  }
}

// ---------------------------------------------------------------------------
// In-memory フォールバック（開発専用）
// ---------------------------------------------------------------------------

interface InMemoryEntry {
  count: number
  resetAt: number
}

const inMemoryStore = new Map<string, InMemoryEntry>()
const DAY_MS = 24 * 60 * 60 * 1000

const checkInMemory = (identifier: string): RateLimitResult => {
  const now = Date.now()
  const entry = inMemoryStore.get(identifier)

  if (!entry || entry.resetAt < now) {
    inMemoryStore.set(identifier, { count: 1, resetAt: now + DAY_MS })
    return {
      success: true,
      limit: DAILY_LIMIT,
      remaining: DAILY_LIMIT - 1,
      reset: now + DAY_MS,
    }
  }

  entry.count += 1
  return {
    success: entry.count <= DAILY_LIMIT,
    limit: DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - entry.count),
    reset: entry.resetAt,
  }
}

// ---------------------------------------------------------------------------
// 公開 API
// ---------------------------------------------------------------------------

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export const checkRateLimit = async (
  identifier: string
): Promise<RateLimitResult> => {
  const upstash = getUpstashRatelimit()

  if (upstash) {
    const result = await upstash.limit(identifier)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  }

  return checkInMemory(identifier)
}

export const getDailyLimit = (): number => DAILY_LIMIT

// ---------------------------------------------------------------------------
// クライアント識別子（IP）取得
// ---------------------------------------------------------------------------

interface RequestLike {
  headers: Record<string, string | string[] | undefined>
}

const headerToString = (
  value: string | string[] | undefined
): string | undefined => {
  if (!value) return undefined
  if (Array.isArray(value)) return value[0]
  return value
}

export const getClientIdentifier = (req: RequestLike): string => {
  // Vercel 環境では x-vercel-forwarded-for が最も信頼可能
  const vercelFwd = headerToString(req.headers['x-vercel-forwarded-for'])
  if (vercelFwd) return vercelFwd.split(',')[0].trim()

  // 標準フォールバック
  const xff = headerToString(req.headers['x-forwarded-for'])
  if (xff) return xff.split(',')[0].trim()

  const realIp = headerToString(req.headers['x-real-ip'])
  if (realIp) return realIp

  return 'unknown'
}

// ---------------------------------------------------------------------------
// テスト用ヘルパー
// ---------------------------------------------------------------------------

/** 内部状態をリセット（テスト専用） */
export const __resetRateLimitState = (): void => {
  inMemoryStore.clear()
  cachedRatelimit = null
  upstashAvailable = null
}
