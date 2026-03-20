/**
 * 配送シミュレーションエンジン v3
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
 *
 * P2修正（プロドライバー視点）:
 * - 区間別速度: 市街地→高速→市街地
 * - 荷下ろし時間: 重量連動
 * - 法令準拠休憩: 連続走行後に自動休憩
 * - インシデント復帰: 徐行から段階加速
 * - ルート: 主要高速ウェイポイント経由
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
// 区間別速度計算（プロドライバー基準）
// ────────────────────────────────────────────────────

// ルート進捗に応じた基本速度を返す
// 前半(0-0.2): 市街地出発 30-40km/h
// 中盤(0.2-0.8): 高速道路 70-90km/h
// 後半(0.8-1.0): 市街地到着 25-35km/h
const calcSpeedByProgress = (progress: number, elapsed: number): number => {
  // 微細な揺らぎ（アクセルワーク）
  const jitter = Math.sin(elapsed * 0.3) * 3 + Math.cos(elapsed * 0.7) * 2

  if (progress < 0.1) {
    // 出発直後: 20→35km/h に加速
    const t = progress / 0.1
    return 20 + t * 15 + jitter
  }
  if (progress < 0.2) {
    // 市街地→高速合流: 35→70km/h に加速
    const t = (progress - 0.1) / 0.1
    return 35 + t * 35 + jitter
  }
  if (progress < 0.8) {
    // 高速道路巡航: 70-90km/h
    const highway = 80 + Math.sin(progress * Math.PI * 4) * 10
    return highway + jitter
  }
  if (progress < 0.9) {
    // 高速→一般道: 70→40km/h に減速
    const t = (progress - 0.8) / 0.1
    return 70 - t * 30 + jitter
  }
  // 到着間近: 40→25km/h に減速
  const t = (progress - 0.9) / 0.1
  return 40 - t * 15 + jitter
}

// ────────────────────────────────────────────────────
// 荷下ろし時間計算（重量連動）
// ────────────────────────────────────────────────────

// 100kg以下: 10秒、100-500kg: 20秒、500kg以上: 30秒
const calcUnloadTime = (shipmentId: string | null): number => {
  if (!shipmentId) return 15
  const shipment = SHIPMENTS.find((s) => s.id === shipmentId)
  if (!shipment) return 15
  if (shipment.weight <= 100) return 10
  if (shipment.weight <= 500) return 20
  return 30
}

// ────────────────────────────────────────────────────
// ドライバー別内部状態（export型を汚さずに管理）
// ────────────────────────────────────────────────────

interface DriverInternalState {
  // 連続走行時間（秒）— 休憩判定用
  continuousDriving: number
  // 休憩終了予定時刻（elapsedSeconds）
  breakResumeAt: number | null
  // 休憩前のステータスと関連データ
  preBreakStatus: DriverStatus | null
  preBreakSpeed: number
  // インシデント復帰後の段階加速カウンタ（tick数）
  postIncidentTick: number
}

// 法令: 4時間（シミュレーション上は240秒）連続走行で30秒（シミュレーション上）休憩
const CONTINUOUS_DRIVING_LIMIT = 240
const BREAK_DURATION = 30

let driverStates = new Map<string, DriverInternalState>()

const getDriverState = (driverId: string): DriverInternalState => {
  if (!driverStates.has(driverId)) {
    driverStates.set(driverId, {
      continuousDriving: 0,
      breakResumeAt: null,
      preBreakStatus: null,
      preBreakSpeed: 0,
      postIncidentTick: 0,
    })
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- 直前のsetで必ず存在する
  return driverStates.get(driverId)!
}

const resetDriverStates = () => {
  driverStates = new Map<string, DriverInternalState>()
}

// ────────────────────────────────────────────────────
// ルート生成（主要高速ウェイポイント経由）
// ────────────────────────────────────────────────────

const hubPos = (code: string): LatLng => {
  const h = HUBS.find((x) => x.code === code)
  return h ? { lat: h.latitude, lng: h.longitude } : { lat: 35.68, lng: 139.77 }
}

// 主要高速道路の中間ウェイポイント
// 完全に正確ではないが、直線より自然なルートを生成する
const ROUTE_WAYPOINTS: Record<string, LatLng[]> = {
  // 東京→名古屋: 東名高速（御殿場・静岡経由）
  'TKY-C→NGY-C': [
    { lat: 35.31, lng: 138.93 }, // 御殿場付近
    { lat: 34.97, lng: 138.38 }, // 静岡付近
  ],
  'NGY-C→TKY-C': [
    { lat: 34.97, lng: 138.38 },
    { lat: 35.31, lng: 138.93 },
  ],
  // 東京→仙台: 東北道（宇都宮・郡山経由）
  'TKY-C→SDI-W': [
    { lat: 36.56, lng: 139.88 }, // 宇都宮付近
    { lat: 37.4, lng: 140.36 }, // 郡山付近
  ],
  'SDI-W→TKY-C': [
    { lat: 37.4, lng: 140.36 },
    { lat: 36.56, lng: 139.88 },
  ],
  // 名古屋→大阪: 名神高速（四日市・京都経由）
  'NGY-C→OSK-C': [
    { lat: 34.97, lng: 136.62 }, // 四日市付近
    { lat: 34.98, lng: 135.76 }, // 京都南付近
  ],
  'OSK-C→NGY-C': [
    { lat: 34.98, lng: 135.76 },
    { lat: 34.97, lng: 136.62 },
  ],
  // 大阪→横浜: 名神→東名（京都・静岡経由）
  'OSK-C→YKH-W': [
    { lat: 34.98, lng: 135.76 }, // 京都南
    { lat: 34.97, lng: 138.38 }, // 静岡
  ],
  'YKH-W→OSK-C': [
    { lat: 34.97, lng: 138.38 },
    { lat: 34.98, lng: 135.76 },
  ],
  // 札幌→東京: 長距離（青森・仙台経由）
  'SPR-W→TKY-C': [
    { lat: 40.82, lng: 140.74 }, // 青森付近
    { lat: 38.27, lng: 140.87 }, // 仙台付近
  ],
  'TKY-C→SPR-W': [
    { lat: 38.27, lng: 140.87 },
    { lat: 40.82, lng: 140.74 },
  ],
  // 横浜→福岡: 東名→名神→山陽→九州道（名古屋・広島経由）
  'YKH-W→FUK-D': [
    { lat: 35.11, lng: 136.89 }, // 名古屋
    { lat: 34.4, lng: 132.46 }, // 広島付近
  ],
  'FUK-D→YKH-W': [
    { lat: 34.4, lng: 132.46 },
    { lat: 35.11, lng: 136.89 },
  ],
  // 福岡→札幌: 超長距離（広島・大阪経由）
  'FUK-D→SPR-W': [
    { lat: 34.4, lng: 132.46 }, // 広島
    { lat: 34.61, lng: 135.43 }, // 大阪
    { lat: 38.27, lng: 140.87 }, // 仙台
  ],
  'SPR-W→FUK-D': [
    { lat: 38.27, lng: 140.87 },
    { lat: 34.61, lng: 135.43 },
    { lat: 34.4, lng: 132.46 },
  ],
  // 神戸→広島: 山陽道（岡山経由）
  'KBE-P→HRS-C': [{ lat: 34.66, lng: 133.93 }], // 岡山付近
  'HRS-C→KBE-P': [{ lat: 34.66, lng: 133.93 }],
}

// 複数ポイントを順番にベジェ曲線で補間
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

// ウェイポイント経由でルートを生成
const buildRoute = (originCode: string, destCode: string): LatLng[] => {
  const key = `${originCode}→${destCode}`
  const waypoints = ROUTE_WAYPOINTS[key]

  if (!waypoints || waypoints.length === 0) {
    // ウェイポイント未定義の場合は従来通り
    return interpolateRoute(hubPos(originCode), hubPos(destCode))
  }

  // 始点→wp1→wp2→...→終点 を各区間で補間してつなぐ
  const allPoints: LatLng[] = [
    hubPos(originCode),
    ...waypoints,
    hubPos(destCode),
  ]
  const segmentCount = allPoints.length - 1
  const stepsPerSeg = Math.max(10, Math.floor(30 / segmentCount))
  const route: LatLng[] = []

  for (let seg = 0; seg < segmentCount; seg++) {
    const segPts = interpolateRoute(
      allPoints[seg],
      allPoints[seg + 1],
      stepsPerSeg
    )
    // 重複するつなぎ目のポイントを除去（最初のセグメント以外）
    if (seg > 0) segPts.shift()
    route.push(...segPts)
  }

  return route
}

// ルートの総走破時間（秒）
const ROUTE_DURATION = 120

/** tick() の呼び出し間隔（秒）。setInterval(tick, 500) に対応 */
export const TICK_INTERVAL_SEC = 0.5

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
          speed: calcSpeedByProgress(progress, 0),
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

