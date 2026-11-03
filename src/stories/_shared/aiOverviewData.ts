/**
 * Overview ページに出す数字と一覧を、**実装ファイルから**読み出す。
 *
 * 手で書いた件数は実装より必ず遅れる（README の禁止パターン件数が 20 / 21 /
 * 実際 23 と食い違っていた）。ここでは文字列として取り込んだ実ファイルを
 * 解析するだけにして、ビルドのたびに最新の値になるようにする。
 * 解析できなかったときは 0 件になり、ページ側がそれを表に出す。
 */

export interface McpEntry {
  name: string
  description: string
}

export interface McpResourceEntry {
  uri: string
  description: string
}

/** `server.tool('name', 'description', ...)` を順に拾う */
export const parseMcpTools = (serverSource: string): McpEntry[] =>
  [...serverSource.matchAll(/server\.tool\(\s*'([^']+)',\s*'([^']+)'/g)].map(
    (m) => ({ name: m[1], description: m[2] })
  )

/** `server.resource('name', 'uri', { description: '...' }, ...)` を拾う */
export const parseMcpResources = (serverSource: string): McpResourceEntry[] =>
  [
    ...serverSource.matchAll(
      /server\.resource\(\s*'[^']+',\s*'([^']+)',\s*\{[^}]*?description:\s*'([^']+)'/g
    ),
  ].map((m) => ({ uri: m[1], description: m[2] }))

export interface RuleStats {
  total: number
  /** check:rules / check_rule が機械的に数えられるもの */
  detectable: number
  /** 強制手段が「なし」= 書いてあるだけのもの */
  unenforced: number
}

/**
 * 生成物 foundations/prohibited.md の表を数える。
 * 列は `ID | 禁止 | 代わりに | 強制 | 自動計測`（scripts/export-prohibited-doc.mjs）
 */
export const parseRuleStats = (prohibitedMd: string): RuleStats => {
  const rows = prohibitedMd
    .split('\n')
    .filter((l) => /^\| [A-Z]+\d+ /.test(l))
    .map((l) =>
      l
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim())
    )
  return {
    total: rows.length,
    detectable: rows.filter((r) => (r[4] ?? '').includes('check:rules')).length,
    unenforced: rows.filter((r) => r[3] === '**なし**').length,
  }
}

/**
 * CI のワークフローが実際に呼んでいる検査コマンドを拾う。
 * コメント行は「呼んでいる」ではないので除く。
 */
export const parseCiChecks = (workflowYaml: string): string[] => {
  const code = workflowYaml
    .split('\n')
    .filter((l) => !l.trim().startsWith('#'))
    .join('\n')
  const found = [
    ...code.matchAll(
      /\bpnpm (?:run )?((?:check|ds|lint|test)(?::[\w-]+)+|build-storybook)\b/g
    ),
  ].map((m) => m[1])
  return [...new Set(found)]
}
