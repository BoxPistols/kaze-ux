import { describe, expect, it } from 'vitest'

import {
  getSignalLevel,
  getSignalColor,
  getSignalMuiColor,
  getSignalIconName,
  getSignalWarning,
  getSignalLabel,
  SIGNAL_THRESHOLDS,
} from '../signalIndicators'

describe('signalIndicators', () => {
  describe('SIGNAL_THRESHOLDS', () => {
    it('正しいしきい値が定義されている', () => {
      expect(SIGNAL_THRESHOLDS.excellent).toBe(80)
      expect(SIGNAL_THRESHOLDS.good).toBe(60)
      expect(SIGNAL_THRESHOLDS.fair).toBe(40)
      expect(SIGNAL_THRESHOLDS.weak).toBe(20)
    })
  })

  describe('getSignalLevel', () => {
    it('80%以上はexcellentを返す', () => {
      expect(getSignalLevel(100)).toBe('excellent')
      expect(getSignalLevel(80)).toBe('excellent')
    })

    it('60-79%はgoodを返す', () => {
      expect(getSignalLevel(79)).toBe('good')
      expect(getSignalLevel(60)).toBe('good')
    })

    it('40-59%はfairを返す', () => {
      expect(getSignalLevel(59)).toBe('fair')
      expect(getSignalLevel(40)).toBe('fair')
    })

    it('20-39%はweakを返す', () => {
      expect(getSignalLevel(39)).toBe('weak')
      expect(getSignalLevel(20)).toBe('weak')
    })

    it('20%未満はofflineを返す', () => {
      expect(getSignalLevel(19)).toBe('offline')
      expect(getSignalLevel(0)).toBe('offline')
    })
  })

  describe('getSignalColor', () => {
    it('各レベルに対して正しい色を返す', () => {
      expect(getSignalColor(100)).toBe('#22c55e') // excellent - green
      expect(getSignalColor(70)).toBe('#84cc16') // good - lime
      expect(getSignalColor(50)).toBe('#eab308') // fair - yellow
      expect(getSignalColor(30)).toBe('#f97316') // weak - orange
      expect(getSignalColor(10)).toBe('#ef4444') // offline - red
    })
  })

  describe('getSignalMuiColor', () => {
    it('40%以上はsuccessを返す', () => {
      expect(getSignalMuiColor(100)).toBe('success')
      expect(getSignalMuiColor(40)).toBe('success')
    })

    it('20-39%はwarningを返す', () => {
      expect(getSignalMuiColor(39)).toBe('warning')
      expect(getSignalMuiColor(20)).toBe('warning')
    })

    it('20%未満はerrorを返す', () => {
      expect(getSignalMuiColor(19)).toBe('error')
      expect(getSignalMuiColor(0)).toBe('error')
    })
  })

  describe('getSignalIconName', () => {
    it('各レベルに対して正しいアイコン名を返す', () => {
      expect(getSignalIconName(100)).toBe('SignalCellular4Bar')
      expect(getSignalIconName(80)).toBe('SignalCellular4Bar')
      expect(getSignalIconName(70)).toBe('SignalCellular3Bar')
      expect(getSignalIconName(50)).toBe('SignalCellular2Bar')
      expect(getSignalIconName(30)).toBe('SignalCellular1Bar')
      expect(getSignalIconName(10)).toBe('SignalCellularOff')
    })
  })

  describe('getSignalWarning', () => {
    it('40%以上は警告なしでnullを返す', () => {
      expect(getSignalWarning(100)).toBeNull()
      expect(getSignalWarning(40)).toBeNull()
    })

    it('20-39%は信号低下メッセージを返す', () => {
      const warning = getSignalWarning(30)
      expect(warning).toContain('低下')
    })

    it('10-19%は不安定メッセージを返す', () => {
      const warning = getSignalWarning(15)
      expect(warning).toContain('不安定')
    })

    it('10%未満は接続断メッセージを返す', () => {
      const warning = getSignalWarning(5)
      expect(warning).toContain('接続断')
    })
  })

  describe('getSignalLabel', () => {
    it('各レベルに対して正しいラベルを返す', () => {
      expect(getSignalLabel(100)).toBe('非常に良好')
      expect(getSignalLabel(70)).toBe('良好')
      expect(getSignalLabel(50)).toBe('普通')
      expect(getSignalLabel(30)).toBe('弱い')
      expect(getSignalLabel(10)).toBe('オフライン')
    })
  })
})
