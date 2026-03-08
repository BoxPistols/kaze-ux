/**
 * UTMプリフライトチェックパネル
 *
 * プリフライトチェックリストの表示と操作を提供する
 */

import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CloudIcon from '@mui/icons-material/Cloud'
import DescriptionIcon from '@mui/icons-material/Description'
import GroupIcon from '@mui/icons-material/Group'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import NatureIcon from '@mui/icons-material/Nature'
import RefreshIcon from '@mui/icons-material/Refresh'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt'
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Chip,
  Stack,
  LinearProgress,
  Divider,
  Alert,
  AlertTitle,
  IconButton,
  Tooltip,
  Collapse,
  Button,
  alpha,
  useTheme,
} from '@mui/material'
import React, { useState } from 'react'

import type {
  PreflightChecklist,
  PreflightCheckCategory,
} from '../../types/utmTypes'

// カテゴリのアイコン
const getCategoryIcon = (category: PreflightCheckCategory): React.ReactNode => {
  switch (category) {
    case 'aircraft':
      return <AirplanemodeActiveIcon />
    case 'communication':
      return <SignalCellularAltIcon />
    case 'weather':
      return <CloudIcon />
    case 'environment':
      return <NatureIcon />
    case 'personnel':
      return <GroupIcon />
    case 'emergency':
      return <LocalHospitalIcon />
    case 'documentation':
      return <DescriptionIcon />
    default:
      return <AssignmentTurnedInIcon />
  }
}

// カテゴリのラベル
const getCategoryLabel = (category: PreflightCheckCategory): string => {
  const labels: Record<PreflightCheckCategory, string> = {
    aircraft: '機体',
    communication: '通信',
    weather: '気象',
    environment: '周辺環境',
    personnel: '人員',
    emergency: '緊急手順',
    documentation: '書類',
  }
  return labels[category] || category
}

// ステータスの色
const getStatusColor = (
  status: PreflightChecklist['status']
): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'in_progress':
      return 'warning'
    case 'failed':
      return 'error'
    case 'pending':
    default:
      return 'default'
  }
}

// ステータスラベル
const getStatusLabel = (status: PreflightChecklist['status']): string => {
  const labels: Record<PreflightChecklist['status'], string> = {
    pending: '未開始',
    in_progress: '進行中',
    completed: '完了',
    failed: '失敗',
  }
  return labels[status] || status
}

// Props定義
export interface UTMPreflightPanelProps {
  checklist: PreflightChecklist
  onToggleItem?: (itemId: string, checked: boolean) => void
  onComplete?: () => void
  onReset?: () => void
  onRefresh?: () => void
  loading?: boolean
  readOnly?: boolean
}

