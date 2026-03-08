import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import RestoreIcon from '@mui/icons-material/Restore'
import SaveIcon from '@mui/icons-material/Save'
import SettingsIcon from '@mui/icons-material/Settings'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Grid,
  InputAdornment,
  Paper,
  Slider,
  Switch,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useState, useCallback } from 'react'

import { DEFAULT_ALERT_THRESHOLDS } from '@/constants/utmLabels'
import { colors } from '@/styles/tokens'
import type { AlertThresholdConfig } from '@/types/utmTypes'

export interface UTMAlertThresholdSettingsProps {
  /** 現在の閾値設定 */
  config: AlertThresholdConfig
  /** 設定変更ハンドラ */
  onChange: (config: AlertThresholdConfig) => void
  /** 保存ハンドラ */
  onSave?: (config: AlertThresholdConfig) => void
  /** リセットハンドラ */
  onReset?: () => void
  /** 機体型式名（任意） */
  droneModelName?: string
  /** 読み取り専用 */
  readOnly?: boolean
  /** カスタムスタイル */
  sx?: object
}

// 閾値設定項目コンポーネント
interface ThresholdItemProps {
  label: string
  description?: string
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  value?: number
  onValueChange?: (value: number) => void
  unit?: string
  min?: number
  max?: number
  step?: number
  readOnly?: boolean
  priority?: 2 | 3 // 2: ★★, 3: ★★★
}

