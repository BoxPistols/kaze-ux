/**
 * UTMダッシュボードプロトタイプ
 * 全UTMコンポーネントを統合したデモページ
 */
import { Box, Grid, Paper, alpha, useTheme } from '@mui/material'
import { useState, useEffect, useCallback } from 'react'

import UTMAlertPanel from '@/components/utm/UTMAlertPanel'
import UTMDroneListPanel from '@/components/utm/UTMDroneListPanel'
import UTMDroneStatusWidget from '@/components/utm/UTMDroneStatusWidget'
import { UTMFlightTimeline } from '@/components/utm/UTMFlightTimeline'
import UTMForecastTimeline from '@/components/utm/UTMForecastTimeline'
import UTMToastNotification, {
  useToastNotifications,
} from '@/components/utm/UTMToastNotification'
import UTMTrackingMap from '@/components/utm/UTMTrackingMap'
import UTMWeatherWidget from '@/components/utm/UTMWeatherWidget'

import {
  createMockDrones,
  createMockRestrictedZones,
  createMockAlerts,
  createMockWeatherData,
  generateFpvUrlMap,
  updateDronePositions,
} from '../../../utils/utmMockData'

import type { DroneFlightStatus, UTMAlert } from '../../../types/utmTypes'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Components/UTM/UTMDashboardDemo',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## UTM監視ダッシュボード プロトタイプ

全UTMコンポーネントを統合したインタラクティブなプロトタイプデモです。

### 主な機能
- リアルタイムドローン位置追跡（シミュレーション）
- マップスタイル切り替え（ライト/ダーク/ボイジャー）
- ドローン選択とステータス詳細表示
- アラート通知システム
- 気象情報と飛行条件表示
- フライトタイムライン表示

### 操作方法
1. マップ上のドローンマーカーをクリックして選択
2. 左サイドパネルのドローンリストから選択
3. 右上のマップアイコンでマップスタイルを切り替え
4. アラートパネルで警告を確認・確認済みにする

