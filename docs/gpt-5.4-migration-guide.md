# GPT-5.4 モデルアップデート ガイド

> 他リポジトリで AI チャット機能のモデルを GPT-5.4 系に移行するための再現可能な手順書。
> kaze-ux での実体験に基づく。

---

## 1. GPT-5.4 系の API 仕様差分（最重要）

### 破壊的変更: リクエストパラメータ

| パラメータ     | gpt-4.1 系     | gpt-5.4 系                         |
| -------------- | -------------- | ---------------------------------- |
| トークン上限   | `max_tokens`   | `max_completion_tokens`            |
| temperature    | `0.7` 等を指定 | **指定しない**（指定するとエラー） |
| レスポンス形式 | 同じ           | 同じ                               |
| エンドポイント | 同じ           | 同じ                               |

```ts
// ❌ gpt-5.4 で失敗するリクエスト
{
  model: 'gpt-5.4-nano',
  max_tokens: 4000,       // → max_completion_tokens を使う
  temperature: 0.7,       // → 指定しない
}

// ✅ 正しいリクエスト
{
  model: 'gpt-5.4-nano',
  max_completion_tokens: 4000,
  // temperature は省略
}
```

### 実装パターン（コピペ可）

```ts
const isNewGen = model.includes('gpt-5') || model.includes('o1')

if (isNewGen) {
  const isNano = model.includes('nano')
  body.max_completion_tokens = isNano ? 4000 : 16000
  // temperature は指定しない
} else {
  body.max_tokens = 4000
  body.temperature = 0.7
}
```

### なぜ nano は 4000 で十分か

- nano はコスト最適化モデル。出力が長すぎるとコストと遅延が増す
- チャットUI の 1 回答は通常 500〜2000 トークン
- mini/フル は推論チェーンでトークンを消費するため 16000 を確保

---

## 2. モデルリスト定義

### 推奨構成（3モデル）

```ts
const OPENAI_MODELS = [
  {
    value: 'gpt-5.4',
    label: 'gpt-5.4',
    tier: 'premium',
    requiresUserKey: true, // デフォルトキーでは使えない
  },
  {
    value: 'gpt-5.4-mini',
    label: 'gpt-5.4-mini (推奨)',
    tier: 'premium',
  },
  {
    value: 'gpt-5.4-nano',
    label: 'gpt-5.4-nano (標準)',
    tier: 'standard',
    // これを DEFAULT_MODEL にする
  },
]
```

### 旧モデルは削除する

- `gpt-5-mini` / `gpt-5-nano` → 5.4 が上位互換
- `gpt-4.1-*` → 2世代前、API仕様も異なるため保守コストが増す
- 残すとユーザーが古いモデルを選び続けて品質低下の原因になる

---

## 3. 既存ユーザーの設定マイグレーション（必ず踏む地雷）

### 問題

localStorage に `{ model: 'gpt-4.1-nano' }` が保存されている既存ユーザーが、
アップデート後にモデル一覧に存在しないモデルを参照してクラッシュする。

### 解決: loadConfig 時にバリデーション

```ts
const loadConfig = () => {
  const config = JSON.parse(localStorage.getItem(KEY))

  // 存在しないモデルならデフォルトにリセット
  const allModels = [...OPENAI_MODELS, ...GEMINI_MODELS]
  if (!allModels.find((m) => m.value === config.model)) {
    config.model = DEFAULT_MODEL
  }

  // ロックモデルがデフォルトキーで選択されていたらリセット
  const isDefaultKey = !config.apiKey || config.apiKey === DEFAULT_API_KEY
  if (isDefaultKey) {
    const selected = allModels.find((m) => m.value === config.model)
    if (selected?.requiresUserKey) {
      config.model = DEFAULT_MODEL
    }
  }

  return config
}
```

---

## 4. UI 実装の注意点

### MUI Select + disabled MenuItem

```tsx
// ❌ Tooltip で MenuItem を囲むと Select の value が壊れる
<Tooltip title="ロック中">
  <MenuItem value="gpt-5.4" disabled>...</MenuItem>
</Tooltip>

// ✅ HTML title 属性を使う
<MenuItem
  value="gpt-5.4"
  disabled={isLocked}
  title={isLocked ? 'APIキーを設定すると使用できます' : undefined}
>
  {isLocked && <LockIcon />}
  ...
</MenuItem>
```

