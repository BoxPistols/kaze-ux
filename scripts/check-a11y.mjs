#!/usr/bin/env node
/**
 * **描画された** Storybook のコントラストを検査する。
 *
 *   pnpm check:a11y              既定（部品カテゴリのみ）
 *   pnpm check:a11y --all        解説カテゴリも含めて全 story
 *   A11Y_URL=... pnpm check:a11y 配信先を差し替える
 *
 * なぜ addon-a11y と別に要るか:
 *
 * `.storybook/preview.tsx` は axe の自動実行を切っている（ページ遷移の
 * たびに走ると開発が重いため）。パネルから手で押せば動くが、**CI では
 * 誰も押さない**。実際 CI は build-storybook を回すだけで、a11y は
 * 一度も検査されていなかった。押し忘れを検出できない仕組みは無いのと同じ。
 *
 * なぜ axe でなく自前の計算か:
 *
 * 半透明を合成してから測る必要がある。素の背景色をそのまま使うと、
 * `alpha(color, 0.12)` を敷いた面の上の文字を実際より低く見積もる
 * （テーブル見出しを 2.56:1 と報告しかけたが、合成すると 5.16:1 だった）。
 * 計算部は scripts/audit-contrast.mjs で検証済みのものを共有している。
 *
 * 何を対象から外しているか（黙って減らさない）:
 *
 * 解説カテゴリ（Design Tokens / Guide / Design Philosophy）は、色見本や
 * 「悪い例」を意図的に描画する。ここを混ぜると常時赤になり、gate として
 * 機能しない。--all を付ければ数字は出るので、隠してはいない。
 */

import { chromium } from 'playwright'

import { CONTRAST_AUDIT } from './lib/contrast-audit.mjs'

const URL = process.env.A11Y_URL ?? 'http://localhost:6099'
const SHOW_ALL = process.argv.includes('--all')

/**
 * 意図的に基準外の見本を描く解説カテゴリ。
 * 既定の gate からは外すが、外したことは必ず出力する
 */
const DOC_PREFIXES = [
  'design-tokens-',
  'guide-',
  'design-philosophy-',
  'tools-',
]

/**
 * 描画されたかの判定。
 * 「判定できた文字要素の数」で見てはいけない。Button 単体の story は
 * 正常でも文字要素が 1 つしか無く、61 件を誤って「描画失敗」と数えた。
 * story 本体の DOM 要素数と、Storybook のエラー表示の有無で見る
 */
const MIN_DOM_NODES = 10

const LIVENESS = () => {
  const root = document.querySelector('#storybook-root')
  const err = document.querySelector('.sb-errordisplay')
  return {
    nodes: root ? root.querySelectorAll('*').length : 0,
    // .sb-errordisplay は常に DOM にある。表示されているかで見る
    errorShown: !!err && getComputedStyle(err).display !== 'none',
  }
}

const isDoc = (id) => DOC_PREFIXES.some((p) => id.startsWith(p))

let index
try {
  index = await (await fetch(`${URL}/index.json`)).json()
} catch {
  console.error(
    `❌ Storybook が配信されていません (${URL})\n` +
      '   pnpm build-storybook してから静的配信し、A11Y_URL で指すか 6099 で配信してください。'
  )
  process.exit(1)
}

const all = Object.values(index.entries).filter((e) => e.type === 'story')
const targets = SHOW_ALL ? all : all.filter((e) => !isDoc(e.id))
const skipped = all.length - targets.length

if (targets.length === 0) {
  console.error(
    '❌ 対象 story が 0 件です。index.json の中身を確認してください。'
  )
  process.exit(1)
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

const fails = new Map()
let unknown = 0
let checked = 0
let empty = 0

/**
 * 1 story を測る。読み込みに失敗した場合は null を返す。
 *
 * 一度の失敗で赤にしない。マシンが混んでいると読み込みが 20 秒を
 * 超えることがあり、それで gate が落ちると「たまに落ちるので無視」に
 * なって検査そのものが死ぬ。ただし**再試行しても駄目なら落とす**
 */
const measure = async (story) => {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await page.goto(`${URL}/iframe.html?id=${story.id}&viewMode=story`, {
        waitUntil: 'load',
        timeout: attempt === 0 ? 20000 : 40000,
      })
      await page.waitForTimeout(160)

      // 描画に失敗した story は違反 0 件を返す。確認しないと壊れた画面ほど緑になる
      const live = await page.evaluate(LIVENESS)
      // エラー表示は再試行しても変わらないので即座に確定させる
      if (live.errorShown) return { live, r: null }
      if (live.nodes < MIN_DOM_NODES) {
        if (attempt === 0) continue
        return { live, r: null }
      }
      return { live, r: await page.evaluate(CONTRAST_AUDIT) }
    } catch {
      // 読み込み自体の失敗。次の試行へ
    }
  }
  return null
}

for (const story of targets) {
  const measured = await measure(story)

  if (!measured || !measured.r) {
    empty++
    const live = measured?.live
    console.error(
      `  ⚠ ${story.id}: 描画されていません` +
        (live
          ? `（要素 ${live.nodes} / エラー表示 ${live.errorShown}）`
          : '（読み込みに 2 回失敗）')
    )
    continue
  }

  {
    const r = measured.r
    checked++
    unknown += r.unknown.length

    // disabled な部品は WCAG 1.4.3 の対象外
    for (const f of r.fails.filter((x) => !x.disabled)) {
      // 同じ原因（同じ色・同じ要素）は 1 行にまとめる。
      // 文字列を key に入れるとカレンダーの日付が 1 日 1 行になって読めない
      const key = `${f.got}|${f.need}|${f.label}|${f.color}|${f.bg}`
      const prev = fails.get(key)
      fails.set(key, {
        ...f,
        n: (prev?.n ?? 0) + 1,
        samples: [...new Set([...(prev?.samples ?? []), f.text])].slice(0, 4),
        where: prev?.where ?? story.title,
      })
    }
  }
}

await browser.close()

const rows = [...fails.values()].sort((a, b) => a.got - b.got)
const count = rows.reduce((a, r) => a + r.n, 0)

console.log(
  `${checked} story / 判定不能 ${unknown} 箇所` +
    (skipped ? ` / 解説カテゴリ ${skipped} story は対象外` : '')
)
for (const r of rows) {
  console.log(
    `  ${r.got}:1 (要 ${r.need}) ${r.size}px ×${r.n}  ${r.color} on ${r.bg}\n` +
      `      ${r.label} @${r.where}  例: ${r.samples.map((s) => `"${s}"`).join(' ')}`
  )
}

if (empty) {
  console.error(
    `\n⚠ ${empty} story を判定できませんでした（描画失敗の可能性）。` +
      '未検査が残っているので緑とみなせません。'
  )
  process.exit(1)
}

if (count) {
  console.error(
    `\n❌ コントラスト不足 ${count} 箇所 / ${rows.length} パターン\n` +
      '   面の色 (main) を文字に使っていないか確認してください。' +
      '前景用には textContrast があります。'
  )
  process.exit(1)
}

console.log('\n✅ 描画結果にコントラスト不足なし')