// ジョブ割当カウンタ・ログIDカウンタ（テスト・HMR安全なモジュール変数）
// ストアの reset() 時にリセットされる
let jobCounter = 0
let logIdCounter = 0

const nextJob = () => {
  const job = JOB_PAIRS[jobCounter % JOB_PAIRS.length]
  jobCounter++
  return job
}

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

/** テスト用: カウンタリセット（reset() から呼ばれる） */
export const _resetCounters = () => {
  jobCounter = 0
  logIdCounter = 0
}

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

    const dt = speed * TICK_INTERVAL_SEC // 500msインターバル × 速度倍率
    const newElapsed = elapsedSeconds + dt
    const newLogs = [...logs]
    let newDeliveryCount = deliveryCount

    // ドライバー位置更新
    const newPositions = positions.map((dp) => {
      const dState = getDriverState(dp.driverId)

      // 休憩中: 復帰時刻チェック
      if (dp.status === 'break' && dState.breakResumeAt !== null) {
        if (newElapsed >= dState.breakResumeAt) {
          // 休憩終了 → 走行再開
          dState.breakResumeAt = null
          dState.continuousDriving = 0
          const resumeStatus = dState.preBreakStatus ?? 'moving'
          dState.preBreakStatus = null
          newLogs.push(
            createLog(
              'driver_departed',
              dp.driverId,
              `${dp.name}: 休憩終了、運行再開`,
              newElapsed
            )
          )
          return {
            ...dp,
            status: resumeStatus as DriverStatus,
            speed: resumeStatus === 'moving' ? 30 : dState.preBreakSpeed,
          }
        }
        return dp
      }

      // 非走行ステータスはスキップ
      if (
        dp.status === 'idle' ||
        dp.status === 'incident' ||
        dp.status === 'break' ||
        dp.status === 'off_duty'
      )
        return dp

      // 走行系ステータスの連続運転時間を加算
      if (dp.status === 'moving') {
        dState.continuousDriving += dt
      }

      // 法令休憩チェック: 連続走行が上限を超えたら休憩に入る
      if (
        dp.status === 'moving' &&
        dState.continuousDriving >= CONTINUOUS_DRIVING_LIMIT
      ) {
        dState.breakResumeAt = newElapsed + BREAK_DURATION
        dState.preBreakStatus = dp.status
        dState.preBreakSpeed = dp.speed
        newLogs.push(
          createLog(
            'driver_departed',
            dp.driverId,
            `${dp.name}: 連続運転${Math.floor(CONTINUOUS_DRIVING_LIMIT / 60)}分経過、法令休憩開始`,
            newElapsed
          )
        )
        return {
          ...dp,
          status: 'break' as DriverStatus,
          speed: 0,
        }
      }

      // 配達中（到着後の荷下ろし） → 重量に応じた時間経過後に次のジョブ
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

          // 出発時は市街地速度から
          return {
            ...dp,
            status: 'moving' as DriverStatus,
            routeProgress: 0,
            route,
            speed: 25,
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
        // 到着 → 配達中フェーズへ（荷下ろし時間は重量連動）
        const unloadTime = calcUnloadTime(dp.shipmentId)
        newLogs.push(
          createLog(
            'delivery_complete',
            dp.driverId,
            `${dp.name}: 目的地到着、荷下ろし中（${unloadTime}秒）`,
            newElapsed
          )
        )
        return {
          ...dp,
          routeProgress: 1,
          position: dp.route[dp.route.length - 1],
          speed: 0,
          status: 'delivering' as DriverStatus,
          eta: unloadTime,
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

      // インシデント復帰後は徐行から段階加速
      let currentSpeed: number
      if (dState.postIncidentTick > 0) {
        // 30km/h から段階的に通常速度まで復帰（10tick で完了）
        const recoveryRatio = Math.min(dState.postIncidentTick / 10, 1)
        const normalSpeed = calcSpeedByProgress(newProgress, newElapsed)
        currentSpeed = 30 + (normalSpeed - 30) * recoveryRatio
        dState.postIncidentTick++
        if (dState.postIncidentTick > 10) {
          dState.postIncidentTick = 0
        }
      } else {
        currentSpeed = calcSpeedByProgress(newProgress, newElapsed)
      }

      return {
        ...dp,
        routeProgress: newProgress,
        position: pos,
        bearing,
        speed: currentSpeed,
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
      // インシデント復帰: 30km/h 徐行から段階加速
      newPositions = positions.map((p) => {
        if (p.driverId === incident.driverId && p.status === 'incident') {
          const dState = getDriverState(p.driverId)
          dState.postIncidentTick = 1 // 段階加速開始
          return {
            ...p,
            status: 'moving' as DriverStatus,
            speed: 30, // 徐行開始
            eta: Math.round(ROUTE_DURATION * (1 - p.routeProgress)),
          }
        }
        return p
      })
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
    resetDriverStates()
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
