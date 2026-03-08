/**
 * UTMワークフロー用モックデータ生成
 *
 * 空域判定、周知、NOTAM、承認ワークフローのモックデータを提供
 */

import { DEFAULT_PREFLIGHT_ITEMS } from '../types/utmTypes'

import type {
  AirspaceAssessmentResult,
  AirspaceReasonCode,
  RestrictedZoneMatch,
  OrganizationContact,
  NotificationLog,
  NotificationSummary,
  NotificationStatus,
  NOTAMRequest,
  NOTAMStatus,
  ApprovalRequest,
  ApprovalStatus,
  PreflightChecklist,
  PreflightCheckResult,
  FlightPlanWorkflowStatus,
  FlightPlan,
} from '../types/utmTypes'

// ユーティリティ: ランダムID生成
const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

// ユーティリティ: ISO日時文字列生成
const toISOString = (date: Date): string => date.toISOString()

// ============================================
// 有人機団体モックデータ
// ============================================

export const mockOrganizations: OrganizationContact[] = [
  {
    id: 'org-001',
    orgName: '東京ヘリポート運航協会',
    orgType: 'helicopter',
    contactType: 'email',
    contactValue: 'ops@tokyo-heliport.example.jp',
    priority: 1,
    isActive: true,
    region: '東京都',
    notes: '24時間対応可能',
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01'),
  },
  {
    id: 'org-002',
    orgName: '関東エアラインパイロット協会',
    orgType: 'airline',
    contactType: 'email',
    contactValue: 'safety@kanto-pilots.example.jp',
    priority: 2,
    isActive: true,
    region: '関東',
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01'),
  },
  {
    id: 'org-003',
    orgName: '自衛隊航空連絡室',
    orgType: 'military',
    contactType: 'fax',
    contactValue: '03-XXXX-XXXX',
    priority: 1,
    isActive: true,
    region: '全国',
    notes: 'FAXのみ受付',
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01'),
  },
  {
    id: 'org-004',
    orgName: '消防防災ヘリコプター運航調整室',
    orgType: 'government',
    contactType: 'email',
    contactValue: 'heli@fdma.example.go.jp',
    priority: 1,
    isActive: true,
    region: '全国',
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01'),
  },
  {
    id: 'org-005',
    orgName: 'ドクターヘリ運航管理センター',
    orgType: 'helicopter',
    contactType: 'sms',
    contactValue: '090-XXXX-XXXX',
    priority: 1,
    isActive: true,
    region: '全国',
    notes: '緊急時SMS対応',
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01'),
  },
  {
    id: 'org-006',
    orgName: '東京消防庁航空隊',
    orgType: 'government',
    contactType: 'email',
    contactValue: 'aviation@tfd.example.metro.tokyo.jp',
    priority: 1,
    isActive: true,
    region: '東京都',
    notes: '消防・救急ヘリ運用',
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01'),
  },
  {
    id: 'org-007',
    orgName: '警視庁航空隊',
    orgType: 'government',
    contactType: 'email',
    contactValue: 'aviation@keishicho.example.metro.tokyo.jp',
    priority: 1,
    isActive: true,
    region: '東京都',
    notes: '警察ヘリ運用',
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01'),
  },
  {
    id: 'org-008',
    orgName: '海上保安庁第三管区',
    orgType: 'government',
    contactType: 'email',
    contactValue: 'aviation@kaiho3.example.go.jp',
    priority: 1,
    isActive: true,
    region: '関東',
    notes: '海上保安庁ヘリ・航空機運用',
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01'),
  },
  {
    id: 'org-009',
    orgName: '報道ヘリ運航調整協議会',
    orgType: 'helicopter',
    contactType: 'email',
    contactValue: 'news-heli@press-aviation.example.jp',
    priority: 2,
    isActive: true,
    region: '関東',
    notes: 'NHK、民放各局のヘリ運航',
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01'),
  },
  {
    id: 'org-010',
    orgName: '成田国際空港株式会社',
    orgType: 'airport',
    contactType: 'email',
    contactValue: 'ops@naa.example.jp',
    priority: 1,
    isActive: true,
    region: '千葉県',
    notes: '成田空港周辺飛行時必須',
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01'),
  },
]

