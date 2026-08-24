import { describe, expect, it } from 'vitest'

import { checkRuleTool } from './check-rule.js'
import { loadRuleDetectors, parseProhibitedRules } from '../utils/loader.js'

/**
 * check_rule が**実際に検査していること**を固定する。
 *
 * 発端は、`AI04`（角丸と片側だけの太いボーダー）が ds-rules.mjs に検出器を
 * 持っているのに、MCP が「違反なし」と返していたこと。check-rule.ts が
 * 独自のパターン一覧を持つ第 2 の正になっていたため、消費側にルールが
 * 届いていなかった。
 *
 * 検出器を単一ソースから読むように直したので、**全部の検出器が MCP 経由で
 * 効くこと**を、既知の違反サンプルで確かめる。サンプルの無い検出器を
 * 足したらこのテストが落ちる（下の網羅テスト）
 */

const run = async (code: string) => {
  const res = await checkRuleTool.handler({ code })
  return res.content[0].text
}

/**
 * ルール ID → そのルールを確実に破るコード片。
 *
 * C01 の検体だけ文字列を分割しているのは、`scripts/check-react-fc.sh` が
 * `.ts` / `.tsx` を grep するだけで、**実使用とテストの検体を区別できない**
 * ため。分割しても `detect` に渡る文字列は同じなので、検査の中身は変わらない。
 * ds-rules.mjs が `stripLiteralsAndComments` で解いたのと同じ問題が、
 * シェル側の検査には残っている
 */
const VIOLATIONS: Record<string, string> = {
  C01: 'const Foo: React' + '.FC<Props> = () => <div />',
  C02: 'const A = () => <Grid item xs={12}>x</Grid>',
  C03: 'export default function Foo() { return null }',
  C06: 'const parse = (input: any) => input',
  C07: 'const ok = () => window.confirm("いいですか")',
  T01: 'const sx = { fontSize: 11 }',
  A03: 'const sx = { "&:focus": { outline: none } }',
  AI03: 'const C = () => <Card className="rounded-full p-4" />',
  AI04:
    'const C = () => (\n' +
    '  <Card sx={{ borderRadius: 1.5, borderTop: 3, borderTopColor: "primary.main" }} />\n' +
    ')',
}

/** そのルールを破っていないコード片（誤検出の確認用） */
const CLEAN: Record<string, string> = {
  C01: 'const Foo = ({ a }: Props) => <div>{a}</div>',
  C02: 'const A = () => <Grid size={{ xs: 12 }}>x</Grid>',
  C03: 'export const Foo = () => null',
  C06: 'const parse = (input: string) => input',
  C07: 'const ok = () => setConfirmOpen(true)',
  T01: 'const sx = { fontSize: 12 }',
  A03: 'const sx = { "&:focus-visible": { outline: none } }',
  AI03: 'const C = () => <Card className="rounded-lg p-4" />',
  AI04: 'const C = () => <Card sx={{ borderRadius: 1.5, border: 1 }} />',
}

describe('検出器が MCP まで届いている', () => {
  it('検出器を読み込めている（読めないまま「違反なし」を返さない）', async () => {
    const { detectors, source } = await loadRuleDetectors()
    expect(source).not.toBe('none')
    expect(detectors.length).toBeGreaterThan(0)
  })

  it('**すべての検出器に、既知の違反サンプルがある**', async () => {
    // このテストが落ちたら、検出器を足したのにサンプルを書いていない。
    // サンプルの無い検出器は「効いていることを一度も確かめていない」
    const { detectors } = await loadRuleDetectors()
    const missing = detectors
      .map((d) => d.id)
      .filter((id) => !(id in VIOLATIONS))
    expect(missing).toEqual([])
  })

  for (const [id, code] of Object.entries(VIOLATIONS)) {
    it(`${id}: 違反しているコードを検出する`, async () => {
      const text = await run(code)
      expect(text).toContain(`[${id}]`)
      expect(text).toContain('違反を検出')
    })
  }

  for (const [id, code] of Object.entries(CLEAN)) {
    it(`${id}: 違反していないコードを検出しない`, async () => {
      expect(await run(code)).not.toContain(`[${id}]`)
    })
  }
})

describe('違反理由が実際の検出内容と一致している', () => {
  it('報告する ID の説明は prohibited.md から引く（別ルールを混ぜない）', async () => {
    // 以前は A01 を「24x24 未満の操作対象」の ID で
    // 「IconButton の aria-label 欠落」として報告していた
    const rules = parseProhibitedRules()
    const { detectors } = await loadRuleDetectors()
    for (const d of detectors) {
      expect(
        rules.find((r) => r.id === d.id),
        `${d.id} の説明が prohibited.md に無い`
      ).toBeDefined()
    }
  })

  it('該当箇所の行番号を返す（「どこか」が分からないと直せない）', async () => {
    expect(await run(VIOLATIONS.AI04)).toMatch(/\d+ 行目:/)
  })
})

describe('検査していない範囲を明示する', () => {
  it('0 件のときも、検査したルールと検査していないルールを返す', async () => {
    const text = await run('export const Foo = () => null')
    expect(text).toContain('検査したルール:')
    expect(text).toContain('検査していないルール')
  })
})
