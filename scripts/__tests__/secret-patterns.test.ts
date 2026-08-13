import { describe, expect, it } from 'vitest'

import {
  findSecrets,
  redactSecret,
  secretRegExp,
} from '../lib/secret-patterns.mjs'

/**
 * 検出パターンの検証。
 *
 * 実装をどう壊しても緑のままになるアサーションは書かない。
 * 「既知の違反を検出すること」と「既知の正解で誤検出しないこと」の
 * 両方を置く。片方だけだと、何も検出しない実装でも半分は通る。
 *
 * 鍵の形をした文字列をソースに直接書かない。書くとこのリポジトリ自身の
 * Gitleaks / Secrets Detection が反応する。実行時に組み立てる。
 */

const body = (n: number, ch = 'A') => ch.repeat(n)

/** 検出されるべきもの（実行時に組み立てる） */
const POSITIVES: [string, string][] = [
  ['OpenAI プロジェクト鍵', 'sk-' + 'proj-' + body(48)],
  ['Anthropic 鍵', 'sk-' + 'ant-' + body(40)],
  ['OpenAI 旧形式', 'sk-' + body(48)],
  ['Google API 鍵', 'AIza' + body(35)],
  ['Mapbox 公開トークン', 'pk' + '.eyJ' + body(20) + '.' + body(20)],
  ['GitHub PAT', 'ghp' + '_' + body(36)],
  ['Slack bot トークン', 'xoxb' + '-' + body(24)],
  ['AWS アクセスキー', 'AKIA' + body(16, 'B')],
]

/** 検出されてはいけないもの。minify 済みバンドルに普通に出る形を含む */
const NEGATIVES: [string, string][] = [
  ['接頭辞だけ', 'sk-'],
  ['短い sk-', 'sk-' + body(10)],
  ['普通の単語', 'const skipList = ["a","b"]'],
  ['ハイフン付きの識別子', 'eslint-config-prettier'],
  ['base64 断片（短い）', 'AIza' + body(5)],
  ['空文字への置換後', 'const DEFAULT_API_KEY = ""'],
  ['ドット無しの pk', 'pk' + 'eyJ' + body(30)],
]

describe('secretRegExp', () => {
  it.each(POSITIVES)('%s を検出する', (_label, value) => {
    expect(secretRegExp().test(`const k="${value}"`)).toBe(true)
  })

  it.each(NEGATIVES)('%s を検出しない', (_label, value) => {
    expect(secretRegExp().test(value)).toBe(false)
  })

  it('g フラグ付きでも呼び出しごとに状態を持ち越さない', () => {
    const text = `a="${'sk-' + 'proj-' + body(48)}"`
    // lastIndex の持ち越しがあると 2 回目が false になる
    expect(secretRegExp().test(text)).toBe(true)
    expect(secretRegExp().test(text)).toBe(true)
  })
})

describe('findSecrets', () => {
  it('同じ値が複数回出ても 1 件に畳む', () => {
    const k = 'sk-' + 'proj-' + body(48)
    expect(findSecrets(`${k} ... ${k} ... ${k}`)).toHaveLength(1)
  })

  it('異なる種類が混ざっていれば別々に返す', () => {
    const a = 'sk-' + 'proj-' + body(48)
    const b = 'AIza' + body(35)
    expect(findSecrets(`${a} and ${b}`)).toHaveLength(2)
  })

  it('検出が無ければ空配列', () => {
    expect(findSecrets('const DEFAULT_API_KEY = ""')).toEqual([])
  })

  it('返す値に元の資格情報を含まない', () => {
    const k = 'sk-' + 'proj-' + body(48)
    const [masked] = findSecrets(k)
    expect(masked).not.toContain(body(48))
    expect(masked).not.toBe(k)
  })
})

describe('redactSecret', () => {
  const k = 'sk-' + 'proj-' + body(48)

  it('元の値をそのまま含まない', () => {
    expect(redactSecret(k)).not.toContain(body(48))
  })

  it('どの鍵かを特定できる情報は残す', () => {
    const masked = redactSecret(k)
    expect(masked).toContain('sk-proj-')
    expect(masked).toContain(`${k.length} 文字`)
    expect(masked).toMatch(/sha256:[0-9a-f]{12}/)
  })

  it('値が違えばハッシュも違う', () => {
    const other = 'sk-' + 'proj-' + body(48, 'B')
    expect(redactSecret(k)).not.toBe(redactSecret(other))
  })
})
