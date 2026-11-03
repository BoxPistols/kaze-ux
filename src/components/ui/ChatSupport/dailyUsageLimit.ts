/**
 * 共有枠 (無料枠) 利用時の 1 日あたり回数制限。
 *
 * 自分のキーを登録する利点が無いと、共有キーだけが使われてコストが読めない。
 * 「無制限に使えること」を自前キーの利点にする。
 *
 * 制限の対象は共有枠を使っているときだけで、
 * - 自前キーを登録している人は無制限（現状維持）
 * - 共有枠の供給元がどこにも無ければ AI を呼ばないので対象外（FAQ モード）
 *
 * 記録はブラウザの localStorage に置く。バックエンド (api/ai.ts) は存在するが
 * 共有ストレージを持たないため、サーバー側に「利用者ごとの通算回数」を置けない
 * (Vercel のサーバーレスは呼び出しごとにインスタンスが変わり、in-memory の
 * カウンタは残らない)。
 *
 * したがってこの上限が止められるのは通常利用だけで、シークレットウィンドウを
 * 開けば新しい 20 回が始まる。請求額の天井は OpenAI 側の予算上限で設ける。
 */

/** 1 日あたりの上限回数 */
export const DAILY_LIMIT = 20

export const USAGE_STORAGE_KEY = 'storybook_chat_usage'

export interface DailyUsage {
  /** ローカル日付 (YYYY-MM-DD)。日付が変われば自動的にリセットされる */
  date: string
  count: number
  /**
   * この記録を作った日 (YYYY-MM-DD)。
   *
   * 日付が変わればカウントは 0 に戻るが、**localStorage の項目自体は
   * 残り続ける**。使わなくなった端末にいつまでも痕跡を置かないよう、
   * 一定期間が過ぎたら項目ごと消して作り直す
   */
  since?: string
}

/**
 * 記録を保持する日数。これを超えたら localStorage の項目ごと消す。
 *
 * 上限は 1 日単位なので、保持しても意味があるのは当日分だけ。
 * それでも数日は残す（日付をまたぐ利用や時計のずれで、消しすぎると
 * 上限がすり抜ける）。1 週間を目安にする
 */
export const USAGE_RETENTION_DAYS = 7

/**
 * ローカル日付を YYYY-MM-DD で返す。
 *
 * toISOString() は UTC に寄せるため、日本時間の朝 9 時より前が前日扱いに
 * なる。利用者から見た「日付が変わったらリセット」と食い違うので使わない。
 */
