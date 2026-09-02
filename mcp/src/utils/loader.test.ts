import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  utimesSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** このテストファイルのあるディレクトリから見た `mcp/` */
const PKG_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * データを更新したら、**サーバを再起動せずに**反映されることを固定する。
 *
 * 以前はプロセス生存中ずっと最初に読んだ内容を返していた。MCP サーバは
 * エディタが起動している間ずっと動いているので、デザインシステム側が
 * 部品仕様を更新しても消費側は古い値を受け取り続ける。
 *
 * 気づきにくいのは**古い値も正しい形をしている**こと。sample を 19 件
 * 足した直後に `get_component` を呼んで sample の無い応答が返ったが、
 * 「まだ sample が無い部品なのだろう」と読めてしまう。
 */
describe('データ更新がサーバ再起動なしで反映される', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'kaze-loader-'))
    process.env.DS_COMPONENTS_PATH = join(dir, 'components.json')
    // DS_ROOT を立てないと、実体が無いときに同梱データへ落ちてしまう
    process.env.DS_ROOT = dir
  })

  afterEach(() => {
    delete process.env.DS_COMPONENTS_PATH
    delete process.env.DS_ROOT
    rmSync(dir, { recursive: true, force: true })
  })

  const write = (sample: string) =>
    writeFileSync(
      join(dir, 'components.json'),
      JSON.stringify({ components: { demo: { name: 'Demo', sample } } })
    )

  it('書き換えた内容が次の読み込みで見える', async () => {
    const { loadComponents } = await import('./loader.js')
    write('<Demo a />')
    const first = loadComponents() as {
      components: Record<string, { sample: string }>
    }
    expect(first.components.demo.sample).toBe('<Demo a />')

    write('<Demo b />')
    const second = loadComponents() as {
      components: Record<string, { sample: string }>
    }
    // ここが古い値のままだと、消費側は再起動するまで気づけない
    expect(second.components.demo.sample).toBe('<Demo b />')
  })
})

/**
 * 検出器も同じく、書き換えたら再起動なしで反映されることを固定する。
 *
 * トークン・部品仕様・prohibited の 3 つは mtime を見て読み直すのに、
 * `ds-rules.mjs` だけがモジュールスコープのキャッシュと ESM の
 * モジュールキャッシュで二重に固定され、更新経路が違っていた。
 * 同じ `sync-mcp-data.mjs` が配る 4 ファイルの 1 つなのに、そのことは
 * どこにも書かれていなかった。
 *
 * 実害は古いルールで検査することよりも、`check-rule.ts` が
 * 「検査したルール: ...」と一覧を出す点にある。実際には検査していない
 * ルール集合を、検査したと能動的に主張してしまう。
 */
describe('検出器の更新がサーバ再起動なしで反映される', () => {
  let dir: string
  let rulesPath: string

  beforeEach(() => {
    // vitest は project の外にある file URL を動的 import で解決できない
    // （os の一時ディレクトリに置くと「Does the file exist?」で落ちる）。
    // 本番と同じ import 経路を通したいので、リポジトリの中に作る
    dir = mkdtempSync(resolve(PKG_DIR, '.tmp-detectors-'))
    mkdirSync(join(dir, 'scripts', 'lib'), { recursive: true })
    rulesPath = join(dir, 'scripts', 'lib', 'ds-rules.mjs')
    // ROOT はモジュール評価時に決まるので、読み込む前に立てて resetModules する
    process.env.DS_ROOT = dir
    vi.resetModules()
  })

  afterEach(() => {
    delete process.env.DS_ROOT
    rmSync(dir, { recursive: true, force: true })
    vi.resetModules()
  })

  /** mtime を明示的に進める。同一ミリ秒での 2 回書き込みに依存しない */
  const writeRules = (id: string, ageSeconds: number) => {
    writeFileSync(
      rulesPath,
      `export const DETECTABLE_RULES = [{ id: '${id}', detect: () => [] }]\n`
    )
    const t = new Date(Date.now() + ageSeconds * 1000)
    utimesSync(rulesPath, t, t)
  }

  it('書き換えた検出器が次の呼び出しで見える', async () => {
    const { loadRuleDetectors } = await import('./loader.js')

    writeRules('X1', 0)
    const first = await loadRuleDetectors()
    expect(first.source).toBe('repo')
    expect(first.detectors.map((d) => d.id)).toEqual(['X1'])

    writeRules('X2', 10)
    const second = await loadRuleDetectors()
    // ここが X1 のままだと、check_rule は存在しないルール集合を
    // 「検査した」と報告し続ける
    expect(second.detectors.map((d) => d.id)).toEqual(['X2'])
  })

  it('変わっていなければ読み直さない（mtime が同じ間はキャッシュを返す）', async () => {
    const { loadRuleDetectors } = await import('./loader.js')

    writeRules('Y1', 0)
    const a = await loadRuleDetectors()
    const b = await loadRuleDetectors()
    // 同じ配列インスタンスが返る = import し直していない
    expect(b.detectors).toBe(a.detectors)
  })

  it('実体が無い状態を覚えない（あとから置かれたら見える）', async () => {
    const { loadRuleDetectors } = await import('./loader.js')

    const empty = await loadRuleDetectors()
    expect(empty.source).toBe('none')

    writeRules('Z1', 0)
    const found = await loadRuleDetectors()
    expect(found.source).toBe('repo')
    expect(found.detectors.map((d) => d.id)).toEqual(['Z1'])
  })
})
