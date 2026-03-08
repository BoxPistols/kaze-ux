'use client'

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Flag as FlagIcon,
  Place as PlaceIcon,
  Home as HomeIcon,
  FlightTakeoff as TakeoffIcon,
  FlightLand as LandingIcon,
  CameraAlt as CameraIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Speed as SpeedIcon,
  Height as AltitudeIcon,
  Timeline as RouteIcon,
  Settings as SettingsIcon,
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Chip,
  Switch,
  FormControlLabel,
  Slider,
  Alert,
  Collapse,
  Stack,
} from '@mui/material'
import React, { useState, useCallback, useMemo } from 'react'

import { useProjectSettingsOptional } from '@/contexts/ProjectSettingsContext'

import type {
  FlightPlan,
  FlightPlanWaypoint,
  FlightPlanEditorMode,
  FlightPlanSelection,
  FlightPlanValidation,
  WaypointType,
} from '../../types/utmTypes'

export interface UTMFlightPlanEditorProps {
  // 飛行計画データ
  flightPlan: FlightPlan
  // エディタモード
  mode?: FlightPlanEditorMode
  // 検証結果
  validation?: FlightPlanValidation
  // 制限区域（警告表示用）
  restrictedZones?: Array<{
    id: string
    name: string
    type: string
  }>
  // コールバック
  onChange?: (flightPlan: FlightPlan) => void
  onWaypointSelect?: (waypointId: string | null) => void
  onWaypointAdd?: (position: { latitude: number; longitude: number }) => void
  onWaypointMove?: (
    waypointId: string,
    position: { latitude: number; longitude: number }
  ) => void
  onSave?: (flightPlan: FlightPlan) => void
  onValidate?: (flightPlan: FlightPlan) => FlightPlanValidation
  onModeChange?: (mode: FlightPlanEditorMode) => void
  // 選択状態
  selection?: FlightPlanSelection
  // 表示オプション
  showMap?: boolean
  showValidation?: boolean
  showSettings?: boolean
  maxHeight?: number | string
  // 地図コンポーネント（外部から渡す場合）
  mapComponent?: React.ReactNode
}

// ウェイポイントタイプのラベル
const waypointTypeLabels: Record<WaypointType, string> = {
  takeoff: '離陸地点',
  waypoint: '通過点',
  poi: '撮影ポイント',
  hover: 'ホバリング',
  landing: '着陸地点',
}

// ウェイポイントタイプのアイコン
const waypointTypeIcons: Record<WaypointType, React.ReactNode> = {
  takeoff: <TakeoffIcon fontSize='small' />,
  waypoint: <PlaceIcon fontSize='small' />,
  poi: <CameraIcon fontSize='small' />,
  hover: <LocationIcon fontSize='small' />,
  landing: <LandingIcon fontSize='small' />,
}

/* 将来のアクション選択UIで使用予定
const actionTypeLabels: Record<WaypointAction, string> = {
  none: 'なし',
  take_photo: '写真撮影',
  start_video: '動画開始',
  stop_video: '動画停止',
  hover: 'ホバリング',
  rotate: '機体回転',
  gimbal_pitch: 'ジンバル角度',
}
*/

// ステータスのラベルと色
const statusConfig: Record<
  FlightPlan['status'],
  {
    label: string
    color:
      | 'default'
      | 'primary'
      | 'secondary'
      | 'success'
      | 'warning'
      | 'error'
      | 'info'
  }
> = {
  draft: { label: '下書き', color: 'default' },
  pending_approval: { label: '承認待ち', color: 'warning' },
  approved: { label: '承認済み', color: 'success' },
  rejected: { label: '却下', color: 'error' },
  active: { label: '実行中', color: 'info' },
  completed: { label: '完了', color: 'success' },
  cancelled: { label: 'キャンセル', color: 'error' },
}

