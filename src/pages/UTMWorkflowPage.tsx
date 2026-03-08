/**
 * UTMワークフロー管理ページ
 *
 * 飛行計画のワークフロー進捗管理と各ステップの操作を提供する
 */

import AddIcon from '@mui/icons-material/Add'
import AssignmentIcon from '@mui/icons-material/Assignment'
import CalculateIcon from '@mui/icons-material/Calculate'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DescriptionIcon from '@mui/icons-material/Description'
import FlightIcon from '@mui/icons-material/Flight'
import RefreshIcon from '@mui/icons-material/Refresh'
import VerifiedIcon from '@mui/icons-material/Verified'
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  IconButton,
  Tooltip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  alpha,
  useTheme,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  Badge,
  CircularProgress,
} from '@mui/material'
import React, { useState, useCallback, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

import UTMCoordinateReviewPanel from '@/components/utm/UTMCoordinateReviewPanel'
import UTMDocumentGenerationPanel from '@/components/utm/UTMDocumentGenerationPanel'
import UTMFallDispersionPanel from '@/components/utm/UTMFallDispersionPanel'
import UTMNotamPanel from '@/components/utm/UTMNotamPanel'
import UTMNotificationPanel from '@/components/utm/UTMNotificationPanel'
// UTMPreflightPanel は /operations/prepare に移動済み
import UTMWorkflowPanel from '@/components/utm/UTMWorkflowPanel'
import {
  getScenarioFlights,
  type ScheduledFlight,
} from '@/mocks/utmMultiDroneScenarios'
import {
  createMockAirspaceAssessment,
  createMockNotificationLogs,
  createMockNotamRequest,
  createMockApprovalRequest,
  createMockWorkflowStatus,
  mockOrganizations,
} from '@/mocks/utmWorkflowMocks'
import type {
  CoordinateData,
  FallDispersionResult,
  FlightPlan,
  FlightPlanStatus,
  FlightPlanWorkflowStatus,
  NotificationLog,
  NOTAMRequest,
  ApprovalRequest,
  AirspaceAssessmentResult,
} from '@/types/utmTypes'

// ============================================
// ワークフロー用の簡略化された飛行計画型
// ============================================

/**
 * ワークフローステージ
 *
 * UTM申請フローの進行状態を表す:
 * - draft: 下書き（飛行計画作成中）
 * - assessed: 空域判定完了
 * - notified: 周知送信完了
 * - notam_submitted: NOTAM申請済み
 * - approved: 承認取得
 * - preflight_done: プリフライトチェック完了
 */
type WorkflowStage =
  | 'draft'
  | 'assessed'
  | 'notified'
  | 'notam_submitted'
  | 'approved'
  | 'preflight_done'

/**
 * 飛行計画ステータスからワークフローステージを決定
 *
 * マッピングルール:
 * - draft → draft（初期状態）
 * - pending_approval → notam_submitted（承認待ち＝NOTAM申請済み）
 * - approved → approved（承認済み）
 * - rejected → assessed（却下＝再評価が必要）
 * - active → preflight_done（飛行中＝プリフライト完了後）
 * - completed → preflight_done（完了）
 * - cancelled → draft（キャンセル＝やり直し）
 */
function getWorkflowStageFromStatus(status: FlightPlanStatus): WorkflowStage {
  switch (status) {
    case 'draft':
    case 'cancelled':
      return 'draft'
    case 'pending_approval':
      return 'notam_submitted'
    case 'approved':
      return 'approved'
    case 'rejected':
      return 'assessed' // 却下された場合は再評価ステージに戻る
    case 'active':
    case 'completed':
      return 'preflight_done'
    default:
      return 'draft'
  }
}

/** ワークフロー用飛行区域 */
interface WorkflowFlightArea {
  type: 'polygon' | 'circle' | 'corridor'
  coordinates: [number, number][]
  maxAltitude?: number
  minAltitude?: number
  radiusKm?: number
}

/** 緊急時手順 */
interface EmergencyProcedures {
  landingSites: Array<{ name: string; lat: number; lng: number }>
  contactNumbers: string[]
  procedures: string
}

/** ワークフロー用飛行計画 */
interface WorkflowFlightPlan {
  id: string
  name: string
  description?: string
  status: FlightPlanStatus
  droneId?: string
  pilotId?: string
  pilotName?: string
  scheduledStartTime?: Date
  scheduledEndTime?: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
  // ワークフロー固有
  flightArea?: WorkflowFlightArea
  emergencyProcedures?: EmergencyProcedures
}

// モック飛行計画データ
const createMockFlightPlans = (): WorkflowFlightPlan[] => [
  {
    id: 'fp-001',
    name: '東京湾岸インフラ点検飛行',
    description:
      '東京湾岸エリアの橋梁・護岸施設の定期点検飛行。高解像度カメラによる目視点検を実施。',
    status: 'approved',
    droneId: 'drone-001',
    pilotId: 'pilot-001',
    pilotName: '山田太郎',
    scheduledStartTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    scheduledEndTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
    flightArea: {
      type: 'polygon',
      coordinates: [
        [139.77, 35.68],
        [139.78, 35.68],
        [139.78, 35.67],
        [139.77, 35.67],
        [139.77, 35.68],
      ],
      maxAltitude: 120,
      minAltitude: 50,
    },
    emergencyProcedures: {
      landingSites: [
        { name: '緊急着陸地点A（公園）', lat: 35.675, lng: 139.775 },
        { name: '緊急着陸地点B（駐車場）', lat: 35.678, lng: 139.772 },
      ],
      contactNumbers: ['090-1234-5678', '03-XXXX-XXXX'],
      procedures: '通信途絶時は自動帰還、バッテリー残量20%で強制帰還',
    },
    createdBy: 'user-001',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'fp-002',
    name: '横浜港湾施設調査',
    description:
      '横浜港コンテナターミナル周辺の施設状況調査。物流効率化のための空撮データ収集。',
    status: 'pending_approval',
    droneId: 'drone-002',
    pilotId: 'pilot-001',
    pilotName: '山田太郎',
    scheduledStartTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    scheduledEndTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
    flightArea: {
      type: 'polygon',
      coordinates: [
        [139.64, 35.45],
        [139.65, 35.45],
        [139.65, 35.44],
        [139.64, 35.44],
        [139.64, 35.45],
      ],
      maxAltitude: 100,
      minAltitude: 30,
    },
    emergencyProcedures: {
      landingSites: [
        { name: '緊急着陸地点（港湾管理棟前）', lat: 35.445, lng: 139.645 },
      ],
      contactNumbers: ['090-2345-6789'],
      procedures: '通信途絶時は自動帰還、港湾管理者へ即時連絡',
    },
    createdBy: 'user-001',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'fp-003',
    name: '川崎臨海部環境モニタリング',
    description:
      '川崎臨海部工業地帯の環境モニタリング飛行。大気質センサーによるデータ収集。',
    status: 'draft',
    droneId: 'drone-003',
    pilotId: 'pilot-002',
    pilotName: '鈴木一郎',
    scheduledStartTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
    scheduledEndTime: new Date(Date.now() + 74 * 60 * 60 * 1000),
    flightArea: {
      type: 'polygon',
      coordinates: [
        [139.75, 35.52],
        [139.76, 35.52],
        [139.76, 35.51],
        [139.75, 35.51],
        [139.75, 35.52],
      ],
      maxAltitude: 80,
      minAltitude: 20,
    },
    emergencyProcedures: {
      landingSites: [
        { name: '緊急着陸地点（工場敷地内）', lat: 35.515, lng: 139.755 },
      ],
      contactNumbers: ['090-3456-7890'],
      procedures: '通信途絶時は自動帰還、工場管理者へ連絡',
    },
    createdBy: 'user-002',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: 'fp-004',
    name: '多摩川河川敷測量飛行',
    description:
      '多摩川河川敷の地形測量。RTK-GPS搭載による高精度3Dマッピング実施。',
    status: 'approved',
    droneId: 'drone-001',
    pilotId: 'pilot-001',
    pilotName: '山田太郎',
    scheduledStartTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
    scheduledEndTime: new Date(Date.now() + 51 * 60 * 60 * 1000),
    flightArea: {
      type: 'polygon',
      coordinates: [
        [139.42, 35.58],
        [139.44, 35.58],
        [139.44, 35.56],
        [139.42, 35.56],
        [139.42, 35.58],
      ],
      maxAltitude: 150,
      minAltitude: 50,
    },
    emergencyProcedures: {
      landingSites: [
        { name: '緊急着陸地点（河川敷グラウンド）', lat: 35.57, lng: 139.43 },
      ],
      contactNumbers: ['090-4567-8901'],
      procedures: '河川増水時は即時帰還、国土交通省河川事務所へ連絡',
    },
    createdBy: 'user-001',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: 'fp-005',
    name: '羽田空港周辺監視飛行',
    description:
      '羽田空港周辺の鳥害対策モニタリング。管制塔との連携による安全飛行。',
    status: 'pending_approval',
    droneId: 'drone-004',
    pilotId: 'pilot-003',
    pilotName: '佐藤花子',
    scheduledStartTime: new Date(Date.now() + 96 * 60 * 60 * 1000),
    scheduledEndTime: new Date(Date.now() + 98 * 60 * 60 * 1000),
    flightArea: {
      type: 'polygon',
      coordinates: [
        [139.78, 35.56],
        [139.79, 35.56],
        [139.79, 35.55],
        [139.78, 35.55],
        [139.78, 35.56],
      ],
      maxAltitude: 50,
      minAltitude: 10,
    },
    emergencyProcedures: {
      landingSites: [
        { name: '緊急着陸地点（空港管理区域外）', lat: 35.555, lng: 139.785 },
      ],
      contactNumbers: ['090-5678-9012', '03-XXXX-YYYY'],
      procedures: '管制指示に従い即時着陸、ADS-B常時送信',
    },
    createdBy: 'user-003',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'fp-006',
    name: '千葉ニュータウン配送テスト',
    description: 'ドローン物流実証実験。医薬品配送ルートの検証飛行。',
    status: 'draft',
    droneId: 'drone-005',
    pilotId: 'pilot-004',
    pilotName: '田中健太',
    scheduledStartTime: new Date(Date.now() + 120 * 60 * 60 * 1000),
    scheduledEndTime: new Date(Date.now() + 122 * 60 * 60 * 1000),
    flightArea: {
      type: 'polygon',
      coordinates: [
        [140.1, 35.78],
        [140.12, 35.78],
        [140.12, 35.76],
        [140.1, 35.76],
        [140.1, 35.78],
      ],
      maxAltitude: 100,
      minAltitude: 40,
    },
    emergencyProcedures: {
      landingSites: [
        { name: '緊急着陸地点A（配送センター）', lat: 35.77, lng: 140.11 },
        { name: '緊急着陸地点B（公園）', lat: 35.765, lng: 140.105 },
      ],
      contactNumbers: ['090-6789-0123'],
      procedures: '荷物投下後に帰還、住宅地上空飛行禁止',
    },
    createdBy: 'user-004',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
]

// 飛行計画ステータスの表示ラベル
const getFlightPlanStatusLabel = (
  status: FlightPlanStatus
): {
  label: string
  color: 'default' | 'warning' | 'success' | 'error' | 'info'
} => {
  switch (status) {
    case 'draft':
      return { label: '下書き', color: 'default' }
    case 'pending_approval':
      return { label: '申請中', color: 'warning' }
    case 'approved':
      return { label: '承認済', color: 'success' }
    case 'rejected':
      return { label: '却下', color: 'error' }
    case 'active':
      return { label: '飛行中', color: 'info' }
    case 'completed':
      return { label: '完了', color: 'success' }
    case 'cancelled':
      return { label: 'キャンセル', color: 'default' }
    default:
      return { label: '不明', color: 'default' }
  }
}

// タブパネルのインターフェース
interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <Box
    role='tabpanel'
    hidden={value !== index}
    id={`workflow-tabpanel-${index}`}
    aria-labelledby={`workflow-tab-${index}`}
    sx={{ height: '100%', overflow: 'auto' }}>
    {value === index && (
      <Box
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          maxWidth: 1400,
          mx: 'auto',
          pb: { xs: 4, sm: 6 },
        }}>
        {children}
      </Box>
    )}
  </Box>
)

