import { describe, expect, it } from 'vitest'

import {
  EARTH_RADIUS_METERS,
  DEG_TO_RAD,
  RAD_TO_DEG,
  toRadians,
  toDegrees,
  calculateDistance,
  formatDistance,
  calculateTotalDistance,
  calculateEstimatedDuration,
  calculateBearing,
  formatBearing,
  isWithinRadius,
} from '../geomath'

describe('geomath', () => {
  describe('定数', () => {
    it('地球の半径が正しく定義されている', () => {
      expect(EARTH_RADIUS_METERS).toBe(6_371_000)
    })

    it('変換係数が正しく定義されている', () => {
      expect(DEG_TO_RAD).toBeCloseTo(Math.PI / 180)
      expect(RAD_TO_DEG).toBeCloseTo(180 / Math.PI)
    })
  })

  describe('toRadians', () => {
    it('度数をラジアンに正しく変換する', () => {
      expect(toRadians(0)).toBe(0)
      expect(toRadians(90)).toBeCloseTo(Math.PI / 2)
      expect(toRadians(180)).toBeCloseTo(Math.PI)
      expect(toRadians(360)).toBeCloseTo(2 * Math.PI)
    })
  })

  describe('toDegrees', () => {
    it('ラジアンを度数に正しく変換する', () => {
      expect(toDegrees(0)).toBe(0)
      expect(toDegrees(Math.PI / 2)).toBeCloseTo(90)
      expect(toDegrees(Math.PI)).toBeCloseTo(180)
      expect(toDegrees(2 * Math.PI)).toBeCloseTo(360)
    })
  })

  describe('calculateDistance', () => {
    it('同じ地点間の距離は0', () => {
      const result = calculateDistance(35.6762, 139.6503, 35.6762, 139.6503)
      expect(result).toBe(0)
    })

    it('東京駅から渋谷駅までの距離を正しく計算する（約3.3km）', () => {
      // 東京駅: 35.6812, 139.7671
      // 渋谷駅: 35.6580, 139.7016
      const result = calculateDistance(35.6812, 139.7671, 35.658, 139.7016)
      expect(result).toBeGreaterThan(6000) // 約6.5km
      expect(result).toBeLessThan(7500)
    })

    it('東京からニューヨークまでの距離を正しく計算する（約10,800km）', () => {
      // 東京: 35.6762, 139.6503
      // ニューヨーク: 40.7128, -74.0060
      const result = calculateDistance(35.6762, 139.6503, 40.7128, -74.006)
      expect(result).toBeGreaterThan(10_000_000) // 10,000km以上
      expect(result).toBeLessThan(11_500_000) // 11,500km未満
    })
  })

  describe('formatDistance', () => {
    it('nullはハイフンを返す', () => {
      expect(formatDistance(null)).toBe('-')
    })

    it('undefinedはハイフンを返す', () => {
      expect(formatDistance(undefined)).toBe('-')
    })

    it('1m未満は0mを返す', () => {
      expect(formatDistance(0.5)).toBe('0m')
    })

    it('1000m未満はメートル単位で返す', () => {
      expect(formatDistance(500)).toBe('500m')
      expect(formatDistance(999)).toBe('999m')
    })

    it('1000m以上はキロメートル単位で返す', () => {
      expect(formatDistance(1000)).toBe('1.0km')
      expect(formatDistance(1500)).toBe('1.5km')
      expect(formatDistance(10000)).toBe('10.0km')
    })
  })

  describe('calculateTotalDistance', () => {
    it('ウェイポイントが2つ未満の場合は0を返す', () => {
      expect(calculateTotalDistance([])).toBe(0)
      expect(
        calculateTotalDistance([{ latitude: 35.6762, longitude: 139.6503 }])
      ).toBe(0)
    })

    it('複数のウェイポイント間の総距離を計算する', () => {
      const waypoints = [
        { latitude: 35.6812, longitude: 139.7671 }, // 東京駅
        { latitude: 35.658, longitude: 139.7016 }, // 渋谷駅
        { latitude: 35.6895, longitude: 139.6917 }, // 新宿駅
      ]
      const result = calculateTotalDistance(waypoints)
      expect(result).toBeGreaterThan(10000) // 10km以上
    })
  })

  describe('calculateEstimatedDuration', () => {
    it('ウェイポイントが2つ未満の場合は0を返す', () => {
      expect(calculateEstimatedDuration([], 10)).toBe(0)
    })

    it('距離と速度から飛行時間を計算する', () => {
      const waypoints = [
        { latitude: 35.6812, longitude: 139.7671 },
        { latitude: 35.6812, longitude: 139.7772 }, // 約1km東
      ]
      const result = calculateEstimatedDuration(waypoints, 10) // 10m/s
      expect(result).toBeGreaterThan(50) // 100秒程度
      expect(result).toBeLessThan(200)
    })

    it('ホバリング時間を加算する', () => {
      const waypoints = [
        { latitude: 35.6812, longitude: 139.7671 },
        { latitude: 35.6812, longitude: 139.7671, hoverDuration: 60 },
      ]
      const result = calculateEstimatedDuration(waypoints, 10)
      expect(result).toBeGreaterThanOrEqual(60)
    })
  })

  describe('calculateBearing', () => {
    it('真北への方位角は0度', () => {
      const result = calculateBearing(35.0, 139.0, 36.0, 139.0)
      expect(result).toBeCloseTo(0, 0)
    })

    it('真東への方位角は約90度', () => {
      const result = calculateBearing(35.0, 139.0, 35.0, 140.0)
      expect(result).toBeCloseTo(90, 0)
    })

    it('真南への方位角は約180度', () => {
      const result = calculateBearing(36.0, 139.0, 35.0, 139.0)
      expect(result).toBeCloseTo(180, 0)
    })

    it('真西への方位角は約270度', () => {
      const result = calculateBearing(35.0, 140.0, 35.0, 139.0)
      expect(result).toBeCloseTo(270, 0)
    })
  })

  describe('formatBearing', () => {
    it('8方位を正しくフォーマットする', () => {
      expect(formatBearing(0)).toBe('北')
      expect(formatBearing(45)).toBe('北東')
      expect(formatBearing(90)).toBe('東')
      expect(formatBearing(135)).toBe('南東')
      expect(formatBearing(180)).toBe('南')
      expect(formatBearing(225)).toBe('南西')
      expect(formatBearing(270)).toBe('西')
      expect(formatBearing(315)).toBe('北西')
      expect(formatBearing(360)).toBe('北')
    })
  })

  describe('isWithinRadius', () => {
    it('範囲内の座標に対してtrueを返す', () => {
      // 中心から100m以内
      const result = isWithinRadius(35.6812, 139.7671, 35.6812, 139.7671, 100)
      expect(result).toBe(true)
    })

    it('範囲外の座標に対してfalseを返す', () => {
      // 東京駅と渋谷駅は約6.5km離れている
      const result = isWithinRadius(
        35.6812,
        139.7671, // 東京駅
        35.658,
        139.7016, // 渋谷駅
        1000 // 1km
      )
      expect(result).toBe(false)
    })
  })
})
