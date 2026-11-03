---
name: kaze-ds-review
description: 消費側リポジトリのコードを Kaze Design System のルールに照合してレビューする。違反 ID・根拠・修正案を返す
user_invocable: true
---

# kaze-ds-review

指定されたファイル・ディレクトリ・差分を Kaze Design System のルールに照合する。

## 使い方

```
/kaze-design:kaze-ds-review src/pages/SomePage.tsx
/kaze-design:kaze-ds-review   # 引数なし → 現在の git diff が対象
```

## 手順

1. 対象を決める。引数があればそのパス、なければ `git diff` の変更ファイル
   （`.tsx` / `.ts` のみ）
2. kaze MCP の `kaze://rules` リソースを読み、現行の禁止パターン一覧を取得する
   （**ルールをこのファイルに書き写さない**。常に最新をデータ層から引く）
3. 各ファイルを `check_rule` ツールに通し、機械判定可能な違反を収集する
4. 機械判定できない観点（ハードコード色値、DS 同等品の未使用など）は
   `kaze://rules` の表と `get_component` の仕様を根拠に目視で判定する
5. 結果を報告する:
   - 違反ごとに **ルール ID・該当行・理由・修正案（差分形式）**
   - 違反ゼロなら「準拠」とだけ述べる。褒め言葉や要約で水増ししない

## 判定の姿勢

- ルール表に無いものを独自基準で指摘しない（好みのレビューをしない）
- 確信が持てない指摘には「要確認」と明示する
- 修正案は必ずトークン参照・DS 部品を使った形で示す
