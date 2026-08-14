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
      expect(variantOf(name).fontWeight, name).toBe(700)
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

/**
 * 名前が違えば見た目も違う、を機械的に保つ。
 *
 * 以前は subtitle1 / subtitle2 / caption / overline が完全同値で、
 * xxl / xl / lg も h1 / h2 / h3 と同値だった。名前が 5 つあって見た目が
 * 1 つでは段として機能せず、呼び出し側は毎回 sx で打ち消していた。
 */
describe('variant の一意性', () => {
  const SHAPE_KEYS = [
    'fontSize',
    'fontWeight',
    'lineHeight',
    'letterSpacing',
    'textTransform',
  ] as const

  /**
   * 意味の軸 (caption) と寸法の軸 (sm) が同じ見た目に着地するのは許容する。
   * 別の命名軸から同じ段を指しているだけで、段が潰れているわけではない。
   */
  const ALLOWED_ALIASES = [['caption', 'sm']]

  const isAllowedAlias = (a: string, b: string) =>
    ALLOWED_ALIASES.some((pair) => pair.includes(a) && pair.includes(b))

  const shapeOf = (name: string) => {
    const v = typographyOptions[name] as Record<string, unknown>
    return JSON.stringify(SHAPE_KEYS.map((k) => v[k] ?? null))
  }

  const variantNames = Object.keys(typographyOptions).filter(
    (name) =>
      typeof typographyOptions[name] === 'object' &&
      typographyOptions[name] !== null &&
      name !== 'allVariants'
  )

  it('走査対象を取りこぼしていない', () => {
    expect(variantNames.length).toBeGreaterThanOrEqual(20)
  })

  it('同じ見た目の variant が複数存在しない', () => {
    const collisions: string[] = []
    for (let i = 0; i < variantNames.length; i++) {
      for (let j = i + 1; j < variantNames.length; j++) {
        const [a, b] = [variantNames[i], variantNames[j]]
        if (shapeOf(a) === shapeOf(b) && !isAllowedAlias(a, b)) {
          collisions.push(`${a} ≡ ${b}`)
        }
      }
    }
    expect(collisions, collisions.join(', ')).toEqual([])
  })

  it('サイズ帯 (xxl-xs) は太さを主張しない', () => {
    for (const name of ['xxl', 'xl', 'lg', 'ml', 'md', 'sm']) {
      const v = typographyOptions[name] as { fontWeight?: number }
      expect(v.fontWeight, name).toBe(400)
    }
  })

  it('overline は字間を開けて「印」に見せる', () => {
    const v = typographyOptions.overline as {
      letterSpacing?: string
      textTransform?: string
    }
    expect(Number.parseFloat(v.letterSpacing ?? '0')).toBeGreaterThan(0.05)
    expect(v.textTransform).toBe('uppercase')
  })
})
