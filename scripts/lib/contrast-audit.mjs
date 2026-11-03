/**
 * 実描画のコントラスト計算（単一ソース）
 *
 * scripts/audit-contrast.mjs（アプリを測る）と scripts/check-a11y.mjs
 * （Storybook を測る）が同じ計算を使う。片方だけ直すと数字が食い違う。
 *
 * ここでの判断:
 * - 半透明は祖先を辿って合成してから測る。素の背景色で測ると嘘の数字になる
 * - 背景画像・グラデーションの上、絶対配置の要素は「判定不能」として分ける。
 *   下地が確定しないので、破綻と断定すると誤報になる
 * - SVG の文字は color ではなく fill で描かれる
 * - WCAG 2.1 1.4.3: 24px 以上 / 18.66px 以上の bold は 3:1、それ以外は 4.5:1
 *
 * この関数は page.evaluate に渡してブラウザ内で走る。外の変数を参照しない
 */
export const CONTRAST_AUDIT = () => {
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
  // 親も子も半透明のとき、合成結果を不透明として扱うと走査がそこで
  // 止まり、実際とは違う背景色を報告する。アルファを保って積み上げる
  const over = (fg, bg) => {
    const a = fg.a + bg.a * (1 - fg.a)
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 }
    return {
      r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
      g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
      b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
      a,
    }
  }
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
    // 走査しきっても不透明にならなければ、ページの地（キャンバス）に落とす
    const canvas = parse(
      getComputedStyle(document.documentElement).backgroundColor
    ) ?? { r: 255, g: 255, b: 255, a: 1 }
    const base = canvas.a > 0 ? canvas : { r: 255, g: 255, b: 255, a: 1 }
    return acc ? over(acc, { ...base, a: 1 }) : { ...base, a: 1 }
  }
  /**
   * SVG の文字の実際の下地。
   *
   * 文字を覆っている塗り図形のうち**最も小さいもの**を採る。
   * 「最大の図形」にすると、図解 SVG で地の白い矩形を拾い、色付きの箱に
   * 乗った白文字を「白地の上の白文字」と誤報する。
   * 覆う図形が無ければ DOM 祖先の背景に落とす
   */
  const svgBackdrop = (el) => {
    const svg = el.ownerSVGElement
    if (!svg) return effectiveBg(el)
    const t = el.getBoundingClientRect()
    const cx = t.left + t.width / 2
    const cy = t.top + t.height / 2
    // 文字の中心を覆う図形を、小さい順（＝上に描かれている順）に集める。
    // 半透明の図形は下の図形と合成しないと正しい面にならない。
    // DOM 祖先へ直に落とすと、青い帯の上の 20% 白チップを「白」と測る
    const covering = []
    for (const shape of svg.querySelectorAll(
      'circle,rect,path,ellipse,polygon'
    )) {
      const f = parse(getComputedStyle(shape).fill)
      if (!f || f.a === 0) continue
      const r = shape.getBoundingClientRect()
      if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) continue
      const area = r.width * r.height
      if (area > 0) covering.push({ f, area })
    }
    if (covering.length === 0) return effectiveBg(el)
    covering.sort((a, b) => a.area - b.area)
    let acc = null
    for (const { f } of covering) {
      acc = acc ? over(acc, f) : f
      if (acc.a >= 1) return acc
    }
    // 図形を積んでも不透明にならなければ、その下は DOM の面
    return over(acc, effectiveBg(el))
  }

  const out = []
  const unknown = []
  // 判定できた要素数。0 に近ければ描画されていない
  let total = 0
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
    total++
    // SVG の文字の下地は、DOM 祖先の background-color ではなく同じ svg 内の
    // 図形の fill。祖先を辿ると「白い数字を白いページ地の上」と測ってしまう
    // （Stepper の現在ステップを 1:1 と誤報した）
    const bg = isSvgText ? svgBackdrop(el) : effectiveBg(el)
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
        label: `${el.tagName}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0, 2).join('.') : ''}`,
        got: Math.round(got * 100) / 100,
        need,
        color: isSvgText ? cs.fill : cs.color,
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
  return { fails: out, unknown, bright: bright.slice(0, 6), total }
}
