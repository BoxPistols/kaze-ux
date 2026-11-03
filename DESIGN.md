# DESIGN.md — Kaze Design System 横断アーキテクチャ

Kaze Design System の知識・ルール・部品を、**このリポジトリの外にあるプロダクトや
リポジトリでも一貫して機能させる**ための仕組みの単一ソース。

> 人の注意力に頼らず、仕組みで完結させる。
> **知識はデータに、強制は仕組みに、コードは最低限に。**

- **運用モデル（人の役割）**: [`docs/operating-model.md`](docs/operating-model.md)（誰が何を決め、AI に何をさせるか）
- **Figma ワークフロー**: [`docs/figma-workflow.md`](docs/figma-workflow.md)（code → design で キャンバスを動かす手順）
- 個別計画: [`docs/plans/mcp-release.md`](docs/plans/mcp-release.md)（MCP 版リリースの要件定義・詳細設計）
- 導入マニュアル: [`docs/guides/using-from-other-repos.md`](docs/guides/using-from-other-repos.md)（消費側） / [`docs/guides/npm-publishing.md`](docs/guides/npm-publishing.md)（npm / MCP Registry 公開） / [`docs/guides/going-public.md`](docs/guides/going-public.md)（公開と流布）
- リポジトリ内の開発規約: [`CLAUDE.md`](CLAUDE.md) / [`AI_DEVELOPMENT_RULES.md`](AI_DEVELOPMENT_RULES.md)

## 1. 全体図

```
┌────────────────────── 消費側リポジトリ（プロダクト）──────────────────────┐
│                                                                          │
│  Claude Code / Cursor / 任意の MCP クライアント                           │
│    │                                                                     │
│    │  /plugin install kaze-design@kaze-ux     ← 1 コマンドで下の全部が入る │
│    ▼                                                                     │
│  ┌─ Claude Code Plugin: kaze-design ─────────────────────────────┐       │
│  │ Skills   skills/            使い方の知識（いつ何を参照するか） │       │
│  │ SubAgent agents/            DS 準拠レビューの専任エージェント  │       │
│  │ Hooks    hooks/             編集のたびに禁止パターンを機械検査 │       │
│  │ MCP      .mcp.json          ↓ の kaze サーバーを自動起動       │       │
│  └───────────────────────────────────────────────────────────────┘       │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │ stdio（ネットワーク不要）
┌──────────────────────────────▼───────────────────────────────────────────┐
│ MCP サーバー mcp/（thin server: データを読むだけ）                        │
│   tools:     get_token / get_component / check_rule / search             │
│   resources: kaze://tokens / kaze://components / kaze://rules            │
├──────────────────────────────────────────────────────────────────────────┤
│ データ層 = 単一ソース（すべて生成物。手で編集しない）                     │
│   design-tokens/tokens.json    ← pnpm export-tokens   （W3C DTCG）       │
│   metadata/components.json     ← pnpm export-metadata （story が正）     │
│   foundations/prohibited.md    ← pnpm export-rules    （ds-rules.mjs が正）│
└──────────────────────────────────────────────────────────────────────────┘
```

役割分担の原則:

| レイヤ   | 責務                                 | 変更するとき                                              |
| -------- | ------------------------------------ | --------------------------------------------------------- |
| データ層 | 何が正しいか（トークン・仕様・禁止） | `scripts/lib/ds-rules.mjs` / theme / story を直して再生成 |
| MCP      | 知識をエージェントに**供給**する     | 原則変更しない。データ拡張で解決できないときのみ          |
| Skills   | 知識を**いつ・どう使うか**を教える   | 手順・判断基準が変わったとき                              |
| Hooks    | 違反を**機械的に止める**             | 機械判定できるルールが増えたとき                          |
| SubAgent | 文脈を汚さず**まとめて審査**する     | レビュー観点が変わったとき                                |
| Plugin   | 上記を**1 コマンドで配る**           | 配布物の構成が変わったとき                                |

## 2. データ層（単一ソース）

| ファイル                    | 内容                                                      | 生成コマンド           | 元データ                                 |
| --------------------------- | --------------------------------------------------------- | ---------------------- | ---------------------------------------- |
| `design-tokens/tokens.json` | W3C DTCG トークン（色 6 テーマ・タイポ・spacing・radius） | `pnpm export-tokens`   | `src/themes/`                            |
| `metadata/components.json`  | 全コンポーネントの props / a11y / import / story          | `pnpm export-metadata` | `src/stories/` + `metadata/curated.json` |
| `foundations/prohibited.md` | 禁止パターン表（ID・代替・強制手段）                      | `pnpm export-rules`    | `scripts/lib/ds-rules.mjs`               |

**ルールを 1 つ追加すると**: `ds-rules.mjs` → `export-rules` → prohibited.md →
MCP `check_rule` / `kaze://rules` → Plugin hook → 消費側リポジトリ、まで自動で届く。
これがこのアーキテクチャの核。**同じ知識を 2 箇所に書いた時点で設計違反**。