// ============================================
// 空域判定モック
// ============================================

export function createMockAirspaceAssessment(
  flightPlanId: string,
  options?: {
    notamRequired?: boolean
    riskLevel?: 'low' | 'medium' | 'high' | 'critical'
    reasonCodes?: AirspaceReasonCode[]
  }
): AirspaceAssessmentResult {
  const notamRequired = options?.notamRequired ?? Math.random() > 0.5
  const riskLevel = options?.riskLevel ?? (notamRequired ? 'medium' : 'low')

  const reasonCodes: AirspaceReasonCode[] = options?.reasonCodes ?? []
  if (reasonCodes.length === 0 && notamRequired) {
    const possibleReasons: AirspaceReasonCode[] = [
      'did_area',
      'airport_vicinity',
      'controlled_airspace',
    ]
    reasonCodes.push(
      possibleReasons[Math.floor(Math.random() * possibleReasons.length)]
    )
  }

  const restrictedZones: RestrictedZoneMatch[] = notamRequired
    ? [
        {
          zoneId: 'zone-001',
          zoneName: '東京国際空港周辺',
          zoneType: 'airport',
          restrictionLevel: 'restricted',
          overlapPercentage: 35,
          requiresPermission: true,
          requiresNotam: true,
          authority: '国土交通省航空局',
        },
      ]
    : []

  // 周知対象を決定
  const notifyList = notamRequired
    ? mockOrganizations.slice(0, 3).map((org) => org.id)
    : mockOrganizations.slice(0, 1).map((org) => org.id)

  return {
    id: generateId(),
    flightPlanId,
    assessedAt: toISOString(new Date()),
    notamRequired,
    notifyList,
    reasonCodes,
    restrictedZones,
    riskLevel,
    recommendations: notamRequired
      ? [
          'NOTAM申請が必要です',
          '有人機団体への事前周知を行ってください',
          '飛行高度を150m以下に制限することを推奨します',
        ]
      : ['特別な制限はありません'],
    validUntil: toISOString(new Date(Date.now() + 24 * 60 * 60 * 1000)),
  }
}

// ============================================
// 周知ログモック
// ============================================

export function createMockNotificationLogs(
  flightPlanId: string,
  orgIds: string[]
): NotificationLog[] {
  const statuses: NotificationStatus[] = [
    'sent',
    'delivered',
    'confirmed',
    'pending',
  ]

  return orgIds.map((orgId, index) => {
    const org = mockOrganizations.find((o) => o.id === orgId)
    const status = statuses[index % statuses.length]
    const now = new Date()

    return {
      id: generateId(),
      flightPlanId,
      orgId,
      orgName: org?.orgName ?? `組織 ${orgId}`,
      method: org?.contactType ?? 'email',
      status,
      sentAt:
        status !== 'pending'
          ? toISOString(new Date(now.getTime() - 3600000))
          : null,
      deliveredAt:
        status === 'delivered' || status === 'confirmed'
          ? toISOString(new Date(now.getTime() - 3000000))
          : null,
      confirmedAt:
        status === 'confirmed'
          ? toISOString(new Date(now.getTime() - 1800000))
          : null,
      confirmedBy: status === 'confirmed' ? '担当者A' : null,
      failureReason: null,
      retryCount: 0,
      templateId: 'template-default',
      messageContent: `【周知】ドローン飛行予定通知 - ${flightPlanId}`,
      createdAt: toISOString(now),
    }
  })
}

export function createMockNotificationSummary(
  flightPlanId: string,
  logs: NotificationLog[]
): NotificationSummary {
  return {
    flightPlanId,
    total: logs.length,
    pending: logs.filter((l) => l.status === 'pending').length,
    sent: logs.filter((l) => l.status === 'sent').length,
    delivered: logs.filter((l) => l.status === 'delivered').length,
    confirmed: logs.filter((l) => l.status === 'confirmed').length,
    failed: logs.filter((l) => l.status === 'failed').length,
    lastUpdated: toISOString(new Date()),
  }
}

