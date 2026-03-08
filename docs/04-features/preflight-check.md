# 飛行前準備（Pre-Flight Check）機能仕様書

## 概要

飛行前準備機能は、ドローン運航前に必要なすべての確認事項を体系的に管理し、安全な飛行開始を支援するシステムです。

### 目的

- 飛行前の必須確認項目を漏れなく実施
- UTM/DIPS基準に準拠したチェックリストの提供
- 確認完了状態の可視化と記録

### 画面遷移

```
申請管理 (/planning/applications)
    ↓
飛行前準備 (/planning/preflight)  ← このページ
    ↓
飛行監視 (/monitoring)
```

---

## UI構成

### タブ構造

飛行前準備ページは5つのタブで構成されています：

| タブ               | アイコン    | 説明                     |
| :----------------- | :---------- | :----------------------- |
| 気象・空域         | Cloud       | 気象条件と空域状態の確認 |
| 機体状態           | Battery     | 機体とセンサーの動作確認 |
| 許可・資格         | Description | 許可証と資格の有効性確認 |
| デコンフリクション | SwapHoriz   | 他機との干渉確認         |
| クルー確認         | Groups      | 運航クルーの配置確認     |

### 表示モード

- **リスト表示**: 飛行一覧をテーブル形式で表示
- **マップ表示**: 飛行エリアを地図上に可視化

---

## タブ詳細

### 1. 気象・空域タブ

飛行に影響する気象条件と空域制限を確認します。

#### 気象確認項目

| 項目 | 基準        | チェック内容               |
| :--- | :---------- | :------------------------- |
| 風速 | 10 m/s 以下 | 現在の風速が運用基準内か   |
| 気温 | 0-40°C      | 機体の動作保証温度範囲内か |
| 視程 | 5 km 以上   | 目視飛行可能な視程があるか |
| 降水 | なし        | 雨、雪などの降水がないか   |

#### 空域確認項目

| 項目         | 確認内容                                               |
| :----------- | :----------------------------------------------------- |
| 緊急用務空域 | 消防、救急、警察などの緊急活動空域に該当しないか       |
| NOTAM        | 航空情報（Notice to Airmen）に抵触しないか             |
| TFR          | 一時的飛行制限（Temporary Flight Restriction）がないか |

#### データソース

- 気象データ: 気象庁API / OpenWeatherMap
- 空域データ: DIPS / NOTAM API

---

### 2. 機体状態タブ

機体とセンサーの動作状態を確認します。

#### 確認項目

| 項目           | 確認内容              | 基準                     |
| :------------- | :-------------------- | :----------------------- |
| GPS            | 衛星捕捉数、位置精度  | 10衛星以上、HDOP 2.0以下 |
| リモートID     | 登録状態、送信確認    | 有効かつ送信中           |
| センサー校正   | IMU、コンパス校正状態 | 校正済み                 |
| ファームウェア | バージョン、更新状態  | 最新版推奨               |

#### 機体リスト表示

各機体について以下の情報を表示：

- 機体名・ID
- バッテリー残量（%）
- GPS状態
- 信号強度
- 総合ステータス

---

### 3. 許可・資格タブ

飛行に必要な許可と資格の有効性を確認します。

#### 確認項目

| 項目     | 確認内容                             |
| :------- | :----------------------------------- |
| DIPS登録 | ドローン情報基盤システムへの登録状態 |
| 飛行許可 | 国土交通省の飛行許可・承認           |
| 保険     | 賠償責任保険の有効期限               |
| 操縦資格 | 操縦者の資格・技能証明               |

#### 必要書類

飛行エリアに応じて必要な許可書類：

| エリア区分          | 必要書類                   |
| :------------------ | :------------------------- |
| DID（人口集中地区） | 飛行許可書、登録記号       |
| 空港周辺            | 飛行許可書、NOTAM確認      |
| 150m以上            | 飛行許可書、航空局協議     |
| 夜間飛行            | 夜間飛行許可、補助者配置   |
| 目視外飛行          | 目視外飛行許可、補助者配置 |

---

### 4. デコンフリクションタブ

他の航空機やドローンとの干渉を確認します。

#### 確認内容

- **戦略的デコンフリクション**: 飛行計画段階での時空間分離
- **戦術的デコンフリクション**: 飛行中のリアルタイム回避

#### マップ表示

- 自機の飛行エリア（GeoJSONポリゴン）
- 他機の飛行予定エリア
- 干渉エリアのハイライト

#### 確認項目

| 項目       | 確認内容                         |
| :--------- | :------------------------------- |
| 時間帯重複 | 同一時間帯に他の飛行計画がないか |
| 空間重複   | 飛行エリアが他機と重複しないか   |
| 高度分離   | 垂直方向の分離が確保されているか |

---

### 5. クルー確認タブ

運航に関わるクルーの配置と連絡先を確認します。

#### 確認項目

| 役割       | 確認内容                     |
| :--------- | :--------------------------- |
| 操縦者     | 配置確認、資格有効性、連絡先 |
| 補助者     | 配置確認、位置情報、連絡先   |
| 安全管理者 | 配置確認、緊急時対応、連絡先 |
| 緊急連絡先 | 消防、警察、空港事務所など   |

#### クルーリスト

各クルーについて以下を表示：

- 氏名
- 役割
- 資格情報
- 連絡先
- 配置場所

---

## チェックリスト進捗

### 進捗計算

各タブの確認項目をすべてチェックすることで進捗が100%になります。

```typescript
interface ChecklistState {
  weather: {
    windSpeed: boolean
    temperature: boolean
    visibility: boolean
    precipitation: boolean
  }
  airspace: {
    emergencyAirspace: boolean
    notam: boolean
    tfr: boolean
  }
  aircraft: {
    gps: boolean
    remoteId: boolean
    calibration: boolean
    firmware: boolean
  }
  permits: {
    dips: boolean
    permission: boolean
    insurance: boolean
    qualification: boolean
  }
  deconfliction: {
    checked: boolean
  }
  crew: {
    pilot: boolean
    assistant: boolean
    safetyManager: boolean
    emergencyContacts: boolean
  }
}
```

### 飛行開始条件

すべてのチェック項目が完了すると「飛行監視を開始」ボタンが有効になります。

---

## API連携（予定）

### 気象API

```typescript
interface WeatherData {
  windSpeed: number // m/s
  windDirection: number // degrees
  temperature: number // Celsius
  visibility: number // km
  precipitation: boolean
  updatedAt: string // ISO8601
}
```

### 空域API

```typescript
interface AirspaceStatus {
  emergencyAirspace: {
    active: boolean
    areas: GeoJSON[]
  }
  notams: NotamEntry[]
  tfrs: TFREntry[]
}
```

### 機体状態API

```typescript
interface AircraftStatus {
  id: string
  name: string
  battery: number
  gps: {
    satellites: number
    hdop: number
    fix: boolean
  }
  remoteId: {
    registered: boolean
    transmitting: boolean
  }
  signal: number
}
```

---

## 関連ドキュメント

- [UTM要件定義書](./utm-requirements.md) - UTMプロトタイプの詳細要件
- [UTM実装ロードマップ](./utm-implementation-roadmap.md) - 段階的実装計画
- [運航監視フロー](./review-page-layout.md) - 画面遷移設計

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| :--------- | :--------- | :------- |
| 2025-02-01 | 1.0.0      | 初版作成 |
