/**
 * 配送シミュレーションエンジン v2
 *
 * P0修正:
 * - 全6ドライバーをマップに表示（待機・休憩含む）
 * - 到着後に次のジョブを自動割当（ループ）
 * - 配送完了イベントの発行
 *
 * P1修正:
 * - ETA計算
 * - イベントログシステム
 * - ステータス定数の一元管理
 */
import { create } from 'zustand'

import { HUBS, DRIVERS, SHIPMENTS, type Driver } from './logistics'

// ────────────────────────────────────────────────────
// 共有定数（重複排除）
// ────────────────────────────────────────────────────

export type DriverStatus =
  | 'moving'
  | 'loading'
  | 'delivering'
  | 'idle'
  | 'incident'
  | 'break'
  | 'off_duty'

export const DRIVER_STATUS_LABEL: Record<DriverStatus, string> = {
  moving: '走行中',
  loading: '積込中',
  delivering: '配達中',
  idle: '待機',
  incident: '異常発生',
  break: '休憩中',
  off_duty: '勤務外',
}

export const DRIVER_STATUS_COLOR: Record<DriverStatus, string> = {
  moving: '#F97316',
  loading: '#3B82F6',
  delivering: '#22C55E',
  idle: '#64748B',
  incident: '#EF4444',
  break: '#A855F7',
  off_duty: '#475569',
}

// ────────────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────────────

export interface LatLng {
  lat: number
  lng: number
}

export interface DriverPosition {
  driverId: string
  name: string
  position: LatLng
  bearing: number
  speed: number
  shipmentId: string | null
  status: DriverStatus
  routeProgress: number
  route: LatLng[]
  eta: number | null // 到着予想秒
}

export type IncidentType =
  | 'traffic_jam'
  | 'breakdown'
  | 'weather'
  | 'customer_absent'
  | 'accident_ahead'

export interface Incident {
  id: string
  driverId: string
  type: IncidentType
  title: string
  description: string
  occurredAt: number
  resolved: boolean
  resolution: string | null
}

// イベントログ
export type LogEventType =
  | 'delivery_complete'
  | 'incident_occurred'
  | 'incident_resolved'
  | 'job_assigned'
  | 'driver_departed'

export interface LogEvent {
  id: string
  type: LogEventType
  driverId: string
  message: string
  timestamp: number
}

export const LOG_TYPE_COLOR: Record<LogEventType, string> = {
  delivery_complete: '#22C55E',
  incident_occurred: '#EF4444',
  incident_resolved: '#3B82F6',
  job_assigned: '#F59E0B',
  driver_departed: '#F97316',
}

export const INCIDENT_LABELS: Record<IncidentType, string> = {
  traffic_jam: '渋滞発生',
  breakdown: '車両故障',
  weather: '悪天候',
  customer_absent: '届け先不在',
  accident_ahead: '前方事故',
}

export const INCIDENT_COLORS: Record<IncidentType, string> = {
  traffic_jam: '#F59E0B',
  breakdown: '#EF4444',
  weather: '#6366F1',
  customer_absent: '#F97316',
  accident_ahead: '#DC2626',
}

export const INCIDENT_RESOLUTIONS: Record<IncidentType, string[]> = {
  traffic_jam: [
    '迂回ルートに変更',
    '待機して通過を待つ',
    '別ドライバーに引き継ぎ',
  ],
  breakdown: ['ロードサービス手配', '代車を手配', '最寄り拠点へ搬送'],
  weather: ['配送を一時中断', '安全な場所で待機', '翌日に再配送'],
  customer_absent: ['再配達予約', '宅配ボックスに投函', '最寄り拠点で保管'],
  accident_ahead: ['迂回ルートに変更', '現場通過まで待機', '配送順序を変更'],
}

// ────────────────────────────────────────────────────
// ルート生成
// ────────────────────────────────────────────────────

const hubPos = (code: string): LatLng => {
  const h = HUBS.find((x) => x.code === code)
  return h ? { lat: h.latitude, lng: h.longitude } : { lat: 35.68, lng: 139.77 }
}

