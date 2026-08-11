import { describe, expect, it } from 'vitest'

import {
  fontSizesVariant,
  letterSpacingVariant,
  typographyOptions,
} from '../typography'

/** "-0.0216em" → -0.0216 */
const toEm = (value: string) => Number.parseFloat(value)

/** "2.29rem" → 32 (baseFontSize = 14px) */
const toPx = (rem: string) => Math.round(Number.parseFloat(rem) * 14)

// 大きい順に並べた variant。光学調整の単調性を検証する基準列
const SCALE_DESC = [
  'displayLarge',
  'displayMedium',
  'displaySmall',
  'xxl',
  'xl',
  'lg',
  'ml',
  'md',
  'sm',
  'xs',
] as const

describe('光学的トラッキング (letterSpacingVariant)', () => {
  it('全 variant に letter-spacing が定義されている', () => {
    for (const key of SCALE_DESC) {
      expect(letterSpacingVariant[key], key).toMatch(/^-?\d+\.\d+em$/)
    }
  })

  it('サイズが大きいほど字間が詰まる（単調増加）', () => {
    // 大→小 の順で letter-spacing は単調に増加する
    for (let i = 1; i < SCALE_DESC.length; i++) {
      const larger = toEm(letterSpacingVariant[SCALE_DESC[i - 1]])
      const smaller = toEm(letterSpacingVariant[SCALE_DESC[i]])
      expect(
        smaller,
        `${SCALE_DESC[i]} > ${SCALE_DESC[i - 1]}`
      ).toBeGreaterThan(larger)
    }
  })

  it('display 帯は負のトラッキング、最小サイズは正のトラッキング', () => {
    expect(toEm(letterSpacingVariant.displayLarge)).toBeLessThan(0)
    expect(toEm(letterSpacingVariant.xs)).toBeGreaterThan(0)
  })

  it('Inter のダイナミックメトリクス式と一致する', () => {
    // a + b * e^(c * px), a=-0.0223, b=0.185, c=-0.1745
    const expected = (px: number) =>
      Number((-0.0223 + 0.185 * Math.exp(-0.1745 * px)).toFixed(4))

    for (const key of SCALE_DESC) {
      const px = toPx(fontSizesVariant[key])
      expect(toEm(letterSpacingVariant[key]), `${key} (${px}px)`).toBeCloseTo(
        expected(px),
        3
      )
    }
  })
})

describe('光学的な行送り・ウェイト', () => {
  const variantOf = (name: string) =>
    typographyOptions[name] as {
      lineHeight?: number
      fontWeight?: number
      letterSpacing?: string
    }

  it('display 帯は詰めた行送り (1.2) と semibold (600)', () => {
    for (const name of ['displayLarge', 'displayMedium', 'displaySmall']) {
      expect(variantOf(name).lineHeight, name).toBe(1.2)
      expect(variantOf(name).fontWeight, name).toBe(600)
    }
  })

  it('見出し帯 (h1-h4) は 1.3 / bold、小見出し帯 (h5-h6) は 1.4 / bold', () => {
    for (const name of ['h1', 'h2', 'h3', 'h4']) {
      expect(variantOf(name).lineHeight, name).toBe(1.3)
      expect(variantOf(name).fontWeight, name).toBe(700)
    }
    for (const name of ['h5', 'h6']) {
      expect(variantOf(name).lineHeight, name).toBe(1.4)
      expect(variantOf(name).fontWeight, name).toBe(700)
    }
  })

  it('本文は読みやすさ優先の行送り (1.6)', () => {
    expect(variantOf('body1').lineHeight).toBe(1.6)
    expect(variantOf('body2').lineHeight).toBe(1.6)
  })

  it('見出しの行送りは本文より詰まっている', () => {
    const body = variantOf('body1').lineHeight ?? 0
    expect(variantOf('displayLarge').lineHeight ?? 0).toBeLessThan(body)
    expect(variantOf('h1').lineHeight ?? 0).toBeLessThan(body)
  })

  it('MUI 標準 variant にも letter-spacing が行き渡っている', () => {
    const covered = [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'body1',
      'body2',
      'subtitle1',
      'subtitle2',
      'caption',
      'overline',
      'button',
    ]
    for (const name of covered) {
      expect(variantOf(name).letterSpacing, name).toBeDefined()
    }
  })
})
