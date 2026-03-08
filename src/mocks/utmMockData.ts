/**
 * UTM モックデータ
 *
 * 新データモデルに準拠したモックデータ
 */

import type {
  Project,
  FlightPlan,
  Aircraft,
  User,
  CrewAssignment,
  PreflightChecklist,
  FlightPlanDetail,
  ProjectDetail,
} from '@/types/utmDataModel'

// ============================================
// Users（ユーザー）
// ============================================

export const mockUsers: User[] = [
  {
    id: 'user-001',
    name: '山田 太郎',
    email: 'yamada@example.com',
    phone: '090-1234-5678',
    qualifications: [
      {
        type: 'second_class',
        number: 'UA-2024-001234',
        issuedDate: '2024-04-01',
        expiryDate: '2027-03-31',
        isValid: true,
      },
      {
        type: 'pilot_license',
        number: 'PL-2023-005678',
        issuedDate: '2023-06-15',
        isValid: true,
      },
    ],
    roles: ['pilot', 'manager'],
    organizationId: 'org-001',
    department: '運航部',
    status: 'active',
    createdAt: '2023-01-15T09:00:00+09:00',
    updatedAt: '2024-12-01T10:00:00+09:00',
  },
  {
    id: 'user-002',
    name: '佐藤 花子',
    email: 'sato@example.com',
    phone: '090-2345-6789',
    qualifications: [
      {
        type: 'second_class',
        number: 'UA-2024-002345',
        issuedDate: '2024-05-01',
        expiryDate: '2027-04-30',
        isValid: true,
      },
    ],
    roles: ['pilot'],
    organizationId: 'org-001',
    department: '運航部',
    status: 'active',
    createdAt: '2023-03-20T09:00:00+09:00',
    updatedAt: '2024-11-15T14:00:00+09:00',
  },
  {
    id: 'user-003',
    name: '鈴木 一郎',
    email: 'suzuki@example.com',
    phone: '090-3456-7890',
    qualifications: [
      {
        type: 'safety_manager',
        number: 'SM-2023-000123',
        issuedDate: '2023-08-01',
        isValid: true,
      },
    ],
    roles: ['safety_officer', 'observer'],
    organizationId: 'org-001',
    department: '安全管理部',
    status: 'active',
    createdAt: '2022-10-01T09:00:00+09:00',
    updatedAt: '2024-10-01T09:00:00+09:00',
  },
  {
    id: 'user-004',
    name: '田中 次郎',
    email: 'tanaka@example.com',
    phone: '090-4567-8901',
    qualifications: [],
    roles: ['observer'],
    organizationId: 'org-001',
    department: '運航部',
    status: 'active',
    createdAt: '2024-01-10T09:00:00+09:00',
    updatedAt: '2024-12-01T09:00:00+09:00',
  },
]

// ============================================
// Aircraft（機体）
// ============================================

export const mockAircraft: Aircraft[] = [
  {
    id: 'ac-001',
    name: 'Falcon-01',
    model: 'Matrice 350 RTK',
    manufacturer: 'DJI',
    serialNumber: 'SN-DJI-M350-001',
    registrationNumber: 'JA001X',
    remoteId: {
      registered: true,
      number: 'RID-2024-001234',
    },
    specs: {
      maxFlightTime: 55,
      maxSpeed: 23,
      maxAltitude: 7000,
      maxPayload: 2.7,
      weight: 3.77,
    },
    status: 'available',
    lastMaintenanceDate: '2026-01-15',
    nextMaintenanceDate: '2026-04-15',
    totalFlightTime: 1250,
    insurance: {
      valid: true,
      expiryDate: '2026-12-31',
      policyNumber: 'INS-2024-001',
    },
    createdAt: '2024-03-01T09:00:00+09:00',
    updatedAt: '2026-01-20T10:00:00+09:00',
  },
  {
    id: 'ac-002',
    name: 'Eagle-02',
    model: 'Matrice 30T',
    manufacturer: 'DJI',
    serialNumber: 'SN-DJI-M30T-002',
    registrationNumber: 'JA002X',
    remoteId: {
      registered: true,
      number: 'RID-2024-002345',
    },
    specs: {
      maxFlightTime: 41,
      maxSpeed: 23,
      maxAltitude: 7000,
      maxPayload: 0.23,
      weight: 3.77,
    },
    status: 'available',
    lastMaintenanceDate: '2026-01-10',
    nextMaintenanceDate: '2026-04-10',
    totalFlightTime: 890,
    insurance: {
      valid: true,
      expiryDate: '2026-12-31',
      policyNumber: 'INS-2024-002',
    },
    createdAt: '2024-05-15T09:00:00+09:00',
    updatedAt: '2026-01-15T10:00:00+09:00',
  },
  {
    id: 'ac-003',
    name: 'Hawk-03',
    model: 'Phantom 4 RTK',
    manufacturer: 'DJI',
    serialNumber: 'SN-DJI-P4RTK-003',
    registrationNumber: 'JA003X',
    remoteId: {
      registered: true,
      number: 'RID-2024-003456',
    },
    specs: {
      maxFlightTime: 30,
      maxSpeed: 16,
      maxAltitude: 6000,
      maxPayload: 0,
      weight: 1.39,
    },
    status: 'maintenance',
    lastMaintenanceDate: '2025-12-20',
    nextMaintenanceDate: '2026-03-20',
    totalFlightTime: 2100,
    insurance: {
      valid: true,
      expiryDate: '2026-12-31',
      policyNumber: 'INS-2024-003',
    },
    createdAt: '2023-08-01T09:00:00+09:00',
    updatedAt: '2025-12-25T10:00:00+09:00',
  },
]

