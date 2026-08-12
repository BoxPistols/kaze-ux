import { describe, expect, it } from 'vitest'

import { createDarkThemeColors, createLightThemeColors } from '../colorToken'
import { CONTRAST_THRESHOLD, contrastRatioOf } from '../contrast'
import {
  FOCUS_RING_OFFSET,
  FOCUS_RING_WIDTH,
  createFocusVisibleOverrides,
  focusRing,
  focusRingColor,
} from '../focus'

import type { ColorScheme } from '../colorToken'

const SCHEMES: ColorScheme[] = ['dracula', 'kaze', 'monotone']

/**
 * フォーカスリングは「意匠を理由に消せない」種類の要素なので、
 * 見た目の合意ではなく基準への適合をテストで固定する。
 */
describe('フォーカスリングの形', () => {
  it('WCAG 2.4.11 が求める太さを下回らない', () => {
    expect(FOCUS_RING_WIDTH).toBeGreaterThanOrEqual(2)
  })

  it('要素との間に隙間を持つ（塗り面の縁で溶けない）', () => {
    expect(FOCUS_RING_OFFSET).toBeGreaterThan(0)
  })

  it('outline を使う（レイアウトを押し広げない）', () => {
    const ring = focusRing('#ff0000')
    expect(ring.outline).toBe(`${FOCUS_RING_WIDTH}px solid #ff0000`)
    expect(ring.outlineOffset).toBe(`${FOCUS_RING_OFFSET}px`)
    // box-shadow や border で描くと、要素の寸法や重なりに影響が出る
    expect(Object.keys(ring)).toEqual(['outline', 'outlineOffset'])
  })
})

describe('フォーカスリングの色', () => {
  for (const scheme of SCHEMES) {
    for (const mode of ['light', 'dark'] as const) {
      it(`${scheme}/${mode}: 地と紙の両面で UI 基準 (3:1) を満たす`, () => {
        const c =
          mode === 'light'
            ? createLightThemeColors(scheme)
            : createDarkThemeColors(scheme)
        const ring = focusRingColor(c.primary.main, c.background)

        expect(
          contrastRatioOf(ring, c.background.default),
          `${scheme}/${mode} default`
        ).toBeGreaterThanOrEqual(CONTRAST_THRESHOLD.ui)
        expect(
          contrastRatioOf(ring, c.background.paper),
          `${scheme}/${mode} paper`
        ).toBeGreaterThanOrEqual(CONTRAST_THRESHOLD.ui)
      })
    }
  }
})

describe('適用範囲', () => {
  const overrides = createFocusVisibleOverrides('var(--color-ring)')

  it('既定として全要素に当たる', () => {
    expect(overrides[':focus-visible']).toEqual(focusRing('var(--color-ring)'))
  })

  it('MUI の class 経由のフォーカスにも同じ見た目を与える', () => {
    expect(overrides['.Mui-focusVisible']).toEqual(
      focusRing('var(--color-ring)')
    )
  })

  it('マウス操作の :focus では出さない', () => {
    expect(overrides[':focus:not(:focus-visible)']).toEqual({ outline: 'none' })
  })
})
