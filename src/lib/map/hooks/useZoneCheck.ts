/**
 * useZoneCheck - ドローン位置のゾーン判定フック
 *
 * DID、飛行禁止区域、空港空域などの判定を行う
 */

import { useState, useEffect, useCallback, useRef } from 'react'

import { AirportService } from '../services/airports'
import { checkDIDArea, type DIDCheckResult } from '../services/didService'
import { NoFlyZoneService } from '../services/noFlyZones'

// ============================================
// Types
// ============================================

export interface ZoneCheckResult {
  /** DID判定結果 */
  did: DIDCheckResult | null
  /** 飛行禁止区域（レッドゾーン）内かどうか */
  inRedZone: boolean
  /** 要許可区域（イエローゾーン）内かどうか */
  inYellowZone: boolean
  /** 空港空域内かどうか */
  inAirportZone: boolean
  /** 最も厳しい制限レベル */
  restrictionLevel: 'none' | 'caution' | 'warning' | 'prohibited'
  /** 判定に使用したゾーン名 */
  zoneName: string | null
  /** 判定中かどうか */
  loading: boolean
  /** エラー */
  error: Error | null
}

export interface UseZoneCheckOptions {
  /** 判定を有効にするか */
  enabled?: boolean
  /** 判定間隔（ミリ秒） */
  debounceMs?: number
  /** DID判定を行うか */
  checkDID?: boolean
}

// ============================================
// Hook
// ============================================

/**
 * ドローン位置のゾーン判定を行うフック
 *
 * @param latitude 緯度
 * @param longitude 経度
 * @param options オプション
 */
export function useZoneCheck(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
  options: UseZoneCheckOptions = {}
): ZoneCheckResult {
  const {
    enabled = true,
    debounceMs = 500,
    checkDID: shouldCheckDID = true,
  } = options

  const [result, setResult] = useState<ZoneCheckResult>({
    did: null,
    inRedZone: false,
    inYellowZone: false,
    inAirportZone: false,
    restrictionLevel: 'none',
    zoneName: null,
    loading: false,
    error: null,
  })

  const lastCheckRef = useRef<{ lat: number; lng: number } | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const performCheck = useCallback(
    async (lat: number, lng: number) => {
      setResult((prev) => ({ ...prev, loading: true, error: null }))

      try {
        let didResult: DIDCheckResult | null = null

        // DID判定
        if (shouldCheckDID) {
          didResult = await checkDIDArea(lat, lng)
        }

        // 空港空域判定
        const airportCheck = AirportService.isInZone(lat, lng)
        const inAirportZone = airportCheck.inZone

        // 飛行禁止区域判定
        const noFlyCheck = NoFlyZoneService.isInNoFlyZone(lat, lng)
        const inRedZone = noFlyCheck.inZone && noFlyCheck.zone === 'red'
        const inYellowZone = noFlyCheck.inZone && noFlyCheck.zone === 'yellow'

        // 制限レベルを計算（最も厳しいものを適用）
        let restrictionLevel: 'none' | 'caution' | 'warning' | 'prohibited' =
          'none'
        let zoneName: string | null = null

        if (inRedZone) {
          restrictionLevel = 'prohibited'
          zoneName = noFlyCheck.facility?.name || '飛行禁止区域'
        } else if (inAirportZone) {
          restrictionLevel = 'warning'
          zoneName = airportCheck.airport?.name || '空港制限区域'
        } else if (inYellowZone) {
          restrictionLevel = 'warning'
          zoneName = noFlyCheck.facility?.name || '要許可区域'
        } else if (didResult?.isDID) {
          restrictionLevel = 'caution'
          zoneName = didResult.area || 'DID（人口集中地区）'
        }

        setResult({
          did: didResult,
          inRedZone,
          inYellowZone,
          inAirportZone,
          restrictionLevel,
          zoneName,
          loading: false,
          error: null,
        })
      } catch (error) {
        setResult((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        }))
      }
    },
    [shouldCheckDID]
  )

  useEffect(() => {
    if (!enabled || latitude == null || longitude == null) {
      return
    }

    // 座標が変わっていない場合はスキップ
    if (
      lastCheckRef.current &&
      lastCheckRef.current.lat === latitude &&
      lastCheckRef.current.lng === longitude
    ) {
      return
    }

    // デバウンス処理
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      lastCheckRef.current = { lat: latitude, lng: longitude }
      performCheck(latitude, longitude)
    }, debounceMs)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [enabled, latitude, longitude, debounceMs, performCheck])

  return result
}

