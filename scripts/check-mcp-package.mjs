#!/usr/bin/env node
/**
 * **npm へ出す tarball が、リポジトリの外で本当に動くか**を確かめる。
 *
 *   pnpm check:mcp-package
 *
 * ## なぜ `pnpm check:mcp` では足りないか
 *
 * `check:mcp` はリポジトリの中でサーバを起動する。そこにはトークンも部品
 * メタデータも揃っているので、**データを同梱し忘れていても緑になる**。
 * 一方 `npx kaze-mcp` は node_modules の中で動く。リポジトリのルートは無い。
 * 同梱を忘れると「起動する・ツール一覧も返る・中身だけ空」になり、
 * 使う側からは原因が全く見えない。
 *
 * だからここでは publish と同じ経路を通す。
 *
 *   npm pack（prepack でデータ同梱 + tsc）→ 展開 → リポジトリの外で起動 → 実際に引く
 *
 * 展開先は一時ディレクトリなので、loader が既定で見に行く「2 つ上」には
 * 何も無い。同梱データへのフォールバックが効いていなければここで落ちる。
 */
import { execFileSync } from 'node:child_process'
import { spawn } from 'node:child_process'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

import {
  initializeMessage,
  rpc,
  textOf,
  toolCallMessage,
} from './lib/mcp-rpc.mjs'

const ROOT = resolve(import.meta.dirname, '..')
const MCP = resolve(ROOT, 'mcp')

const work = mkdtempSync(resolve(tmpdir(), 'kaze-mcp-pack-'))
let failed = false

/**
 * MCP Registry は `package.json` の `mcpName` と `server.json` の `name` が
 * 一致することで、そのパッケージの所有者を確かめる。**ずれると publish が
 * 弾かれる**が、ずれても手元では何も起きないので気づけない。
 * バージョンも同じ理由で揃っている必要がある（上げ忘れが起きやすい）。
 */
const checkRegistryManifest = () => {
  const pkg = JSON.parse(readFileSync(resolve(MCP, 'package.json'), 'utf-8'))
  const server = JSON.parse(readFileSync(resolve(MCP, 'server.json'), 'utf-8'))
  const npmPkg = server.packages?.[0] ?? {}

  const mismatches = [
    [
      'package.json の mcpName',
      pkg.mcpName,
      'server.json の name',
      server.name,
    ],
    [
      'package.json の version',
      pkg.version,
      'server.json の version',
      server.version,
    ],
    [
      'package.json の version',
      pkg.version,
      'server.json の packages[0].version',
      npmPkg.version,
    ],
    [
      'package.json の name',
      pkg.name,
      'server.json の packages[0].identifier',
      npmPkg.identifier,
    ],
  ].filter(([, a, , b]) => a !== b)

  if (mismatches.length) {
    console.error('❌ MCP Registry 用の名義が揃っていません:')
    for (const [aLabel, a, bLabel, b] of mismatches) {
      console.error(
        `   ${aLabel} = ${a ?? '(未設定)'} / ${bLabel} = ${b ?? '(未設定)'}`
      )
    }
    process.exit(1)
  }
  console.log(
    `✅ レジストリ名義 ${server.name} (v${server.version}) が揃っています`
  )
}

try {
  checkRegistryManifest()

  // --- 1. publish と同じ経路で tarball を作る ---
  console.log('📦 npm pack（prepack でデータ同梱 + ビルド）...')
  execFileSync('npm', ['pack', '--pack-destination', work], {
    cwd: MCP,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const tarball = readdirSync(work).find((f) => f.endsWith('.tgz'))
  if (!tarball) throw new Error('tarball が作られませんでした')

  // --- 2. 展開する。中身が入っているかをまず目で分かる形で確かめる ---
  execFileSync('tar', ['xzf', resolve(work, tarball)], { cwd: work })
  const pkg = resolve(work, 'package')

  const required = [
    'dist/index.js',
    'data/tokens.json',
    'data/components.json',
    'data/prohibited.md',
  ]
  const missing = required.filter((f) => !existsSync(resolve(pkg, f)))
  if (missing.length) {
    console.error(
      `❌ 配布物に足りないファイルがあります:\n${missing.map((f) => `   ${f}`).join('\n')}\n` +
        '   mcp/package.json の files と prepack を確認してください'
    )
    process.exit(1)
  }

  // --- 3. 依存を貸す ---
  //
  // 実際の `npx kaze-mcp` では npm が依存も一緒に入れる。展開しただけの
  // tarball には node_modules が無いので、そのままでは import で落ちる。
  // ここで見たいのは**配布物のファイル構成とデータ同梱**であって npm の
  // 依存解決ではないので、リポジトリの node_modules をそのまま貸す
  symlinkSync(resolve(MCP, 'node_modules'), resolve(pkg, 'node_modules'), 'dir')

  // --- 4. リポジトリの外で起動して、実際に引けるか ---
  //
  // DS_* を消すのが要点。リポジトリの環境変数が残っていると、
  // 同梱データではなくリポジトリのデータを読んでしまい検査にならない
  const env = { ...process.env }
  for (const key of Object.keys(env)) {
    if (key.startsWith('DS_')) delete env[key]
  }

  const proc = spawn('node', [resolve(pkg, 'dist/index.js')], {
    cwd: work,
    env,
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  let stderr = ''
  proc.stderr.on('data', (d) => {
    stderr += d
  })

  const replies = await rpc(
    proc,
    [
      [0, initializeMessage(1)],
      [800, { jsonrpc: '2.0', method: 'notifications/initialized' }],
      [900, toolCallMessage(2, 'get_component', { name: 'statCard' })],
      [
        1400,
        toolCallMessage(3, 'get_token', {
          path: 'color.light.primary.main',
        }),
      ],
      [
        1900,
        toolCallMessage(4, 'check_rule', {
          code: 'const A: React.FC = () => null',
        }),
      ],
    ],
    4000
  )
  proc.kill()

  if (!replies.find((m) => m.id === 1)?.result) {
    // 起動失敗の理由は stderr にしか出ない。1 行だけだと
    // 「どのファイルで何が起きたか」が切れるので、頭を厚めに見せる
    console.error('❌ 配布物から起動できません')
    for (const line of stderr.trim().split('\n').slice(0, 12)) {
      console.error(`   ${line}`)
    }
    process.exit(1)
  }

  // 起動しても中身が空なのが同梱漏れの症状。3 種類のデータを全部引く
  const checks = [
    ['get_component', textOf(replies, 2), 'StatCard', 'components.json'],
    ['get_token', textOf(replies, 3), '#0057B8', 'tokens.json'],
    ['check_rule', textOf(replies, 4), 'C01', 'prohibited.md'],
  ]
  for (const [tool, text, expected, source] of checks) {
    if (!text.includes(expected)) {
      console.error(
        `❌ ${tool} が同梱データ (${source}) を返しません\n` +
          `   期待: ${expected} を含む\n` +
          `   返答: ${text.slice(0, 120).replace(/\n/g, ' ') || '(空)'}`
      )
      failed = true
    }
  }

  if (!failed) {
    console.log(
      `✅ 配布物 ${tarball} はリポジトリの外で起動し、` +
        'トークン・部品・ルールの 3 種類とも返します'
    )
  }
} finally {
  rmSync(work, { recursive: true, force: true })
}

if (failed) process.exit(1)
