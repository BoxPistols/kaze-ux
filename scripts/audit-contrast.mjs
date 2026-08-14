/**
 * 実描画のコントラスト監査
 *
 * テーマ側の数値が合っていても、実際の画面では別の色が乗る。
 * ブラウザで描画された色を読み、WCAG 2.1 の基準に照らす。
 *
 * 使い方:
 *   pnpm exec playwright install chromium   # 初回のみ
 *   pnpm dev:all                            # 各アプリを起動
 *   node scripts/audit-contrast.mjs
 *
 * ダークモードについて:
 * prefers-color-scheme に従うのは LP と KazeEats だけで、SaaS と
 * KazeLogistics はアプリ内トグルで切り替える。後者を colorScheme:'dark'
 * で測ってもライトが描画されるため、無効な数値を「ダークの結果」として
 * 報告しないよう、既定はライトのみにしている。
 * AUDIT_SCHEMES=light,dark で両方を走らせられる。
 *
 * 判定できないもの:
 * - 背景画像・グラデーションの上（下地の色が確定しない）
 * - 絶対配置の要素（兄弟のスクリムや画像の上に乗る）
 * これらは「破綻」ではなく「判定不能」として分ける。断定すると誤報になる。
 */
import { chromium } from 'playwright'

import { CONTRAST_AUDIT } from './lib/contrast-audit.mjs'

const TARGETS = [
  ['LP', 'http://localhost:5174/'],
  ['SaaS', 'http://localhost:3003/'],
  ['KazeEats', 'http://localhost:3002/'],
  ['KazeLogistics', 'http://localhost:3004/'],
]

const SCHEMES = (process.env.AUDIT_SCHEMES ?? 'light').split(',')

const b = await chromium.launch()
for (const [name, url] of TARGETS) {
  for (const scheme of SCHEMES) {
    const ctx = await b.newContext({
      viewport: { width: 1440, height: 1000 },
      colorScheme: scheme,
    })
    const p = await ctx.newPage()
    try {
      await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await p.waitForTimeout(4000)
      const r = await p.evaluate(CONTRAST_AUDIT)
      const real = r.fails.filter((f) => !f.disabled)
      console.log(
        `\n### ${name} / ${scheme}: 破綻 ${real.length} 件 (disabled 除外 ${r.fails.length - real.length} / 背景画像で判定不能 ${r.unknown.length})`
      )
      for (const f of real.slice(0, 8))
        console.log(
          `   ${f.got}:1 (要 ${f.need}) ${f.size}px "${f.text}" ${f.color} on ${f.bg}`
        )
      if (scheme === 'dark')
        for (const x of r.bright) console.log(`   [明るい面] ${x}`)
    } catch (e) {
      console.log(
        `\n### ${name} / ${scheme}: 取得失敗 ${e.message.slice(0, 60)}`
      )
    }
    await ctx.close()
  }
}
await b.close()
