import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FlightIcon from '@mui/icons-material/Flight'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Box,
  Checkbox,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useState } from 'react'

import useUTMStore from '@/store/utmStore'
import { colors } from '@/styles/tokens'
import type { DroneFlightStatus, UTMProject } from '@/types/utmTypes'

export interface UTMProjectDroneSelectorProps {
  /** プロジェクト一覧 */
  projects: UTMProject[]
  /** アクティブなドローン一覧 */
  activeDrones: DroneFlightStatus[]
  /** ドローン設定モーダルを開くコールバック */
  onOpenDroneSettings: (drone: DroneFlightStatus) => void
  /** カスタムスタイル */
  sx?: object
}

/**
 * UTMProjectDroneSelector - プロジェクト・ドローン階層選択UI
 *
 * 機能:
 * - プロジェクト単位で展開/折りたたみ
 * - 各ドローンの監視状態 ON/OFF チェックボックス
 * - ドローン別の設定アイコン（Modal起動）
 * - プロジェクト内のドローン数を表示
 */
export const UTMProjectDroneSelector = ({
  projects,
  activeDrones,
  onOpenDroneSettings,
  sx,
}: UTMProjectDroneSelectorProps) => {
  const theme = useTheme()
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(projects.map((p) => p.id))
  )

  // Zustand ストアアクション
  const { monitoredDroneConfigs, toggleDroneMonitoring } = useUTMStore()

  // プロジェクトの展開/折りたたみ切り替え
  const toggleProjectExpanded = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
  }

  // プロジェクトのドローンを取得
  const getProjectDrones = (project: UTMProject): DroneFlightStatus[] => {
    if (!project.droneIds) return []
    const droneIdSet = new Set(project.droneIds)
    return activeDrones.filter((d) => droneIdSet.has(d.droneId))
  }

  // グラスモーフィズムスタイル
  const glassStyle = {
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(30, 41, 59, 0.9)'
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
        overflow: 'auto',
        ...sx,
      }}>
      <List disablePadding>
        {projects.map((project) => {
          const projectDrones = getProjectDrones(project)
          const isExpanded = expandedProjects.has(project.id)
          const activeDroneCount = projectDrones.filter((d) => {
            const config = monitoredDroneConfigs[d.droneId]
            // 設定がない場合は監視ON、isMonitored !== false なら監視ON
            return config?.isMonitored !== false
          }).length

          return (
            <Box key={project.id}>
              {/* プロジェクトヘッダー */}
              <ListItemButton
                onClick={() => toggleProjectExpanded(project.id)}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                  },
                }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 24,
                      height: 24,
                      color: isExpanded
                        ? theme.palette.primary.main
                        : 'text.secondary',
                    }}>
                    {isExpanded ? (
                      <ExpandLessIcon fontSize='small' />
                    ) : (
                      <ExpandMoreIcon fontSize='small' />
                    )}
                  </Box>
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>
                      {project.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant='caption' color='text.secondary'>
                      {project.location} • {projectDrones.length} 機
                    </Typography>
                  }
                />

                {/* アクティブなドローン数バッジ */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    ml: 1,
                  }}>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      bgcolor: alpha(colors.success.main, 0.15),
                      borderRadius: 1,
                      textAlign: 'center',
                    }}>
                    <Typography
                      variant='caption'
                      sx={{
                        fontWeight: 700,
                        color: colors.success.main,
                      }}>
                      監視中: {activeDroneCount}
                    </Typography>
                  </Box>
                </Box>
              </ListItemButton>

              {/* ドローンリスト（展開時） */}
              <Collapse in={isExpanded} timeout='auto' unmountOnExit>
                <List
                  disablePadding
                  sx={{
                    bgcolor: alpha(theme.palette.background.default, 0.4),
                  }}>
                  {projectDrones.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant='caption' color='text.secondary'>
                        このプロジェクトには登録ドローンがありません
                      </Typography>
                    </Box>
                  ) : (
                    projectDrones.map((drone) => {
                      const config = monitoredDroneConfigs[drone.droneId]
                      const isMonitored = config?.isMonitored !== false // デフォルトON
                      const displayName =
                        config?.customDroneName || drone.droneName

                      return (
                        <Box
                          key={drone.droneId}
                          sx={{
                            py: 1.5,
                            px: 2,
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.action.hover, 0.05),
                            },
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}>
                          {/* モニタリング ON/OFF チェックボックス */}
                          <Checkbox
                            edge='start'
                            checked={isMonitored}
                            onChange={() =>
                              toggleDroneMonitoring(drone.droneId)
                            }
                            tabIndex={-1}
                            disableRipple
                            size='small'
                            sx={{ ml: 0, mr: 1 }}
                          />

                          {/* ドローン情報 */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant='body2'
                              sx={{
                                fontWeight: 600,
                                color: 'text.primary',
                                opacity: isMonitored ? 1 : 0.5,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}>
                              {displayName}
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                mt: 0.25,
                                opacity: isMonitored ? 1 : 0.6,
                              }}>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                                sx={{ whiteSpace: 'nowrap' }}>
                                ID: {drone.droneId}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'>
                                •
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.3,
                                  minWidth: 0,
                                }}>
                                <FlightIcon
                                  sx={{
                                    fontSize: 12,
                                    color: 'text.secondary',
                                    flexShrink: 0,
                                  }}
                                />
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                  sx={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}>
                                  {drone.pilotName}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          {/* バッテリー/信号アイコン */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mr: 1,
                            }}>
                            {/* バッテリーレベルインジケータ */}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}>
                              <Box
                                sx={{
                                  width: 24,
                                  height: 12,
                                  border: `1px solid ${alpha(theme.palette.text.primary, 0.3)}`,
                                  borderRadius: 0.5,
                                  position: 'relative',
                                  overflow: 'hidden',
                                }}>
                                <Box
                                  sx={{
                                    height: '100%',
                                    width: `${drone.batteryLevel}%`,
                                    bgcolor:
                                      drone.batteryLevel > 30
                                        ? colors.success.main
                                        : drone.batteryLevel > 10
                                          ? colors.warning.main
                                          : colors.error.main,
                                    transition: 'all 0.3s ease',
                                  }}
                                />
                              </Box>
                              <Typography
                                variant='caption'
                                sx={{ minWidth: 24 }}>
                                {Math.round(drone.batteryLevel)}%
                              </Typography>
                            </Box>

                            {/* 信号強度インジケータ */}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}>
                              <Box
                                sx={{
                                  width: 24,
                                  height: 12,
                                  border: `1px solid ${alpha(theme.palette.text.primary, 0.3)}`,
                                  borderRadius: 0.5,
                                  position: 'relative',
                                  overflow: 'hidden',
                                }}>
                                <Box
                                  sx={{
                                    height: '100%',
                                    width: `${drone.signalStrength}%`,
                                    bgcolor:
                                      drone.signalStrength > 70
                                        ? colors.success.main
                                        : drone.signalStrength > 40
                                          ? colors.warning.main
                                          : colors.error.main,
                                    transition: 'all 0.3s ease',
                                  }}
                                />
                              </Box>
                              <Typography
                                variant='caption'
                                sx={{ minWidth: 24 }}>
                                {Math.round(drone.signalStrength)}%
                              </Typography>
                            </Box>
                          </Box>

                          {/* 設定アイコン */}
                          <Box
                            onClick={(e) => {
                              e.stopPropagation()
                              onOpenDroneSettings(drone)
                            }}
                            title='ドローン設定'
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              color: theme.palette.primary.main,
                              cursor: 'pointer',
                              flexShrink: 0,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                              },
                            }}>
                            <SettingsIcon fontSize='small' />
                          </Box>
                        </Box>
                      )
                    })
                  )}
                </List>
              </Collapse>
            </Box>
          )
        })}
      </List>
    </Paper>
  )
}

export default UTMProjectDroneSelector
