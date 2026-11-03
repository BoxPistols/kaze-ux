---
name: kaze-ds-usage
description: Kaze Design System を使って UI を作るときの手順。トークン・コンポーネント仕様・ルールは kaze MCP から取得する（消費側リポジトリ向け）
user_invocable: true
---

# kaze-ds-usage

消費側リポジトリで UI を新規作成・変更するときに読む。

**このスキルはルールの中身を持たない。** ルール・トークン・仕様の正は
kaze MCP サーバーの向こう側（データ層）にあり、ここには
「いつ・何を引くか」だけが書いてある。

## 手順

1. **書く前に引く。** 想像でトークンや props を書かない
   - 色・余白・角丸が要る → `get_token`（例: `color.light.primary.main`）
   - 使う部品を決める → `search`（例: `"日付入力"`）→ `get_component` で props / import を確認
   - 迷ったら `kaze://rules` リソースで禁止パターンを一読する
2. **DS ファースト。** MUI 素の部品より kaze の同等品を優先する
   （`TextField` ではなく `CustomTextField` 等。`get_component` の `import` が正）。
   `Box` / `Grid` / `Stack` / `Typography` などレイアウト原始要素は直接使ってよい
3. **書いたら照合する。** 生成・編集したコードを `check_rule` に通し、
   違反 ID が返ったら理由に従ってその場で直す
4. **色値・px 値のハードコードをしない。** 必ずトークン参照
   （MUI: `primary.main` / Tailwind: `var(--color-*)`）

## 大きな UI 差分のとき

画面単位の新規実装やリファクタでは、`kaze-design-reviewer` SubAgent に
まとめて審査を依頼する（違反 ID・根拠・修正案が返る）。

## この仕組み自体を知りたいとき

アーキテクチャ全体（データ層 / MCP / Skills / Hook / SubAgent の役割分担）は
リポジトリの `DESIGN.md` を参照。