export const UTMPreflightPanel = ({
  checklist,
  onToggleItem,
  onComplete,
  onReset,
  onRefresh,
  loading = false,
  readOnly = false,
}: UTMPreflightPanelProps) => {
  const theme = useTheme()
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // カテゴリごとにアイテムをグループ化
  const groupedItems = checklist.items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<PreflightCheckCategory, typeof checklist.items>
  )

  // カテゴリごとの進捗計算
  const getCategoryProgress = (category: PreflightCheckCategory) => {
    const items = groupedItems[category] || []
    const checkedCount = items.filter((item) => {
      const result = checklist.results.find((r) => r.itemId === item.id)
      return result?.checked
    }).length
    return { checked: checkedCount, total: items.length }
  }

  // 全体の進捗
  const totalProgress = {
    checked: checklist.results.filter((r) => r.checked).length,
    total: checklist.items.length,
  }
  const progressPercent = Math.round(
    (totalProgress.checked / totalProgress.total) * 100
  )

  // 必須項目の進捗
  const requiredItems = checklist.items.filter((item) => item.required)
  const requiredProgress = {
    checked: requiredItems.filter((item) => {
      const result = checklist.results.find((r) => r.itemId === item.id)
      return result?.checked
    }).length,
    total: requiredItems.length,
  }

  // チェック状態を取得
  const isItemChecked = (itemId: string): boolean => {
    const result = checklist.results.find((r) => r.itemId === itemId)
    return result?.checked ?? false
  }

  // カテゴリの順序
  const categoryOrder: PreflightCheckCategory[] = [
    'aircraft',
    'communication',
    'weather',
    'environment',
    'personnel',
    'emergency',
    'documentation',
  ]

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
      }}>
      {/* ヘッダー */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}>
        <Box>
          <Typography variant='h6' fontWeight='bold'>
            プリフライトチェック
          </Typography>
          <Stack
            direction='row'
            spacing={1}
            alignItems='center'
            sx={{ mt: 0.5 }}>
            <Chip
              size='small'
              label={getStatusLabel(checklist.status)}
              color={getStatusColor(checklist.status)}
            />
            <Typography variant='caption' color='text.secondary'>
              操縦者: {checklist.pilotName}
            </Typography>
          </Stack>
        </Box>
        <Tooltip title='更新'>
          <IconButton size='small' onClick={onRefresh} disabled={loading}>
            <RefreshIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 進捗バー */}
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 0.5,
          }}>
          <Typography variant='caption' color='text.secondary'>
            全体進捗
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {totalProgress.checked}/{totalProgress.total} ({progressPercent}%)
          </Typography>
        </Box>
        <LinearProgress
          variant='determinate'
          value={progressPercent}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
          }}
        />
      </Box>

      {/* 必須項目の進捗 */}
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 0.5,
          }}>
          <Typography variant='caption' color='text.secondary'>
            必須項目
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {requiredProgress.checked}/{requiredProgress.total}
          </Typography>
        </Box>
        <LinearProgress
          variant='determinate'
          value={(requiredProgress.checked / requiredProgress.total) * 100}
          color={
            requiredProgress.checked === requiredProgress.total
              ? 'success'
              : 'warning'
          }
          sx={{
            height: 6,
            borderRadius: 3,
          }}
        />
      </Box>

      {/* 完了時のアラート */}
      {checklist.status === 'completed' && (
        <Alert severity='success' sx={{ mb: 2 }}>
          <AlertTitle>チェック完了</AlertTitle>
          すべてのプリフライトチェックが完了しました。
          {checklist.completedAt && (
            <Typography variant='caption' display='block'>
              完了日時:{' '}
              {new Date(checklist.completedAt).toLocaleString('ja-JP')}
            </Typography>
          )}
        </Alert>
      )}

      {/* 失敗時のアラート */}
      {checklist.status === 'failed' && (
        <Alert severity='error' sx={{ mb: 2 }}>
          <AlertTitle>チェック失敗</AlertTitle>
          必須項目が完了していません。
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />

      {/* カテゴリ別チェックリスト */}
      {categoryOrder
        .filter((category) => groupedItems[category]?.length > 0)
        .map((category) => {
          const items = groupedItems[category]
          const progress = getCategoryProgress(category)
          const isExpanded = expandedCategory === category

          return (
            <Box
              key={category}
              sx={{
                mb: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                borderRadius: 1,
                overflow: 'hidden',
              }}>
              <ListItem
                onClick={() =>
                  setExpandedCategory(isExpanded ? null : category)
                }
                sx={{
                  bgcolor:
                    progress.checked === progress.total
                      ? alpha(theme.palette.success.main, 0.05)
                      : alpha(theme.palette.background.paper, 0.5),
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.action.hover, 0.1),
                  },
                }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box
                    sx={{
                      color:
                        progress.checked === progress.total
                          ? 'success.main'
                          : 'text.secondary',
                    }}>
                    {getCategoryIcon(category)}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={getCategoryLabel(category)}
                  secondary={`${progress.checked}/${progress.total} 完了`}
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
                <Chip
                  size='small'
                  label={
                    progress.checked === progress.total ? '完了' : '未完了'
                  }
                  color={
                    progress.checked === progress.total ? 'success' : 'default'
                  }
                  variant='outlined'
                />
              </ListItem>

              <Collapse in={isExpanded}>
                <List disablePadding sx={{ pl: 4 }}>
                  {items.map((item) => {
                    const isChecked = isItemChecked(item.id)

                    return (
                      <ListItem
                        key={item.id}
                        dense
                        sx={{
                          borderRadius: 1,
                          mb: 0.5,
                          bgcolor: isChecked
                            ? alpha(theme.palette.success.main, 0.05)
                            : 'transparent',
                        }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Checkbox
                            edge='start'
                            checked={isChecked}
                            disabled={loading || readOnly}
                            onChange={(e) =>
                              onToggleItem?.(item.id, e.target.checked)
                            }
                            icon={<CheckBoxOutlineBlankIcon />}
                            checkedIcon={<CheckBoxIcon color='success' />}
                            size='small'
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Stack
                              direction='row'
                              spacing={1}
                              alignItems='center'>
                              <Typography variant='body2'>
                                {item.label}
                              </Typography>
                              {item.required && (
                                <Chip
                                  size='small'
                                  label='必須'
                                  color='error'
                                  variant='outlined'
                                  sx={{ height: 18 }}
                                />
                              )}
                            </Stack>
                          }
                          primaryTypographyProps={{ component: 'div' }}
                          secondary={item.description}
                          secondaryTypographyProps={{
                            variant: 'caption',
                            color: 'text.secondary',
                          }}
                        />
                      </ListItem>
                    )
                  })}
                </List>
              </Collapse>
            </Box>
          )
        })}

      <Divider sx={{ my: 2 }} />

      {/* アクションボタン */}
      {!readOnly && (
        <Stack direction='row' spacing={1}>
          <Button
            variant='outlined'
            onClick={onReset}
            disabled={loading || checklist.status === 'pending'}
            sx={{ flex: 1 }}>
            リセット
          </Button>
          <Button
            variant='contained'
            onClick={onComplete}
            disabled={
              loading ||
              checklist.status === 'completed' ||
              !checklist.allRequiredPassed
            }
            sx={{ flex: 1 }}
            startIcon={<AssignmentTurnedInIcon />}>
            チェック完了
          </Button>
        </Stack>
      )}
    </Paper>
  )
}

export default UTMPreflightPanel
