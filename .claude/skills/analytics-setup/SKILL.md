---
name: analytics-setup
description: Vercel Analytics / Speed Insights / GA4 をサイトに設置する手順。SPA・iframe・複数面が同居する構成で実際に踏んだ落とし穴と、設置後に「本当に飛んでいるか」を測る方法
user_invocable: true
---

# analytics-setup

計測を入れるとき、そして入れたあとに読む。

**このスキルの主題は手順ではなく検証。** 計測は壊れてもエラーを出さない。
入れたつもりで何も飛んでいない状態が、いちばん起きやすく、いちばん気づけない。

> 「入れた」は「飛んでいる」の証拠にならない。

---

## 0. 設置する前に決める

| 問い             | 決め方                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------- |
| 何を知りたいか   | 「誰が何を見たか」なら Web Analytics で足りる。流入元・行動・コンバージョンまで見るなら GA4 |
| 面はいくつあるか | 1 プロジェクトに複数のアプリが同居しているなら、**全部に入れないと欠けた面が無言で消える**  |
| SPA か           | ルート変更でページビューが飛ぶかを別途確かめる。初回表示だけ飛んで満足しない                |
| iframe があるか  | 中に入れると親の 1 操作が複数回に数えられる                                                 |

---

## 1. 落とし穴（すべて実際に踏んだもの）

### gtag は `arguments` を push する

```js
// ❌ 動かない。エラーも出ない
const gtag = (...args) => {
  dataLayer.push(args)
}

// ✅ 公式スニペットと同じ形
function gtag() {
  dataLayer.push(arguments)
}
```

配列に展開して push すると gtag.js が処理しない。**例外も警告も出ないまま
無計測になる。** 生スニペットを使う面だけが動いて、自前で書いた面が
静かに死ぬ、という形で出る。

### 送信は `sendBeacon` なので、リクエストの監視に映らない

Playwright の `page.on('request')` では捕まらない。計測を確かめるときは
`navigator.sendBeacon` と `fetch` と `XMLHttpRequest.open` を差し替えて記録する。

```js
await ctx.addInitScript(() => {
  window.__sent = []
  const ob = navigator.sendBeacon?.bind(navigator)
  if (ob)
    navigator.sendBeacon = (u, d) => {
      window.__sent.push(String(u))
      return ob(u, d)
    }
})
```

### 自動操作のブラウザは弾かれる

Vercel も GA4 も、`navigator.webdriver` や HeadlessChrome の UA を見て
送信を止める。**0 件を見て「壊れている」と判断しない。** 自分のサイトの
確認では、UA を通常のものにし `webdriver` を隠してから測る。

実訪問での最終確認は、**自分のブラウザで開いてリアルタイム画面を見る**のが確実。

### iframe を持つ画面は外枠にだけ入れる

Storybook はストーリーを iframe で描画する。preview 側に入れると
1 ストーリー開くたびに iframe の遷移まで数える。manager（外枠）にだけ入れる。

### hash ルートは潰れる

`/app/#/projects` のようなルータは、hash が集計で落ちると**アプリを開いた
ことしか分からない**。パス側へ畳んでから送る。

```ts
const foldHashRoute = (raw: string): string => {
  const url = new URL(raw)
  if (!url.hash.startsWith('#/')) return raw
  url.pathname = `${url.pathname.replace(/\/$/, '')}${url.hash.slice(1)}`
  url.hash = ''
  return url.toString()
}
```

**複数の計測を並べるなら、この正規化を共有する。** 別々だと 2 つの数字を
突き合わせられない。

### 測定 ID を 2 箇所以上に書いたら、必ず照合を置く

React 側と静的 HTML 側のように書き分けが要るとき、片方だけ書き換えると
**その面のデータだけ別プロパティへ飛ぶ**。GA4 の画面には「片方が来ていない」
とは出ないので、気づく手段が無い。走査式の検査を置く（`pnpm check:ga`）。

### イベント名はカタログで固定する

GA4 は**未知の名前をそのまま新しいイベントとして受け入れる**。
`chat_opened` と `chatOpened` を書き分けると警告なしに 2 つに割れ、
どちらも実数より少ない数字になる。定数にすれば綴り違いはコンパイルで止まる。

予約語（`page_view` / `session_start` / `scroll` / `click` 等）は自動計測と
混ざるので使わない。

---

## 2. 設置

このリポジトリでの実装は次の 3 つに分かれている。

| ファイル                           | 役割                                               |
| ---------------------------------- | -------------------------------------------------- |
| `src/components/SiteAnalytics.tsx` | React 4 面に置く。Vercel + Speed Insights + GA4    |
| `src/utils/ga.ts`                  | GA4 の初期化とページビュー。測定 ID もここ         |
| `src/utils/analytics.ts`           | 行動イベント。GA4 と Vercel の両方へ同じ名前で送る |

静的な面（Storybook の manager）は `.storybook/main.cjs` の `managerHead`
にスクリプトを注入する。

行動イベントを足すときは `ANALYTICS_EVENTS` に定数を足してから呼ぶ。

```ts
trackEvent(ANALYTICS_EVENTS.PRODUCT_OPENED, { product: title, href })
```

**本文や入力値は送らない。** 長さや種別のような、復元できない形にする。

---

## 3. 設置したあとに測る

順番が大事。上から順に、1 つでも欠けたら次へ進まない。

| 確かめること              | 方法                                                              |
| ------------------------- | ----------------------------------------------------------------- |
| 1. コードが本番に載ったか | 本番のバンドルを取得して測定 ID を grep。デプロイ記録では足りない |
| 2. スクリプトが読めるか   | `/_vercel/insights/script.js` 等の応答コード                      |
| 3. 送信が出ているか       | `sendBeacon` を差し替えて記録（上記）                             |
| 4. 受理されたか           | 応答コード。GA の collect は **204**、Vercel は 200               |
| 5. 正しい URL か          | 送信ペイロードの `dl` / `url` を読む。hash が畳まれているか       |
| 6. 画面に出るか           | ダッシュボード。**ここまで来て初めて「入った」と言える**          |

```bash
pnpm check:ga        # 測定 ID がすべての場所で一致しているか
```

### 5 面ぶんを一度に測る

```bash
pnpm serve:dist      # dist を :6110 で配信
```

本番と同じ 1 オリジン + サブパスで測る。アプリを別ポートのルートに置くと
ベースパスが合わず、資産が 404 になって**何も描画されないのに「違反 0」**になる。

---

## 4. 数字を読むときの注意

- **検証で発生させたページビューは実訪問ではない。** 日付で切り分ける。
  個別イベントは消せない
- 訪問者が数人のうちは Speed Insights のパーセンタイルはノイズ。
  極端な劣化の検知にとどめる
- GA4 と Vercel で数字がずれるのは正常（ボット除外の基準・計測の粒度が違う）。
  **URL の名前が揃っていれば傾向は突き合わせられる**

## 関連

- 検証の全体像: [docs/verification.md](../../../docs/verification.md)
- 設計原則: [foundations/design_philosophy.md](../../../foundations/design_philosophy.md)
