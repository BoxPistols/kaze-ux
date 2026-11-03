import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { useEffect } from 'react'

import { initGa, sendPageView } from '@/utils/ga'

/**
 * Vercel の計測 2 つ。Web Analytics（誰が何を見たか）と
 * Speed Insights（実ユーザーの体感速度）。
 *
 * 5 つの面（LP / Storybook / saas / kaze-eats / sky-kaze）が 1 つの Vercel
 * プロジェクトに同居しているので、パスを見ればどの面かが分かる。
 *
 * ## hash ルートを畳む理由
 *
 * saas と kaze-eats は `/#/projects` の形で画面を切り替える。hash は
 * サーバ側の集計で落ちうるので、**アプリを開いたことしか分からず、
 * どの画面を見たかが消える**。パス側に畳んでから送れば、扱いに依存せず
 * 画面単位で残る。
 *
 * Storybook は React 側では読み込まない。ストーリーは iframe の中で描画
 * されるため、ここに置くと iframe の遷移まで数えてしまう。外枠（manager）
 * にスクリプトを入れる方式を `.storybook/main.cjs` で採っている。
 */

/** `/saas/#/projects` → `/saas/projects` */
export const foldHashRoute = (rawUrl: string): string => {
  try {
    const url = new URL(rawUrl)
    if (!url.hash.startsWith('#/')) return rawUrl
    const base = url.pathname.replace(/\/$/, '')
    url.pathname = `${base}${url.hash.slice(1)}`
    url.hash = ''
    return url.toString()
  } catch {
    // URL として解釈できないものは触らずに通す
    return rawUrl
  }
}

/**
 * GA4。SPA のルート変更を自分で拾う。
 *
 * `history.pushState` はイベントを出さないので差し替える。`popstate` は
 * 戻る/進む、`hashchange` は hash だけの変更。**3 つとも要る。**
 * 1 つ落とすと、その経路の遷移だけが静かに数えられなくなる。
 */
const GoogleAnalytics = () => {
  useEffect(() => {
    if (!initGa()) return
    sendPageView()

    const notify = () => sendPageView()
    const origPush = history.pushState
    const origReplace = history.replaceState
    history.pushState = function (...args) {
      origPush.apply(this, args)
      notify()
    }
    history.replaceState = function (...args) {
      origReplace.apply(this, args)
      notify()
    }
    window.addEventListener('popstate', notify)
    window.addEventListener('hashchange', notify)

    return () => {
      history.pushState = origPush
      history.replaceState = origReplace
      window.removeEventListener('popstate', notify)
      window.removeEventListener('hashchange', notify)
    }
  }, [])
  return null
}

export const SiteAnalytics = () => (
  <>
    <Analytics
      beforeSend={(event) => ({ ...event, url: foldHashRoute(event.url) })}
    />
    {/* 実ユーザーの体感速度（LCP / CLS / INP）。訪問者が少ないうちは
        パーセンタイルがノイズになるので、極端な劣化の検知にとどめる */}
    <SpeedInsights />
    <GoogleAnalytics />
  </>
)
