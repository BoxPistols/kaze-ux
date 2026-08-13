#!/usr/bin/env node
/**
 * **配信中の**成果物に資格情報が載っていないかを、本番 URL に当てて検査する。
 *
 *   pnpm check:live                      既定の共有 URL を検査
 *   pnpm check:live https://example.com  URL を指定
 *
 * なぜローカル検査と別に要るか:
 *
 * ビルド時に `define` で埋め込まれる値は、**環境変数がある環境でしか
 * 焼き込まれない**。手元には値が無いので同じ位置が空文字になり、
 * ソース走査・git 履歴走査・ローカル成果物走査はすべて緑を返す。
 * git に入っていないので Gitleaks や Secrets Detection も通る。
 *
 * 実際にこの穴で、本番の Storybook バンドルに OpenAI の実キーが平文で
 * 配信されていた。見つけたのは本番 URL に curl を当てたときだけだった。
 *
 * 「デプロイされているか」「安全か」を静的な走査で判定しない。配信物を取る。
 */

import { findSecrets } from './lib/secret-patterns.mjs'

const DEFAULT_BASE = 'https://kaze-ux.vercel.app'

/** 走査する面。初期 HTML と、Storybook は iframe 側も見る */
const SURFACES = [
  '/',
  '/storybook/',
  '/storybook/iframe.html',
  '/saas/',
  '/kaze-eats/',
  '/sky-kaze/',
]

const args = process.argv.slice(2).filter((a) => !a.startsWith('-'))
const BASE = (args[0] || process.env.SHARE_BASE_URL || DEFAULT_BASE).replace(
  /\/$/,
  ''
)

const fetchText = async (url, timeoutMs = 45000) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
  return { status: res.status, text: res.ok ? await res.text() : '' }
}

/** HTML から読み込まれる js を絶対 URL にして返す */
const scriptUrls = (html, pageUrl) => {
  const out = new Set()
  for (const m of html.matchAll(/(?:src|href)="([^"]+\.js)"/g)) {
    try {
      out.add(new URL(m[1], pageUrl).href)
    } catch {
      // 解決できない参照は飛ばす
    }
  }
  return [...out]
}

const findings = []
const surfaceRows = []
let chunkCount = 0
let failed = false

for (const path of SURFACES) {
  const pageUrl = `${BASE}${path}`
  let page
  try {
    page = await fetchText(pageUrl)
  } catch (e) {
    surfaceRows.push([path, '取得失敗', 0])
    console.error(`  ⚠ ${path} を取得できません: ${e.message}`)
    failed = true
    continue
  }

  if (page.status !== 200) {
    surfaceRows.push([path, String(page.status), 0])
    continue
  }

  // HTML 自体にも埋め込まれうるので先に見る
  for (const hit of findSecrets(page.text)) {
    findings.push({ where: pageUrl, hit })
  }

  const urls = scriptUrls(page.text, pageUrl)
  let hitsHere = 0
  for (const url of urls) {
    chunkCount++
    try {
      const chunk = await fetchText(url)
      if (chunk.status !== 200) continue
      for (const hit of findSecrets(chunk.text)) {
        findings.push({ where: url, hit })
        hitsHere++
      }
    } catch (e) {
      console.error(`  ⚠ チャンクを取得できません ${url}: ${e.message}`)
      failed = true
    }
  }
  surfaceRows.push([path, '200', urls.length, hitsHere])
}

console.log(`配信中の成果物を検査: ${BASE}`)
for (const [path, status, chunks, hits] of surfaceRows) {
  const h = hits === undefined ? '' : `  資格情報 ${hits} 件`
  console.log(
    `  ${path.padEnd(26)} ${String(status).padEnd(8)} chunk ${chunks}${h}`
  )
}

// 重複排除。同じ値が複数チャンクに載ることがある
const unique = [...new Map(findings.map((f) => [f.hit, f])).values()]

if (unique.length) {
  console.error(`\n❌ 配信中の成果物に資格情報が ${unique.length} 件あります\n`)
  for (const f of unique) {
    console.error(`  ${f.hit}`)
    console.error(`    ${f.where}`)
  }
  console.error(
    [
      '',
      'まず鍵を失効させてください。失効できない場合は支出上限を設定したうえで、',
      '焼き込み経路を塞いで再デプロイしてください。既に配信されたものは',
      'デプロイし直しても取り消せません。',
    ].join('\n')
  )
  process.exit(1)
}

if (failed) {
  console.error(
    '\n⚠ 一部を取得できませんでした。取得できた範囲では検出なしですが、' +
      '未検査の面が残っています。'
  )
  process.exit(1)
}

console.log(
  `\n✅ 配信中の成果物に資格情報なし (${chunkCount} チャンク / ${SURFACES.length} 面)\n` +
    '   注: 初期 HTML から辿れるチャンクのみ。遅延ロードされるものは範囲外。'
)
