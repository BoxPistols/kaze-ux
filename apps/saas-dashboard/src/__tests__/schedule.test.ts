// 予定フォームの検証と表示 ユニットテスト
//
// どちらも壊れても画面は出る。片方は押しても無反応、もう片方は数字が
// 静かにずれるので、テストが無いと「そういうものだろう」と読めてしまう。

import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'

import { formatDuration, isTimeOfDay } from '~/utils/schedule'

describe('isTimeOfDay', () => {
  it('HH:mm を受ける', () => {
    expect(isTimeOfDay('09:00')).toBe(true)
    expect(isTimeOfDay('00:00')).toBe(true)
    expect(isTimeOfDay('23:59')).toBe(true)
  })

  it('空文字を弾く（これが無反応の原因だった）', () => {
    expect(isTimeOfDay('')).toBe(false)
  })

  it('範囲外や形式違いを弾く', () => {
    expect(isTimeOfDay('24:00')).toBe(false)
    expect(isTimeOfDay('25:99')).toBe(false)
    expect(isTimeOfDay('9:00')).toBe(false)
    expect(isTimeOfDay('abc')).toBe(false)
  })

  it('dayjs の既定の解析はこれらを通してしまう（だから自前で見る）', () => {
    // 検証を解析器の寛容さに預けない理由を、実測として残す
    expect(dayjs('2026-03-08T').isValid()).toBe(true)
    expect(dayjs('2026-03-08T25:99').isValid()).toBe(true)
  })
})

describe('formatDuration', () => {
  it('1 時間未満は分だけで出す', () => {
    // 以前は時間側に下限 1 を掛けていたため 1h 30m と出ていた
    expect(formatDuration(30)).toBe('30m')
    expect(formatDuration(15)).toBe('15m')
    expect(formatDuration(59)).toBe('59m')
  })

  it('ちょうどの時間は時間だけで出す', () => {
    expect(formatDuration(60)).toBe('1h')
    expect(formatDuration(120)).toBe('2h')
  })

  it('端数があれば時間と分を並べる', () => {
    expect(formatDuration(90)).toBe('1h 30m')
    expect(formatDuration(135)).toBe('2h 15m')
  })

  it('0 分でも 0m とは出さない', () => {
    expect(formatDuration(0)).toBe('1m')
  })
})
