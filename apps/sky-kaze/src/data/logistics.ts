/**
 * 物流拠点・配送・顧客・ドライバーのモックデータ
 */

// ── 拠点 ──────────────────────────────────────────
export interface Hub {
  code: string
  name: string
  nameEn: string
  latitude: number
  longitude: number
  type: 'warehouse' | 'depot' | 'port' | 'center'
  capacity: number
  city: string
}

export const HUBS: Hub[] = [
  {
    code: 'TKY-C',
    name: '東京中央物流センター',
    nameEn: 'Tokyo Central DC',
    latitude: 35.6762,
    longitude: 139.6503,
    type: 'center',
    capacity: 5000,
    city: '東京',
  },
  {
    code: 'YKH-W',
    name: '横浜港湾倉庫',
    nameEn: 'Yokohama Port Warehouse',
    latitude: 35.4437,
    longitude: 139.638,
    type: 'port',
    capacity: 8000,
    city: '横浜',
  },
  {
    code: 'NRT-D',
    name: '成田エアカーゴデポ',
    nameEn: 'Narita Air Cargo Depot',
    latitude: 35.7647,
    longitude: 140.3864,
    type: 'depot',
    capacity: 3000,
    city: '成田',
  },
  {
    code: 'OSK-C',
    name: '大阪南港物流センター',
    nameEn: 'Osaka Nanko DC',
    latitude: 34.6127,
    longitude: 135.428,
    type: 'center',
    capacity: 4500,
    city: '大阪',
  },
  {
    code: 'KBE-P',
    name: '神戸港コンテナターミナル',
    nameEn: 'Kobe Port Container Terminal',
    latitude: 34.664,
    longitude: 135.2116,
    type: 'port',
    capacity: 7000,
    city: '神戸',
  },
  {
    code: 'NGY-C',
    name: '名古屋物流センター',
    nameEn: 'Nagoya DC',
    latitude: 35.1143,
    longitude: 136.892,
    type: 'center',
    capacity: 4000,
    city: '名古屋',
  },
  {
    code: 'SPR-W',
    name: '札幌流通倉庫',
    nameEn: 'Sapporo Distribution WH',
    latitude: 43.0618,
    longitude: 141.3545,
    type: 'warehouse',
    capacity: 2500,
    city: '札幌',
  },
  {
    code: 'FUK-D',
    name: '福岡アイランドシティデポ',
    nameEn: 'Fukuoka Island City Depot',
    latitude: 33.6461,
    longitude: 130.4092,
    type: 'depot',
    capacity: 3500,
    city: '福岡',
  },
  {
    code: 'SDI-W',
    name: '仙台港倉庫',
    nameEn: 'Sendai Port Warehouse',
    latitude: 38.2867,
    longitude: 141.0083,
    type: 'warehouse',
    capacity: 2000,
    city: '仙台',
  },
  {
    code: 'HRS-C',
    name: '広島物流センター',
    nameEn: 'Hiroshima DC',
    latitude: 34.3963,
    longitude: 132.4594,
    type: 'center',
    capacity: 2200,
    city: '広島',
  },
  {
    code: 'OKN-P',
    name: '那覇港ターミナル',
    nameEn: 'Naha Port Terminal',
    latitude: 26.2124,
    longitude: 127.672,
    type: 'port',
    capacity: 1800,
    city: '那覇',
  },
  {
    code: 'KNZ-W',
    name: '金沢流通倉庫',
    nameEn: 'Kanazawa Distribution WH',
    latitude: 36.5944,
    longitude: 136.6256,
    type: 'warehouse',
    capacity: 1500,
    city: '金沢',
  },
]

export const HUB_TYPE_LABELS: Record<Hub['type'], string> = {
  warehouse: '倉庫',
  depot: 'デポ',
  port: '港湾',
  center: '物流センター',
}

export const findHub = (code: string): Hub | undefined =>
  HUBS.find((h) => h.code === code)

export const searchHubs = (query: string): Hub[] => {
  const q = query.toLowerCase()
  return HUBS.filter(
    (h) =>
      h.code.toLowerCase().includes(q) ||
      h.name.includes(query) ||
      h.nameEn.toLowerCase().includes(q) ||
      h.city.includes(query)
  )
}

