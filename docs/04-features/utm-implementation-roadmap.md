# UTMプロトタイプ実装ロードマップ

## 現在の実装状況と要件定義のギャップ分析

### 実装済み（UIレイヤー）

| コンポーネント        | 進捗 | 状態                                 |
| :-------------------- | :--- | :----------------------------------- |
| UTMTrackingMap        | 100% | 地図・マーカー・インタラクション完備 |
| UTMFlightTimeline     | 100% | イベント表示・フィルタリング完備     |
| UTMAlertPanel         | 100% | アラート管理・確認応答機能完備       |
| UTMWeatherWidget      | 100% | 気象情報表示・評価完備               |
| UTMDroneStatusWidget  | 95%  | 3D姿勢表示・リアルタイム更新         |
| UTMFlightPlanEditor   | 90%  | ウェイポイント編集・検証機能         |
| UTMIncidentReport     | 90%  | 完全な報告フォーム・ファイル添付     |
| UTMDroneListPanel     | 100% | リスト表示・フィルタリング           |
| 型定義（utmTypes.ts） | 95%  | 846行の包括的な型定義                |
| モックデータ          | 90%  | リアルな動作シミュレーション         |

### 未実装（要件定義で必要）

| 機能                   | 進捗 | 優先度 |
| :--------------------- | :--- | :----- |
| 空域判定エンジン       | 0%   | 高     |
| 周知ワークフロー       | 0%   | 高     |
| NOTAM連携モジュール    | 0%   | 高     |
| 有人機団体DB管理       | 0%   | 中     |
| 監査証跡・ログシステム | 10%  | 高     |
| 認証/認可（OAuth2.0）  | 0%   | 高     |
| REST API実装           | 10%  | 高     |

---

## 実装フェーズ

### Phase 1: MVP（基盤整備）

**目標**: 既存UIとバックエンドAPIの接続基盤を構築

#### 1.1 型定義の拡張

現在の `utmTypes.ts` に以下を追加:

```typescript
// 空域判定
interface AirspaceAssessmentRequest {
  polygon: GeoJSON.Polygon
  max_altitude: number
  start_time: string
  end_time: string
  uav_id: string
  operator_id: string
}

interface AirspaceAssessmentResult {
  notam_required: boolean
  notify_list: string[]
  reason_codes: AirspaceReasonCode[]
}

type AirspaceReasonCode =
  | 'controlled_airspace'
  | 'approach_surface'
  | 'airport_vicinity'
  | 'did_area'
  | 'emergency_airspace'
  | 'restricted_zone'

// 周知ワークフロー
interface OrganizationContact {
  id: string
  org_name: string
  contact_type: 'email' | 'sms' | 'api' | 'fax'
  contact_value: string
  priority: number
  is_active: boolean
}

interface NotificationLog {
  id: string
  flightplan_id: string
  org_id: string
  method: 'email' | 'sms' | 'api' | 'fax'
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'confirmed'
  sent_at: string
  confirmed_at?: string
}

// NOTAM
interface NOTAMRequest {
  id: string
  flightplan_id: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  submitted_at?: string
  notam_id?: string
  pdf_url?: string
  json_data: NOTAMJsonData
}

interface NOTAMJsonData {
  flight_id: string
  requester: { name: string; contact: string }
  location: { polygon: string; center: string }
  time: { start: string; end: string }
  max_altitude_m: number
  reason: string
  safety_measures: string
}

// 監査ログ
interface AuditLog {
  id: string
  timestamp: string
  action: AuditAction
  entity_type: string
  entity_id: string
  user_id: string
  changes?: Record<string, unknown>
  hash: string
  previous_hash: string
}

type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'send_notification'
  | 'submit_notam'
```

#### 1.2 APIクライアントサービス

新規ファイル: `src/services/utmApiClient.ts`

```typescript
// API基盤
class UTMApiClient {
  private baseUrl: string
  private token?: string

  // 飛行計画
  createFlightPlan(plan: FlightPlanInput): Promise<FlightPlan>
  getFlightPlan(id: string): Promise<FlightPlan>
  updateFlightPlan(
    id: string,
    plan: Partial<FlightPlanInput>
  ): Promise<FlightPlan>
  approveFlightPlan(id: string): Promise<FlightPlan>
  rejectFlightPlan(id: string, reason: string): Promise<FlightPlan>

  // 空域判定
  assessAirspace(
    request: AirspaceAssessmentRequest
  ): Promise<AirspaceAssessmentResult>

  // 周知
  sendNotifications(flightplanId: string): Promise<NotificationLog[]>
  getNotificationLogs(flightplanId: string): Promise<NotificationLog[]>

  // NOTAM
  submitNotam(request: NOTAMRequest): Promise<NOTAMRequest>
  getNotamStatus(id: string): Promise<NOTAMRequest>
}
```

#### 1.3 モックAPIサーバー（開発用）

