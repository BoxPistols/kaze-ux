# AI API マルチプロバイダー移行ガイド

> GPT-5.4 系へのモデル移行 + マルチプロバイダー対応の再現可能な手順書。
> kaze-ux（フロントエンド完結）と advisea-pro（サーバーサイド + 6プロバイダー）の実体験に基づく。

---

## 0. アーキテクチャ全体像

```
┌─────────────────────────────────────────────────┐
│  利用モード                                      │
│  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ 無料版        │  │ MyAPI（ユーザー負担）     │ │
│  │ gpt-5.4-nano │  │ 全プロバイダー選択可能    │ │
│  │ レート制限あり │  │ レート制限なし            │ │
│  └──────┬───────┘  └──────────┬───────────────┘ │
│         │                     │                  │
│         ▼                     ▼                  │
│  ┌─────────────────────────────────────────────┐ │
│  │  プロバイダールーター                        │ │
│  │  sdkType で分岐:                             │ │
│  │  ├─ openai     → OpenAI SDK                  │ │
│  │  ├─ anthropic  → Anthropic SDK               │ │
│  │  ├─ google     → Google GenAI SDK            │ │
│  │  └─ openai     → Ollama / LM Studio (互換)  │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 1. GPT-5.4 系の API 仕様差分（最重要）

### 破壊的変更: リクエストパラメータ

| パラメータ   | gpt-4.1 系 / Gemini / Claude | gpt-5.4 系                   |
| ------------ | ---------------------------- | ---------------------------- |
| トークン上限 | `max_tokens`                 | `max_completion_tokens`      |
| temperature  | `0.7` 等を指定               | **指定不可**（エラーになる） |

```ts
// ✅ プロバイダー別パラメータ分岐（コピペ可）
const buildRequestBody = (model: string, messages: unknown[]) => {
  const body: Record<string, unknown> = { model, messages }

  const isNewGenOpenAI = model.includes('gpt-5') || model.includes('o1')

  if (isNewGenOpenAI) {
    const isNano = model.includes('nano')
    body.max_completion_tokens = isNano ? 4000 : 16000
    // temperature は絶対に指定しない
  } else {
    body.max_tokens = 4000
    body.temperature = 0.7
  }

  return body
}
```

---

## 2. プロバイダー定義（6プロバイダー対応）

### 型定義

```ts
interface ProviderConfig {
  id: string
  name: string
  keyPrefix: string | null // APIキーのバリデーション用
  defaultBaseUrl: string | null
  sdkType: 'openai' | 'anthropic' | 'google'
  requiresApiKey: boolean
}
```

### プロバイダーレジストリ

```ts
const PROVIDERS: Record<string, ProviderConfig> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    keyPrefix: 'sk-',
    defaultBaseUrl: 'https://api.openai.com/v1',
    sdkType: 'openai',
    requiresApiKey: true,
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    keyPrefix: 'sk-ant-',
    defaultBaseUrl: 'https://api.anthropic.com',
    sdkType: 'anthropic',
    requiresApiKey: true,
  },
  google: {
    id: 'google',
    name: 'Google Gemini',
    keyPrefix: null,
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    sdkType: 'google',
    requiresApiKey: true,
  },
  'openai-compatible': {
    id: 'openai-compatible',
    name: 'OpenAI 互換 API',
    keyPrefix: null,
    defaultBaseUrl: null, // ユーザーが指定
    sdkType: 'openai',
    requiresApiKey: true,
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama（ローカル LLM）',
    keyPrefix: null,
    defaultBaseUrl: 'http://localhost:11434/v1',
    sdkType: 'openai', // OpenAI互換で接続
    requiresApiKey: false,
  },
  'lm-studio': {
    id: 'lm-studio',
    name: 'LM Studio（ローカル LLM）',
    keyPrefix: null,
    defaultBaseUrl: 'http://localhost:1234/v1',
    sdkType: 'openai',
    requiresApiKey: false,
  },
}
```

### ローカル LLM の注意点

| 項目             | Ollama                          | LM Studio                   |
| ---------------- | ------------------------------- | --------------------------- |
| デフォルトポート | 11434                           | 1234                        |
| CORS 設定        | `OLLAMA_ORIGINS=* ollama serve` | 設定 → Server → Enable CORS |
| APIキー          | 不要（`'local-llm'` ダミー値）  | 不要                        |
| `stream_options` | 非対応（送信しない）            | 非対応（送信しない）        |
| Vercel 環境      | ブラウザから直接接続            | ブラウザから直接接続        |

---

## 3. モデル定義とアクセス制御

### モデルマップ構造

```ts
interface ModelConfig {
  provider: string
  modelId: string // 実際の API に送るモデルID
  displayName: string
  pricing: { input: number; output: number } // $/1M tokens
  capabilities: {
    temperature: boolean // gpt-5系は false
    streaming: boolean
  }
  accessTier: 'free' | 'open' | 'locked'
  // free:   デフォルトキーで使用可能（レート制限あり）
  // open:   MyAPI モードで選択可能
  // locked: requiresUserKey で解除
}
```

### 推奨モデル構成

```ts
const MODEL_MAP = {
  // === OpenAI（5.4系に統一）===
  'gpt-5.4': {
    provider: 'openai',
    modelId: 'gpt-5.4',
    displayName: 'GPT-5.4（フル性能）',
    pricing: { input: 1.25, output: 5.0 },
    capabilities: { temperature: false, streaming: true },
    accessTier: 'locked', // キー必須
  },
  'gpt-5.4-mini': {
    provider: 'openai',
    modelId: 'gpt-5.4-mini',
    displayName: 'GPT-5.4 Mini（推奨）',
    pricing: { input: 0.3, output: 1.2 },
    capabilities: { temperature: false, streaming: true },
    accessTier: 'open', // 選択可能
  },
  'gpt-5.4-nano': {
    provider: 'openai',
    modelId: 'gpt-5.4-nano',
    displayName: 'GPT-5.4 Nano（標準）',
    pricing: { input: 0.05, output: 0.2 },
    capabilities: { temperature: false, streaming: true },
    accessTier: 'free', // デフォルト
  },

  // === Anthropic ===
  'claude-sonnet-4': {
    provider: 'anthropic',
    modelId: 'claude-sonnet-4-20250514',
    displayName: 'Claude Sonnet 4',
    pricing: { input: 3.0, output: 15.0 },
    capabilities: { temperature: true, streaming: true },
    accessTier: 'open',
  },
  'claude-haiku-3.5': {
    provider: 'anthropic',
    modelId: 'claude-3-5-haiku-20241022',
    displayName: 'Claude 3.5 Haiku（高速）',
    pricing: { input: 0.8, output: 4.0 },
    capabilities: { temperature: true, streaming: true },
    accessTier: 'open',
  },

  // === Google Gemini ===
  'gemini-2.5-flash': {
    provider: 'google',
    modelId: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    pricing: { input: 0.15, output: 0.6 },
    capabilities: { temperature: true, streaming: true },
    accessTier: 'open',
  },
}
```

---

## 4. 利用モード切替（無料版 / MyAPI）

### フロントエンド設計

```
┌─────────────────────────────────────┐
│  ◉ 無料版を使用（サーバー負担）      │
│    gpt-5.4-nano を利用可能           │
│    レート制限: 50回/24h, 毎日リセット │
│                                      │
│  ○ MyAPI を使用（ユーザー負担）      │
│    全プロバイダー選択可能             │
│    レート制限なし                     │
└─────────────────────────────────────┘
```

### バックエンド判定フロー

```ts
const createClient = (req: Request) => {
  const userApiKey = getUserApiKey(req) // body / header / query から取得
  const isValid = isValidUserApiKey(userApiKey)

  if (isValid) {
    // MyAPI モード: ユーザー指定のプロバイダー・モデルを使用
    return new LLMClient({
      provider: req.body.provider || 'openai',
      apiKey: userApiKey,
      baseUrl: req.body.baseUrl,
    })
  }

  // 無料モード: サーバーキーで gpt-5.4-nano 固定
  return new LLMClient({
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
  })
}
```

### APIキーバリデーション

```ts
const isValidUserApiKey = (key: unknown): boolean => {
  if (typeof key !== 'string' || key.trim().length === 0) return false
  if (key === 'local-llm') return true // ローカルLLM用ダミー

  const knownPrefixes = ['sk-', 'sk-ant-'] // OpenAI, Anthropic
  const hasKnownPrefix = knownPrefixes.some((p) => key.startsWith(p))
  const isValidFormat = key.length >= 20 && /^[\x21-\x7e]+$/.test(key)

  return hasKnownPrefix || isValidFormat
}
```

---

## 5. レート制限（具体実装）

### 設計方針

無料版（サーバーキー）の無制限利用を防ぐために、**IP + Cookie の二重チェック**で制限する。
MyAPI（ユーザーキー）利用時はスキップ。

### 設定変数

```ts
// 環境変数 or 定数で管理（チューニング可能）
const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS: 50, // 1日あたりの上限回数
  WINDOW_MS: 24 * 60 * 60 * 1000, // 24時間（ミリ秒）
  WINDOW_SEC: 86400, // 24時間（秒、Redis TTL 用）
  COOKIE_NAME: 'ai_chat_uid', // フィンガープリント用Cookie名
  COOKIE_MAX_AGE: 86400, // Cookie有効期間（秒）
}
```

### IP 取得（Vercel / Cloudflare / nginx 対応）

```ts
const getClientIp = (req: Request): string => {
  // Vercel
  const xForwarded = req.headers['x-forwarded-for']
  if (typeof xForwarded === 'string' && xForwarded.length > 0) {
    return xForwarded.split(',')[0].trim()
  }
  // Cloudflare
  const cfIp = req.headers['cf-connecting-ip']
  if (typeof cfIp === 'string') return cfIp
  // フォールバック
  return req.socket?.remoteAddress || 'unknown'
}
```

### Cookie ベースのフィンガープリント

IP だけでは VPN / 共有 WiFi で同一 IP の別ユーザーを区別できない。
Cookie でユニーク ID を付与して二重カウントを防ぐ。

```ts
import { randomUUID } from 'crypto'

