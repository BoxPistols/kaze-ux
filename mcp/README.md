# kaze-mcp — Kaze Design System MCP Server

Kaze Design System の設計知識（デザイントークン・コンポーネント仕様・禁止ルール）を
MCP (Model Context Protocol) で AI エージェントに供給するサーバー。

- stdio・ローカルファイル読みのみ。**ネットワーク不要、データを外に出さない**
- thin server 設計。知識はすべてデータ（生成物）側にあり、コードは読むだけ
- 横断アーキテクチャ全体は [`DESIGN.md`](../DESIGN.md) を参照

## Quick Start

### Claude Code（このリポジトリ / clone がある場合）

`.mcp.json`（リポジトリ同梱、そのまま動く）:

```jsonc
{
  "mcpServers": {
    "kaze": {
      "command": "npx",
      "args": ["-y", "tsx", "${CLAUDE_PLUGIN_ROOT:-.}/mcp/src/index.ts"],
      "env": { "DS_ROOT": "${CLAUDE_PLUGIN_ROOT:-.}" },
    },
  },
}
```

`${CLAUDE_PLUGIN_ROOT:-.}` はローカル開発ではリポジトリルート、
Claude Code Plugin として配布されたときはインストール先に解決される。
**同じ 1 ファイルが両方の文脈で動く。**

### Claude Code Plugin（消費側リポジトリに一括導入）

```
/plugin marketplace add boxpistols/kaze-ux
/plugin install kaze-design@kaze-ux
```

MCP に加えて Skills / SubAgent / Hook も入る。詳細は [`DESIGN.md`](../DESIGN.md) §6。

### 別リポジトリから clone 参照で使う

```jsonc
{
  "mcpServers": {
    "kaze": {
      "command": "npx",
      "args": ["-y", "tsx", "/path/to/kaze-ux/mcp/src/index.ts"],
    },
  },
}
```

### npm（Phase 2 / 公開後）

```jsonc
{
  "mcpServers": {
    "kaze": { "command": "npx", "args": ["-y", "kaze-mcp"] },
  },
}
```

> 注: npm 配布時はデータ（tokens / components / rules）の同梱が必要。
> 公開前チェックリストは [`docs/plans/mcp-release.md`](../docs/plans/mcp-release.md) を参照。

## Tools

| ツール          | 引数                 | 返すもの                                               |
| --------------- | -------------------- | ------------------------------------------------------ |
| `get_token`     | `path`（ドットパス） | トークン値。例: `color.light.primary.main` → `#0057B8` |
| `get_component` | `name`（camelCase）  | props / a11y / import / story などの仕様               |
| `check_rule`    | `code`（スニペット） | 違反した禁止パターンの ID・理由                        |
| `search`        | `query`, `scope?`    | トークン・コンポーネントの横断検索結果                 |

## Resources

| URI                 | 内容                                    |
| ------------------- | --------------------------------------- |
| `kaze://tokens`     | `design-tokens/tokens.json`（W3C DTCG） |
| `kaze://components` | `metadata/components.json`              |
| `kaze://rules`      | `foundations/prohibited.md`             |

## 他のデザインシステムで使う

サーバーは kaze 専用ではない。同じ形式のファイルを置けば動く:

| 環境変数             | 既定                        | 中身                      |
| -------------------- | --------------------------- | ------------------------- |
| `DS_ROOT`            | リポジトリルート            | 下 3 つの基準ディレクトリ |
| `DS_TOKENS_PATH`     | `design-tokens/tokens.json` | W3C DTCG トークン         |
| `DS_COMPONENTS_PATH` | `metadata/components.json`  | 部品メタデータ            |
| `DS_RULES_PATH`      | `foundations/prohibited.md` | 禁止パターン表            |

## 開発

```bash
pnpm --filter kaze-mcp build   # tsc → dist/
pnpm --filter kaze-mcp test    # vitest
pnpm check:mcp                 # 実起動して initialize → tools/call まで検証
```

データを更新したら再生成する（サーバー側の変更は不要）:

```bash
pnpm export-tokens && pnpm export-metadata && pnpm export-rules
```
