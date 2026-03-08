# 運航監視アラート機能

このドキュメントでは、運航監視ページのアラート機能について詳しく説明します。

## 目次

- [概要](#概要)
- [アーキテクチャ](#アーキテクチャ)
- [コンポーネント](#コンポーネント)
- [使用方法](#使用方法)
- [カスタマイズ](#カスタマイズ)

---

## 概要

運航監視アラート機能は、ドローンの飛行中に発生する様々なアラートをリアルタイムで表示・管理するシステムです。

### 主な機能

- **リアルタイムアラート表示**: ドローンからのアラートを即座に表示
- **サイトフィルタリング**: マルチサイト環境で現在のサイトのアラートのみを表示
- **重要度分類**: 情報・警告・重大・緊急の4段階
- **種類別フィルター**: 10種類のアラートタイプ
- **検索機能**: キーワードでアラートを検索
- **アラート詳細**: 詳細情報をダイアログで表示
- **確認・削除**: アラートの確認と削除

---

## アーキテクチャ

### データフロー

```
Zustand Store (utmStore)
    ↓
UTMEnhancedAlertPanel
    ↓ (droneIds filter)
MonitoringSiteContext
    ↓
MonitoringPage
```

### 状態管理

#### Zustand Store

アラートデータはZustandストアで一元管理:

```typescript
// src/store/utmStore.ts
interface UTMStore {
  alerts: Alert[]
  addAlert: (alert: Omit<Alert, 'id'>) => void
  clearAlert: (alertId: string) => void
  acknowledgeAlert: (alertId: string, acknowledgedBy: string) => void
}
```

#### アラート型定義

```typescript
interface Alert {
  id: string
  droneId: string
  droneName: string
  type: AlertType
  severity: AlertSeverity
  message: string
  details: string
  timestamp: string
  acknowledged: boolean
  acknowledgedBy?: string
}

type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency'

type AlertType =
  | 'zone_violation' // 禁止区域侵入
  | 'zone_approach' // 禁止区域接近
  | 'collision_warning' // 衝突警告
  | 'collision_alert' // 衝突危険
  | 'low_battery' // バッテリー低下
  | 'signal_loss' // 信号喪失
  | 'geofence_breach' // ジオフェンス逸脱
  | 'weather_warning' // 気象警告
  | 'airspace_conflict' // 空域競合
  | 'system_command' // システムコマンド
```

---

## コンポーネント

### UTMEnhancedAlertPanel

アラート表示の中心となるコンポーネント。

#### プロパティ

```typescript
interface UTMEnhancedAlertPanelProps {
  /** カスタムスタイル */
  sx?: object

  /** 高さ */
  height?: string | number

  /** ドローン選択ハンドラー */
  onDroneSelect?: (droneId: string) => void

  /** フィルター対象のドローンID配列 */
  droneIds?: string[]
}
```

#### 基本的な使用例

```tsx
import { UTMEnhancedAlertPanel } from '@/components/utm'

// 全アラート表示
function AllAlertsView() {
  return <UTMEnhancedAlertPanel height={400} />
}

// 特定ドローンのアラートのみ表示
function FilteredAlertsView() {
  const activeDroneIds = ['drone-001', 'drone-002']

  return (
    <UTMEnhancedAlertPanel
      height={400}
      droneIds={activeDroneIds}
      onDroneSelect={(droneId) => {
        console.log('Selected drone:', droneId)
      }}
    />
  )
}
```

#### マルチサイト環境での使用

```tsx
import { useMonitoringSite } from '@/contexts/MonitoringSiteContext'
import { UTMEnhancedAlertPanel } from '@/components/utm'

function MonitoringAlerts() {
  const { activeDrones, setSelectedDroneId } = useMonitoringSite()
  const activeDroneIds = activeDrones.map((d) => d.droneId)

  return (
    <UTMEnhancedAlertPanel
      height='100%'
      droneIds={activeDroneIds}
      onDroneSelect={(droneId) => setSelectedDroneId(droneId)}
    />
  )
}
```

### MonitoringSiteContext

サイト選択とドローン選択の状態管理を提供。

#### 提供される値

```typescript
interface MonitoringSiteContextValue {
  activeSiteId: string | null
  setActiveSiteId: (siteId: string | null) => void
  selectedDroneId: string | null
  setSelectedDroneId: (droneId: string | null) => void
  allSites: SiteInfo[]
  activeSite: SiteInfo | null
  activeDrones: Drone[]
  selectedDrone: Drone | null
}
```

#### 使用例

```tsx
import { useMonitoringSite } from '@/contexts/MonitoringSiteContext'

function DroneList() {
  const { activeDrones, selectedDroneId, setSelectedDroneId } =
    useMonitoringSite()

  return (
    <div>
      {activeDrones.map((drone) => (
        <button
          key={drone.droneId}
          onClick={() => setSelectedDroneId(drone.droneId)}
          className={drone.droneId === selectedDroneId ? 'active' : ''}>
          {drone.droneName}
        </button>
      ))}
    </div>
  )
}
```

---

## 使用方法

### 1. アラートの追加

```typescript
import useUTMStore from '@/store/utmStore'

function SomeComponent() {
  const { addAlert } = useUTMStore()

  const handleZoneViolation = () => {
    addAlert({
      droneId: 'drone-001',
      droneName: 'ドローンA',
      type: 'zone_violation',
      severity: 'critical',
      message: '区域侵入: 天神地区',
      details: 'ドローンが禁止区域に侵入しました。即座に退避してください。',
      timestamp: new Date().toISOString(),
      acknowledged: false,
    })
  }

  return <button onClick={handleZoneViolation}>アラート発生</button>
}
```

### 2. アラートの確認

ユーザーがアラート詳細ダイアログで「確認」ボタンをクリックすると、アラートが確認済みになります。

```typescript
const { acknowledgeAlert } = useUTMStore()

acknowledgeAlert('alert-id', 'user-name')
```

確認済みアラートの表示:

- 背景色が透明になる
- テキストに取り消し線
- 不透明度が下がる
- インジケーターの色が変わる

### 3. アラートの削除

```typescript
const { clearAlert } = useUTMStore()

clearAlert('alert-id')
```

### 4. フィルタリング

#### 重要度でフィルタリング

プルダウンメニューから選択:

- 全重要度
- 情報
- 警告
- 重大
- 緊急

#### タイプでフィルタリング

プルダウンメニューから選択:

- 全タイプ
- 禁止区域侵入
- 禁止区域接近
- 衝突警告
- 衝突危険
- バッテリー低下
- 信号喪失
- ジオフェンス逸脱
- 気象警告
- 空域競合
- システムコマンド

#### キーワード検索

検索フィールドに入力して、以下の項目から検索:

- メッセージ
- 詳細
- ドローン名

---

## カスタマイズ

### スタイルのカスタマイズ

#### 高さの調整

```tsx
// 固定高さ
<UTMEnhancedAlertPanel height={400} />

// パーセンテージ
<UTMEnhancedAlertPanel height='50vh' />

// 親要素いっぱい
<UTMEnhancedAlertPanel height='100%' />
```

#### カスタムスタイル

```tsx
<UTMEnhancedAlertPanel
  sx={{
    borderRadius: 4,
    boxShadow: 3,
  }}
/>
```

### アラート色のカスタマイズ

`src/components/utm/UTMEnhancedAlertPanel.tsx`で色定義を変更:

```typescript
const ALERT_SEVERITY_COLORS: Record<AlertSeverity, string> = {
  info: colors.info.main,
  warning: colors.warning.main,
  critical: colors.error.main,
  emergency: '#FF0000', // カスタム色
}

const ALERT_TYPE_COLORS: Record<AlertType, string> = {
  zone_violation: colors.error.main,
  zone_approach: colors.warning.main,
  // ... その他
}
```

### アラートラベルのカスタマイズ

```typescript
const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  zone_violation: '禁止区域侵入',
  zone_approach: '禁止区域接近',
  // ... カスタムラベル
}

const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
  info: '情報',
  warning: '警告',
  critical: '重大',
  emergency: '緊急',
}
```

---

## ベストプラクティス

### 1. パフォーマンス

```tsx
// useMemoでフィルタリング結果をメモ化
const filteredAlerts = useMemo(() => {
  return alerts.filter(/* フィルター条件 */)
}, [alerts, filterConditions])
```

### 2. エラーハンドリング

```tsx
try {
  addAlert({
    // ... アラート情報
  })
} catch (error) {
  console.error('Failed to add alert:', error)
  // フォールバック処理
}
```

### 3. アクセシビリティ

- アラートの重要度に応じた適切なARIAロールを使用
- キーボードナビゲーションをサポート
- スクリーンリーダー対応のラベル

---

## トラブルシューティング

### 問題: アラートが表示されない

**原因**: `droneIds`フィルターで除外されている可能性

**解決策**:

```tsx
// droneIdsプロパティを確認
console.log('Active drone IDs:', activeDroneIds)
console.log('Alert drone ID:', alert.droneId)

// droneIdsを指定しない場合は全アラート表示
<UTMEnhancedAlertPanel />
```

### 問題: サイト切り替え時にアラートが更新されない

**原因**: `activeDroneIds`が更新されていない

**解決策**:

```tsx
// useMemoでドローンIDリストを作成
const activeDroneIds = useMemo(
  () => activeDrones.map((d) => d.droneId),
  [activeDrones]
)
```

### 問題: アラートの順序がおかしい

**原因**: 時系列ソートが正しく動作していない

**確認**:

```typescript
// 新しい順にソート
const sortedAlerts = [...alerts].sort(
  (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
)
```

---

## 関連ドキュメント

- [UI改善実装ログ](./ui-improvements-2026-02.md)
- [UTM要件定義書](./utm-requirements.md)
- [UTM実装ロードマップ](./utm-implementation-roadmap.md)

---

**最終更新**: 2026年2月1日
