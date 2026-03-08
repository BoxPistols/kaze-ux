/**
 * UTMPreflightWizard - 飛行前準備ウィザード
 *
 * ステップベースの飛行前準備フロー:
 * 1. プロジェクト/フライト選択
 * 2. 機体選定・確認
 * 3. 環境確認（気象・空域）
 * 4. チェックリスト
 * 5. アラート設定
 * 6. 最終確認
 */

import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloudIcon from '@mui/icons-material/Cloud'
import FolderIcon from '@mui/icons-material/Folder'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Paper,
  Stack,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useState, useMemo, type ReactNode } from 'react'

import type { ScheduledFlight } from '@/mocks/utmMultiDroneScenarios'
import type { AlertThresholdConfig } from '@/types/utmTypes'

// ステップ定義
interface PreflightStep {
  id: string
  label: string
  icon: ReactNode
  description: string
  isOptional?: boolean
}

const PREFLIGHT_STEPS: PreflightStep[] = [
  {
    id: 'project',
    label: 'プロジェクト選択',
    icon: <FolderIcon />,
    description: '飛行計画を選択',
  },
  {
    id: 'aircraft',
    label: '機体選定',
    icon: <AirplanemodeActiveIcon />,
    description: '使用機体の確認',
  },
  {
    id: 'environment',
    label: '環境確認',
    icon: <CloudIcon />,
    description: '気象・空域状況',
  },
  {
    id: 'checklist',
    label: 'チェックリスト',
    icon: <PlaylistAddCheckIcon />,
    description: '飛行前点検',
  },
  {
    id: 'alerts',
    label: 'アラート設定',
    icon: <NotificationsActiveIcon />,
    description: '閾値・通知設定',
    isOptional: true,
  },
  {
    id: 'confirm',
    label: '最終確認',
    icon: <RocketLaunchIcon />,
    description: '飛行開始準備',
  },
]

export interface UTMPreflightWizardProps {
  /** 選択済みフライト（あれば） */
  selectedFlight?: ScheduledFlight
  /** 利用可能なフライト一覧 */
  availableFlights: ScheduledFlight[]
  /** フライト選択ハンドラ */
  onFlightSelect: (flight: ScheduledFlight) => void
  /** アラート設定 */
  alertConfig?: AlertThresholdConfig
  /** アラート設定変更ハンドラ */
  onAlertConfigChange?: (config: AlertThresholdConfig) => void
  /** 飛行開始ハンドラ */
  onStartFlight: (flightId: string) => void
  /** キャンセルハンドラ */
  onCancel?: () => void
}

// ステップ完了状態の型
interface StepStatus {
  completed: boolean
  error?: string
}