新規ファイル: `src/mocks/utmMockApi.ts`

- MSW (Mock Service Worker) を使用
- 開発環境でAPIレスポンスをシミュレート
- 既存のutmMockData.tsを活用

#### 1.4 既存コンポーネントの拡張

**UTMFlightPlanEditor の拡張**:

```typescript
// 追加機能
;-保存時に自動空域判定を実行 -
  判定結果に基づいてNOTAM / 周知ステータスを表示 -
  プリフライトチェックリストの統合
```

**UTMAlertPanel の拡張**:

```typescript
// 追加機能
- NOTAM申請ステータスアラートの表示
- 周知送信ステータスアラートの表示
- アクションボタン（周知再送、NOTAM確認など）
```

---

### Phase 2: 機能拡張

**目標**: 空域判定・周知・NOTAMの自動化フローを実装

#### 2.1 空域判定エンジン

新規コンポーネント: `src/components/UTMAirspaceAssessment/`

```
UTMAirspaceAssessment/
├── UTMAirspaceAssessmentPanel.tsx    # 判定結果表示パネル
├── UTMAirspaceRuleViewer.tsx         # ルール一覧・確認UI
├── UTMAirspaceMap.tsx                # 空域種別表示地図
└── hooks/
    └── useAirspaceAssessment.ts      # 判定ロジックフック
```

機能:

- ポリゴン描画時にリアルタイム判定
- 制限空域との交差判定
- NOTAM要否・周知先リストの自動生成

#### 2.2 周知ワークフロー

新規コンポーネント: `src/components/UTMNotification/`

```
UTMNotification/
├── UTMNotificationPanel.tsx          # 周知ステータス一覧
├── UTMOrganizationManager.tsx        # 有人機団体DB管理
├── UTMNotificationTemplate.tsx       # テンプレートプレビュー
├── UTMNotificationHistory.tsx        # 送信履歴
└── hooks/
    └── useNotificationWorkflow.ts    # ワークフロー管理
```

機能:

- 自動送信トリガー
- 送信ステータス追跡
- 再送・エスカレーション

#### 2.3 NOTAM連携

新規コンポーネント: `src/components/UTMNotam/`

```
UTMNotam/
├── UTMNotamPanel.tsx                 # NOTAM申請状況パネル
├── UTMNotamEditor.tsx                # 申請書編集
├── UTMNotamPreview.tsx               # PDF/JSONプレビュー
├── UTMNotamHistory.tsx               # 申請履歴
└── hooks/
    └── useNotamWorkflow.ts           # NOTAM申請フロー管理
```

機能:

- 申請書自動生成
- PDF/JSON出力
- 申請ステータス追跡

#### 2.4 承認ワークフロー

新規コンポーネント: `src/components/UTMApproval/`

```
UTMApproval/
├── UTMApprovalQueue.tsx              # 承認待ちキュー
├── UTMApprovalDetail.tsx             # 承認詳細画面
├── UTMApprovalHistory.tsx            # 承認履歴
└── hooks/
    └── useApprovalWorkflow.ts        # 承認フロー管理
```

機能:

- 承認/却下ワークフロー
- コメント・理由入力
- 通知連携

---

### Phase 3: 運用化

**目標**: セキュリティ・監査・スケーラビリティの強化

#### 3.1 認証/認可

```
src/auth/
├── AuthProvider.tsx                  # OAuth2.0プロバイダー
├── ProtectedRoute.tsx                # 権限チェックルート
├── useAuth.ts                        # 認証フック
└── rbac.ts                           # ロール定義
```

#### 3.2 監査証跡

```
src/services/
├── auditService.ts                   # 監査ログ記録
└── hashChain.ts                      # ハッシュチェーン生成

src/components/UTMAudit/
├── UTMAuditLogViewer.tsx             # ログ閲覧UI
├── UTMAuditSearch.tsx                # ログ検索
└── UTMAuditExport.tsx                # ログエクスポート
```

#### 3.3 バックエンドAPI連携

本番環境向けAPI統合:

- 航空局API（NOTAM申請）
- DIPS連携
- テレメトリデータストリーム

---

## 優先実装タスク

### 即時対応（1-2週間）

1. **型定義の拡張** (`utmTypes.ts`)
   - 空域判定、周知、NOTAM関連の型を追加
   - 既存の型との整合性確保

2. **APIクライアントサービスの作成**
   - `utmApiClient.ts` の実装
   - モックAPIの構築（MSW）

3. **UTMFlightPlanEditor の拡張**
   - 空域判定結果の表示
   - プリフライトチェックリストの統合

### 短期対応（2-4週間）

4. **空域判定パネルの実装**
   - 判定結果表示UI
   - ルール一覧表示

5. **周知ステータスパネルの実装**
   - 送信ステータス表示
   - 送信履歴

6. **NOTAMステータスパネルの実装**
   - 申請状況表示
   - テンプレートプレビュー