const getOrCreateFingerprint = (req: Request, res: Response): string => {
  // 既存 Cookie があればそれを使う
  const existing = req.cookies?.[RATE_LIMIT_CONFIG.COOKIE_NAME]
  if (existing) return existing

  // なければ UUID を発行して Set-Cookie
  const uid = randomUUID()
  res.cookie(RATE_LIMIT_CONFIG.COOKIE_NAME, uid, {
    maxAge: RATE_LIMIT_CONFIG.COOKIE_MAX_AGE * 1000,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  })
  return uid
}
```

### レート制限キーの構成

```ts
// IP + Cookie UID の複合キーで制限
// → 同じ IP でも Cookie が異なれば別カウント
// → Cookie を消しても IP が同じなら引き続き制限
const getRateLimitKey = (
  ip: string,
  uid: string,
  endpoint: string
): string[] => {
  return [
    `rate:ip:${ip}:${endpoint}`, // IP ベース（Cookie 削除対策）
    `rate:uid:${uid}:${endpoint}`, // Cookie ベース（VPN 対策）
  ]
}
```

### バックエンド実装（Vercel KV / インメモリ）

```ts
// ストレージ抽象化
interface RateLimitStore {
  increment(key: string, ttlSec: number): Promise<number>
}

// --- Vercel KV（本番推奨）---
class VercelKVStore implements RateLimitStore {
  async increment(key: string, ttlSec: number): Promise<number> {
    const { kv } = await import('@vercel/kv')
    const count = await kv.incr(key)
    if (count === 1) await kv.expire(key, ttlSec) // 初回のみ TTL 設定
    return count
  }
}