// ── 配送ステータス ─────────────────────────────────
export type ShipmentStatus =
  | 'awaiting_pickup'
  | 'picked_up'
  | 'sorting'
  | 'in_transit'
  | 'at_hub'
  | 'out_for_delivery'
  | 'delivered'
  | 'returned'
  | 'cancelled'

/** @deprecated 'pending' は 'awaiting_pickup' に移行。後方互換のため残す */
export type LegacyShipmentStatus = ShipmentStatus | 'pending'

export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  awaiting_pickup: '集荷待ち',
  picked_up: '集荷済み',
  sorting: '仕分け中',
  in_transit: '輸送中',
  at_hub: '拠点到着',
  out_for_delivery: '配達中',
  delivered: '配達完了',
  returned: '返送',
  cancelled: 'キャンセル',
}

export const STATUS_COLORS: Record<ShipmentStatus, string> = {
  awaiting_pickup: '#94A3B8',
  picked_up: '#3B82F6',
  sorting: '#6366F1',
  in_transit: '#F97316',
  at_hub: '#8B5CF6',
  out_for_delivery: '#F59E0B',
  delivered: '#22C55E',
  returned: '#78716C',
  cancelled: '#EF4444',
}

// ── 顧客 ──────────────────────────────────────────
export interface Customer {
  id: string
  name: string
  company: string
  phone: string
  email: string
  address: string
  city: string
  type: 'sender' | 'receiver' | 'both'
  contractType: 'spot' | 'regular' | 'premium'
  creditLimit: number // 与信限度額（円）
}

export const CUSTOMERS: Customer[] = [
  {
    id: 'C001',
    name: '田中 太郎',
    company: '田中電機株式会社',
    phone: '03-1234-5678',
    email: 'tanaka@tanaka-denki.co.jp',
    address: '東京都千代田区丸の内1-1-1',
    city: '東京',
    type: 'both',
    contractType: 'premium',
    creditLimit: 5000000,
  },
  {
    id: 'C002',
    name: '佐藤 花子',
    company: '佐藤食品工業',
    phone: '06-2345-6789',
    email: 'sato@sato-foods.co.jp',
    address: '大阪府大阪市北区梅田2-2-2',
    city: '大阪',
    type: 'sender',
    contractType: 'regular',
    creditLimit: 3000000,
  },
  {
    id: 'C003',
    name: '鈴木 一郎',
    company: '鈴木自動車部品',
    phone: '052-3456-7890',
    email: 'suzuki@suzuki-parts.co.jp',
    address: '愛知県名古屋市中村区名駅3-3-3',
    city: '名古屋',
    type: 'receiver',
    contractType: 'regular',
    creditLimit: 2000000,
  },
  {
    id: 'C004',
    name: '高橋 美咲',
    company: 'セブンスターEC',
    phone: '045-4567-8901',
    email: 'takahashi@7star-ec.com',
    address: '神奈川県横浜市中区桜木町4-4-4',
    city: '横浜',
    type: 'both',
    contractType: 'premium',
    creditLimit: 8000000,
  },
  {
    id: 'C005',
    name: '伊藤 健二',
    company: '北海道農産物直送',
    phone: '011-5678-9012',
    email: 'ito@hokkaido-direct.co.jp',
    address: '北海道札幌市中央区大通西5-5-5',
    city: '札幌',
    type: 'sender',
    contractType: 'regular',
    creditLimit: 1500000,
  },
  {
    id: 'C006',
    name: '渡辺 由美',
    company: '九州セラミックス',
    phone: '092-6789-0123',
    email: 'watanabe@kyushu-ceramics.jp',
    address: '福岡県福岡市博多区博多駅前6-6-6',
    city: '福岡',
    type: 'both',
    contractType: 'spot',
    creditLimit: 500000,
  },
  {
    id: 'C007',
    name: '山本 大輔',
    company: 'アクアマリン水産',
    phone: '022-7890-1234',
    email: 'yamamoto@aqua-marine.co.jp',
    address: '宮城県仙台市青葉区一番町7-7-7',
    city: '仙台',
    type: 'sender',
    contractType: 'regular',
    creditLimit: 2500000,
  },
  {
    id: 'C008',
    name: '中村 さくら',
    company: '中村テキスタイル',
    phone: '076-8901-2345',
    email: 'nakamura@nakamura-textile.jp',
    address: '石川県金沢市片町8-8-8',
    city: '金沢',
    type: 'receiver',
    contractType: 'spot',
    creditLimit: 800000,
  },
]

