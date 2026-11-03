# Figma MCP でキャンバスを動かす — code → design の実務手順

AI エージェントに Figma を**書かせる**ときの手順。実際に kaze-ec の 3 画面を
この手順で生成した際の記録をもとにしている（推測ではなく実行結果）。

読む人: デザイナー / エンジニア。Figma MCP が接続済みであることが前提。

---

## 0. 方向を先に決める

| 方向              | 何をするか                 | このリポジトリでの位置づけ       |
| ----------------- | -------------------------- | -------------------------------- |
| design → code     | Figma の意匠を実装に落とす | 扱わない。仕様は kaze MCP が持つ |
| **code → design** | 実装をキャンバスに再現する | **こちらを使う**                 |

なぜ code → design か。トークンと部品仕様の単一ソースが
[`design-tokens/tokens.json`](../design-tokens/tokens.json) と
[`metadata/components.json`](../metadata/components.json) にある以上、
Figma は**下流**にある。上流を Figma に置くと単一ソースが 2 つになる。

Figma に描いたものを正とするなら、それは別の運用（そのときは
[`figma-plugin/`](../figma-plugin/) で tokens.json を Variables に流す方向を使う）。

---

## 1. 実行前に必ず読むもの

**`use_figma` を呼ぶ前に `figma-use` スキルを読み込む。** これは Figma MCP
サーバー自身が必須と宣言している。読まずに呼ぶと、後述の落とし穴を全部踏む。

```
/figma-use
```

スキルが見つからない場合は MCP リソースから読む:

```
skill://figma/figma-use/SKILL.md
```

新規ファイルを作るなら `figma-create-new-file` も同様に先に読む。

---

## 2. 手順

### 2.1 ファイルを作る（または既存ファイルの key を得る）

```
create_new_file({ fileName, planKey, editorType: 'design' })
```

`planKey` は `whoami` で得る。複数プランがあるならどれに作るかを**人に確認する**。
既存ファイルには勝手に書かない。

### 2.2 現状を読む

```
get_metadata({ fileKey })            # ページ一覧
get_metadata({ fileKey, nodeId })    # そのページの構造
```

**書く前に読む。** 既存ノードの命名規則・構造に合わせないと、後から人が
触れないファイルになる。

### 2.3 書く

```
use_figma({ fileKey, code, description, skillNames: 'figma-use' })
```

`code` は Figma Plugin API の JavaScript。**トークンの値はコードに直書きせず、
kaze MCP から引いた値を使う**（`get_token('color.light.primary.main')` →
`#0057B8`）。Figma 側だけ古い色になるのが一番ありがちな事故。

### 2.4 目視する

```
get_screenshot({ fileKey, nodeId, maxDimension: 900 })
```

**返ってきた画像を実際に見る。** 「生成された」は「正しく生成された」ではない。
実際、初回に作った DEMO バッジは白地に白文字で読めなかったが、
スクリプトの戻り値は成功だった。

---

## 3. 実際に踏んだ落とし穴

推測ではなく、この手順を実行して起きたもの。

| 症状                                     | 原因                               | 対処                                                  |
| ---------------------------------------- | ---------------------------------- | ----------------------------------------------------- |
| `layoutSizingHorizontal = 'FILL'` が例外 | 親に append する前に設定した       | `appendChild` を先に                                  |
| テキストが編集できない                   | フォント未ロード                   | `loadFontAsync` を await してから `characters` を書く |
| ページを切り替えられない                 | `figma.currentPage = page` は不可  | `await figma.setCurrentPageAsync(page)`               |
| バッジが読めない                         | 白地に白文字。戻り値は成功         | スクリーンショットを見る                              |
| 実在ブランド名が混入                     | 実装のモックデータをそのまま流した | 生成後に固有名詞を検査する                            |

**`use_figma` は原子的**で、エラーなら 1 つも実行されない。失敗したら即リトライ
せず、エラーを読んで直す。

---

## 4. レート制限

Figma の Starter プランには MCP ツール呼び出しの上限がある。実際に作業中に
到達した。

対策:

- **1 回の `use_figma` で 1 画面ぶんをまとめて作る。** 部品ごとに呼ばない
- スクリーンショットは**節目でだけ**撮る。1 ステップごとに撮らない
- 上限に達したら、その日は止める。回避策を探すより待つほうが速い

---

## 5. 実装を変えたら Figma も変える

**code → design は自動同期ではない。** 実装を直しても Figma は古いまま残る。

kaze-ec で実際に起きたこと: 商品名に実在ブランド名が混入していたため実装を
修正したが、Figma 側の 3 つのテキストノードは古い名前のままだった。
`findAll` で該当ノードを探して個別に直した。

```js
const matches = page.findAll(
  (n) => n.type === 'TEXT' && n.characters.includes('<古い文字列>')
)
```

デザインを刷新したときも、フレームを作り直した（部分修正より速い）。

**運用としては、Figma は「その時点の実装のスナップショット」と割り切る。**
常に一致させたいなら、CI で生成し直す仕組みが要る（未実装）。

---

## 6. 何に使えて、何に使えないか

| 使える                                               | 使えない                          |
| ---------------------------------------------------- | --------------------------------- |
| 実装をデザイナーに見せる（Figma 上でコメントできる） | 意匠を Figma で決めて実装に落とす |
| 画面遷移をキャンバスに並べて全体を俯瞰する           | ピクセル完全な再現                |
| 実装済みのものを資料に貼る                           | 常時同期                          |

**ピクセル完全にはならない。** MUI のコンポーネントを Plugin API で再現している
以上、影・フォントのレンダリング・微細な余白は一致しない。「どんな画面か」が
伝われば目的は達成している。

---

## 関連

- [`operating-model.md`](operating-model.md) — 誰が何を決めるか
- [`DESIGN.md`](../DESIGN.md) — トークン・部品仕様の単一ソース
- [`figma-plugin/`](../figma-plugin/) — tokens.json を Figma Variables に流す方向
