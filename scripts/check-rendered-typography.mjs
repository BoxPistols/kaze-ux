#!/usr/bin/env node
/**
 * **描画された**タイポグラフィを実ブラウザで検査する。
 *
 *   pnpm check:typo            既定の 5 面を検査（要ビルド）
 *   pnpm check:typo storybook  面を指定
 *
 * なぜソース検査と別に要るか:
 *
 * `typography-usage.test.ts` はソースを走査する。それだけでは足りない。
 * この規約を入れたとき、ソース検査が緑になってから実ビルドを測ると
 * **440 箇所が残っていた**。指定の形式が 1 つではなかったためで、
 * 最終的に 9 種類あった:
 *
 *   rem / px / 単位なし数値 / JSX prop / クォート付き文字列 /
 *   CSS / Tailwind クラス / データ配列 / 条件式
 *
 * さらに 2 つ、ソースからは原理的に見えないものがある:
 *
 * - **ライブラリの既定値**。MUI の Badge / Slider / StepLabel / DataGrid は
 *   fontWeight: 500 を持つ。自リポジトリを全部直しても描画には残る
 * - **計算値**。`${size * 0.5}px` は size 次第で何 px にもなる
 *
 * 5 回測り直して 440 → 37 → 2 → 1 → 0 と収束させた。ソース検査の
 * 「0 件」を信用せず、配信される物を測ること。
 */

import { chromium } from 'playwright'

const MIN_PX = 12
const ALLOWED_WEIGHTS = new Set([400, 700])
/** これ未満しかテキストが無い画面は、描画されていないとみなす */
const MIN_TEXT_NODES = 5

/** 検査する面。ビルド済みの成果物を配信してから実行する */
const SURFACES = {
  storybook: { url: 'http://localhost:6099', kind: 'storybook' },
  lp: { url: 'http://localhost:6110', kind: 'spa', routes: ['/'] },
  saas: {
    url: 'http://localhost:6101',
    kind: 'spa',
    routes: ['/', '/#/projects', '/#/invoices', '/#/settings'],
  },
  'kaze-eats': {
    url: 'http://localhost:6102',
    kind: 'spa',
    routes: ['/', '/#/orders'],
  },
  'sky-kaze': { url: 'http://localhost:6103', kind: 'spa', routes: ['/'] },
}

/** 描画結果から違反を集める。非表示要素は対象外 */
const COLLECT = ([minPx, allowed]) => {
  const okw = new Set(allowed)
  const sizes = []
  const weights = []
  let textNodes = 0
  for (const el of document.querySelectorAll('*')) {
    // 自分が直接持つテキストだけを見る。親の文字を二重に数えない
    const own = [...el.childNodes].some(
      (n) => n.nodeType === 3 && n.textContent.trim()
    )
    if (!own) continue
    textNodes++
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    if (Number.parseFloat(cs.opacity) === 0) continue
    if (!el.getClientRects().length) continue

    const fs = Number.parseFloat(cs.fontSize)
    const fw = Number.parseInt(cs.fontWeight, 10)
    const mui = (el.className || '')
      .toString()
      .split(/\s+/)
      .filter((c) => c.startsWith('Mui'))
      .slice(0, 2)
      .join('.')
    const label = mui || el.tagName.toLowerCase()
    const text = el.textContent.trim().slice(0, 20)

    if (fs > 0 && fs < minPx) {
      sizes.push({ px: Math.round(fs * 100) / 100, label, text })
    }
    if (fw && !okw.has(fw)) {
      weights.push({ w: fw, label, text })
    }
  }
  return { sizes, weights, textNodes }
}

const targets = process.argv.slice(2).filter((a) => !a.startsWith('-'))
const selected = targets.length ? targets : Object.keys(SURFACES)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

let totalSize = 0
let totalWeight = 0
let unreachable = 0

for (const name of selected) {
  const s = SURFACES[name]
  if (!s) {
    console.error(`  ⚠ 未知の面: ${name}`)
    continue
  }

  let routes = s.routes ?? ['/']
  if (s.kind === 'storybook') {
    try {
      const index = await (await fetch(`${s.url}/index.json`)).json()
      routes = Object.values(index.entries)
        .filter((e) => e.type === 'story')
        .map((e) => `/iframe.html?id=${e.id}&viewMode=story`)
    } catch {
      console.error(`  ⚠ ${name}: 配信されていません (${s.url})`)
      unreachable++
      continue
    }
  }

  const sz = new Map()
  const wt = new Map()
  let visited = 0

  for (const r of routes) {
    try {
      await page.goto(`${s.url}${r}`, { waitUntil: 'load', timeout: 20000 })
      await page.waitForTimeout(s.kind === 'storybook' ? 140 : 1300)
      if (s.kind === 'spa') {
        // 遅延描画される下部も見る
        await page.evaluate(() =>
          window.scrollTo(0, document.body.scrollHeight)
        )
        await page.waitForTimeout(700)
      }
      const r2 = await page.evaluate(COLLECT, [MIN_PX, [...ALLOWED_WEIGHTS]])

      // 中身が描画されたことを確かめてから数える。
      // 404 ページや描画に失敗した画面は「違反 0 件」を返すので、
      // 確認しないと**壊れている画面ほど緑になる**
      if (r2.textNodes < MIN_TEXT_NODES) {
        console.error(
          `  ⚠ ${name}${r}: 描画されたテキストが ${r2.textNodes} 件しかない` +
            `（${MIN_TEXT_NODES} 件未満）。404 か描画失敗の可能性`
        )
        unreachable++
        continue
      }
      visited++
      for (const h of r2.sizes) {
        const k = `${h.px}|${h.label}`
        sz.set(k, { ...h, n: (sz.get(k)?.n ?? 0) + 1 })
      }
      for (const h of r2.weights) {
        const k = `${h.w}|${h.label}`
        wt.set(k, { ...h, n: (wt.get(k)?.n ?? 0) + 1 })
      }
    } catch {
      // 個別ルートの失敗は握りつぶさず数える
      unreachable++
    }
  }

  const S = [...sz.values()].sort((a, b) => a.px - b.px)
  const W = [...wt.values()].sort((a, b) => a.w - b.w)
  const ns = S.reduce((a, r) => a + r.n, 0)
  const nw = W.reduce((a, r) => a + r.n, 0)
  totalSize += ns
  totalWeight += nw

  console.log(
    `${name.padEnd(14)} ${String(visited).padStart(3)} 画面  ` +
      `${MIN_PX}px未満 ${ns}  ウェイト違反 ${nw}`
  )
  for (const r of S) {
    console.log(`    ${r.px}px  ${r.label} ×${r.n}  "${r.text}"`)
  }
  for (const r of W) {
    console.log(`    w${r.w}  ${r.label} ×${r.n}  "${r.text}"`)
  }
}

await browser.close()

if (totalSize || totalWeight) {
  console.error(
    `\n❌ 描画結果に違反があります (${MIN_PX}px 未満 ${totalSize} / ` +
      `ウェイト ${totalWeight})\n` +
      '   ソースを直したうえで**ビルドし直してから**再検査してください。'
  )
  process.exit(1)
}

if (unreachable) {
  console.error(
    `\n⚠ ${unreachable} 件を取得できませんでした。取得できた範囲では違反なしですが、` +
      '未検査の面が残っています。'
  )
  process.exit(1)
}

console.log(
  `\n✅ 描画結果に違反なし (${MIN_PX}px 以上 / ウェイトは 400,700 のみ)`
)