const ThresholdItem = ({
  label,
  description,
  enabled,
  onEnabledChange,
  value,
  onValueChange,
  unit = '',
  min = 0,
  max = 100,
  step = 1,
  readOnly = false,
  priority = 2,
}: ThresholdItemProps) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        bgcolor: enabled
          ? alpha(theme.palette.primary.main, 0.05)
          : alpha(theme.palette.action.disabled, 0.05),
        border: `1px solid ${enabled ? alpha(theme.palette.primary.main, 0.2) : 'transparent'}`,
        transition: 'all 0.2s',
      }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: value !== undefined ? 1 : 0,
        }}>
        <Box>
          <Typography
            variant='body2'
            fontWeight={priority === 3 ? 700 : 600}
            sx={{
              color: enabled ? 'text.primary' : 'text.disabled',
            }}>
            {label}
            {priority === 3 && (
              <Typography
                component='span'
                variant='caption'
                sx={{ ml: 0.5, color: colors.error.main }}>
                [必須]
              </Typography>
            )}
          </Typography>
          {description && (
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'block' }}>
              {description}
            </Typography>
          )}
        </Box>
        <Switch
          checked={enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          disabled={readOnly}
          size='small'
        />
      </Box>

      {value !== undefined && onValueChange && (
        <Box
          sx={{
            opacity: enabled ? 1 : 0.5,
            pointerEvents: enabled ? 'auto' : 'none',
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Slider
              value={value}
              onChange={(_, newValue) => onValueChange(newValue as number)}
              min={min}
              max={max}
              step={step}
              disabled={readOnly || !enabled}
              sx={{
                flex: 1,
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16,
                },
              }}
            />
            <TextField
              value={value}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                if (!isNaN(val) && val >= min && val <= max) {
                  onValueChange(val)
                }
              }}
              disabled={readOnly || !enabled}
              size='small'
              type='number'
              slotProps={{
                input: {
                  endAdornment: unit && (
                    <InputAdornment position='end'>
                      <Typography variant='caption'>{unit}</Typography>
                    </InputAdornment>
                  ),
                },
                htmlInput: {
                  min,
                  max,
                  step,
                  style: { width: 60, textAlign: 'right' },
                },
              }}
              sx={{
                width: 100,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                },
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  )
}

/**
 * UTMAlertThresholdSettings - アラート閾値設定コンポーネント
 *
 * Warning/Alertの閾値を機体型式ごとに設定するコンポーネント
 */
export const UTMAlertThresholdSettings = ({
  config,
  onChange,
  onSave,
  onReset,
  droneModelName,
  readOnly = false,
  sx,
}: UTMAlertThresholdSettingsProps) => {
  const theme = useTheme()
  const [expandedPanel, setExpandedPanel] = useState<
    'warning' | 'alert' | false
  >('warning')

  // Warning設定の更新
  const updateWarning = useCallback(
    <K extends keyof AlertThresholdConfig['warning']>(
      key: K,
      field: keyof AlertThresholdConfig['warning'][K],
      value: boolean | number
    ) => {
      onChange({
        ...config,
        warning: {
          ...config.warning,
          [key]: {
            ...config.warning[key],
            [field]: value,
          },
        },
        updatedAt: new Date(),
      })
    },
    [config, onChange]
  )

  // Alert設定の更新
  const updateAlert = useCallback(
    <K extends keyof AlertThresholdConfig['alert']>(
      key: K,
      field: keyof AlertThresholdConfig['alert'][K],
      value: boolean | number
    ) => {
      onChange({
        ...config,
        alert: {
          ...config.alert,
          [key]: {
            ...config.alert[key],
            [field]: value,
          },
        },
        updatedAt: new Date(),
      })
    },
    [config, onChange]
  )

  // デフォルトにリセット
  const handleReset = () => {
    if (onReset) {
      onReset()
    } else {
      onChange({
        ...config,
        warning: {
          altitudeLimit: {
            enabled: true,
            threshold: DEFAULT_ALERT_THRESHOLDS.warning.altitudeLimit,
          },
          routeDeviation: {
            enabled: true,
            threshold: DEFAULT_ALERT_THRESHOLDS.warning.routeDeviation,
          },
          batteryLevel: {
            enabled: true,
            threshold: DEFAULT_ALERT_THRESHOLDS.warning.batteryLevel,
          },
          gpsSignal: {
            enabled: true,
            minSatellites: DEFAULT_ALERT_THRESHOLDS.warning.gpsMinSatellites,
          },
          signalStrength: {
            enabled: true,
            threshold: DEFAULT_ALERT_THRESHOLDS.warning.signalStrength,
          },
          systemError: {
            enabled: true,
          },
          windSpeed: {
            enabled: true,
            threshold: DEFAULT_ALERT_THRESHOLDS.warning.windSpeed,
          },
        },
        alert: {
          altitudeExceeded: {
            enabled: true,
            threshold: DEFAULT_ALERT_THRESHOLDS.alert.altitudeExceeded,
          },
          geofenceBreach: {
            enabled: true,
          },
          zoneViolation: {
            enabled: true,
          },
          batteryLow: {
            enabled: true,
            threshold: DEFAULT_ALERT_THRESHOLDS.alert.batteryLow,
          },
        },
        updatedAt: new Date(),
      })
    }
  }

  // グラスモーフィズムスタイル
  const glassStyle = {
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(30, 41, 59, 0.85)'
        : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(16px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 8px 32px rgba(0, 0, 0, 0.4)'
        : '0 8px 32px rgba(0, 0, 0, 0.12)',
  }

  return (
    <Paper elevation={0} sx={{ ...glassStyle, borderRadius: 2, ...sx }}>
      {/* ヘッダー */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon
              sx={{ fontSize: 20, color: theme.palette.primary.main }}
            />
            <Box>
              <Typography variant='subtitle1' fontWeight={600}>
                アラート閾値設定
              </Typography>
              {droneModelName && (
                <Typography variant='caption' color='text.secondary'>
                  機体型式: {droneModelName}
                </Typography>
              )}
            </Box>
          </Box>
          {!readOnly && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size='small'
                startIcon={<RestoreIcon />}
                onClick={handleReset}
                sx={{ textTransform: 'none' }}>
                リセット
              </Button>
              {onSave && (
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<SaveIcon />}
                  onClick={() => onSave(config)}
                  sx={{ textTransform: 'none' }}>
                  保存
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Warning設定 */}
      <Accordion
        expanded={expandedPanel === 'warning'}
        onChange={(_, isExpanded) =>
          setExpandedPanel(isExpanded ? 'warning' : false)
        }
        sx={{
          bgcolor: 'transparent',
          boxShadow: 'none',
          '&:before': { display: 'none' },
        }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            bgcolor: alpha(colors.warning.main, 0.08),
            borderBottom: `1px solid ${alpha(colors.warning.main, 0.2)}`,
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberIcon
              sx={{ color: colors.warning.main, fontSize: 20 }}
            />
            <Typography variant='subtitle2' fontWeight={600}>
              Warning 閾値
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              （注意レベル）
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2 }}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ThresholdItem
                label='制限高度付近'
                description='指定高度に近づいたら警告'
                enabled={config.warning.altitudeLimit.enabled}
                onEnabledChange={(v) =>
                  updateWarning('altitudeLimit', 'enabled', v)
                }
                value={config.warning.altitudeLimit.threshold}
                onValueChange={(v) =>
                  updateWarning('altitudeLimit', 'threshold', v)
                }
                unit='m'
                min={50}
                max={200}
                step={5}
                readOnly={readOnly}
                priority={2}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ThresholdItem
                label='計画ルート逸脱'
                description='計画ルートからの距離'
                enabled={config.warning.routeDeviation.enabled}
                onEnabledChange={(v) =>
                  updateWarning('routeDeviation', 'enabled', v)
                }
                value={config.warning.routeDeviation.threshold}
                onValueChange={(v) =>
                  updateWarning('routeDeviation', 'threshold', v)
                }
                unit='m'
                min={10}
                max={200}
                step={5}
                readOnly={readOnly}
                priority={2}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ThresholdItem
                label='バッテリレベル'
                description='バッテリ残量'
                enabled={config.warning.batteryLevel.enabled}
                onEnabledChange={(v) =>
                  updateWarning('batteryLevel', 'enabled', v)
                }
                value={config.warning.batteryLevel.threshold}
                onValueChange={(v) =>
                  updateWarning('batteryLevel', 'threshold', v)
                }
                unit='%'
                min={20}
                max={60}
                step={5}
                readOnly={readOnly}
                priority={2}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ThresholdItem
                label='GPS衛星数'
                description='最小衛星捕捉数'
                enabled={config.warning.gpsSignal.enabled}
                onEnabledChange={(v) =>
                  updateWarning('gpsSignal', 'enabled', v)
                }
                value={config.warning.gpsSignal.minSatellites}
                onValueChange={(v) =>
                  updateWarning('gpsSignal', 'minSatellites', v)
                }
                unit='衛星'
                min={4}
                max={12}
                step={1}
                readOnly={readOnly}
                priority={2}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ThresholdItem
                label='通信強度'
                description='信号強度'
                enabled={config.warning.signalStrength.enabled}
                onEnabledChange={(v) =>
                  updateWarning('signalStrength', 'enabled', v)
                }
                value={config.warning.signalStrength.threshold}
                onValueChange={(v) =>
                  updateWarning('signalStrength', 'threshold', v)
                }
                unit='%'
                min={20}
                max={80}
                step={5}
                readOnly={readOnly}
                priority={2}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ThresholdItem
                label='風速'
                description='最大風速'
                enabled={config.warning.windSpeed.enabled}
                onEnabledChange={(v) =>
                  updateWarning('windSpeed', 'enabled', v)
                }
                value={config.warning.windSpeed.threshold}
                onValueChange={(v) =>
                  updateWarning('windSpeed', 'threshold', v)
                }
                unit='m/s'
                min={3}
                max={15}
                step={0.5}
                readOnly={readOnly}
                priority={2}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ThresholdItem
                label='システムエラー'
                description='IMU、モーター等のシステムエラー'
                enabled={config.warning.systemError.enabled}
                onEnabledChange={(v) =>
                  updateWarning('systemError', 'enabled', v)
                }
                readOnly={readOnly}
                priority={2}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Alert設定 */}
      <Accordion
        expanded={expandedPanel === 'alert'}
        onChange={(_, isExpanded) =>
          setExpandedPanel(isExpanded ? 'alert' : false)
        }
        sx={{
          bgcolor: 'transparent',
          boxShadow: 'none',
          '&:before': { display: 'none' },
        }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            bgcolor: alpha(colors.error.main, 0.08),
            borderBottom: `1px solid ${alpha(colors.error.main, 0.2)}`,
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ErrorOutlineIcon sx={{ color: colors.error.main, fontSize: 20 }} />
            <Typography variant='subtitle2' fontWeight={600}>
              Alert 閾値
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              （緊急レベル）
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2 }}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ThresholdItem
                label='制限高度超過'
                description='飛行禁止高度'
                enabled={config.alert.altitudeExceeded.enabled}
                onEnabledChange={(v) =>
                  updateAlert('altitudeExceeded', 'enabled', v)
                }
                value={config.alert.altitudeExceeded.threshold}
                onValueChange={(v) =>
                  updateAlert('altitudeExceeded', 'threshold', v)
                }
                unit='m'
                min={100}
                max={200}
                step={5}
                readOnly={readOnly}
                priority={3}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ThresholdItem
                label='バッテリ低下'
                description='即時帰還が必要なレベル'
                enabled={config.alert.batteryLow.enabled}
                onEnabledChange={(v) => updateAlert('batteryLow', 'enabled', v)}
                value={config.alert.batteryLow.threshold}
                onValueChange={(v) => updateAlert('batteryLow', 'threshold', v)}
                unit='%'
                min={10}
                max={40}
                step={5}
                readOnly={readOnly}
                priority={3}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ThresholdItem
                label='ジオケージ逸脱'
                description='飛行計画エリアからの逸脱'
                enabled={config.alert.geofenceBreach.enabled}
                onEnabledChange={(v) =>
                  updateAlert('geofenceBreach', 'enabled', v)
                }
                readOnly={readOnly}
                priority={3}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ThresholdItem
                label='ジオフェンス侵入'
                description='飛行禁止エリア・他者エリアへの侵入'
                enabled={config.alert.zoneViolation.enabled}
                onEnabledChange={(v) =>
                  updateAlert('zoneViolation', 'enabled', v)
                }
                readOnly={readOnly}
                priority={3}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* 更新日時 */}
      <Box sx={{ p: 1.5, textAlign: 'right' }}>
        <Typography variant='caption' color='text.secondary'>
          最終更新:{' '}
          {config.updatedAt.toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Typography>
      </Box>
    </Paper>
  )
}

export default UTMAlertThresholdSettings
