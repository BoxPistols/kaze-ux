/**
 * デフォルト API キー利用時の 1 日あたり回数制限。
 *
 * 自分のキーを登録する利点が無いと、共有キーだけが使われてコストが読めない。
 * 「無制限に使えること」を自前キーの利点にする。
 *
 * 制限の対象はデフォルトキーを使っているときだけで、
 * - 自前キーを登録している人は無制限（現状維持）
 * - デフォルトキーが未設定（FAQ モード）は AI を呼ばないので対象外
 *
 * 記録はブラウザの localStorage なので、消せば回避できる。サーバーを
 * 持たない構成での抑止としてはこれが上限で、厳密な保証ではない。
 */

/** 1 日あたりの上限回数 */
export const DAILY_LIMIT = 30

export const USAGE_STORAGE_KEY = 'storybook_chat_usage'

export interface DailyUsage {
  /** ローカル日付 (YYYY-MM-DD)。日付が変われば自動的にリセットされる */
  date: string
  count: number
}

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
})

/**
 * 保存済みの利用状況を読む。日付が変わっていれば 0 から数え直す。
 *
 * 日付ごとに別キーを作ると、使わなくなった日付の分が localStorage に
 * 溜まり続ける。1 レコードだけ持って日付で判定する。
 */
export const readUsage = (now: Date = new Date()): DailyUsage => {
  if (typeof localStorage === 'undefined') return emptyUsage(now)
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
    if (usage.date !== localDateKey(now)) return emptyUsage(now)
    // 手で書き換えられていても負数や小数にはしない
    return { date: usage.date, count: Math.max(0, Math.floor(usage.count)) }
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
