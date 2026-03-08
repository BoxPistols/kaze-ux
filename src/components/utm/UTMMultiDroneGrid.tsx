'use client'

import { Box, Typography, Paper } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import React, { useMemo, useCallback, memo } from 'react'

import { UTMDroneTile } from './UTMDroneTile'
import { getDroneDisplayColor } from '../../utils/droneColors'
import { calculateDistance } from '../../utils/geomath'

import type { DroneFlightStatus, UTMAlert } from '../../types/utmTypes'

export interface UTMMultiDroneGridProps {
  // ドローンリスト
  drones: DroneFlightStatus[]
  // アラートリスト
  alerts?: UTMAlert[]
  // FPV映像URLマップ（ドローンIDをキー）
  fpvStreamUrls?: Map<string, string>
  // 選択中のドローンID
  selectedDroneId?: string
  // グリッドの列数
  columns?: 2 | 3
  // ドローン選択時のコールバック
  onDroneSelect?: (droneId: string) => void
  // ホームボタンクリック時のコールバック
  onHomeClick?: (droneId: string) => void
  // 3D地図を最後のセルに表示するか
  showMapInLastCell?: boolean
  // 3D地図コンポーネント（カスタムで渡す場合）
  mapComponent?: React.ReactNode
  // グリッドの高さ
  height?: number | string
}

