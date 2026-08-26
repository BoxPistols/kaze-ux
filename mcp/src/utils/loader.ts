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

import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

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
/**
 * ファイルを読み、**更新されていたら読み直す**キャッシュ。
 *
 * 以前はプロセス生存中ずっと最初の内容を返していた。MCP サーバは
 * エディタが起動している間ずっと動いているので、**デザインシステム側が
 * トークンや部品仕様を更新しても、消費側は再起動するまで古い値を受け取る**。
 *
 * 実際に踏んだ。`metadata/components.json` に sample を 19 件足した直後に
 * `get_component('statusTag')` を呼んだら、sample の無い古い応答が返った。
 * 気づきにくいのは、**古い値も正しい形をしている**こと。「まだ sample が
 * 無い部品なのだろう」と読める。
 *
 * これは MCP が単一ソースの「古い写し」になる、という設計違反そのもの。
 * mtime を見て変わっていれば読み直す
 */
const fileCache = new Map<string, { mtimeMs: number; text: string }>()

const readCached = (path: string): string => {
  const mtimeMs = statSync(path).mtimeMs
  const hit = fileCache.get(path)
  if (hit && hit.mtimeMs === mtimeMs) return hit.text
  const text = readFileSync(path, 'utf-8')
  fileCache.set(path, { mtimeMs, text })
  return text
}

/**
 * design-tokens/tokens.json を読み込み
 */
export const loadTokens = (): Record<string, unknown> => {
  const path = dataPath(
    'DS_TOKENS_PATH',
    'design-tokens/tokens.json',
    'tokens.json'
  )
  return JSON.parse(readCached(path)) as Record<string, unknown>
}

/**
 * metadata/components.json を読み込み
 */
export const loadComponents = (): Record<string, unknown> => {
  const path = dataPath(
    'DS_COMPONENTS_PATH',
    'metadata/components.json',
    'components.json'
  )
  return JSON.parse(readCached(path)) as Record<string, unknown>
}

/**
 * foundations/prohibited.md を読み込み
 */
export const loadProhibited = (): string => {
  const path = dataPath(
    'DS_RULES_PATH',
    'foundations/prohibited.md',
    'prohibited.md'
  )
  return readCached(path)
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

/**
 * 禁止パターンの**検出器**を読む。
 *
 * ルールの説明文（prohibited.md）と検出ロジックは別物で、後者は関数なので
 * markdown には載らない。だが**説明文だけ配って検出を別実装すると、
 * 同じ ID で違うものを検査する**ことになる。実際そうなっていた:
 * `check-rule.ts` が独自にパターンを持ち、A01 を「24x24 未満の操作対象」
 * ではなく「IconButton の aria-label 欠落」として検査していた。
 * 違反理由が実際の検出内容と食い違って表示される、検出漏れより悪い状態。
 *
 * なので検出器も `scripts/lib/ds-rules.mjs` から読む。探す順は
 * `dataPath` と同じ考え方（リポジトリ → 同梱物）。
 *
 * **見つからなければ空を返す。**別のデザインシステムを `DS_ROOT` で
 * 指している場合、そこに kaze の検出器は無い。そこで kaze のルールを
 * 当てると、相手のデザインシステムを kaze の基準で採点することになる。
 * 呼び出し側は「検出器が無い」ことを利用者に伝える責任がある
 * （「違反なし」と言ってはいけない）。
 */
export interface RuleDetector {
  id: string
  detect: (src: string) => Array<{ line: number; text: string }>
}

export interface DetectorSet {
  detectors: RuleDetector[]
  /** どこから読めたか。'none' のとき検査は成立していない */
  source: 'repo' | 'bundled' | 'none'
}

let detectorCache: DetectorSet | null = null

export const loadRuleDetectors = async (): Promise<DetectorSet> => {
  if (detectorCache) return detectorCache

  const candidates: Array<{ path: string; source: 'repo' | 'bundled' }> = [
    { path: resolve(ROOT, 'scripts/lib/ds-rules.mjs'), source: 'repo' },
  ]
  // 明示的に別プロジェクトを指しているなら、同梱物へは降りない
  if (!process.env.DS_ROOT) {
    candidates.push({
      path: resolve(PKG_ROOT, 'data', 'ds-rules.mjs'),
      source: 'bundled',
    })
  }

  for (const c of candidates) {
    if (!existsSync(c.path)) continue
    const mod = (await import(pathToFileURL(c.path).href)) as {
      DETECTABLE_RULES?: RuleDetector[]
    }
    const detectors = mod.DETECTABLE_RULES ?? []
    detectorCache = { detectors, source: c.source }
    return detectorCache
  }

  detectorCache = { detectors: [], source: 'none' }
  return detectorCache
}