const interpolateRoute = (
  from: LatLng,
  to: LatLng,
  steps: number = 30
): LatLng[] => {
  const pts: LatLng[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const jitter = Math.sin(t * Math.PI) * 0.15
    const midLat = from.lat + (to.lat - from.lat) * 0.5
    const midLng = from.lng + (to.lng - from.lng) * 0.5
    const perpLat = -(to.lng - from.lng) * jitter
    const perpLng = (to.lat - from.lat) * jitter
    const lat =
      from.lat * (1 - t) * (1 - t) +
      2 * (midLat + perpLat) * t * (1 - t) +
      to.lat * t * t
    const lng =
      from.lng * (1 - t) * (1 - t) +
      2 * (midLng + perpLng) * t * (1 - t) +
      to.lng * t * t
    pts.push({ lat, lng })
  }
  return pts
}

const buildRoute = (originCode: string, destCode: string): LatLng[] => {
  return interpolateRoute(hubPos(originCode), hubPos(destCode))
}

// ルートの総走破時間（秒）
const ROUTE_DURATION = 120

// ────────────────────────────────────────────────────
// 全ドライバー初期位置（6名全員マップに表示）
// ────────────────────────────────────────────────────

// ジョブキュー（配送 → 帰路 → 次の配送のループ用）
const JOB_PAIRS = [
  { from: 'TKY-C', to: 'NGY-C' },
  { from: 'OSK-C', to: 'YKH-W' },
  { from: 'SPR-W', to: 'TKY-C' },
  { from: 'NGY-C', to: 'OSK-C' },
  { from: 'YKH-W', to: 'FUK-D' },
  { from: 'FUK-D', to: 'SPR-W' },
  { from: 'TKY-C', to: 'SDI-W' },
  { from: 'KBE-P', to: 'HRS-C' },
]

const buildInitialPositions = (): DriverPosition[] => {
  return DRIVERS.map((d) => {
    const pos = hubPos(d.currentHub)
    const statusMap: Record<Driver['status'], DriverStatus> = {
      on_route: 'moving',
      available: 'idle',
      break: 'break',
      off_duty: 'off_duty',
    }

    if (d.status === 'on_route') {
      // 走行中ドライバー → 配送ルートを割当
      const shipment = SHIPMENTS.find(
        (s) =>
          s.driver === d.id &&
          ['picked_up', 'in_transit', 'out_for_delivery', 'at_hub'].includes(
            s.status
          )
      )
      if (shipment) {
        const route = buildRoute(shipment.originHub, shipment.destinationHub)
        const progress =
          shipment.status === 'out_for_delivery'
            ? 0.75
            : shipment.status === 'at_hub'
              ? 0.5
              : 0.3
        const idx = Math.floor(progress * (route.length - 1))
        return {
          driverId: d.id,
          name: d.name,
          position: route[idx],
          bearing: 0,
          speed: 65 + Math.random() * 25,
          shipmentId: shipment.id,
          status: 'moving' as DriverStatus,
          routeProgress: progress,
          route,
          eta: Math.round(ROUTE_DURATION * (1 - progress)),
        }
      }
    }

    return {
      driverId: d.id,
      name: d.name,
      position: pos,
      bearing: 0,
      speed: 0,
      shipmentId: null,
      status: statusMap[d.status] ?? ('idle' as DriverStatus),
      routeProgress: 0,
      route: [pos],
      eta: null,
    }
  })
}

// ────────────────────────────────────────────────────
// インシデント定義
// ────────────────────────────────────────────────────

const PREDEFINED_INCIDENTS: Incident[] = [
  {
    id: 'INC-001',
    driverId: 'D001',
    type: 'traffic_jam',
    title: '首都高速3号線 渋滞',
    description: '事故に起因する渋滞が発生中。通過に約40分の遅延見込み。',
    occurredAt: 45,
    resolved: false,
    resolution: null,
  },
  {
    id: 'INC-002',
    driverId: 'D002',
    type: 'customer_absent',
    title: '届け先不在',
    description: '鈴木自動車部品 — 担当者不在。電話にも応答なし。',
    occurredAt: 120,
    resolved: false,
    resolution: null,
  },
  {
    id: 'INC-003',
    driverId: 'D005',
    type: 'weather',
    title: '札幌方面 大雪警報',
    description: '視界不良のため、安全に配送を継続できない可能性。',
    occurredAt: 200,
    resolved: false,
    resolution: null,
  },
  {
    id: 'INC-004',
    driverId: 'D001',
    type: 'accident_ahead',
    title: '東名高速 前方事故',
    description: '3車線中2車線が規制中。大幅な遅延の可能性。',
    occurredAt: 400,
    resolved: false,
    resolution: null,
  },
]

