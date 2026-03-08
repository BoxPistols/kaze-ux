# UTMプロトタイプ要件定義書

## 目次

1. [概要](#概要)
2. [コア機能要件](#コア機能要件)
3. [ワークフロー詳細](#ワークフロー詳細)
4. [データモデルとAPI仕様](#データモデルとapi仕様)
5. [セキュリティとコンプライアンス](#セキュリティとコンプライアンス)
6. [運用・テスト・導入計画](#運用テスト導入計画)
7. [リスクと緩和策](#リスクと緩和策)
8. [付録](#付録)

---

## 概要

### 目的

UTMプロトタイプに必要な機能を網羅的に定義し、有人機団体への事前周知、NOTAM発行、運航管理、監査証跡を含む「全部入り」要件定義を提供する。

### 設計原則

- **自動化**: 手動作業を最小限に抑え、ワークフローを自動化
- **ログ化**: すべての操作を記録し、監査可能な状態を維持
- **API連携**: 外部システムとの連携を前提とした設計
- **安全性**: 実運用での安全性を最優先
- **法令順守**: 航空法規制への準拠

### スコープ

| 領域             | 内容                                 |
| :--------------- | :----------------------------------- |
| 空域判定         | NOTAM発行要否の自動判定              |
| 周知ワークフロー | 有人機団体への自動通知               |
| 飛行計画管理     | 登録・承認・実行管理のUI/API         |
| 運航監視         | プリフライトチェックとテレメトリ監視 |
| 監査証跡         | ログ・証拠保全（暗号化保存）         |
| セキュリティ     | 権限管理、認証、データ保護           |

---

## コア機能要件

### 1. 空域判定エンジン

座標・高度・時間・空域種別・有人機運航情報を基に、NOTAM発行要否と周知対象を判定するAPIを提供する。

#### 入力パラメータ

| パラメータ   | 型          | 説明                           |
| :----------- | :---------- | :----------------------------- |
| polygon      | WKT/GeoJSON | 飛行エリア（緯度経度ポリゴン） |
| max_altitude | number      | 最大高度（m）                  |
| start_time   | ISO8601     | 飛行開始時刻                   |
| end_time     | ISO8601     | 飛行終了時刻                   |
| uav_id       | string      | 機体ID                         |
| operator_id  | string      | 操縦者ID                       |

#### 出力形式

```typescript
interface AirspaceAssessmentResult {
  notam_required: boolean
  notify_list: string[] // 周知対象の組織ID配列
  reason_codes: string[] // 判定理由コード
}
```

#### 空域種別

- 管制空域
- 進入表面
- 空港周辺
- 人口集中地区（DID）
- 緊急用務空域
- その他制限空域

#### ルール管理

- 法令・運用ルールをルールエンジンで管理
- ルール更新を即座に反映可能な設計
- ルールのバージョン管理と監査ログ

---

### 2. 周知ワークフロー

有人機団体への事前周知を自動化するシステム。

#### 機能一覧

- 有人機団体データベース管理
- テンプレート生成
- 送信（メール/SMS/API/FAX対応）
- 送信確認・受信確認
- 再送・エスカレーション

#### 有人機団体DBスキーマ

| フィールド    | 型      | 説明                            |
| :------------ | :------ | :------------------------------ |
| org_id        | string  | 組織ID                          |
| org_name      | string  | 組織名                          |
| contact_type  | enum    | 連絡先種別（email/sms/api/fax） |
| contact_value | string  | 連絡先値                        |
| priority      | number  | 優先度                          |
| is_active     | boolean | 受信可否フラグ                  |

#### 送信履歴スキーマ

| フィールド       | 型        | 説明                                          |
| :--------------- | :-------- | :-------------------------------------------- |
| log_id           | string    | ログID                                        |
| sent_at          | timestamp | 送信日時                                      |
| org_id           | string    | 送信先組織ID                                  |
| method           | enum      | 送信方法                                      |
| status           | enum      | ステータス（sent/delivered/failed/confirmed） |
| confirmation_log | string    | 受信確認ログ                                  |

---

### 3. NOTAM連携モジュール

NOTAM（航空情報）の発行申請を自動化するモジュール。

#### 機能一覧

- NOTAM発行条件判定
- 申請書自動生成（航空局フォーマット）
- 申請履歴管理
- 発行結果取り込み

#### 出力形式

- **PDF**: 人間可読な申請書
- **構造化JSON**: 航空局API連携用

#### トリガー条件

1. 空域判定でNOTAM必要と判定された場合
2. 運航者が手動で発行要求した場合

---

### 4. 運航管理UI/API

飛行計画の作成から承認、実行監視までを管理するシステム。

#### 機能一覧

- 飛行計画作成（地図ベース）
- 承認ワークフロー
- リアルタイム監視ダッシュボード
- アラート表示・管理
- 操縦者管理

#### UI要件

| 画面           | 機能                               |
| :------------- | :--------------------------------- |
| 飛行計画作成   | 地図上でエリア選択、高度・時間設定 |
| 承認画面       | 承認/却下ボタン、コメント入力      |
| ダッシュボード | 周知/NOTAMステータス、飛行状況表示 |
| ログ閲覧       | 期間・機体・操縦者でフィルタ可能   |

---

### 5. ログと監査証跡

改ざん防止と長期保存を実現するログシステム。

#### 保存対象

- 飛行計画（作成・変更履歴）
- 承認履歴
- 周知送信履歴
- NOTAM申請/発行結果
- テレメトリデータ
- 操縦者操作ログ

#### 要件

| 項目       | 仕様                                 |
| :--------- | :----------------------------------- |
| 改ざん防止 | ハッシュチェーンまたはWORMストレージ |
| 暗号化     | AES-256で保存データを暗号化          |
| 検索性     | 期間・機体・操縦者でフィルタ可能     |
| 保持期間   | 最低5年（運用ポリシーに準拠）        |

---

## ワークフロー詳細

### 全体フロー

```
1. 飛行計画登録（操縦者）
       ↓
2. 自動空域判定（UTM）
   → NOTAM要否・周知先決定
       ↓
3. 周知自動送信（有人機団体）
   + 送信履歴保存
       ↓
4. NOTAM申請自動生成（必要時）
   → 航空局へ提出
       ↓
5. 承認フロー（管理者）
   → 承認後飛行実行可
       ↓
6. 飛行実行と監視（テレメトリ）
   → アラート発生時は自動停止/回避指示
       ↓
7. 事後報告とログ保存
```

### プリフライトチェックリスト

#### 機体確認

- [ ] 機体外観良好
- [ ] プロペラ損傷なし
- [ ] バッテリー残量OK

#### 通信確認

- [ ] 地上局通信良好
- [ ] 冗長通信手段確認

#### 気象確認

- [ ] 風速が運用基準内
- [ ] 視程が運用基準内

#### 周辺確認

- [ ] 飛行エリアに障害物なし
- [ ] 有人機の予定なし（周知確認済）

#### 人員確認

- [ ] 操縦者資格確認
- [ ] 補助者配置確認

#### 緊急手順確認

- [ ] RTH設定完了
- [ ] 緊急連絡先確認

#### システム確認

- [ ] 飛行計画登録済
- [ ] NOTAM/周知ステータス確認

---

## データモデルとAPI仕様

### 主要エンティティ

#### FlightPlan

```typescript
interface FlightPlan {
  id: string
  operator_id: string
  polygon: GeoJSON
  start_time: string // ISO8601
  end_time: string // ISO8601
  max_altitude: number
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed'
  created_at: string
  updated_at: string
}
```

#### Operator

```typescript
interface Operator {
  id: string
  name: string
  contact: string
  certifications: string[]
  created_at: string
}
```

#### OrganizationContact

```typescript
interface OrganizationContact {
  id: string
  org_name: string
  contact_type: 'email' | 'sms' | 'api' | 'fax'
  contact_value: string
  priority: number
  is_active: boolean
}
```

#### NOTAMRequest

```typescript
interface NOTAMRequest {
  id: string
  flightplan_id: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  submitted_at: string | null
  notam_id: string | null
  created_at: string
}
```

#### NotificationLog

```typescript
interface NotificationLog {
  id: string
  flightplan_id: string
  org_id: string
  method: 'email' | 'sms' | 'api' | 'fax'
  status: 'sent' | 'delivered' | 'failed' | 'confirmed'
  timestamp: string
}
```

#### Telemetry

```typescript
interface Telemetry {
  timestamp: string
  uav_id: string
  lat: number
  lng: number
  alt: number
  speed: number
  status: 'normal' | 'warning' | 'emergency'
}
```

### APIエンドポイント

#### 飛行計画

| メソッド | エンドポイント                     | 説明         |
| :------- | :--------------------------------- | :----------- |
| POST     | `/api/v1/flightplans`              | 飛行計画作成 |
| GET      | `/api/v1/flightplans/{id}`         | 飛行計画取得 |
| PUT      | `/api/v1/flightplans/{id}`         | 飛行計画更新 |
| POST     | `/api/v1/flightplans/{id}/approve` | 飛行計画承認 |
| POST     | `/api/v1/flightplans/{id}/reject`  | 飛行計画却下 |

#### 空域判定

| メソッド | エンドポイント            | 説明         |
| :------- | :------------------------ | :----------- |
| GET      | `/api/v1/airspace/assess` | 空域判定実行 |

クエリパラメータ: `polygon`, `start`, `end`, `max_altitude`

#### 周知

| メソッド | エンドポイント               | 説明             |
| :------- | :--------------------------- | :--------------- |
| POST     | `/api/v1/notifications/send` | 周知送信トリガー |
| GET      | `/api/v1/notifications/logs` | 送信履歴取得     |

#### NOTAM

| メソッド | エンドポイント         | 説明              |
| :------- | :--------------------- | :---------------- |
| POST     | `/api/v1/notam/submit` | NOTAM申請         |
| GET      | `/api/v1/notam/{id}`   | NOTAM申請状況取得 |

#### ログ

| メソッド | エンドポイント | 説明                     |
| :------- | :------------- | :----------------------- |
| GET      | `/api/v1/logs` | ログ取得（フィルタ可能） |

### イベント/メッセージング

イベントバス（Kafka等）で以下のイベントを発行し、非同期処理を実装:

- `flightplan.created` - 飛行計画作成
- `flightplan.approved` - 飛行計画承認
- `airspace.assessed` - 空域判定完了
- `notification.sent` - 周知送信完了
- `notification.confirmed` - 周知受信確認
- `notam.submitted` - NOTAM申請完了
- `notam.approved` - NOTAM承認

---

## セキュリティとコンプライアンス

### 認証/認可

| 項目     | 仕様                              |
| :------- | :-------------------------------- |
| 認証方式 | OAuth 2.0                         |
| 認可方式 | RBAC（Role-Based Access Control） |

#### ロール定義

| ロール   | 権限                         |
| :------- | :--------------------------- |
| operator | 飛行計画作成、自身の計画閲覧 |
| manager  | 飛行計画承認、全計画閲覧     |
| admin    | 全機能、システム設定         |
| auditor  | ログ閲覧（読み取り専用）     |
| external | 航空局連携API専用            |

### 通信セキュリティ

- TLS 1.3必須
- APIはHTTPS強制
- 証明書のピン留め推奨

### データ保護

| 対象       | 方式                         |
| :--------- | :--------------------------- |
| 保存データ | AES-256暗号化                |
| ログ       | ハッシュ署名による改ざん検知 |
| 通信       | TLS暗号化                    |

### 監査

- 全操作に対して監査ログを記録
- 管理者向け監査UIを提供
- 定期的な監査レポート生成

### 法令対応

- 国土交通省・航空局の要件に準拠
- ルール更新を反映する運用プロセスを定義
- 法令変更時の影響評価プロセス

---

## 運用・テスト・導入計画

### 運用体制と役割

| 役割                  | 責務                       |
| :-------------------- | :------------------------- |
| プロダクトオーナー    | 要件決定、優先度管理       |
| 運航責任者            | 最終承認、エスカレーション |
| 技術チーム            | 開発・運用・監視           |
| 法務/コンプライアンス | 法令変更対応               |
| 有人機連絡窓口        | 周知先管理と連絡調整       |

### テスト計画

#### ユニットテスト

- ルールエンジンのロジック
- 空域判定ロジック
- テンプレート生成

#### 統合テスト

- 周知送信フロー
- NOTAM申請フロー
- API連携

#### E2Eシナリオ

```
飛行計画作成 → 空域判定 → 周知送信 → NOTAM申請 → 承認 → 飛行監視
```

#### 負荷試験

- 高密度運航を想定した同時飛行計画処理
- 同時接続数の限界確認

#### セキュリティテスト

- 脆弱性スキャン
- ペネトレーションテスト
- 認証/認可のバイパステスト

### 導入フェーズ

#### Phase 1: MVP

| 項目 | 内容                                                         |
| :--- | :----------------------------------------------------------- |
| 機能 | 飛行計画登録、空域判定、周知テンプレ送信（メール）、ログ保存 |
| 目標 | 基本的なワークフローの検証                                   |

#### Phase 2: 拡張

| 項目 | 内容                                          |
| :--- | :-------------------------------------------- |
| 機能 | NOTAM自動生成・申請、UI改善、複数送信方法対応 |
| 目標 | 実運用に向けた機能拡充                        |

#### Phase 3: 運用化

| 項目 | 内容                                           |
| :--- | :--------------------------------------------- |
| 機能 | 航空局連携、冗長化、監査機能強化、スケール運用 |
| 目標 | 本番運用開始                                   |

---

## リスクと緩和策

| リスク         | 影響度 | 緩和策                                                       |
| :------------- | :----- | :----------------------------------------------------------- |
| 周知漏れ       | 高     | 自動リマインダ、送信失敗時の再試行、二重送信確認             |
| NOTAM却下/遅延 | 高     | 申請前チェックリスト、代替ルート提案、担当者エスカレーション |
| 法令変更       | 中     | ルール管理モジュールと定期レビュー体制                       |
| システム障害   | 高     | フェイルオーバー、バックアップ、オフライン手順の明文化       |
| データ漏洩     | 高     | 暗号化、アクセス制御、監査ログ                               |
| 不正アクセス   | 高     | OAuth2.0、RBAC、多要素認証                                   |

---

## 付録

### A. 周知メールテンプレート

```
件名: 【周知】ドローン飛行予定通知 - {flight_id}

本文:
組織名: {org_name}
飛行者: {operator_name} ({operator_contact})
機体ID: {uav_id}
飛行日時: {start_time} - {end_time} (JST)
飛行エリア: {geo_description}
最大高度: {max_altitude} m
目的: {mission_purpose}
安全対策: {safety_measures}
連絡先: {ops_contact}

本通知は事前周知のための連絡です。
ご不明点があれば上記連絡先までご連絡ください。
```

### B. NOTAM申請テンプレート（JSON）

```json
{
  "flight_id": "{flight_id}",
  "requester": {
    "name": "{operator_name}",
    "contact": "{operator_contact}"
  },
  "location": {
    "polygon": "{wkt_polygon}",
    "center": "{lat,lng}"
  },
  "time": {
    "start": "{start_iso}",
    "end": "{end_iso}"
  },
  "max_altitude_m": "{max_altitude}",
  "reason": "{mission_purpose}",
  "safety_measures": "{safety_measures}",
  "attachments": ["周知送信履歴.pdf"]
}
```

### C. NOTAM申請テンプレート（人間可読形式）

```
申請者: {operator_name}
飛行日時: {start} - {end}
位置: {lat,lng} 半径 {radius} km
高度: 最大 {max_altitude} m
理由: {mission_purpose}
安全対策: {safety_measures}
```

### D. 周知メールサンプル（短縮版）

```
件名: ドローン飛行事前通知 {flight_id}

本文:
飛行日時: {start} - {end}
場所: {area}
高度: {max_altitude} m
連絡: {operator_contact}
```

---

## 次のアクション（推奨）

1. **優先機能の確定**: MVPに含める機能を決定する
2. **有人機団体リストの収集**: 連絡先と受信可否を確認してDB化
3. **ルールエンジンの初期仕様作成**: NOTAM判定ルールを定義
4. **プロトタイプ実装計画作成**: スプリント単位でタスク分割

---

## 変更履歴

| 日付       | バージョン | 変更内容 | 担当者 |
| :--------- | :--------- | :------- | :----- |
| 2024-12-24 | 1.0.0      | 初版作成 | -      |
