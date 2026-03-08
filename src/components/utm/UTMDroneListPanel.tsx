import AccessTimeIcon from '@mui/icons-material/AccessTime'
import Battery60Icon from '@mui/icons-material/Battery60'
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert'
import BatteryFullIcon from '@mui/icons-material/BatteryFull'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FlightIcon from '@mui/icons-material/Flight'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import HeightIcon from '@mui/icons-material/Height'
import SignalCellular0BarIcon from '@mui/icons-material/SignalCellular0Bar'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt'
import SpeedIcon from '@mui/icons-material/Speed'
import WarningIcon from '@mui/icons-material/Warning'
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
  Avatar,
  alpha,
  useTheme,
  keyframes,
  Collapse,
  IconButton,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemo, useState, memo } from 'react'

import { useProjectSettingsOptional } from '@/contexts/ProjectSettingsContext'
import { colors } from '@/styles/tokens'

import type {
  DroneFlightStatus,
  UTMAlert,
  UTMProject,
} from '../../types/utmTypes'

// 警告点滅アニメーション
const alertPulse = keyframes`
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: ${alpha(colors.error.main, 0.15)};
  }
`

// ステータスラベル定数
const STATUS_LABELS: Record<DroneFlightStatus['status'], string> = {
  preflight: '飛行前',
  takeoff: '離陸中',
  in_flight: '飛行中',
  landing: '着陸中',
  landed: '着陸済み',
  emergency: '緊急',
  rth: '帰還中',
  hovering: 'ホバリング',
}

const getStatusLabel = (status: DroneFlightStatus['status']): string => {
  return STATUS_LABELS[status]
}

// ステータス色とグラデーション（コンテキストメニューと統一）
const getStatusStyle = (status: DroneFlightStatus['status']) => {
  switch (status) {
    case 'in_flight':
      return {
        color: 'success' as const,
        gradient: `linear-gradient(135deg, ${colors.success.main}, ${colors.success.dark})`,
        bgColor: colors.success.main,
      }
    case 'takeoff':
      return {
        color: 'info' as const,
        gradient: `linear-gradient(135deg, ${colors.info.main}, ${colors.info.dark})`,
        bgColor: colors.info.main,
      }
    case 'hovering': // ホバリング - 黄色（注意）
      return {
        color: 'warning' as const,
        gradient: `linear-gradient(135deg, ${colors.warning.main}, ${colors.warning.dark})`,
        bgColor: colors.warning.main,
      }
    case 'rth': // 緊急帰還 - 赤（緊急）
    case 'emergency':
      return {
        color: 'error' as const,
        gradient: `linear-gradient(135deg, ${colors.error.main}, ${colors.error.dark})`,
        bgColor: colors.error.main,
      }
    case 'landing': // 着陸中 - グレー（通常動作）
    case 'landed': // 着陸済み - グレー
      return {
        color: 'default' as const,
        gradient: `linear-gradient(135deg, ${colors.gray[400]}, ${colors.gray[500]})`,
        bgColor: colors.gray[400],
      }
    case 'preflight':
      return {
        color: 'info' as const,
        gradient: `linear-gradient(135deg, ${colors.info.main}, ${colors.info.dark})`,
        bgColor: colors.info.main,
      }
    default:
      return {
        color: 'default' as const,
        gradient: `linear-gradient(135deg, ${colors.gray[400]}, ${colors.gray[500]})`,
        bgColor: colors.gray[400],
      }
  }
}

// バッテリーアイコン
const getBatteryIcon = (level: number) => {
  if (level > 60)
    return <BatteryFullIcon sx={{ color: colors.success.main, fontSize: 16 }} />
  if (level > 20)
    return <Battery60Icon sx={{ color: colors.warning.main, fontSize: 16 }} />
  return <BatteryAlertIcon sx={{ color: colors.error.main, fontSize: 16 }} />
}

// 信号アイコン
const getSignalIcon = (strength: number) => {
  if (strength > 50)
    return (
      <SignalCellularAltIcon
        sx={{ color: colors.success.main, fontSize: 16 }}
      />
    )
  if (strength > 20)
    return (
      <SignalCellularAltIcon
        sx={{ color: colors.warning.main, fontSize: 16 }}
      />
    )
  return (
    <SignalCellular0BarIcon sx={{ color: colors.error.main, fontSize: 16 }} />
  )
}

