/**
 * 空間インデックス（グリッドベース）
 *
 * ドローン間の衝突検知を最適化するためのユーティリティ。
 * O(n^2)の総当たり計算をO(n)に近づける。
 */

import type { DroneFlightStatus } from '../types/utmTypes'

// 1度あたりの距離（赤道基準、メートル）
const METERS_PER_DEGREE_LAT = 111_320

/**
 * 空間グリッドの型定義
 */
export interface SpatialGrid {
  /** セルサイズ（度単位） */
  cellSizeDegrees: number
  /** セルごとのドローンID */
  cells: Map<string, Set<string>>
  /** ドローンIDからセルキーへのマッピング */
  droneToCell: Map<string, string>
}

/**
 * セルキーを生成
 */
const getCellKey = (lng: number, lat: number, cellSize: number): string => {
  const cellX = Math.floor(lng / cellSize)
  const cellY = Math.floor(lat / cellSize)
  return `${cellX},${cellY}`
}

/**
 * 空間グリッドを作成
 *
 * @param drones ドローン一覧
 * @param cellSizeMeters セルサイズ（メートル単位、デフォルト500m）
 * @returns 空間グリッド
 */
export const createSpatialGrid = (
  drones: readonly DroneFlightStatus[],
  cellSizeMeters: number = 500
): SpatialGrid => {
  // メートルを度に変換（緯度による補正は簡略化）
  const cellSizeDegrees = cellSizeMeters / METERS_PER_DEGREE_LAT

  const cells = new Map<string, Set<string>>()
  const droneToCell = new Map<string, string>()

  for (const drone of drones) {
    const key = getCellKey(
      drone.position.longitude,
      drone.position.latitude,
      cellSizeDegrees
    )

    let cell = cells.get(key)
    if (!cell) {
      cell = new Set()
      cells.set(key, cell)
    }
    cell.add(drone.droneId)
    droneToCell.set(drone.droneId, key)
  }

  return { cellSizeDegrees, cells, droneToCell }
}

/**
 * 指定ドローンの近傍にあるドローンIDを取得
 *
 * @param grid 空間グリッド
 * @param drone 対象ドローン
 * @returns 近傍のドローンID一覧（自身を除く）
 */
export const getNearbyDroneIds = (
  grid: SpatialGrid,
  drone: DroneFlightStatus
): Set<string> => {
  const centerKey = getCellKey(
    drone.position.longitude,
    drone.position.latitude,
    grid.cellSizeDegrees
  )

  const [centerX, centerY] = centerKey.split(',').map(Number)
  const nearbyIds = new Set<string>()

  // 3x3グリッドをチェック（自セル + 隣接8セル）
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const neighborKey = `${centerX + dx},${centerY + dy}`
      const cellDrones = grid.cells.get(neighborKey)

      if (cellDrones) {
        for (const droneId of cellDrones) {
          if (droneId !== drone.droneId) {
            nearbyIds.add(droneId)
          }
        }
      }
    }
  }

  return nearbyIds
}

/**
 * 2点間の3D距離を計算（メートル単位）
 *
 * @param drone1 ドローン1
 * @param drone2 ドローン2
 * @returns 距離（メートル）
 */
export const calculate3DDistance = (
  drone1: DroneFlightStatus,
  drone2: DroneFlightStatus
): number => {
  const lat1 = drone1.position.latitude
  const lng1 = drone1.position.longitude
  const alt1 = drone1.position.altitude

  const lat2 = drone2.position.latitude
  const lng2 = drone2.position.longitude
  const alt2 = drone2.position.altitude

  // 緯度差をメートルに変換
  const latDiffMeters = (lat2 - lat1) * METERS_PER_DEGREE_LAT

  // 経度差をメートルに変換（緯度による補正）
  const avgLat = (lat1 + lat2) / 2
  const metersPerDegreeLng =
    METERS_PER_DEGREE_LAT * Math.cos((avgLat * Math.PI) / 180)
  const lngDiffMeters = (lng2 - lng1) * metersPerDegreeLng

  // 高度差
  const altDiffMeters = alt2 - alt1

  return Math.sqrt(latDiffMeters ** 2 + lngDiffMeters ** 2 + altDiffMeters ** 2)
}

