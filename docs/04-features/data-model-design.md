# UTM データモデル設計

## 概要

プロジェクト、スケジュール、ドローン、ユーザーの紐づけを定義し、
飛行準備から監視までの一貫したワークフローを実現する。

---

## エンティティ関連図

```
┌─────────────┐
│   Project   │
│ プロジェクト │
└──────┬──────┘
       │ 1:N
       ▼
┌─────────────┐      N:1      ┌─────────────┐
│ FlightPlan  │──────────────▶│  Aircraft   │
│  飛行計画   │               │   機体      │
└──────┬──────┘               └─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐      N:1      ┌─────────────┐
│  CrewAssign │──────────────▶│    User     │
│ クルー割当  │               │  ユーザー   │
└─────────────┘               └─────────────┘
```

---

## エンティティ定義

### 1. Project（プロジェクト）

飛行業務の単位。複数の飛行計画を含む。

```typescript
interface Project {
  id: string
  name: string // プロジェクト名
  description?: string // 説明
  clientName?: string // クライアント名
  location: {
    name: string // 場所名
    coordinates: [number, number] // [lng, lat]
    address?: string
  }
  status: ProjectStatus
  startDate: string // ISO8601
  endDate?: string // ISO8601
  createdAt: string
  updatedAt: string
  createdBy: string // User.id
}

type ProjectStatus =
  | 'draft' // 下書き
  | 'planning' // 計画中
  | 'active' // 実施中
  | 'completed' // 完了
  | 'cancelled' // キャンセル
```

### 2. FlightPlan（飛行計画）

1回の飛行を表す。プロジェクトに紐づく。

```typescript
interface FlightPlan {
  id: string
  projectId: string // Project.id
  name: string // 飛行名

  // スケジュール
  scheduledDate: string // ISO8601 (日付)
  scheduledStartTime: string // ISO8601 (開始時刻)
  scheduledEndTime: string // ISO8601 (終了時刻)

  // 飛行エリア
  flightArea: {
    type: 'polygon' | 'circle' | 'corridor'
    coordinates: GeoJSON.Geometry
    maxAltitude: number // メートル
    minAltitude?: number
  }

  // 機体割当
  aircraftId: string // Aircraft.id

  // 飛行目的
  purpose: FlightPurpose
  purposeDetail?: string

  // 許可状況
  permits: {
    dipsRegistered: boolean // DIPS登録
    dipsNumber?: string // DIPS番号
    flightPermission: boolean // 飛行許可
    permissionNumber?: string
    notamRequired: boolean // NOTAM必要
    notamIssued?: boolean
  }

  // ワークフロー状態
  status: FlightPlanStatus
  preflightStatus: PreflightStatus

  // メタデータ
  createdAt: string
  updatedAt: string
  createdBy: string // User.id
}

type FlightPurpose =
  | 'inspection' // 点検
  | 'survey' // 測量
  | 'photography' // 撮影
  | 'delivery' // 配送
  | 'agriculture' // 農業
  | 'emergency' // 緊急
  | 'training' // 訓練
  | 'other' // その他

type FlightPlanStatus =
  | 'draft' // 下書き
  | 'pending' // 承認待ち
  | 'approved' // 承認済み
  | 'ready' // 準備完了（飛行可能）
  | 'in_flight' // 飛行中
  | 'completed' // 完了
  | 'aborted' // 中止
  | 'cancelled' // キャンセル

type PreflightStatus =
  | 'not_started' // 未着手
  | 'in_progress' // 準備中
  | 'completed' // 準備完了
  | 'failed' // 準備失敗（要再確認）
```

### 3. Aircraft（機体）

ドローン機体情報。

```typescript
interface Aircraft {
  id: string
  name: string // 機体名
  model: string // 機種
  manufacturer: string // メーカー
  serialNumber: string // シリアル番号
  registrationNumber: string // 登録記号（JA〜）

  // リモートID
  remoteId: {
    registered: boolean
    number?: string
  }

  // スペック
  specs: {
    maxFlightTime: number // 分
    maxSpeed: number // m/s
    maxAltitude: number // m
    maxPayload: number // kg
    weight: number // kg（機体重量）
  }

  // 状態
  status: AircraftStatus
  lastMaintenanceDate?: string
  nextMaintenanceDate?: string
  totalFlightTime: number // 累計飛行時間（分）

  // 保険
  insurance: {
    valid: boolean
    expiryDate?: string
    policyNumber?: string
  }

  createdAt: string
  updatedAt: string
}

type AircraftStatus =
  | 'available' // 利用可能
  | 'in_use' // 使用中
  | 'maintenance' // メンテナンス中
  | 'grounded' // 飛行停止
  | 'retired' // 退役
```

### 4. User（ユーザー）

システムユーザー。操縦者、補助者、管理者など。