/**
 * 複数ドローンのゾーン判定を行うフック
 */
export interface DroneZoneStatus {
  droneId: string
  result: ZoneCheckResult
}

export function useMultiDroneZoneCheck(
  drones: Array<{
    droneId: string
    latitude: number
    longitude: number
  }>,
  options: UseZoneCheckOptions = {}
): Map<string, ZoneCheckResult> {
  const {
    enabled = true,
    debounceMs = 1000,
    checkDID: shouldCheckDID = true,
  } = options

  const [results, setResults] = useState<Map<string, ZoneCheckResult>>(
    new Map()
  )
  const checkingRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!enabled || drones.length === 0) {
      return
    }

    const checkDrone = async (drone: {
      droneId: string
      latitude: number
      longitude: number
    }) => {
      if (checkingRef.current.has(drone.droneId)) {
        return
      }

      checkingRef.current.add(drone.droneId)

      try {
        let didResult: DIDCheckResult | null = null

        if (shouldCheckDID) {
          didResult = await checkDIDArea(drone.latitude, drone.longitude)
        }

        // 空港空域判定
        const airportCheck = AirportService.isInZone(
          drone.latitude,
          drone.longitude
        )
        const inAirportZone = airportCheck.inZone

        // 飛行禁止区域判定
        const noFlyCheck = NoFlyZoneService.isInNoFlyZone(
          drone.latitude,
          drone.longitude
        )
        const inRedZone = noFlyCheck.inZone && noFlyCheck.zone === 'red'
        const inYellowZone = noFlyCheck.inZone && noFlyCheck.zone === 'yellow'

        // 制限レベルを計算
        let restrictionLevel: ZoneCheckResult['restrictionLevel'] = 'none'
        let zoneName: string | null = null

        if (inRedZone) {
          restrictionLevel = 'prohibited'
          zoneName = noFlyCheck.facility?.name || '飛行禁止区域'
        } else if (inAirportZone) {
          restrictionLevel = 'warning'
          zoneName = airportCheck.airport?.name || '空港制限区域'
        } else if (inYellowZone) {
          restrictionLevel = 'warning'
          zoneName = noFlyCheck.facility?.name || '要許可区域'
        } else if (didResult?.isDID) {
          restrictionLevel = 'caution'
          zoneName = didResult.area || 'DID（人口集中地区）'
        }

        setResults((prev) => {
          const next = new Map(prev)
          next.set(drone.droneId, {
            did: didResult,
            inRedZone,
            inYellowZone,
            inAirportZone,
            restrictionLevel,
            zoneName,
            loading: false,
            error: null,
          })
          return next
        })
      } catch (error) {
        setResults((prev) => {
          const next = new Map(prev)
          next.set(drone.droneId, {
            did: null,
            inRedZone: false,
            inYellowZone: false,
            inAirportZone: false,
            restrictionLevel: 'none',
            zoneName: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          })
          return next
        })
      } finally {
        checkingRef.current.delete(drone.droneId)
      }
    }

    // デバウンスして一括チェック
    const timer = setTimeout(() => {
      drones.forEach(checkDrone)
    }, debounceMs)

    return () => {
      clearTimeout(timer)
    }
  }, [enabled, drones, debounceMs, shouldCheckDID])

  return results
}

export default useZoneCheck
