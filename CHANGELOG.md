# Changelog

このファイルは、KDDI Smart Drone Platform UI Themeプロジェクトの主要な変更を記録します。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づいています。

## [Unreleased]

## [2026-02-01] - UI改善とバグ修正

### Added

#### スケジュールページ (`/schedule`)

- テーブルビューにフィルター機能を追加
  - 種別フィルター（点検/整備/飛行）
  - ステータスフィルター（予定/確認中/完了）
  - フィルター結果の件数表示
- テーブルビューにページネーション機能を追加
  - 10/25/50/100件表示の選択
  - 日本語ラベル対応
- 実際に動作するソート機能を実装
  - タイトルと日付でソート
  - 昇順/降順の切り替え

#### モニタリングページ (`/monitoring`)

- UTMEnhancedAlertPanelを統合
- アラートのサイトフィルタリング機能を追加
  - `droneIds`プロパティで特定ドローンのアラートのみ表示
  - マルチサイト環境で現在のサイトのドローンに絞り込み
- アラートクリック時のドローン自動選択機能

#### プロジェクトページ (`/project`)

- アコーディオン機能を追加
  - 「今日の予定」セクション
  - 「よく使うプロジェクト」セクション
- LocalStorageで開閉状態を永続化
  - リロード後も状態を保持
  - デフォルトで閉じた状態

#### ドキュメント

- [UI改善実装ログ](./docs/04-features/ui-improvements-2026-02.md)を追加
- [運航監視アラート機能ガイド](./docs/04-features/monitoring-alerts.md)を追加
- README.mdに最近の更新セクションを追加
- Storybookに新しいストーリーを追加
  - `FilteredByDrones`: ドローンフィルタリングの例
  - `SingleDroneFilter`: 単一ドローンフィルター

### Changed

#### スケジュールページ

- カレンダービューのレイアウトを最適化
  - Flexレイアウトを採用して余白を削除
  - 動的な高さ計算 (`calc(100vh - 240px)`)
  - MonthView/WeekView/DayViewで統一されたスクロール動作
- テーブルビューの高さを調整 (`calc(100vh - 380px)`)
- カードビューをスクロール対応に変更 (`calc(100vh - 280px)`)

#### UTMEnhancedAlertPanel

- フィルター行のレイアウトを改善
  - Selectコンポーネントに`flex: 1`を追加
  - 最小幅を100pxに統一
  - パディングとスペーシングを増加
  - アイコンサイズを16pxに統一

### Fixed

#### モニタリングページ

- 監視対象でない機体からアラートが表示される問題を修正
  - サイトフィルタリング機能により、現在のサイトのドローンのアラートのみを表示

#### UTMEnhancedAlertPanel

- フィルターUIのレイアウト崩れを修正
  - Selectの高さとパディングを調整
  - 均等幅の適用

### Updated

#### モックデータ

- 全モックデータの日付を2026-02に更新
  - `src/pages/SchedulePage.tsx`: スケジュールデータ
  - `src/pages/ProjectDetailPage.tsx`: プロジェクト作成日
  - `src/mocks/utmWorkflowMocks.ts`: NOTAM番号 (/24 → /26)
  - `src/mocks/utmMultiDroneScenarios.ts`: NOTAM参照

## アーキテクチャ変更

### 状態管理

- MonitoringSiteContextを活用したサイト別フィルタリング
- LocalStorageを使用したUI状態の永続化

### パフォーマンス最適化

- `useMemo`と`useCallback`を使用したレンダリング最適化
- フィルター・ソートロジックのメモ化

## 今後の予定

### スケジュールページ

- [ ] 日付範囲フィルター
- [ ] エクスポート機能（CSV、PDF）
- [ ] ドラッグ&ドロップでスケジュール編集

### モニタリングページ

- [ ] アラート音声通知
- [ ] アラート履歴のエクスポート
- [ ] カスタムアラートルールの設定

### プロジェクトページ

- [ ] プロジェクト検索機能
- [ ] バルク操作（複数選択・一括削除）
- [ ] カスタムビュー保存

---

## 凡例

- `Added`: 新機能
- `Changed`: 既存機能の変更
- `Deprecated`: 非推奨になった機能
- `Removed`: 削除された機能
- `Fixed`: バグ修正
- `Security`: セキュリティ関連の修正
- `Updated`: データやドキュメントの更新

[Unreleased]: https://github.com/kddi-smartdrone-dev/sdpf-theme/compare/v2026.02.01...HEAD
[2026-02-01]: https://github.com/kddi-smartdrone-dev/sdpf-theme/releases/tag/v2026.02.01
