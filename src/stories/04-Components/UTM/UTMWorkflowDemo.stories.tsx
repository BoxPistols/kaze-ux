/**
 * UTMワークフローデモ
 *
 * 空域判定、周知、NOTAM、承認、プリフライトチェックの統合デモ
 */

import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Stack,
  Alert,
  AlertTitle,
  Chip,
  alpha,
} from '@mui/material'
import { useState, useCallback } from 'react'

import UTMCoordinateInputPanel from '@/components/utm/UTMCoordinateInputPanel'
import { UTMNotamPanel } from '@/components/utm/UTMNotamPanel'
import { UTMNotificationPanel } from '@/components/utm/UTMNotificationPanel'
import { UTMPreflightPanel } from '@/components/utm/UTMPreflightPanel'
import { UTMWorkflowPanel } from '@/components/utm/UTMWorkflowPanel'
import {
  mockApiHandlers,
  mockOrganizations,
  createMockWorkflowStatus,
  createMockNotificationLogs,
  createMockNotificationSummary,
  createMockNotamRequest,
  createMockPreflightChecklist,
} from '@/mocks/utmWorkflowMocks'
import type {
  CoordinateData,
  FlightPlan,
  FlightPlanWorkflowStatus,
  NotificationLog,
  NotificationSummary,
  NOTAMRequest,
  PreflightChecklist,
} from '@/types/utmTypes'

import type { Meta, StoryObj } from '@storybook/react'

// モック飛行計画
const mockFlightPlan: FlightPlan = {
  id: 'fp-demo-001',
  name: '港区空撮ミッション',
  description: 'ビル群の空撮テスト飛行',
  status: 'pending_approval',
  droneId: 'drone-001',
  droneName: 'DJI Matrice 300 RTK',
  pilotId: 'pilot-001',
  pilotName: '山田太郎',
  waypoints: [],
  corridorWidth: 50,
  defaultSpeed: 5,
  defaultAltitude: 100,
  altitudeMode: 'AGL',
  homePoint: { latitude: 35.6585, longitude: 139.7454, altitude: 0 },
  scheduledStartTime: new Date(Date.now() + 86400000),
  scheduledEndTime: new Date(Date.now() + 90000000),
  maxAltitude: 150,
  minBatteryLevel: 30,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'user-001',
}

