/**
 * CheckinPage - 飛行準備ページ
 *
 * 監視対象の機体を選択し、アラート設定を行い、
 * プリフライトチェックを完了してから飛行監視画面へ進む
 */
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FlightIcon from '@mui/icons-material/Flight'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import NotificationsIcon from '@mui/icons-material/Notifications'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Collapse,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Slider,
  Stack,
  Tab,
  Tabs,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { UTMPreflightPanel } from '@/components/utm/UTMPreflightPanel'
import { createMockPreflightChecklist } from '@/mocks/utmWorkflowMocks'
import useUTMStore from '@/store/utmStore'
import { colors } from '@/styles/tokens'
import type {
  DroneFlightStatus,
  PreflightChecklist,
  UTMProject,
} from '@/types/utmTypes'

/**
 * サマリーカードコンポーネント
 */
interface SummaryCardProps {
  title: string
  value: number
  total?: number
  color: string
  icon: React.ReactNode
}

const SummaryCard = ({
  title,
  value,
  total,
  color,
  icon,
}: SummaryCardProps) => {
  const theme = useTheme()

  return (
    <Card
      elevation={0}
      sx={{
        background:
          theme.palette.mode === 'dark'
            ? alpha(color, 0.15)
            : alpha(color, 0.1),
        border: `1px solid ${alpha(color, 0.3)}`,
        borderRadius: 2,
      }}>
      <CardContent sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ color }}>{icon}</Box>
          <Typography variant='body2' color='text.secondary'>
            {title}
          </Typography>
        </Box>
        <Typography variant='h4' fontWeight={700} sx={{ color }}>
          {value}
          {total !== undefined && (
            <Typography
              component='span'
              variant='h6'
              fontWeight={400}
              color='text.secondary'>
              {' '}
              / {total}
            </Typography>
          )}
        </Typography>
      </CardContent>
    </Card>
  )
}

/**
 * ドローンカードコンポーネント（カード型UI）
 */
interface DroneCardProps {
  drone: DroneFlightStatus
  isCheckedIn: boolean
  onToggle: () => void
}

const DroneCard = ({ drone, isCheckedIn, onToggle }: DroneCardProps) => {
  const theme = useTheme()

  const getBatteryColor = (level: number) => {
    if (level > 50) return colors.success.main
    if (level > 20) return colors.warning.main
    return colors.error.main
  }

  const getStatusInfo = (status: DroneFlightStatus['status']) => {
    switch (status) {
      case 'in_flight':
        return { label: '飛行中', color: colors.success.main }
      case 'hovering':
        return { label: 'ホバリング', color: colors.warning.main }
      case 'rth':
        return { label: '帰還中', color: colors.error.main }
      case 'emergency':
        return { label: '緊急', color: colors.error.main }
      case 'landing':
        return { label: '着陸中', color: colors.gray[500] }
      case 'landed':
        return { label: '着陸済', color: colors.gray[500] }
      default:
        return { label: '待機中', color: colors.gray[500] }
    }
  }

  const statusInfo = getStatusInfo(drone.status)

  return (
    <Card
      onClick={onToggle}
      sx={{
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s ease',
        border: isCheckedIn
          ? `2px solid ${colors.success.main}`
          : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        bgcolor: isCheckedIn
          ? alpha(colors.success.main, 0.08)
          : theme.palette.mode === 'dark'
            ? alpha(colors.gray[800], 0.5)
            : 'background.paper',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
          borderColor: isCheckedIn ? colors.success.main : colors.primary[400],
        },
      }}>
      {/* チェックボックス（右上） */}
      <Checkbox
        checked={isCheckedIn}
        onClick={(e) => e.stopPropagation()}
        onChange={onToggle}
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          color: colors.gray[400],
          '&.Mui-checked': {
            color: colors.success.main,
          },
        }}
      />

      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* ドローンアイコンと名前 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(statusInfo.color, 0.15),
            }}>
            <FlightIcon
              sx={{
                fontSize: 20,
                color: statusInfo.color,
                transform: 'rotate(45deg)',
              }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, pr: 3 }}>
            <Typography
              variant='subtitle2'
              fontWeight={700}
              noWrap
              title={drone.droneName}>
              {drone.droneName}
            </Typography>
            <Typography variant='caption' color='text.secondary' noWrap>
              {drone.pilotName}
            </Typography>
          </Box>
        </Box>

        {/* ステータスチップ */}
        <Chip
          label={statusInfo.label}
          size='small'
          sx={{
            height: 22,
            fontSize: '0.7rem',
            fontWeight: 600,
            bgcolor: alpha(statusInfo.color, 0.15),
            color: statusInfo.color,
            mb: 1.5,
          }}
        />

        {/* バッテリーと信号 */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'block', mb: 0.5 }}>
              バッテリー
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress
                variant='determinate'
                value={drone.batteryLevel}
                sx={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: alpha(colors.gray[500], 0.2),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    bgcolor: getBatteryColor(drone.batteryLevel),
                  },
                }}
              />
              <Typography
                variant='caption'
                fontWeight={600}
                sx={{
                  color: getBatteryColor(drone.batteryLevel),
                  minWidth: 32,
                }}>
                {Math.round(drone.batteryLevel)}%
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 信号強度 */}
        <Box sx={{ mt: 1 }}>
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ display: 'block', mb: 0.5 }}>
            信号強度
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant='determinate'
              value={drone.signalStrength}
              sx={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(colors.gray[500], 0.2),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  bgcolor:
                    drone.signalStrength > 50
                      ? colors.success.main
                      : drone.signalStrength > 20
                        ? colors.warning.main
                        : colors.error.main,
                },
              }}
            />
            <Typography
              variant='caption'
              fontWeight={600}
              color='text.secondary'
              sx={{ minWidth: 32 }}>
              {Math.round(drone.signalStrength)}%
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

