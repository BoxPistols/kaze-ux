import { describe, expect, it } from 'vitest'

import serverSource from '../../../../mcp/src/server.ts?raw'
import workflowYaml from '../../../../.github/workflows/quality-check.yml?raw'
import prohibitedMd from '../../../../foundations/prohibited.md?raw'
import {
  parseCiChecks,
  parseMcpResources,
  parseMcpTools,
  parseRuleStats,
} from '../aiOverviewData'

// Overview ページは実ファイルを解析して表示する。書式が変わって 0 件に
// なっても画面は描画されてしまうので、実ファイルに対してここで止める
describe('Overview の実データ解析', () => {
  it('MCP のツールを server.ts から拾える', () => {
    const names = parseMcpTools(serverSource).map((t) => t.name)
    expect(names).toEqual([
      'get_token',
      'get_component',
      'check_rule',
      'search',
    ])
  })

  it('MCP のリソースを URI で拾える', () => {
    const uris = parseMcpResources(serverSource).map((r) => r.uri)
    expect(uris).toEqual(['kaze://tokens', 'kaze://components', 'kaze://rules'])
  })

  it('禁止パターンの件数を生成物から数えられる', () => {
    const stats = parseRuleStats(prohibitedMd)
    expect(stats.total).toBeGreaterThan(0)
    expect(stats.detectable).toBeGreaterThan(0)
    expect(stats.detectable).toBeLessThanOrEqual(stats.total)
    expect(stats.unenforced).toBeLessThan(stats.total)
  })

  it('CI が呼ぶ検査を拾い、コメント行は数えない', () => {
    const checks = parseCiChecks(workflowYaml)
    expect(checks).toContain('check:rules')
    expect(checks).toContain('check:mcp')
    expect(parseCiChecks('# pnpm check:fake\n  run: pnpm check:real')).toEqual([
      'check:real',
    ])
  })
})
