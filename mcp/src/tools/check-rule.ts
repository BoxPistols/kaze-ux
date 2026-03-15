/**
 * check_rule ツール
 * コードスニペットを禁止パターンに照合し、違反を検出
 */

import { parseProhibitedRules } from '../utils/loader.js'

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
  handler: ({ code }: { code: string }) => {
    const rules = parseProhibitedRules()
    const violations: Array<{
      id: string
      pattern: string
      reason: string
      category: string
    }> = []

    // パターンマッチング
    const checks: Array<{ id: string; test: (code: string) => boolean }> = [
      // コンポーネント
      {
        id: 'C01',
        test: (c) => /React\.FC|: FC[<\s]|FunctionComponent/.test(c),
      },
      { id: 'C02', test: (c) => /<Grid\s+item\s/.test(c) },
      { id: 'C03', test: (c) => /export\s+default\s/.test(c) },
      {
        id: 'C04',
        test: (c) => /;\s*$/.test(c.split('\n').filter(Boolean).pop() ?? ''),
      },
      { id: 'C06', test: (c) => /:\s*any[\s;,>)}\]]/.test(c) },
      { id: 'C07', test: (c) => /window\.(confirm|alert)\s*\(/.test(c) },

      // カラー
      {
        id: 'K01',
        test: (c) =>
          /#[0-9a-fA-F]{6}(?!['"]?\s*[,}])/.test(c) &&
          !/\/\/|\/\*|\*\/|\.md|\.json/.test(c),
      },
      { id: 'K02', test: (c) => /text-(black|white)/.test(c) },
      { id: 'K03', test: (c) => /bg-gray-\d/.test(c) },

      // タイポグラフィ
      { id: 'T01', test: (c) => /fontSize:\s*['"]?\d+px/.test(c) },

      // アクセシビリティ
      { id: 'A01', test: (c) => /<IconButton(?!.*aria-label)/.test(c) },
      { id: 'A03', test: (c) => /outline:\s*none/.test(c) },
      { id: 'A04', test: (c) => /<img(?!.*alt[=\s])/.test(c) },

      // AI 生成パターン
      { id: 'AI03', test: (c) => /rounded-full/.test(c) && /[Cc]ard/.test(c) },
    ]

    for (const check of checks) {
      if (check.test(code)) {
        const rule = rules.find((r) => r.id === check.id)
        if (rule) {
          violations.push(rule)
        }
      }
    }

    if (violations.length === 0) {
      return {
        content: [{ type: 'text' as const, text: '✓ 禁止パターンの違反なし' }],
      }
    }

    const report = violations
      .map(
        (v) =>
          `[${v.id}] ${v.category}\n  禁止: ${v.pattern}\n  理由: ${v.reason}`
      )
      .join('\n\n')

    return {
      content: [
        {
          type: 'text' as const,
          text: `✗ ${violations.length} 件の違反を検出\n\n${report}`,
        },
      ],
    }
  },
}
