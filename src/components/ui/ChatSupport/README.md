# ChatSupport — Storybook AI コンシェルジュ

Storybook 全ストーリーに自動注入される AI チャットウィジェット。
kaze-ux / sdpf-theme / Matlens の 3 プロジェクト共通アーキテクチャ。

---

## ファイル構成

```
ChatSupport/
  ChatSupport.tsx            # スリムコンテナ（~270行）— レイアウト構成のみ
  chatSupportTypes.ts        # 型定義（CurrentStoryContext, Message, etc.）
  chatSupportConstants.ts    # 定数・ショートカット・モデル設定
  chatAiService.ts           # AI 呼び出し（AI SDK v6 ベース）
  faqDatabase.ts             # FAQ データ + findFaqAnswer + QUICK_SUGGESTIONS
  storyGuideMap.ts           # ページ別ガイドマップ
  muiKnowledge.ts            # MUI 知識ベース
  embeddingSearch.ts         # セマンティック検索（VectorIndex）
  embeddingService.ts        # OpenAI Embedding API ラッパー
  writingPatterns.ts         # 記述パターン知識ベース
  useResize.ts               # リサイズ hook（widget / sidebar）
  BookConciergeIcon.tsx      # FAB アイコン
  CodeBlock.tsx              # Markdown コードブロック
  hooks/
    useChatState.ts          # isOpen / messages / scrollRef / clearChat
    useChatConfig.ts         # config / API設定 / ショートカット設定
    useChatMessage.ts        # 送信 / FAQ / AI / セマンティック検索
    useChatShortcuts.ts      # グローバルキーボードショートカット
  components/
    ChatHeader.tsx           # タイトル行 / ツールバー / モデル名
    ChatInput.tsx            # 入力欄 + 送信ボタン
    ChatMessageList.tsx      # メッセージ / サジェスト / タイピング表示
    ChatPageContextChip.tsx  # ページ解説トリガー（スティッキーチップ）
    ChatSettings.tsx         # API設定 / モデル選択 / ショートカット設定
```

---

## Storybook Decorator 注入パターン

`.storybook/preview.tsx` の `Decorator` コンポーネントがすべての Story に自動注入します。

```tsx
// preview.tsx（抜粋）
const argTypesRef = useRef(context.argTypes)
const argsRef = useRef(context.args)
argTypesRef.current = context.argTypes
argsRef.current = context.args

const currentStory = useMemo(
  () => ({
    title: context.title,
    name: context.name,
    description: context.parameters?.docs?.description?.component,
    // argTypes / args は ref 経由で渡す（Controls 操作での再レンダリング防止）
    argTypes: argTypesRef.current,
    args: argsRef.current,
  }),
  [
    context.title,
    context.name,
    context.parameters?.docs?.description?.component,
  ]
)

{
  context.viewMode !== 'docs' && !disableDecoratorChat && (
    <ChatSupport currentStory={currentStory} />
  )
}
```

### なぜ `useRef` パターンを使うか

`context.args` は Storybook Controls パネルの操作のたびに新しいオブジェクト参照が生成されます。
これを `useMemo` の依存配列に含めると `currentStory` が頻繁に再生成され、
ChatSupport 内の `storyGuide` メモ化や `contextualPrompt` 生成が不要に再実行されます。

`useRef` で参照を保持しつつ毎レンダリングで `current` を更新することで、
memo は安定しつつ最新値を保持できます。

---

## `disableDecoratorChat` — 二重レンダリング防止

ChatSupport 専用の Story では、Decorator 側の注入を無効化する必要があります。

```tsx
// ChatSupport.stories.tsx
const meta: Meta<typeof ChatSupport> = {
  parameters: {
    disableDecoratorChat: true, // Decorator の ChatSupport を無効化
  },
}
```

**なぜ必要か:** ChatSupport.stories.tsx は Story 自身が `<ChatSupport />` を描画します。
`disableDecoratorChat: true` がない場合、Decorator 側と Story 側の 2 つのインスタンスが
同じ `position: fixed` 座標に重なり、React の state や localStorage 操作が競合します。

この parameter 名は **kaze-ux / sdpf-theme / Matlens の 3 プロジェクトで共通** です。

