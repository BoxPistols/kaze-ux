/**
 * 行動イベントの送信口。**GA4 と Vercel Analytics の両方に同じ名前で送る。**
 *
 * 片方にしか送らないと、後から突き合わせるときに数が合わない理由を
 * 追えなくなる。ページビューの URL 正規化を揃えているのと同じ理由。
 *
 * ## 名前をカタログで固定する理由
 *
 * GA4 は**未知のイベント名をそのまま新しいイベントとして受け入れる**。
 * `chat_opened` と `chatOpened` を書き分けると、警告も出ないまま 2 つの
 * イベントに割れて、どちらも実数より少ない数字になる。定数にすれば
 * 綴り違いはコンパイルで止まる。
 */
import { track } from '@vercel/analytics'

import { sendGaEvent } from './ga'

/**
 * 送るイベントの一覧。増やすときはここに足す。
 *
 * GA4 の規約に合わせて snake_case・40 文字以内。`isValidEventName` が検査する。
 */
export const ANALYTICS_EVENTS = {
  /** AI チャットを開いた */
  CHAT_OPENED: 'chat_opened',
  /** AI チャットを閉じた */
  CHAT_CLOSED: 'chat_closed',
  /** AI チャットに送信した */
  CHAT_MESSAGE_SENT: 'chat_message_sent',
  /** LP から各プロダクトへ移動した */
  PRODUCT_OPENED: 'product_opened',
  /** ドキュメント・外部リンクを開いた */
  EXTERNAL_LINK_OPENED: 'external_link_opened',
} as const

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]

/**
 * GA4 のイベント名の規約。英数字とアンダースコアのみ、英字始まり、40 文字以内。
 * 予約語（`page_view` 等）は自動計測と衝突するので使わない
 */
const RESERVED = new Set([
  'page_view',
  'session_start',
  'first_visit',
  'user_engagement',
  'scroll',
  'click',
])

export const isValidEventName = (name: string): boolean =>
  /^[a-z][a-z0-9_]{0,39}$/.test(name) && !RESERVED.has(name)

export type AnalyticsParams = Record<string, string | number | boolean>

/**
 * 行動イベントを送る。
 *
 * 名前が規約に反していたら**送らずに開発時だけ警告する**。黙って送ると
 * GA4 側に不正な名前のイベントが溜まり、あとから消せない。
 */
export const trackEvent = (
  name: AnalyticsEvent,
  params: AnalyticsParams = {}
): void => {
  if (!isValidEventName(name)) {
    if (import.meta.env.DEV) {
      console.warn(`[analytics] 規約に反するイベント名です: ${name}`)
    }
    return
  }
  sendGaEvent(name, params)
  try {
    track(name, params)
  } catch {
    // Vercel 側は配信元が Vercel でないと no-op。失敗しても GA4 は送れている
  }
}
