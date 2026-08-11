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
    const parts = rgb[1].split(',').map((p) => Number.parseFloat(p.trim()))
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
 * 白を一律に乗せると明るい色（Kaze のティール #0EADB8 は白に対して
 * 2.73:1）で破綻する。どちらが読めるかは目分量ではなく実測で決める。
 */
export const bestContrast = (
  background: string,
  candidates: readonly string[]
): string =>
  candidates.reduce((best, candidate) =>
    contrastRatio(candidate, background) > contrastRatio(best, background)
      ? candidate
      : best
  )

/**
 * 背景に対して読める前景色を、候補から選ぶ。
 *
 * 明るい面にも暗い面にも置かれうる部品（反転コンテキストに置かれる
 * Chip など）で、コントラストを崩さずに色を決めるために使う。
 */
export const pickReadable = (
  background: string,
  candidates: readonly string[],
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
