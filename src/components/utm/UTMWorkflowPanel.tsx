/**
 * UTMワークフローパネル
 *
 * 飛行計画のワークフロー進捗を表示し、各ステップの操作を提供する
 */

import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import MapIcon from '@mui/icons-material/Map'
import NotificationsIcon from '@mui/icons-material/Notifications'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PublicIcon from '@mui/icons-material/Public'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Chip,
  Stack,
  LinearProgress,
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
} from '@mui/material'
import React, { useState, useCallback } from 'react'

import type {
  FlightPlanWorkflowStatus,
  NotificationLog,
  PreflightChecklist,
} from '../../types/utmTypes'

// ワークフローステップの定義
interface WorkflowStep {
  id: string
  label: string
  description: string
  icon: React.ReactNode
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'flightPlan',
    label: '飛行計画',
    description: '飛行計画の作成と登録',
    icon: <FlightTakeoffIcon />,
  },
  {
    id: 'airspaceAssessment',
    label: '空域判定',
    description: '飛行エリアの空域判定とNOTAM要否確認',
    icon: <MapIcon />,
  },
  {
    id: 'notification',
    label: '事前周知',
    description: '有人機団体への事前周知',
    icon: <NotificationsIcon />,
  },
  {
    id: 'notam',
    label: 'NOTAM申請',
    description: 'NOTAM申請と発行確認',
    icon: <PublicIcon />,
  },
  {
    id: 'approval',
    label: '承認',
    description: '管理者による飛行承認',
    icon: <AssignmentTurnedInIcon />,
  },
  {
    id: 'preflightCheck',
    label: 'プリフライト',
    description: 'プリフライトチェックリストの完了',
    icon: <CheckCircleIcon />,
  },
]

// ステータスに応じた色を取得
const getStatusColor = (
  status: string
): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (status) {
    case 'completed':
    case 'approved':
    case 'confirmed':
    case 'published':
      return 'success'
    case 'pending':
    case 'in_progress':
    case 'in_review':
    case 'sending':
    case 'submitted':
    case 'processing':
      return 'warning'
    case 'failed':
    case 'rejected':
    case 'expired':
      return 'error'
    case 'not_required':
    case 'not_submitted':
      return 'default'
    default:
      return 'info'
  }
}

// ステータスラベルを取得
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: '待機中',
    in_progress: '進行中',
    completed: '完了',
    failed: '失敗',
    approved: '承認済',
    rejected: '却下',
    submitted: '申請済',
    published: '発行済',
    not_required: '不要',
    not_submitted: '未申請',
    sending: '送信中',
    partial: '一部完了',
    expired: '期限切れ',
    in_review: 'レビュー中',
    processing: '処理中',
    draft: '下書き',
    pending_approval: '承認待ち',
    active: '実行中',
    cancelled: 'キャンセル',
    revision_required: '修正要求',
  }
  return labels[status] || status
}

// Props定義
export interface UTMWorkflowPanelProps {
  workflowStatus: FlightPlanWorkflowStatus
  onAssessAirspace?: () => void
  onSendNotifications?: () => void
  onSubmitNotam?: () => void
  onRequestApproval?: () => void
  onStartPreflightCheck?: () => void
  onStartFlight?: () => void
  onRefresh?: () => void
  loading?: boolean
  notificationLogs?: NotificationLog[]
  preflightChecklist?: PreflightChecklist
}