/**
 * プロジェクトチェックインカードコンポーネント
 */
interface ProjectCheckinCardProps {
  project: UTMProject
  drones: DroneFlightStatus[]
  checkedInDroneIds: Set<string>
  onCheckInDrone: (droneId: string, projectId: string) => void
  onCheckOutDrone: (droneId: string) => void
  onCheckInProject: () => void
  onCheckOutProject: () => void
}

const ProjectCheckinCard = ({
  project,
  drones,
  checkedInDroneIds,
  onCheckInDrone,
  onCheckOutDrone,
  onCheckInProject,
  onCheckOutProject,
}: ProjectCheckinCardProps) => {
  const theme = useTheme()
  const [expanded, setExpanded] = useState(true)

  const checkedInCount = drones.filter((d) =>
    checkedInDroneIds.has(d.droneId)
  ).length
  const allCheckedIn = checkedInCount === drones.length && drones.length > 0

  const handleProjectToggle = () => {
    if (allCheckedIn) {
      onCheckOutProject()
    } else {
      onCheckInProject()
    }
  }

  const glassStyle = {
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(30, 41, 59, 0.85)'
        : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
  }

  return (
    <Paper
      elevation={0}
      sx={{
        ...glassStyle,
        borderRadius: 2,
        overflow: 'hidden',
        mb: 2,
      }}>
      {/* プロジェクトヘッダー */}
      <ListItemButton
        onClick={() => setExpanded(!expanded)}
        sx={{
          py: 1.5,
          borderLeft: `4px solid ${project.flightArea?.color || colors.primary[500]}`,
        }}>
        <Checkbox
          checked={allCheckedIn}
          indeterminate={checkedInCount > 0 && !allCheckedIn}
          onClick={(e) => {
            e.stopPropagation()
            handleProjectToggle()
          }}
          sx={{
            mr: 1,
            color: colors.gray[400],
            '&.Mui-checked, &.MuiCheckbox-indeterminate': {
              color: colors.success.main,
            },
          }}
        />
        <ListItemIcon sx={{ minWidth: 40 }}>
          <FlightTakeoffIcon
            sx={{
              color: project.flightArea?.color || colors.primary[500],
            }}
          />
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant='subtitle1' fontWeight={700}>
                {project.name}
              </Typography>
              <Chip
                label={project.status === 'active' ? '実行中' : '予定'}
                size='small'
                sx={{
                  height: 20,
                  fontSize: 10,
                  bgcolor:
                    project.status === 'active'
                      ? alpha(colors.success.main, 0.15)
                      : alpha(colors.info.main, 0.15),
                  color:
                    project.status === 'active'
                      ? colors.success.main
                      : colors.info.main,
                }}
              />
            </Box>
          }
          secondary={
            <Typography variant='caption' color='text.secondary'>
              {project.location} | {checkedInCount}/{drones.length}機
              チェックイン済み
            </Typography>
          }
        />
        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </ListItemButton>

      {/* ドローンカードグリッド */}
      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {drones.map((drone) => (
              <Grid key={drone.droneId} size={{ xs: 12, sm: 6, md: 4 }}>
                <DroneCard
                  drone={drone}
                  isCheckedIn={checkedInDroneIds.has(drone.droneId)}
                  onToggle={() => {
                    if (checkedInDroneIds.has(drone.droneId)) {
                      onCheckOutDrone(drone.droneId)
                    } else {
                      onCheckInDrone(drone.droneId, project.id)
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  )
}

/**
 * CheckinPage メインコンポーネント
 */
const CheckinPage = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)

  // Zustand ストア
  const {
    projects,
    activeDrones,
    checkedInDrones,
    checkInDrone,
    checkOutDrone,
    checkInProject,
    checkOutProject,
    checkInAllDrones,
    checkOutAllDrones,
    syncProjectsFromCheckedIn,
    globalAlertThresholds,
    setDroneAlertThresholds,
    getDroneMonitoringConfig,
    getDronesForProject,
    initializeMockData,
  } = useUTMStore()

  // 初回マウント時にモックデータを初期化（ドローンがない場合）
  useEffect(() => {
    if (activeDrones.length === 0) {
      initializeMockData()
    }
  }, [activeDrones.length, initializeMockData])

  // 機体別設定の展開状態
  const [expandedDroneId, setExpandedDroneId] = useState<string | null>(null)

  // プリフライトチェックリスト状態
  const [preflightChecklist, setPreflightChecklist] =
    useState<PreflightChecklist | null>(null)

  // プリフライトチェックリスト初期化（常に作成）
  useEffect(() => {
    if (!preflightChecklist) {
      const checkedInDroneList = Object.keys(checkedInDrones)
      const droneId =
        checkedInDroneList.length > 0 ? checkedInDroneList[0] : 'default-drone'
      const checklist = createMockPreflightChecklist(
        `fp-${droneId}`,
        droneId,
        0
      )
      setPreflightChecklist(checklist)
    }
  }, [checkedInDrones, preflightChecklist])

  // プリフライトチェック項目の更新
  const handleUpdateCheckItem = (itemId: string, checked: boolean) => {
    if (!preflightChecklist) return

    setPreflightChecklist((prev) => {
      if (!prev) return prev

      const updatedResults = prev.results.map((result) =>
        result.itemId === itemId
          ? {
              ...result,
              checked,
              checkedAt: checked ? new Date().toISOString() : null,
              checkedBy: checked ? 'pilot-001' : null,
            }
          : result
      )

      // ステータス計算
      const checkedCount = updatedResults.filter((r) => r.checked).length
      let newStatus: PreflightChecklist['status'] = 'pending'
      if (checkedCount === 0) {
        newStatus = 'pending'
      } else if (checkedCount < prev.items.length) {
        newStatus = 'in_progress'
      } else {
        const allRequiredPassed = prev.items
          .filter((item) => item.required)
          .every((item) => {
            const res = updatedResults.find((r) => r.itemId === item.id)
            return res?.checked
          })
        newStatus = allRequiredPassed ? 'completed' : 'failed'
      }

      return {
        ...prev,
        results: updatedResults,
        status: newStatus,
        allRequiredPassed:
          newStatus === 'completed' ||
          prev.items
            .filter((item) => item.required)
            .every((item) => {
              const res = updatedResults.find((r) => r.itemId === item.id)
              return res?.checked
            }),
      }
    })
  }

  // プリフライトチェックリストのリセット
  const handleResetChecklist = () => {
    if (!preflightChecklist) return
    const resetChecklist = createMockPreflightChecklist(
      preflightChecklist.flightPlanId,
      preflightChecklist.droneId,
      0
    )
    setPreflightChecklist(resetChecklist)
  }

  // チェックイン済みドローンIDセット
  const checkedInDroneIds = useMemo(
    () => new Set(Object.keys(checkedInDrones)),
    [checkedInDrones]
  )

  // アクティブなプロジェクトのみ表示
  const activeProjects = useMemo(
    () =>
      projects.filter((p) => p.status === 'active' || p.status === 'scheduled'),
    [projects]
  )

  // プロジェクトごとのドローン取得（storeの関数を使用）
  const getProjectDrones = (project: UTMProject): DroneFlightStatus[] => {
    return getDronesForProject(project.id)
  }

  // サマリー計算
  const totalDrones = activeDrones.length
  const checkedInCount = checkedInDroneIds.size
  const activeProjectsCount = activeProjects.filter(
    (p) => p.status === 'active'
  ).length

  // 全選択/全解除
  const allCheckedIn = checkedInCount === totalDrones && totalDrones > 0
  const handleToggleAll = () => {
    if (allCheckedIn) {
      checkOutAllDrones()
    } else {
      checkInAllDrones()
    }
  }

  // 監視開始
  const handleStartMonitoring = () => {
    // チェックイン済みドローンのプロジェクトを選択状態に同期
    syncProjectsFromCheckedIn()
    navigate('/operations/monitoring')
  }

  const glassStyle = {
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(30, 41, 59, 0.85)'
        : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* ヘッダー */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}>
        <Box>
          <Typography variant='h4' fontWeight={700} gutterBottom>
            飛行準備
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            監視対象の機体を選択し、アラート設定を確認してから監視を開始してください
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant='outlined'
            onClick={handleToggleAll}
            startIcon={<PlaylistAddCheckIcon />}>
            {allCheckedIn ? '全解除' : '全選択'}
          </Button>
          <Button
            variant='contained'
            onClick={handleStartMonitoring}
            disabled={checkedInCount === 0}
            startIcon={<CheckCircleOutlineIcon />}
            sx={{
              bgcolor: colors.success.main,
              '&:hover': { bgcolor: colors.success.dark },
            }}>
            監視を開始 ({checkedInCount}機)
          </Button>
        </Box>
      </Box>

      {/* サマリーカード */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <SummaryCard
            title='今日の予定フライト'
            value={activeProjectsCount}
            total={activeProjects.length}
            color={colors.info.main}
            icon={<FlightTakeoffIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <SummaryCard
            title='チェックイン済み機体'
            value={checkedInCount}
            total={totalDrones}
            color={colors.success.main}
            icon={<CheckCircleOutlineIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <SummaryCard
            title='アクティブプロジェクト'
            value={activeProjectsCount}
            color={colors.primary[500]}
            icon={<FlightIcon sx={{ transform: 'rotate(45deg)' }} />}
          />
        </Grid>
      </Grid>

      {/* タブ */}
      <Paper
        elevation={0}
        sx={{
          ...glassStyle,
          borderRadius: 2,
          mb: 2,
        }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab
            icon={<PlaylistAddCheckIcon />}
            iconPosition='start'
            label='機体選択'
          />
          <Tab icon={<SettingsIcon />} iconPosition='start' label='監視設定' />
          <Tab
            icon={<AssignmentTurnedInIcon />}
            iconPosition='start'
            label='プリフライト'
          />
        </Tabs>
      </Paper>

      {/* タブコンテンツ: 機体選択 */}
      {activeTab === 0 && (
        <>
          <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
            プロジェクト一覧
          </Typography>

          {activeProjects.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                ...glassStyle,
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
              }}>
              <Typography variant='body1' color='text.secondary'>
                アクティブなプロジェクトがありません
              </Typography>
            </Paper>
          ) : (
            activeProjects.map((project) => {
              const projectDrones = getProjectDrones(project)
              return (
                <ProjectCheckinCard
                  key={project.id}
                  project={project}
                  drones={projectDrones}
                  checkedInDroneIds={checkedInDroneIds}
                  onCheckInDrone={checkInDrone}
                  onCheckOutDrone={checkOutDrone}
                  onCheckInProject={() => checkInProject(project.id)}
                  onCheckOutProject={() => checkOutProject(project.id)}
                />
              )
            })
          )}
        </>
      )}

      {/* タブコンテンツ: 監視設定 */}
      {activeTab === 1 && (
        <Paper
          elevation={0}
          sx={{
            ...glassStyle,
            borderRadius: 2,
            p: 3,
          }}>
          <Typography variant='h6' fontWeight={600} sx={{ mb: 3 }}>
            <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            アラート設定
          </Typography>

          <Grid container spacing={3}>
            {/* バッテリー閾値 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant='subtitle2' gutterBottom>
                バッテリー警告閾値
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  defaultValue={globalAlertThresholds?.batteryWarning || 30}
                  min={5}
                  max={50}
                  step={5}
                  marks={[
                    { value: 10, label: '10%' },
                    { value: 20, label: '20%' },
                    { value: 30, label: '30%' },
                    { value: 40, label: '40%' },
                  ]}
                  valueLabelDisplay='auto'
                  valueLabelFormat={(v) => `${v}%`}
                />
              </Box>
              <Typography variant='caption' color='text.secondary'>
                バッテリー残量がこの値以下になると警告を表示
              </Typography>
            </Grid>

            {/* 信号強度閾値 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant='subtitle2' gutterBottom>
                信号強度警告閾値
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  defaultValue={globalAlertThresholds?.signalWarning || 40}
                  min={10}
                  max={60}
                  step={5}
                  marks={[
                    { value: 20, label: '20%' },
                    { value: 30, label: '30%' },
                    { value: 40, label: '40%' },
                    { value: 50, label: '50%' },
                  ]}
                  valueLabelDisplay='auto'
                  valueLabelFormat={(v) => `${v}%`}
                />
              </Box>
              <Typography variant='caption' color='text.secondary'>
                信号強度がこの値以下になると警告を表示
              </Typography>
            </Grid>

            {/* 最大高度閾値 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant='subtitle2' gutterBottom>
                最大高度警告閾値
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  defaultValue={globalAlertThresholds?.maxAltitude || 150}
                  min={50}
                  max={300}
                  step={10}
                  marks={[
                    { value: 100, label: '100m' },
                    { value: 150, label: '150m' },
                    { value: 200, label: '200m' },
                    { value: 250, label: '250m' },
                  ]}
                  valueLabelDisplay='auto'
                  valueLabelFormat={(v) => `${v}m`}
                />
              </Box>
              <Typography variant='caption' color='text.secondary'>
                飛行高度がこの値を超えると警告を表示
              </Typography>
            </Grid>

            {/* 最小高度閾値 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant='subtitle2' gutterBottom>
                最小高度警告閾値
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  defaultValue={globalAlertThresholds?.minAltitude || 0}
                  min={0}
                  max={50}
                  step={5}
                  marks={[
                    { value: 0, label: '0m' },
                    { value: 10, label: '10m' },
                    { value: 20, label: '20m' },
                    { value: 30, label: '30m' },
                  ]}
                  valueLabelDisplay='auto'
                  valueLabelFormat={(v) => `${v}m`}
                />
              </Box>
              <Typography variant='caption' color='text.secondary'>
                飛行高度がこの値以下になると警告を表示
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* 機体別アラート設定 */}
          <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
            <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            機体別設定
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            チェックイン済みの機体ごとに個別の閾値を設定できます（未設定の場合はグローバル設定が適用されます）
          </Typography>

          {checkedInDroneIds.size === 0 ? (
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ fontStyle: 'italic' }}>
              機体選択タブでドローンをチェックインしてください
            </Typography>
          ) : (
            <Stack spacing={1}>
              {Array.from(checkedInDroneIds).map((droneId) => {
                const drone = activeDrones.find((d) => d.droneId === droneId)
                const droneConfig = getDroneMonitoringConfig(droneId)
                const isExpanded = expandedDroneId === droneId
                const hasCustomConfig =
                  droneConfig &&
                  (droneConfig.alertThresholds.batteryWarning !==
                    globalAlertThresholds?.batteryWarning ||
                    droneConfig.alertThresholds.signalWarning !==
                      globalAlertThresholds?.signalWarning ||
                    droneConfig.alertThresholds.maxAltitude !==
                      globalAlertThresholds?.maxAltitude ||
                    droneConfig.alertThresholds.minAltitude !==
                      globalAlertThresholds?.minAltitude)

                return (
                  <Paper
                    key={droneId}
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: isExpanded ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}>
                    <Box
                      onClick={() =>
                        setExpandedDroneId(isExpanded ? null : droneId)
                      }
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FlightIcon color='primary' fontSize='small' />
                        <Typography variant='subtitle2'>
                          {drone?.droneName || droneId}
                        </Typography>
                        {hasCustomConfig && (
                          <Chip
                            label='カスタム'
                            size='small'
                            color='info'
                            variant='outlined'
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                      <IconButton size='small'>
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>

                    <Collapse in={isExpanded}>
                      <Box sx={{ p: 2, pt: 0, bgcolor: 'background.default' }}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography
                              variant='caption'
                              color='text.secondary'>
                              バッテリー警告
                            </Typography>
                            <Slider
                              value={
                                droneConfig?.alertThresholds.batteryWarning ||
                                globalAlertThresholds?.batteryWarning ||
                                30
                              }
                              onChange={(_, value) =>
                                setDroneAlertThresholds(droneId, {
                                  batteryWarning: value as number,
                                })
                              }
                              min={5}
                              max={50}
                              step={5}
                              valueLabelDisplay='auto'
                              valueLabelFormat={(v) => `${v}%`}
                              size='small'
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography
                              variant='caption'
                              color='text.secondary'>
                              信号強度警告
                            </Typography>
                            <Slider
                              value={
                                droneConfig?.alertThresholds.signalWarning ||
                                globalAlertThresholds?.signalWarning ||
                                40
                              }
                              onChange={(_, value) =>
                                setDroneAlertThresholds(droneId, {
                                  signalWarning: value as number,
                                })
                              }
                              min={10}
                              max={60}
                              step={5}
                              valueLabelDisplay='auto'
                              valueLabelFormat={(v) => `${v}%`}
                              size='small'
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography
                              variant='caption'
                              color='text.secondary'>
                              最大高度
                            </Typography>
                            <Slider
                              value={
                                droneConfig?.alertThresholds.maxAltitude ||
                                globalAlertThresholds?.maxAltitude ||
                                150
                              }
                              onChange={(_, value) =>
                                setDroneAlertThresholds(droneId, {
                                  maxAltitude: value as number,
                                })
                              }
                              min={50}
                              max={300}
                              step={10}
                              valueLabelDisplay='auto'
                              valueLabelFormat={(v) => `${v}m`}
                              size='small'
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography
                              variant='caption'
                              color='text.secondary'>
                              最小高度
                            </Typography>
                            <Slider
                              value={
                                droneConfig?.alertThresholds.minAltitude ||
                                globalAlertThresholds?.minAltitude ||
                                0
                              }
                              onChange={(_, value) =>
                                setDroneAlertThresholds(droneId, {
                                  minAltitude: value as number,
                                })
                              }
                              min={0}
                              max={50}
                              step={5}
                              valueLabelDisplay='auto'
                              valueLabelFormat={(v) => `${v}m`}
                              size='small'
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </Paper>
                )
              })}
            </Stack>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
            音声通知
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            アラート発生時の音声通知は監視画面で設定できます
          </Typography>
        </Paper>
      )}

      {/* タブコンテンツ: プリフライトチェック */}
      {activeTab === 2 && (
        <Paper
          elevation={0}
          sx={{
            ...glassStyle,
            borderRadius: 2,
            overflow: 'hidden',
          }}>
          {preflightChecklist ? (
            <UTMPreflightPanel
              checklist={preflightChecklist}
              onToggleItem={handleUpdateCheckItem}
              onComplete={handleStartMonitoring}
              onReset={handleResetChecklist}
            />
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant='body2' color='text.secondary'>
                プリフライトチェックリストを読み込み中...
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* 固定フッター */}
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 3,
          ...glassStyle,
          borderRadius: 0,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        }}>
        <Typography variant='body1'>
          <strong>{checkedInCount}</strong> / {totalDrones} 機がチェックイン済み
        </Typography>
        <Button
          variant='contained'
          size='large'
          onClick={handleStartMonitoring}
          disabled={checkedInCount === 0}
          startIcon={<CheckCircleOutlineIcon />}
          sx={{
            bgcolor: colors.success.main,
            '&:hover': { bgcolor: colors.success.dark },
            minWidth: 200,
          }}>
          監視を開始
        </Button>
      </Paper>

      {/* フッター分のスペース */}
      <Box sx={{ height: 80 }} />
    </Box>
  )
}

export default CheckinPage
