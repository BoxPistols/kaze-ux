# kaze-mcp を npm に公開する（メンテナ向け手順）

`kaze-mcp` を npm に公開すると、消費側の導入が `.mcp.json` 3 行
（`npx -y kaze-mcp`）になり、clone も GitHub アクセス権も不要になります。

- **公開は必須ではありません。** Plugin / clone 参照だけで全機能が使えます
  （[`using-from-other-repos.md`](using-from-other-repos.md)）
- 公開する価値があるのは: 社外・不特定の利用者に配りたいとき、
  uber.design/base-mcp のような「公開デザインシステム」を目指すとき

## 0. 前提知識

- npm に**審査・申請の手続きはありません**。名前が空いていれば誰でも公開できます
- パッケージ名 `kaze-mcp` は 2026-08 時点で未取得を確認済み。ただし早い者勝ちなので、
  公開の意思があるなら先に確保することを推奨します
- 一度 publish したバージョンは削除しても再利用できません（unpublish 制約）。
  最初は `0.x` で出すのが安全です

## 1. 事前準備（アカウント）

1. [npmjs.com](https://www.npmjs.com/) のアカウントを作成（無料）
2. 2FA を有効化（Settings → Two-Factor Authentication。publish には 2FA 推奨）
3. ローカルでログイン:

```bash
npm login
npm whoami   # ユーザー名が出れば OK
```

4. 名前の空き確認（404 なら空いている）:

```bash
npm view kaze-mcp   # → 404 なら未取得
```

## 2. 公開前の必須課題: データ同梱

**現状の配布物（`files: ["dist"]`）にはデータ層のファイルが入りません。**
サーバーは `design-tokens/tokens.json` 等をリポジトリルートから読む設計のため、
npm キャッシュから起動した `npx kaze-mcp` はデータを見つけられず空を返します。

公開前に次の対応が必要です:

1. `mcp/data/` に 3 ファイルを同梱する
   - `tokens.json` ← `design-tokens/tokens.json`
   - `components.json` ← `metadata/components.json`
   - `prohibited.md` ← `foundations/prohibited.md`
2. `mcp/src/utils/loader.ts` の既定パス解決にフォールバックを足す:
   「`DS_ROOT` 基準で見つからなければ、パッケージ内 `data/` を読む」
3. `mcp/package.json` の `files` に `"data"` を追加
4. コピーを `prepublishOnly` に組み込み、鮮度を保証する:

```jsonc
// mcp/package.json（イメージ）
"scripts": {
  "sync-data": "node ../scripts/sync-mcp-data.mjs", // ルートの生成物を data/ へコピー
  "prepublishOnly": "pnpm sync-data && pnpm build"
}
```

> 設計原則との整合: `data/` は**コピーであって第 2 の編集場所ではない**。
> 手で編集せず、必ず生成物からコピーする。コピー漏れは `check:mcp` 型の
> 検査（pack した tarball を実起動して 1 件引く）で検出するのが望ましい。

## 3. 公開手順

```bash
cd mcp

# 1) 内容物の最終確認（tarball に dist/ と data/ が入っているか目視）
npm pack --dry-run

# 2) 公開（スコープ無しパッケージは --access 指定不要だが明示しておく）
npm publish --access public

# 3) 確認
npm view kaze-mcp version
npx -y kaze-mcp   # 消費側と同じ方法で起動確認（stderr に起動ログが出る）
```

バージョンは [Semantic Versioning](https://semver.org/lang/ja/) に従います:

- データだけの更新（トークン・ルール追加）→ patch (`0.2.x`)
- ツール・リソースの追加 → minor (`0.x.0`)
- ツールの引数・返却形式の破壊的変更 → major

## 4. 公開後にやること

| 対象                                    | 変更                                                                         |
| --------------------------------------- | ---------------------------------------------------------------------------- |
| `mcp/README.md`                         | npm セクションの「Phase 2 / 公開後」表記を外し、npm 版を先頭の推奨手順にする |
| `DESIGN.md` §4.1                        | 導入スニペットを `"args": ["-y", "kaze-mcp"]` に更新                         |
| Storybook `Guide/MCP Server`            | Quick Start のスニペットを npm 版に差し替え                                  |
| `docs/guides/using-from-other-repos.md` | ルート B を npm 版に更新                                                     |
| GitHub Release                          | `kaze-mcp@x.y.z` のタグとリリースノート（任意だが推奨）                      |

## 5. 継続運用

- **リリースの起点はデータ更新。** ルール・トークン・部品仕様が変わったら
  `pnpm export-rules` 等で生成物を更新 → `mcp/` のバージョンを上げて publish
- 自動化する場合は `.github/workflows/publish.yml` に kaze-mcp のジョブを足し、
  `NPM_TOKEN`（Automation token）を GitHub Secrets に設定する。手動運用で
  困っていないうちは急がなくてよい

## 6. チェックリスト（公開直前に見る）

- [ ] `npm view kaze-mcp` が 404（初回のみ）
- [ ] `mcp/data/` が最新の生成物と一致（`prepublishOnly` で自動コピー）
- [ ] `npm pack --dry-run` に `dist/` と `data/` が含まれる
- [ ] pack した tarball からの起動で `get_component` が空でない結果を返す
- [ ] `pnpm check:mcp` / `pnpm --filter kaze-mcp build` が通る
- [ ] バージョンを適切に上げた（`mcp/package.json`）
