import ClearIcon from '@mui/icons-material/Clear'
import DeleteIcon from '@mui/icons-material/Delete'
import FilterListIcon from '@mui/icons-material/FilterList'
import HomeIcon from '@mui/icons-material/Home'
import InfoIcon from '@mui/icons-material/Info'
import PauseCircleIcon from '@mui/icons-material/PauseCircle'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useMemo, useState } from 'react'

import useUTMStore from '@/store/utmStore'
import { colors } from '@/styles/tokens'
import type { AlertSeverity, AlertType } from '@/types/utmTypes'

export interface UTMEnhancedAlertPanelProps {
  /** カスタムスタイル */
  sx?: object
  /** 高さ */
  height?: string | number
  /** ドローン選択ハンドラー */
  onDroneSelect?: (droneId: string) => void
  /** フィルター対象のドローンID配列（指定された場合、これらのドローンのアラートのみ表示） */
  droneIds?: string[]
  /** ホバリング指示のコールバック（緊急アラート用） */
  onHover?: (droneId: string) => void
  /** 緊急帰還（RTH）指示のコールバック（緊急アラート用） */
  onEmergencyReturn?: (droneId: string) => void
}

// アラート重要度の色定義
const ALERT_SEVERITY_COLORS: Record<AlertSeverity, string> = {
  info: colors.info.main,
  warning: colors.warning.main,
  critical: colors.error.main,
  emergency: '#FF0000',
}

// アラート種類の色定義
const ALERT_TYPE_COLORS: Record<AlertType, string> = {
  zone_violation: colors.error.main,
  zone_approach: colors.warning.main,
  collision_warning: colors.error.main,
  collision_alert: colors.error.main,
  low_battery: colors.warning.main,
  signal_loss: colors.error.main,
  geofence_breach: colors.error.main,
  weather_warning: colors.warning.main,
  airspace_conflict: colors.error.main,
  system_command: colors.info.main,
}

// アラート種類の日本語ラベル
const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  zone_violation: '禁止区域侵入',
  zone_approach: '禁止区域接近',
  collision_warning: '衝突警告',
  collision_alert: '衝突危険',
  low_battery: 'バッテリー低下',
  signal_loss: '信号喪失',
  geofence_breach: 'ジオフェンス逸脱',
  weather_warning: '気象警告',
  airspace_conflict: '空域競合',
  system_command: 'システムコマンド',
}

const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
  info: '情報',
  warning: '警告',
  critical: '重大',
  emergency: '緊急',
}

/**
 * UTMEnhancedAlertPanel - 高度なアラートログパネル
 *
 * 機能:
 * - ドローン別タブ表示
 * - アラート種類フィルター
 * - 重要度別フィルター
 * - キーワード検索
 * - 時系列表示（新 → 旧）
 * - アラート詳細表示
 */
