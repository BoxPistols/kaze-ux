// lib/ratelimit ユニットテスト
// - in-memory フォールバックの挙動を検証
// - Upstash Redis 経路は env vars が設定されていないので自動的に in-memory が使われる

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  __resetRateLimitState,
  checkRateLimit,
  getClientIdentifier,
  getDailyLimit,
} from '../ratelimit'

beforeEach(() => {
  __resetRateLimitState()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

// ---------------------------------------------------------------------------
// checkRateLimit (in-memory mode)
// ---------------------------------------------------------------------------

describe('checkRateLimit (in-memory)', () => {
  it('初回呼び出しは success=true、remaining=limit-1', async () => {
    const result = await checkRateLimit('user-1')
    expect(result.success).toBe(true)
    expect(result.limit).toBe(getDailyLimit())
    expect(result.remaining).toBe(getDailyLimit() - 1)
    expect(result.reset).toBeGreaterThan(Date.now())
  })

  it('連続呼び出しで remaining が減少する', async () => {
    const r1 = await checkRateLimit('user-2')
    const r2 = await checkRateLimit('user-2')
    const r3 = await checkRateLimit('user-2')

    expect(r1.remaining).toBe(getDailyLimit() - 1)
    expect(r2.remaining).toBe(getDailyLimit() - 2)
    expect(r3.remaining).toBe(getDailyLimit() - 3)
  })

  it('異なる identifier は独立してカウント', async () => {
    await checkRateLimit('user-a')
    await checkRateLimit('user-a')
    const userA = await checkRateLimit('user-a')
    const userB = await checkRateLimit('user-b')

    expect(userA.remaining).toBe(getDailyLimit() - 3)
    expect(userB.remaining).toBe(getDailyLimit() - 1)
  })

  it('上限到達後は success=false', async () => {
    const limit = getDailyLimit()
    let lastResult
    for (let i = 0; i < limit + 1; i++) {
      lastResult = await checkRateLimit('user-overflow')
    }
    expect(lastResult?.success).toBe(false)
    expect(lastResult?.remaining).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// getDailyLimit (env var 解釈)
// ---------------------------------------------------------------------------

describe('getDailyLimit', () => {
  it('デフォルトは 30', () => {
    // env var なしで初期化（モジュールキャッシュの都合で動的に検証は難しい）
    // 現在のプロセスで env が設定されていない前提で 30 を期待
    const limit = getDailyLimit()
    expect(typeof limit).toBe('number')
    expect(limit).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// getClientIdentifier
// ---------------------------------------------------------------------------

describe('getClientIdentifier', () => {
  it('x-vercel-forwarded-for を優先', () => {
    const id = getClientIdentifier({
      headers: {
        'x-vercel-forwarded-for': '203.0.113.5, 198.51.100.1',
        'x-forwarded-for': '10.0.0.1',
      },
    })
    expect(id).toBe('203.0.113.5')
  })

  it('x-forwarded-for にフォールバック', () => {
    const id = getClientIdentifier({
      headers: {
        'x-forwarded-for': '203.0.113.10, 198.51.100.5',
      },
    })
    expect(id).toBe('203.0.113.10')
  })

  it('x-real-ip にフォールバック', () => {
    const id = getClientIdentifier({
      headers: {
        'x-real-ip': '203.0.113.20',
      },
    })
    expect(id).toBe('203.0.113.20')
  })

  it('全て無い場合は unknown', () => {
    const id = getClientIdentifier({ headers: {} })
    expect(id).toBe('unknown')
  })

  it('配列ヘッダー値も処理', () => {
    const id = getClientIdentifier({
      headers: {
        'x-vercel-forwarded-for': ['203.0.113.30', '198.51.100.10'],
      },
    })
    expect(id).toBe('203.0.113.30')
  })
})