const UTMWorkflowPage = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // URLパラメータから取得
  const flightIdParam = searchParams.get('flight')
  const tabParam = searchParams.get('tab')

  // 状態管理
  const [flightPlans] = useState<WorkflowFlightPlan[]>(createMockFlightPlans())
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    flightIdParam || null
  )
  const [workflowStatus, setWorkflowStatus] =
    useState<FlightPlanWorkflowStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(tabParam === 'preflight' ? 1 : 0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // ScheduledFlightデータを取得（Pre-Flight Lobbyから来た場合）
  const [scheduledFlight, setScheduledFlight] =
    useState<ScheduledFlight | null>(null)

  // 詳細データ
  const [_airspaceAssessment, setAirspaceAssessment] =
    useState<AirspaceAssessmentResult | null>(null)
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(
    []
  )
  const [notamRequest, setNotamRequest] = useState<NOTAMRequest | null>(null)
  const [_approvalRequest, setApprovalRequest] =
    useState<ApprovalRequest | null>(null)

  // 座標データと落下分散範囲
  const [coordinates, setCoordinates] = useState<CoordinateData[]>([])
  const [fallDispersionResult, setFallDispersionResult] =
    useState<FallDispersionResult | null>(null)

  // 選択中の飛行計画
  const selectedPlan = flightPlans.find((p) => p.id === selectedPlanId) ?? null

  // Pre-Flight LobbyからのflightId読み込み
  useEffect(() => {
    if (flightIdParam) {
      // 全シナリオからflight を検索
      const allFlights = [
        ...getScenarioFlights('default'),
        ...getScenarioFlights('haneda_multi'),
        ...getScenarioFlights('tokyo_bay_infra'),
        ...getScenarioFlights('congested_airspace'),
        ...getScenarioFlights('emergency_response'),
      ]
      const flight = allFlights.find((f) => f.id === flightIdParam)
      if (flight) {
        setScheduledFlight(flight)
      }
    }
  }, [flightIdParam])

  // 飛行計画選択時にワークフローステータスを生成
  useEffect(() => {
    if (selectedPlan) {
      // モックのワークフローステータスを生成
      // ステージを飛行計画のステータスから決定
      const stage = getWorkflowStageFromStatus(selectedPlan.status)

      // Note: createMockWorkflowStatus expects FlightPlan but we use simplified WorkflowFlightPlan
      const status = createMockWorkflowStatus(
        selectedPlan as unknown as Parameters<
          typeof createMockWorkflowStatus
        >[0],
        { stage }
      )
      setWorkflowStatus(status)

      // 飛行計画から座標データを自動取得
      const flightAreaCoords = selectedPlan.flightArea?.coordinates
      if (flightAreaCoords && flightAreaCoords.length > 0) {
        const flightCoords: CoordinateData[] = flightAreaCoords
          .map((coord, index) => {
            // [lng, lat]形式から変換
            const [longitude, latitude] = coord as [number, number]
            const isFirst = index === 0
            const isLast = index === flightAreaCoords.length - 1

            // 最初と最後が同じ座標（閉じたポリゴン）の場合は最後をスキップ
            if (isLast && flightAreaCoords.length > 1) {
              const [firstLng, firstLat] = flightAreaCoords[0] as [
                number,
                number,
              ]
              if (longitude === firstLng && latitude === firstLat) {
                return null
              }
            }

            return {
              latitude,
              longitude,
              name: isFirst
                ? '飛行区域 起点'
                : `飛行区域 頂点${String.fromCharCode(65 + index)}`,
              type: 'polygon_vertex' as const,
              order: index,
            }
          })
          .filter((coord): coord is NonNullable<typeof coord> => coord !== null)

        // 緊急着陸地点も追加
        if (selectedPlan.emergencyProcedures?.landingSites) {
          selectedPlan.emergencyProcedures.landingSites.forEach(
            (site, index) => {
              flightCoords.push({
                latitude: site.lat,
                longitude: site.lng,
                name: site.name,
                type: 'emergency_landing',
                order: flightCoords.length + index,
              })
            }
          )
        }

        setCoordinates(flightCoords)
      } else {
        setCoordinates([])
      }

      // ステータスに応じてモックデータを生成
      if (selectedPlan.status !== 'draft') {
        const assessment = createMockAirspaceAssessment(selectedPlan.id)
        setAirspaceAssessment(assessment)

        if (
          selectedPlan.status === 'approved' ||
          selectedPlan.status === 'pending_approval'
        ) {
          const logs = createMockNotificationLogs(
            selectedPlan.id,
            mockOrganizations.slice(0, 3).map((o) => o.id)
          )
          // 承認済みなら全て確認済みに
          if (selectedPlan.status === 'approved') {
            logs.forEach((log) => {
              log.status = 'confirmed'
              log.confirmedAt = new Date().toISOString()
            })
          }
          setNotificationLogs(logs)

          const notam = createMockNotamRequest(
            selectedPlan.id,
            selectedPlan as unknown as Parameters<
              typeof createMockNotamRequest
            >[1],
            selectedPlan.status === 'approved' ? 'published' : 'submitted'
          )
          setNotamRequest(notam)

          const approval = createMockApprovalRequest(
            selectedPlan.id,
            selectedPlan.status === 'approved' ? 'approved' : 'pending'
          )
          setApprovalRequest(approval)
        }

        // プリフライトチェックは /operations/prepare で実施
      } else {
        setAirspaceAssessment(null)
        setNotificationLogs([])
        setNotamRequest(null)
        setApprovalRequest(null)
      }
    } else {
      setWorkflowStatus(null)
      setAirspaceAssessment(null)
      setNotificationLogs([])
      setNotamRequest(null)
      setApprovalRequest(null)
      setCoordinates([])
      setFallDispersionResult(null)
    }
  }, [selectedPlan])

  // 空域判定実行
  const handleAssessAirspace = useCallback(() => {
    if (!selectedPlan || !workflowStatus) return

    setLoading(true)
    setTimeout(() => {
      const assessment = createMockAirspaceAssessment(selectedPlan.id)
      setAirspaceAssessment(assessment)

      // ワークフローステータス更新
      setWorkflowStatus((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          steps: {
            ...prev.steps,
            airspaceAssessment: {
              ...prev.steps.airspaceAssessment,
              status: 'completed',
              completedAt: new Date().toISOString(),
              result: assessment,
            },
            notification: {
              ...prev.steps.notification,
              status: 'pending',
            },
          },
          currentStep: 'notification',
        }
      })

      setLoading(false)
    }, 1500)
  }, [selectedPlan, workflowStatus])

  // 周知送信
  const handleSendNotifications = useCallback(() => {
    if (!selectedPlan || !workflowStatus) return

    setLoading(true)
    setTimeout(() => {
      const logs = createMockNotificationLogs(
        selectedPlan.id,
        mockOrganizations.slice(0, 4).map((o) => o.id)
      )
      setNotificationLogs(logs)

      setWorkflowStatus((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          steps: {
            ...prev.steps,
            notification: {
              ...prev.steps.notification,
              status: 'sending',
            },
          },
        }
      })

      setLoading(false)
    }, 1500)
  }, [selectedPlan, workflowStatus])

  // 周知確認
  const handleConfirmNotification = useCallback((logId: string) => {
    setNotificationLogs((prev) =>
      prev.map((log) =>
        log.id === logId
          ? {
              ...log,
              status: 'confirmed' as const,
              confirmedAt: new Date().toISOString(),
            }
          : log
      )
    )
  }, [])

  // 周知リトライ
  const handleRetryNotification = useCallback((logId: string) => {
    setNotificationLogs((prev) =>
      prev.map((log) =>
        log.id === logId
          ? {
              ...log,
              status: 'sending' as const,
              retryCount: log.retryCount + 1,
            }
          : log
      )
    )

    // 1秒後に送信完了に
    setTimeout(() => {
      setNotificationLogs((prev) =>
        prev.map((log) =>
          log.id === logId
            ? {
                ...log,
                status: 'sent' as const,
                sentAt: new Date().toISOString(),
              }
            : log
        )
      )
    }, 1000)
  }, [])

  // NOTAM申請
  const handleSubmitNotam = useCallback(() => {
    if (!selectedPlan || !workflowStatus) return

    setLoading(true)
    setTimeout(() => {
      const notam = createMockNotamRequest(
        selectedPlan.id,
        selectedPlan as unknown as Parameters<typeof createMockNotamRequest>[1],
        'submitted'
      )
      setNotamRequest(notam)

      setWorkflowStatus((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          steps: {
            ...prev.steps,
            notam: {
              ...prev.steps.notam,
              status: 'submitted',
              request: notam,
            },
          },
        }
      })

      setLoading(false)
    }, 1500)
  }, [selectedPlan, workflowStatus])

  // 承認申請
  const handleRequestApproval = useCallback(() => {
    if (!selectedPlan || !workflowStatus) return

    setLoading(true)
    setTimeout(() => {
      const approval = createMockApprovalRequest(selectedPlan.id, 'pending')
      setApprovalRequest(approval)

      setWorkflowStatus((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          steps: {
            ...prev.steps,
            approval: {
              ...prev.steps.approval,
              status: 'pending',
              request: approval,
            },
          },
          currentStep: 'approval',
        }
      })

      setLoading(false)
    }, 1500)
  }, [selectedPlan, workflowStatus])

  // プリフライトチェック開始（飛行準備ページへ遷移）
  const handleStartPreflightCheck = useCallback(() => {
    // 飛行準備ページでプリフライトチェックを実施
    navigate('/operations/prepare')
  }, [navigate])

  // 飛行開始
  const handleStartFlight = useCallback(() => {
    if (!selectedPlan || !workflowStatus) return

    setLoading(true)
    setTimeout(() => {
      setWorkflowStatus((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          steps: {
            ...prev.steps,
            preflightCheck: {
              ...prev.steps.preflightCheck,
              status: 'completed',
              completedAt: new Date().toISOString(),
            },
          },
          currentStep: 'completed',
          isReadyForFlight: true,
        }
      })

      setLoading(false)
    }, 1000)
  }, [selectedPlan, workflowStatus])

  // リフレッシュ
  const handleRefresh = useCallback(() => {
    if (!selectedPlan) return

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [selectedPlan])

  // タブ変更
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
      }}>
      {/* ヘッダー */}
      <Paper
        elevation={0}
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          borderRadius: 0,
        }}>
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'>
          <Stack direction='row' alignItems='center' spacing={2}>
            {scheduledFlight && (
              <Tooltip title='Pre-Flight Lobbyに戻る'>
                <IconButton
                  onClick={() => navigate('/utm/pre-flight-lobby')}
                  sx={{ mr: 1 }}>
                  <ChevronLeftIcon />
                </IconButton>
              </Tooltip>
            )}
            <AssignmentIcon color='primary' sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant='h5' fontWeight={600}>
                {scheduledFlight
                  ? scheduledFlight.flightPlan.name
                  : '[WIP]ワークフロー管理'}
              </Typography>
              {scheduledFlight && (
                <Typography variant='caption' color='text.secondary'>
                  飛行計画詳細・プリフライトチェック
                </Typography>
              )}
            </Box>
          </Stack>
          <Stack direction='row' spacing={1}>
            {!scheduledFlight && (
              <Button variant='outlined' startIcon={<AddIcon />} size='small'>
                新規飛行計画
              </Button>
            )}
            <Tooltip title='更新'>
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* メインコンテンツ */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左サイドバー: 飛行計画リスト（折りたたみ可能） - scheduledFlightがある場合は非表示 */}
        {!scheduledFlight && (
          <Paper
            elevation={0}
            sx={{
              width: sidebarCollapsed ? 56 : 320,
              minWidth: sidebarCollapsed ? 56 : 320,
              borderRight: `1px solid ${theme.palette.divider}`,
              borderRadius: 0,
              display: 'flex',
              flexDirection: 'column',
              transition: theme.transitions.create(['width', 'min-width'], {
                duration: theme.transitions.duration.short,
              }),
            }}>
            <Box
              sx={{
                p: sidebarCollapsed ? 1 : 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarCollapsed ? 'center' : 'space-between',
              }}>
              {!sidebarCollapsed && (
                <Typography variant='subtitle2' color='text.secondary'>
                  飛行計画一覧
                </Typography>
              )}
              <Tooltip title={sidebarCollapsed ? '展開' : '折りたたむ'}>
                <IconButton
                  size='small'
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  sx={{ ml: sidebarCollapsed ? 0 : 1 }}>
                  {sidebarCollapsed ? (
                    <ChevronRightIcon />
                  ) : (
                    <ChevronLeftIcon />
                  )}
                </IconButton>
              </Tooltip>
            </Box>

            <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
              {flightPlans.map((plan) => {
                const statusInfo = getFlightPlanStatusLabel(plan.status)
                const isSelected = plan.id === selectedPlanId

                return (
                  <ListItemButton
                    key={plan.id}
                    selected={isSelected}
                    onClick={() => setSelectedPlanId(plan.id)}
                    sx={{
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      px: sidebarCollapsed ? 1.5 : 2,
                      justifyContent: sidebarCollapsed
                        ? 'center'
                        : 'flex-start',
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                        },
                      },
                    }}>
                    <Tooltip
                      title={sidebarCollapsed ? plan.name : ''}
                      placement='right'
                      arrow>
                      <ListItemIcon
                        sx={{
                          minWidth: sidebarCollapsed ? 'auto' : 40,
                          justifyContent: 'center',
                        }}>
                        <FlightIcon
                          color={isSelected ? 'primary' : 'action'}
                          sx={{ fontSize: 20 }}
                        />
                      </ListItemIcon>
                    </Tooltip>
                    {!sidebarCollapsed && (
                      <ListItemText
                        primary={
                          <Typography
                            variant='body2'
                            fontWeight={isSelected ? 600 : 400}
                            noWrap>
                            {plan.name}
                          </Typography>
                        }
                        secondary={
                          <Stack
                            direction='row'
                            spacing={1}
                            alignItems='center'
                            sx={{ mt: 0.5 }}>
                            <Chip
                              size='small'
                              label={statusInfo.label}
                              color={statusInfo.color}
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                            <Typography
                              variant='caption'
                              color='text.secondary'>
                              {plan.scheduledStartTime?.toLocaleDateString(
                                'ja-JP'
                              ) ?? '-'}
                            </Typography>
                          </Stack>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    )}
                  </ListItemButton>
                )
              })}
            </List>
          </Paper>
        )}

        {/* メインエリア */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
          {scheduledFlight || (selectedPlan && workflowStatus) ? (
            <>
              {/* 選択中の飛行計画情報 */}
              <Paper
                elevation={0}
                sx={{
                  px: 3,
                  py: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  borderRadius: 0,
                }}>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'>
                  <Box>
                    <Typography variant='h6' fontWeight={600}>
                      {scheduledFlight
                        ? scheduledFlight.flightPlan.name
                        : selectedPlan?.name}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {scheduledFlight
                        ? scheduledFlight.flightPlan.description ||
                          `${scheduledFlight.drone.droneName} / ${scheduledFlight.drone.pilotName}`
                        : selectedPlan?.description}
                    </Typography>
                  </Box>
                  <Stack direction='row' spacing={1} alignItems='center'>
                    {scheduledFlight &&
                      scheduledFlight.preflightStatus === 'completed' && (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label='プリフライト完了'
                          color='success'
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    {workflowStatus?.isReadyForFlight && (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label='飛行準備完了'
                        color='success'
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                    {loading && <CircularProgress size={20} />}
                  </Stack>
                </Stack>
              </Paper>

              {/* タブナビゲーション */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant='scrollable'
                  scrollButtons='auto'>
                  <Tab label='ワークフロー' />
                  <Tab
                    icon={<VerifiedIcon sx={{ fontSize: 18 }} />}
                    iconPosition='start'
                    label='座標確認'
                  />
                  <Tab
                    icon={<CalculateIcon sx={{ fontSize: 18 }} />}
                    iconPosition='start'
                    label='落下分散'
                  />
                  <Tab
                    label={
                      <Badge
                        badgeContent={
                          notificationLogs.filter(
                            (l) => l.status !== 'confirmed'
                          ).length
                        }
                        color='warning'
                        max={99}>
                        周知状況
                      </Badge>
                    }
                  />
                  <Tab label='NOTAM' />
                  <Tab
                    icon={<DescriptionIcon sx={{ fontSize: 18 }} />}
                    iconPosition='start'
                    label='書類生成'
                  />
                </Tabs>
              </Box>

              {/* タブコンテンツ */}
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {/* ワークフロー */}
                <TabPanel value={activeTab} index={0}>
                  {workflowStatus ? (
                    <UTMWorkflowPanel
                      workflowStatus={workflowStatus}
                      onAssessAirspace={handleAssessAirspace}
                      onSendNotifications={handleSendNotifications}
                      onSubmitNotam={handleSubmitNotam}
                      onRequestApproval={handleRequestApproval}
                      onStartPreflightCheck={handleStartPreflightCheck}
                      onStartFlight={handleStartFlight}
                      onRefresh={handleRefresh}
                      loading={loading}
                      notificationLogs={notificationLogs}
                    />
                  ) : (
                    <Alert severity='info'>
                      <AlertTitle>飛行計画を選択してください</AlertTitle>
                      左側のリストから飛行計画を選択してください。
                    </Alert>
                  )}
                </TabPanel>

                {/* 座標確認・インポート */}
                <TabPanel value={activeTab} index={1}>
                  <UTMCoordinateReviewPanel
                    coordinates={coordinates}
                    onCoordinatesChange={setCoordinates}
                    loading={loading}
                    showRestrictionLayers
                  />
                </TabPanel>

                {/* 落下分散範囲計算 */}
                <TabPanel value={activeTab} index={2}>
                  <UTMFallDispersionPanel
                    onResultChange={setFallDispersionResult}
                    initialValues={{
                      flightAltitude:
                        selectedPlan?.flightArea?.maxAltitude ?? 100,
                    }}
                    centerCoordinate={
                      coordinates.length > 0
                        ? {
                            lat: coordinates[0].latitude,
                            lng: coordinates[0].longitude,
                          }
                        : undefined
                    }
                  />
                </TabPanel>

                {/* 周知状況 */}
                <TabPanel value={activeTab} index={3}>
                  {notificationLogs.length > 0 ? (
                    <UTMNotificationPanel
                      flightPlanId={selectedPlan?.id ?? ''}
                      notifications={notificationLogs}
                      onSendAll={handleSendNotifications}
                      onConfirm={handleConfirmNotification}
                      onRetry={handleRetryNotification}
                      loading={loading}
                    />
                  ) : (
                    <Alert severity='info'>
                      <AlertTitle>周知情報なし</AlertTitle>
                      空域判定を実行すると、周知が必要な団体が表示されます。
                    </Alert>
                  )}
                </TabPanel>

                {/* NOTAM */}
                <TabPanel value={activeTab} index={4}>
                  <UTMNotamPanel
                    notamRequest={notamRequest}
                    notamRequired={
                      workflowStatus?.steps.airspaceAssessment.result
                        ?.notamRequired ?? true
                    }
                    onSubmit={handleSubmitNotam}
                    onCreateDraft={handleSubmitNotam}
                    loading={loading}
                  />
                </TabPanel>

                {/* 書類生成 */}
                <TabPanel value={activeTab} index={5}>
                  <UTMDocumentGenerationPanel
                    flightPlan={selectedPlan as unknown as FlightPlan}
                    coordinates={coordinates}
                    fallDispersionRadius={
                      fallDispersionResult?.requiredSafeDistance
                    }
                  />
                </TabPanel>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
              }}>
              <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
              <Typography variant='h6' color='text.secondary'>
                飛行計画を選択してください
              </Typography>
              <Typography variant='body2' color='text.disabled'>
                左のリストから飛行計画を選択すると、ワークフローの詳細が表示されます
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default UTMWorkflowPage
