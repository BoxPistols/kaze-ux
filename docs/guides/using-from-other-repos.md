# 他リポジトリから Kaze Design System を使う（導入マニュアル）

このガイドは、**kaze-ux ではない別のリポジトリ**（プロダクト側）で AI エージェントに
Kaze Design System 準拠のコードを書かせたい人のための、通しの導入手順です。

- 想定読者: 消費側リポジトリの開発者。kaze-ux の内部構造を知らなくてよい
- 所要時間: ルート A なら 2 分、ルート B なら 5 分
- 仕組みの背景を知りたい場合: [`DESIGN.md`](../../DESIGN.md)

## 0. どちらのルートを選ぶか

| あなたの環境                     | 選ぶルート                     | 得られるもの                                          |
| -------------------------------- | ------------------------------ | ----------------------------------------------------- |
| Claude Code を使っている         | **ルート A（Plugin）**         | MCP + Skills + レビュー SubAgent + 自動 Hook 全部入り |
| Cursor / その他 MCP クライアント | **ルート B（.mcp.json 手動）** | MCP（トークン・部品仕様・ルール検証）のみ             |
| npm 公開後（Phase 2）            | ルート B の npm 版             | 設定 3 行のみ。clone も GitHub 権限も不要             |

**npm への公開は前提ではありません。** ルート A / B はどちらも GitHub だけで完結します。

---

## ルート A: Claude Code Plugin（推奨）

### A-1. インストール（2 コマンド）

消費側リポジトリで Claude Code を開き、次を実行します:

```
/plugin marketplace add BoxPistols/kaze-ux
/plugin install kaze-design@kaze-ux
```

1 行目でこのリポジトリを marketplace として登録し、2 行目で `kaze-design`
プラグインをインストールします。GitHub から取得するため、private リポジトリの
場合は **その人自身が kaze-ux への GitHub アクセス権を持っている**必要があります。

### A-2. 何が入るか

| 種類         | 名前                          | 働き                                                                      |
| ------------ | ----------------------------- | ------------------------------------------------------------------------- |
| MCP サーバー | `kaze`                        | トークン・部品仕様・ルールを供給（後述のツール 4 つ）                     |
| Skill        | `/kaze-design:kaze-ds-usage`  | UI を作るとき MCP のどのツールをいつ引くかを AI に教える                  |
| Skill        | `/kaze-design:kaze-ds-review` | 指定ファイル・差分を DS ルールに照合してレビュー                          |
| SubAgent     | `kaze-design-reviewer`        | 大きな UI 差分の DS 準拠審査を専任で実行                                  |
| Hook         | PostToolUse (Write\|Edit)     | AI がファイルを書くたびに禁止パターンを機械検査し、違反をその場で差し戻す |

データ（tokens / components / rules）もプラグインに同梱されているので、
**追加の設定・ビルド・ネットワークアクセスは不要**です。

### A-3. 動作確認

Claude Code で次を試します:

```
kaze の primary カラーは？          → get_token が #0057B8 を返せば OK
/kaze-design:kaze-ds-review         → 現在の差分がレビューされれば OK
```

MCP の接続状態は `/mcp` コマンドでも確認できます（`kaze` が connected なら正常）。

### A-4. 日常の使い方

普通に UI 実装を依頼するだけです。Skills と Hook が裏で効きます:

- 「ユーザー一覧画面を作って」→ AI が `search` / `get_component` で部品仕様を
  引いてから書き、Hook が違反を自動で差し戻します
- 「この画面、DS 準拠かレビューして」→ `kaze-design-reviewer` SubAgent が
  違反 ID・該当行・修正案だけを返します

### A-5. 更新とアンインストール

- 更新: `/plugin marketplace update kaze-ux`（kaze-ux 側の main が反映されます。
  ルール・トークンの更新もこれだけで届きます）
- 削除: `/plugin uninstall kaze-design@kaze-ux`

### A-6. 定着させる（推奨・1 行）

消費側リポジトリの `CLAUDE.md` に 1 行足すと、参照が「習慣」ではなく「既定」になります:

```markdown
UI の実装・変更時は kaze MCP（get_token / get_component / check_rule）を参照すること
```

---

## ルート B: MCP を手動登録（Cursor・汎用）