// ============================================
// NOTAMモック
// ============================================

export function createMockNotamRequest(
  flightPlanId: string,
  flightPlan: FlightPlan,
  status?: NOTAMStatus
): NOTAMRequest {
  const now = new Date()
  const isIssued = status === 'issued' || status === 'published'
  const isApproved = status === 'approved' || isIssued
  const isSubmitted = status === 'submitted' || isApproved

  // NOTAM番号を生成（発行済みの場合）
  const notamNumber = isIssued
    ? `A${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}/26`
    : null

  return {
    id: generateId(),
    flightPlanId,
    status: status ?? 'draft',
    notamId: notamNumber,
    requester: {
      name: flightPlan.pilotName ?? '山田太郎',
      organization: 'KDDIスマートドローン株式会社',
      contact: 'operator@kddi-drone.example.jp',
      licenseNumber: 'HP-2024-001234',
      phone: '03-XXXX-XXXX',
      department: 'ドローン運航管理部',
    },
    location: {
      polygon: flightPlan.geofence?.coordinates?.[0]
        ? `POLYGON((${flightPlan.geofence.coordinates[0]
            .map((c) => `${c[0]} ${c[1]}`)
            .join(', ')}))`
        : 'POLYGON((139.7 35.6, 139.8 35.6, 139.8 35.7, 139.7 35.7, 139.7 35.6))',
      center: '35.65,139.75',
      radius: 2,
      description: flightPlan.name
        ? `${flightPlan.name}飛行エリア`
        : '東京都港区周辺',
      prefecture: '東京都',
      city: '港区',
      referencePoint: '東京タワー南東約1km',
    },
    time: {
      start: flightPlan.scheduledStartTime
        ? toISOString(flightPlan.scheduledStartTime)
        : toISOString(new Date(now.getTime() + 86400000)),
      end: flightPlan.scheduledEndTime
        ? toISOString(flightPlan.scheduledEndTime)
        : toISOString(new Date(now.getTime() + 90000000)),
      timezone: 'Asia/Tokyo',
      dailySchedule: '09:00-17:00 JST',
      validDays: '月-金（祝日除く）',
    },
    maxAltitudeM: flightPlan.maxAltitude ?? 150,
    minAltitudeM: 0,
    reason: '空撮・点検業務',
    purpose: flightPlan.description ?? 'インフラ設備の定期点検および空撮',
    aircraftInfo: {
      type: 'マルチコプター（回転翼）',
      model: 'DJI Matrice 350 RTK',
      registrationNumber: 'JU-2024-XXXXXX',
      weight: '6.3kg（バッテリー含む）',
      color: '白/グレー',
      maxSpeed: '21m/s',
      maxFlightTime: '55分',
    },
    safetyMeasures: [
      '操縦者1名＋補助者2名体制',
      '目視内飛行を維持',
      '第三者立入禁止区域を設定',
      '飛行前に気象条件を確認',
      'ADS-B受信機搭載',
      '緊急着陸地点を3箇所設定',
    ],
    emergencyContact: {
      primary: {
        name: '運航管理責任者',
        phone: '080-XXXX-XXXX',
        available: '24時間',
      },
      secondary: {
        name: 'KDDIスマートドローン運航センター',
        phone: '0120-XXX-XXX',
        available: '9:00-18:00',
      },
    },
    documents: {
      pdfUrl: isIssued ? `/documents/notam-${flightPlanId}.pdf` : undefined,
      jsonData: {},
    },
    attachments: isSubmitted
      ? [
          {
            id: 'att-001',
            name: '飛行計画書.pdf',
            type: 'application/pdf',
            size: 245000,
            uploadedAt: toISOString(new Date(now.getTime() - 86400000)),
          },
          {
            id: 'att-002',
            name: '飛行エリア地図.pdf',
            type: 'application/pdf',
            size: 1200000,
            uploadedAt: toISOString(new Date(now.getTime() - 86400000)),
          },
          {
            id: 'att-003',
            name: '機体適合証明書.pdf',
            type: 'application/pdf',
            size: 89000,
            uploadedAt: toISOString(new Date(now.getTime() - 86400000)),
          },
          {
            id: 'att-004',
            name: '操縦者技能証明書.pdf',
            type: 'application/pdf',
            size: 156000,
            uploadedAt: toISOString(new Date(now.getTime() - 86400000)),
          },
        ]
      : [],
    relatedNotams: isIssued
      ? [
          {
            id: 'A1234/26',
            summary: '羽田空港 RWY16L/34R 定期点検',
            validFrom: toISOString(new Date(now.getTime() - 172800000)),
            validTo: toISOString(new Date(now.getTime() + 172800000)),
          },
          {
            id: 'A1567/26',
            summary: '東京TCA 一時的高度制限',
            validFrom: toISOString(new Date(now.getTime() - 86400000)),
            validTo: toISOString(new Date(now.getTime() + 86400000)),
          },
        ]
      : [],
    submittedAt: isSubmitted
      ? toISOString(new Date(now.getTime() - 7200000))
      : null,
    approvedAt: isApproved
      ? toISOString(new Date(now.getTime() - 3600000))
      : null,
    publishedAt: isIssued
      ? toISOString(new Date(now.getTime() - 1800000))
      : null,
    expiresAt: isIssued
      ? toISOString(new Date(now.getTime() + 604800000)) // 7日後
      : null,
    createdAt: toISOString(now),
    updatedAt: toISOString(now),
    createdBy: 'user-001',
    reviewedBy: isApproved ? 'reviewer-001' : null,
    reviewerName: isApproved ? '審査員 佐藤花子' : null,
    reviewComment: isApproved
      ? '安全対策が適切に計画されています。承認します。'
      : null,
    reviewHistory: isApproved
      ? [
          {
            action: 'submitted',
            by: '山田太郎',
            at: toISOString(new Date(now.getTime() - 7200000)),
            comment: '申請いたします。ご確認お願いします。',
          },
          {
            action: 'reviewed',
            by: '審査員 佐藤花子',
            at: toISOString(new Date(now.getTime() - 5400000)),
            comment: '補助者配置計画を確認しました。',
          },
          {
            action: 'approved',
            by: '審査員 佐藤花子',
            at: toISOString(new Date(now.getTime() - 3600000)),
            comment: '安全対策が適切に計画されています。承認します。',
          },
        ]
      : [],
  }
}