// ============================================
// Projects（プロジェクト）
// ============================================

export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: '東京湾岸インフラ点検',
    description: '東京湾岸エリアの橋梁・港湾施設の定期点検',
    clientName: '国土交通省 関東地方整備局',
    location: {
      name: '東京湾岸エリア',
      coordinates: [139.7671, 35.6812],
      address: '東京都港区',
    },
    status: 'active',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    createdAt: '2025-12-01T09:00:00+09:00',
    updatedAt: '2026-01-20T10:00:00+09:00',
    createdBy: 'user-001',
  },
  {
    id: 'proj-002',
    name: '千葉ニュータウン測量',
    description: '住宅開発予定地の地形測量',
    clientName: '千葉県住宅供給公社',
    location: {
      name: '千葉ニュータウン',
      coordinates: [140.1167, 35.7833],
      address: '千葉県印西市',
    },
    status: 'planning',
    startDate: '2026-02-15',
    endDate: '2026-02-28',
    createdAt: '2026-01-10T09:00:00+09:00',
    updatedAt: '2026-01-25T14:00:00+09:00',
    createdBy: 'user-001',
  },
  {
    id: 'proj-003',
    name: '横浜港コンテナターミナル監視',
    description: 'コンテナターミナルのセキュリティ監視',
    clientName: '横浜港埠頭株式会社',
    location: {
      name: '横浜港本牧ふ頭',
      coordinates: [139.6667, 35.4333],
      address: '神奈川県横浜市中区',
    },
    status: 'active',
    startDate: '2026-01-15',
    endDate: '2026-06-30',
    createdAt: '2025-12-20T09:00:00+09:00',
    updatedAt: '2026-01-30T10:00:00+09:00',
    createdBy: 'user-001',
  },
]

// ============================================
// FlightPlans（飛行計画）
// ============================================