// --- インメモリ（開発 / KV 未設定時のフォールバック）---
class MemoryStore implements RateLimitStore {
  private store = new Map<string, { count: number; expiresAt: number }>()

  async increment(key: string, ttlSec: number): Promise<number> {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || entry.expiresAt < now) {
      this.store.set(key, { count: 1, expiresAt: now + ttlSec * 1000 })
      return 1
    }

    entry.count++
    return entry.count
  }

  // 5分ごとに期限切れエントリを掃除
  startCleanup() {
    setInterval(
      () => {
        const now = Date.now()
        for (const [key, entry] of this.store) {
          if (entry.expiresAt < now) this.store.delete(key)
        }
      },
      5 * 60 * 1000
    )
  }
}

// ストア選択
const createStore = (): RateLimitStore => {
  if (process.env.KV_REST_API_URL) return new VercelKVStore()
  const store = new MemoryStore()
  store.startCleanup()
  return store
}

const store = createStore()
```

### メインのレート制限関数

```ts
interface RateLimitResult {
  allowed: boolean
  isValidUserKey: boolean
  remaining?: number
  resetTime?: Date
  response?: { error: string; remaining: number; resetTime: Date }
}

const applyRateLimit = async (
  req: Request,
  res: Response,
  endpoint: string,
  userApiKey: string | undefined,
  maxRequests = RATE_LIMIT_CONFIG.MAX_REQUESTS
): Promise<RateLimitResult> => {
  // MyAPI キーがあればスキップ（制限なし）
  if (isValidUserApiKey(userApiKey)) {
    return { allowed: true, isValidUserKey: true }
  }

  const ip = getClientIp(req)
  const uid = getOrCreateFingerprint(req, res)
  const keys = getRateLimitKey(ip, uid, endpoint)
  const { WINDOW_SEC } = RATE_LIMIT_CONFIG

  // IP と Cookie の両方でカウント、どちらか片方でも超過ならブロック
  const counts = await Promise.all(
    keys.map((key) => store.increment(key, WINDOW_SEC))
  )
  const maxCount = Math.max(...counts)

  // レスポンスヘッダーに残り回数を付与
  const remaining = Math.max(0, maxRequests - maxCount)
  res.setHeader('X-RateLimit-Limit', maxRequests)
  res.setHeader('X-RateLimit-Remaining', remaining)

  if (maxCount > maxRequests) {
    const resetTime = getNextMidnight()
    res.setHeader('X-RateLimit-Reset', Math.floor(resetTime.getTime() / 1000))

    return {
      allowed: false,
      isValidUserKey: false,
      response: {
        error: `1日のリクエスト上限（${maxRequests}回）に達しました。自分のAPIキーを設定すると無制限で利用できます。`,
        remaining: 0,
        resetTime,
      },
    }
  }

  return { allowed: true, isValidUserKey: false, remaining }
}