// ============================================
// 承認リクエストモック
// ============================================

export function createMockApprovalRequest(
  flightPlanId: string,
  status?: ApprovalStatus,
  prerequisites?: Partial<ApprovalRequest['prerequisites']>
): ApprovalRequest {
  const now = new Date()

  const defaultPrerequisites = {
    airspaceAssessed: true,
    notificationsConfirmed: status === 'approved',
    notamSubmitted: true,
    preflightChecked: status === 'approved',
  }

  return {
    id: generateId(),
    flightPlanId,
    status: status ?? 'pending',
    requestedAt: toISOString(new Date(now.getTime() - 3600000)),
    requestedBy: 'user-001',
    requestedByName: '山田太郎',
    prerequisites: { ...defaultPrerequisites, ...prerequisites },
    reviewedAt:
      status === 'approved' || status === 'rejected'
        ? toISOString(new Date(now.getTime() - 1800000))
        : null,
    reviewedBy:
      status === 'approved' || status === 'rejected' ? 'manager-001' : null,
    reviewedByName:
      status === 'approved' || status === 'rejected' ? '鈴木一郎' : null,
    decision:
      status === 'approved'
        ? 'approved'
        : status === 'rejected'
          ? 'rejected'
          : null,
    comment:
      status === 'approved'
        ? '承認しました。安全に飛行してください。'
        : status === 'rejected'
          ? '周知確認が完了していません。'
          : null,
    priority: 'normal',
    dueDate: toISOString(new Date(now.getTime() + 86400000)),
    createdAt: toISOString(now),
    updatedAt: toISOString(now),
  }
}

