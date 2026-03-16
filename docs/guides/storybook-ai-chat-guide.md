# Storybook に AI チャットを組み込む — 構築ガイド

Storybook の各ページにコンテキスト認識型 AI チャットを追加する手順。
Kaze Design System の ChatSupport 実装をベースに、再現可能な形で解説する。

## 全体像

```
Storybook Decorator (preview.tsx)
  └─ currentStory = { title, name } を ChatSupport に渡す
       │
ChatSupport コンポーネント
  ├─ storyGuideMap.ts  → ページごとの文脈情報を注入
  ├─ faqDatabase.ts    → オフライン FAQ（Fuse.js 検索）
  ├─ chatAiService.ts  → OpenAI / Gemini API 呼び出し
  └─ UI（ウィジェット / サイドバー切替）
```

## ファイル構成

```
src/components/ui/ChatSupport/
  ChatSupport.tsx          # メインコンポーネント（UI + 状態管理）
  chatAiService.ts         # AI API 統合（OpenAI / Gemini）
  chatSupportConstants.ts  # システムプロンプト・設定・ショートカット
  chatSupportTypes.ts      # TypeScript 型定義
  storyGuideMap.ts         # ページ文脈マップ
  faqDatabase.ts           # オフライン FAQ
  muiKnowledge.ts          # MUI 知識ベース（トピック検出）
  CodeBlock.tsx            # コードブロック（シンタックスハイライト）
  BookConciergeIcon.tsx    # カスタムアイコン
  useResize.ts             # リサイズハンドラ
  writingPatterns.ts       # 回答品質パターン
```

## Phase 1: 最小構成（API + UI + Decorator）

### 1-1. 型定義

```ts
// chatSupportTypes.ts
interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface ChatSupportConfig {
  apiKey: string
  model: string
  provider: 'openai' | 'gemini'
}
```

### 1-2. AI API レイヤー

```ts
// chatAiService.ts
const callAI = async (
  messages: Array<{ role: string; content: string }>,
  config: ChatSupportConfig
): Promise<string> => {
  const isGemini = config.model.includes('gemini')

  const url = isGemini
    ? 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
    : 'https://api.openai.com/v1/chat/completions'

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      max_tokens: 4000,
      temperature: 0.7,
    }),
  })

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? 'No response'
}
```

**ポイント:**

- Gemini は OpenAI 互換エンドポイントを使う（SDK 不要）
- `Bearer` トークンは両プロバイダ共通
- レスポンス抽出は複数フォールバック（Kaze では5段階）

### 1-3. Storybook Decorator

```tsx
// .storybook/preview.tsx
const Decorator = (Story: StoryFn, context: StoryContext) => {
  const currentStory = useMemo(
    () => ({
      title: context.title, // 'Components/UI/Button'
      name: context.name, // 'Primary'
    }),
    [context.title, context.name]
  )

  return (
    <ThemeProvider theme={theme}>
      <Story />
      {context.viewMode !== 'docs' && (
        <ChatSupport currentStory={currentStory} />
      )}
    </ThemeProvider>
  )
}

export default {
  decorators: [Decorator],
} satisfies Preview
```

**ポイント:**

- `currentStory` を `useMemo` でメモ化（テーマ切替時の再レンダリング防止）
- `docs` ビューモードでは非表示（Canvas のみ）

### 1-4. 最小 UI

ChatSupport.tsx の骨格:

```tsx
const ChatSupport = ({ currentStory }) => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const handleSend = async () => {
    // 1. ユーザーメッセージ追加
    // 2. システムプロンプト + ページ文脈 + ユーザーメッセージを組み立て
    // 3. callAI() で API 呼び出し
    // 4. ボットメッセージ追加
  }

  return (
    <>
      {/* FAB（トグルボタン） */}
      <Fab onClick={() => setOpen(!open)}>
        <ChatIcon />
      </Fab>

      {/* チャットパネル */}
      {open && (
        <Paper>
          {/* メッセージ一覧 */}
          {/* 入力欄 */}
        </Paper>
      )}
    </>
  )
}
```

## Phase 2: ページ文脈認識

### 2-1. ストーリーガイドマップ

```ts
// storyGuideMap.ts
const STORY_GUIDE_MAP: Record<string, StoryGuideEntry> = {
  'Components/UI/Button': {
    summary: 'CVA ベースのボタン。6 バリアント x 4 サイズ。',
    codeContext: [
      '定義: src/components/ui/Button.tsx',
      'variant: default / destructive / outline / secondary / ghost / link',
    ],
    related: ['Components/UI/IconButton'],
  },
  // ... 各ストーリーごとに定義
}
```