export const UTMEnhancedAlertPanel = ({
  sx,
  height = 400,
  onDroneSelect,
  droneIds,
  onHover,
  onEmergencyReturn,
}: UTMEnhancedAlertPanelProps) => {
  const theme = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<
    AlertSeverity | 'all'
  >('all')
  const [selectedType, setSelectedType] = useState<AlertType | 'all'>('all')
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Zustand ストアから情報取得
  const { alerts, clearAlert, acknowledgeAlert } = useUTMStore()

  // フィルタリング済みのアラート（全アラートから直接フィルター）
  const filteredAlerts = useMemo(() => {
    // 時系列で並べ替え（新しい順）
    const sortedAlerts = [...alerts].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return sortedAlerts.filter((alert) => {
      // ドローンIDフィルター（指定されている場合のみ）
      if (droneIds && droneIds.length > 0) {
        if (!droneIds.includes(alert.droneId)) {
          return false
        }
      }

      // 重要度フィルター
      if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) {
        return false
      }

      // アラート種類フィルター
      if (selectedType !== 'all' && alert.type !== selectedType) {
        return false
      }

      // キーワード検索
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return (
          alert.message.toLowerCase().includes(query) ||
          alert.details.toLowerCase().includes(query) ||
          alert.droneName.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [alerts, selectedSeverity, selectedType, searchQuery, droneIds])

  // 選択中のアラート詳細
  const selectedAlert = alerts.find((a) => a.id === selectedAlertId)

  // グラスモーフィズムスタイル
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
        display: 'flex',
        flexDirection: 'column',
        height,
        ...sx,
      }}>
      {/* フィルターエリア */}
      <Box
        sx={{
          pt: 1,
          pb: 1.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}>
        <Stack spacing={1.5}>
          {/* 検索フィールド */}
          <TextField
            fullWidth
            size='small'
            placeholder='検索...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon
                      sx={{ fontSize: 16, color: 'text.secondary' }}
                    />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position='end'>
                    <IconButton
                      size='small'
                      onClick={() => setSearchQuery('')}
                      edge='end'
                      sx={{ p: 0.25 }}>
                      <ClearIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              maxWidth: '96%',
              '& .MuiOutlinedInput-root': {
                height: 24,
                margin: `0.5rem auto 0.25rem 0.25rem`,
                fontSize: '0.75rem',
                borderRadius: '6px',
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                px: 2,
              },
              '& .MuiOutlinedInput-input': {
                py: 0.5,
              },
            }}
          />

          {/* フィルター行 */}
          <Stack
            direction='row'
            spacing={1}
            alignItems='center'
            sx={{ px: 1.5 }}>
            <FilterListIcon
              sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }}
            />
            <Select
              value={selectedSeverity}
              onChange={(e) =>
                setSelectedSeverity(e.target.value as AlertSeverity | 'all')
              }
              size='small'
              sx={{
                flex: 1,
                minWidth: 80,
                fontSize: '0.75rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderRadius: '4px',
                },
                '& .MuiSelect-select': {
                  py: 0.5,
                  px: 1,
                },
              }}>
              <MenuItem value='all' sx={{ fontSize: '0.75rem' }}>
                全重要度
              </MenuItem>
              <MenuItem value='info' sx={{ fontSize: '0.75rem' }}>
                情報
              </MenuItem>
              <MenuItem value='warning' sx={{ fontSize: '0.75rem' }}>
                警告
              </MenuItem>
              <MenuItem value='critical' sx={{ fontSize: '0.75rem' }}>
                重大
              </MenuItem>
              <MenuItem value='emergency' sx={{ fontSize: '0.75rem' }}>
                緊急
              </MenuItem>
            </Select>

            <Select
              value={selectedType}
              onChange={(e) =>
                setSelectedType(e.target.value as AlertType | 'all')
              }
              size='small'
              sx={{
                flex: 1,
                minWidth: 80,
                fontSize: '0.75rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderRadius: '6px',
                },
                '& .MuiSelect-select': {
                  py: 0.5,
                  px: 1,
                },
              }}>
              <MenuItem value='all' sx={{ fontSize: '0.75rem' }}>
                全タイプ
              </MenuItem>
              {Object.entries(ALERT_TYPE_LABELS).map(([type, label]) => (
                <MenuItem key={type} value={type} sx={{ fontSize: '0.75rem' }}>
                  {label}
                </MenuItem>
              ))}
            </Select>

            {alerts.length > 0 && (
              <Tooltip title='全削除'>
                <IconButton
                  size='small'
                  onClick={() => alerts.forEach((a) => clearAlert(a.id))}
                  sx={{
                    p: 0.25,
                    color: colors.error.main,
                    flexShrink: 0,
                  }}>
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* アラートリスト（全アラートをフラットに表示） */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <List dense sx={{ py: 0 }}>
          {filteredAlerts.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 3,
              }}>
              <Typography color='text.secondary' variant='body2'>
                {searchQuery
                  ? 'アラートが見つかりません'
                  : 'アラートはありません'}
              </Typography>
            </Box>
          ) : (
            filteredAlerts.map((alert) => (
              <ListItemButton
                key={alert.id}
                selected={selectedAlertId === alert.id}
                onClick={() => {
                  setSelectedAlertId(alert.id)
                  // ドローン選択ハンドラーを呼び出し（地図でフォーカス）
                  onDroneSelect?.(alert.droneId)
                  setDetailDialogOpen(true)
                }}
                sx={{
                  py: 1.5,
                  px: 2,
                  bgcolor: alert.acknowledged
                    ? 'transparent'
                    : alpha(ALERT_SEVERITY_COLORS[alert.severity], 0.08),
                  borderLeft: `3px solid ${ALERT_SEVERITY_COLORS[alert.severity]}`,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                  '&:hover': {
                    bgcolor: alpha(ALERT_SEVERITY_COLORS[alert.severity], 0.12),
                  },
                }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: alert.acknowledged
                        ? 'text.disabled'
                        : ALERT_SEVERITY_COLORS[alert.severity],
                    }}
                  />
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Stack direction='row' spacing={1} alignItems='center'>
                      <Typography
                        variant='body2'
                        sx={{
                          fontWeight: 600,
                          textDecoration: alert.acknowledged
                            ? 'line-through'
                            : 'none',
                          opacity: alert.acknowledged ? 0.6 : 1,
                        }}>
                        {alert.message}
                      </Typography>
                      <Chip
                        label={ALERT_TYPE_LABELS[alert.type]}
                        size='small'
                        variant='outlined'
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          borderColor: alpha(
                            ALERT_TYPE_COLORS[alert.type],
                            0.5
                          ),
                          color: ALERT_TYPE_COLORS[alert.type],
                        }}
                      />
                    </Stack>
                  }
                  secondary={
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ mt: 0.5, display: 'block' }}>
                      {new Date(alert.timestamp).toLocaleString('ja-JP', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </Typography>
                  }
                />

                <Chip
                  label={ALERT_SEVERITY_LABELS[alert.severity]}
                  size='small'
                  variant='filled'
                  sx={{
                    bgcolor: alpha(ALERT_SEVERITY_COLORS[alert.severity], 0.2),
                    color: ALERT_SEVERITY_COLORS[alert.severity],
                    fontWeight: 700,
                    fontSize: '0.7rem',
                  }}
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Box>

      {/* アラート詳細ダイアログ */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            ...glassStyle,
            borderRadius: 2,
          },
        }}>
        {selectedAlert && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon
                sx={{ color: ALERT_SEVERITY_COLORS[selectedAlert.severity] }}
              />
              <Typography variant='h6' component='div' sx={{ fontWeight: 700 }}>
                アラート詳細
              </Typography>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
              <Stack spacing={2}>
                {/* メッセージ */}
                <Box>
                  <Typography
                    variant='caption'
                    sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    メッセージ
                  </Typography>
                  <Typography variant='body2' sx={{ mt: 0.5 }}>
                    {selectedAlert.message}
                  </Typography>
                </Box>

                <Divider />

                {/* 詳細 */}
                <Box>
                  <Typography
                    variant='caption'
                    sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    詳細
                  </Typography>
                  <Typography variant='body2' sx={{ mt: 0.5 }}>
                    {selectedAlert.details}
                  </Typography>
                </Box>

                <Divider />

                {/* メタデータ */}
                <Stack spacing={1}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='caption' color='text.secondary'>
                      ドローン:
                    </Typography>
                    <Typography variant='caption' sx={{ fontWeight: 600 }}>
                      {selectedAlert.droneName}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='caption' color='text.secondary'>
                      重要度:
                    </Typography>
                    <Chip
                      label={ALERT_SEVERITY_LABELS[selectedAlert.severity]}
                      size='small'
                      sx={{
                        bgcolor: alpha(
                          ALERT_SEVERITY_COLORS[selectedAlert.severity],
                          0.2
                        ),
                        color: ALERT_SEVERITY_COLORS[selectedAlert.severity],
                      }}
                    />
                  </Box>

                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='caption' color='text.secondary'>
                      タイプ:
                    </Typography>
                    <Chip
                      label={ALERT_TYPE_LABELS[selectedAlert.type]}
                      size='small'
                      variant='outlined'
                      sx={{
                        borderColor: alpha(
                          ALERT_TYPE_COLORS[selectedAlert.type],
                          0.5
                        ),
                      }}
                    />
                  </Box>

                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='caption' color='text.secondary'>
                      発生時刻:
                    </Typography>
                    <Typography variant='caption' sx={{ fontWeight: 600 }}>
                      {new Date(selectedAlert.timestamp).toLocaleString(
                        'ja-JP'
                      )}
                    </Typography>
                  </Box>

                  {selectedAlert.acknowledged && (
                    <Box
                      sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant='caption' color='text.secondary'>
                        確認:
                      </Typography>
                      <Typography
                        variant='caption'
                        sx={{ fontWeight: 600, color: colors.success.main }}>
                        ✓ {selectedAlert.acknowledgedBy} が確認
                      </Typography>
                    </Box>
                  )}
                </Stack>

                <Divider />

                {/* 緊急制御アクション（緊急/重大アラートで未確認の場合のみ表示） */}
                {!selectedAlert.acknowledged &&
                  (selectedAlert.severity === 'emergency' ||
                    selectedAlert.severity === 'critical') && (
                    <Stack direction='row' spacing={1}>
                      {onHover && (
                        <Button
                          fullWidth
                          variant='contained'
                          color='warning'
                          startIcon={<PauseCircleIcon />}
                          onClick={() => {
                            onHover(selectedAlert.droneId)
                            setDetailDialogOpen(false)
                          }}>
                          ホバリング
                        </Button>
                      )}
                      {onEmergencyReturn && (
                        <Button
                          fullWidth
                          variant='contained'
                          color='error'
                          startIcon={<HomeIcon />}
                          onClick={() => {
                            onEmergencyReturn(selectedAlert.droneId)
                            setDetailDialogOpen(false)
                          }}>
                          緊急帰還
                        </Button>
                      )}
                    </Stack>
                  )}

                {/* 通常アクション */}
                <Stack direction='row' spacing={1}>
                  {!selectedAlert.acknowledged && (
                    <Button
                      fullWidth
                      variant='contained'
                      onClick={() => {
                        acknowledgeAlert(selectedAlert.id, 'user')
                        setDetailDialogOpen(false)
                      }}>
                      確認
                    </Button>
                  )}
                  <Button
                    fullWidth
                    variant='outlined'
                    color='error'
                    onClick={() => {
                      clearAlert(selectedAlert.id)
                      setDetailDialogOpen(false)
                    }}>
                    削除
                  </Button>
                </Stack>
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Paper>
  )
}

export default UTMEnhancedAlertPanel
