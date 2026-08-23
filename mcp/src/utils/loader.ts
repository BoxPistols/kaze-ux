/**
 * デザインシステムデータの読み込み・キャッシュ
 *
 * ## 他プロジェクトで使う
 *
 * このサーバーは kaze-ux 専用ではない。**同じ形のファイルを置けば動く**。
 * 参照先は環境変数で差し替えられる。
 *
 * | 環境変数 | 既定 | 中身 |
 * | --- | --- | --- |
 * | `DS_ROOT` | リポジトリルート | 下 3 つの基準ディレクトリ |
 * | `DS_TOKENS_PATH` | `design-tokens/tokens.json` | W3C DTCG トークン |
 * | `DS_COMPONENTS_PATH` | `metadata/components.json` | 部品のメタデータ |
 * | `DS_RULES_PATH` | `foundations/prohibited.md` | 禁止パターン |
 *
 * 既定値はこのリポジトリの配置なので、**何も設定しなければ従来どおり動く**。
 *
 * npm から入れた場合はリポジトリのルートが存在しないので、パッケージに
 * 同梱した `data/` へ落ちる（`dataPath` を参照）。
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * 基準ディレクトリ。
 *
 * 既定は「mcp/ の 2 つ上」= リポジトリルート。別リポジトリから使う場合は
 * `DS_ROOT` に対象プロジェクトのルートを渡す
 */
const ROOT = process.env.DS_ROOT
  ? resolve(process.env.DS_ROOT)
  : resolve(__dirname, '..', '..', '..')

/** パッケージのルート。`src/utils` と `dist/utils` のどちらから見ても `mcp/` */
const PKG_ROOT = resolve(__dirname, '..', '..')

/**
 * データの実体を探す。
 *
 * 1. 環境変数の明示指定があればそれだけを見る
 * 2. 無ければ `ROOT` 基準の既定パス（リポジトリの中で動かす通常のケース）
 * 3. それも無ければパッケージ同梱の `data/`（npm から入れたケース）
 *
 * 3 が要るのは、`npx kaze-mcp` が node_modules の中で動くから。リポジトリの
 * ルートはそこに無いので、同梱しないと**起動はするのに中身だけ空**になる。
 *
 * ただし `DS_ROOT` や個別パスを明示している人は、自分のデザインシステムを
 * 指している。そこに実体が無いのは設定ミスなので、**kaze のデータで穴を
 * 埋めない**。黙って別物を返すより、どこを見て失敗したかを言って落ちる。
 */
const dataPath = (
  envVar: string,
  fallback: string,
  bundled: string
): string => {
  const configured = process.env[envVar]
  if (configured) return resolve(ROOT, configured)

  const fromRoot = resolve(ROOT, fallback)
  if (existsSync(fromRoot)) return fromRoot

  // 明示的に別プロジェクトを指しているなら、同梱データへは降りない
  if (!process.env.DS_ROOT) {
    const fromPackage = resolve(PKG_ROOT, 'data', bundled)
    if (existsSync(fromPackage)) return fromPackage
  }

  throw new Error(
    `デザインシステムのデータが見つかりません (${fallback})。探した場所:\n` +
      `  ${fromRoot}\n` +
      (process.env.DS_ROOT
        ? `  DS_ROOT=${process.env.DS_ROOT} を指定しているため同梱データは使いません。` +
          `${envVar} で個別に指すこともできます`
        : `  ${resolve(PKG_ROOT, 'data', bundled)}`)
  )
}

// キャッシュ
let tokensCache: Record<string, unknown> | null = null
let componentsCache: Record<string, unknown> | null = null
let prohibitedCache: string | null = null

/**
 * design-tokens/tokens.json を読み込み
 */
export const loadTokens = (): Record<string, unknown> => {
  if (tokensCache) return tokensCache
  const path = dataPath(
    'DS_TOKENS_PATH',
    'design-tokens/tokens.json',
    'tokens.json'
  )
  tokensCache = JSON.parse(readFileSync(path, 'utf-8')) as Record<
    string,
    unknown
  >
  return tokensCache
}

/**
 * metadata/components.json を読み込み
 */
export const loadComponents = (): Record<string, unknown> => {
  if (componentsCache) return componentsCache
  const path = dataPath(
    'DS_COMPONENTS_PATH',
    'metadata/components.json',
    'components.json'
  )
  componentsCache = JSON.parse(readFileSync(path, 'utf-8')) as Record<
    string,
    unknown
  >
  return componentsCache
}

/**
 * foundations/prohibited.md を読み込み
 */
export const loadProhibited = (): string => {
  if (prohibitedCache) return prohibitedCache
  const path = dataPath(
    'DS_RULES_PATH',
    'foundations/prohibited.md',
    'prohibited.md'
  )
  prohibitedCache = readFileSync(path, 'utf-8')
  return prohibitedCache
}

/**
 * ドットパスでネストされたオブジェクトの値を取得
 * 例: resolveTokenPath(tokens, 'color.light.primary.main')
 */
export const resolveTokenPath = (
  obj: Record<string, unknown>,
  path: string
): unknown => {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (typeof current !== 'object' || current === null) return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

// 禁止パターンのルール定義
export interface ProhibitedRule {
  id: string
  pattern: string
  /** 代わりに何を使うか */
  reason: string
  category: string
  /** 何がこのルールを止めるか。未設定なら「止めるものが無い」 */
  enforcedBy?: string
}

/**
 * prohibited.md からルールをパース。
 *
 * 列数を決め打ちしない。3 列前提の正規表現で書いていたところに列が
 * 2 つ増えたとき、**エラーは出ず 3 列目以降が 1 つのセルに融合した**
 * （「代わりに | 強制 | 自動計測」が理由欄に丸ごと入った）。
 * 表の形が変わっても壊れないよう、素直にセルへ分割する。
 */
export const parseProhibitedRules = (): ProhibitedRule[] => {
  const md = loadProhibited()
  const rules: ProhibitedRule[] = []
  let currentCategory = ''

  for (const line of md.split('\n')) {
    const headingMatch = line.match(/^## (.+)/)
    if (headingMatch) {
      currentCategory = headingMatch[1]
      continue
    }

    if (!line.trim().startsWith('|')) continue
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim().replace(/`/g, ''))
    if (cells.length < 2) continue

    const [id, pattern, instead, enforcedBy] = cells
    // 見出し行と区切り行を除く
    if (!id || id === 'ID' || /^-+$/.test(id)) continue
    // ID は英数字のみ（C01 / AI03 等）。本文中の表を拾わない
    if (!/^[A-Z]+\d+$/.test(id)) continue

    rules.push({
      id,
      pattern,
      reason: instead ?? '',
      category: currentCategory,
      ...(enforcedBy && !enforcedBy.startsWith('**なし') ? { enforcedBy } : {}),
    })
  }

  return rules
}