// ── ドライバー ────────────────────────────────────
export interface Driver {
  id: string
  name: string
  phone: string
  vehicle: string
  licensePlate: string
  status: 'available' | 'on_route' | 'break' | 'off_duty'
  currentHub: string
  rating: number
  deliveriesToday: number
  maxLoadWeight: number // 最大積載量(kg)
  currentLoadWeight: number // 現在の積載量(kg)
  restStartedAt: string | null // 休憩開始時刻（労務管理）
  totalDrivingHours: number // 本日の運転時間（時間）
}

export const DRIVERS: Driver[] = [
  {
    id: 'D001',
    name: '木村 拓也',
    phone: '090-1111-2222',
    vehicle: '4tトラック',
    licensePlate: '品川 300 あ 1234',
    status: 'on_route',
    currentHub: 'TKY-C',
    rating: 4.8,
    deliveriesToday: 12,
    maxLoadWeight: 4000,
    currentLoadWeight: 2850,
    restStartedAt: null,
    totalDrivingHours: 6.5,
  },
  {
    id: 'D002',
    name: '松本 翔太',
    phone: '090-2222-3333',
    vehicle: '10tトラック',
    licensePlate: '横浜 100 い 5678',
    status: 'on_route',
    currentHub: 'YKH-W',
    rating: 4.9,
    deliveriesToday: 8,
    maxLoadWeight: 10000,
    currentLoadWeight: 7200,
    restStartedAt: null,
    totalDrivingHours: 5.0,
  },
  {
    id: 'D003',
    name: '小林 真由美',
    phone: '090-3333-4444',
    vehicle: '2tバン',
    licensePlate: '大阪 500 う 9012',
    status: 'available',
    currentHub: 'OSK-C',
    rating: 4.7,
    deliveriesToday: 15,
    maxLoadWeight: 2000,
    currentLoadWeight: 0,
    restStartedAt: null,
    totalDrivingHours: 7.0,
  },
  {
    id: 'D004',
    name: '加藤 龍一',
    phone: '090-4444-5555',
    vehicle: '4tトラック',
    licensePlate: '名古屋 300 え 3456',
    status: 'break',
    currentHub: 'NGY-C',
    rating: 4.6,
    deliveriesToday: 10,
    maxLoadWeight: 4000,
    currentLoadWeight: 1500,
    restStartedAt: '2026-03-20T12:30:00',
    totalDrivingHours: 4.0,
  },
  {
    id: 'D005',
    name: '吉田 美穂',
    phone: '090-5555-6666',
    vehicle: '2tバン',
    licensePlate: '札幌 500 お 7890',
    status: 'on_route',
    currentHub: 'SPR-W',
    rating: 4.9,
    deliveriesToday: 6,
    maxLoadWeight: 2000,
    currentLoadWeight: 980,
    restStartedAt: null,
    totalDrivingHours: 3.5,
  },
  {
    id: 'D006',
    name: '斎藤 大地',
    phone: '090-6666-7777',
    vehicle: '10tトラック',
    licensePlate: '福岡 100 か 1234',
    status: 'off_duty',
    currentHub: 'FUK-D',
    rating: 4.5,
    deliveriesToday: 0,
    maxLoadWeight: 10000,
    currentLoadWeight: 0,
    restStartedAt: null,
    totalDrivingHours: 0,
  },
]

export const DRIVER_STATUS_LABELS: Record<Driver['status'], string> = {
  available: '待機中',
  on_route: '配送中',
  break: '休憩中',
  off_duty: '勤務外',
}

export const DRIVER_STATUS_COLORS: Record<Driver['status'], string> = {
  available: '#22C55E',
  on_route: '#F97316',
  break: '#F59E0B',
  off_duty: '#94A3B8',
}