const getNextMidnight = (): Date => {
  const d = new Date()
  d.setHours(24, 0, 0, 0) // 翌日 0:00
  return d
}
```

### API エンドポイントでの使用例

```ts
// api/chat.ts
export default async (req: Request, res: Response) => {
  const userApiKey = getUserApiKey(req)
  const rateLimit = await applyRateLimit(req, res, 'chat', userApiKey)

  if (!rateLimit.allowed) {
    return res.status(429).json(rateLimit.response)
  }

  const client = createLLMClient({
    userApiKey,
    provider: req.body.provider,
    isValidUserKey: rateLimit.isValidUserKey,
  })

  // ... チャット処理
}
```

### フロントエンド側の表示

```ts
// 残り回数の表示（レスポンスヘッダーから取得）
const remaining = response.headers.get('X-RateLimit-Remaining')
if (remaining !== null) {
  setRemainingCount(parseInt(remaining, 10))
}

// 429 エラー時
if (response.status === 429) {
  const { error, resetTime } = await response.json()
  showRateLimitMessage(error, new Date(resetTime))
}
```

### 回避策への対策まとめ

| 回避手段                 | 対策                                        |
| ------------------------ | ------------------------------------------- |
| Cookie 削除              | IP ベースでも制限をかけているため回避不可   |
| VPN / IP 変更            | Cookie UID でも制限をかけているため回避不可 |
| Cookie + VPN 同時変更    | 完全には防げないが、コスト的に割に合わない  |
| ブラウザ複数起動         | Cookie は httpOnly + sameSite で保護        |
| API 直接叩き             | IP ベース制限が有効                         |
| Bot による大量リクエスト | 429 + Retry-After ヘッダーで HTTP 標準対応  |

> **設計思想**: 完璧なブロックは不可能だが、「IP + Cookie 二重制限」で
> 一般ユーザーの 99% をカバーできる。残り 1% の技術的回避は
> コスト的に MyAPI キーを取得するほうが簡単になるよう設計する。

---

## 6. SDK ルーティング（統一インターフェース）

```ts
class LLMClient {
  async *streamChat({ model, messages, temperature }) {
    const sdkType = this.providerConfig.sdkType

    switch (sdkType) {
      case 'anthropic':
        yield* this._streamAnthropic({ model, messages, temperature })
        break
      case 'google':
        yield* this._streamGoogle({ model, messages, temperature })
        break
      default:
        // openai / ollama / lm-studio / openai-compatible
        yield* this._streamOpenAI({ model, messages, temperature })
    }
  }
}
```

### プロバイダー別の特殊処理

| プロバイダー       | 特殊処理                                                                 |
| ------------------ | ------------------------------------------------------------------------ |
| OpenAI (gpt-5系)   | `max_completion_tokens`, temperature 不可                                |
| Anthropic          | system メッセージを別パラメータに分離、`max_tokens` デフォルト 4096      |
| Google Gemini      | `messages` → `contents` に変換、`assistant` → `model`、`maxOutputTokens` |
| Ollama / LM Studio | `stream_options` を送信しない、APIキー不要                               |

---

## 7. 既存ユーザーの設定マイグレーション

localStorage に旧モデル名が残っている → アップデート後にクラッシュ。

```ts
const loadConfig = () => {
  const config = JSON.parse(localStorage.getItem(KEY))

  // 存在しないモデルならデフォルトにリセット
  const allModels = Object.keys(MODEL_MAP)
  if (!allModels.includes(config.model)) {
    config.model = DEFAULT_MODEL
  }

  // ロックモデルがデフォルトキーで選択されていたらリセット
  const isDefaultKey = !config.apiKey
  if (isDefaultKey && MODEL_MAP[config.model]?.accessTier === 'locked') {
    config.model = DEFAULT_MODEL
  }

  return config
}
```

---

## 8. UI 実装の地雷

| 地雷                                         | 対策                                                                |
| -------------------------------------------- | ------------------------------------------------------------------- |
| MUI Tooltip で MenuItem を囲む               | Select の value が壊れる → HTML `title` 属性を使う                  |
| プロバイダー切替で locked モデルが選択される | `find(m => m.accessTier !== 'locked')` で最初の利用可能モデルを選ぶ |
| `config.model` が undefined                  | `(config.model ?? '').includes(...)` で防御                         |
| ローカルLLM で CORS エラー                   | Ollama: `OLLAMA_ORIGINS=*`、LM Studio: CORS 有効化                  |

---

## 9. AI プロンプト（他リポジトリ向け・コピペ用）

```
このリポジトリの AI チャット機能を GPT-5.4 系 + マルチプロバイダーにアップデートしてください。

