import { describe, expect, it } from 'vitest'

import {
  getBatteryLevel,
  getBatteryColor,
  getBatteryMuiColor,
  getBatteryIconName,
  getBatteryWarning,
  getBatteryLabel,
  BATTERY_THRESHOLDS,
} from '../batteryIndicators'

describe('batteryIndicators', () => {
  describe('BATTERY_THRESHOLDS', () => {
    it('正しいしきい値が定義されている', () => {
      expect(BATTERY_THRESHOLDS.excellent).toBe(80)
      expect(BATTERY_THRESHOLDS.good).toBe(60)
      expect(BATTERY_THRESHOLDS.medium).toBe(40)
      expect(BATTERY_THRESHOLDS.low).toBe(20)
    })
  })

  describe('getBatteryLevel', () => {
    it('80%以上はexcellentを返す', () => {
      expect(getBatteryLevel(100)).toBe('excellent')
      expect(getBatteryLevel(80)).toBe('excellent')
    })

    it('60-79%はgoodを返す', () => {
      expect(getBatteryLevel(79)).toBe('good')
      expect(getBatteryLevel(60)).toBe('good')
    })

    it('40-59%はmediumを返す', () => {
      expect(getBatteryLevel(59)).toBe('medium')
      expect(getBatteryLevel(40)).toBe('medium')
    })

    it('20-39%はlowを返す', () => {
      expect(getBatteryLevel(39)).toBe('low')
      expect(getBatteryLevel(20)).toBe('low')
    })

    it('20%未満はcriticalを返す', () => {
      expect(getBatteryLevel(19)).toBe('critical')
      expect(getBatteryLevel(0)).toBe('critical')
    })
  })

  describe('getBatteryColor', () => {
    it('各レベルに対して正しい色を返す', () => {
      expect(getBatteryColor(100)).toBe('#22c55e') // excellent - green
      expect(getBatteryColor(70)).toBe('#84cc16') // good - lime
      expect(getBatteryColor(50)).toBe('#eab308') // medium - yellow
      expect(getBatteryColor(30)).toBe('#f97316') // low - orange
      expect(getBatteryColor(10)).toBe('#ef4444') // critical - red
    })
  })

  describe('getBatteryMuiColor', () => {
    it('40%以上はsuccessを返す', () => {
      expect(getBatteryMuiColor(100)).toBe('success')
      expect(getBatteryMuiColor(40)).toBe('success')
    })

    it('20-39%はwarningを返す', () => {
      expect(getBatteryMuiColor(39)).toBe('warning')
      expect(getBatteryMuiColor(20)).toBe('warning')
    })

    it('20%未満はerrorを返す', () => {
      expect(getBatteryMuiColor(19)).toBe('error')
      expect(getBatteryMuiColor(0)).toBe('error')
    })
  })

  describe('getBatteryIconName', () => {
    it('各レベルに対して正しいアイコン名を返す', () => {
      expect(getBatteryIconName(100)).toBe('BatteryFull')
      expect(getBatteryIconName(90)).toBe('BatteryFull')
      expect(getBatteryIconName(80)).toBe('Battery80')
      expect(getBatteryIconName(60)).toBe('Battery60')
      expect(getBatteryIconName(40)).toBe('Battery30')
      expect(getBatteryIconName(20)).toBe('Battery20')
      expect(getBatteryIconName(10)).toBe('BatteryAlert')
    })
  })

  describe('getBatteryWarning', () => {
    it('30%以上は警告なしでnullを返す', () => {
      expect(getBatteryWarning(100)).toBeNull()
      expect(getBatteryWarning(30)).toBeNull()
    })

    it('20-29%は注意メッセージを返す', () => {
      const warning = getBatteryWarning(25)
      expect(warning).toContain('注意')
    })

    it('10-19%は帰還検討メッセージを返す', () => {
      const warning = getBatteryWarning(15)
      expect(warning).toContain('帰還')
    })

    it('10%未満は即時帰還メッセージを返す', () => {
      const warning = getBatteryWarning(5)
      expect(warning).toContain('即時帰還')
    })
  })

  describe('getBatteryLabel', () => {
    it('各レベルに対して正しいラベルを返す', () => {
      expect(getBatteryLabel(100)).toBe('十分')
      expect(getBatteryLabel(70)).toBe('良好')
      expect(getBatteryLabel(50)).toBe('普通')
      expect(getBatteryLabel(30)).toBe('低下')
      expect(getBatteryLabel(10)).toBe('危険')
    })
  })
})
