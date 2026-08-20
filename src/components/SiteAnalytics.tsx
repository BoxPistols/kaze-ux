import { Analytics } from '@vercel/analytics/react'

/**
 * Vercel Web Analytics。
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

export const SiteAnalytics = () => (
  <Analytics
    beforeSend={(event) => ({ ...event, url: foldHashRoute(event.url) })}
  />
)