const UTMMultiDroneGridComponent = ({
  drones,
  alerts = [],
  fpvStreamUrls = new Map(),
  selectedDroneId,
  columns = 2,
  onDroneSelect,
  onHomeClick,
  showMapInLastCell = false,
  mapComponent,
  height = '100%',
}: UTMMultiDroneGridProps) => {
  // アラートをドローンIDでグループ化したマップ（O(n)で事前計算）
  const alertsByDroneId = useMemo(() => {
    const map = new Map<string, typeof alerts>()
    for (const alert of alerts) {
      const existing = map.get(alert.droneId)
      if (existing) {
        existing.push(alert)
      } else {
        map.set(alert.droneId, [alert])
      }
    }
    return map
  }, [alerts])

  // ドローンごとのアラートを取得（O(1)ルックアップ）
  const getAlertsForDrone = useCallback(
    (droneId: string) => {
      return alertsByDroneId.get(droneId) || []
    },
    [alertsByDroneId]
  )

  // ドローンから次のウェイポイントまでの距離を計算
  const getDistanceToNextWP = useCallback(
    (drone: DroneFlightStatus, waypointIndex: number): number | undefined => {
      const waypoints = drone.plannedRoute?.waypoints
      if (!waypoints || waypoints.length === 0) return undefined

      // 現在のウェイポイントインデックス（0始まり）
      const currentWpIndex = Math.min(waypointIndex, waypoints.length - 1)
      const targetWaypoint = waypoints[currentWpIndex]
      if (!targetWaypoint) return undefined

      // ウェイポイントは [lng, lat] 形式
      const [targetLng, targetLat] = targetWaypoint
      return calculateDistance(
        drone.position.latitude,
        drone.position.longitude,
        targetLat,
        targetLng
      )
    },
    []
  )

  // グリッドのセル数を計算（地図を含む場合は1セル追加）
  const totalCells = useMemo(() => {
    const baseCells = drones.length
    if (showMapInLastCell && baseCells > 0) {
      // 列数で割り切れるようにセル数を調整
      const rows = Math.ceil((baseCells + 1) / columns)
      return rows * columns
    }
    return baseCells
  }, [drones.length, showMapInLastCell, columns])

  // 空セルの数
  const emptyCells = useMemo(() => {
    if (showMapInLastCell) {
      return totalCells - drones.length - 1
    }
    return Math.max(0, totalCells - drones.length)
  }, [totalCells, drones.length, showMapInLastCell])

  // ドローン切り替え
  const handlePrevious = useCallback(
    (currentIndex: number) => {
      if (drones.length <= 1) return
      const prevIndex =
        currentIndex === 0 ? drones.length - 1 : currentIndex - 1
      onDroneSelect?.(drones[prevIndex].droneId)
    },
    [drones, onDroneSelect]
  )

  const handleNext = useCallback(
    (currentIndex: number) => {
      if (drones.length <= 1) return
      const nextIndex =
        currentIndex === drones.length - 1 ? 0 : currentIndex + 1
      onDroneSelect?.(drones[nextIndex].droneId)
    },
    [drones, onDroneSelect]
  )

  if (drones.length === 0) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.900',
        }}>
        <Typography color='grey.500'>飛行中のドローンがありません</Typography>
      </Box>
    )
  }

  // 行数を計算
  const rows = Math.ceil(drones.length / columns)

  return (
    <Box
      sx={{
        height,
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        // 親の高さに合わせて行を均等に分割（minmax で最小サイズを確保しつつフィット）
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        gap: 1,
        p: 1,
        // ダーク/ライトモード対応: gapの背景色としてコントラストの高い色を使用
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'grey.800' : 'grey.400',
        overflow: 'hidden',
      }}>
      <AnimatePresence mode='popLayout'>
        {/* ドローンタイル */}
        {drones.map((drone, index) => (
          <motion.div
            key={drone.droneId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
            <UTMDroneTile
              drone={drone}
              alerts={getAlertsForDrone(drone.droneId)}
              fpvStreamUrl={fpvStreamUrls.get(drone.droneId)}
              isSelected={selectedDroneId === drone.droneId}
              onClick={() => onDroneSelect?.(drone.droneId)}
              onHomeClick={() => onHomeClick?.(drone.droneId)}
              onPrevious={() => handlePrevious(index)}
              onNext={() => handleNext(index)}
              nextWaypoint={
                drone.plannedRoute?.waypoints
                  ? Math.min(index + 2, drone.plannedRoute.waypoints.length)
                  : undefined
              }
              distanceToNextWP={getDistanceToNextWP(
                drone,
                drone.plannedRoute?.waypoints
                  ? Math.min(index + 1, drone.plannedRoute.waypoints.length - 1)
                  : 0
              )}
              droneColor={
                getDroneDisplayColor(drone.droneId, drone.plannedRoute?.color)
                  .main
              }
            />
          </motion.div>
        ))}

        {/* 3D地図セル */}
        {showMapInLastCell && (
          <motion.div
            key='map-cell'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ height: '100%', minHeight: 0 }}>
            <Paper
              sx={{
                height: '100%',
                minHeight: 0,
                bgcolor: 'grey.800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
              {mapComponent || (
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography color='grey.500' variant='body2'>
                    3D Map View
                  </Typography>
                  <Typography color='grey.600' variant='caption'>
                    Cesium / MapLibre
                  </Typography>
                </Box>
              )}
            </Paper>
          </motion.div>
        )}

        {/* 空セル（グリッドを埋めるため） */}
        {Array.from({ length: emptyCells }).map((_, index) => (
          <motion.div
            key={`empty-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ height: '100%', minHeight: 0 }}>
            <Paper
              sx={{
                height: '100%',
                minHeight: 0,
                bgcolor: 'grey.800',
                opacity: 0.3,
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  )
}

// 浅い比較でpropsの変更を検出
const arePropsEqual = (
  prevProps: UTMMultiDroneGridProps,
  nextProps: UTMMultiDroneGridProps
): boolean => {
  // ドローン数が変わった場合
  if (prevProps.drones.length !== nextProps.drones.length) return false

  // ドローンの状態が変わった場合
  for (let i = 0; i < prevProps.drones.length; i++) {
    const prev = prevProps.drones[i]
    const next = nextProps.drones[i]
    if (
      prev.droneId !== next.droneId ||
      prev.status !== next.status ||
      prev.position.latitude !== next.position.latitude ||
      prev.position.longitude !== next.position.longitude ||
      prev.batteryLevel !== next.batteryLevel
    ) {
      return false
    }
  }

  // 選択状態
  if (prevProps.selectedDroneId !== nextProps.selectedDroneId) return false

  // アラート数
  if (prevProps.alerts?.length !== nextProps.alerts?.length) return false

  // その他のprops
  if (prevProps.columns !== nextProps.columns) return false
  if (prevProps.showMapInLastCell !== nextProps.showMapInLastCell) return false

  return true
}

// React.memoでコンポーネントをラップ
export const UTMMultiDroneGrid = memo(UTMMultiDroneGridComponent, arePropsEqual)

export default UTMMultiDroneGrid
