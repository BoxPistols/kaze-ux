#!/usr/bin/env node
/**
 * `.mcp.json` に登録した MCP サーバが**実際に起動して答えるか**を確かめる。
 *
 *   pnpm check:mcp
 *
 * ## なぜ要るか
 *
 * `.mcp.json` は `mcp/dist/index.js` を指していたが、`mcp/dist` は
 * .gitignore 済みで**リポジトリには存在しなかった**。つまり clone した人の
 * 環境では kaze の MCP は常に起動失敗する。登録されているので一覧には
 * 出るが、呼ぶと死ぬ。
 *
 * 登録の有無は設定を読めば分かるが、**動くかどうかは起動しないと分からない**。
 * ここでは実際に stdio で initialize → tools/list → tools/call まで通す。
 *
 * 併せて、返ってくる中身が空でないことも見る。metadata が壊れていても
 * サーバは起動するので、起動だけを見ると「動いている」と誤読する。
 */
import { spawn } from 'node:child_process'
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const config = JSON.parse(readFileSync(resolve(ROOT, '.mcp.json'), 'utf-8'))

/** stdio で立てるものだけが対象（http のものは別プロセスの起動が前提） */
const targets = Object.entries(config.mcpServers ?? {}).filter(
  ([, v]) => !v.type || v.type === 'stdio'
)

if (targets.length === 0) {
  console.error('❌ .mcp.json に stdio のサーバが 1 つもありません')
  process.exit(1)
}

/** 応答を待つ。無言のまま終わるのが一番ありがちな失敗なので必ず打ち切る */
const rpc = (proc, messages, timeoutMs) =>
  new Promise((done) => {
    let buf = ''
    const seen = []
    proc.stdout.on('data', (d) => {
      buf += d
      const lines = buf.split('\n')
      buf = lines.pop() ?? ''
      for (const l of lines) {
        if (!l.trim()) continue
        try {
          seen.push(JSON.parse(l))
        } catch {
          /* 部分行は無視 */
        }
      }
    })
    for (const [delay, msg] of messages) {
      setTimeout(() => {
        try {
          proc.stdin.write(`${JSON.stringify(msg)}\n`)
        } catch {
          /* 相手が死んでいる */
        }
      }, delay)
    }
    setTimeout(() => done(seen), timeoutMs)
  })

let failed = 0

/**
 * Claude Code は .mcp.json の command / args / env で `${VAR}` と
 * `${VAR:-default}` を展開する。ここで展開しないと、Plugin 共用のために
 * 書いた `${CLAUDE_PLUGIN_ROOT:-.}` が**文字どおり tsx に渡って死ぬ**。
 * 検査は本番と同じ解決を通す。
 */
const expand = (s) =>
  s.replace(
    /\$\{(\w+)(?::-([^}]*))?\}/g,
    (_, name, def) => process.env[name] ?? def ?? ''
  )

for (const [name, spec] of targets) {
  const proc = spawn(expand(spec.command), (spec.args ?? []).map(expand), {
    cwd: ROOT,
    env: {
      ...process.env,
      ...Object.fromEntries(
        Object.entries(spec.env ?? {}).map(([k, v]) => [k, expand(v)])
      ),
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  let stderr = ''
  proc.stderr.on('data', (d) => {
    stderr += d
  })

  const replies = await rpc(
    proc,
    [
      [
        0,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'kaze-check', version: '1' },
          },
        },
      ],
      [1500, { jsonrpc: '2.0', method: 'notifications/initialized' }],
      [1600, { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }],
      [1700, { jsonrpc: '2.0', id: 4, method: 'resources/list', params: {} }],
      [
        2600,
        {
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: { name: 'get_component', arguments: { name: 'statCard' } },
        },
      ],
    ],
    5000
  )
  proc.kill()

  const init = replies.find((m) => m.id === 1)
  const list = replies.find((m) => m.id === 2)
  const call = replies.find((m) => m.id === 3)
  const resources = replies.find((m) => m.id === 4)

  if (!init?.result) {
    console.error(
      `❌ ${name}: 起動できません (${spec.command} ${(spec.args ?? []).join(' ')})`
    )
    if (stderr.trim()) console.error(`   ${stderr.trim().split('\n')[0]}`)
    failed++
    continue
  }

  const tools = list?.result?.tools?.map((t) => t.name) ?? []
  if (tools.length === 0) {
    console.error(`❌ ${name}: ツールが 1 つも公開されていません`)
    failed++
    continue
  }

  // 起動しても中身が空なことがある。実際に 1 件引いて確かめる
  const text = call?.result?.content?.[0]?.text ?? ''
  if (!text.includes('StatCard')) {
    console.error(
      `❌ ${name}: get_component('statCard') が部品情報を返しません\n` +
        `   返答: ${text.slice(0, 120).replace(/\n/g, ' ') || '(空)'}`
    )
    failed++
    continue
  }

  // README が「4ツール + 3リソース」と書いているので、リソース側も数える。
  // 主張している数と実際が食い違っていないかは、起動してみないと分からない
  const resourceUris = resources?.result?.resources?.map((r) => r.uri) ?? []

  console.log(
    `✅ ${name}: 起動 OK / ツール ${tools.length} 件 (${tools.join(', ')}) / ` +
      `リソース ${resourceUris.length} 件 (${resourceUris.join(', ') || 'なし'}) / 部品情報の取得 OK`
  )
}