export const localDateKey = (now: Date = new Date()): string => {
  const y = now.getFullYear()
  const m = `${now.getMonth() + 1}`.padStart(2, '0')
  const d = `${now.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

const emptyUsage = (now?: Date): DailyUsage => ({
  date: localDateKey(now),
  count: 0,
  since: localDateKey(now),
})

/** YYYY-MM-DD 同士の日数差。パースできなければ「古い」とみなす */
const daysBetween = (from: string | undefined, to: string): number => {
  if (!from) return Number.POSITIVE_INFINITY
  const a = Date.parse(`${from}T00:00:00`)
  const b = Date.parse(`${to}T00:00:00`)
  if (Number.isNaN(a) || Number.isNaN(b)) return Number.POSITIVE_INFINITY
  return Math.floor((b - a) / (24 * 60 * 60 * 1000))
}

/**
 * 保持期間を過ぎた記録を localStorage から消す。
 *
 * 日付が変わればカウントは 0 に戻るが、**項目そのものは残り続ける**。
 * 使わなくなった端末に痕跡を置き続けないよう、期間を過ぎたら項目ごと消す。
 *
 * 戻り値は「消したか」。読み取り側はこの後 emptyUsage から数え直す
 */
export const pruneExpiredUsage = (now: Date = new Date()): boolean => {
  if (typeof localStorage === 'undefined') return false
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY)
    if (!raw) return false
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) {
      localStorage.removeItem(USAGE_STORAGE_KEY)
      return true
    }
    const since = (parsed as DailyUsage).since ?? (parsed as DailyUsage).date
    if (daysBetween(since, localDateKey(now)) < USAGE_RETENTION_DAYS) {
      return false
    }
    localStorage.removeItem(USAGE_STORAGE_KEY)
    return true
  } catch {
    // 壊れているなら残しておく理由が無い
    try {
      localStorage.removeItem(USAGE_STORAGE_KEY)
    } catch {
      /* localStorage 自体が使えない */
    }
    return true
  }
}

/**
 * 保存済みの利用状況を読む。日付が変わっていれば 0 から数え直す。
 *
 * 日付ごとに別キーを作ると、使わなくなった日付の分が localStorage に
 * 溜まり続ける。1 レコードだけ持って日付で判定する。
 */
export const readUsage = (now: Date = new Date()): DailyUsage => {
  if (typeof localStorage === 'undefined') return emptyUsage(now)
  // 期限切れの記録は読む前に消す。読み取りのたびに掃除されるので、
  // 別途スケジューラを持たなくてよい
  pruneExpiredUsage(now)
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY)
    if (!raw) return emptyUsage(now)
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as DailyUsage).date !== 'string' ||
      typeof (parsed as DailyUsage).count !== 'number' ||
      !Number.isFinite((parsed as DailyUsage).count)
    ) {
      return emptyUsage(now)
    }
    const usage = parsed as DailyUsage
    if (usage.date !== localDateKey(now)) {
      // 日付だけ変わった場合は since を引き継ぐ（保持期間の起点を保つ）
      return { ...emptyUsage(now), since: usage.since ?? usage.date }
    }
    // 手で書き換えられていても負数や小数にはしない
    return {
      date: usage.date,
      count: Math.max(0, Math.floor(usage.count)),
      since: usage.since ?? usage.date,
    }
  } catch {
    return emptyUsage(now)
  }
}

const writeUsage = (usage: DailyUsage): void => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage))
  } catch {
    // プライベートモード等で書けなくても送信自体は止めない
  }
}

/** 残り回数（0 未満にはしない） */
export const remainingUses = (now: Date = new Date()): number =>
  Math.max(0, DAILY_LIMIT - readUsage(now).count)

/** 上限に達しているか */
export const isLimitReached = (now: Date = new Date()): boolean =>
  readUsage(now).count >= DAILY_LIMIT

/**
 * 1 回分を消費して、消費後の残り回数を返す。
 *
 * API を呼ぶ直前に数える。成功時だけ数えると、失敗が返り続ける状況で
 * 上限が効かず、コストを抑えるという目的を果たせない。
 */
export const consumeUse = (now: Date = new Date()): number => {
  const usage = readUsage(now)
  const next = { date: usage.date, count: usage.count + 1 }
  writeUsage(next)
  return Math.max(0, DAILY_LIMIT - next.count)
}

/** テストと「リセット」操作用 */
export const resetUsage = (): void => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(USAGE_STORAGE_KEY)
  } catch {
    // ignore
  }
}

/**
 * デフォルトキー（＝制限対象）で動いているか。
 *
 * defaultApiKey が空のときは AI を呼ばない FAQ モードなので対象外。
 */
export const isUsingDefaultKey = (
  apiKey: string | undefined,
  defaultApiKey: string
): boolean => Boolean(defaultApiKey) && (!apiKey || apiKey === defaultApiKey)

/**
 * 共有枠（無料枠）を使っているかどうか。回数制限の対象はこれ。
 *
 * `isUsingDefaultKey` はバンドルに焼き込まれた既定キーがある前提の判定で、
 * 本番ビルドでは既定キーを空にしているため常に false になる。バックエンド
 * 経由ではキーはサーバーが持っていてブラウザからは見えないので、
 * 「既定キーと一致するか」では判定できない。
 *
 * 判定はこの 2 段:
 *   1. 自前キーを登録している → 無制限（対象外）
 *   2. そうでなく、共有枠の供給元がある（バックエンド経由 or 既定キーあり）→ 対象
 */
export const isUsingSharedQuota = (
  apiKey: string | undefined,
  defaultApiKey: string,
  backendMode: boolean
): boolean => {
  const hasOwnKey = Boolean(apiKey) && apiKey !== defaultApiKey
  if (hasOwnKey) return false
  return backendMode || Boolean(defaultApiKey)
}

/** 上限到達時に出す案内文 */
export const limitReachedMessage = (): string =>
  [
    `**本日の無料利用（${DAILY_LIMIT} 回/日）を使い切りました。**`,
    '',
    '設定から自分の API キーを登録すると、回数制限なしで利用できます。',
    'キーはブラウザの localStorage にのみ保存され、送信先は選んだプロバイダーだけです。',
    '',
    `カウントは日付が変わるとリセットされます（現在: ${localDateKey()}）。`,
  ].join('\n')