export const mockFlightPlans: FlightPlan[] = [
  // プロジェクト1の飛行計画
  {
    id: 'fp-001',
    projectId: 'proj-001',
    name: 'レインボーブリッジ点検 #1',
    scheduledDate: '2026-02-02',
    scheduledStartTime: '2026-02-02T10:00:00+09:00',
    scheduledEndTime: '2026-02-02T12:00:00+09:00',
    flightArea: {
      type: 'polygon',
      coordinates: {
        type: 'Polygon',
        coordinates: [
          [
            [139.76, 35.637],
            [139.77, 35.637],
            [139.77, 35.632],
            [139.76, 35.632],
            [139.76, 35.637],
          ],
        ],
      },
      maxAltitude: 150,
      minAltitude: 50,
    },
    aircraftId: 'ac-001',
    purpose: 'inspection',
    purposeDetail: '橋梁下部構造の目視点検',
    permits: {
      dipsRegistered: true,
      dipsNumber: 'DIPS-2026-001234',
      flightPermission: true,
      permissionNumber: 'PERMIT-2026-001',
      notamRequired: true,
      notamIssued: true,
    },
    status: 'approved',
    preflightStatus: 'not_started',
    createdAt: '2026-01-20T09:00:00+09:00',
    updatedAt: '2026-01-30T10:00:00+09:00',
    createdBy: 'user-001',
  },
  {
    id: 'fp-002',
    projectId: 'proj-001',
    name: 'レインボーブリッジ点検 #2',
    scheduledDate: '2026-02-03',
    scheduledStartTime: '2026-02-03T10:00:00+09:00',
    scheduledEndTime: '2026-02-03T12:00:00+09:00',
    flightArea: {
      type: 'polygon',
      coordinates: {
        type: 'Polygon',
        coordinates: [
          [
            [139.76, 35.637],
            [139.77, 35.637],
            [139.77, 35.632],
            [139.76, 35.632],
            [139.76, 35.637],
          ],
        ],
      },
      maxAltitude: 150,
      minAltitude: 50,
    },
    aircraftId: 'ac-001',
    purpose: 'inspection',
    purposeDetail: '橋梁上部構造の目視点検',
    permits: {
      dipsRegistered: true,
      dipsNumber: 'DIPS-2026-001235',
      flightPermission: true,
      permissionNumber: 'PERMIT-2026-001',
      notamRequired: true,
      notamIssued: false,
    },
    status: 'pending',
    preflightStatus: 'not_started',
    createdAt: '2026-01-20T09:00:00+09:00',
    updatedAt: '2026-01-30T10:00:00+09:00',
    createdBy: 'user-001',
  },
  // プロジェクト3の飛行計画
  {
    id: 'fp-003',
    projectId: 'proj-003',
    name: '本牧ふ頭 定期巡回',
    scheduledDate: '2026-02-02',
    scheduledStartTime: '2026-02-02T14:00:00+09:00',
    scheduledEndTime: '2026-02-02T15:30:00+09:00',
    flightArea: {
      type: 'polygon',
      coordinates: {
        type: 'Polygon',
        coordinates: [
          [
            [139.66, 35.438],
            [139.675, 35.438],
            [139.675, 35.428],
            [139.66, 35.428],
            [139.66, 35.438],
          ],
        ],
      },
      maxAltitude: 100,
      minAltitude: 30,
    },
    aircraftId: 'ac-002',
    purpose: 'inspection',
    purposeDetail: 'コンテナヤード巡回監視',
    permits: {
      dipsRegistered: true,
      dipsNumber: 'DIPS-2026-002001',
      flightPermission: true,
      permissionNumber: 'PERMIT-2026-002',
      notamRequired: false,
    },
    status: 'approved',
    preflightStatus: 'not_started',
    createdAt: '2026-01-25T09:00:00+09:00',
    updatedAt: '2026-01-31T10:00:00+09:00',
    createdBy: 'user-002',
  },
]

// ============================================
// CrewAssignments（クルー割当）
// ============================================

export const mockCrewAssignments: CrewAssignment[] = [
  // fp-001のクルー
  {
    id: 'crew-001',
    flightPlanId: 'fp-001',
    userId: 'user-001',
    role: 'pilot_in_command',
    isPrimary: true,
    confirmedAt: '2026-01-28T10:00:00+09:00',
    status: 'confirmed',
  },
  {
    id: 'crew-002',
    flightPlanId: 'fp-001',
    userId: 'user-003',
    role: 'safety_manager',
    isPrimary: true,
    confirmedAt: '2026-01-28T11:00:00+09:00',
    status: 'confirmed',
  },
  {
    id: 'crew-003',
    flightPlanId: 'fp-001',
    userId: 'user-004',
    role: 'observer',
    isPrimary: false,
    status: 'assigned',
  },
  // fp-002のクルー
  {
    id: 'crew-004',
    flightPlanId: 'fp-002',
    userId: 'user-002',
    role: 'pilot_in_command',
    isPrimary: true,
    status: 'assigned',
  },
  {
    id: 'crew-005',
    flightPlanId: 'fp-002',
    userId: 'user-003',
    role: 'safety_manager',
    isPrimary: true,
    status: 'assigned',
  },
  // fp-003のクルー
  {
    id: 'crew-006',
    flightPlanId: 'fp-003',
    userId: 'user-002',
    role: 'pilot_in_command',
    isPrimary: true,
    confirmedAt: '2026-01-30T09:00:00+09:00',
    status: 'confirmed',
  },
  {
    id: 'crew-007',
    flightPlanId: 'fp-003',
    userId: 'user-004',
    role: 'observer',
    isPrimary: false,
    confirmedAt: '2026-01-30T10:00:00+09:00',
    status: 'confirmed',
  },
]

// ============================================
// PreflightChecklists（飛行前チェックリスト）
// ============================================