// ── 配送データ ────────────────────────────────────
export interface Shipment {
  id: string
  trackingNo: string
  sender: Customer
  receiver: Customer
  originHub: string
  destinationHub: string
  currentHub: string
  driver: string | null
  status: ShipmentStatus
  weight: number // kg
  dimensions: string // LxWxH cm
  contents: string
  priority: 'standard' | 'express' | 'same_day'
  cost: number
  createdAt: string
  estimatedDelivery: string
  deliveredAt: string | null
  scheduledPickup: string // 集荷予定日時
  actualPickup: string | null // 実際の集荷日時
  specialInstructions: string // 特記事項
  insuranceValue: number // 保険金額（円）
  paymentMethod: 'prepaid' | 'collect' | 'monthly' // 元払い/着払い/月締め
  baseFee: number // 基本料金
  distanceFee: number // 距離料金
  weightFee: number // 重量料金
  surcharge: number // 特別料金（冷蔵/急ぎ等）
  totalFee: number // 合計料金
}

const today = new Date()
const fmt = (d: Date) => d.toISOString().split('T')[0]
const fmtTime = (d: Date, h: number, m: number) => {
  const t = new Date(d)
  t.setHours(h, m, 0, 0)
  return t.toISOString()
}
const daysAgo = (n: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return fmt(d)
}
const daysLater = (n: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() + n)
  return fmt(d)
}
const daysAgoAt = (n: number, h: number, m: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return fmtTime(d, h, m)
}
const todayAt = (h: number, m: number) => fmtTime(today, h, m)