export const UTMWorkflowPanel = ({
  workflowStatus,
  onAssessAirspace,
  onSendNotifications,
  onSubmitNotam,
  onRequestApproval,
  onStartPreflightCheck,
  onStartFlight,
  onRefresh,
  loading = false,
  notificationLogs = [],
  preflightChecklist,
}: UTMWorkflowPanelProps) => {
  const theme = useTheme()
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  // アクティブなステップを計算
  const getActiveStep = useCallback((): number => {
    const { steps } = workflowStatus

    if (steps.preflightCheck.status === 'completed') return 6
    if (steps.approval.status === 'approved') return 5
    if (
      steps.notam.status === 'approved' ||
      steps.notam.status === 'not_required'
    )
      return 4
    if (steps.notification.status === 'completed') return 3
    if (steps.airspaceAssessment.status === 'completed') return 2
    if (
      steps.flightPlan.status !== 'draft' &&
      steps.flightPlan.status !== 'cancelled'
    )
      return 1
    return 0
  }, [workflowStatus])

  const activeStep = getActiveStep()

  // ステップの完了状態を確認
  const isStepComplete = (stepId: string): boolean => {
    const { steps } = workflowStatus

    switch (stepId) {
      case 'flightPlan':
        return (
          steps.flightPlan.status !== 'draft' &&
          steps.flightPlan.status !== 'cancelled'
        )
      case 'airspaceAssessment':
        return steps.airspaceAssessment.status === 'completed'
      case 'notification':
        return steps.notification.status === 'completed'
      case 'notam':
        return (
          steps.notam.status === 'approved' ||
          steps.notam.status === 'published' ||
          steps.notam.status === 'not_required'
        )
      case 'approval':
        return steps.approval.status === 'approved'
      case 'preflightCheck':
        return steps.preflightCheck.status === 'completed'
      default:
        return false
    }
  }

  // ステップのエラー状態を確認
  const isStepError = (stepId: string): boolean => {
    const { steps } = workflowStatus

    switch (stepId) {
      case 'notification':
        return steps.notification.status === 'failed'
      case 'notam':
        return steps.notam.status === 'rejected'
      case 'approval':
        return (
          steps.approval.status === 'rejected' ||
          steps.approval.status === 'revision_required'
        )
      case 'preflightCheck':
        return steps.preflightCheck.status === 'failed'
      default:
        return false
    }
  }

  // ステップコンテンツを描画
  const renderStepContent = (step: WorkflowStep, index: number) => {
    const { steps } = workflowStatus
    const isActive = index === activeStep
    const isComplete = isStepComplete(step.id)
    const isError = isStepError(step.id)

    switch (step.id) {
      case 'flightPlan':
        return (
          <Box>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              {step.description}
            </Typography>
            <Chip
              size='small'
              label={getStatusLabel(steps.flightPlan.status)}
              color={getStatusColor(steps.flightPlan.status)}
              sx={{ mt: 1 }}
            />
          </Box>
        )

      case 'airspaceAssessment':
        return (
          <Box>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              {step.description}
            </Typography>
            {steps.airspaceAssessment.result && (
              <Box sx={{ mt: 1 }}>
                <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                  <Chip
                    size='small'
                    label={
                      steps.airspaceAssessment.result.notamRequired
                        ? 'NOTAM必要'
                        : 'NOTAM不要'
                    }
                    color={
                      steps.airspaceAssessment.result.notamRequired
                        ? 'warning'
                        : 'success'
                    }
                  />
                  <Chip
                    size='small'
                    label={`リスク: ${steps.airspaceAssessment.result.riskLevel}`}
                    color={getStatusColor(
                      steps.airspaceAssessment.result.riskLevel === 'low'
                        ? 'completed'
                        : steps.airspaceAssessment.result.riskLevel ===
                            'critical'
                          ? 'failed'
                          : 'pending'
                    )}
                  />
                  <Chip
                    size='small'
                    label={`周知先: ${steps.airspaceAssessment.result.notifyList.length}件`}
                    variant='outlined'
                  />
                </Stack>
              </Box>
            )}
            {isActive && !isComplete && (
              <Button
                variant='contained'
                size='small'
                onClick={onAssessAirspace}
                disabled={loading}
                sx={{ mt: 2 }}
                startIcon={<MapIcon />}>
                空域判定を実行
              </Button>
            )}
          </Box>
        )

      case 'notification':
        return (
          <Box>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              {step.description}
            </Typography>
            {steps.notification.summary && (
              <Box sx={{ mt: 1 }}>
                <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                  <Chip
                    size='small'
                    label={`送信済: ${steps.notification.summary.sent}/${steps.notification.summary.total}`}
                    color={
                      steps.notification.summary.sent ===
                      steps.notification.summary.total
                        ? 'success'
                        : 'warning'
                    }
                  />
                  <Chip
                    size='small'
                    label={`確認済: ${steps.notification.summary.confirmed}`}
                    color={
                      steps.notification.summary.confirmed > 0
                        ? 'success'
                        : 'default'
                    }
                  />
                  {steps.notification.summary.failed > 0 && (
                    <Chip
                      size='small'
                      label={`失敗: ${steps.notification.summary.failed}`}
                      color='error'
                    />
                  )}
                </Stack>
              </Box>
            )}
            {notificationLogs.length > 0 && (
              <Collapse in={expandedStep === 'notification'}>
                <List
                  dense
                  sx={{ mt: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                  {notificationLogs.slice(0, 5).map((log) => (
                    <ListItem key={log.id}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {log.status === 'confirmed' ? (
                          <CheckCircleIcon fontSize='small' color='success' />
                        ) : log.status === 'failed' ? (
                          <ErrorIcon fontSize='small' color='error' />
                        ) : (
                          <HourglassEmptyIcon fontSize='small' color='action' />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={log.orgName}
                        secondary={getStatusLabel(log.status)}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
            {isActive && !isComplete && (
              <Button
                variant='contained'
                size='small'
                onClick={onSendNotifications}
                disabled={loading}
                sx={{ mt: 2 }}
                startIcon={<NotificationsIcon />}>
                周知を送信
              </Button>
            )}
            {notificationLogs.length > 0 && (
              <Button
                size='small'
                onClick={() =>
                  setExpandedStep(
                    expandedStep === 'notification' ? null : 'notification'
                  )
                }
                sx={{ mt: 1, ml: 1 }}>
                {expandedStep === 'notification' ? '閉じる' : '詳細を表示'}
              </Button>
            )}
          </Box>
        )

      case 'notam':
        return (
          <Box>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              {step.description}
            </Typography>
            <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
              <Chip
                size='small'
                label={getStatusLabel(steps.notam.status)}
                color={getStatusColor(steps.notam.status)}
              />
              {steps.notam.request?.notamId && (
                <Chip
                  size='small'
                  label={`NOTAM ID: ${steps.notam.request.notamId}`}
                  variant='outlined'
                />
              )}
            </Stack>
            {isActive &&
              !isComplete &&
              steps.notam.status !== 'not_required' && (
                <Button
                  variant='contained'
                  size='small'
                  onClick={onSubmitNotam}
                  disabled={loading}
                  sx={{ mt: 2 }}
                  startIcon={<PublicIcon />}>
                  NOTAM申請
                </Button>
              )}
          </Box>
        )

      case 'approval':
        return (
          <Box>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              {step.description}
            </Typography>
            <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
              <Chip
                size='small'
                label={getStatusLabel(steps.approval.status)}
                color={getStatusColor(steps.approval.status)}
              />
              {steps.approval.request?.reviewedByName && (
                <Chip
                  size='small'
                  label={`承認者: ${steps.approval.request.reviewedByName}`}
                  variant='outlined'
                />
              )}
            </Stack>
            {steps.approval.request?.comment && (
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', mt: 1 }}>
                コメント: {steps.approval.request.comment}
              </Typography>
            )}
            {isActive &&
              !isComplete &&
              steps.approval.status === 'not_submitted' && (
                <Button
                  variant='contained'
                  size='small'
                  onClick={onRequestApproval}
                  disabled={loading}
                  sx={{ mt: 2 }}
                  startIcon={<AssignmentTurnedInIcon />}>
                  承認を申請
                </Button>
              )}
            {isError && (
              <Alert severity='error' sx={{ mt: 2 }}>
                <AlertTitle>承認が却下されました</AlertTitle>
                {steps.approval.request?.comment}
              </Alert>
            )}
          </Box>
        )

      case 'preflightCheck':
        return (
          <Box>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              {step.description}
            </Typography>
            {preflightChecklist && (
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant='determinate'
                  value={
                    (preflightChecklist.results.filter((r) => r.checked)
                      .length /
                      preflightChecklist.items.length) *
                    100
                  }
                  sx={{ mb: 1, borderRadius: 1 }}
                />
                <Stack direction='row' spacing={1}>
                  <Chip
                    size='small'
                    label={`${preflightChecklist.results.filter((r) => r.checked).length}/${preflightChecklist.items.length} 完了`}
                    color={
                      preflightChecklist.status === 'completed'
                        ? 'success'
                        : 'default'
                    }
                  />
                  <Chip
                    size='small'
                    label={getStatusLabel(preflightChecklist.status)}
                    color={getStatusColor(preflightChecklist.status)}
                  />
                </Stack>
              </Box>
            )}
            {isActive && !isComplete && (
              <Button
                variant='contained'
                size='small'
                onClick={onStartPreflightCheck}
                disabled={loading}
                sx={{ mt: 2 }}
                startIcon={<CheckCircleIcon />}>
                チェックを開始
              </Button>
            )}
          </Box>
        )

      default:
        return null
    }
  }

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
            {workflowStatus.flightPlanName}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            ワークフロー進捗
          </Typography>
        </Box>
        <Stack direction='row' spacing={1} alignItems='center'>
          <Chip
            label={`${workflowStatus.overallProgress}%`}
            color={workflowStatus.canStartFlight ? 'success' : 'default'}
            size='small'
          />
          <Tooltip title='更新'>
            <IconButton size='small' onClick={onRefresh} disabled={loading}>
              <RefreshIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* 進捗バー */}
      <LinearProgress
        variant='determinate'
        value={workflowStatus.overallProgress}
        sx={{
          mb: 2,
          height: 8,
          borderRadius: 4,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
        }}
      />

      {/* ブロッカー表示 */}
      {workflowStatus.blockers.length > 0 && !workflowStatus.canStartFlight && (
        <Alert severity='warning' sx={{ mb: 2 }}>
          <AlertTitle>次のアクション</AlertTitle>
          {workflowStatus.nextAction}
        </Alert>
      )}

      {/* 飛行開始可能 */}
      {workflowStatus.canStartFlight && (
        <Alert
          severity='success'
          sx={{ mb: 2 }}
          action={
            <Button
              color='inherit'
              size='small'
              onClick={onStartFlight}
              startIcon={<PlayArrowIcon />}>
              飛行開始
            </Button>
          }>
          <AlertTitle>準備完了</AlertTitle>
          すべてのチェックが完了しました。飛行を開始できます。
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />

      {/* ステッパー */}
      <Stepper activeStep={activeStep} orientation='vertical'>
        {WORKFLOW_STEPS.map((step, index) => (
          <Step key={step.id} completed={isStepComplete(step.id)}>
            <StepLabel
              error={isStepError(step.id)}
              StepIconComponent={() => (
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isStepComplete(step.id)
                      ? 'success.main'
                      : isStepError(step.id)
                        ? 'error.main'
                        : index === activeStep
                          ? 'primary.main'
                          : 'action.disabled',
                    color: 'white',
                  }}>
                  {isStepComplete(step.id) ? (
                    <CheckCircleIcon fontSize='small' />
                  ) : isStepError(step.id) ? (
                    <ErrorIcon fontSize='small' />
                  ) : (
                    step.icon
                  )}
                </Box>
              )}>
              <Stack direction='row' spacing={1} alignItems='center'>
                <Typography
                  fontWeight={index === activeStep ? 'bold' : 'normal'}>
                  {step.label}
                </Typography>
                <Chip
                  label={isStepComplete(step.id) ? '完了' : '未完了'}
                  size='small'
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    bgcolor: isStepComplete(step.id)
                      ? 'success.main'
                      : 'action.disabledBackground',
                    color: isStepComplete(step.id)
                      ? 'success.contrastText'
                      : 'text.secondary',
                    fontWeight: isStepComplete(step.id) ? 'bold' : 'normal',
                  }}
                />
              </Stack>
            </StepLabel>
            <StepContent>{renderStepContent(step, index)}</StepContent>
          </Step>
        ))}
      </Stepper>
    </Paper>
  )
}

export default UTMWorkflowPanel
