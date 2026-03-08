import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Select,
  Slider,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import React, { useState } from 'react'

import useUTMStore from '@/store/utmStore'
import type {
  AlertThresholds,
  DroneMonitoringConfig,
  SoundConfig,
} from '@/store/utmStore'
import { colors } from '@/styles/tokens'
import type { DroneFlightStatus } from '@/types/utmTypes'

export interface UTMDroneSettingsModalProps {
  open: boolean
  drone?: DroneFlightStatus
  config?: DroneMonitoringConfig
  projectName?: string
  onClose: () => void
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

// TabPanel コンポーネント
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <Box
      role='tabpanel'
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}>
      {value === index && (
        <Box
          sx={{
            py: 3,
            px: 3,
            overflow: 'auto',
            maxHeight: 'calc(80vh - 300px)',
          }}>
          {children}
        </Box>
      )}
    </Box>
  )
}

/**
 * UTMDroneSettingsModal - ドローン設定モーダル
 *
 * ドローン別の設定を編集するモーダルウィンドウ
 * - 基本情報（名前、プロジェクト、監視状態）
 * - アラート閾値（バッテリー、信号強度、高度）
 * - 音設定（警告、エラー、緊急）
 */
export const UTMDroneSettingsModal = ({
  open,
  drone,
  config,
  projectName,
  onClose,
}: UTMDroneSettingsModalProps) => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [isEditingName, setIsEditingName] = useState(false)
  const [customName, setCustomName] = useState(
    config?.customDroneName || drone?.droneName || ''
  )

  // Zustand ストアアクション
  const {
    toggleDroneMonitoring,
    setDroneAlertThresholds,
    setDroneSoundConfig,
    renameDrone,
  } = useUTMStore()

  if (!drone || !config) return null

  const droneId = drone.droneId
  const displayName = config.customDroneName || drone.droneName

  // ハンドラー
  const handleToggleMonitoring = () => {
    toggleDroneMonitoring(droneId)
  }

  const handleSaveName = () => {
    if (customName.trim()) {
      renameDrone(droneId, customName)
      setIsEditingName(false)
    }
  }

  const handleAlertThresholdChange = (
    key: keyof AlertThresholds,
    value: number
  ) => {
    setDroneAlertThresholds(droneId, {
      [key]: value,
    })
  }

  const handleSoundConfigChange = (key: keyof SoundConfig, value: unknown) => {
    setDroneSoundConfig(droneId, {
      [key]: value,
    })
  }

  const handleClose = () => {
    setIsEditingName(false)
    setCustomName(config.customDroneName || drone.droneName || '')
    onClose()
  }

  // グラスモーフィズムスタイル
  const glassStyle = {
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(30, 41, 59, 0.95)'
        : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(16px)',
  }

  const sectionTitleStyle = {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: theme.palette.primary.main,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    mb: 2.5,
    mt: 0.5,
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          ...glassStyle,
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
        },
      }}>
      {/* ダイアログタイトル */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          {/* 機体カラーインジケーター */}
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: theme.palette.primary.main,
              flexShrink: 0,
              boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.4)}`,
            }}
          />

          {/* ドローン設定テキスト */}
          <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ mb: 0.25 }}>
              ドローン設定
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minWidth: 0,
              }}>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                {displayName}
              </Typography>
              {projectName && (
                <>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ fontWeight: 600 }}>
                    •
                  </Typography>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                    {projectName}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>
        <IconButton
          edge='end'
          color='inherit'
          onClick={handleClose}
          aria-label='close'
          size='small'>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {/* タブナビゲーション */}
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          aria-label='settings tabs'
          sx={{
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            px: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.3),
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              minHeight: 48,
              py: 1.5,
              whiteSpace: 'nowrap',
              flex: '0 0 auto',
              px: 2,
            },
          }}>
          <Tab
            label='基本情報'
            id='settings-tab-0'
            aria-controls='settings-tabpanel-0'
          />
          <Tab
            label='アラート閾値'
            id='settings-tab-1'
            aria-controls='settings-tabpanel-1'
          />
          <Tab
            label='音設定'
            id='settings-tab-2'
            aria-controls='settings-tabpanel-2'
          />
        </Tabs>

        {/* タブパネル: 基本情報 */}
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={3.5}>
            <Box>
              <Typography sx={sectionTitleStyle}>機器名</Typography>
              <Stack spacing={1}>
                {isEditingName ? (
                  <Stack direction='row' spacing={1}>
                    <TextField
                      fullWidth
                      size='small'
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder='機器名を入力'
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName()
                        if (e.key === 'Escape') setIsEditingName(false)
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: alpha(theme.palette.background.paper, 0.5),
                        },
                      }}
                    />
                    <Button
                      size='small'
                      onClick={handleSaveName}
                      variant='contained'>
                      保存
                    </Button>
                  </Stack>
                ) : (
                  <Box
                    onClick={() => setIsEditingName(true)}
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                      borderRadius: 1,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                      },
                    }}>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {displayName}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      クリックで編集
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>

            <Divider />

            {/* プロジェクト */}
            <Box>
              <Typography sx={sectionTitleStyle}>プロジェクト</Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                {projectName || config.projectId || 'なし'}
              </Typography>
            </Box>

            <Divider />

            {/* 監視状態 */}
            <Box>
              <Typography sx={sectionTitleStyle}>監視状態</Typography>
              <ToggleButtonGroup
                value={config.isMonitored ? 'on' : 'off'}
                exclusive
                onChange={(_, newValue) => {
                  if (newValue !== null) {
                    handleToggleMonitoring()
                  }
                }}
                fullWidth>
                <ToggleButton
                  value='on'
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    color: colors.success.main,
                  }}>
                  監視中
                </ToggleButton>
                <ToggleButton
                  value='off'
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    color: colors.error.main,
                  }}>
                  監視停止
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </TabPanel>

        {/* タブパネル: アラート閾値 */}
        <TabPanel value={tabValue} index={1}>
          <Stack spacing={4}>
            {/* バッテリー設定 */}
            <Box>
              <Typography sx={sectionTitleStyle}>バッテリー</Typography>
              <Stack spacing={3}>
                {/* バッテリー警告 */}
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1.5,
                    }}>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      警告レベル
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'text.secondary',
                        minWidth: '3rem',
                        textAlign: 'right',
                      }}>
                      {config.alertThresholds.batteryWarning}%
                    </Typography>
                  </Box>
                  <TextField
                    type='number'
                    size='small'
                    value={config.alertThresholds.batteryWarning}
                    onChange={(e) =>
                      handleAlertThresholdChange(
                        'batteryWarning',
                        Math.min(Math.max(parseInt(e.target.value) || 0, 0), 50)
                      )
                    }
                    inputProps={{
                      min: 0,
                      max: 50,
                      step: 1,
                    }}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: alpha(theme.palette.background.paper, 0.3),
                      },
                    }}
                  />
                </Box>

                {/* バッテリー危険 */}
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1.5,
                    }}>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      危険レベル
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'text.secondary',
                        minWidth: '3rem',
                        textAlign: 'right',
                      }}>
                      {config.alertThresholds.batteryAlert}%
                    </Typography>
                  </Box>
                  <TextField
                    type='number'
                    size='small'
                    value={config.alertThresholds.batteryAlert}
                    onChange={(e) =>
                      handleAlertThresholdChange(
                        'batteryAlert',
                        Math.min(
                          Math.max(parseInt(e.target.value) || 0, 0),
                          config.alertThresholds.batteryWarning
                        )
                      )
                    }
                    inputProps={{
                      min: 0,
                      max: config.alertThresholds.batteryWarning,
                      step: 1,
                    }}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: alpha(theme.palette.background.paper, 0.3),
                      },
                    }}
                  />
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* 信号強度設定 */}
            <Box>
              <Typography sx={sectionTitleStyle}>信号強度</Typography>
              <Stack spacing={3}>
                {/* 信号警告 */}
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1.5,
                    }}>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      警告レベル
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'text.secondary',
                        minWidth: '3rem',
                        textAlign: 'right',
                      }}>
                      {config.alertThresholds.signalWarning}%
                    </Typography>
                  </Box>
                  <TextField
                    type='number'
                    size='small'
                    value={config.alertThresholds.signalWarning}
                    onChange={(e) =>
                      handleAlertThresholdChange(
                        'signalWarning',
                        Math.min(
                          Math.max(parseInt(e.target.value) || 0, 0),
                          100
                        )
                      )
                    }
                    inputProps={{
                      min: 0,
                      max: 100,
                      step: 1,
                    }}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: alpha(theme.palette.background.paper, 0.3),
                      },
                    }}
                  />
                </Box>

                {/* 信号危険 */}
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1.5,
                    }}>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      危険レベル
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'text.secondary',
                        minWidth: '3rem',
                        textAlign: 'right',
                      }}>
                      {config.alertThresholds.signalAlert}%
                    </Typography>
                  </Box>
                  <TextField
                    type='number'
                    size='small'
                    value={config.alertThresholds.signalAlert}
                    onChange={(e) =>
                      handleAlertThresholdChange(
                        'signalAlert',
                        Math.min(
                          Math.max(parseInt(e.target.value) || 0, 0),
                          config.alertThresholds.signalWarning
                        )
                      )
                    }
                    inputProps={{
                      min: 0,
                      max: config.alertThresholds.signalWarning,
                      step: 1,
                    }}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: alpha(theme.palette.background.paper, 0.3),
                      },
                    }}
                  />
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* 高度設定 */}
            <Box>
              <Typography sx={sectionTitleStyle}>高度 (m)</Typography>
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1.5,
                  }}>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    最大高度
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      color: 'text.secondary',
                      minWidth: '3rem',
                      textAlign: 'right',
                    }}>
                    {config.alertThresholds.maxAltitude}m
                  </Typography>
                </Box>
                <TextField
                  type='number'
                  size='small'
                  value={config.alertThresholds.maxAltitude}
                  onChange={(e) =>
                    handleAlertThresholdChange(
                      'maxAltitude',
                      Math.min(
                        Math.max(parseInt(e.target.value) || 50, 50),
                        500
                      )
                    )
                  }
                  inputProps={{
                    min: 50,
                    max: 500,
                    step: 10,
                  }}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: alpha(theme.palette.background.paper, 0.3),
                    },
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </TabPanel>

        {/* タブパネル: 音設定 */}
        <TabPanel value={tabValue} index={2}>
          <Stack spacing={3}>
            {/* 警告音 */}
            <SoundSettingSection
              title='警告音'
              config={config.soundConfig}
              soundType='warning'
              onToneChange={(tone) =>
                handleSoundConfigChange('warningTone', tone)
              }
              onVolumeChange={(volume) =>
                handleSoundConfigChange('warningVolume', volume)
              }
              onDurationChange={(duration) =>
                handleSoundConfigChange('warningDuration', duration)
              }
              theme={theme}
            />

            <Divider />

            {/* エラー音 */}
            <SoundSettingSection
              title='エラー音'
              config={config.soundConfig}
              soundType='error'
              onToneChange={(tone) =>
                handleSoundConfigChange('errorTone', tone)
              }
              onVolumeChange={(volume) =>
                handleSoundConfigChange('errorVolume', volume)
              }
              onDurationChange={(duration) =>
                handleSoundConfigChange('errorDuration', duration)
              }
              theme={theme}
            />

            <Divider />

            {/* 緊急音 */}
            <SoundSettingSection
              title='緊急音'
              config={config.soundConfig}
              soundType='emergency'
              onToneChange={(tone) =>
                handleSoundConfigChange('emergencyTone', tone)
              }
              onVolumeChange={(volume) =>
                handleSoundConfigChange('emergencyVolume', volume)
              }
              onDurationChange={(duration) =>
                handleSoundConfigChange('emergencyDuration', duration)
              }
              theme={theme}
            />
          </Stack>
        </TabPanel>
      </DialogContent>

      {/* フッター */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
          p: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}>
        <Button onClick={handleClose} variant='outlined'>
          閉じる
        </Button>
      </Box>
    </Dialog>
  )
}

// 音設定セクションのサブコンポーネント
interface SoundSettingSectionProps {
  title: string
  config: SoundConfig
  soundType: 'warning' | 'error' | 'emergency'
  onToneChange: (tone: string) => void
  onVolumeChange: (volume: number) => void
  onDurationChange: (duration: number) => void
  theme: ReturnType<typeof useTheme>
}

function SoundSettingSection({
  title,
  config,
  soundType,
  onToneChange,
  onVolumeChange,
  onDurationChange,
  theme,
}: SoundSettingSectionProps) {
  const toneKey = `${soundType}Tone` as const
  const volumeKey = `${soundType}Volume` as const
  const durationKey = `${soundType}Duration` as const

  const currentTone = config[toneKey] as string
  const currentVolume = config[volumeKey] as number
  const currentDuration = config[durationKey] as number

  const sectionTitleStyle = {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: theme.palette.primary.main,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    mb: 2.5,
    mt: 0.5,
  }

  return (
    <Box>
      <Typography sx={sectionTitleStyle}>{title}</Typography>
      <Stack spacing={2}>
        {/* トーン選択 */}
        <Box>
          <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
            トーン
          </Typography>
          <Select
            value={currentTone}
            onChange={(e) => onToneChange(e.target.value)}
            fullWidth
            size='small'
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: alpha(theme.palette.background.paper, 0.5),
              },
            }}>
            <MenuItem value='beep'>ビープ音</MenuItem>
            <MenuItem value='chime'>チャイム</MenuItem>
            <MenuItem value='bell'>ベル</MenuItem>
            <MenuItem value='buzz'>バズ</MenuItem>
          </Select>
        </Box>

        {/* 音量スライダー */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              音量
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {currentVolume}%
            </Typography>
          </Box>
          <Slider
            value={currentVolume}
            onChange={(_, value) => onVolumeChange(value as number)}
            min={0}
            max={100}
            step={5}
            marks={[
              { value: 0, label: '0%' },
              { value: 100, label: '100%' },
            ]}
            valueLabelDisplay='auto'
          />
        </Box>

        {/* 時間入力 */}
        <Box>
          <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
            鳴動時間 (ms)
          </Typography>
          <TextField
            type='number'
            value={currentDuration}
            onChange={(e) => onDurationChange(Number(e.target.value))}
            inputProps={{ min: 100, max: 5000, step: 100 }}
            size='small'
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: alpha(theme.palette.background.paper, 0.5),
              },
            }}
          />
        </Box>
      </Stack>
    </Box>
  )
}

export default UTMDroneSettingsModal
