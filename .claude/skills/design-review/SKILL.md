---
name: design-review
description: Kaze Design System 準拠チェック。コード/ファイルを DS ルールに照合し、違反を検出・修正提案する
user_invocable: true
---

# /design-review

指定されたファイルまたはコードスニペットを Kaze Design System のルールに照合し、違反を検出する。

## 使い方

```
/design-review src/pages/SomePage.tsx
/design-review src/components/ui/NewComponent.tsx
```

## 手順

1. 対象ファイルを読み込む
2. `foundations/prohibited.md` の禁止パターン一覧を参照する
3. `metadata/components.json` のコンポーネント仕様を参照する
4. 以下のカテゴリで違反をチェックする:
   - **コンポーネント**: React.FC 使用、旧 Grid API、export default 等
   - **カラー**: ハードコード色値、text-black 等
   - **タイポグラフィ**: px 直書き、非標準フォント
   - **スペーシング**: 奇数 px、gap 直接指定
   - **レイアウト**: position:fixed、z-index 任意値
   - **アクセシビリティ**: aria-label 欠如、alt なし、outline:none
   - **AI 生成パターン**: カラーバー装飾、過度なグラデーション
5. 違反を重大度で分類する:
   - **Critical**: アクセシビリティ違反、React.FC 使用
   - **Major**: ハードコード色値、旧 API 使用
   - **Minor**: スペーシング、命名規則
   - **Info**: 推奨事項
6. `references/report-template.md` の形式でレポートを出力する

## 参照ファイル

- `foundations/prohibited.md`: 禁止パターン SSOT
- `metadata/components.json`: コンポーネント仕様
- `references/checklist.md`: チェック項目一覧
- `references/severity.md`: 重大度ルール
- `references/report-template.md`: レポートテンプレート
