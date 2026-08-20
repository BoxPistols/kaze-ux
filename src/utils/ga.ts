/**
 * Google Analytics 4。
 *
 * ## Vercel Analytics と同じ数字が出るようにする
 *
 * 2 つの計測を並べる以上、**同じページが同じ名前で出ないと突き合わせられない**。
 * URL の正規化は `foldHashRoute` を共有し、`/saas/#/projects` は両方で
 * `/saas/projects` になる。
 *
 * ## 自動のページビューを切って、手で送る
 *
 * `send_page_view: false` にして、正規化した URL を自分で送る。既定のままだと
 * hash ルートの扱いが GA4 側の実装に委ねられ、Vercel 側とずれる。
 *
 * ## 測定 ID をコードに置く理由
 *
 * ID はページのソースに出るので秘密ではない。env 変数にすると**未設定のときに
 * 黙って無計測になる**（設定し忘れに気づけない）。定数なら grep で分かる。
 */
import { foldHashRoute } from '@/components/SiteAnalytics'

/** GA4 の測定 ID。`G-` + 英数字 */
export const GA_MEASUREMENT_ID = 'G-C017T9T5MS'

/** ID が実物に差し替わっているか。プレースホルダのままなら計測しない */
export const hasValidGaId = (id: string = GA_MEASUREMENT_ID): boolean =>
  /^G-[A-Z0-9]{6,}$/.test(id)

interface WindowWithGtag extends Window {
  // gtag.js は `arguments` オブジェクトを push する前提なので、
  // 要素の型は配列に限定できない
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}

const gtagWindow = (): WindowWithGtag | null =>
  typeof window === 'undefined' ? null : (window as WindowWithGtag)

let initialized = false

/** gtag.js を 1 度だけ読み込み、自動ページビューを切って初期化する */
export const initGa = (id: string = GA_MEASUREMENT_ID): boolean => {
  const w = gtagWindow()
  if (!w || initialized || !hasValidGaId(id)) return false
  initialized = true

  const layer: unknown[] = w.dataLayer || (w.dataLayer = [])
  // **`arguments` をそのまま push する。**配列に展開して push すると
  // gtag.js が処理せず、エラーも出ないまま無計測になる（実測で踏んだ）
  const gtag = function (...args: unknown[]): void {
    void args
    // eslint-disable-next-line prefer-rest-params
    layer.push(arguments)
  }
  w.gtag = gtag

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  document.head.appendChild(s)

  gtag('js', new Date())
  // 自動ページビューは切る。正規化した URL を sendPageView で送る
  gtag('config', id, { send_page_view: false })
  return true
}

/** 直前に送った URL。同じページを続けて送らないための記録 */
let lastSent: string | null = null

/**
 * 正規化した URL でページビューを送る。
 *
 * **同じ URL を続けて送らない。** `replaceState` を patch して拾っている
 * 以上、ルータが初期表示で同じ URL に replace すると 2 件に数えられる。
 *
 * 現状のアプリでこれが起きている観測は無い（sky-kaze の 2 件目は
 * `page_view` ではなく GA4 拡張計測の `scroll` だった）。**予防であって、
 * 実害の修正ではない。**
 */
export const sendPageView = (rawUrl?: string): void => {
  const w = gtagWindow()
  if (!w?.gtag) return
  const url = foldHashRoute(rawUrl ?? w.location.href)
  if (url === lastSent) return
  lastSent = url
  w.gtag('event', 'page_view', {
    page_location: url,
    page_title: document.title,
  })
}

/** テスト用。重複判定の記録を消す */
export const __resetPageViewState = (): void => {
  lastSent = null
}

/**
 * 任意のイベント。マーケ側で「AI チャットを開いた」「アプリへ遷移した」
 * のような行動を数えたくなったときの入口
 */
export const trackEvent = (
  name: string,
  params: Record<string, string | number | boolean> = {}
): void => {
  gtagWindow()?.gtag?.('event', name, params)
}