### 中期対応（1-2ヶ月）

7. **承認ワークフローの実装**
8. **有人機団体DB管理画面の実装**
9. **監査ログビューアの実装**

---

## ファイル構成（追加予定）

```
src/
├── components/
│   ├── UTMAirspaceAssessment/        # 新規: 空域判定
│   │   ├── UTMAirspaceAssessmentPanel.tsx
│   │   ├── UTMAirspaceRuleViewer.tsx
│   │   └── index.ts
│   ├── UTMNotification/              # 新規: 周知ワークフロー
│   │   ├── UTMNotificationPanel.tsx
│   │   ├── UTMOrganizationManager.tsx
│   │   ├── UTMNotificationTemplate.tsx
│   │   └── index.ts
│   ├── UTMNotam/                     # 新規: NOTAM連携
│   │   ├── UTMNotamPanel.tsx
│   │   ├── UTMNotamEditor.tsx
│   │   ├── UTMNotamPreview.tsx
│   │   └── index.ts
│   ├── UTMApproval/                  # 新規: 承認ワークフロー
│   │   ├── UTMApprovalQueue.tsx
│   │   ├── UTMApprovalDetail.tsx
│   │   └── index.ts
│   └── UTMAudit/                     # 新規: 監査
│       ├── UTMAuditLogViewer.tsx
│       └── index.ts
├── services/
│   ├── utmApiClient.ts               # 新規: APIクライアント
│   ├── airspaceService.ts            # 新規: 空域判定ロジック
│   ├── notificationService.ts        # 新規: 周知サービス
│   ├── notamService.ts               # 新規: NOTAM サービス
│   └── auditService.ts               # 新規: 監査ログサービス
├── mocks/
│   ├── utmMockApi.ts                 # 新規: モックAPI
│   └── handlers.ts                   # 新規: MSWハンドラー
└── types/
    └── utmTypes.ts                   # 拡張: 新規型追加
```

---

## データフロー

### 飛行計画作成から飛行実行まで

```
[操縦者] 飛行計画作成
    ↓
[UTMFlightPlanEditor]
    ↓ (保存)
[utmApiClient.createFlightPlan]
    ↓
[空域判定サービス] ← 既存: RestrictedZone データ
    ↓
[AirspaceAssessmentResult]
    ↓
┌─────────────────────────────────────┐
│ notam_required: true の場合          │
│   → NOTAMRequest 自動生成           │
│   → UTMNotamPanel に表示             │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ notify_list.length > 0 の場合       │
│   → 周知自動送信                    │
│   → UTMNotificationPanel に表示     │
└─────────────────────────────────────┘
    ↓
[管理者] 承認
    ↓ (UTMApprovalQueue)
[飛行実行可能]
    ↓
[UTMTrackingMap] リアルタイム監視
```

---

## 既存コンポーネントとの統合ポイント

### UTMDashboardPage への統合

```typescript
// 追加するタブ/パネル
<Tabs>
  <Tab label="監視" />          {/* 既存 */}
  <Tab label="飛行計画" />       {/* 既存 */}
  <Tab label="承認キュー" />     {/* 新規 */}
  <Tab label="周知/NOTAM" />    {/* 新規 */}
  <Tab label="監査ログ" />       {/* 新規 */}
</Tabs>
```

### UTMFlightTimeline との連携

```typescript
// 追加するイベントタイプ
type FlightTimelineEventType =
  | ... // 既存
  | 'airspace_assessed'      // 空域判定完了
  | 'notification_sent'      // 周知送信
  | 'notification_confirmed' // 周知確認
  | 'notam_submitted'        // NOTAM申請
  | 'notam_approved'         // NOTAM承認
  | 'approval_requested'     // 承認依頼
  | 'approval_granted';      // 承認完了
```

### UTMAlertPanel との連携

```typescript
// 追加するアラートタイプ
type AlertType =
  | ... // 既存
  | 'notification_failed'    // 周知送信失敗
  | 'notam_rejected'         // NOTAM却下
  | 'approval_required'      // 承認待ち
  | 'approval_expired';      // 承認期限切れ
```

---

## テスト戦略

### 単体テスト

- 空域判定ロジック
- 周知テンプレート生成
- NOTAM JSON生成
- ハッシュチェーン生成

### 統合テスト

- 飛行計画作成 → 空域判定フロー
- 空域判定 → 周知送信フロー
- 周知送信 → NOTAM申請フロー

### E2Eテスト

- 完全なワークフロー（計画作成 → 承認 → 飛行監視）
- エラーケース（周知失敗、NOTAM却下）

---

## 次のアクション

1. **型定義の拡張を開始**（`utmTypes.ts`）
2. **APIクライアントサービスの雛形作成**
3. **MSWによるモックAPI構築**
4. **UTMFlightPlanEditorの拡張（空域判定結果表示）**

これらのタスクから着手することを推奨します。