## 3. 強制層（このリポジトリ内）

| 手段                             | 止めるもの                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------- |
| ESLint `kaze/ds-first`（error）  | DS に同等品がある MUI 部品の直 import（対応表: `scripts/ds-equivalents.mjs`） |
| ESLint `kaze/named-exports-only` | `export default`                                                              |
| Prettier（pre-commit / CI）      | セミコロン・ダブルクォート                                                    |
| `.husky/pre-commit`              | `React.FC`                                                                    |
| CI `quality-check.yml`           | `check:rules` / `check:skills` / `check:mcp` / `any` 型                       |
| `pnpm ds:adoption --strict`      | DS 準拠率の後退                                                               |

消費側リポジトリではこれらの代わりに **Plugin の Hook（§6.3）** が最前線になる。

## 4. MCP サーバー（配布の中核）

`mcp/` = `kaze-mcp`。stdio・ローカルファイル読みのみ・ネットワーク不要。

| ツール          | 用途                                         | 例                          |
| --------------- | -------------------------------------------- | --------------------------- |
| `get_token`     | トークンをドットパスで取得                   | `color.light.primary.main`  |
| `get_component` | コンポーネント仕様（props / a11y / import）  | `button`, `customTextField` |
| `check_rule`    | コード片を禁止パターンに照合し違反 ID を返す | 生成コードのセルフチェック  |
| `search`        | トークン・コンポーネント横断検索             | `"日付入力"`                |

| リソース            | 内容                         |
| ------------------- | ---------------------------- |
| `kaze://tokens`     | tokens.json 全体（W3C DTCG） |
| `kaze://components` | components.json 全体         |
| `kaze://rules`      | prohibited.md 全体           |

### 4.1 導入（消費側リポジトリの `.mcp.json`）

```jsonc
// リポジトリを clone / plugin で持っている場合（今すぐ動く）
{
  "mcpServers": {
    "kaze": {
      "command": "npx",
      "args": ["-y", "tsx", "<kaze-ux へのパス>/mcp/src/index.ts"],
    },
  },
}
```

npm 公開後は `"args": ["-y", "kaze-mcp"]` に置き換わる。配布物にはデータが
同梱される（`prepack` → `scripts/sync-mcp-data.mjs`）ので、npm 経由でも
リポジトリ無しで動く。手順は
[`docs/guides/npm-publishing.md`](docs/guides/npm-publishing.md)。

### 4.2 他のデザインシステムへの転用

サーバーは kaze 専用ではない。同じ形式のデータを置き、環境変数で差し替える:

| 環境変数             | 既定                        |
| -------------------- | --------------------------- |
| `DS_ROOT`            | リポジトリルート            |
| `DS_TOKENS_PATH`     | `design-tokens/tokens.json` |
| `DS_COMPONENTS_PATH` | `metadata/components.json`  |
| `DS_RULES_PATH`      | `foundations/prohibited.md` |

## 5. 知識層（Skills）

### 5.1 リポジトリ内作業用 — `.claude/skills/`（配布しない）

| Skill              | 役割                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| `kaze-design`      | デザイン原則。品質の下限と AI 定型スタイルの排除（プロジェクト非依存） |
| `design-review`    | このリポジトリのファイルを DS ルールに照合                             |
| `create-component` | DS 準拠の新コンポーネント scaffold                                     |
| `sync-tokens`      | 生成物の再生成と検査                                                   |
| `analytics-setup`  | 計測設置手順                                                           |

### 5.2 配布用 — `skills/`（Plugin に同梱、消費側視点）

| Skill            | 役割                                                          |
| ---------------- | ------------------------------------------------------------- |
| `kaze-ds-usage`  | 消費側で UI を作るとき、MCP のどのツールをいつ引くか          |
| `kaze-ds-review` | 消費側のコードを `check_rule` + `kaze://rules` で審査する手順 |

**配布用 Skill はルールの中身を書かない。** ルールは MCP 経由でデータ層から
取得させる（重複 = 陳腐化の起点）。Skill が持つのは手順と判断基準だけ。

## 6. Plugin 層（1 コマンド配布）

このリポジトリ自体が Plugin かつ Marketplace。

```
kaze-ux/
├── .claude-plugin/
│   ├── plugin.json        # Plugin 本体（name: kaze-design）
│   └── marketplace.json   # このリポジトリを marketplace 化
├── skills/                # 配布用 Skills（§5.2）
├── agents/                # SubAgent（§7）
├── hooks/                 # Hook 定義 + 検査スクリプト（§6.3）
├── .mcp.json              # ローカル開発と Plugin 配布で共用（§6.2）
└── .claude/skills/        # リポジトリ内作業用（配布対象外の扱い、§5.1）
```

### 6.1 導入手順（消費側）

