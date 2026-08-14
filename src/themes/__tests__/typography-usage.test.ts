import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * タイポグラフィの禁止パターンをリポジトリ全体で機械的に止める。
 *
 * 対象は 2 つ。
 *
 * 1. **12px 未満のフォントサイズ**
 *    実測で 201 story に 437 箇所あり、最小は 8.4px だった。小さすぎる文字は
 *    読めないだけでなく、ブラウザの拡大に頼る前提の設計になってしまう。
 *
 * 2. **400 / 700 以外のフォントウェイト**
 *    直書き 528 箇所に 200/300/380/400/420/500/600/700/800/900 の 10 種類が
 *    混在していた。380 や 420 のように由来を説明できない値まであった。
 *    「少し強調」に対する正解が人によって違うと、レビューで判断できない。
 *
 * どちらも人が気をつけるより、混入した時点で落とす方が安い。
 *
 * **rem の基準は 14px**（`MuiCssBaseline` が `html { font-size: 14px }` を
 * 設定している）。`0.857rem` は 11.998px で下限を割るので、トークンと同じ
 * `0.86rem` (12.04px) を使うこと。
 */

const BASE_FONT_SIZE = 14
const MIN_PX = 12
const ALLOWED_WEIGHTS = new Set([400, 700])

const ROOTS = ['src', 'apps', '.storybook']
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'coverage',
  'storybook-static',
  '__tests__',
])
// .css / .html まで見る。最初 .ts/.tsx だけを走査して緑にしたが、実ビルドを
// ブラウザで測ると 440 箇所が残っていた。指定の形式は 1 つではない
const EXTENSIONS = ['.ts', '.tsx', '.css', '.html']

const collect = (dir: string, out: string[] = []): string[] => {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      collect(full, out)
    } else if (EXTENSIONS.some((ext) => entry.endsWith(ext))) {
      out.push(full)
    }
  }
  return out
}

const FILES = ROOTS.flatMap((r) => collect(r))

interface Hit {
  file: string
  line: number
  text: string
}

/**
 * コメントを落とす。禁止値を説明する文（「以前は 10px だった」等）を
 * 違反として拾ってしまうと、規約を文書化できなくなる
 */
const stripComments = (line: string): string => {
  const t = line.trim()
  if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) return ''
  return line.replace(/\/\/.*$/, '')
}

const scan = (re: RegExp, judge: (m: RegExpExecArray) => boolean): Hit[] => {
  const hits: Hit[] = []
  for (const file of FILES) {
    const src = readFileSync(file, 'utf8')
    src.split('\n').forEach((raw, i) => {
      const text = stripComments(raw)
      if (!text) return
      const rx = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
      let m: RegExpExecArray | null
      while ((m = rx.exec(text)) !== null) {
        if (judge(m)) hits.push({ file, line: i + 1, text: text.trim().slice(0, 96) })
      }
    })
  }
  return hits
}

const format = (hits: Hit[]) => hits.map((h) => `${h.file}:${h.line}  ${h.text}`)

