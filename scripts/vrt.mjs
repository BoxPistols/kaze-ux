#!/usr/bin/env node
/**
 * 見た目の退行を検出する。2 つの git ref を同じマシンでビルドして撮り比べる。
 *
 *   pnpm vrt                 origin/main と作業ツリーを比較
 *   pnpm vrt 773f2ba         指定 ref と比較
 *   pnpm vrt main --limit 30 story 数を絞って試す
 *
 * ## なぜベースライン画像を保存しないか
 *
 * フォントの描画はマシンに依存する。macOS で撮った画像は Linux の CI で
 * 必ず落ちる。画像を持たず、比較のたびに両方をこの場でビルドすれば、
 * 保存も更新も要らず、いつでも同じ条件で比べられる。
 *
 * 代償はビルド 2 回分の時間。退行検出は毎コミット回すものではなく、
 * 見た目に触れた変更のときに意図的に回すものなので、これで釣り合う。
 *
 * ## なぜ無視リストを持たないか
 *
 * 地図タイルのように毎回描画が変わる story がある（実測で 64,126px の
 * 自己差分が出た）。これを手動の無視リストで external すると、リストが
 * 古くなったことに誰も気づけない。
 *
 * 代わりに、差分が出た story だけ**同じ版で 2 回撮り直して自己差分を測る**。
 * 自己差分が同程度なら描画のゆらぎ、明確に小さければ本物の変化と判定する。
 * ノイズを列挙するのではなく毎回測る。
 *
 * ## テストとの役割分担
 *
 * typography-usage.test.ts と check:typo は「規約に適合しているか」を見る。
 * 数値しか見ないので、太さを落として強調が消えたような変化は検出できない。
 * こちらは「見た目が変わったか」だけを見て、良し悪しは人が判断する。
 */

import { execFileSync, execSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'

import { chromium } from 'playwright'

const VIEWPORT = { width: 1280, height: 900 }
const PORT_BASE = 6301
const PORT_HEAD = 6302
/** 自己差分がこの割合を超えたら、描画のゆらぎとみなす */
const NOISE_RATIO = 0.5
/**
 * ゆらぎを測る回数。1 回だと 2 枚が偶然近い値になったときに見逃す。
 *
 * 実際に踏んだ: 3D 地図の story が 125,970px の差分で「変わった」と判定
 * されたが、実体は地形メッシュの描画ゆらぎだった。1 回の撮り直しが
 * たまたま近いフレームを掴んだため。最大値を採る。
 */
const NOISE_SAMPLES = 3

const args = process.argv.slice(2)
const limitAt = args.indexOf('--limit')
const LIMIT = limitAt >= 0 ? Number.parseInt(args[limitAt + 1], 10) : Infinity
const BASE_REF =
  args.find((a) => !a.startsWith('--') && a !== String(LIMIT)) ?? 'origin/main'

const ROOT = process.cwd()
const WORK = join(ROOT, '.vrt')
const TREE = join(WORK, 'base')
/**
 * 実行ごとに分けて残す。上書きすると「前回どうだったか」が消え、
 * 「この差分は前からあったのか、今回出たのか」を後から言えなくなる。
 * 直近 RUNS_KEPT 回まで保持する。
 */
const RUNS_KEPT = 10
const RUN_ID = new Date()
  .toISOString()
  .replace(/[-:]/g, '')
  .replace(/\..+$/, '')
  .replace('T', '-')
const OUT = join(WORK, 'runs', RUN_ID)

const sh = (cmd, cwd = ROOT) =>
  execSync(cmd, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  }).trim()

console.log(`比較: ${BASE_REF} → 作業ツリー`)

// --- 両方をビルド -----------------------------------------------------------

