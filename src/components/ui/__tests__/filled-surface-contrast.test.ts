import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { COLOR_SCHEMES, getThemeColorData } from '../../../themes/colorToken'
import { CONTRAST_THRESHOLD, contrastRatio } from '../../../themes/contrast'

/**
 * 塗り面の上に載せる文字色を固定していないこと。
 *
 * `common.white` を塗り面の前景に直書きすると、明るい塗り色 (success /
 * warning / info) と dark の塗り色で読めなくなる。実測では
 * IconButton の filled が 36 通り (色 6 x スキーム 3 x モード 2) のうち
 * **27 通りで 3:1 に届いていなかった**。dark は全色不合格で info は 1.77:1。
 *
 * statusTag.tsx には同じ趣旨の注意書きがコメントで書いてあったが、
 * **コメントは検査されない**ので同じ間違いが 2 箇所で再発した。
 * 走査で止める。
 */
const ROOT = resolve(__dirname, '..', '..', '..', '..')
const SCAN_DIRS = ['src/components', 'src/layouts', 'src/pages']
const SKIP = /(__tests__|\.test\.|\.stories\.)/

const collect = (dir: string): string[] => {
  const abs = resolve(ROOT, dir)
  const out: string[] = []
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    const p = join(abs, entry.name)
    if (entry.isDirectory()) out.push(...collect(relative(ROOT, p)))
    else if (/\.tsx?$/.test(entry.name) && !SKIP.test(p)) out.push(p)
  }
  return out
}

/** 塗り面の指定の近くで前景色を固定している行 */
const fixedForegroundOnFill = (file: string) => {
  const lines = readFileSync(file, 'utf-8').split('\n')
  const hits: Array<{ line: number; text: string }> = []
  for (let i = 0; i < lines.length; i++) {
    if (!/color:\s*'common\.(white|black)'/.test(lines[i])) continue
    // 同じスタイル定義の中に塗りの指定があるか。前後 6 行で見る
    const around = lines.slice(Math.max(0, i - 6), i + 7).join('\n')
    if (!/bgcolor:|backgroundColor:/.test(around)) continue
    hits.push({ line: i + 1, text: lines[i].trim() })
  }
  return hits
}

const SEMANTIC = [
  'primary',
  'secondary',
  'success',
  'error',
  'warning',
  'info',
] as const

describe('塗り面の上の前景色', () => {
  it('common.white / common.black を塗り面の前景に直書きしない', () => {
    const found: string[] = []
    for (const dir of SCAN_DIRS) {
      for (const file of collect(dir)) {
        for (const hit of fixedForegroundOnFill(file)) {
          found.push(`${relative(ROOT, file)}:${hit.line}  ${hit.text}`)
        }
      }
    }
    // 落ちたら contrastText を使う。スキームやモードを足しても追従する
    expect(found).toEqual([])
  })
})

describe('contrastText が塗り面の上で読める', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const mode of ['light', 'dark'] as const) {
      it(`${scheme}/${mode}: 全色で UI 基準 (3:1) を満たす`, () => {
        const colors = getThemeColorData(mode, scheme)
        for (const name of SEMANTIC) {
          const set = colors[name]
          const ratio = contrastRatio(set.contrastText, set.main)
          expect(
            ratio,
            `${scheme}/${mode}/${name}: ${ratio.toFixed(2)}:1`
          ).toBeGreaterThanOrEqual(CONTRAST_THRESHOLD.ui)
        }
      })

      it(`${scheme}/${mode}: 白を固定していたら落ちる水準であること`, () => {
        // なぜ contrastText が要るのかを、数字として残す。
        // 白のままだと満たせない組み合わせが実在する
        const colors = getThemeColorData(mode, scheme)
        const failing = SEMANTIC.filter(
          (name) =>
            contrastRatio('#ffffff', colors[name].main) < CONTRAST_THRESHOLD.ui
        )
        expect(failing.length).toBeGreaterThan(0)
      })
    }
  }
})
