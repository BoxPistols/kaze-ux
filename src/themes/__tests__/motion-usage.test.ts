import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * モーションの禁止パターンをリポジトリ全体で機械的に止める。
 *
 * `transition: 'all ...'` は何度直しても戻ってくる。人が気をつけるより、
 * 混入した時点で落ちるようにした方が安い。
 *
 * `all` を避ける理由:
 * - 意図しないプロパティまで動く。フォーカスリングの outline がフェード
 *   インして、キーボード操作の応答が遅れて見える（実際に起きた）
 * - レイアウトに関わるプロパティが混ざると毎フレーム再計算が走る
 */

const ROOTS = ['src', 'apps']
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'coverage',
  'storybook-static',
  '__tests__',
])
const EXTENSIONS = ['.ts', '.tsx']

/** モーション体系そのものを説明するファイルは対象外 */
const ALLOWLIST = new Set([resolve('src/themes/motion.ts')])

const collect = (dir: string, out: string[] = []): string[] => {
  for (const entry of readdirSync(dir)) {
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

const sourceFiles = ROOTS.flatMap((root) => collect(resolve(root))).filter(
  (file) => !ALLOWLIST.has(file)
)

/**
 * 直前の行に付いた個別の除外指定。
 *
 * イージング曲線そのものを見せるデモのように、時間を固定して
 * イージングだけを変える必要がある箇所を、理由付きで通す。
 * ファイル単位で除外すると、その中の新しい違反まで見逃す。
 */
const ALLOW_MARKER = 'motion-usage-allow'

const findMatches = (pattern: RegExp) =>
  sourceFiles.flatMap((file) => {
    const lines = readFileSync(file, 'utf8').split('\n')
    return lines
      .map((line, i) => ({ file, line: i + 1, text: line.trim() }))
      .filter(({ text, line }) => {
        if (!pattern.test(text)) return false
        // 直前のコメントブロック（最大 3 行）にマーカーがあれば通す
        const preceding = lines.slice(Math.max(0, line - 4), line - 1)
        return !preceding.some((l) => l.includes(ALLOW_MARKER))
      })
  })

const format = (hits: { file: string; line: number; text: string }[]) =>
  hits
    .map(
      ({ file, line, text }) =>
        `${file.replace(resolve('.'), '.')}:${line} ${text}`
    )
    .join('\n')

describe('モーションの禁止パターン', () => {
  it('走査対象を取りこぼしていない', () => {
    expect(sourceFiles.length).toBeGreaterThan(100)
  })

  it("transition: 'all ...' を使っていない", () => {
    const hits = findMatches(/transition:\s*['"`]all\b/)
    expect(hits, `\n${format(hits)}`).toEqual([])
  })

  it('transition に秒数を直書きしていない（motionOf を使う）', () => {
    // 'all' を伴わない `transition: '0.3s ease'` のような直書きも同じ問題を持つ
    // プロパティ名が先行する `transition: 'opacity 150ms ease'` も拾う
    const hits = findMatches(/transition:\s*['"`][^'"`]*\b\d+(?:\.\d+)?m?s\b/)
    expect(hits, `\n${format(hits)}`).toEqual([])
  })
})
