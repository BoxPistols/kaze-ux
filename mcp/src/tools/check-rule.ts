/**
 * check_rule ツール
 * コードスニペットを禁止パターンに照合し、違反を検出
 *
 * ## 検出ロジックはここに書かない
 *
 * 以前はこのファイルが独自にパターン一覧を持っていた。結果、
 * `scripts/lib/ds-rules.mjs` と**2 つの正**ができ、次の状態になっていた。
 *
 * - `AI04`（角丸と片側だけの太いボーダー）は ds-rules に検出器があるのに、
 *   ここに無いので MCP からは検出されなかった。**消費側にルールが届かない**
 * - `A01` は ds-rules では「24x24 未満の操作対象」だが、ここでは
 *   「IconButton の aria-label 欠落」を検査していた。説明文は
 *   prohibited.md から引くので、**違反理由が実際の検出内容と食い違う**
 *
 * 後者は検出漏れより悪い。読んだ AI は書かれた理由を信じて直そうとする。
 * なので検出器は ds-rules.mjs から読む（`loadRuleDetectors`）。
 *
 * ## 検出器が無いときは「違反なし」と言わない
 *
 * `DS_ROOT` で別のデザインシステムを指している場合、そこに検出器は無い。
 * そのとき「✓ 違反なし」を返すと、**何も検査していないことが成功に見える**。
 */

import { loadRuleDetectors, parseProhibitedRules } from '../utils/loader.js'

export const checkRuleTool = {
  name: 'check_rule',
  description:
    'コードスニペットを Kaze DS の禁止パターンに照合。違反があれば ID・理由・カテゴリを返す',
  inputSchema: {
    type: 'object' as const,
    properties: {
      code: {
        type: 'string',
        description: 'チェック対象のコードスニペット',
      },
    },
    required: ['code'],
  },
  handler: async ({ code }: { code: string }) => {
    const rules = parseProhibitedRules()
    const { detectors, source } = await loadRuleDetectors()

    if (source === 'none') {
      return {
        content: [
          {
            type: 'text' as const,
            text:
              '⚠ 検出器が見つからないため、コードを検査していません。\n' +
              '「違反なし」ではありません。\n' +
              'このデザインシステムに scripts/lib/ds-rules.mjs（DETECTABLE_RULES を export）を置いてください。',
          },
        ],
      }
    }

    const violations = detectors
      .map((d) => ({ detector: d, hits: d.detect(code) }))
      .filter((v) => v.hits.length > 0)
      .map((v) => ({
        rule: rules.find((r) => r.id === v.detector.id),
        id: v.detector.id,
        hits: v.hits,
      }))

    // 検査していないルールを明示する。0 件は「準拠している」ではなく
    // 「検出器がある範囲で違反がない」でしかない
    const detectedIds = new Set(detectors.map((d) => d.id))
    const unchecked = rules
      .filter((r) => !detectedIds.has(r.id))
      .map((r) => r.id)
    const scope =
      `検査したルール: ${[...detectedIds].join(', ')}\n` +
      (unchecked.length > 0
        ? `検査していないルール（機械的に測れないもの）: ${unchecked.join(', ')}`
        : '')

    if (violations.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `✓ 検出器のあるルールに違反なし\n\n${scope}`,
          },
        ],
      }
    }

    const report = violations
      .map((v) => {
        const r = v.rule
        const head = r
          ? `[${v.id}] ${r.category}\n  禁止: ${r.pattern}\n  代わりに: ${r.reason}\n` +
            `  強制: ${r.enforcedBy ?? '無し（書いてあるだけで、破っても検出されない）'}`
          : `[${v.id}] （prohibited.md に説明が無い）`
        const where = v.hits
          .map((h) => `    ${h.line} 行目: ${h.text}`)
          .join('\n')
        return `${head}\n  該当箇所:\n${where}`
      })
      .join('\n\n')

    return {
      content: [
        {
          type: 'text' as const,
          text: `✗ ${violations.length} 件の違反を検出\n\n${report}\n\n${scope}`,
        },
      ],
    }
  },
}
