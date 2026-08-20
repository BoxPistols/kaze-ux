import { beforeEach, describe, expect, it } from 'vitest'

import { foldHashRoute } from '@/components/SiteAnalytics'
import {
  GA_MEASUREMENT_ID,
  __resetPageViewState,
  hasValidGaId,
  sendPageView,
  trackEvent,
} from '../ga'

describe('GA_MEASUREMENT_ID', () => {
  it('プレースホルダのままではない', () => {
    // 差し替え忘れると本番で無計測のまま気づけない
    expect(GA_MEASUREMENT_ID).not.toContain('MEASUREMENT')
    expect(hasValidGaId(GA_MEASUREMENT_ID)).toBe(true)
  })

  it('形式が違うものは弾く', () => {
    expect(hasValidGaId('')).toBe(false)
    expect(hasValidGaId('UA-12345-1')).toBe(false)
    expect(hasValidGaId('GTM-ABCDEF')).toBe(false)
    expect(hasValidGaId('G-abc')).toBe(false)
  })
})

describe('sendPageView', () => {
  beforeEach(() => {
    __resetPageViewState()
    ;(window as unknown as { dataLayer?: unknown[] }).dataLayer = []
    ;(window as unknown as { gtag?: (...a: unknown[]) => void }).gtag = (
      ...a: unknown[]
    ) => {
      ;(window as unknown as { dataLayer: unknown[] }).dataLayer.push(a)
    }
  })

  // GA4 と Vercel で同じページが同じ名前で出ないと突き合わせられない。
  // 正規化を共有していることを、実際の送信値で示す
  it('Vercel 側と同じ正規化を通す', () => {
    const raw = 'https://kaze-ux.vercel.app/saas/#/projects'
    sendPageView(raw)
    const sent = (window as unknown as { dataLayer: unknown[][] }).dataLayer[0]
    const params = sent[2] as { page_location: string }

    expect(params.page_location).toBe(foldHashRoute(raw))
    expect(new URL(params.page_location).pathname).toBe('/saas/projects')
  })

  // replaceState を patch して拾う以上、同じ URL への replace が
  // 2 件になりうる。予防的な抑止（実害の観測はまだ無い）
  it('同じ URL を続けて送らない', () => {
    const url = 'https://kaze-ux.vercel.app/sky-kaze/'
    sendPageView(url)
    sendPageView(url)
    const layer = (window as unknown as { dataLayer: unknown[] }).dataLayer
    expect(layer).toHaveLength(1)
  })

  it('別の URL なら送る', () => {
    sendPageView('https://kaze-ux.vercel.app/saas/#/dashboard')
    sendPageView('https://kaze-ux.vercel.app/saas/#/projects')
    const layer = (window as unknown as { dataLayer: unknown[] }).dataLayer
    expect(layer).toHaveLength(2)
  })

  it('gtag が無いときは何も送らずに落ちない', () => {
    ;(window as unknown as { gtag?: unknown }).gtag = undefined
    expect(() => sendPageView('https://x.test/')).not.toThrow()
  })
})

describe('trackEvent', () => {
  it('gtag が無いときは落ちない', () => {
    ;(window as unknown as { gtag?: unknown }).gtag = undefined
    expect(() => trackEvent('chat_opened')).not.toThrow()
  })
})