describe('フォントサイズの下限', () => {
  it('走査対象を取りこぼしていない', () => {
    // 対象が 0 件だと、以下の検査が「何も見ずに緑」になる
    expect(FILES.length).toBeGreaterThan(100)
  })

  it(`rem 指定が ${MIN_PX}px を下回らない`, () => {
    const hits = scan(
      /fontSize: *'([0-9.]+)rem'/,
      (m) => Number.parseFloat(m[1]) * BASE_FONT_SIZE < MIN_PX
    )
    expect(format(hits), `rem × ${BASE_FONT_SIZE}px が ${MIN_PX}px 未満`).toEqual([])
  })

  it(`px 指定が ${MIN_PX}px を下回らない`, () => {
    const hits = scan(
      /fontSize: *'([0-9.]+)px'/,
      (m) => Number.parseFloat(m[1]) < MIN_PX
    )
    expect(format(hits), `${MIN_PX}px 未満の直接指定`).toEqual([])
  })

  it(`単位なしの数値指定が ${MIN_PX} を下回らない`, () => {
    // sx の `fontSize: 10` は 10px。クォート付きだけ見ていると素通りする
    const hits = scan(
      /fontSize[:=] *\{?([0-9]+)/,
      (m) => Number.parseInt(m[1], 10) < MIN_PX
    )
    expect(format(hits), `単位なし ${MIN_PX} 未満`).toEqual([])
  })

  it(`CSS の font-size が ${MIN_PX}px を下回らない`, () => {
    const hits = scan(
      /font-size: *([0-9.]+)(px|rem)/,
      (m) =>
        (m[2] === 'rem'
          ? Number.parseFloat(m[1]) * BASE_FONT_SIZE
          : Number.parseFloat(m[1])) < MIN_PX
    )
    expect(format(hits), `CSS で ${MIN_PX}px 未満`).toEqual([])
  })

  it(`Tailwind の任意値が ${MIN_PX}px を下回らない`, () => {
    const hits = scan(
      /text-\[([0-9.]+)px\]/,
      (m) => Number.parseFloat(m[1]) < MIN_PX
    )
    expect(format(hits), `text-[Npx] で ${MIN_PX}px 未満`).toEqual([])
  })

  it('トークン自体が下限を満たす', () => {
    // ここが割れていると、トークンに従った実装がすべて違反になる
    const src = readFileSync('src/themes/typography.ts', 'utf8')
      .split('\n')
      .map(stripComments)
      .join('\n')
    const sizes = [...src.matchAll(/(\w+): pxToRem\((\d+)\)/g)]
    expect(sizes.length).toBeGreaterThan(5)
    const under = sizes
      .filter(([, , px]) => Number.parseInt(px, 10) < MIN_PX)
      .map(([, name, px]) => `${name}: ${px}px`)
    expect(under).toEqual([])
  })
})

describe('フォントウェイトの 2 値化', () => {
  it('400 / 700 以外の数値を直書きしていない', () => {
    // `fontWeight: 500` と JSX prop の `fontWeight={500}` の両方を見る。
    // コロン形だけ見ていて prop 形を取りこぼし、実測で 8 箇所残っていた
    // クォート付きの `fontWeight: '600'` も見る。数値だけ見ていて
    // 1 箇所取りこぼし、実測で初めて出た
    const hits = scan(
      /fontWeight[:=] *\{?['\"]?([0-9]{3})['\"]?/,
      (m) => !ALLOWED_WEIGHTS.has(Number.parseInt(m[1], 10))
    )
    expect(format(hits), '許可は 400 (normal) と 700 (bold) のみ').toEqual([])
  })

  it('MUI 自身のウェイトスケールも 2 値に潰してある', () => {
    // theme.typography.fontWeightMedium を参照している箇所があり、
    // ここが 500 のままだと自リポジトリを全部直しても描画に 500 が残る
    const src = readFileSync('src/themes/typography.ts', 'utf8')
      .split('\n')
      .map(stripComments)
      .join('\n')
    const scale = [...src.matchAll(/fontWeight(Light|Regular|Medium|Bold): *([0-9]{3})/g)]
    expect(scale.length, 'MUI のウェイトスケールが見つからない').toBe(4)
    const bad = scale
      .filter(([, , w]) => !ALLOWED_WEIGHTS.has(Number.parseInt(w, 10)))
      .map(([, name, w]) => `fontWeight${name}: ${w}`)
    expect(bad).toEqual([])
  })

  it('中間ウェイトのキーワードを使っていない', () => {
    const hits = scan(
      /fontWeight: *'(medium|semibold|light|extrabold|black|lighter|bolder)'/,
      () => true
    )
    expect(format(hits), 'normal / bold 以外のキーワードは使わない').toEqual([])
  })

  it('CSS の font-weight が 400 / 700 以外でない', () => {
    const hits = scan(
      /font-weight: *([0-9]{3})/,
      (m) => !ALLOWED_WEIGHTS.has(Number.parseInt(m[1], 10))
    )
    expect(format(hits), 'CSS も 400 / 700 のみ').toEqual([])
  })

  it('Tailwind の中間ウェイトクラスを使っていない', () => {
    // font-normal / font-bold 以外は 2 値の外に出る
    const hits = scan(
      /\bfont-(medium|semibold|light|thin|extrabold|black|extralight)\b/,
      () => true
    )
    expect(format(hits), 'font-normal / font-bold のみ').toEqual([])
  })

  it('トークンが normal と bold の 2 つだけを持つ', () => {
    const src = readFileSync('src/themes/typography.ts', 'utf8')
    const block = src.match(/const fontWeight = \{([^}]*)\}/)
    expect(block, 'fontWeight トークンの定義が見つからない').not.toBeNull()
    const keys = [...(block?.[1] ?? '').matchAll(/(\w+):/g)].map((m) => m[1])
    expect(keys.sort()).toEqual(['bold', 'normal'])
  })
})