### 注意事項
このプロトタイプはモックデータを使用しており、実際のバックエンドとは接続していません。
デザイン議論とUX検証のためのプロトタイプです。
        `,
      },
    },
  },
  tags: ['autodocs', 'prototype'],
}

export default meta
type Story = StoryObj

// ダッシュボードコンポーネント
const UTMDashboard = () => {
  const theme = useTheme()

  // ドローンデータ
  const [drones, setDrones] = useState<DroneFlightStatus[]>(() =>
    createMockDrones(4)
  )
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null)

  // アラート
  const [alerts, setAlerts] = useState<UTMAlert[]>(() =>
    createMockAlerts(drones.map((d) => d.droneId))
  )

  // FPV映像URL（将来のFPV表示機能で使用）
  const fpvUrls = generateFpvUrlMap(drones.map((d) => d.droneId))
  void fpvUrls // 将来のFPV表示機能で使用

  // 気象データ
  const weather = createMockWeatherData()

  // トースト通知
  const { notifications, removeNotification, notifyAlert } =
    useToastNotifications()

  // 制限区域
  const restrictedZones = createMockRestrictedZones()

  // ドローン位置の定期更新（シミュレーション）
  useEffect(() => {
    const interval = setInterval(() => {
      setDrones((prev) => updateDronePositions(prev))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // 選択中のドローン
  const selectedDrone = drones.find((d) => d.droneId === selectedDroneId)

  // ドローン選択ハンドラー
  const handleDroneSelect = useCallback((drone: DroneFlightStatus) => {
    setSelectedDroneId(drone.droneId)
  }, [])

  const handleDroneSelectById = useCallback((droneId: string) => {
    setSelectedDroneId(droneId)
  }, [])

  // マップクリック（選択解除）
  const handleMapClick = useCallback(() => {
    setSelectedDroneId(null)
  }, [])

  // アラート確認
  const handleAcknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    )
  }, [])

  // アラート削除
  const handleDismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId))
  }, [])

  // 新しいアラートを追加（デモ用）
  const handleAddAlert = useCallback(() => {
    const newAlert: UTMAlert = {
      id: `alert-${Date.now()}`,
      type: 'zone_approach',
      severity: 'warning',
      droneId: drones[0]?.droneId || 'drone-1',
      droneName: drones[0]?.droneName || 'ドローン',
      message: '制限区域に接近しています',
      details: '100m以内に制限区域があります',
      timestamp: new Date(),
      acknowledged: false,
    }
    setAlerts((prev) => [...prev, newAlert])
    notifyAlert(newAlert)
  }, [drones, notifyAlert])

  // グラスモーフィズムスタイル
  const glassStyle = {
    bgcolor:
      theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.8)
        : alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  }

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        overflow: 'hidden',
      }}>
      {/* 左サイドパネル: ドローンリスト */}
      <Paper
        elevation={0}
        sx={{
          width: 380,
          height: '100%',
          ...glassStyle,
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
        }}>
        <UTMDroneListPanel
          drones={drones}
          selectedDroneId={selectedDroneId}
          onDroneSelect={handleDroneSelect}
          alerts={alerts}
        />
        {/* タイムライン */}
        <Box sx={{ flex: 1, p: 1, borderTop: 1, borderColor: 'divider' }}>
          <UTMFlightTimeline
            drones={drones}
            selectedDroneId={selectedDroneId}
            onDroneSelect={handleDroneSelectById}
            timeRangeHours={4}
          />
        </Box>
      </Paper>

      {/* 中央: マップ */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <UTMTrackingMap
          drones={drones}
          restrictedZones={restrictedZones}
          selectedDroneId={selectedDroneId}
          onDroneClick={handleDroneSelect}
          onMapClick={handleMapClick}
          alerts={alerts}
          height='100%'
          showZones={true}
          initialMapStyleId='positron'
        />

        {/* 選択中のドローンステータスウィジェット */}
        {selectedDrone && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
            }}>
            <UTMDroneStatusWidget
              drone={selectedDrone}
              collapsed={false}
              groundLevel={50}
            />
          </Box>
        )}
      </Box>

      {/* 右サイドパネル: アラート・気象 */}
      <Paper
        elevation={0}
        sx={{
          width: 360,
          height: '100%',
          ...glassStyle,
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}>
        {/* アラートパネル */}
        <Box sx={{ p: 1 }}>
          <UTMAlertPanel
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
            onClear={handleDismissAlert}
            onClearAll={() => setAlerts([])}
          />
        </Box>

        {/* 気象情報 */}
        <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
          <UTMWeatherWidget
            latitude={weather.location.latitude}
            longitude={weather.location.longitude}
            updateInterval={60000}
          />
        </Box>

        {/* 風向予報タイムライン */}
        <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
          <UTMForecastTimeline
            currentWindSpeed={weather.current.windSpeed}
            currentWindDirection={weather.current.windDirection}
            updateInterval={30000}
          />
        </Box>

        {/* デモ用ボタン */}
        <Box
          sx={{
            p: 2,
            mt: 'auto',
            borderTop: 1,
            borderColor: 'divider',
          }}>
          <Box
            component='button'
            onClick={handleAddAlert}
            sx={{
              width: '100%',
              py: 1.5,
              px: 3,
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
              border: 'none',
              borderRadius: 2,
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'warning.dark',
              },
            }}>
            アラートを追加（デモ）
          </Box>
        </Box>
      </Paper>

      {/* トースト通知 */}
      <UTMToastNotification
        notifications={notifications}
        onClose={removeNotification}
        maxVisible={3}
      />
    </Box>
  )
}

// マルチドローングリッドビュー
const UTMMultiViewDashboard = () => {
  // ドローンデータ
  const [drones, setDrones] = useState<DroneFlightStatus[]>(() =>
    createMockDrones(4)
  )
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null)

  // FPV映像URL
  const fpvUrls = generateFpvUrlMap(drones.map((d) => d.droneId))

  // ドローン位置の定期更新
  useEffect(() => {
    const interval = setInterval(() => {
      setDrones((prev) => updateDronePositions(prev))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: 'grey.900',
        p: 1,
      }}>
      <Grid container spacing={1} sx={{ height: '100%' }}>
        {drones.map((drone) => (
          <Grid key={drone.droneId} size={{ xs: 6 }}>
            <Box
              sx={{
                height: 'calc(50vh - 12px)',
                borderRadius: 2,
                overflow: 'hidden',
                border:
                  selectedDroneId === drone.droneId ? '3px solid' : '1px solid',
                borderColor:
                  selectedDroneId === drone.droneId
                    ? 'primary.main'
                    : 'grey.700',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                '&:hover': {
                  borderColor: 'primary.light',
                },
              }}
              onClick={() => setSelectedDroneId(drone.droneId)}>
              {/* FPV映像表示エリア */}
              <Box
                sx={{
                  height: '70%',
                  position: 'relative',
                  backgroundImage: `url(${fpvUrls.get(drone.droneId)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}>
                {/* オーバーレイ情報 */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    p: 1,
                    background:
                      'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
                    color: 'white',
                  }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Box
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        bgcolor: 'primary.main',
                        px: 1.5,
                        py: 0.25,
                        borderRadius: 1,
                      }}>
                      {drone.droneName}
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        fontSize: '0.75rem',
                        bgcolor: 'rgba(0,0,0,0.5)',
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                      }}>
                      <span>ALT: {Math.round(drone.position.altitude)}m</span>
                      <span>SPD: {drone.position.speed.toFixed(1)}m/s</span>
                    </Box>
                  </Box>
                </Box>
                {/* 下部情報 */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 1,
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                  }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor:
                          drone.batteryLevel > 50
                            ? 'success.main'
                            : drone.batteryLevel > 20
                              ? 'warning.main'
                              : 'error.main',
                      }}
                    />
                    <span>{Math.round(drone.batteryLevel)}%</span>
                  </Box>
                  <Box>HDG: {Math.round(drone.position.heading)}°</Box>
                </Box>
              </Box>
              {/* ミニマップ */}
              <Box
                sx={{
                  height: '30%',
                  bgcolor: 'grey.800',
                  position: 'relative',
                }}>
                <UTMTrackingMap
                  drones={[drone]}
                  restrictedZones={[]}
                  selectedDroneId={null}
                  height='100%'
                  showZones={false}
                  initialMapStyleId='dark-matter'
                />
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

// ===== ストーリー =====

/**
 * 監視ダッシュボード - 標準レイアウト
 */
export const MonitoringDashboard: Story = {
  render: () => <UTMDashboard />,
}

/**
 * マルチビューダッシュボード - 4分割FPV表示
 */
export const MultiViewDashboard: Story = {
  render: () => <UTMMultiViewDashboard />,
}
