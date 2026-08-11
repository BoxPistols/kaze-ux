import { describe, expect, it } from 'vitest'

import {
  createDarkThemeColors,
  createLightThemeColors,
  foregroundVariant,
} from '../colorToken'
import {
  CONTRAST_THRESHOLD,
  contrastLevel,
  contrastRatio,
  contrastRatioOf,
  parseColor,
  pickReadable,
  relativeLuminance,
} from '../contrast'

import type { ColorScheme } from '../colorToken'

describe('色のパース', () => {
  it('#rgb / #rrggbb / #rrggbbaa を解ける', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(parseColor('#0EADB8')).toEqual({ r: 14, g: 173, b: 184, a: 1 })
    expect(parseColor('#00000080').a).toBeCloseTo(0.502, 2)
  })

  it('rgb() / rgba() を解ける', () => {
    expect(parseColor('rgb(15, 23, 42)')).toEqual({
      r: 15,
      g: 23,
      b: 42,
      a: 1,
    })
    expect(parseColor('rgba(0, 0, 0, 0.54)').a).toBe(0.54)
  })

  it('解釈できない色は例外を投げる', () => {
    expect(() => parseColor('tomato')).toThrow()
    expect(() => parseColor('')).toThrow()
  })
})

describe('コントラスト比の算出', () => {
  it('白黒は 21:1', () => {
    expect(contrastRatioOf('#ffffff', '#000000')).toBe(21)
  })

  it('同色は 1:1', () => {
    expect(contrastRatioOf('#0EADB8', '#0EADB8')).toBe(1)
  })

  it('前景と背景を入れ替えても同じ比率', () => {
    expect(contrastRatioOf('#333333', '#ffffff')).toBe(
      contrastRatioOf('#ffffff', '#333333')
    )
  })

  it('半透明の前景は背景と合成してから測る', () => {
    // 白地の上の黒 54% は、真っ黒より確実に低いコントラストになる
    const translucent = contrastRatio('rgba(0, 0, 0, 0.54)', '#ffffff')
    const opaque = contrastRatio('#000000', '#ffffff')
    expect(translucent).toBeLessThan(opaque)
    expect(translucent).toBeGreaterThan(1)
  })

  it('相対輝度は白 1 / 黒 0', () => {
    expect(relativeLuminance(parseColor('#ffffff'))).toBeCloseTo(1, 5)
    expect(relativeLuminance(parseColor('#000000'))).toBeCloseTo(0, 5)
  })

  it('達成レベルを判定できる', () => {
    expect(contrastLevel(21)).toBe('AAA')
    expect(contrastLevel(4.5)).toBe('AA')
    expect(contrastLevel(3)).toBe('AA Large')
    expect(contrastLevel(2.9)).toBe('Fail')
  })
})

describe('pickReadable', () => {
  it('暗い面には明るい候補を選ぶ', () => {
    expect(pickReadable('#0a0f1c', ['#111111', '#ffffff'])).toBe('#ffffff')
  })

  it('明るい面には暗い候補を選ぶ', () => {
    expect(pickReadable('#ffffff', ['#f5f5f5', '#111111'])).toBe('#111111')
  })

  it('基準を満たす候補が無ければ最もコントラストの高いものを返す', () => {
    expect(pickReadable('#808080', ['#7f7f7f', '#000000'])).toBe('#000000')
  })
})

// ---- 全テーマの実データ監査 ----

const SCHEMES: ColorScheme[] = ['kaze', 'dracula', 'monotone']

type Palette = ReturnType<typeof createLightThemeColors>

const allThemes: Array<[string, Palette]> = [
  ...SCHEMES.map(
    (s) => [`light/${s}`, createLightThemeColors(s)] as [string, Palette]
  ),
  ...SCHEMES.map(
    (s) => [`dark/${s}`, createDarkThemeColors(s)] as [string, Palette]
  ),
]