export const mockPreflightChecklists: PreflightChecklist[] = [
  {
    id: 'checklist-001',
    flightPlanId: 'fp-001',
    weather: {
      checked: false,
      passed: false,
    },
    airspace: {
      checked: false,
      passed: false,
      items: {
        emergencyAirspace: false,
        notam: false,
        tfr: false,
      },
    },
    aircraft: {
      checked: false,
      passed: false,
      items: {
        visualInspection: false,
        batteryLevel: 0,
        gpsStatus: false,
        remoteIdActive: false,
        sensorCalibration: false,
        firmwareUpToDate: false,
      },
    },
    permits: {
      checked: false,
      passed: false,
      items: {
        dipsRegistration: false,
        flightPermission: false,
        insuranceValid: false,
        pilotQualification: false,
      },
    },
    crew: {
      checked: false,
      passed: false,
      items: {
        pilotPresent: false,
        observerPresent: false,
        safetyManagerPresent: false,
        emergencyContactsSet: false,
      },
    },
    overallStatus: 'pending',
  },
]

// ============================================
// ヘルパー関数
// ============================================

/**
 * ユーザーIDからユーザーを取得
 */
export function getUserById(userId: string): User | undefined {
  return mockUsers.find((u) => u.id === userId)
}

/**
 * 機体IDから機体を取得
 */
export function getAircraftById(aircraftId: string): Aircraft | undefined {
  return mockAircraft.find((a) => a.id === aircraftId)
}

/**
 * プロジェクトIDからプロジェクトを取得
 */
export function getProjectById(projectId: string): Project | undefined {
  return mockProjects.find((p) => p.id === projectId)
}

/**
 * 飛行計画IDから飛行計画を取得
 */
export function getFlightPlanById(
  flightPlanId: string
): FlightPlan | undefined {
  return mockFlightPlans.find((fp) => fp.id === flightPlanId)
}

/**
 * プロジェクトの飛行計画一覧を取得
 */
export function getFlightPlansByProjectId(projectId: string): FlightPlan[] {
  return mockFlightPlans.filter((fp) => fp.projectId === projectId)
}

/**
 * 飛行計画のクルー割当を取得
 */
export function getCrewByFlightPlanId(flightPlanId: string): CrewAssignment[] {
  return mockCrewAssignments.filter((c) => c.flightPlanId === flightPlanId)
}

/**
 * 飛行計画のチェックリストを取得
 */
export function getChecklistByFlightPlanId(
  flightPlanId: string
): PreflightChecklist | undefined {
  return mockPreflightChecklists.find((c) => c.flightPlanId === flightPlanId)
}

/**
 * 飛行計画の詳細（関連データ含む）を取得
 */
export function getFlightPlanDetail(
  flightPlanId: string
): FlightPlanDetail | undefined {
  const flightPlan = getFlightPlanById(flightPlanId)
  if (!flightPlan) return undefined

  const project = getProjectById(flightPlan.projectId)
  const aircraft = getAircraftById(flightPlan.aircraftId)
  if (!project || !aircraft) return undefined

  const crewAssignments = getCrewByFlightPlanId(flightPlanId)
  const crew = crewAssignments
    .map((ca) => {
      const user = getUserById(ca.userId)
      if (!user) return null
      return { ...ca, user }
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)

  const checklist = getChecklistByFlightPlanId(flightPlanId)

  return {
    ...flightPlan,
    project,
    aircraft,
    crew,
    checklist,
  }
}

/**
 * プロジェクト詳細（飛行計画含む）を取得
 */
export function getProjectDetail(projectId: string): ProjectDetail | undefined {
  const project = getProjectById(projectId)
  if (!project) return undefined

  const flightPlans = getFlightPlansByProjectId(projectId)

  return {
    ...project,
    flightPlans,
    statistics: {
      totalFlights: flightPlans.length,
      completedFlights: flightPlans.filter((fp) => fp.status === 'completed')
        .length,
      upcomingFlights: flightPlans.filter(
        (fp) => fp.status === 'approved' || fp.status === 'ready'
      ).length,
    },
  }
}

/**
 * 今日の飛行計画を取得
 */
export function getTodayFlightPlans(): FlightPlan[] {
  const today = new Date().toISOString().split('T')[0]
  return mockFlightPlans.filter((fp) => fp.scheduledDate === today)
}

/**
 * 準備が必要な飛行計画を取得（今日以降、準備未完了）
 */
export function getPendingPreflightPlans(): FlightPlan[] {
  const today = new Date().toISOString().split('T')[0]
  return mockFlightPlans.filter(
    (fp) =>
      fp.scheduledDate >= today &&
      fp.status === 'approved' &&
      fp.preflightStatus !== 'completed'
  )
}
