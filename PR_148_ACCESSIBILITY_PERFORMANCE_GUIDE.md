# PR #148 アクセシビリティ・パフォーマンス監査ガイド

このドキュメントは、PR #148の実装に対するアクセシビリティとパフォーマンスの監査ガイドです。

## アクセシビリティ監査

### 1. ツールセットアップ

#### 1.1 axe DevTools（推奨）

**インストール**:

- [Chrome拡張](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd)
- [Firefox拡張](https://addons.mozilla.org/ja/firefox/addon/axe-devtools/)

**使用方法**:

1. 開発サーバーを起動: `pnpm dev`
2. 対象ページを開く
3. DevToolsを開く（F12）
4. axeタブを選択
5. 「Scan ALL of my page」をクリック

#### 1.2 Lighthouse

**使用方法**:

1. Chrome DevToolsを開く（F12）
2. Lighthouseタブを選択
3. カテゴリ: Accessibility, Performance, Best Practices, SEOを選択
4. 「Analyze page load」をクリック

### 2. 監査対象ページ

#### 2.1 プロジェクト一覧ページ

**URL**: `http://localhost:5173/#/project`

**axe DevTools チェック項目**:

- [ ] 重大な問題（Critical）: 0件
- [ ] 深刻な問題（Serious）: 0件
- [ ] 中程度の問題（Moderate）: 可能な限り0件
- [ ] 軽微な問題（Minor）: 許容範囲内

**Lighthouse目標スコア**:

- [ ] Accessibility: 95+
- [ ] Performance: 90+
- [ ] Best Practices: 95+

**手動チェック**:

- [ ] キーボードナビゲーション（Tab、Enter、Escape）
- [ ] 「今日の予定カード」のフォーカス管理
- [ ] スクリーンリーダーでの読み上げ（NVDA/JAWS）

#### 2.2 プロジェクト詳細ページ（Preflightタブ）

**URL**: `http://localhost:5173/#/project/multi-site-001?tab=preflight`

**axe DevTools チェック項目**:

- [ ] タブリストのARIAラベル
- [ ] サイトタブナビゲーションのアクセシビリティ
- [ ] フォーカスインジケーター
- [ ] 色のコントラスト比（WCAG AA基準）

**Lighthouse目標スコア**:

- [ ] Accessibility: 95+
- [ ] Performance: 85+ （複雑なコンポーネントのため）

**手動チェック**:

- [ ] タブ切り替えがキーボードで可能（矢印キー）
- [ ] サイト切り替えがキーボードで可能
- [ ] 「フライト開始」ボタンのフォーカス
- [ ] ステータスインジケーターの色以外の情報提供

#### 2.3 運航監視ページ

**URL**: `http://localhost:5173/#/monitoring/multi-site-001`

**axe DevTools チェック項目**:

- [ ] ヘッダーの見出しレベル（h1-h6）
- [ ] リスト項目のマークアップ
- [ ] ボタンのラベル
- [ ] テレメトリーデータのテーブルマークアップ

**Lighthouse目標スコア**:

- [ ] Accessibility: 90+
- [ ] Performance: 80+ （リアルタイムデータ想定）

**手動チェック**:

- [ ] ドローンリストのキーボードナビゲーション
- [ ] 「フライト完了」ボタンのフォーカス
- [ ] 動的コンテンツ更新時のスクリーンリーダー通知
- [ ] サイト切り替え時のフォーカス管理

#### 2.4 ポストフライトページ

**URL**: `http://localhost:5173/#/postflight/multi-site-001`

**axe DevTools チェック項目**:

- [ ] フォーム要素のラベル
- [ ] エラーメッセージのaria-live
- [ ] アコーディオンのARIA属性
- [ ] ファイルアップロードのアクセシビリティ

**Lighthouse目標スコア**:

- [ ] Accessibility: 95+
- [ ] Performance: 90+

**手動チェック**:

- [ ] フォーム入力のキーボード操作
- [ ] インシデント追加/削除のフォーカス管理
- [ ] バリデーションエラーの通知
- [ ] アコーディオン展開/折りたたみのキーボード操作
- [ ] 送信成功メッセージのスクリーンリーダー読み上げ

### 3. WCAG 2.1 AA準拠チェックリスト

#### 3.1 知覚可能（Perceivable）

- [ ] **1.1.1 非テキストコンテンツ**: すべての画像にalt属性
- [ ] **1.3.1 情報と関係性**: 適切な見出しレベル、ランドマーク
- [ ] **1.4.1 色の使用**: 色だけで情報を伝えない
- [ ] **1.4.3 コントラスト**: テキストコントラスト比4.5:1以上
- [ ] **1.4.11 非テキストのコントラスト**: UI要素3:1以上

#### 3.2 操作可能（Operable）

- [ ] **2.1.1 キーボード**: すべての機能をキーボードで操作可能
- [ ] **2.1.2 キーボードトラップなし**: フォーカスが閉じ込められない
- [ ] **2.4.1 ブロックスキップ**: スキップリンクまたはランドマーク
- [ ] **2.4.3 フォーカス順序**: 論理的なタブ順序
- [ ] **2.4.7 フォーカスの可視化**: フォーカスインジケーター表示

#### 3.3 理解可能（Understandable）

- [ ] **3.2.1 フォーカス時**: フォーカスで自動的なコンテキスト変更なし
- [ ] **3.2.2 入力時**: 入力で自動的な送信なし
- [ ] **3.3.1 エラーの特定**: エラー箇所を明示
- [ ] **3.3.2 ラベルまたは説明**: すべてのフォーム要素にラベル

#### 3.4 堅牢（Robust）

- [ ] **4.1.1 構文解析**: 有効なHTML
- [ ] **4.1.2 名前、役割、値**: 適切なARIA属性
- [ ] **4.1.3 ステータスメッセージ**: aria-liveでの通知

---

## パフォーマンス監査

### 1. Core Web Vitals目標値

| メトリクス                         | 目標値  | 許容値  |
| ---------------------------------- | ------- | ------- |
| **LCP** (Largest Contentful Paint) | < 2.5秒 | < 4.0秒 |
| **FID** (First Input Delay)        | < 100ms | < 300ms |
| **CLS** (Cumulative Layout Shift)  | < 0.1   | < 0.25  |
| **FCP** (First Contentful Paint)   | < 1.8秒 | < 3.0秒 |
| **TTI** (Time to Interactive)      | < 3.8秒 | < 7.3秒 |

### 2. Lighthouse Performance監査

#### 2.1 プロジェクト一覧ページ

**実施手順**:

1. シークレットウィンドウで開く
2. DevTools → Lighthouse
3. Performance, Accessibility, Best Practices, SEOを選択
4. 「Analyze page load」

**目標スコア**:

- [ ] Performance: 90+
- [ ] Accessibility: 95+
- [ ] Best Practices: 95+
- [ ] SEO: 90+

**チェック項目**:

- [ ] First Contentful Paint < 1.5秒
- [ ] Largest Contentful Paint < 2.5秒
- [ ] Total Blocking Time < 200ms
- [ ] Cumulative Layout Shift < 0.1

#### 2.2 運航監視ページ

**目標スコア**:

- [ ] Performance: 80+ （リアルタイム性のため緩和）
- [ ] Accessibility: 90+

**チェック項目**:

- [ ] Time to Interactive < 3秒
- [ ] JavaScript実行時間 < 2秒
- [ ] レンダリングブロックリソースなし

#### 2.3 ポストフライトページ

**目標スコア**:

- [ ] Performance: 90+
- [ ] Accessibility: 95+

**チェック項目**:

- [ ] フォーム入力のレスポンス < 50ms
- [ ] ファイルアップロードの進捗表示
- [ ] 送信処理の適切なローディング表示

### 3. バンドルサイズ分析

```bash
# ビルド
pnpm build

# バンドルサイズ確認
du -sh dist/assets/*.js | sort -h

# 期待値:
# - メインバンドル < 500KB (gzip後)
# - ベンダーバンドル < 300KB (gzip後)
```

**チェック項目**:

- [ ] コード分割が適切に動作している
- [ ] 使用していないコードが除去されている（Tree Shaking）
- [ ] 動的インポートが活用されている

### 4. メモリリーク検査

#### 4.1 Chrome DevTools Memory Profiler

**実施手順**:

1. 運航監視ページを開く
2. DevTools → Memory
3. 「Heap snapshot」を選択
4. 初回スナップショット取得
5. サイト切り替えを10回実行
6. 2回目のスナップショット取得
7. 「Comparison」ビューで比較

**チェック項目**:

- [ ] Detached DOM要素の増加なし
- [ ] イベントリスナーのリーク なし
- [ ] メモリ使用量が安定している

#### 4.2 長時間稼働テスト

**実施手順**:

1. 運航監視ページを開く
2. 10分間放置
3. サイト切り替えとドローン選択を繰り返す（100回）
4. メモリ使用量を記録

**期待結果**:

- [ ] メモリ増加 < 50MB
- [ ] ページがクラッシュしない
- [ ] UIレスポンスが維持される

### 5. ネットワークパフォーマンス

#### 5.1 スロットリング テスト

**DevTools設定**:

- Network: Fast 3G
- CPU: 4x slowdown

**チェック項目**:

- [ ] ページロード < 5秒
- [ ] インタラクション可能 < 7秒
- [ ] ローディング表示が適切

#### 5.2 キャッシュ戦略

**チェック項目**:

- [ ] 静的アセットに適切なCache-Controlヘッダー
- [ ] Service Workerの動作（該当する場合）
- [ ] 2回目以降のページロードが高速

---

## 実施記録

### アクセシビリティ監査結果

| ページ           | axe Issues        | Lighthouse Score | 手動チェック | 実施日     |
| ---------------- | ----------------- | ---------------- | ------------ | ---------- |
| プロジェクト一覧 | ** / ** / ** / ** | \_\_%            | ✓/✗          | **/**/\_\_ |
| プロジェクト詳細 | ** / ** / ** / ** | \_\_%            | ✓/✗          | **/**/\_\_ |
| 運航監視         | ** / ** / ** / ** | \_\_%            | ✓/✗          | **/**/\_\_ |
| ポストフライト   | ** / ** / ** / ** | \_\_%            | ✓/✗          | **/**/\_\_ |

_Critical / Serious / Moderate / Minor_

### パフォーマンス監査結果

| ページ           | Performance | LCP   | FID    | CLS  | 実施日     |
| ---------------- | ----------- | ----- | ------ | ---- | ---------- |
| プロジェクト一覧 | \_\_%       | \_\_s | \_\_ms | \_\_ | **/**/\_\_ |
| プロジェクト詳細 | \_\_%       | \_\_s | \_\_ms | \_\_ | **/**/\_\_ |
| 運航監視         | \_\_%       | \_\_s | \_\_ms | \_\_ | **/**/\_\_ |
| ポストフライト   | \_\_%       | \_\_s | \_\_ms | \_\_ | **/**/\_\_ |

### 発見された問題

| #   | カテゴリ | 重要度 | 内容 | 対応策 | 状態 |
| --- | -------- | ------ | ---- | ------ | ---- |
| 1   |          |        |      |        |      |
| 2   |          |        |      |        |      |
| 3   |          |        |      |        |      |

---

## 改善推奨事項

### 短期（リリース前に対応）

- [ ] Critical/Serious axe issuesの解決
- [ ] WCAG AA違反の修正
- [ ] Performance Score 80%未満の改善

### 中期（次のスプリント）

- [ ] Moderate axe issuesの対応
- [ ] パフォーマンス最適化（コード分割、遅延ロード）
- [ ] アクセシビリティドキュメント作成

### 長期（継続的改善）

- [ ] Minor issuesの対応
- [ ] WCAG AAA準拠検討
- [ ] 継続的なパフォーマンスモニタリング体制構築

---

## ツール参考リンク

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WCAG 2.1 ガイドライン](https://www.w3.org/WAI/WCAG21/quickref/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

---

## 承認

- [ ] アクセシビリティ監査完了
- [ ] パフォーマンス監査完了
- [ ] すべての問題が解決または文書化された
- [ ] リリース承認

**承認者**: **\*\***\_\_\_\_**\*\***
**承認日**: \_**\_年**月\_\_日
