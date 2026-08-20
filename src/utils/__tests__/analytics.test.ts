import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ANALYTICS_EVENTS, isValidEventName, trackEvent } from '../analytics'

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }))

describe('ANALYTICS_EVENTS', () => {
  // 綴りがぶれると GA4 側で別イベントに割れ、どちらも実数より少なくなる。
  // カタログの値がすべて規約を満たすことを、増やすたびに検査する
  it('すべて GA4 の規約を満たす', () => {
    const names = Object.values(ANALYTICS_EVENTS)
    expect(names.length).toBeGreaterThan(0)
    for (const n of names) {
      expect(isValidEventName(n), `${n} が規約に反する`).toBe(true)
    }
  })

  it('重複した名前が無い', () => {
    const names = Object.values(ANALYTICS_EVENTS)
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('isValidEventName', () => {
  it('GA4 の自動計測と衝突する名前を弾く', () => {
    // 予約語を自分で送ると、自動計測ぶんと混ざって数字が読めなくなる
    for (const n of ['page_view', 'session_start', 'scroll', 'click']) {
      expect(isValidEventName(n), n).toBe(false)
    }
  })

  it('書式違反を弾く', () => {
    expect(isValidEventName('chatOpened')).toBe(false) // camelCase
    expect(isValidEventName('chat opened')).toBe(false) // 空白
    expect(isValidEventName('1chat')).toBe(false) // 数字始まり
    expect(isValidEventName('a'.repeat(41))).toBe(false) // 40 文字超
    expect(isValidEventName('chat_opened')).toBe(true)
  })
})

describe('trackEvent', () => {
  beforeEach(() => {
    ;(window as unknown as { dataLayer?: unknown[] }).dataLayer = []
    ;(window as unknown as { gtag?: (...a: unknown[]) => void }).gtag = (
      ...a: unknown[]
    ) => {
      ;(window as unknown as { dataLayer: unknown[] }).dataLayer.push(a)
    }
  })

  it('カタログの名前は送る', () => {
    trackEvent(ANALYTICS_EVENTS.CHAT_OPENED)
    expect(
      (window as unknown as { dataLayer: unknown[] }).dataLayer
    ).toHaveLength(1)
  })

  it('規約に反する名前は送らない', () => {
    // 型では止まるが、実行時に外から渡された場合も送らない
    trackEvent('page_view' as never)
    expect(
      (window as unknown as { dataLayer: unknown[] }).dataLayer
    ).toHaveLength(0)
  })
})