/**
 * 衝突リスクの閾値
 */
export interface CollisionThresholds {
  /** 緊急（メートル） */
  emergency: number
  /** 警告（メートル） */
  warning: number
  /** 注意（メートル） */
  caution: number
}

/** デフォルトの衝突閾値 */
export const DEFAULT_COLLISION_THRESHOLDS: CollisionThresholds = {
  emergency: 50, // 50m以内
  warning: 100, // 100m以内
  caution: 200, // 200m以内
}

/**
 * 衝突リスクレベルを判定
 *
 * @param distance 距離（メートル）
 * @param thresholds 閾値設定
 * @returns リスクレベル（null = リスクなし）
 */
export const getCollisionRiskLevel = (
  distance: number,
  thresholds: CollisionThresholds = DEFAULT_COLLISION_THRESHOLDS
): 'emergency' | 'warning' | 'caution' | null => {
  if (distance <= thresholds.emergency) return 'emergency'
  if (distance <= thresholds.warning) return 'warning'
  if (distance <= thresholds.caution) return 'caution'
  return null
}

/**
 * 衝突リスク情報
 */
export interface CollisionCheckResult {
  drone1Id: string
  drone2Id: string
  distance: number
  riskLevel: 'emergency' | 'warning' | 'caution'
}

/**
 * 全ドローン間の衝突リスクをチェック（空間インデックス最適化版）
 *
 * @param drones ドローン一覧
 * @param thresholds 閾値設定
 * @param cellSizeMeters グリッドセルサイズ（デフォルト: cautionの閾値）
 * @returns 衝突リスク一覧
 */
export const checkAllCollisions = (
  drones: readonly DroneFlightStatus[],
  thresholds: CollisionThresholds = DEFAULT_COLLISION_THRESHOLDS,
  cellSizeMeters?: number
): CollisionCheckResult[] => {
  // 飛行中のドローンのみを対象
  const flyingDrones = drones.filter((d) => d.status === 'in_flight')

  if (flyingDrones.length < 2) return []

  // セルサイズはcaution閾値を基準に設定（近傍検索の効率化）
  const gridCellSize = cellSizeMeters ?? thresholds.caution

  // 空間グリッドを作成
  const grid = createSpatialGrid(flyingDrones, gridCellSize)

  // ドローンをMapに変換（高速アクセス用）
  const droneMap = new Map(flyingDrones.map((d) => [d.droneId, d]))

  // チェック済みペアを記録（重複防止）
  const checkedPairs = new Set<string>()
  const results: CollisionCheckResult[] = []

  for (const drone of flyingDrones) {
    const nearbyIds = getNearbyDroneIds(grid, drone)

    for (const otherId of nearbyIds) {
      // ペアキーを生成（順序を統一して重複防止）
      const pairKey =
        drone.droneId < otherId
          ? `${drone.droneId}:${otherId}`
          : `${otherId}:${drone.droneId}`

      if (checkedPairs.has(pairKey)) continue
      checkedPairs.add(pairKey)

      const otherDrone = droneMap.get(otherId)
      if (!otherDrone) continue

      const distance = calculate3DDistance(drone, otherDrone)
      const riskLevel = getCollisionRiskLevel(distance, thresholds)

      if (riskLevel) {
        results.push({
          drone1Id: drone.droneId,
          drone2Id: otherId,
          distance,
          riskLevel,
        })
      }
    }
  }

  // リスクレベル順（emergency > warning > caution）、距離順でソート
  const riskOrder = { emergency: 0, warning: 1, caution: 2 }
  results.sort((a, b) => {
    const levelDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
    if (levelDiff !== 0) return levelDiff
    return a.distance - b.distance
  })

  return results
}