function UTMPreflightWizard(props: UTMPreflightWizardProps): JSX.Element {
  const {
    selectedFlight,
    availableFlights,
    onFlightSelect,
    onStartFlight,
    onCancel,
  } = props

  const theme = useTheme()
  const [activeStep, setActiveStep] = useState(0)

  // 各ステップの完了状態を計算
  const stepStatuses = useMemo((): Record<string, StepStatus> => {
    const statuses: Record<string, StepStatus> = {}

    // Step 1: プロジェクト選択
    statuses['project'] = {
      completed: !!selectedFlight,
    }

    // Step 2: 機体選定
    statuses['aircraft'] = {
      completed: !!selectedFlight?.drone,
    }

    // Step 3: 環境確認
    if (selectedFlight) {
      const weatherOk = selectedFlight.weather.status !== 'prohibited'
      const airspaceOk = !selectedFlight.airspaceStatus.inRedZone
      statuses['environment'] = {
        completed: weatherOk && airspaceOk,
        error: !weatherOk
          ? '気象条件が飛行不可'
          : !airspaceOk
            ? '空域制限あり'
            : undefined,
      }
    } else {
      statuses['environment'] = { completed: false }
    }

    // Step 4: チェックリスト
    statuses['checklist'] = {
      completed: selectedFlight?.preflightStatus === 'completed',
    }

    // Step 5: アラート設定（オプション）
    statuses['alerts'] = {
      completed: true, // デフォルト設定があるため常にOK
    }

    // Step 6: 最終確認
    statuses['confirm'] = {
      completed: false, // ユーザーが確認するまで未完了
    }

    return statuses
  }, [selectedFlight])

  // 全ステップ完了チェック（オプションステップ除く）
  const allRequiredStepsCompleted = useMemo(() => {
    return PREFLIGHT_STEPS.filter((step) => !step.isOptional).every(
      (step) => stepStatuses[step.id]?.completed
    )
  }, [stepStatuses])

  const handleStepClick = (stepIndex: number) => {
    setActiveStep(stepIndex)
  }

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, PREFLIGHT_STEPS.length - 1))
  }

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0))
  }

  const handleStartFlight = () => {
    if (selectedFlight) {
      onStartFlight(selectedFlight.id)
    }
  }

  // ステップコンテンツのレンダリング
  const renderStepContent = (stepId: string): ReactNode => {
    switch (stepId) {
      case 'project':
        return (
          <ProjectSelectStep
            flights={availableFlights}
            selectedFlight={selectedFlight}
            onSelect={onFlightSelect}
          />
        )
      case 'aircraft':
        return <AircraftStep flight={selectedFlight} />
      case 'environment':
        return <EnvironmentStep flight={selectedFlight} />
      case 'checklist':
        return <ChecklistStep flight={selectedFlight} />
      case 'alerts':
        return <AlertsStep />
      case 'confirm':
        return (
          <ConfirmStep
            flight={selectedFlight}
            stepStatuses={stepStatuses}
            onStartFlight={handleStartFlight}
          />
        )
      default:
        return null
    }
  }

  const currentStep = PREFLIGHT_STEPS[activeStep]

  return (
    <Box sx={{ width: '100%' }}>
      {/* ステッパー */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
        }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {PREFLIGHT_STEPS.map((step, index) => {
            const status = stepStatuses[step.id]
            const hasError = status?.error
            const isCompleted = status?.completed

            return (
              <Step key={step.id} completed={isCompleted}>
                <StepButton onClick={() => handleStepClick(index)}>
                  <StepLabel
                    optional={
                      step.isOptional ? (
                        <Typography variant='caption'>オプション</Typography>
                      ) : undefined
                    }
                    error={!!hasError}
                    StepIconProps={{
                      icon: isCompleted ? <CheckCircleIcon /> : step.icon,
                    }}>
                    {step.label}
                  </StepLabel>
                </StepButton>
              </Step>
            )
          })}
        </Stepper>
      </Paper>

      {/* ステップコンテンツ */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 2 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}>
              {currentStep.icon}
            </Box>
            <Box>
              <Typography variant='h6'>{currentStep.label}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {currentStep.description}
              </Typography>
            </Box>
            {stepStatuses[currentStep.id]?.completed && (
              <Chip
                label='完了'
                color='success'
                size='small'
                icon={<CheckCircleIcon />}
              />
            )}
            {stepStatuses[currentStep.id]?.error && (
              <Chip
                label={stepStatuses[currentStep.id].error}
                color='error'
                size='small'
              />
            )}
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {renderStepContent(currentStep.id)}
        </CardContent>
      </Card>

      {/* ナビゲーションボタン */}
      <Stack direction='row' justifyContent='space-between'>
        <Button
          variant='outlined'
          onClick={onCancel}
          sx={{ visibility: onCancel ? 'visible' : 'hidden' }}>
          キャンセル
        </Button>

        <Stack direction='row' spacing={2}>
          <Button
            variant='outlined'
            onClick={handleBack}
            disabled={activeStep === 0}>
            戻る
          </Button>

          {activeStep === PREFLIGHT_STEPS.length - 1 ? (
            <Button
              variant='contained'
              color='primary'
              onClick={handleStartFlight}
              disabled={!allRequiredStepsCompleted}
              startIcon={<RocketLaunchIcon />}>
              飛行開始
            </Button>
          ) : (
            <Button variant='contained' onClick={handleNext}>
              次へ
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  )
}

// ============================================
// Step Components
// ============================================

// Step 1: プロジェクト/フライト選択
function ProjectSelectStep(props: {
  flights: ScheduledFlight[]
  selectedFlight?: ScheduledFlight
  onSelect: (flight: ScheduledFlight) => void
}): JSX.Element {
  const { flights, selectedFlight, onSelect } = props
  const theme = useTheme()

  return (
    <Box>
      <Typography variant='subtitle2' gutterBottom>
        本日の予定フライト
      </Typography>
      <Stack spacing={1}>
        {flights.map((flight) => (
          <Paper
            key={flight.id}
            variant='outlined'
            onClick={() => onSelect(flight)}
            sx={{
              p: 2,
              cursor: 'pointer',
              border:
                selectedFlight?.id === flight.id
                  ? `2px solid ${theme.palette.primary.main}`
                  : undefined,
              bgcolor:
                selectedFlight?.id === flight.id
                  ? alpha(theme.palette.primary.main, 0.05)
                  : undefined,
              '&:hover': {
                bgcolor: alpha(theme.palette.action.hover, 0.1),
              },
            }}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'>
              <Box>
                <Typography variant='subtitle1' fontWeight='bold'>
                  {flight.flightPlan.name}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {flight.flightPlan.description}
                </Typography>
              </Box>
              <Stack direction='row' spacing={1}>
                <Chip
                  label={flight.drone.droneName}
                  size='small'
                  variant='outlined'
                />
                <Chip
                  label={
                    flight.weather.status === 'good'
                      ? '気象良好'
                      : flight.weather.status === 'caution'
                        ? '注意'
                        : '警告'
                  }
                  size='small'
                  color={
                    flight.weather.status === 'good'
                      ? 'success'
                      : flight.weather.status === 'caution'
                        ? 'warning'
                        : 'error'
                  }
                />
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}

// Step 2: 機体選定
function AircraftStep(props: { flight?: ScheduledFlight }): JSX.Element {
  const { flight } = props
  const theme = useTheme()

  if (!flight) {
    return (
      <Typography color='text.secondary'>フライトを選択してください</Typography>
    )
  }

  const { drone } = flight

  return (
    <Box>
      <Paper
        variant='outlined'
        sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
        <Typography variant='h6' gutterBottom>
          {drone.droneName}
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant='caption' color='text.secondary'>
              操縦者
            </Typography>
            <Typography variant='body1'>{drone.pilotName}</Typography>
          </Box>
          <Divider />
          <Stack direction='row' spacing={4}>
            <Box>
              <Typography variant='caption' color='text.secondary'>
                バッテリー
              </Typography>
              <Typography
                variant='h5'
                color={
                  drone.batteryLevel >= 80
                    ? 'success.main'
                    : drone.batteryLevel >= 50
                      ? 'warning.main'
                      : 'error.main'
                }>
                {drone.batteryLevel}%
              </Typography>
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary'>
                通信強度
              </Typography>
              <Typography
                variant='h5'
                color={
                  drone.signalStrength >= 80
                    ? 'success.main'
                    : drone.signalStrength >= 50
                      ? 'warning.main'
                      : 'error.main'
                }>
                {drone.signalStrength}%
              </Typography>
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary'>
                GPS
              </Typography>
              <Typography variant='h5' color='success.main'>
                良好
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}

// Step 3: 環境確認
function EnvironmentStep(props: { flight?: ScheduledFlight }): JSX.Element {
  const { flight } = props
  const theme = useTheme()

  if (!flight) {
    return (
      <Typography color='text.secondary'>フライトを選択してください</Typography>
    )
  }

  const { weather, airspaceStatus } = flight

  return (
    <Stack spacing={2}>
      {/* 気象情報 */}
      <Paper
        variant='outlined'
        sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
        <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
          気象状況
        </Typography>
        <Stack direction='row' spacing={4}>
          <Box>
            <Typography variant='caption' color='text.secondary'>
              気温
            </Typography>
            <Typography variant='h6'>{weather.temperature}°C</Typography>
          </Box>
          <Box>
            <Typography variant='caption' color='text.secondary'>
              風速
            </Typography>
            <Typography variant='h6'>{weather.windSpeed}m/s</Typography>
          </Box>
          <Box>
            <Typography variant='caption' color='text.secondary'>
              視程
            </Typography>
            <Typography variant='h6'>{weather.visibility}km</Typography>
          </Box>
          <Box>
            <Typography variant='caption' color='text.secondary'>
              飛行適性
            </Typography>
            <Chip
              label={
                weather.status === 'good'
                  ? '良好'
                  : weather.status === 'caution'
                    ? '注意'
                    : '不可'
              }
              color={
                weather.status === 'good'
                  ? 'success'
                  : weather.status === 'caution'
                    ? 'warning'
                    : 'error'
              }
            />
          </Box>
        </Stack>
      </Paper>

      {/* 空域情報 */}
      <Paper
        variant='outlined'
        sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
        <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
          空域状況
        </Typography>
        <Stack direction='row' spacing={1} flexWrap='wrap'>
          {airspaceStatus.inDID && (
            <Chip label='人口集中地区' size='small' color='warning' />
          )}
          {airspaceStatus.nearAirport && (
            <Chip label='空港周辺' size='small' color='warning' />
          )}
          {airspaceStatus.inRedZone && (
            <Chip label='飛行禁止区域' size='small' color='error' />
          )}
          {airspaceStatus.inYellowZone && (
            <Chip label='注意区域' size='small' color='warning' />
          )}
          {airspaceStatus.notamActive && (
            <Chip label='NOTAM申請済み' size='small' color='primary' />
          )}
          {!airspaceStatus.inDID &&
            !airspaceStatus.nearAirport &&
            !airspaceStatus.inRedZone &&
            !airspaceStatus.inYellowZone && (
              <Chip label='制限なし' size='small' color='success' />
            )}
        </Stack>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          {airspaceStatus.summary}
        </Typography>
      </Paper>
    </Stack>
  )
}

// Step 4: チェックリスト
function ChecklistStep(props: { flight?: ScheduledFlight }): JSX.Element {
  const { flight } = props
  const theme = useTheme()

  if (!flight) {
    return (
      <Typography color='text.secondary'>フライトを選択してください</Typography>
    )
  }

  // チェックリストカテゴリ
  const categories = [
    { id: 'aircraft', label: '機体点検', items: 5, completed: 5 },
    { id: 'communication', label: '通信確認', items: 3, completed: 3 },
    { id: 'weather', label: '気象確認', items: 2, completed: 2 },
    { id: 'personnel', label: '人員確認', items: 2, completed: 1 },
    { id: 'documentation', label: '書類確認', items: 3, completed: 2 },
  ]

  const totalItems = categories.reduce((sum, cat) => sum + cat.items, 0)
  const completedItems = categories.reduce((sum, cat) => sum + cat.completed, 0)
  const progress = Math.round((completedItems / totalItems) * 100)

  return (
    <Box>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        sx={{ mb: 2 }}>
        <Typography variant='subtitle1' fontWeight='bold'>
          チェック進捗: {completedItems}/{totalItems}
        </Typography>
        <Chip
          label={`${progress}%`}
          color={progress === 100 ? 'success' : 'warning'}
        />
      </Stack>

      <Stack spacing={1}>
        {categories.map((cat) => (
          <Paper
            key={cat.id}
            variant='outlined'
            sx={{
              p: 1.5,
              bgcolor:
                cat.completed === cat.items
                  ? alpha(theme.palette.success.main, 0.05)
                  : alpha(theme.palette.background.paper, 0.5),
              borderColor:
                cat.completed === cat.items
                  ? theme.palette.success.main
                  : undefined,
            }}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'>
              <Typography variant='body2'>{cat.label}</Typography>
              <Stack direction='row' spacing={1} alignItems='center'>
                <Typography variant='caption' color='text.secondary'>
                  {cat.completed}/{cat.items}
                </Typography>
                {cat.completed === cat.items ? (
                  <CheckCircleIcon color='success' sx={{ fontSize: 18 }} />
                ) : (
                  <Chip
                    label='未完了'
                    size='small'
                    color='warning'
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}

// Step 5: アラート設定
function AlertsStep(): JSX.Element {
  const theme = useTheme()

  const alertCategories = [
    {
      label: 'バッテリー低下',
      threshold: '20%以下',
      enabled: true,
    },
    {
      label: '通信品質低下',
      threshold: '30%以下',
      enabled: true,
    },
    {
      label: '高度逸脱',
      threshold: '±10m',
      enabled: true,
    },
    {
      label: 'ジオフェンス接近',
      threshold: '50m以内',
      enabled: true,
    },
    {
      label: '風速超過',
      threshold: '10m/s以上',
      enabled: false,
    },
  ]

  return (
    <Box>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        飛行中のアラート条件を確認・設定できます。デフォルト設定が適用されています。
      </Typography>

      <Stack spacing={1}>
        {alertCategories.map((alert) => (
          <Paper
            key={alert.label}
            variant='outlined'
            sx={{
              p: 1.5,
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              opacity: alert.enabled ? 1 : 0.6,
            }}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'>
              <Box>
                <Typography variant='body2' fontWeight='bold'>
                  {alert.label}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  閾値: {alert.threshold}
                </Typography>
              </Box>
              <Chip
                label={alert.enabled ? 'ON' : 'OFF'}
                size='small'
                color={alert.enabled ? 'primary' : 'default'}
              />
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Button variant='text' size='small' sx={{ mt: 2 }}>
        詳細設定を開く
      </Button>
    </Box>
  )
}

// Step 6: 最終確認
function ConfirmStep(props: {
  flight?: ScheduledFlight
  stepStatuses: Record<string, StepStatus>
  onStartFlight: () => void
}): JSX.Element {
  const { flight, stepStatuses } = props
  const theme = useTheme()

  if (!flight) {
    return (
      <Typography color='text.secondary'>フライトを選択してください</Typography>
    )
  }

  const requiredSteps = PREFLIGHT_STEPS.filter((s) => !s.isOptional)
  const allComplete = requiredSteps.every((s) => stepStatuses[s.id]?.completed)

  return (
    <Box>
      <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
        飛行開始前の最終確認
      </Typography>

      <Paper
        variant='outlined'
        sx={{
          p: 2,
          mb: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.5),
        }}>
        <Typography variant='h6' gutterBottom>
          {flight.flightPlan.name}
        </Typography>
        <Stack spacing={1}>
          <Stack direction='row' spacing={2}>
            <Typography variant='body2' color='text.secondary'>
              機体:
            </Typography>
            <Typography variant='body2'>{flight.drone.droneName}</Typography>
          </Stack>
          <Stack direction='row' spacing={2}>
            <Typography variant='body2' color='text.secondary'>
              操縦者:
            </Typography>
            <Typography variant='body2'>{flight.drone.pilotName}</Typography>
          </Stack>
        </Stack>
      </Paper>

      <Typography variant='subtitle2' gutterBottom>
        準備状況
      </Typography>
      <Stack spacing={0.5}>
        {PREFLIGHT_STEPS.map((step) => {
          const status = stepStatuses[step.id]
          return (
            <Stack
              key={step.id}
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              sx={{ py: 0.5 }}>
              <Typography variant='body2'>
                {step.label}
                {step.isOptional && (
                  <Typography
                    component='span'
                    variant='caption'
                    color='text.secondary'>
                    {' '}
                    (任意)
                  </Typography>
                )}
              </Typography>
              {status?.completed ? (
                <CheckCircleIcon color='success' sx={{ fontSize: 18 }} />
              ) : status?.error ? (
                <Chip label={status.error} size='small' color='error' />
              ) : (
                <Chip label='未完了' size='small' color='warning' />
              )}
            </Stack>
          )
        })}
      </Stack>

      {!allComplete && (
        <Typography
          variant='body2'
          color='error'
          sx={{ mt: 2, textAlign: 'center' }}>
          必須ステップを完了してください
        </Typography>
      )}
    </Box>
  )
}

export default UTMPreflightWizard
