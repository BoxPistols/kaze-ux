/**
 * コントラスト計算 (WCAG 2.1)
 *
 * 意匠の美しさは可読性の上にしか成り立たない。「読めるが美しくない」は
 * 直せるが、「美しいが読めない」は成立しない。配色を決めるたびに
 * 目視で確かめるのは現実的でないため、比率を機械で測れるようにする。
 *
 * 参照: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */

/** WCAG の達成基準 */
export const CONTRAST_THRESHOLD = {
  /** 通常テキスト AA (4.5:1) */
  text: 4.5,
  /** 大きいテキスト AA — 24px 以上、または 18.66px 以上の bold (3:1) */
  largeText: 3,
  /** UI 部品・図形の境界 (3:1) */
  ui: 3,
  /** 通常テキスト AAA (7:1) */
  textAAA: 7,
} as const

type Rgb = { r: number; g: number; b: number; a: number }

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

/**
 * CSS の色文字列を RGBA に解く。
 * 対応: #rgb / #rrggbb / #rrggbbaa / rgb() / rgba()
 */
export const parseColor = (input: string): Rgb => {
  const value = input.trim()

  const hex = value.match(/^#([0-9a-f]{3,8})$/i)
  if (hex) {
    let h = hex[1]
    if (h.length === 3 || h.length === 4) {
      h = h
        .split('')
        .map((c) => c + c)
        .join('')
    }
    if (h.length !== 6 && h.length !== 8) {
      throw new Error(`解釈できない色: ${input}`)
    }
    return {
      r: Number.parseInt(h.slice(0, 2), 16),
      g: Number.parseInt(h.slice(2, 4), 16),
      b: Number.parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? Number.parseInt(h.slice(6, 8), 16) / 255 : 1,
    }
  }

  const rgb = value.match(/^rgba?\(([^)]+)\)$/i)
  if (rgb) {
    const tokens = rgb[1].split(',').map((p) => p.trim())
    // parseFloat は '100%' を 100 と読む。パーセント表記を黙って
    // 誤解釈すると、透明度を無視した高いコントラスト比を返してしまう
    if (tokens.some((t) => t.endsWith('%'))) {
      throw new Error(`解釈できない色（% 表記は未対応）: ${input}`)
    }
    const parts = tokens.map((p) => Number.parseFloat(p))
    if (parts.length < 3 || parts.some(Number.isNaN)) {
      throw new Error(`解釈できない色: ${input}`)
    }
    return {
      r: parts[0],
      g: parts[1],
      b: parts[2],
      a: parts.length > 3 ? clamp01(parts[3]) : 1,
    }
  }

  throw new Error(`解釈できない色: ${input}`)
}

/**
 * 半透明の前景色を背景に合成する。
 *
 * text.secondary などが rgba で定義されている場合、透明度を無視して
 * 測ると実際より高いコントラストが出てしまう。必ず合成してから測る。
 */
export const composite = (foreground: Rgb, background: Rgb): Rgb => ({
  r: foreground.r * foreground.a + background.r * (1 - foreground.a),
  g: foreground.g * foreground.a + background.g * (1 - foreground.a),
  b: foreground.b * foreground.a + background.b * (1 - foreground.a),
  a: 1,
})

/** WCAG の相対輝度 */
export const relativeLuminance = ({ r, g, b }: Rgb): number => {
  const linearize = (channel: number) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}

/**
 * 2 色のコントラスト比 (1〜21)。
 * 前景が半透明なら背景と合成してから測る。
 */
export const contrastRatio = (
  foreground: string,
  background: string
): number => {
  const bg = parseColor(background)
  const fgRaw = parseColor(foreground)
  // 背景自体が半透明のケースは扱わない（下の面が確定しないため）
  const fg = fgRaw.a < 1 ? composite(fgRaw, bg) : fgRaw

  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (lighter + 0.05) / (darker + 0.05)
}

/** 小数第 2 位で丸めた比率（表示・レポート用） */
export const contrastRatioOf = (foreground: string, background: string) =>
  Math.round(contrastRatio(foreground, background) * 100) / 100