Plugin は Claude Code 専用機能のため、Cursor などでは MCP サーバーだけを登録します。
Skills / SubAgent / Hook は入りませんが、知識供給（トークン・仕様・ルール検証）は
同じものが使えます。

### B-1. kaze-ux を手元に置く

```bash
git clone https://github.com/BoxPistols/kaze-ux.git ~/repos/kaze-ux
```

ビルドは不要です（tsx がソースから直接起動します）。

### B-2. MCP を登録する

**Claude Code の場合** — 消費側リポジトリの `.mcp.json`:

```json
{
  "mcpServers": {
    "kaze": {
      "command": "npx",
      "args": ["-y", "tsx", "/absolute/path/to/kaze-ux/mcp/src/index.ts"]
    }
  }
}
```

**Cursor の場合** — 消費側リポジトリの `.cursor/mcp.json`（同じ中身）。
Cursor の Settings → MCP で `kaze` が緑になれば接続完了です。

パスは**絶対パス**で書いてください。チームで共有する場合は各自の clone 位置が
違うため、`~/repos/kaze-ux` のような置き場所の規約を README に書いておくと安全です。

### B-3. 動作確認

エージェントに「kaze の `color.light.primary.main` を引いて」と頼み、
`#0057B8` が返れば接続できています。

---

## npm 公開後（Phase 2）はこうなる

`kaze-mcp` が npm に公開されると、ルート B は clone 不要・3 行になります:

```json
{
  "mcpServers": {
    "kaze": { "command": "npx", "args": ["-y", "kaze-mcp"] }
  }
}
```

公開手順（メンテナ向け）は [`npm-publishing.md`](npm-publishing.md) を参照。

---

## 提供されるツール・リソース（リファレンス）

| ツール          | 引数              | 返すもの                                               |
| --------------- | ----------------- | ------------------------------------------------------ |
| `get_token`     | `path`            | トークン値。例: `color.light.primary.main` → `#0057B8` |
| `get_component` | `name`            | 部品仕様（props / a11y / import / story）              |
| `check_rule`    | `code`            | 違反した禁止パターンの ID・理由                        |
| `search`        | `query`, `scope?` | トークン・部品の横断検索                               |

| リソース            | 内容                  |
| ------------------- | --------------------- |
| `kaze://tokens`     | W3C DTCG トークン全体 |
| `kaze://components` | 部品メタデータ全体    |
| `kaze://rules`      | 禁止パターン表全体    |

## トラブルシューティング

| 症状                                   | 原因と対処                                                                                                                                     |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `/plugin marketplace add` が失敗する   | GitHub の認証切れか、kaze-ux へのアクセス権が無い。`gh auth status` 等で確認                                                                   |
| MCP `kaze` が接続されない（ルート B）  | パスが相対 or typo。絶対パスにする。初回は `npx` が tsx を取得するためネットワークが必要                                                       |
| ツールは動くが結果が空                 | `DS_ROOT` を独自設定している場合、参照先に tokens.json 等が無い。環境変数を外すか正しいルートを指す                                            |
| Hook が反応しない                      | Hook は Plugin（ルート A）限定。ルート B では入らない。また対象は `.ts` / `.tsx` のみで、`.stories.*` / `.config.*` / `.d.ts` は意図的に対象外 |
| 違反していないのに Hook に差し戻される | 検出ルールは kaze-ux の `scripts/lib/ds-rules.mjs` が単一ソース。誤検出と思われる場合は kaze-ux に Issue を立てる（消費側で握りつぶさない）    |

## よくある質問

**Q. npm パッケージの「申請」は必要？**
不要です。npm に審査手続きは無く、そもそもルート A / B は npm を使いません。
npm 公開（Phase 2）は導入体験を 3 行に縮めるための任意の改善です。

**Q. デザインシステム本体（React コンポーネント）も npm から import できる？**
この仕組みが配るのは「知識」（トークン・仕様・ルール）です。コンポーネント実体の
パッケージ配布は別トラックで、現状はモノレポ内 `workspace:*` 参照です。

**Q. 社外に見せられる？**
MCP は stdio + ローカルファイル読みのみで、ネットワークに何も送りません。
公開するかどうかはリポジトリ / npm の公開設定だけの問題です。