### 2-2. システムプロンプトへの注入

```ts
const buildSystemPrompt = (currentStory, guide) => {
  let prompt = BASE_SYSTEM_PROMPT

  if (guide) {
    prompt += `\n\n## 現在のページ: ${currentStory.title}\n`
    prompt += guide.summary + '\n'
    prompt += guide.codeContext.map((c) => `- ${c}`).join('\n')
  }

  return prompt
}
```

**これが「ただのチャットボット」と「コンテキスト認識 AI」の違い。**
ユーザーが「これ何？」と聞くだけで、現在表示中のコンポーネントについて回答できる。

## Phase 3: オフライン FAQ

### 3-1. FAQ データベース

```ts
// faqDatabase.ts
const FAQ_DATABASE: FaqEntry[] = [
  {
    keywords: ['カラー', 'color', 'palette', 'primary'],
    title: 'カラーパレットの使い方',
    answer: `## 色の指定方法\n\n\`\`\`tsx\n<Box sx={{ color: 'primary.main' }} />\n\`\`\``,
  },
  // ...
]
```

### 3-2. Fuse.js ファジー検索

```ts
import Fuse from 'fuse.js'

const fuse = new Fuse(FAQ_DATABASE, {
  keys: ['keywords', 'title', 'answer'],
  threshold: 0.4,
})

const findFaqAnswer = (query: string): FaqEntry | null => {
  const expanded = expandSynonyms(query) // 余白 → spacing, gap, margin...
  const results = fuse.search(expanded)
  return results[0]?.item ?? null
}
```

**ポイント:**

- API キーなしでも動作する
- 同義語展開で日本語 ↔ 英語の検索をカバー
- FAQ にヒットしなければ AI API にフォールバック

## Phase 4: 仕上げ

### 4-1. ペルソナ検出

```ts
const detectPersona = (query: string, storyTitle: string) => {
  // デザイナーシグナル: figma, デザイン, 色, 余白
  // エンジニアシグナル: 実装, コード, api, prop, import
  // → 回答スタイルを切替
}
```

### 4-2. 指示語解決

```ts
// 「このUI」「これ何？」→ 現在のページのコンポーネントを特定
const DEICTIC_PATTERNS = ['このUI', 'これ', '今見てる', 'what is this']
```

### 4-3. キーボードショートカット

| アクション   | ショートカット |
| ------------ | -------------- |
| 送信         | Enter          |
| フォーカス   | Ctrl+/         |
| チャット切替 | Shift+Cmd+K    |
| 設定         | Shift+Cmd+X    |
| 履歴DL       | Shift+Cmd+D    |

### 4-4. 永続化

```ts
// LocalStorage
'storybook_chat_history' // メッセージ履歴
'storybook_chat_config' // API キー・モデル・UI モード

// SessionStorage
'chat_support_open' // 開閉状態（タブ固有）
```

## Kaze 実装の特徴

| 機能         | 一般的なチャットボット | Kaze ChatSupport                        |
| ------------ | ---------------------- | --------------------------------------- |
| コンテキスト | なし                   | ページごとの文脈自動注入                |
| ペルソナ     | なし                   | デザイナー/エンジニア語彙でスコアリング |
| オフライン   | 不可                   | Fuse.js FAQ で API キーなしでも動作     |
| 指示語       | 不可                   | 「このUI」→ 現在のコンポーネントを特定  |
| マルチモデル | 1 プロバイダ           | OpenAI + Gemini デュアル対応            |
| UI モード    | 固定                   | ウィジェット / サイドバー切替           |
| 永続化       | なし                   | LocalStorage で履歴・設定を保持         |

## 先行事例との比較

| プロジェクト         | 形態      | Kaze との違い                     |
| -------------------- | --------- | --------------------------------- |
| Hermae               | 商用 SaaS | RAG ベース。ページ文脈認識なし    |
| Story UI             | OSS MCP   | レイアウト生成特化                |
| storybook-ai         | PoC       | 本番非推奨。API キー漏洩問題      |
| @storybook/addon-mcp | 公式      | UI 内チャットなし（外部 AI 連携） |

## 再現に必要な依存パッケージ

```json
{
  "react-markdown": "^10.0.0",
  "remark-gfm": "^4.0.0",
  "prism-react-renderer": "^2.0.0",
  "fuse.js": "^7.0.0",
  "lucide-react": "^0.400.0"
}
```
