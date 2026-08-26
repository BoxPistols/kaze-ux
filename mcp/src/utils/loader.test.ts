import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

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