export const SHIPMENTS: Shipment[] = [
  {
    id: 'S001',
    trackingNo: 'KL-20260318-0001',
    sender: CUSTOMERS[0],
    receiver: CUSTOMERS[2],
    originHub: 'TKY-C',
    destinationHub: 'NGY-C',
    currentHub: 'NGY-C',
    driver: 'D001',
    status: 'out_for_delivery',
    weight: 120,
    dimensions: '80x60x50',
    contents: '電子部品 型番TDK-MLP3225 / 村田MEU1210 コンデンサ 2,000個',
    priority: 'express',
    cost: 45800,
    createdAt: daysAgo(2),
    estimatedDelivery: fmt(today),
    deliveredAt: null,
    scheduledPickup: daysAgoAt(2, 9, 0),
    actualPickup: daysAgoAt(2, 9, 15),
    specialInstructions: '静電気防止梱包必須。段積み不可。',
    insuranceValue: 3200000,
    paymentMethod: 'monthly',
    baseFee: 12000,
    distanceFee: 18000,
    weightFee: 7800,
    surcharge: 8000,
    totalFee: 45800,
  },
  {
    id: 'S002',
    trackingNo: 'KL-20260319-0002',
    sender: CUSTOMERS[1],
    receiver: CUSTOMERS[3],
    originHub: 'OSK-C',
    destinationHub: 'YKH-W',
    currentHub: 'NGY-C',
    driver: 'D002',
    status: 'in_transit',
    weight: 850,
    dimensions: '120x100x100',
    contents: '冷凍食品（大阪王将 業務用餃子 50ケース / 冷凍うどん 30ケース）',
    priority: 'express',
    cost: 78500,
    createdAt: daysAgo(1),
    estimatedDelivery: daysLater(1),
    deliveredAt: null,
    scheduledPickup: daysAgoAt(1, 6, 0),
    actualPickup: daysAgoAt(1, 6, 20),
    specialInstructions:
      '冷凍車必須 -18℃以下厳守。荷受け時に温度記録表を提出。',
    insuranceValue: 1800000,
    paymentMethod: 'monthly',
    baseFee: 15000,
    distanceFee: 28000,
    weightFee: 17000,
    surcharge: 18500,
    totalFee: 78500,
  },
  {
    id: 'S003',
    trackingNo: 'KL-20260315-0003',
    sender: CUSTOMERS[4],
    receiver: CUSTOMERS[0],
    originHub: 'SPR-W',
    destinationHub: 'TKY-C',
    currentHub: 'TKY-C',
    driver: null,
    status: 'delivered',
    weight: 300,
    dimensions: '100x80x60',
    contents: '北海道産 男爵いも 150kg / 北見玉ねぎ 150kg 段ボール計20箱',
    priority: 'standard',
    cost: 52400,
    createdAt: daysAgo(5),
    estimatedDelivery: daysAgo(2),
    deliveredAt: daysAgo(2),
    scheduledPickup: daysAgoAt(5, 8, 0),
    actualPickup: daysAgoAt(5, 8, 30),
    specialInstructions: '常温輸送可。直射日光回避。荷受先は地下搬入口から。',
    insuranceValue: 450000,
    paymentMethod: 'prepaid',
    baseFee: 15000,
    distanceFee: 25000,
    weightFee: 9000,
    surcharge: 3400,
    totalFee: 52400,
  },
  {
    id: 'S004',
    trackingNo: 'KL-20260317-0004',
    sender: CUSTOMERS[5],
    receiver: CUSTOMERS[7],
    originHub: 'FUK-D',
    destinationHub: 'KNZ-W',
    currentHub: 'OSK-C',
    driver: 'D003',
    status: 'in_transit',
    weight: 200,
    dimensions: '60x40x40',
    contents: '有田焼 花瓶 30点 / 茶碗セット 50点 木箱梱包',
    priority: 'standard',
    cost: 38600,
    createdAt: daysAgo(3),
    estimatedDelivery: daysLater(2),
    deliveredAt: null,
    scheduledPickup: daysAgoAt(3, 10, 0),
    actualPickup: daysAgoAt(3, 10, 45),
    specialInstructions:
      '天地無用。割れ物注意。二段積み厳禁。パレットごと納品。',
    insuranceValue: 2800000,
    paymentMethod: 'collect',
    baseFee: 10000,
    distanceFee: 15000,
    weightFee: 6000,
    surcharge: 7600,
    totalFee: 38600,
  },
  {
    id: 'S005',
    trackingNo: 'KL-20260320-0005',
    sender: CUSTOMERS[6],
    receiver: CUSTOMERS[1],
    originHub: 'SDI-W',
    destinationHub: 'OSK-C',
    currentHub: 'SDI-W',
    driver: null,
    status: 'awaiting_pickup',
    weight: 500,
    dimensions: '100x80x80',
    contents:
      '三陸産 生マグロ 200kg / 活ホタテ 150kg / 牡蠣 150kg 発泡スチロール計40箱',
    priority: 'same_day',
    cost: 96200,
    createdAt: fmt(today),
    estimatedDelivery: fmt(today),
    deliveredAt: null,
    scheduledPickup: todayAt(5, 0),
    actualPickup: null,
    specialInstructions:
      '冷蔵車必須 0〜5℃厳守。水漏れ防止ビニール二重梱包済み。市場着14時必着。',
    insuranceValue: 4500000,
    paymentMethod: 'monthly',
    baseFee: 18000,
    distanceFee: 35000,
    weightFee: 15000,
    surcharge: 28200,
    totalFee: 96200,
  },
  {
    id: 'S006',
    trackingNo: 'KL-20260320-0006',
    sender: CUSTOMERS[3],
    receiver: CUSTOMERS[5],
    originHub: 'YKH-W',
    destinationHub: 'FUK-D',
    currentHub: 'YKH-W',
    driver: 'D002',
    status: 'picked_up',
    weight: 1200,
    dimensions: '240x120x120',
    contents:
      '液晶テレビ 55型 20台 / ドラム式洗濯機 10台 / 電子レンジ 30台 パレット5枚',
    priority: 'standard',
    cost: 126800,
    createdAt: fmt(today),
    estimatedDelivery: daysLater(3),
    deliveredAt: null,
    scheduledPickup: todayAt(8, 0),
    actualPickup: todayAt(8, 25),
    specialInstructions:
      '精密機器につき衝撃厳禁。横積み不可。2段積みはTV不可。エアサス車推奨。',
    insuranceValue: 12000000,
    paymentMethod: 'monthly',
    baseFee: 25000,
    distanceFee: 52000,
    weightFee: 24000,
    surcharge: 25800,
    totalFee: 126800,
  },
  {
    id: 'S007',
    trackingNo: 'KL-20260316-0007',
    sender: CUSTOMERS[0],
    receiver: CUSTOMERS[4],
    originHub: 'TKY-C',
    destinationHub: 'SPR-W',
    currentHub: 'SPR-W',
    driver: 'D005',
    status: 'delivered',
    weight: 80,
    dimensions: '50x40x30',
    contents: 'Dell PowerEdge R760 ラックサーバー 2台 / UPS APC Smart-UPS 1台',
    priority: 'express',
    cost: 63500,
    createdAt: daysAgo(4),
    estimatedDelivery: daysAgo(1),
    deliveredAt: daysAgo(1),
    scheduledPickup: daysAgoAt(4, 10, 0),
    actualPickup: daysAgoAt(4, 10, 10),
    specialInstructions:
      '精密機器。衝撃感知シール貼付済み。受領時にシール確認を依頼。サーバールーム直納。',
    insuranceValue: 5600000,
    paymentMethod: 'prepaid',
    baseFee: 15000,
    distanceFee: 30000,
    weightFee: 5500,
    surcharge: 13000,
    totalFee: 63500,
  },
  {
    id: 'S008',
    trackingNo: 'KL-20260318-0008',
    sender: CUSTOMERS[2],
    receiver: CUSTOMERS[6],
    originHub: 'NGY-C',
    destinationHub: 'SDI-W',
    currentHub: 'TKY-C',
    driver: 'D001',
    status: 'at_hub',
    weight: 450,
    dimensions: '100x100x80',
    contents:
      'トヨタ純正 ブレーキパッド 品番04465-30450 500セット / オイルフィルター 300個',
    priority: 'standard',
    cost: 42300,
    createdAt: daysAgo(2),
    estimatedDelivery: daysLater(1),
    deliveredAt: null,
    scheduledPickup: daysAgoAt(2, 14, 0),
    actualPickup: daysAgoAt(2, 14, 30),
    specialInstructions:
      '油脂類含むため火気厳禁。荷姿はパレット3枚。フォークリフト荷受け必須。',
    insuranceValue: 1200000,
    paymentMethod: 'monthly',
    baseFee: 12000,
    distanceFee: 18000,
    weightFee: 9000,
    surcharge: 3300,
    totalFee: 42300,
  },
  {
    id: 'S009',
    trackingNo: 'KL-20260313-0009',
    sender: CUSTOMERS[1],
    receiver: CUSTOMERS[7],
    originHub: 'OSK-C',
    destinationHub: 'KNZ-W',
    currentHub: 'KNZ-W',
    driver: null,
    status: 'delivered',
    weight: 150,
    dimensions: '70x50x40',
    contents:
      '業務用カレールー 20kg缶 5本 / レトルトカレー 500食 / 乾麺うどん 200束',
    priority: 'standard',
    cost: 28500,
    createdAt: daysAgo(7),
    estimatedDelivery: daysAgo(4),
    deliveredAt: daysAgo(4),
    scheduledPickup: daysAgoAt(7, 13, 0),
    actualPickup: daysAgoAt(7, 13, 10),
    specialInstructions: '常温輸送可。賞味期限管理品のため先入れ先出し徹底。',
    insuranceValue: 350000,
    paymentMethod: 'prepaid',
    baseFee: 8000,
    distanceFee: 12000,
    weightFee: 4500,
    surcharge: 4000,
    totalFee: 28500,
  },
  {
    id: 'S010',
    trackingNo: 'KL-20260317-0010',
    sender: CUSTOMERS[5],
    receiver: CUSTOMERS[0],
    originHub: 'FUK-D',
    destinationHub: 'TKY-C',
    currentHub: 'FUK-D',
    driver: null,
    status: 'returned',
    weight: 60,
    dimensions: '40x30x20',
    contents: '有田焼 特注花瓶「月白」6点 / 香炉 3点 桐箱入り',
    priority: 'standard',
    cost: 33200,
    createdAt: daysAgo(3),
    estimatedDelivery: daysLater(1),
    deliveredAt: null,
    scheduledPickup: daysAgoAt(3, 11, 0),
    actualPickup: daysAgoAt(3, 11, 20),
    specialInstructions:
      '天地無用。割れ物超注意。受取人不在のため返送処理。再配達日要調整。',
    insuranceValue: 1800000,
    paymentMethod: 'collect',
    baseFee: 10000,
    distanceFee: 15000,
    weightFee: 3200,
    surcharge: 5000,
    totalFee: 33200,
  },
]