```
/plugin marketplace add boxpistols/kaze-ux
/plugin install kaze-design@kaze-ux
```

これで MCP サーバー・Skills（`/kaze-design:kaze-ds-usage` 等の名前空間付き）・
SubAgent・Hook がすべて入る。個別導入（MCP だけ欲しい）は §4.1。

### 6.2 MCP の共用トリック

`.mcp.json` は `${CLAUDE_PLUGIN_ROOT:-.}` でパスを解決する。
ローカル開発では `.`（リポジトリルート）、Plugin として配布されたときは
インストール先の Plugin ルートに解決され、**同じ 1 ファイルが両方で動く**。

### 6.3 Hook（消費側の最前線ガード）

`hooks/hooks.json` — `PostToolUse`（`Write|Edit`）で
`hooks/check-prohibited.mjs` を起動し、編集されたファイルを機械判定可能な
禁止パターン（React.FC / 旧 Grid API / window.confirm 等）に照合。
違反があれば exit 2 + stderr でエージェントに差し戻し、**その場で自己修正**させる。

判定ロジックは `check:rules` と同じ思想の最小サブセット。ルールの正は
あくまでデータ層で、Hook は「即時性が要る違反だけを早く止める」役。

## 7. SubAgent（kaze-design-reviewer）

`agents/kaze-design-reviewer.md`。消費側で「この画面 DS 準拠かレビューして」
と言われたときに呼ばれる専任エージェント。

- kaze MCP（`check_rule` / `get_component` / `kaze://rules`）を使って審査
- メイン会話の文脈を汚さず、違反 ID・根拠・修正案だけを返す
- 大きな UI 差分では自動委譲される（description に発火条件を記述）

## 8. 消費側リポジトリの導入 3 段階

| 段階   | 入れるもの                                       | 得られるもの                               |
| ------ | ------------------------------------------------ | ------------------------------------------ |
| Tier 1 | `.mcp.json` に kaze を登録                       | エージェントが正しいトークン・仕様を引ける |
| Tier 2 | + Plugin install                                 | Skills / SubAgent / Hook（自動ガード）まで |
| Tier 3 | + `CLAUDE.md` に「UI は kaze MCP を参照」と 1 行 | 参照が習慣ではなく既定になる               |

## 9. 拡張の判断表（どこに足すか）

| 足したいもの         | 置き場所                                                 | やってはいけないこと              |
| -------------------- | -------------------------------------------------------- | --------------------------------- |
| 新しい禁止ルール     | `scripts/lib/ds-rules.mjs` → `pnpm export-rules`         | prohibited.md や Skill に直書き   |
| 新トークン           | `src/themes/` → `pnpm export-tokens`                     | tokens.json を手編集              |
| 新コンポーネント仕様 | story + `metadata/curated.json` → `pnpm export-metadata` | components.json を手編集          |
| 新しい使い方の手順   | `skills/`（配布用）or `.claude/skills/`（内部用）        | MCP サーバーへのコード追加        |
| 新しい機械検査       | `hooks/check-prohibited.mjs` + `scripts/`                | ESLint で書けるものを Hook に書く |
| MCP 新ツール         | 最終手段。まずデータ拡張で解決できないか検討             | —                                 |

## 10. 流布（見つけてもらう）

作っただけでは使われない。**置き場所を用意して初めて発見される。**

| 段階       | 何を用意するか             | 置き場所                                                                 |
| ---------- | -------------------------- | ------------------------------------------------------------------------ |
| 見つかる   | パッケージとカタログ登録   | npm（`kaze-mcp`）→ MCP Registry（`io.github.boxpistols/kaze-mcp`）       |
| わかる     | 30 秒で何かが伝わる説明    | README 冒頭（英語）/ LP の MCP セクション / Storybook `Guide/MCP Server` |
| 試せる     | 迷わず 1 回動かせる手順    | [`using-from-other-repos.md`](docs/guides/using-from-other-repos.md)     |
| 使い続ける | 古びていないと外から分かる | CI の検査 + リリース                                                     |

MCP Registry は**メタデータしか持たない**ので、npm 公開が先。順序と手順は
[`going-public.md`](docs/guides/going-public.md)。

配布の導線には必ず owner が出る（`/plugin marketplace add <owner>/<repo>`、
`io.github.<owner>/`）。そのため `check:anon` が守る範囲は「個人に届く情報」
（メール・実名・ローカルパス）で、**リポジトリの公開名義は通す**。

## 11. 検証

| コマンド                    | 保証すること                                 |
| --------------------------- | -------------------------------------------- |
| `pnpm check:mcp`            | MCP サーバーが実起動し tools/call まで答える |
| `pnpm check:skills`         | Skills の frontmatter / 構文                 |
| `pnpm check:rules`          | 禁止パターン違反の実数                       |
| `pnpm ds:adoption --strict` | DS ファースト準拠率                          |
| CI `quality-check.yml`      | 上記すべて + any 型 grep                     |