// ============================================
// プリフライトチェックリストモック
// ============================================

export function createMockPreflightChecklist(
  flightPlanId: string,
  droneId: string,
  completionRate: number = 0
): PreflightChecklist {
  const now = new Date()
  const items = [...DEFAULT_PREFLIGHT_ITEMS]
  const completedCount = Math.floor(items.length * completionRate)

  const results: PreflightCheckResult[] = items.map((item, index) => ({
    itemId: item.id,
    checked: index < completedCount,
    checkedAt: index < completedCount ? toISOString(now) : null,
    checkedBy: index < completedCount ? 'pilot-001' : null,
    notes: null,
  }))

  const allRequiredPassed = items
    .filter((item) => item.required)
    .every((item) => {
      const result = results.find((r) => r.itemId === item.id)
      return result?.checked
    })

  let status: PreflightChecklist['status'] = 'pending'
  if (completionRate >= 1) {
    status = allRequiredPassed ? 'completed' : 'failed'
  } else if (completionRate > 0) {
    status = 'in_progress'
  }

  return {
    id: generateId(),
    flightPlanId,
    droneId,
    pilotId: 'pilot-001',
    pilotName: '山田太郎',
    status,
    items,
    results,
    startedAt: completionRate > 0 ? toISOString(now) : null,
    completedAt: completionRate >= 1 ? toISOString(now) : null,
    allRequiredPassed,
    notes: null,
    createdAt: toISOString(now),
    updatedAt: toISOString(now),
  }
}

// ============================================
// 統合ワークフローステータスモック
// ============================================

