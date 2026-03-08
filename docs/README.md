# プロジェクトドキュメント

このディレクトリには、KDDI Smart Drone Platform UI Theme プロジェクトの包括的なドキュメントが含まれています。

## ディレクトリ構造

```bash
docs/
├── 01-architecture/          # アーキテクチャ設計
├── 02-core-systems/          # コアシステム
├── 03-frontend/              # フロントエンド実装
├── 04-features/              # 機能仕様
├── 05-coding-rules/          # コーディングルール
└── 06-testing/               # テスト戦略
```

## 各セクションの説明

### [01-architecture](./01-architecture/)

- システムアーキテクチャの概要
- 技術スタックの選択理由
- 設計原則とパターン

### [02-core-systems](./02-core-systems/)

- コアシステムの実装詳細
- 共通ライブラリとユーティリティ
- 設定管理と環境変数

### [03-frontend](./03-frontend/)

- フロントエンド実装ガイド
- コンポーネント設計
- 状態管理とデータフロー

### [04-features](./04-features/)

- 機能仕様書
- ユーザーストーリー
- API仕様
- [飛行前準備機能](./04-features/preflight-check.md) - 飛行前チェック（Pre-Flight Check）機能の仕様
- [UTM要件定義書](./04-features/utm-requirements.md) - UTMプロトタイプの網羅的な要件定義
- [UTM実装ロードマップ](./04-features/utm-implementation-roadmap.md) - UTMプロトタイプの段階的な実装計画
- [運航監視フロー画面遷移図](./04-features/review-page-layout.md) - 運航監視フローの再検討案
- [UI改善実装ログ（2026年2月）](./04-features/ui-improvements-2026-02.md) - 最近のUI改善とバグ修正
- [運航監視アラート機能](./04-features/monitoring-alerts.md) - アラート機能の詳細ガイド

### [05-coding-rules](./05-coding-rules/)

- コーディングルールとベストプラクティス
- 型安全性のガイドライン
- コードレビューの基準

### [06-testing](./06-testing/)

- テスト戦略と実装
- テスト環境の構築
- カバレッジ目標

## ドキュメントの更新

新しいドキュメントを追加する際は、以下のガイドラインに従ってください：

1. **適切なディレクトリに配置**: 内容に応じて適切なセクションを選択
2. **Markdown形式**: 統一されたMarkdown形式で記述
3. **目次の更新**: このREADMEファイルの目次を更新
4. **リンクの確認**: 内部リンクが正しく動作することを確認

## 参考資料

- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Zenn: Claude Code のベストプラクティス](https://zenn.dev/n314/articles/de6e661dad4933)

---

**最終更新**: 2026年2月
