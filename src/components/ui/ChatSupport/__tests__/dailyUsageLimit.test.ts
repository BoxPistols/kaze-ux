// デフォルトAPIキーの日次利用制限 ユニットテスト

import { describe, it, expect, beforeEach } from 'vitest'

import {
  DAILY_LIMIT,
  USAGE_STORAGE_KEY,
  consumeUse,
  isLimitReached,
  isUsingDefaultKey,
  isUsingSharedQuota,
  limitReachedMessage,
  localDateKey,
  readUsage,
  remainingUses,
  resetUsage,
} from '../dailyUsageLimit'

const TODAY = new Date(2026, 7, 12, 10, 0, 0) // 2026-08-12 10:00 ローカル
const TOMORROW = new Date(2026, 7, 13, 0, 30, 0)

describe('localDateKey', () => {
  it('ローカル日付を YYYY-MM-DD で返す', () => {
    expect(localDateKey(TODAY)).toBe('2026-08-12')
  })

  it('UTC ではなくローカル日付で切る', () => {
    // JST の 8/12 8:00 は UTC では 8/11。toISOString() を使うと前日になる
    const morning = new Date(2026, 7, 12, 8, 0, 0)
    expect(localDateKey(morning)).toBe('2026-08-12')
    expect(localDateKey(morning)).not.toBe(
      morning.toISOString().slice(0, 10) === '2026-08-12'
        ? 'never'
        : morning.toISOString().slice(0, 10)
    )
  })
})

describe('日次カウント', () => {
  beforeEach(() => {
    resetUsage()
  })

  it('初期状態では 0 回・残りは上限いっぱい', () => {
    expect(readUsage(TODAY).count).toBe(0)
    expect(remainingUses(TODAY)).toBe(DAILY_LIMIT)
    expect(isLimitReached(TODAY)).toBe(false)
  })

  it('消費すると残りが減る', () => {
    expect(consumeUse(TODAY)).toBe(DAILY_LIMIT - 1)
    expect(consumeUse(TODAY)).toBe(DAILY_LIMIT - 2)
    expect(readUsage(TODAY).count).toBe(2)
  })

  it('上限ちょうどで到達判定になる（超過してからではない）', () => {
    for (let i = 0; i < DAILY_LIMIT - 1; i++) consumeUse(TODAY)
    expect(isLimitReached(TODAY)).toBe(false)
    consumeUse(TODAY)
    expect(isLimitReached(TODAY)).toBe(true)
    expect(remainingUses(TODAY)).toBe(0)
  })

  it('上限を超えても残りは負にならない', () => {
    for (let i = 0; i < DAILY_LIMIT + 5; i++) consumeUse(TODAY)
    expect(remainingUses(TODAY)).toBe(0)
  })

  it('日付が変わるとリセットされる', () => {
    for (let i = 0; i < DAILY_LIMIT; i++) consumeUse(TODAY)
    expect(isLimitReached(TODAY)).toBe(true)
    expect(isLimitReached(TOMORROW)).toBe(false)
    expect(remainingUses(TOMORROW)).toBe(DAILY_LIMIT)
  })

  it('日付ごとにキーを増やさず 1 レコードで持つ', () => {
    consumeUse(TODAY)
    consumeUse(TOMORROW)
    const keys = Object.keys(localStorage).filter((k) => k.includes('usage'))
    expect(keys).toEqual([USAGE_STORAGE_KEY])
  })
})

describe('壊れた保存値からの復帰', () => {
  beforeEach(() => {
    resetUsage()
  })

  it('JSON として壊れていても 0 から数え直す', () => {
    localStorage.setItem(USAGE_STORAGE_KEY, '{壊れている')
    expect(readUsage(TODAY).count).toBe(0)
    expect(isLimitReached(TODAY)).toBe(false)
  })

  it('型が違えば無視する', () => {
    localStorage.setItem(
      USAGE_STORAGE_KEY,
      JSON.stringify({ date: 1, count: 'x' })
    )
    expect(readUsage(TODAY).count).toBe(0)
  })

  it('負数や小数に書き換えられても正規化する', () => {
    localStorage.setItem(
      USAGE_STORAGE_KEY,
      JSON.stringify({ date: localDateKey(TODAY), count: -5 })
    )
    expect(readUsage(TODAY).count).toBe(0)
    localStorage.setItem(
      USAGE_STORAGE_KEY,
      JSON.stringify({ date: localDateKey(TODAY), count: 3.7 })
    )
    expect(readUsage(TODAY).count).toBe(3)
  })
})

describe('制限の対象判定', () => {
  it('デフォルトキーのまま使っていれば対象', () => {
    expect(isUsingDefaultKey('sk-default', 'sk-default')).toBe(true)
    expect(isUsingDefaultKey(undefined, 'sk-default')).toBe(true)
    expect(isUsingDefaultKey('', 'sk-default')).toBe(true)
  })

  it('自前キーを登録していれば対象外', () => {
    expect(isUsingDefaultKey('sk-mine', 'sk-default')).toBe(false)
  })

  it('デフォルトキーが未設定（FAQ モード）なら対象外', () => {
    // AI を呼ばないので数える意味がない。ここを対象にすると
    // FAQ しか使えない人にまで上限メッセージが出る
    expect(isUsingDefaultKey('', '')).toBe(false)
    expect(isUsingDefaultKey(undefined, '')).toBe(false)
  })
})

describe('上限メッセージ', () => {
  it('上限回数と設定への導線を含む', () => {
    const msg = limitReachedMessage()
    expect(msg).toContain(String(DAILY_LIMIT))
    expect(msg).toContain('API キー')
    expect(msg).toContain('設定')
  })
})

// ---------------------------------------------------------------------------
// isUsingSharedQuota — 共有枠（無料枠）を使っているかの判定
//
// 本番ビルドは既定キーを空にするため、既定キーとの一致では判定できない。
// バックエンドがキーを持つ場合、ブラウザ側にキーが無いのが正常な状態になる。
// ---------------------------------------------------------------------------

describe('isUsingSharedQuota', () => {
  it('自前キーがあれば対象外（バックエンド経由でも無制限）', () => {
    expect(isUsingSharedQuota('sk-own', '', true)).toBe(false)
    expect(isUsingSharedQuota('sk-own', 'sk-default', false)).toBe(false)
  })

  it('キーが無くバックエンド経由なら対象（本番の無料枠）', () => {
    // 既定キーが空でも共有枠は成立する。この経路が無いと本番で一度も数えない
    expect(isUsingSharedQuota('', '', true)).toBe(true)
    expect(isUsingSharedQuota(undefined, '', true)).toBe(true)
  })

  it('バックエンドが無くても既定キーが焼き込まれていれば対象（従来動作）', () => {
    expect(isUsingSharedQuota('', 'sk-default', false)).toBe(true)
    expect(isUsingSharedQuota('sk-default', 'sk-default', false)).toBe(true)
  })

  it('供給元がどこにも無ければ対象外（FAQ のみで AI を呼ばない）', () => {
    expect(isUsingSharedQuota('', '', false)).toBe(false)
    expect(isUsingSharedQuota(undefined, '', false)).toBe(false)
  })
})