### プロバイダー切替時のデフォルトモデル

```tsx
// ❌ リストの先頭がロックモデルだとクラッシュ
const defaultModel = OPENAI_MODELS[0].value // → gpt-5.4 (locked!)

// ✅ ロックされていないモデルを探す
const defaultModel = (
  OPENAI_MODELS.find((m) => !m.requiresUserKey) ?? OPENAI_MODELS[0]
).value
```

### null safety

```tsx
// ❌ config.model が undefined になるケースがある
config.model
  .includes('gemini')(
    // ✅ 防御
    config.model ?? ''
  )
  .includes('gemini')
```

---

## 5. 環境変数・デプロイ設定

```env
# .env / .env.example
VITE_OPENAI_MODEL=gpt-5.4-nano

# CI/CD（GitHub Actions, Vercel 等）
VITE_OPENAI_MODEL: 'gpt-5.4-nano'
```

`DEFAULT_MODEL` 定数、`.env.example`、CI設定の **3箇所を同時に更新** すること。

---

## 6. テスト更新チェックリスト

- [ ] `baseConfig.model` を `gpt-5.4-nano` に変更
- [ ] `max_tokens` → `max_completion_tokens` のアサーション変更
- [ ] `temperature` のアサーションを `toBeUndefined()` に
- [ ] 旧モデル名のテストケースを削除 or 5.4 系に置換
- [ ] `loadConfig` のマイグレーションテスト追加

---

## 7. AI プロンプト（他リポジトリで使用）

以下のプロンプトをそのまま AI エージェントに渡すと、移行が一度で成功する：

```
このリポジトリの AI チャット機能のモデルを GPT-5.4 系にアップデートしてください。

## 必須対応（この順序で実施）

### Step 1: API リクエストパラメータ変更
- gpt-5 系（model名に "gpt-5" を含む）では:
  - `max_tokens` → `max_completion_tokens` に変更
  - nano モデル: 4000、mini/フル: 16000
  - `temperature` パラメータを削除（指定するとエラー）
- 判定: `model.includes('gpt-5') || model.includes('o1')`

### Step 2: モデルリスト更新
- 残すモデル: gpt-5.4 / gpt-5.4-mini / gpt-5.4-nano のみ
- gpt-5.4: requiresUserKey: true（キー入力で解除）
- gpt-5.4-nano をデフォルトモデルに設定
- 旧モデル（gpt-5-*, gpt-4.1-*）は全て削除

### Step 3: 設定マイグレーション
- loadConfig で存在しないモデルをデフォルトにリセット
- requiresUserKey モデルがデフォルトキーで選択されていたらリセット

### Step 4: UI の防御
- config.model が undefined の場合の null safety: (config.model ?? '')
- MUI Select 内の MenuItem を Tooltip で囲まない（title 属性を使う）
- プロバイダー切替でロックモデルが選択されないようにする

### Step 5: 環境変数の統一
- DEFAULT_MODEL 定数、.env.example、CI設定を全て gpt-5.4-nano に

### Step 6: テスト
- baseConfig.model を gpt-5.4-nano に
- max_tokens → max_completion_tokens のアサーション変更
- 旧モデルのテストケースを削除
```

---

## 8. よくある失敗パターン

| 症状                                        | 原因                         | 対策                           |
| ------------------------------------------- | ---------------------------- | ------------------------------ |
| API 400 エラー                              | `temperature` を指定         | gpt-5系では省略                |
| API 400 エラー                              | `max_tokens` を使用          | `max_completion_tokens` に変更 |
| UI クラッシュ: "includes is not a function" | config.model が undefined    | null safety 追加               |
| UI クラッシュ: Select の value が undefined | Tooltip で MenuItem をラップ | title 属性に変更               |
| ページリロードでモデルがリセット            | localStorage の旧モデル名    | loadConfig でバリデーション    |
| ロックモデルが選択される                    | プロバイダー切替時           | requiresUserKey チェック       |