// ジョブ割当カウンタ
let jobCounter = 0
const nextJob = () => {
  const job = JOB_PAIRS[jobCounter % JOB_PAIRS.length]
  jobCounter++
  return job
}

let logIdCounter = 0
const createLog = (
  type: LogEventType,
  driverId: string,
  message: string,
  timestamp: number
): LogEvent => ({
  id: `LOG-${++logIdCounter}`,
  type,
  driverId,
  message,
  timestamp,
})

// ────────────────────────────────────────────────────
// ストア
// ────────────────────────────────────────────────────

interface SimulationState {
  elapsedSeconds: number
  isPlaying: boolean
  speed: number

  positions: DriverPosition[]
  incidents: Incident[]
  logs: LogEvent[]
  deliveryCount: number

  activeIncidentId: string | null
  selectedDriverId: string | null
  showLog: boolean
  viewMode: 'prepare' | 'monitor' | 'complete'

  play: () => void
  pause: () => void
  setSpeed: (s: number) => void
  tick: () => void
  selectDriver: (id: string | null) => void
  selectIncident: (id: string | null) => void
  resolveIncident: (incidentId: string, resolution: string) => void
  toggleLog: () => void
  setViewMode: (mode: 'prepare' | 'monitor' | 'complete') => void
  reset: () => void
}