/** WCAG の達成レベル判定 */
export const contrastLevel = (
  ratio: number
): 'AAA' | 'AA' | 'AA Large' | 'Fail' => {
  if (ratio >= CONTRAST_THRESHOLD.textAAA) return 'AAA'
  if (ratio >= CONTRAST_THRESHOLD.text) return 'AA'
  if (ratio >= CONTRAST_THRESHOLD.largeText) return 'AA Large'
  return 'Fail'
}

/**
 * 候補のうち、背景に対して最もコントラストの高い色を返す。
 *
 * 塗り面の文字色を決めるのに使う。ブランド色は明度がまちまちで、
 * 白を一律に乗せると明るい色（旧 KazeEats グリーン #06C167 は白に対して
 * 2.38:1 しか出ず、index.css は白を指定していた）で破綻する。
 * どちらが読めるかは目分量ではなく実測で決める。
 */
export const bestContrast = (
  background: string,
  // 初期値なしの reduce は空配列で TypeError になる。非空を型で保証する
  candidates: readonly [string, ...string[]]
): string =>
  candidates.reduce((best, candidate) =>
    contrastRatio(candidate, background) > contrastRatio(best, background)
      ? candidate
      : best
  )

// ---- 色相を保った明度調整 ----

const rgbToHsl = ({ r, g, b }: Rgb) => {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255]
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h =
    max === rn
      ? ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
      : max === gn
        ? ((bn - rn) / d + 2) / 6
        : ((rn - gn) / d + 4) / 6
  return { h, s, l }
}

const hslToHex = ({ h, s, l }: { h: number; s: number; l: number }) => {
  const k = (n: number) => (n + h * 12) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = (x: number) =>
    Math.round(255 * clamp01(x))
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

/**
 * 背景に対して目標コントラストを満たすまで、色相・彩度を保ったまま
 * 明度だけを動かす。
 *
 * ブランド色をそのまま文字に使うと読めない（info の #1dafc2 は白地で
 * 2.61:1）が、別の色に差し替えるとブランドが失われる。色相を保って
 * 明度だけ動かせば、ブランドの気配を残したまま可読性を確保できる。
 *
 * @param color 起点の色（ブランド色など）
 * @param background 置かれる背景
 * @param target 目標コントラスト比（既定は本文 AA の 4.5）
 */
export const ensureContrast = (
  color: string,
  background: string,
  target: number = CONTRAST_THRESHOLD.text
): string => {
  if (contrastRatio(color, background) >= target) return color

  const hsl = rgbToHsl(parseColor(color))
  // 背景が明るければ色を暗く、暗ければ明るくする
  const bgIsLight = relativeLuminance(parseColor(background)) > 0.5
  const step = bgIsLight ? -0.01 : 0.01

  let best = color
  let bestRatio = contrastRatio(color, background)
  for (let i = 1; i <= 100; i++) {
    const l = clamp01(hsl.l + step * i)
    const candidate = hslToHex({ ...hsl, l })
    const ratio = contrastRatio(candidate, background)
    if (ratio > bestRatio) {
      bestRatio = ratio
      best = candidate
    }
    if (ratio >= target) return candidate
    // 明度が振り切ったら打ち切る
    if (l === 0 || l === 1) break
  }
  return best
}

/**
 * 背景に対して読める前景色を、候補から選ぶ。
 *
 * 明るい面にも暗い面にも置かれうる部品（反転コンテキストに置かれる
 * Chip など）で、コントラストを崩さずに色を決めるために使う。
 */
export const pickReadable = (
  background: string,
  // 空配列だと戻り型 string に反して undefined を返す。非空を型で保証する
  candidates: readonly [string, ...string[]],
  minimum: number = CONTRAST_THRESHOLD.text
): string => {
  let best = candidates[0]
  let bestRatio = 0
  for (const candidate of candidates) {
    const ratio = contrastRatio(candidate, background)
    if (ratio >= minimum) return candidate
    if (ratio > bestRatio) {
      bestRatio = ratio
      best = candidate
    }
  }
  // どれも基準に届かない場合は最もマシなものを返す
  return best
}
