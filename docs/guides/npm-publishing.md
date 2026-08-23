# kaze-mcp を npm に公開する（メンテナ向け手順）

`kaze-mcp` を npm に公開すると、消費側の導入が `.mcp.json` 3 行
（`npx -y kaze-mcp`）になり、clone も GitHub アクセス権も不要になります。

- **公開は必須ではありません。** Plugin / clone 参照だけで全機能が使えます
  （[`using-from-other-repos.md`](using-from-other-repos.md)）
- 公開する価値があるのは: 社外・不特定の利用者に配りたいとき、
  uber.design/base-mcp のような「公開デザインシステム」を目指すとき
- **配布物の準備は完了しています。** データ同梱・ビルド・検証は仕込み済みで、
  残るは npm アカウントでの `npm publish` だけです（§1 と §3）

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

## 2. データ同梱（実装済み・手作業は不要）

MCP サーバーはトークン・部品仕様・禁止ルールを**リポジトリのルートから**
読みます。npm から入れた `npx kaze-mcp` は node_modules の中で動くため、
そのままではデータがどこにもありません。**起動はする。ツール一覧も返る。
中身だけが空になる。** 一番気づきにくい壊れ方です。

そのため次の 3 つが仕込んであり、publish 時に自動で効きます:

| 仕組み             | 場所                            | 働き                                                |
| ------------------ | ------------------------------- | --------------------------------------------------- |
| データのコピー     | `scripts/sync-mcp-data.mjs`     | 生成物 3 件を `mcp/data/` へコピー                  |
| 自動実行           | `mcp/package.json` の `prepack` | `npm pack` / `npm publish` の直前に コピー + ビルド |
| 読み込みの落とし先 | `mcp/src/utils/loader.ts`       | 既定パスに無ければ同梱 `data/` を読む               |

`mcp/data/` は **コピーであって第 2 の編集場所ではありません**。手で編集しても
次の publish で上書きされます（`.gitignore` 済み。正はリポジトリ側の生成物）。

`DS_ROOT` を明示している場合は同梱データへ落ちません。別のデザインシステムを
指しているのに kaze のデータで穴を埋めると、黙って別物を返すことになるためです。
その場合は「どこを見て失敗したか」を言って落ちます。

## 3. 公開手順

```bash
# 1) 配布物が本当に動くか（publish と同じ経路で pack → 展開 → リポジトリ外で起動）
pnpm check:mcp-package

cd mcp

# 2) 内容物の確認（dist/ と data/ が入っているか）
npm pack --dry-run

# 3) 公開（スコープ無しパッケージは --access 指定不要だが明示しておく）
npm publish --access public

# 4) 確認
npm view kaze-mcp version
npx -y kaze-mcp   # 消費側と同じ方法で起動確認（stderr に起動ログが出る）
```

`pnpm check:mcp-package` は CI でも毎回走ります。同梱漏れやビルド漏れがあれば
publish 前に赤くなります（実際に 3 ファイルを抜いて落ちることを確認済み）。

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
- [ ] `pnpm check:mcp-package` が通る（同梱・ビルド・リポジトリ外での起動を一括で見る）
- [ ] `pnpm check:mcp` が通る
- [ ] 生成物が最新（`pnpm export-tokens && pnpm export-metadata && pnpm export-rules`）
- [ ] バージョンを適切に上げた（`mcp/package.json`）
- [ ] `npm whoami` でログイン済み