rmSync(TREE, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
for (const d of ['before', 'after', 'diff'])
  mkdirSync(join(OUT, d), { recursive: true })

try {
  sh(`git rev-parse --verify ${BASE_REF}`)
} catch {
  console.error(`❌ ref が見つかりません: ${BASE_REF}`)
  process.exit(1)
}

console.log('  比較元を展開中...')
sh(`git worktree add --detach "${TREE}" ${BASE_REF}`)
try {
  console.log('  比較元を install / build 中...')
  sh('pnpm install --prefer-offline', TREE)
  sh('pnpm build-storybook -o sb', TREE)

  console.log('  作業ツリーを build 中...')
  sh(`pnpm build-storybook -o "${join(WORK, 'head')}"`)

  // --- 配信 ---------------------------------------------------------------

  const serve = (dir, port) =>
    execFileSync('sh', [
      '-c',
      `npx --yes http-server "${dir}" -p ${port} --silent >/dev/null 2>&1 &`,
    ])
  serve(join(TREE, 'sb'), PORT_BASE)
  serve(join(WORK, 'head'), PORT_HEAD)

  const BASE = `http://localhost:${PORT_BASE}`
  const HEAD = `http://localhost:${PORT_HEAD}`
  const wait = async (url) => {
    for (let i = 0; i < 30; i++) {
      try {
        await fetch(`${url}/index.json`)
        return true
      } catch {
        await new Promise((r) => setTimeout(r, 1000))
      }
    }
    return false
  }
  if (!(await wait(BASE)) || !(await wait(HEAD))) {
    console.error('❌ 配信を開始できませんでした')
    process.exit(1)
  }

  // --- 撮影 ---------------------------------------------------------------

  const idsOf = async (base) => {
    const idx = await (await fetch(`${base}/index.json`)).json()
    return new Set(
      Object.values(idx.entries)
        .filter((e) => e.type === 'story')
        .map((e) => e.id)
    )
  }
  const [bIds, hIds] = await Promise.all([idsOf(BASE), idsOf(HEAD)])
  const common = [...bIds].filter((id) => hIds.has(id)).slice(0, LIMIT)
  const added = [...hIds].filter((id) => !bIds.has(id))
  const removed = [...bIds].filter((id) => !hIds.has(id))

  const browser = await chromium.launch()
  const shoot = async (base, id, file) => {
    const page = await browser.newPage({ viewport: VIEWPORT })
    try {
      await page.goto(`${base}/iframe.html?id=${id}&viewMode=story`, {
        waitUntil: 'load',
        timeout: 20000,
      })
      // 動きを止めて撮る。止めないと差分がゆらぎで埋まる
      await page.addStyleTag({
        content:
          '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}',
      })
      await page.waitForTimeout(320)
      await page.screenshot({ path: file })
      return true
    } catch {
      return false
    } finally {
      await page.close()
    }
  }

  /** compare -metric AE。異なる画素数を返す */
  const pixelDiff = (a, b, out) => {
    try {
      execFileSync('compare', ['-metric', 'AE', a, b, out], {
        stdio: ['ignore', 'ignore', 'pipe'],
      })
      return 0
    } catch (e) {
      const n = Number.parseInt(
        (e.stderr ?? Buffer.from('')).toString().trim().split(/\s+/)[0],
        10
      )
      return Number.isNaN(n) ? -1 : n
    }
  }

  console.log(`  ${common.length} story を撮影中...`)
  const diffs = []
  let failed = 0
  for (const id of common) {
    const bf = join(OUT, 'before', `${id}.png`)
    const hf = join(OUT, 'after', `${id}.png`)
    const df = join(OUT, 'diff', `${id}.png`)
    if (!(await shoot(BASE, id, bf)) || !(await shoot(HEAD, id, hf))) {
      failed++
      continue
    }
    const d = pixelDiff(bf, hf, df)
    if (d > 0) diffs.push({ id, diff: d })
  }

  // --- 差分が出たものだけ、同じ版で 2 回撮って自己差分を測る ----------------

  console.log(`  差分 ${diffs.length} 件のゆらぎを測定中...`)
  const noiseFile = join(WORK, 'noise.png')
  for (const r of diffs) {
    const n1 = join(WORK, 'n1.png')
    let worst = -1
    for (let i = 0; i < NOISE_SAMPLES; i++) {
      if (!(await shoot(HEAD, r.id, n1))) break
      const d = pixelDiff(join(OUT, 'after', `${r.id}.png`), n1, noiseFile)
      if (d > worst) worst = d
      // 既にゆらぎと判定できる大きさなら、それ以上測らない
      if (worst >= r.diff * NOISE_RATIO) break
    }
    r.noise = worst
  }

  await browser.close()

  // --- 結果 ---------------------------------------------------------------

  const real = diffs.filter(
    (r) => r.noise >= 0 && r.noise < r.diff * NOISE_RATIO
  )
  const noisy = diffs.filter(
    (r) => !(r.noise >= 0 && r.noise < r.diff * NOISE_RATIO)
  )
  const total = VIEWPORT.width * VIEWPORT.height

  console.log(`\n撮影 ${common.length - failed} 件（失敗 ${failed}）`)
  console.log(`  完全一致 ${common.length - failed - diffs.length} 件`)
  console.log(`  見た目が変わった ${real.length} 件`)
  console.log(`  描画のゆらぎ ${noisy.length} 件（自己差分が同程度）`)
  if (added.length) console.log(`  追加された story ${added.length} 件`)
  if (removed.length) console.log(`  削除された story ${removed.length} 件`)

  if (real.length) {
    console.log('\n見た目が変わった story（差分の大きい順）:')
    for (const r of real.sort((a, b) => b.diff - a.diff)) {
      const pct = ((r.diff / total) * 100).toFixed(2)
      console.log(
        `  ${String(r.diff).padStart(8)} px (${pct.padStart(5)}%)  ${r.id}`
      )
    }
  }
  if (noisy.length) {
    console.log('\n描画のゆらぎと判定（同じ版でも同程度の差が出る）:')
    for (const r of noisy) {
      console.log(`  差分 ${r.diff} / 自己差分 ${r.noise}  ${r.id}`)
    }
  }

  // --- 記録 ---------------------------------------------------------------

  const stamp = new Date().toISOString()
  const rows = (list) =>
    list
      .sort((a, b) => b.diff - a.diff)
      .map(
        (r) =>
          `| ${r.id} | ${r.diff} | ${((r.diff / total) * 100).toFixed(2)}% | ${r.noise} |`
      )
      .join('\n')

  const report = [
    `# VRT ${RUN_ID}`,
    '',
    `- 実行: ${stamp}`,
    `- 比較: \`${BASE_REF}\` (${sh(`git rev-parse --short ${BASE_REF}`)}) → 作業ツリー (${sh('git rev-parse --short HEAD')})`,
    `- 画面: ${VIEWPORT.width}x${VIEWPORT.height}`,
    '',
    '## 結果',
    '',
    `| | 件数 |`,
    `| --- | --- |`,
    `| 撮影 | ${common.length - failed} |`,
    `| 完全一致 | ${common.length - failed - diffs.length} |`,
    `| 見た目が変わった | ${real.length} |`,
    `| 描画のゆらぎ | ${noisy.length} |`,
    `| 撮影失敗 | ${failed} |`,
    `| 追加された story | ${added.length} |`,
    `| 削除された story | ${removed.length} |`,
    '',
    ...(real.length
      ? [
          '## 見た目が変わった',
          '',
          '| story | 差分(px) | 割合 | 自己差分 |',
          '| --- | ---: | ---: | ---: |',
          rows(real),
          '',
        ]
      : ['## 見た目が変わった', '', 'なし', '']),
    ...(noisy.length
      ? [
          '## 描画のゆらぎと判定',
          '',
          '同じ版で撮り直しても同程度の差が出るもの。変更とは無関係。',
          '',
          '| story | 差分(px) | 自己差分(px) |',
          '| --- | ---: | ---: |',
          noisy
            .sort((a, b) => b.diff - a.diff)
            .map((r) => `| ${r.id} | ${r.diff} | ${r.noise} |`)
            .join('\n'),
          '',
        ]
      : []),
    ...(added.length
      ? ['## 追加された story', '', ...added.map((id) => `- ${id}`), '']
      : []),
    ...(removed.length
      ? ['## 削除された story', '', ...removed.map((id) => `- ${id}`), '']
      : []),
    '## 判定について',
    '',
    '差分の有無しか出していない。意図した変化かどうかは画像を見て決める。',
    '大きさと重大さは相関しない（8.59% が意図どおりで 1.06% が既存の描画エラー、という実例がある）。',
    '',
    `画像: \`${OUT.replace(ROOT + '/', '')}/{before,after,diff}/\``,
  ].join('\n')

  writeFileSync(join(OUT, 'report.md'), report + '\n')
  writeFileSync(
    join(OUT, 'result.json'),
    JSON.stringify(
      {
        runId: RUN_ID,
        at: stamp,
        baseRef: BASE_REF,
        baseSha: sh(`git rev-parse ${BASE_REF}`),
        headSha: sh('git rev-parse HEAD'),
        viewport: VIEWPORT,
        shot: common.length - failed,
        identical: common.length - failed - diffs.length,
        changed: real,
        noisy,
        added,
        removed,
        failed,
      },
      null,
      2
    ) + '\n'
  )

  // 古い実行を落とす。溜め続けると画像でディスクを食う
  try {
    const runsDir = join(WORK, 'runs')
    const kept = readdirSync(runsDir).sort().reverse()
    for (const old of kept.slice(RUNS_KEPT)) {
      rmSync(join(runsDir, old), { recursive: true, force: true })
    }
    console.log(`\n記録: ${Math.min(kept.length, RUNS_KEPT)} 回分を保持`)
  } catch {
    /* 保持の失敗は結果に影響しない */
  }

  console.log(`  ${join(OUT, 'report.md').replace(ROOT + '/', '')}`)
  console.log(`  画像: ${OUT.replace(ROOT + '/', '')}/{before,after,diff}/`)
  console.log(
    '\n差分は自動では判定できない。意図した変化かどうかは画像を見て決める。'
  )
} finally {
  execFileSync('sh', [
    '-c',
    `lsof -nP -iTCP:${PORT_BASE},${PORT_HEAD} -sTCP:LISTEN -t 2>/dev/null | xargs -r kill 2>/dev/null || true`,
  ])
  if (existsSync(TREE)) {
    try {
      sh(`git worktree remove -f "${TREE}"`)
    } catch {
      /* 残っても out/ は使えるので握りつぶす */
    }
  }
}
