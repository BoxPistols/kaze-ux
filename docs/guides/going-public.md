# 公開と流布（メンテナ向けチェックリスト）

kaze-ux を public にし、MCP / Skills を**探している人に見つかる場所**へ載せるまでの手順。

「作った」と「見つけてもらえる」は別問題で、後者は置き場所を用意しないと起きない。
このガイドは後者だけを扱う。中身の作り方は [`DESIGN.md`](../../DESIGN.md)。

## 0. 何が終わっていて、何が残っているか

| 段階                                     | 状態                      |
| ---------------------------------------- | ------------------------- |
| 試せる（導入手順・マニュアル・検査）     | ✅ 完了                   |
| わかる（英語の入口・LP の導線・バッジ）  | ✅ 完了                   |
| 見つかる（public 化・npm・MCP Registry） | ⬜ **人手が必要**（下記） |

コードでできることは終わっている。残りはアカウント権限が要る操作だけ。

## 1. public 化の前に（1 回だけ）

```bash
pnpm check:share   # 匿名性 + 配信中の資格情報
```

これが緑であることを確認してから公開する。**公開後に消しても、履歴と
キャッシュは残る**ので順番を逆にしない。

この検査が守る範囲は「個人に届く情報」（メールアドレス・実名・ローカルパス）。
リポジトリの owner とパスは公開名義として通す — 配布の導線
（`/plugin marketplace add <owner>/<repo>`、MCP Registry の
`io.github.<owner>/`）に必ず出るもので、秘匿と両立しないため。

## 2. public にする

GitHub の Web UI から:

**Settings → General → 一番下の Danger Zone → Change repository visibility → Make public**

API では変更できないため、ここだけは手作業になる。

公開直後にやること:

- Settings → General → Features で **Discussions** を有効化（質問の受け皿。
  Issue より敷居が低い）
- About（右上の歯車）→ description を英語併記にする。
  例: `Design system knowledge for AI agents — tokens, component specs and rule
checks over MCP. MUI + Tailwind + Storybook.`
- About → Website に `https://kaze-ux.vercel.app` が入っているか確認
- topics は設定済み（`mcp` / `design-system` / `design-tokens` / `ai-agents` ほか）。
  **public になって初めて検索に効く**

## 3. npm に公開する

手順は [`npm-publishing.md`](npm-publishing.md) §1〜§3。

```bash
pnpm check:mcp-package   # 配布物が本当に動くか
cd mcp && npm publish --access public
```

## 4. MCP Registry に載せる（ここが「自然に発見される」場所）

手順は [`npm-publishing.md`](npm-publishing.md) §3.5。npm 公開が前提。

```bash
mcp-publisher login github
cd mcp && mcp-publisher publish
```

登録名は `io.github.boxpistols/kaze-mcp`。

## 5. 外に置く（任意・効果は 1〜4 の後）

- **GitHub Release** を切る（`kaze-mcp@0.2.0`）。リリースがあると、
  更新されている
  プロジェクトだと外から分かる
- **awesome 系リストへ PR**。`awesome-mcp-servers` などに 1 行足す。
  文面の下書き:

  > **[kaze-mcp](https://github.com/BoxPistols/kaze-ux/tree/main/mcp)** —
  > Design system knowledge for AI agents. Serves design tokens, component
  > specs, and prohibited-pattern checks over MCP, so agents write UI code that
  > matches the system. Works with any design system that provides the same
  > data files.

- **Storybook を入口として共有する**（`https://kaze-ux.vercel.app`）。
  読む人にとっては、実物が動いているページが一番速い説明になる

## 6. 公開後に効き続けるようにする

| やること                                             | なぜ                                                   |
| ---------------------------------------------------- | ------------------------------------------------------ |
| ルール・トークンを変えたら生成物を再生成して publish | 古い仕様を配ると、使う側は黙って古い値を掴む           |
| CI を緑に保つ                                        | 検査が落ちているリポジトリは、外から見ると信用できない |
| Issue / Discussions に反応する                       | 反応がないプロジェクトは使われなくなる                 |

## 7. 元に戻したくなったら

private に戻す操作は同じ場所からできるが、**すでに clone / fork / npm
install された分は戻らない**。npm も publish 済みバージョンは削除しても
同じ番号を再利用できない。1 の検査を先に通すのはこのため。