if (failed) {
  console.error(`\n❌ ${failed} 個の MCP サーバが使える状態にありません`)
  process.exit(1)
}
// --- 移植性: kaze-ux 以外のプロジェクトでも動くか ---
//
// 「同じ形のファイルを置けば動く」は OSS としての中心的な主張なので毎回試す。
// 主張だけ書いて実際は動かない、が一番まずい。
// docs/adopt-the-scheme.md が案内している env の指定と同じ形で確かめる。
const fixture = mkdtempSync(resolve(tmpdir(), 'ds-portability-'))
mkdirSync(resolve(fixture, 'design'), { recursive: true })
writeFileSync(
  resolve(fixture, 'design/tokens.json'),
  JSON.stringify({
    color: {
      light: { primary: { main: { $value: '#FF6600', $type: 'color' } } },
    },
  })
)
writeFileSync(
  resolve(fixture, 'design/components.json'),
  JSON.stringify({
    components: {
      widget: { name: 'Widget', category: 'Demo', variants: ['a'] },
    },
  })
)
writeFileSync(
  resolve(fixture, 'design/rules.md'),
  '# 禁止パターン\n\n## デモ\n\n| ID | 禁止 | 代わりに | 強制 |\n| --- | --- | --- | --- |\n| D01 | x | y | ESLint |\n'
)

const portable = spawn('npx', ['tsx', 'mcp/src/index.ts'], {
  cwd: ROOT,
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    DS_ROOT: fixture,
    DS_TOKENS_PATH: 'design/tokens.json',
    DS_COMPONENTS_PATH: 'design/components.json',
    DS_RULES_PATH: 'design/rules.md',
  },
})

const portableReplies = await rpc(
  portable,
  [
    [
      0,
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'kaze-check', version: '1' },
        },
      },
    ],
    [1500, { jsonrpc: '2.0', method: 'notifications/initialized' }],
    [
      1600,
      {
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: { name: 'get_component', arguments: { name: 'widget' } },
      },
    ],
    [
      2400,
      {
        jsonrpc: '2.0',
        id: 6,
        method: 'tools/call',
        params: {
          name: 'get_token',
          arguments: { path: 'color.light.primary.main' },
        },
      },
    ],
  ],
  5000
)
portable.kill()
rmSync(fixture, { recursive: true, force: true })

const comp =
  portableReplies.find((m) => m.id === 5)?.result?.content?.[0]?.text ?? ''
const tok =
  portableReplies.find((m) => m.id === 6)?.result?.content?.[0]?.text ?? ''
if (!comp.includes('Widget') || !tok.includes('#FF6600')) {
  console.error(
    '\n❌ 別プロジェクトに向けたとき、そのプロジェクトのデータを返しません。\n' +
      '   docs/adopt-the-scheme.md の「同じ形のファイルを置けば動く」が成立していません。\n' +
      `   get_component: ${comp.slice(0, 80) || '(空)'}\n   get_token: ${tok.slice(0, 80) || '(空)'}`
  )
  process.exit(1)
}
console.log(
  '✅ 移植性: kaze-ux を参照しない別プロジェクトでも、そのプロジェクトの部品とトークンを返します'
)

console.log('\n✅ .mcp.json に登録した MCP サーバは実際に使えます')