## アーキテクチャ

### 利用モード
- 無料版: gpt-5.4-nano（デフォルト）、サーバーキー使用、レート制限 50回/24h
- MyAPI: ユーザーが自分のキーを入力、全プロバイダー・全モデル選択可能、制限なし

### プロバイダー（6種）
- OpenAI: sdkType='openai', gpt-5.4 / gpt-5.4-mini / gpt-5.4-nano
- Anthropic: sdkType='anthropic', Claude Sonnet 4 / Haiku 3.5
- Google Gemini: sdkType='google', Gemini 2.5 Flash
- OpenAI互換: sdkType='openai', ユーザーがURL指定
- Ollama: sdkType='openai', localhost:11434, APIキー不要
- LM Studio: sdkType='openai', localhost:1234, APIキー不要

### モデルアクセス制御
- gpt-5.4-nano: accessTier='free' → デフォルト、無料で使える
- gpt-5.4-mini: accessTier='open' → MyAPI 設定済みなら選択可能
- gpt-5.4: accessTier='locked' → ユーザーがOpenAIキーを入力したら解除

## 必須対応（この順序で実施）

### Step 1: API パラメータ変更
- gpt-5 系（model名に "gpt-5" を含む）:
  - `max_tokens` → `max_completion_tokens`（nano: 4000, mini/フル: 16000）
  - `temperature` を削除（指定するとエラー）
