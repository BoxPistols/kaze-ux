import { describe, expect, it } from 'vitest'

import { foldHashRoute } from '../SiteAnalytics'

describe('foldHashRoute', () => {
  // この関数が在る理由は「hash ルートの画面名を残すこと」。
  // 畳まなければ潰れてしまう入力が実在することを、まず示す
  it('畳まなければ同じパスに潰れる入力を、画面ごとに分ける', () => {
    const a = 'https://kaze-ux.vercel.app/saas/#/projects'
    const b = 'https://kaze-ux.vercel.app/saas/#/invoices'

    // 畳まないと pathname はどちらも /saas/
    expect(new URL(a).pathname).toBe(new URL(b).pathname)

    // 畳むと別々になる
    expect(new URL(foldHashRoute(a)).pathname).toBe('/saas/projects')
    expect(new URL(foldHashRoute(b)).pathname).toBe('/saas/invoices')
  })

  it('末尾スラッシュの有無で結果が変わらない', () => {
    const withSlash = foldHashRoute('https://x.test/kaze-eats/#/orders')
    const without = foldHashRoute('https://x.test/kaze-eats#/orders')
    expect(new URL(withSlash).pathname).toBe('/kaze-eats/orders')
    expect(new URL(without).pathname).toBe('/kaze-eats/orders')
  })

  it('hash が無い URL は変えない', () => {
    const url = 'https://kaze-ux.vercel.app/storybook/?path=/story/x--y'
    expect(foldHashRoute(url)).toBe(url)
  })

  it('ルート以外の hash（#features 等）は畳まない', () => {
    const url = 'https://kaze-ux.vercel.app/#features'
    expect(foldHashRoute(url)).toBe(url)
  })

  it('URL として解釈できないものは素通しする', () => {
    expect(foldHashRoute('not a url')).toBe('not a url')
  })
})