```typescript
interface User {
  id: string
  name: string
  email: string
  phone?: string

  // 資格
  qualifications: Qualification[]

  // ロール
  roles: UserRole[]

  // 所属
  organizationId?: string
  department?: string

  status: UserStatus
  createdAt: string
  updatedAt: string
}

interface Qualification {
  type: QualificationType
  number?: string // 資格番号
  issuedDate: string
  expiryDate?: string
  isValid: boolean
}

type QualificationType =
  | 'pilot_license' // 操縦ライセンス
  | 'first_class' // 一等無人航空機操縦士
  | 'second_class' // 二等無人航空機操縦士
  | 'instructor' // 講習機関修了
  | 'safety_manager' // 安全管理者
  | 'other'

type UserRole =
  | 'admin' // システム管理者
  | 'manager' // 運航管理者
  | 'pilot' // 操縦者
  | 'observer' // 補助者/監視員
  | 'safety_officer' // 安全管理者
  | 'viewer' // 閲覧者

type UserStatus = 'active' | 'inactive' | 'suspended'
```

### 5. CrewAssignment（クルー割当）

飛行計画へのクルー割当。

```typescript
interface CrewAssignment {
  id: string
  flightPlanId: string // FlightPlan.id
  userId: string // User.id
  role: CrewRole
  isPrimary: boolean // 主担当かどうか
  confirmedAt?: string // 本人確認日時
  status: CrewAssignmentStatus
}

type CrewRole =
  | 'pilot_in_command' // 機長（操縦者）
  | 'remote_pilot' // 操縦者
  | 'observer' // 補助者
  | 'safety_manager' // 安全管理者
  | 'ground_crew' // 地上要員

type CrewAssignmentStatus =
  | 'assigned' // 割当済み
  | 'confirmed' // 本人確認済み
  | 'declined' // 辞退
  | 'unavailable' // 不在
```

### 6. PreflightChecklist（飛行前チェックリスト）

飛行前確認項目と結果。

```typescript
interface PreflightChecklist {
  id: string
  flightPlanId: string // FlightPlan.id

  // 気象確認
  weather: {
    checked: boolean
    checkedAt?: string
    checkedBy?: string // User.id
    conditions?: {
      windSpeed: number // m/s
      windDirection: number // degrees
      temperature: number // Celsius
      visibility: number // km
      precipitation: boolean
    }
    passed: boolean
    notes?: string
  }

  // 空域確認
  airspace: {
    checked: boolean
    checkedAt?: string
    checkedBy?: string
    items: {
      emergencyAirspace: boolean // 緊急用務空域なし
      notam: boolean // NOTAM確認
      tfr: boolean // TFR確認
    }
    passed: boolean
    notes?: string
  }

  // 機体確認
  aircraft: {
    checked: boolean
    checkedAt?: string
    checkedBy?: string
    items: {
      visualInspection: boolean // 外観点検
      batteryLevel: number // バッテリー残量%
      gpsStatus: boolean // GPS正常
      remoteIdActive: boolean // リモートID送信
      sensorCalibration: boolean // センサー校正
      firmwareUpToDate: boolean // ファームウェア最新
    }
    passed: boolean
    notes?: string
  }

  // 許可確認
  permits: {
    checked: boolean
    checkedAt?: string
    checkedBy?: string
    items: {
      dipsRegistration: boolean // DIPS登録確認
      flightPermission: boolean // 飛行許可確認
      insuranceValid: boolean // 保険有効
      pilotQualification: boolean // 操縦資格確認
    }
    passed: boolean
    notes?: string
  }

  // クルー確認
  crew: {
    checked: boolean
    checkedAt?: string
    checkedBy?: string
    items: {
      pilotPresent: boolean // 操縦者配置
      observerPresent: boolean // 補助者配置
      safetyManagerPresent: boolean // 安全管理者配置
      emergencyContactsSet: boolean // 緊急連絡先設定
    }
    passed: boolean
    notes?: string
  }

  // 総合判定
  overallStatus: 'pending' | 'passed' | 'failed'
  completedAt?: string
  completedBy?: string
}
```

---

## 画面フローとデータの流れ

### 1. プロジェクト一覧 → 詳細

```
GET /projects
  → Project[]

GET /projects/:id
  → Project

GET /projects/:id/flight-plans
  → FlightPlan[]
```

### 2. 飛行計画選択 → 準備開始

```
GET /flight-plans/:id
  → FlightPlan（機体・クルー情報含む）

GET /flight-plans/:id/crew
  → CrewAssignment[]

GET /flight-plans/:id/checklist
  → PreflightChecklist
```

### 3. 飛行前準備 → 完了

```
PATCH /flight-plans/:id/checklist
  → PreflightChecklist（各項目更新）

PATCH /flight-plans/:id
  { preflightStatus: 'completed', status: 'ready' }
```

### 4. 監視開始

```
// preflightStatus === 'completed' の場合のみ監視画面へ遷移可能
GET /flight-plans/:id/telemetry
  → WebSocket接続
```

---

## 状態遷移

### FlightPlanのライフサイクル

```
draft → pending → approved → ready → in_flight → completed
                     │                    │
                     ▼                    ▼
                 cancelled             aborted
```

### PreflightStatusの遷移

```
not_started → in_progress → completed
                   │
                   ▼
                failed → in_progress（再チェック）
```

---

## 次のアクション

1. [ ] 型定義ファイルの作成 (`src/types/utmDataModel.ts`)
2. [ ] モックデータの更新（新データモデル準拠）
3. [ ] コンテキスト/ストアの設計
4. [ ] 画面コンポーネントの改修

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| :--------- | :--------- | :------- |
| 2026-02-02 | 1.0.0      | 初版作成 |