// 飛行時間計算
const getFlightDuration = (startTime: Date): string => {
  const now = new Date()
  const diff = now.getTime() - new Date(startTime).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h${mins}m`
  }
  return `${mins}m`
}

// プロジェクトグループの型
interface ProjectGroup {
  project: UTMProject | null
  drones: DroneFlightStatus[]
  color: string
}

interface UTMDroneListPanelProps {
  drones: DroneFlightStatus[]
  selectedDroneId: string | null
  onDroneSelect: (drone: DroneFlightStatus) => void
  alerts?: UTMAlert[]
  projects?: UTMProject[]
}

const UTMDroneListPanelComponent = ({
  drones,
  selectedDroneId,
  onDroneSelect,
  alerts = [],
  projects = [],
}: UTMDroneListPanelProps) => {
  const theme = useTheme()
  const { formatters } = useProjectSettingsOptional()

  // 折りたたみ状態の管理（プロジェクトIDをキー）
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(
    new Set()
  )

  // プロジェクトの折りたたみトグル
  const toggleProjectCollapse = (projectId: string) => {
    setCollapsedProjects((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) {
        next.delete(projectId)
      } else {
        next.add(projectId)
      }
      return next
    })
  }

  // 未確認の重大アラートがあるドローンIDのセット
  const dronesWithUnacknowledgedAlerts = useMemo(() => {
    const droneIds = new Set<string>()
    alerts.forEach((alert) => {
      if (
        !alert.acknowledged &&
        (alert.severity === 'critical' || alert.severity === 'emergency')
      ) {
        droneIds.add(alert.droneId)
      }
    })
    return droneIds
  }, [alerts])

  // ドローンをプロジェクト別にグループ化
  const groupedDrones = useMemo(() => {
    const projectMap = new Map<string, UTMProject>()
    projects.forEach((p) => projectMap.set(p.id, p))

    const groups: ProjectGroup[] = []
    const dronesByProject = new Map<string, DroneFlightStatus[]>()
    const unassignedDrones: DroneFlightStatus[] = []

    // ドローンをプロジェクトIDでグループ化
    drones.forEach((drone) => {
      if (drone.projectId && projectMap.has(drone.projectId)) {
        const existing = dronesByProject.get(drone.projectId) || []
        existing.push(drone)
        dronesByProject.set(drone.projectId, existing)
      } else {
        unassignedDrones.push(drone)
      }
    })

    // プロジェクトごとにグループを作成（飛行中のドローンがいるプロジェクトを先に）
    const projectsWithDrones = Array.from(dronesByProject.entries())
      .map(([projectId, projectDrones]) => {
        const project = projectMap.get(projectId) ?? null
        return {
          project,
          drones: projectDrones,
          color: project?.flightArea?.color || colors.primary[500],
          hasActiveFlights: projectDrones.some((d) => d.status === 'in_flight'),
        }
      })
      .sort((a, b) => {
        // 飛行中のドローンがいるプロジェクトを先に
        if (a.hasActiveFlights && !b.hasActiveFlights) return -1
        if (!a.hasActiveFlights && b.hasActiveFlights) return 1
        return 0
      })

    projectsWithDrones.forEach(({ project, drones: projectDrones, color }) => {
      groups.push({ project, drones: projectDrones, color })
    })

    // 未割り当てドローンがあれば追加
    if (unassignedDrones.length > 0) {
      groups.push({
        project: null,
        drones: unassignedDrones,
        color: colors.gray[500],
      })
    }

    return groups
  }, [drones, projects])

  const glassStyle = useMemo(
    () => ({
      background:
        theme.palette.mode === 'dark'
          ? 'rgba(30, 41, 59, 0.8)'
          : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    }),
    [theme.palette.mode, theme.palette.divider]
  )

  // アクティブなドローン数（メモ化）
  const activeCount = useMemo(
    () => drones.filter((d) => d.status === 'in_flight').length,
    [drones]
  )

  // ドローンアイテムのレンダリング
  const renderDroneItem = (
    drone: DroneFlightStatus,
    projectColor: string,
    project: UTMProject | null
  ) => {
    const statusStyle = getStatusStyle(drone.status)
    const isSelected = selectedDroneId === drone.droneId
    const hasUnacknowledgedAlert = dronesWithUnacknowledgedAlerts.has(
      drone.droneId
    )

    // プロジェクト名+場所名を組み合わせた表示名
    const displayTitle = project
      ? `${project.name} ${project.location}`
      : 'プロジェクト未割り当て'

    return (
      <ListItem key={drone.droneId} disablePadding>
        <ListItemButton
          selected={isSelected}
          onClick={() => onDroneSelect(drone)}
          sx={{
            py: 0.75,
            px: 1.5,
            pl: 3,
            transition: 'all 0.2s ease',
            borderLeft: hasUnacknowledgedAlert
              ? `3px solid ${colors.error.main}`
              : isSelected
                ? `3px solid ${projectColor}`
                : `3px solid transparent`,
            background: isSelected
              ? theme.palette.mode === 'dark'
                ? alpha(projectColor, 0.15)
                : alpha(projectColor, 0.08)
              : 'transparent',
            ...(hasUnacknowledgedAlert && {
              animation: `${alertPulse} 1.5s ease-in-out infinite`,
            }),
            '&:hover': {
              background:
                theme.palette.mode === 'dark'
                  ? alpha(projectColor, 0.1)
                  : alpha(projectColor, 0.05),
            },
          }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                background: hasUnacknowledgedAlert
                  ? `linear-gradient(135deg, ${colors.error.main}, ${colors.error.dark})`
                  : `linear-gradient(135deg, ${projectColor}, ${alpha(projectColor, 0.7)})`,
                boxShadow: hasUnacknowledgedAlert
                  ? `0 2px 8px ${alpha(colors.error.main, 0.4)}`
                  : `0 2px 6px ${alpha(projectColor, 0.3)}`,
              }}>
              <FlightIcon
                sx={{
                  fontSize: 14,
                  transform: 'rotate(-45deg)',
                }}
              />
            </Avatar>
          </ListItemIcon>
          <ListItemText
            disableTypography
            primary={
              <Stack direction='row' alignItems='center' gap={0.5}>
                {hasUnacknowledgedAlert && (
                  <WarningIcon
                    sx={{
                      fontSize: 14,
                      color: colors.error.main,
                    }}
                  />
                )}
                <Typography
                  variant='body2'
                  fontWeight={600}
                  sx={{
                    color: hasUnacknowledgedAlert
                      ? colors.error.main
                      : isSelected
                        ? projectColor
                        : 'text.primary',
                    fontSize: '0.75rem',
                  }}>
                  {displayTitle}
                </Typography>
                <Chip
                  label={getStatusLabel(drone.status)}
                  size='small'
                  sx={{
                    height: 16,
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    background: statusStyle.gradient,
                    color: 'white',
                    '& .MuiChip-label': { px: 0.5 },
                  }}
                />
              </Stack>
            }
            secondary={
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                  mt: 0.25,
                  flexWrap: 'wrap',
                }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <FlightIcon
                    sx={{
                      fontSize: 11,
                      color: 'text.secondary',
                      transform: 'rotate(-45deg)',
                    }}
                  />
                  <Typography variant='caption' sx={{ fontSize: '0.65rem' }}>
                    {drone.droneName}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <HeightIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                  <Typography variant='caption' sx={{ fontSize: '0.65rem' }}>
                    {formatters.units.altitude(drone.position.altitude, 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <SpeedIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                  <Typography variant='caption' sx={{ fontSize: '0.65rem' }}>
                    {formatters.units.speed(drone.position.speed, 1)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  {getBatteryIcon(drone.batteryLevel)}
                  <Typography variant='caption' sx={{ fontSize: '0.65rem' }}>
                    {drone.batteryLevel.toFixed(0)}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  {getSignalIcon(drone.signalStrength)}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <AccessTimeIcon
                    sx={{ fontSize: 11, color: 'text.secondary' }}
                  />
                  <Typography variant='caption' sx={{ fontSize: '0.65rem' }}>
                    {getFlightDuration(drone.startTime)}
                  </Typography>
                </Box>
              </Box>
            }
          />
        </ListItemButton>
      </ListItem>
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 3,
        ...glassStyle,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px rgba(0, 0, 0, 0.08)',
      }}>
      {/* ヘッダー */}
      <Box
        sx={{
          p: 1.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background:
            theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha(colors.primary[500], 0.1)} 0%, transparent 100%)`
              : `linear-gradient(135deg, ${alpha(colors.primary[500], 0.05)} 0%, transparent 100%)`,
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              p: 0.75,
              borderRadius: 1.5,
              background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[700]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 3px 10px ${alpha(colors.primary[500], 0.3)}`,
            }}>
            <FlightTakeoffIcon sx={{ color: 'white', fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant='subtitle2' fontWeight={700}>
              飛行中ドローン
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontSize: '0.65rem' }}>
              プロジェクト別表示
            </Typography>
          </Box>
        </Box>
        <Chip
          label={`${activeCount} / ${drones.length}`}
          size='small'
          sx={{
            height: 22,
            fontWeight: 700,
            fontSize: '0.7rem',
            background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`,
            color: 'white',
            boxShadow: `0 2px 6px ${alpha(colors.primary[500], 0.3)}`,
          }}
        />
      </Box>

      {/* プロジェクト別ドローンリスト */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {drones.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 6,
                color: 'text.secondary',
              }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${alpha(colors.gray[400], 0.2)}, ${alpha(colors.gray[400], 0.05)})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                }}>
                <FlightIcon sx={{ fontSize: 30, opacity: 0.5 }} />
              </Box>
              <Typography variant='body2' fontWeight={600}>
                飛行中のドローンはありません
              </Typography>
            </Box>
          </motion.div>
        ) : (
          <List disablePadding>
            <AnimatePresence>
              {groupedDrones.map((group, groupIndex) => {
                const projectId = group.project?.id || 'unassigned'
                const isCollapsed = collapsedProjects.has(projectId)
                const activeInGroup = group.drones.filter(
                  (d) => d.status === 'in_flight'
                ).length
                const projectStatus = group.project?.status

                return (
                  <motion.div
                    key={projectId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: groupIndex * 0.05 }}>
                    {/* プロジェクトヘッダー */}
                    <Box
                      onClick={() => toggleProjectCollapse(projectId)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 1.5,
                        py: 1,
                        cursor: 'pointer',
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                        background:
                          theme.palette.mode === 'dark'
                            ? alpha(group.color, 0.08)
                            : alpha(group.color, 0.04),
                        '&:hover': {
                          background:
                            theme.palette.mode === 'dark'
                              ? alpha(group.color, 0.12)
                              : alpha(group.color, 0.08),
                        },
                        transition: 'background 0.2s ease',
                      }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          flex: 1,
                          minWidth: 0,
                        }}>
                        {/* プロジェクトカラーインジケーター */}
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: group.color,
                            flexShrink: 0,
                            boxShadow:
                              projectStatus === 'active'
                                ? `0 0 0 2px ${alpha(group.color, 0.3)}`
                                : 'none',
                            animation:
                              projectStatus === 'active'
                                ? 'pulse 2s infinite'
                                : 'none',
                            '@keyframes pulse': {
                              '0%': {
                                boxShadow: `0 0 0 0 ${alpha(group.color, 0.4)}`,
                              },
                              '70%': {
                                boxShadow: `0 0 0 6px ${alpha(group.color, 0)}`,
                              },
                              '100%': {
                                boxShadow: `0 0 0 0 ${alpha(group.color, 0)}`,
                              },
                            },
                          }}
                        />
                        {/* プロジェクト名 */}
                        <Typography
                          variant='body2'
                          fontWeight={700}
                          sx={{
                            color: group.color,
                            fontSize: '0.75rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                          {group.project?.location ||
                            group.project?.name ||
                            '未割り当て'}
                        </Typography>
                      </Box>
                      {/* ドローン数とステータス */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}>
                        <Chip
                          label={
                            activeInGroup > 0
                              ? `${activeInGroup}機`
                              : `${group.drones.length}機`
                          }
                          size='small'
                          sx={{
                            height: 18,
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            bgcolor:
                              activeInGroup > 0
                                ? alpha(colors.success.main, 0.15)
                                : alpha(colors.gray[500], 0.1),
                            color:
                              activeInGroup > 0
                                ? colors.success.main
                                : 'text.secondary',
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />
                        <IconButton
                          size='small'
                          sx={{
                            p: 0.25,
                            color: 'text.secondary',
                          }}>
                          {isCollapsed ? (
                            <ExpandMoreIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <ExpandLessIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </Box>
                    </Box>

                    {/* ドローンリスト */}
                    <Collapse in={!isCollapsed}>
                      <List disablePadding>
                        {group.drones.map((drone) =>
                          renderDroneItem(drone, group.color, group.project)
                        )}
                      </List>
                    </Collapse>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </List>
        )}
      </Box>
    </Paper>
  )
}

// 浅い比較でpropsの変更を検出
const arePropsEqual = (
  prevProps: UTMDroneListPanelProps,
  nextProps: UTMDroneListPanelProps
): boolean => {
  // ドローン数が変わった場合
  if (prevProps.drones.length !== nextProps.drones.length) return false

  // ドローンの状態が変わった場合（ID、ステータス、位置の主要な値のみチェック）
  for (let i = 0; i < prevProps.drones.length; i++) {
    const prev = prevProps.drones[i]
    const next = nextProps.drones[i]
    if (
      prev.droneId !== next.droneId ||
      prev.status !== next.status ||
      prev.batteryLevel !== next.batteryLevel ||
      prev.position.altitude !== next.position.altitude ||
      prev.position.speed !== next.position.speed
    ) {
      return false
    }
  }

  // 選択状態
  if (prevProps.selectedDroneId !== nextProps.selectedDroneId) return false

  // アラートの数
  if (prevProps.alerts?.length !== nextProps.alerts?.length) return false

  // プロジェクトの数
  if (prevProps.projects?.length !== nextProps.projects?.length) return false

  return true
}

// React.memoでラップしてエクスポート
const UTMDroneListPanel = memo(UTMDroneListPanelComponent, arePropsEqual)

export default UTMDroneListPanel