export const useSimulation = create<SimulationState>((set, get) => ({
  elapsedSeconds: 0,
  isPlaying: false,
  speed: 10,
  positions: buildInitialPositions(),
  incidents: [],
  logs: [],
  deliveryCount: 0,
  activeIncidentId: null,
  selectedDriverId: null,
  showLog: false,
  viewMode: 'prepare',

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  setSpeed: (s) => set({ speed: s }),

  selectDriver: (id) => set({ selectedDriverId: id }),
  selectIncident: (id) => set({ activeIncidentId: id }),
  toggleLog: () => set((s) => ({ showLog: !s.showLog })),
  setViewMode: (mode) => set({ viewMode: mode }),

  tick: () => {
    const {
      isPlaying,
      speed,
      elapsedSeconds,
      positions,
      incidents,
      logs,
      deliveryCount,
    } = get()
    if (!isPlaying) return

    const dt = speed * 0.5 // 500msインターバルなので半分
    const newElapsed = elapsedSeconds + dt
    const newLogs = [...logs]
    let newDeliveryCount = deliveryCount

    // ドライバー位置更新
    const newPositions = positions.map((dp) => {
      // 非走行ステータスはスキップ
      if (
        dp.status === 'idle' ||
        dp.status === 'incident' ||
        dp.status === 'break' ||
        dp.status === 'off_duty'
      )
        return dp

      // 配達中（到着後の荷下ろし） → 15秒後に次のジョブ
      if (dp.status === 'delivering') {
        const deliverTime = dp.eta ?? 15
        if (deliverTime <= 0) {
          // 配達完了 → 次のジョブを割当
          const job = nextJob()
          const route = buildRoute(job.from, job.to)
          const shipmentIdx = Math.floor(Math.random() * SHIPMENTS.length)
          const nextShipment = SHIPMENTS[shipmentIdx]

          newDeliveryCount++
          newLogs.push(
            createLog(
              'delivery_complete',
              dp.driverId,
              `${dp.name}: 配達完了 → 次の配送準備`,
              newElapsed
            )
          )
          newLogs.push(
            createLog(
              'job_assigned',
              dp.driverId,
              `${dp.name}: ${job.from} → ${job.to} を割当`,
              newElapsed
            )
          )

          return {
            ...dp,
            status: 'moving' as DriverStatus,
            routeProgress: 0,
            route,
            speed: 70,
            shipmentId: nextShipment.id,
            eta: ROUTE_DURATION,
            position: route[0],
          }
        }
        return { ...dp, eta: (dp.eta ?? 15) - dt }
      }

      if (dp.route.length < 2) return dp

      // 走行中
      const progressPerTick = dt / ROUTE_DURATION
      const newProgress = dp.routeProgress + progressPerTick

      if (newProgress >= 1) {
        // 到着 → 配達中フェーズへ
        newLogs.push(
          createLog(
            'delivery_complete',
            dp.driverId,
            `${dp.name}: 目的地到着、荷下ろし中`,
            newElapsed
          )
        )
        return {
          ...dp,
          routeProgress: 1,
          position: dp.route[dp.route.length - 1],
          speed: 0,
          status: 'delivering' as DriverStatus,
          eta: 15, // 荷下ろし15秒
        }
      }

      const idx = Math.floor(newProgress * (dp.route.length - 1))
      const nextIdx = Math.min(idx + 1, dp.route.length - 1)
      const segT = newProgress * (dp.route.length - 1) - idx
      const pos = {
        lat:
          dp.route[idx].lat +
          (dp.route[nextIdx].lat - dp.route[idx].lat) * segT,
        lng:
          dp.route[idx].lng +
          (dp.route[nextIdx].lng - dp.route[idx].lng) * segT,
      }

      const bearing =
        (Math.atan2(
          dp.route[nextIdx].lng - dp.route[idx].lng,
          dp.route[nextIdx].lat - dp.route[idx].lat
        ) *
          180) /
        Math.PI

      const remainingProgress = 1 - newProgress
      const etaSeconds = Math.round(remainingProgress * ROUTE_DURATION)

      return {
        ...dp,
        routeProgress: newProgress,
        position: pos,
        bearing,
        speed: 60 + Math.sin(newElapsed * 0.1) * 20,
        eta: etaSeconds,
      }
    })

    // インシデント発生チェック
    const newIncidents = [...incidents]
    for (const pi of PREDEFINED_INCIDENTS) {
      if (
        pi.occurredAt <= newElapsed &&
        pi.occurredAt > elapsedSeconds &&
        !incidents.some((i) => i.id === pi.id)
      ) {
        newIncidents.push({ ...pi })
        newLogs.push(
          createLog(
            'incident_occurred',
            pi.driverId,
            `${INCIDENT_LABELS[pi.type]}: ${pi.title}`,
            newElapsed
          )
        )
        const driverIdx = newPositions.findIndex(
          (p) => p.driverId === pi.driverId
        )
        if (driverIdx >= 0 && newPositions[driverIdx].status === 'moving') {
          newPositions[driverIdx] = {
            ...newPositions[driverIdx],
            status: 'incident',
            speed: 0,
          }
        }
      }
    }

    // ログ上限（最新50件）
    const trimmedLogs = newLogs.slice(-50)

    set({
      elapsedSeconds: newElapsed,
      positions: newPositions,
      incidents: newIncidents,
      logs: trimmedLogs,
      deliveryCount: newDeliveryCount,
    })
  },

  resolveIncident: (incidentId, resolution) => {
    const { incidents, positions, logs, elapsedSeconds } = get()
    const incident = incidents.find((i) => i.id === incidentId)
    const newIncidents = incidents.map((i) =>
      i.id === incidentId ? { ...i, resolved: true, resolution } : i
    )
    const driver = incident
      ? DRIVERS.find((d) => d.id === incident.driverId)
      : null
    const newLogs = [
      ...logs,
      createLog(
        'incident_resolved',
        incident?.driverId ?? '',
        `${driver?.name ?? '?'}: ${resolution} で対応完了`,
        elapsedSeconds
      ),
    ].slice(-50)

    let newPositions = positions
    if (incident) {
      newPositions = positions.map((p) =>
        p.driverId === incident.driverId && p.status === 'incident'
          ? {
              ...p,
              status: 'moving' as DriverStatus,
              speed: 70,
              eta: Math.round(ROUTE_DURATION * (1 - p.routeProgress)),
            }
          : p
      )
    }
    set({
      incidents: newIncidents,
      positions: newPositions,
      logs: newLogs,
      activeIncidentId: null,
    })
  },

  reset: () => {
    jobCounter = 0
    logIdCounter = 0
    set({
      elapsedSeconds: 0,
      isPlaying: false,
      speed: 10,
      positions: buildInitialPositions(),
      incidents: [],
      logs: [],
      deliveryCount: 0,
      activeIncidentId: null,
      selectedDriverId: null,
      viewMode: 'prepare',
    })
  },
}))