---

## `CurrentStoryContext` 型（3 プロジェクト共通）

```ts
export interface CurrentStoryContext {
  title: string // Story のカテゴリ階層（例: "Components/UI/Button"）
  name: string // Story 名（例: "Default"）
  description?: string // meta の docs.description.component（あれば）
  argTypes?: Record<string, unknown> // コンポーネントの props スキーマ
  args?: Record<string, unknown> // 現在 Story で使用中の props 値
}
```

`argTypes` / `args` は現在型定義のみ。AI プロンプトへの注入は今後の PR で実装予定。

---

## AI 呼び出しアーキテクチャ

### 3 層フォールバック

```
ユーザー入力
  ↓
1. ページ文脈クエリ判定（「この画面は？」等）
   → storyGuideMap から即時回答
  ↓
2. セマンティック検索（APIキーあり）
   → VectorIndex で類似 FAQ を発見 → プロンプト補強
  ↓
3. AI 呼び出し（AI SDK v6 generateText）
   → callAI(config, payload)
  ↓
エラー時フォールバック: セマンティック FAQ → キーワード FAQ → エラーメッセージ
```

### AI SDK v6 パターン（`chatAiService.ts`）

```ts
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'

const resolveModel = (config) => {
  if (config.model.includes('gemini')) {
    return createGoogleGenerativeAI({ apiKey: config.apiKey })(config.model)
  }
  return createOpenAI({ apiKey: config.apiKey })(config.model)
}

export const callAI = async (config, messages, isTest = false) => {
  const result = await generateText({
    model: resolveModel(config),
    messages,
    maxOutputTokens,
    abortSignal: AbortSignal.timeout(60000),
  })
  return result.text
}
```

---

## セマンティック検索（`embeddingSearch.ts`）

```
text-embedding-3-small (512次元に短縮)
  → インメモリ VectorIndex（バッチ 100 件単位で API 呼び出し）
  → コサイン類似度: dot(a, b) / (norm_a * norm_b)
  → threshold = 0.3, topK = 5
```

API キーがある場合のみ有効。キーなし時は FAQ キーワード検索にフォールバック。

---

## キーボードショートカット（デフォルト）

| アクション       | Mac     | Windows    |
| ---------------- | ------- | ---------- |
| チャット開閉     | `⌘ K`   | `Ctrl K`   |
| チャットを閉じる | `Esc`   | `Esc`      |
| 入力欄フォーカス | `⌘ L`   | `Ctrl L`   |
| 設定パネル切替   | `⌘ ,`   | `Ctrl ,`   |
| 履歴ダウンロード | `⌘ D`   | `Ctrl D`   |
| UI モード切替    | `⌘ \`   | `Ctrl \`   |
| 履歴クリア       | `⌘ ⇧ K` | `Ctrl ⇧ K` |
| メッセージ送信   | `⌘ ↵`   | `Ctrl ↵`   |

すべてのショートカットは設定パネルからカスタマイズ可能。localStorage に永続化。

---

## バックエンドプロキシ（`api/ai.ts`）

Vercel Function として `/api/ai` を提供。API キーをサーバー側で保持しブラウザに露出させない。

- 共有プール（プロジェクト提供キー）: IP ベースのレート制限（Upstash Redis / in-memory フォールバック）
- ユーザー自前キー（`X-User-API-Key` ヘッダー）: レート制限免除
- `requiresUserKey` モデル（高コスト）: サーバー側でも自前キーを要求

---

## 3 プロジェクト共通パターン

| 項目                             | kaze-ux     | sdpf-theme | Matlens |
| -------------------------------- | ----------- | ---------- | ------- |
| `disableDecoratorChat` parameter | ✅          | ✅         | ✅      |
| `argTypes/args` 型定義           | ✅          | ✅         | ✅      |
| useRef パターン                  | ✅          | ✅         | ✅      |
| AI SDK v6                        | ✅          | 実装中     | ✅      |
| バックエンドプロキシ             | ✅ (PR #28) | 予定       | ✅      |
| Fuse.js                          | 予定        | ✅         | ✅      |
| セマンティック検索               | ✅          | ✅         | —       |