describe('本文テキストのコントラスト (全 6 テーマ)', () => {
  for (const [name, c] of allThemes) {
    it(`${name}: text.primary が背景に対して AA を満たす`, () => {
      for (const bg of [c.background.default, c.background.paper]) {
        const ratio = contrastRatio(c.text.primary, bg)
        expect(
          ratio,
          `${name} text.primary on ${bg} = ${ratio.toFixed(2)}`
        ).toBeGreaterThanOrEqual(CONTRAST_THRESHOLD.text)
      }
    })

    it(`${name}: text.secondary が背景に対して AA を満たす`, () => {
      for (const bg of [c.background.default, c.background.paper]) {
        const ratio = contrastRatio(c.text.secondary, bg)
        expect(
          ratio,
          `${name} text.secondary on ${bg} = ${ratio.toFixed(2)}`
        ).toBeGreaterThanOrEqual(CONTRAST_THRESHOLD.text)
      }
    })
  }
})

describe('セマンティックカラーの塗り面 (全 6 テーマ)', () => {
  const semantic = [
    'primary',
    'secondary',
    'success',
    'info',
    'warning',
    'error',
  ] as const

  for (const [name, c] of allThemes) {
    it(`${name}: 塗りボタンの文字色が AA を満たす`, () => {
      for (const key of semantic) {
        const set = c[key]
        const ratio = contrastRatio(set.contrastText, set.main)
        expect(
          ratio,
          `${name} ${key}: contrastText on main = ${ratio.toFixed(2)}`
        ).toBeGreaterThanOrEqual(CONTRAST_THRESHOLD.text)
      }
    })

    it(`${name}: 前景に使う variant が UI 基準 (3:1) を満たす`, () => {
      // ブランドティールのような明るい色は塗り面としては成立するが、
      // アイコン・細線に使うと見えない。用途で variant を使い分ける
      const mode = name.startsWith('dark') ? 'dark' : 'light'
      for (const key of semantic) {
        const fg = foregroundVariant(c[key], mode)
        const ratio = contrastRatio(fg, c.background.paper)
        expect(
          ratio,
          `${name} ${key} 前景 (${fg}) on paper = ${ratio.toFixed(2)}`
        ).toBeGreaterThanOrEqual(CONTRAST_THRESHOLD.ui)
      }
    })
  }
})

describe('境界線の視認性 (全 6 テーマ)', () => {
  for (const [name, c] of allThemes) {
    it(`${name}: divider が面の分離として知覚できる`, () => {
      const ratio = contrastRatio(c.divider, c.background.paper)
      // 罫線は装飾的だが、面の境界としては最低限の差が要る
      expect(
        ratio,
        `${name} divider on paper = ${ratio.toFixed(2)}`
      ).toBeGreaterThan(1.1)
    })
  }
})

describe('前景用スロット textContrast (全 6 テーマ)', () => {
  const semantic = [
    'primary',
    'secondary',
    'success',
    'info',
    'warning',
    'error',
  ] as const

  for (const [name, c] of allThemes) {
    it(`${name}: textContrast が paper / default 双方で本文 AA を満たす`, () => {
      // どちらが厳しいかはモードで入れ替わるため両面を検証する
      for (const key of semantic) {
        const fg = c[key].textContrast
        expect(fg, `${name} ${key}.textContrast が未定義`).toBeDefined()
        for (const [surface, bg] of [
          ['paper', c.background.paper],
          ['default', c.background.default],
        ] as const) {
          const ratio = contrastRatio(fg as string, bg)
          expect(
            ratio,
            `${name} ${key}.textContrast (${fg}) on ${surface} = ${ratio.toFixed(2)}`
          ).toBeGreaterThanOrEqual(CONTRAST_THRESHOLD.text)
        }
      }
    })
  }
})

describe('ダークでは main が前景として使われる', () => {
  const semantic = [
    'primary',
    'secondary',
    'success',
    'info',
    'warning',
    'error',
  ] as const

  // ダークテーマの outlined Chip・アイコン・強調テキストは main を
  // そのまま文字色に使う。塗り面用の色というだけでなく前景でもあるため、
  // paper の上で本文 AA を満たしていなければならない
  for (const [name, c] of allThemes) {
    if (!name.startsWith('dark')) continue
    it(`${name}: main が paper 上で本文 AA を満たす`, () => {
      for (const key of semantic) {
        const ratio = contrastRatio(c[key].main, c.background.paper)
        expect(
          ratio,
          `${name} ${key}.main (${c[key].main}) on paper = ${ratio.toFixed(2)}`
        ).toBeGreaterThanOrEqual(CONTRAST_THRESHOLD.text)
      }
    })
  }
})