export function createMockWorkflowStatus(
  flightPlan: FlightPlan,
  options?: {
    stage?:
      | 'draft'
      | 'assessed'
      | 'notified'
      | 'notam_submitted'
      | 'approved'
      | 'preflight_done'
  }
): FlightPlanWorkflowStatus {
  const stage = options?.stage ?? 'draft'
  const now = toISOString(new Date())

  const stageOrder = [
    'draft',
    'assessed',
    'notified',
    'notam_submitted',
    'approved',
    'preflight_done',
  ]
  const stageIndex = stageOrder.indexOf(stage)

  // 空域判定
  const assessment =
    stageIndex >= 1
      ? createMockAirspaceAssessment(flightPlan.id, { notamRequired: true })
      : null

  // 周知
  const notificationLogs =
    stageIndex >= 2 && assessment
      ? createMockNotificationLogs(flightPlan.id, assessment.notifyList)
      : []
  const notificationSummary =
    stageIndex >= 2
      ? createMockNotificationSummary(flightPlan.id, notificationLogs)
      : null

  // NOTAM
  const notamRequest =
    stageIndex >= 3
      ? createMockNotamRequest(
          flightPlan.id,
          flightPlan,
          stageIndex >= 4 ? 'approved' : 'submitted'
        )
      : null

  // 承認
  const approvalRequest =
    stageIndex >= 4
      ? createMockApprovalRequest(
          flightPlan.id,
          stageIndex >= 4 ? 'approved' : 'pending'
        )
      : null

  // プリフライト
  const preflight =
    stageIndex >= 5
      ? createMockPreflightChecklist(
          flightPlan.id,
          flightPlan.droneId ?? 'drone-001',
          1
        )
      : createMockPreflightChecklist(
          flightPlan.id,
          flightPlan.droneId ?? 'drone-001',
          0
        )

  // 進捗計算
  const progressSteps = [
    stageIndex >= 0, // 飛行計画作成
    stageIndex >= 1, // 空域判定
    stageIndex >= 2, // 周知
    stageIndex >= 3, // NOTAM
    stageIndex >= 4, // 承認
    stageIndex >= 5, // プリフライト
  ]
  const overallProgress = Math.round(
    (progressSteps.filter(Boolean).length / progressSteps.length) * 100
  )

  // ブロッカー
  const blockers: string[] = []
  if (stageIndex < 1) blockers.push('空域判定が完了していません')
  if (stageIndex < 2) blockers.push('周知送信が完了していません')
  if (stageIndex < 3 && assessment?.notamRequired)
    blockers.push('NOTAM申請が完了していません')
  if (stageIndex < 4) blockers.push('管理者の承認が必要です')
  if (stageIndex < 5) blockers.push('プリフライトチェックが完了していません')

  // 次のアクション
  const nextActions = [
    '空域判定を実行してください',
    '周知を送信してください',
    'NOTAM申請を行ってください',
    '管理者の承認を待ってください',
    'プリフライトチェックを完了してください',
    '飛行を開始できます',
  ]
  const nextAction = nextActions[Math.min(stageIndex, nextActions.length - 1)]

  // currentStepを決定
  const currentStepMap = [
    'flightPlan',
    'airspaceAssessment',
    'notification',
    'notam',
    'approval',
    'preflightCheck',
    'completed',
  ]
  const currentStep =
    currentStepMap[Math.min(stageIndex, currentStepMap.length - 1)]

  return {
    flightPlanId: flightPlan.id,
    flightPlanName: flightPlan.name,
    steps: {
      flightPlan: {
        status: flightPlan.status,
        updatedAt: now,
      },
      airspaceAssessment: {
        status: stageIndex >= 1 ? 'completed' : 'pending',
        result: assessment ?? undefined,
        updatedAt: stageIndex >= 1 ? now : null,
      },
      notification: {
        status:
          stageIndex >= 2
            ? 'completed'
            : stageIndex >= 1
              ? 'pending'
              : 'pending',
        summary: notificationSummary ?? undefined,
        updatedAt: stageIndex >= 2 ? now : null,
      },
      notam: {
        status: assessment?.notamRequired
          ? stageIndex >= 4
            ? 'approved'
            : stageIndex >= 3
              ? 'submitted'
              : 'pending'
          : 'not_required',
        request: notamRequest ?? undefined,
        updatedAt: stageIndex >= 3 ? now : null,
      },
      approval: {
        status:
          stageIndex >= 4
            ? 'approved'
            : stageIndex >= 3
              ? 'pending'
              : 'not_submitted',
        request: approvalRequest ?? undefined,
        updatedAt: stageIndex >= 4 ? now : null,
      },
      preflightCheck: {
        status: stageIndex >= 5 ? 'completed' : 'pending',
        checklist: preflight,
        updatedAt: stageIndex >= 5 ? now : null,
      },
    },
    overallProgress,
    canStartFlight: stageIndex >= 5,
    isReadyForFlight: stageIndex >= 5,
    currentStep,
    blockers,
    nextAction,
  }
}

// ============================================
// モックAPIハンドラー
// ============================================

// ワークフローステートを保持するストア
interface WorkflowStore {
  assessments: Map<string, AirspaceAssessmentResult>
  notifications: Map<string, NotificationLog[]>
  notams: Map<string, NOTAMRequest>
  approvals: Map<string, ApprovalRequest>
  preflights: Map<string, PreflightChecklist>
}

const workflowStore: WorkflowStore = {
  assessments: new Map(),
  notifications: new Map(),
  notams: new Map(),
  approvals: new Map(),
  preflights: new Map(),
}