// ハーバーサイン公式で2点間の距離を計算（メートル）
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000 // 地球の半径（メートル）
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 飛行計画の総距離を計算
const calculateTotalDistance = (waypoints: FlightPlanWaypoint[]): number => {
  let total = 0
  for (let i = 1; i < waypoints.length; i++) {
    const prev = waypoints[i - 1]
    const curr = waypoints[i]
    total += calculateDistance(
      prev.position.latitude,
      prev.position.longitude,
      curr.position.latitude,
      curr.position.longitude
    )
  }
  return total
}

// 飛行計画の推定時間を計算（秒）
const calculateEstimatedDuration = (
  waypoints: FlightPlanWaypoint[],
  defaultSpeed: number
): number => {
  let totalTime = 0
  for (let i = 1; i < waypoints.length; i++) {
    const prev = waypoints[i - 1]
    const curr = waypoints[i]
    const distance = calculateDistance(
      prev.position.latitude,
      prev.position.longitude,
      curr.position.latitude,
      curr.position.longitude
    )
    const speed = curr.speed || defaultSpeed
    totalTime += distance / speed
    // ホバリング時間を追加
    if (curr.hoverDuration) {
      totalTime += curr.hoverDuration
    }
  }
  return Math.round(totalTime)
}

// 時間をフォーマット
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) {
    return `${hours}時間${minutes}分${secs}秒`
  }
  if (minutes > 0) {
    return `${minutes}分${secs}秒`
  }
  return `${secs}秒`
}

