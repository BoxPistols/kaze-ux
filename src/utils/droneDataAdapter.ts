/**
 * ドローンデータ変換アダプター
 * DroneFlightStatus から ExtendedDroneInfo への変換
 */

import type { DroneFlightStatus, ExtendedDroneInfo } from '@/types/utmTypes'

/**
 * DroneFlightStatus から ExtendedDroneInfo への変換アダプター
 * モックデータに存在しない情報は合理的なデフォルト値またはundefinedを設定
 *
 * @param drone - 変換対象のドローン飛行状態
 * @returns 拡張ドローン情報
 */
export function droneFlightStatusToExtended(
  drone: DroneFlightStatus
): ExtendedDroneInfo {
  return {
    // 基本情報
    droneId: drone.droneId,
    droneName: drone.droneName,
    modelName: 'DJI Matrice 300', // デフォルト値（将来的にドローンマスターデータから取得）
    juNumber: undefined, // モックデータに存在しないためundefined

    // バッテリ情報
    batteryLevel: drone.batteryLevel,
    batteryVoltage: undefined, // モックデータに存在しない（将来拡張）
    batteryTemperature: undefined, // モックデータに存在しない（将来拡張）

    // GPS情報（モックデータに存在しないため推定値）
    gps: {
      satelliteCount: 12, // デフォルト値（安定飛行中を想定）
      hdop: 0.8, // 良好な精度を想定
      vdop: 1.2,
      fixType: 'rtk_fixed', // RTK補正ありを想定
    },

    // 電波情報（signalStrengthを変換）
    signal: {
      lte: {
        rssi: convertSignalStrengthToRssi(drone.signalStrength),
        carrier: 'au',
      },
      // 2.4GHz/5.8GHzは将来拡張用にundefined
    },

    // 高度情報（altitudeを変換）
    altitude: {
      agl: drone.position.altitude, // 対地高度（実際の値）
      amsl: drone.position.altitude + 10, // 平均海抜（仮定：地上10m）
      relative: drone.position.altitude, // 相対高度（離陸地点基準）
    },

    // 位置情報
    position: {
      latitude: drone.position.latitude,
      longitude: drone.position.longitude,
      heading: drone.position.heading,
    },

    // 姿勢情報
    attitude: drone.position.attitude || {
      roll: 0,
      pitch: 0,
      yaw: drone.position.heading,
    },

    // フライトモード（型変換）
    flightMode: mapFlightMode(drone.flightMode),

    // タイムスタンプ
    lastUpdated: drone.position.timestamp,
  }
}

/**
 * 信号強度（0-100%）をRSSI値（dBm）に変換
 *
 * @param signalStrength 0-100の信号強度
 * @returns -30 (強) 〜 -120 (弱) dBmの範囲のRSSI値
 *
 * 変換式:
 * - 100% → -30dBm (excellent signal)
 * - 50% → -75dBm (good signal)
 * - 0% → -120dBm (poor signal)
 */
function convertSignalStrengthToRssi(signalStrength: number): number {
  // 線形補間: rssi = -30 - ((100 - signalStrength) / 100) * 90
  return -30 - ((100 - signalStrength) / 100) * 90
}

/**
 * DroneFlightStatusのflightModeをExtendedDroneInfoのflightModeに変換
 *
 * @param mode - DroneFlightStatusのフライトモード
 * @returns ExtendedDroneInfoのフライトモード
 */
function mapFlightMode(
  mode: DroneFlightStatus['flightMode']
): ExtendedDroneInfo['flightMode'] {
  const mapping: Record<
    DroneFlightStatus['flightMode'],
    ExtendedDroneInfo['flightMode']
  > = {
    manual: 'manual',
    auto: 'auto',
    rth: 'rth',
    hover: 'hover',
    landing: 'landing',
  }
  return mapping[mode] || 'unknown'
}