export const mockApiHandlers = {
  // 空域判定
  assessAirspace: (
    flightPlanId: string,
    _request: unknown
  ): AirspaceAssessmentResult => {
    const result = createMockAirspaceAssessment(flightPlanId)
    workflowStore.assessments.set(flightPlanId, result)
    return result
  },

  getAirspaceAssessment: (
    flightPlanId: string
  ): AirspaceAssessmentResult | null => {
    return workflowStore.assessments.get(flightPlanId) ?? null
  },

  // 周知
  sendNotifications: (flightPlanId: string): NotificationLog[] => {
    const assessment = workflowStore.assessments.get(flightPlanId)
    const orgIds =
      assessment?.notifyList ?? mockOrganizations.slice(0, 2).map((o) => o.id)
    const logs = createMockNotificationLogs(flightPlanId, orgIds)
    workflowStore.notifications.set(flightPlanId, logs)
    return logs
  },

  getNotificationLogs: (flightPlanId: string): NotificationLog[] => {
    return workflowStore.notifications.get(flightPlanId) ?? []
  },

  confirmNotification: (logId: string): NotificationLog | null => {
    for (const [, logs] of workflowStore.notifications) {
      const log = logs.find((l) => l.id === logId)
      if (log) {
        log.status = 'confirmed'
        log.confirmedAt = toISOString(new Date())
        log.confirmedBy = 'operator'
        return log
      }
    }
    return null
  },

  // NOTAM
  createNotam: (flightPlanId: string, flightPlan: FlightPlan): NOTAMRequest => {
    const notam = createMockNotamRequest(flightPlanId, flightPlan, 'draft')
    workflowStore.notams.set(flightPlanId, notam)
    return notam
  },

  submitNotam: (flightPlanId: string): NOTAMRequest | null => {
    const notam = workflowStore.notams.get(flightPlanId)
    if (notam) {
      notam.status = 'submitted'
      notam.submittedAt = toISOString(new Date())
      return notam
    }
    return null
  },

  approveNotam: (flightPlanId: string): NOTAMRequest | null => {
    const notam = workflowStore.notams.get(flightPlanId)
    if (notam) {
      notam.status = 'approved'
      notam.approvedAt = toISOString(new Date())
      notam.reviewedBy = 'reviewer-001'
      return notam
    }
    return null
  },

  // 承認
  createApproval: (flightPlanId: string): ApprovalRequest => {
    const approval = createMockApprovalRequest(flightPlanId, 'pending')
    workflowStore.approvals.set(flightPlanId, approval)
    return approval
  },

  approveFlightPlan: (
    flightPlanId: string,
    comment?: string
  ): ApprovalRequest | null => {
    const approval = workflowStore.approvals.get(flightPlanId)
    if (approval) {
      approval.status = 'approved'
      approval.decision = 'approved'
      approval.reviewedAt = toISOString(new Date())
      approval.reviewedBy = 'manager-001'
      approval.reviewedByName = '鈴木一郎'
      approval.comment = comment ?? '承認しました'
      return approval
    }
    return null
  },

  // プリフライト
  getPreflightChecklist: (
    flightPlanId: string,
    droneId: string
  ): PreflightChecklist => {
    let checklist = workflowStore.preflights.get(flightPlanId)
    if (!checklist) {
      checklist = createMockPreflightChecklist(flightPlanId, droneId, 0)
      workflowStore.preflights.set(flightPlanId, checklist)
    }
    return checklist
  },

  updatePreflightItem: (
    flightPlanId: string,
    itemId: string,
    checked: boolean
  ): PreflightChecklist | null => {
    const checklist = workflowStore.preflights.get(flightPlanId)
    if (checklist) {
      const result = checklist.results.find((r) => r.itemId === itemId)
      if (result) {
        result.checked = checked
        result.checkedAt = checked ? toISOString(new Date()) : null
        result.checkedBy = checked ? 'pilot-001' : null
      }

      // ステータス更新
      const checkedCount = checklist.results.filter((r) => r.checked).length
      if (checkedCount === 0) {
        checklist.status = 'pending'
      } else if (checkedCount < checklist.items.length) {
        checklist.status = 'in_progress'
      } else {
        const allRequiredPassed = checklist.items
          .filter((item) => item.required)
          .every((item) => {
            const res = checklist.results.find((r) => r.itemId === item.id)
            return res?.checked
          })
        checklist.status = allRequiredPassed ? 'completed' : 'failed'
        checklist.allRequiredPassed = allRequiredPassed
      }

      return checklist
    }
    return null
  },

  // ストアリセット
  resetStore: (): void => {
    workflowStore.assessments.clear()
    workflowStore.notifications.clear()
    workflowStore.notams.clear()
    workflowStore.approvals.clear()
    workflowStore.preflights.clear()
  },
}

export { workflowStore }