export const UTMFlightPlanEditor = ({
  flightPlan,
  mode = 'view',
  validation,
  onChange,
  onWaypointSelect,
  onSave,
  onModeChange,
  selection,
  showMap = true,
  showValidation = true,
  showSettings = true,
  maxHeight = 800,
  mapComponent,
}: UTMFlightPlanEditorProps) => {
  const { formatters, settings } = useProjectSettingsOptional()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['waypoints', 'settings'])
  )
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(
    selection?.waypointId || null
  )
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const isEditable = mode === 'edit' || mode === 'create'

  // 単位ラベル
  const altitudeLabel = settings.units.altitude === 'feet' ? 'ft' : 'm'
  const speedLabel = formatters.units.labels.speed

  // セクションの展開/折りたたみ
  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }, [])

  // ウェイポイント選択
  const handleWaypointSelect = useCallback(
    (waypointId: string) => {
      setSelectedWaypointId(waypointId)
      onWaypointSelect?.(waypointId)
    },
    [onWaypointSelect]
  )

  // ウェイポイント追加
  const handleAddWaypoint = useCallback(() => {
    if (!isEditable || !onChange) return

    const lastWaypoint = flightPlan.waypoints[flightPlan.waypoints.length - 1]
    const newPosition = lastWaypoint
      ? {
          latitude: lastWaypoint.position.latitude + 0.001,
          longitude: lastWaypoint.position.longitude + 0.001,
        }
      : { latitude: 35.68, longitude: 139.76 }

    const newWaypoint: FlightPlanWaypoint = {
      id: `wp-${Date.now()}`,
      order: flightPlan.waypoints.length,
      type: 'waypoint',
      name: `WP${flightPlan.waypoints.length + 1}`,
      position: {
        ...newPosition,
        altitude: flightPlan.defaultAltitude,
      },
      altitudeMode: flightPlan.altitudeMode,
    }

    onChange({
      ...flightPlan,
      waypoints: [...flightPlan.waypoints, newWaypoint],
      updatedAt: new Date(),
    })
  }, [flightPlan, isEditable, onChange])

  // ウェイポイント削除
  const handleDeleteWaypoint = useCallback(
    (waypointId: string) => {
      if (!isEditable || !onChange) return

      const updatedWaypoints = flightPlan.waypoints
        .filter((wp) => wp.id !== waypointId)
        .map((wp, index) => ({ ...wp, order: index }))

      onChange({
        ...flightPlan,
        waypoints: updatedWaypoints,
        updatedAt: new Date(),
      })

      if (selectedWaypointId === waypointId) {
        setSelectedWaypointId(null)
        onWaypointSelect?.(null)
      }
    },
    [flightPlan, isEditable, onChange, selectedWaypointId, onWaypointSelect]
  )

  // ウェイポイント更新
  const handleUpdateWaypoint = useCallback(
    (waypointId: string, updates: Partial<FlightPlanWaypoint>) => {
      if (!isEditable || !onChange) return

      const updatedWaypoints = flightPlan.waypoints.map((wp) =>
        wp.id === waypointId ? { ...wp, ...updates } : wp
      )

      onChange({
        ...flightPlan,
        waypoints: updatedWaypoints,
        updatedAt: new Date(),
      })
    },
    [flightPlan, isEditable, onChange]
  )

  // 飛行計画の設定更新
  const handleUpdateSettings = useCallback(
    (updates: Partial<FlightPlan>) => {
      if (!isEditable || !onChange) return

      onChange({
        ...flightPlan,
        ...updates,
        updatedAt: new Date(),
      })
    },
    [flightPlan, isEditable, onChange]
  )

  // 現在位置をホームポイントに設定（モック実装）
  const handleSetCurrentLocation = useCallback(() => {
    if (!isEditable || !onChange) return

    setIsGettingLocation(true)

    // モック: 位置取得のシミュレーション（500ms遅延）
    setTimeout(() => {
      // 東京近辺のランダムな位置を生成
      onChange({
        ...flightPlan,
        homePoint: {
          latitude: 35.68 + (Math.random() - 0.5) * 0.02,
          longitude: 139.76 + (Math.random() - 0.5) * 0.02,
          altitude: flightPlan.homePoint.altitude,
        },
        updatedAt: new Date(),
      })
      setIsGettingLocation(false)
    }, 500)
  }, [flightPlan, isEditable, onChange])

  // 統計情報の計算
  const stats = useMemo(() => {
    const totalDistance = calculateTotalDistance(flightPlan.waypoints)
    const estimatedDuration = calculateEstimatedDuration(
      flightPlan.waypoints,
      flightPlan.defaultSpeed
    )
    const maxAltitude = Math.max(
      ...flightPlan.waypoints.map((wp) => wp.position.altitude),
      0
    )
    return { totalDistance, estimatedDuration, maxAltitude }
  }, [flightPlan.waypoints, flightPlan.defaultSpeed])

  // 選択中のウェイポイント
  const selectedWaypoint = useMemo(
    () => flightPlan.waypoints.find((wp) => wp.id === selectedWaypointId),
    [flightPlan.waypoints, selectedWaypointId]
  )

  return (
    <Box
      sx={{
        display: 'flex',
        height: maxHeight,
        bgcolor: 'background.default',
      }}>
      {/* 左パネル: ウェイポイントリストと設定 */}
      <Paper
        sx={{
          width: 360,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 0,
        }}>
        {/* ヘッダー */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
            }}>
            <Typography variant='h6' noWrap sx={{ flex: 1 }}>
              {flightPlan.name || '新規飛行計画'}
            </Typography>
            <Chip
              label={statusConfig[flightPlan.status].label}
              color={statusConfig[flightPlan.status].color}
              size='small'
            />
          </Box>

          {/* モード切替 */}
          <Stack direction='row' spacing={1}>
            <Tooltip title='閲覧モード'>
              <IconButton
                size='small'
                color={mode === 'view' ? 'primary' : 'default'}
                onClick={() => onModeChange?.('view')}>
                <ViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title='編集モード'>
              <IconButton
                size='small'
                color={mode === 'edit' ? 'primary' : 'default'}
                onClick={() => onModeChange?.('edit')}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            {isEditable && (
              <Button
                size='small'
                variant='contained'
                startIcon={<SaveIcon />}
                onClick={() => onSave?.(flightPlan)}
                sx={{ ml: 'auto' }}>
                保存
              </Button>
            )}
          </Stack>
        </Box>

        {/* 統計情報 */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction='row' spacing={2}>
            <Tooltip title='総距離'>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <RouteIcon fontSize='small' color='action' />
                <Typography variant='body2'>
                  {formatters.units.distance(stats.totalDistance, 2)}
                </Typography>
              </Box>
            </Tooltip>
            <Tooltip title='推定飛行時間'>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SpeedIcon fontSize='small' color='action' />
                <Typography variant='body2'>
                  {formatDuration(stats.estimatedDuration)}
                </Typography>
              </Box>
            </Tooltip>
            <Tooltip title='最大高度'>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AltitudeIcon fontSize='small' color='action' />
                <Typography variant='body2'>
                  {formatters.units.altitude(stats.maxAltitude, 0)}
                </Typography>
              </Box>
            </Tooltip>
          </Stack>
        </Box>

        {/* 検証結果 */}
        {showValidation && validation && (
          <Collapse in={!validation.isValid}>
            <Box sx={{ p: 1 }}>
              {validation.errors.map((error, index) => (
                <Alert key={index} severity='error' sx={{ mb: 0.5 }}>
                  {error.message}
                </Alert>
              ))}
              {validation.warnings.map((warning, index) => (
                <Alert key={index} severity='warning' sx={{ mb: 0.5 }}>
                  {warning.message}
                </Alert>
              ))}
            </Box>
          </Collapse>
        )}

        {/* スクロール可能なコンテンツ */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {/* ウェイポイントセクション */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1,
                pl: 2,
                bgcolor: 'grey.100',
                cursor: 'pointer',
              }}
              onClick={() => toggleSection('waypoints')}>
              <FlagIcon fontSize='small' sx={{ mr: 1 }} />
              <Typography variant='subtitle2' sx={{ flex: 1 }}>
                ウェイポイント ({flightPlan.waypoints.length})
              </Typography>
              {expandedSections.has('waypoints') ? (
                <CollapseIcon />
              ) : (
                <ExpandIcon />
              )}
            </Box>
            <Collapse in={expandedSections.has('waypoints')}>
              <List dense disablePadding>
                {flightPlan.waypoints.map((waypoint, index) => (
                  <ListItemButton
                    key={waypoint.id}
                    selected={selectedWaypointId === waypoint.id}
                    onClick={() => handleWaypointSelect(waypoint.id)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      borderLeft: 3,
                      borderColor:
                        selectedWaypointId === waypoint.id
                          ? 'primary.main'
                          : 'transparent',
                    }}>
                    {isEditable && (
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <DragIcon
                          fontSize='small'
                          sx={{ cursor: 'grab', color: 'action.disabled' }}
                        />
                      </ListItemIcon>
                    )}
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor:
                            waypoint.type === 'takeoff'
                              ? 'success.main'
                              : waypoint.type === 'landing'
                                ? 'error.main'
                                : 'primary.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                        }}>
                        {index + 1}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={waypoint.name || `WP${index + 1}`}
                      secondary={
                        <Box
                          component='span'
                          sx={{
                            display: 'flex',
                            gap: 1,
                            alignItems: 'center',
                          }}>
                          {waypointTypeIcons[waypoint.type]}
                          <span>{waypointTypeLabels[waypoint.type]}</span>
                          <span>
                            /{' '}
                            {formatters.units.altitude(
                              waypoint.position.altitude,
                              0
                            )}
                          </span>
                        </Box>
                      }
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    {isEditable && (
                      <Box
                        sx={{
                          ml: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          size='small'
                          onClick={() => handleDeleteWaypoint(waypoint.id)}
                          disabled={
                            waypoint.type === 'takeoff' ||
                            waypoint.type === 'landing'
                          }>
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      </Box>
                    )}
                  </ListItemButton>
                ))}
              </List>
              {isEditable && (
                <Box sx={{ p: 1 }}>
                  <Button
                    fullWidth
                    variant='outlined'
                    startIcon={<AddIcon />}
                    onClick={handleAddWaypoint}
                    size='small'>
                    ウェイポイント追加
                  </Button>
                </Box>
              )}
            </Collapse>
          </Box>

          <Divider />

          {/* 設定セクション */}
          {showSettings && (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1,
                  pl: 2,
                  bgcolor: 'grey.100',
                  cursor: 'pointer',
                }}
                onClick={() => toggleSection('settings')}>
                <SettingsIcon fontSize='small' sx={{ mr: 1 }} />
                <Typography variant='subtitle2' sx={{ flex: 1 }}>
                  飛行設定
                </Typography>
                {expandedSections.has('settings') ? (
                  <CollapseIcon />
                ) : (
                  <ExpandIcon />
                )}
              </Box>
              <Collapse in={expandedSections.has('settings')}>
                <Box sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    {/* デフォルト速度 */}
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        デフォルト速度:{' '}
                        {formatters.units.speed(flightPlan.defaultSpeed, 1)}
                      </Typography>
                      <Slider
                        value={flightPlan.defaultSpeed}
                        min={1}
                        max={20}
                        step={0.5}
                        disabled={!isEditable}
                        onChange={(_, value) =>
                          handleUpdateSettings({
                            defaultSpeed: value as number,
                          })
                        }
                        valueLabelDisplay='auto'
                        marks={[
                          { value: 1, label: '1' },
                          { value: 10, label: '10' },
                          { value: 20, label: '20' },
                        ]}
                      />
                    </Box>

                    {/* デフォルト高度 */}
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        デフォルト高度:{' '}
                        {formatters.units.altitude(
                          flightPlan.defaultAltitude,
                          0
                        )}
                      </Typography>
                      <Slider
                        value={flightPlan.defaultAltitude}
                        min={10}
                        max={150}
                        step={5}
                        disabled={!isEditable}
                        onChange={(_, value) =>
                          handleUpdateSettings({
                            defaultAltitude: value as number,
                          })
                        }
                        valueLabelDisplay='auto'
                        marks={[
                          { value: 10, label: '10' },
                          { value: 75, label: '75' },
                          { value: 150, label: '150' },
                        ]}
                      />
                    </Box>

                    {/* コリドア幅 */}
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        飛行経路幅:{' '}
                        {formatters.units.distance(flightPlan.corridorWidth, 0)}
                      </Typography>
                      <Slider
                        value={flightPlan.corridorWidth}
                        min={10}
                        max={200}
                        step={10}
                        disabled={!isEditable}
                        onChange={(_, value) =>
                          handleUpdateSettings({
                            corridorWidth: value as number,
                          })
                        }
                        valueLabelDisplay='auto'
                      />
                    </Box>

                    {/* 高度基準 */}
                    <FormControl size='small' fullWidth disabled={!isEditable}>
                      <InputLabel>高度基準</InputLabel>
                      <Select
                        value={flightPlan.altitudeMode}
                        label='高度基準'
                        onChange={(e) =>
                          handleUpdateSettings({
                            altitudeMode: e.target.value as 'AGL' | 'AMSL',
                          })
                        }>
                        <MenuItem value='AGL'>AGL (対地高度)</MenuItem>
                        <MenuItem value='AMSL'>AMSL (海抜高度)</MenuItem>
                      </Select>
                    </FormControl>

                    {/* 最低バッテリー */}
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        RTH開始バッテリー: {flightPlan.minBatteryLevel}%
                      </Typography>
                      <Slider
                        value={flightPlan.minBatteryLevel}
                        min={10}
                        max={50}
                        step={5}
                        disabled={!isEditable}
                        onChange={(_, value) =>
                          handleUpdateSettings({
                            minBatteryLevel: value as number,
                          })
                        }
                        valueLabelDisplay='auto'
                      />
                    </Box>

                    {/* ジオフェンス */}
                    <FormControlLabel
                      control={
                        <Switch
                          checked={flightPlan.geofence?.enabled || false}
                          disabled={!isEditable}
                          onChange={(e) =>
                            handleUpdateSettings({
                              geofence: {
                                ...flightPlan.geofence,
                                enabled: e.target.checked,
                                coordinates:
                                  flightPlan.geofence?.coordinates || [],
                                maxAltitude:
                                  flightPlan.geofence?.maxAltitude || 150,
                              },
                            })
                          }
                        />
                      }
                      label='ジオフェンス有効'
                    />
                  </Stack>
                </Box>
              </Collapse>
            </Box>
          )}

          <Divider />

          {/* ホームポイント */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1,
                pl: 2,
                bgcolor: 'grey.100',
                cursor: 'pointer',
              }}
              onClick={() => toggleSection('home')}>
              <HomeIcon fontSize='small' sx={{ mr: 1 }} />
              <Typography variant='subtitle2' sx={{ flex: 1 }}>
                ホームポイント
              </Typography>
              {expandedSections.has('home') ? <CollapseIcon /> : <ExpandIcon />}
            </Box>
            <Collapse in={expandedSections.has('home')}>
              <Box sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ whiteSpace: 'pre-line' }}>
                    {
                      formatters.units.coordinate(
                        flightPlan.homePoint.latitude,
                        flightPlan.homePoint.longitude
                      ).combined
                    }
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    高度:{' '}
                    {formatters.units.altitude(
                      flightPlan.homePoint.altitude,
                      0
                    )}
                  </Typography>
                  {isEditable && (
                    <Button
                      size='small'
                      startIcon={<MyLocationIcon />}
                      variant='outlined'
                      onClick={handleSetCurrentLocation}
                      disabled={isGettingLocation}>
                      {isGettingLocation ? '取得中...' : '現在位置に設定'}
                    </Button>
                  )}
                </Stack>
              </Box>
            </Collapse>
          </Box>
        </Box>
      </Paper>

      {/* 右パネル: 地図または詳細 */}
      {showMap && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* 地図エリア */}
          <Box sx={{ flex: 1, position: 'relative' }}>
            {mapComponent || (
              <Box
                sx={{
                  height: '100%',
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Typography color='text.secondary'>
                  地図コンポーネントを挿入してください
                </Typography>
              </Box>
            )}
          </Box>

          {/* 選択中のウェイポイント詳細 */}
          {selectedWaypoint && (
            <Paper
              sx={{
                p: 2,
                borderRadius: 0,
                borderTop: 1,
                borderColor: 'divider',
              }}>
              <Typography variant='subtitle2' gutterBottom>
                {selectedWaypoint.name || `WP${selectedWaypoint.order + 1}`}{' '}
                の詳細
              </Typography>
              <Stack direction='row' spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <FormControl
                    size='small'
                    fullWidth
                    disabled={!isEditable}
                    sx={{ mb: 1 }}>
                    <InputLabel>種類</InputLabel>
                    <Select
                      value={selectedWaypoint.type}
                      label='種類'
                      onChange={(e) =>
                        handleUpdateWaypoint(selectedWaypoint.id, {
                          type: e.target.value as WaypointType,
                        })
                      }>
                      {Object.entries(waypointTypeLabels).map(
                        ([key, label]) => (
                          <MenuItem key={key} value={key}>
                            {label}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                  <TextField
                    size='small'
                    label={`高度 (${altitudeLabel})`}
                    type='number'
                    value={selectedWaypoint.position.altitude}
                    disabled={!isEditable}
                    onChange={(e) =>
                      handleUpdateWaypoint(selectedWaypoint.id, {
                        position: {
                          ...selectedWaypoint.position,
                          altitude: Number(e.target.value),
                        },
                      })
                    }
                    fullWidth
                    sx={{ mb: 1 }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    size='small'
                    label={`速度 (${speedLabel})`}
                    type='number'
                    value={selectedWaypoint.speed || flightPlan.defaultSpeed}
                    disabled={!isEditable}
                    onChange={(e) =>
                      handleUpdateWaypoint(selectedWaypoint.id, {
                        speed: Number(e.target.value),
                      })
                    }
                    fullWidth
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    size='small'
                    label='ホバリング時間 (秒)'
                    type='number'
                    value={selectedWaypoint.hoverDuration || 0}
                    disabled={!isEditable}
                    onChange={(e) =>
                      handleUpdateWaypoint(selectedWaypoint.id, {
                        hoverDuration: Number(e.target.value),
                      })
                    }
                    fullWidth
                  />
                </Box>
              </Stack>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  )
}

export default UTMFlightPlanEditor
