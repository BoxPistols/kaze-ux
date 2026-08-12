/**
 * 実描画のコントラスト監査
 *
 * テーマ側の数値が合っていても、実際の画面では別の色が乗る。
 * ブラウザで描画された色を読み、WCAG 2.1 の基準に照らす。
 *
 * 使い方: 各アプリの dev サーバーを起動してから
 *   node scripts/audit-contrast.mjs
 *
 * 判定できないもの:
 * - 背景画像・グラデーションの上（下地の色が確定しない）
 * - 絶対配置の要素（兄弟のスクリムや画像の上に乗る）
 * これらは「破綻」ではなく「判定不能」として分ける。断定すると誤報になる。
 */
import { chromium } from '/home/user/kaze-ux/node_modules/.pnpm/playwright-core@1.59.1/node_modules/playwright-core/index.mjs'

const TARGETS = [
  ['LP', 'http://localhost:5174/'],
  ['SaaS', 'http://localhost:3003/'],
  ['KazeEats', 'http://localhost:3002/'],
  ['KazeLogistics', 'http://localhost:3004/'],
]

const AUDIT = () => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const p = m[1].split(',').map(Number)
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }
  }
  const lum = ({ r, g, b }) => {
    const f = (v) => {
      const c = v / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  })
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
    return (x + 0.05) / (y + 0.05)
  }
  // 背景画像やグラデーションが挟まると、実際に描かれる面は計算できない。
  // 「基準を割っている」と誤って報告しないよう、判定不能として分ける
  const hasImageBackdrop = (el) => {
    let node = el
    while (node && node !== document.documentElement.parentNode) {
      if (getComputedStyle(node).backgroundImage !== 'none') return true
      node = node.parentElement
    }
    return false
  }
  const effectiveBg = (el) => {
    let node = el,
      acc = null
    while (node && node !== document.documentElement.parentNode) {
      const bg = parse(getComputedStyle(node).backgroundColor)
      if (bg && bg.a > 0) {
        acc = acc ? over(acc, bg) : bg
        if (acc.a >= 1) return acc
      }
      node = node.parentElement
    }
    return acc || { r: 255, g: 255, b: 255, a: 1 }
  }
  const out = []
  const unknown = []
  for (const el of document.querySelectorAll('*')) {
    const text = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join('')
    if (!text) continue
    const cs = getComputedStyle(el)
    if (
      cs.visibility === 'hidden' ||
      cs.display === 'none' ||
      Number(cs.opacity) === 0
    )
      continue
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) continue
    // SVG の文字は color ではなく fill で描かれる。color を読むと
    // 親アイコンの色を文字色と取り違える
    const isSvgText = el.ownerSVGElement != null || el.tagName === 'text'
    const fg = parse(isSvgText ? cs.fill : cs.color)
    if (!fg) continue
    const bg = effectiveBg(el)
    const composed = fg.a < 1 ? over(fg, bg) : fg
    const size = parseFloat(cs.fontSize)
    const bold = Number(cs.fontWeight) >= 700
    const large = size >= 24 || (size >= 18.66 && bold)
    const need = large ? 3 : 4.5
    const got = ratio(composed, bg)
    if (got < need) {
      // 絶対配置の要素は、背後に何が敷かれているか DOM の祖先からは分からない
      // （兄弟のスクリムや画像の上に乗る）。破綻と断定できない
      const floating = (() => {
        let n = el
        while (n && n !== document.body) {
          const pos = getComputedStyle(n).position
          if (pos === 'absolute' || pos === 'fixed') return true
          n = n.parentElement
        }
        return false
      })()
      if (hasImageBackdrop(el) || floating) {
        unknown.push(text.slice(0, 30))
        continue
      }
      out.push({
        text: text.slice(0, 34),
        got: Math.round(got * 100) / 100,
        need,
        color: cs.color,
        bg: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`,
        size,
        disabled: el.closest('[disabled],.Mui-disabled') != null,
      })
    }
  }
  // 明るい面がダークに混ざっていないか
  const bright = []
  for (const el of document.querySelectorAll('*')) {
    const bg = parse(getComputedStyle(el).backgroundColor)
    if (!bg || bg.a < 0.9) continue
    const r = el.getBoundingClientRect()
    if (r.width * r.height < 4000) continue
    if (lum(bg) > 0.5)
      bright.push(
        `${el.tagName}.${String(el.className).slice(0, 24)} rgb(${bg.r},${bg.g},${bg.b})`
      )
  }
  return { fails: out, unknown, bright: bright.slice(0, 6) }
}

const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
})
for (const [name, url] of TARGETS) {
  for (const scheme of ['light']) {
    const ctx = await b.newContext({
      viewport: { width: 1440, height: 1000 },
      colorScheme: scheme,
    })
    const p = await ctx.newPage()
    try {
      await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await p.waitForTimeout(4000)
      const r = await p.evaluate(AUDIT)
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