- Anthropic: system メッセージを messages から分離、max_tokens=4096
- Google: messages → contents 変換、maxOutputTokens
- ローカルLLM: stream_options を送信しない

### Step 2: プロバイダー定義
- PROVIDERS オブジェクトに6プロバイダーを定義
- sdkType で SDK ルーティング（openai / anthropic / google）
- ローカルLLM は requiresApiKey: false

### Step 3: モデルリスト更新
- OpenAI: gpt-5.4 / gpt-5.4-mini / gpt-5.4-nano のみ
- 旧モデル（gpt-5-*, gpt-4.1-*）を全て削除
- accessTier で free / open / locked を制御

### Step 4: 設定マイグレーション
- loadConfig で存在しないモデルをデフォルトにリセット
- locked モデルがデフォルトキーで選択されていたらリセット

### Step 5: レート制限（バックエンドがある場合）
- isValidUserApiKey() → true ならスキップ
- false なら IP + endpoint でカウント、24h ウィンドウ
- 上限超過時: 429 + 「APIキーを設定してください」

### Step 6: 環境変数
- DEFAULT_MODEL / .env / CI を全て gpt-5.4-nano に統一

### Step 7: テスト
- baseConfig.model を gpt-5.4-nano に
- max_completion_tokens アサーション
- プロバイダー別のストリーミングテスト追加
```

---

## 10. パッケージ化の検討

### 現状の再利用性

| コンポーネント   | kaze-ux       | advisea-pro      | 共通化の価値 |
| ---------------- | ------------- | ---------------- | ------------ |
| プロバイダー定義 | 2プロバイダー | 6プロバイダー    | ◎ 高い       |
| モデルマップ     | フロントのみ  | フロント+バック  | ◎ 高い       |
| API コール       | fetch 直接    | LLMClient クラス | ○ 中程度     |
| レート制限       | なし          | Vercel KV        | △ 環境依存   |
| UI（設定パネル） | MUI           | 独自 HTML        | × 低い       |

### 推奨パッケージ構成

```
packages/llm-core/
├── src/
│   ├── providers.ts       # PROVIDERS レジストリ
│   ├── models.ts          # MODEL_MAP + accessTier
│   ├── client.ts          # LLMClient（統一ストリーミング）
│   ├── rate-limiter.ts    # IP ベースレート制限
│   ├── api-key-validator.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 導入パス

1. **最小**: `providers.ts` + `models.ts` を各リポジトリにコピー
2. **中間**: pnpm workspace の内部パッケージとして `packages/llm-core`
3. **本格**: npm パッケージとして公開（`@kaze/llm-core`）

### Claude Code スキル化

```yaml
# .claude/skills/model-upgrade.md
name: model-upgrade
description: AI チャットのモデルを GPT-5.4 + マルチプロバイダーに移行
```

→ `/model-upgrade` で呼び出せるスキルとして登録可能。
ただしリポジトリ固有のファイル構造に依存するため、
プロンプト（セクション9）のほうが汎用性が高い。

---

## 11. よくある失敗パターン

| 症状                     | 原因                         | 対策                                |
| ------------------------ | ---------------------------- | ----------------------------------- |
| API 400 エラー           | gpt-5系に `temperature` 指定 | capabilities.temperature で分岐     |
| API 400 エラー           | gpt-5系に `max_tokens` 使用  | `max_completion_tokens` に変更      |
| Anthropic エラー         | system が messages 内にある  | system メッセージを分離             |
| Gemini エラー            | role が `assistant`          | `model` に変換                      |
| ローカルLLM タイムアウト | `stream_options` 送信        | ローカルLLM では省略                |
| CORS エラー              | Ollama/LM Studio の設定不足  | 起動オプション / 設定で CORS 有効化 |
| UI クラッシュ            | config.model undefined       | null safety `(model ?? '')`         |
| UI クラッシュ            | Tooltip + MenuItem           | HTML title 属性に変更               |
| 旧モデルでクラッシュ     | localStorage に残存          | loadConfig でバリデーション         |