// デモコンポーネント
const UTMWorkflowDemoComponent = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [currentStage, setCurrentStage] = useState<
    | 'draft'
    | 'assessed'
    | 'notified'
    | 'notam_submitted'
    | 'approved'
    | 'preflight_done'
  >('draft')

  // 状態
  const [workflowStatus, setWorkflowStatus] =
    useState<FlightPlanWorkflowStatus>(
      createMockWorkflowStatus(mockFlightPlan, { stage: 'draft' })
    )
  const [notifications, setNotifications] = useState<NotificationLog[]>([])
  const [notificationSummary, setNotificationSummary] =
    useState<NotificationSummary | null>(null)
  const [notamRequest, setNotamRequest] = useState<NOTAMRequest | null>(null)
  const droneId = mockFlightPlan.droneId ?? 'drone-001'
  const [preflightChecklist, setPreflightChecklist] =
    useState<PreflightChecklist>(
      createMockPreflightChecklist(mockFlightPlan.id, droneId, 0)
    )
  const [coordinates, setCoordinates] = useState<CoordinateData[]>([])

  // ステージを進める
  const advanceStage = useCallback(() => {
    const stages: (typeof currentStage)[] = [
      'draft',
      'assessed',
      'notified',
      'notam_submitted',
      'approved',
      'preflight_done',
    ]
    const currentIndex = stages.indexOf(currentStage)
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1]
      setCurrentStage(nextStage)
      setWorkflowStatus(
        createMockWorkflowStatus(mockFlightPlan, { stage: nextStage })
      )
    }
  }, [currentStage])

  // 空域判定
  const handleAssessAirspace = useCallback(async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    mockApiHandlers.assessAirspace(mockFlightPlan.id, {})
    setCurrentStage('assessed')
    setWorkflowStatus(
      createMockWorkflowStatus(mockFlightPlan, { stage: 'assessed' })
    )
    setLoading(false)
  }, [])

  // 周知送信
  const handleSendNotifications = useCallback(async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const logs = mockApiHandlers.sendNotifications(mockFlightPlan.id)
    setNotifications(logs)
    setNotificationSummary(
      createMockNotificationSummary(mockFlightPlan.id, logs)
    )
    setCurrentStage('notified')
    setWorkflowStatus(
      createMockWorkflowStatus(mockFlightPlan, { stage: 'notified' })
    )
    setLoading(false)
  }, [])

  // 周知確認
  const handleConfirmNotification = useCallback(async (logId: string) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    mockApiHandlers.confirmNotification(logId)
    const updatedLogs = mockApiHandlers.getNotificationLogs(mockFlightPlan.id)
    setNotifications(updatedLogs)
    setNotificationSummary(
      createMockNotificationSummary(mockFlightPlan.id, updatedLogs)
    )
    setLoading(false)
  }, [])

  // NOTAM作成
  const handleCreateNotam = useCallback(async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    const notam = mockApiHandlers.createNotam(mockFlightPlan.id, mockFlightPlan)
    setNotamRequest(notam)
    setLoading(false)
  }, [])

  // NOTAM申請
  const handleSubmitNotam = useCallback(async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    mockApiHandlers.submitNotam(mockFlightPlan.id)
    mockApiHandlers.approveNotam(mockFlightPlan.id)
    setNotamRequest(
      createMockNotamRequest(mockFlightPlan.id, mockFlightPlan, 'approved')
    )
    setCurrentStage('notam_submitted')
    setWorkflowStatus(
      createMockWorkflowStatus(mockFlightPlan, { stage: 'notam_submitted' })
    )
    setLoading(false)
  }, [])

  // 承認申請
  const handleRequestApproval = useCallback(async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    mockApiHandlers.createApproval(mockFlightPlan.id)
    mockApiHandlers.approveFlightPlan(mockFlightPlan.id, '承認しました')
    setCurrentStage('approved')
    setWorkflowStatus(
      createMockWorkflowStatus(mockFlightPlan, { stage: 'approved' })
    )
    setLoading(false)
  }, [])

  // プリフライトチェック項目の切り替え
  const handleTogglePreflightItem = useCallback(
    (itemId: string, checked: boolean) => {
      setLoading(true)
      mockApiHandlers.updatePreflightItem(mockFlightPlan.id, itemId, checked)
      const updatedChecklist = mockApiHandlers.getPreflightChecklist(
        mockFlightPlan.id,
        droneId
      )
      setPreflightChecklist(updatedChecklist)
      setLoading(false)
    },
    [droneId]
  )

  // プリフライトチェック完了
  const handleCompletePreflight = useCallback(async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    // すべてのアイテムをチェック
    preflightChecklist.items.forEach((item) => {
      mockApiHandlers.updatePreflightItem(mockFlightPlan.id, item.id, true)
    })
    const updatedChecklist = mockApiHandlers.getPreflightChecklist(
      mockFlightPlan.id,
      droneId
    )
    setPreflightChecklist(updatedChecklist)
    setCurrentStage('preflight_done')
    setWorkflowStatus(
      createMockWorkflowStatus(mockFlightPlan, { stage: 'preflight_done' })
    )
    setLoading(false)
  }, [preflightChecklist, droneId])

  // リセット
  const handleReset = useCallback(() => {
    mockApiHandlers.resetStore()
    setCurrentStage('draft')
    setWorkflowStatus(
      createMockWorkflowStatus(mockFlightPlan, { stage: 'draft' })
    )
    setNotifications([])
    setNotificationSummary(null)
    setNotamRequest(null)
    setPreflightChecklist(
      createMockPreflightChecklist(mockFlightPlan.id, droneId, 0)
    )
  }, [droneId])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 3,
      }}>
      <Container maxWidth='xl'>
        {/* ヘッダー */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
            borderRadius: 2,
          }}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'>
            <Box>
              <Typography variant='h5' fontWeight='bold'>
                UTMワークフローデモ
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                飛行計画の登録から飛行開始までの全ワークフローをシミュレーション
              </Typography>
            </Box>
            <Stack direction='row' spacing={2}>
              <Chip
                label={`現在のステージ: ${currentStage}`}
                color='primary'
                variant='outlined'
              />
              <Button variant='outlined' onClick={handleReset}>
                リセット
              </Button>
              <Button
                variant='contained'
                onClick={advanceStage}
                disabled={currentStage === 'preflight_done'}>
                次のステージへ
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* タブ */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant='scrollable'
            scrollButtons='auto'>
            <Tab label='ワークフロー全体' />
            <Tab label='座標入力' />
            <Tab label='周知パネル' />
            <Tab label='NOTAMパネル' />
            <Tab label='プリフライト' />
          </Tabs>
        </Paper>

        {/* コンテンツ */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <UTMWorkflowPanel
                workflowStatus={workflowStatus}
                loading={loading}
                onAssessAirspace={handleAssessAirspace}
                onSendNotifications={handleSendNotifications}
                onSubmitNotam={handleSubmitNotam}
                onRequestApproval={handleRequestApproval}
                onStartPreflightCheck={() => setActiveTab(4)}
                onStartFlight={() => alert('飛行開始！(デモではここまで)')}
                notificationLogs={notifications}
                preflightChecklist={preflightChecklist}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={2}>
                <Alert severity='info'>
                  <AlertTitle>デモの使い方</AlertTitle>
                  <Typography variant='body2'>
                    1. 「空域判定を実行」ボタンで空域判定を開始
                    <br />
                    2. 「周知を送信」で有人機団体に周知
                    <br />
                    3. 「NOTAM申請」でNOTAM申請を実行
                    <br />
                    4. 「承認を申請」で管理者承認を取得
                    <br />
                    5. プリフライトチェックを完了
                    <br />
                    6. 飛行開始！
                  </Typography>
                </Alert>
                <Paper sx={{ p: 2 }}>
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    gutterBottom>
                    飛行計画情報
                  </Typography>
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}>
                      <Typography variant='caption' color='text.secondary'>
                        計画名
                      </Typography>
                      <Typography variant='body2'>
                        {mockFlightPlan.name}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}>
                      <Typography variant='caption' color='text.secondary'>
                        機体
                      </Typography>
                      <Typography variant='body2'>
                        {mockFlightPlan.droneName}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}>
                      <Typography variant='caption' color='text.secondary'>
                        操縦者
                      </Typography>
                      <Typography variant='body2'>
                        {mockFlightPlan.pilotName}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}>
                      <Typography variant='caption' color='text.secondary'>
                        最大高度
                      </Typography>
                      <Typography variant='body2'>
                        {mockFlightPlan.maxAltitude}m
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <UTMCoordinateInputPanel
                coordinates={coordinates}
                onCoordinatesChange={setCoordinates}
              />
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <UTMNotificationPanel
                flightPlanId={mockFlightPlan.id}
                flightPlanName={mockFlightPlan.name}
                notifications={notifications}
                summary={notificationSummary ?? undefined}
                loading={loading}
                canSend={currentStage === 'assessed'}
                onSendAll={handleSendNotifications}
                onConfirm={handleConfirmNotification}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
                  有人機団体マスタ
                </Typography>
                <Stack spacing={1}>
                  {mockOrganizations.map((org) => (
                    <Chip
                      key={org.id}
                      label={`${org.orgName} (${org.contactType})`}
                      size='small'
                      variant='outlined'
                    />
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <UTMNotamPanel
                notamRequest={notamRequest}
                notamRequired={
                  workflowStatus.steps.airspaceAssessment.result
                    ?.notamRequired ?? true
                }
                loading={loading}
                onCreateDraft={handleCreateNotam}
                onSubmit={handleSubmitNotam}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Alert severity='info'>
                <AlertTitle>NOTAM申請について</AlertTitle>
                <Typography variant='body2'>
                  空域判定の結果、NOTAMが必要と判定された場合は申請書を作成し、航空局に提出する必要があります。
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        )}

        {activeTab === 4 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <UTMPreflightPanel
                checklist={preflightChecklist}
                loading={loading}
                onToggleItem={handleTogglePreflightItem}
                onComplete={handleCompletePreflight}
                onReset={() =>
                  setPreflightChecklist(
                    createMockPreflightChecklist(mockFlightPlan.id, droneId, 0)
                  )
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Alert severity='info'>
                <AlertTitle>プリフライトチェックについて</AlertTitle>
                <Typography variant='body2'>
                  飛行開始前に必要な確認項目を順にチェックしてください。必須項目がすべて完了すると飛行を開始できます。
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  )
}

// Storybook設定
const meta: Meta<typeof UTMWorkflowDemoComponent> = {
  title: 'Components/UTM/Workflow/UTMWorkflowDemo',
  component: UTMWorkflowDemoComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'UTMワークフローの統合デモ。空域判定、周知、NOTAM、承認、プリフライトチェックの全フローを体験できます。',
      },
    },
  },
  tags: ['autodocs', 'prototype'],
}

export default meta
type Story = StoryObj<typeof UTMWorkflowDemoComponent>

export const Default: Story = {}

export const WorkflowComplete: Story = {
  render: () => {
    const completeDroneId = mockFlightPlan.droneId ?? 'drone-001'
    const completeWorkflowStatus = createMockWorkflowStatus(mockFlightPlan, {
      stage: 'preflight_done',
    })
    const logs = createMockNotificationLogs(
      mockFlightPlan.id,
      mockOrganizations.slice(0, 3).map((o) => o.id)
    )
    // NOTAM申請データ（デモ用に作成）
    createMockNotamRequest(mockFlightPlan.id, mockFlightPlan, 'published')
    const checklist = createMockPreflightChecklist(
      mockFlightPlan.id,
      completeDroneId,
      1
    )

    return (
      <Container maxWidth='md' sx={{ py: 3 }}>
        <Typography variant='h5' gutterBottom>
          完了状態のワークフロー
        </Typography>
        <UTMWorkflowPanel
          workflowStatus={completeWorkflowStatus}
          notificationLogs={logs}
          preflightChecklist={checklist}
          onStartFlight={() => alert('飛行開始！')}
        />
      </Container>
    )
  },
}
