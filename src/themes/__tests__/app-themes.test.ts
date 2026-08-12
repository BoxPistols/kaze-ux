import { describe, expect, it } from 'vitest'

import {
  logiDarkTheme,
  logiLightTheme,
} from '../../../apps/sky-kaze/src/theme/skyTheme'
import {
  LOGI_AMBER,
  LOGI_GREEN,
  LOGI_NAVY_LIGHT,
  LOGI_ORANGE,
  logiForeground,
  logiForegroundLarge,
} from '../../../apps/sky-kaze/src/theme/colors'
import { ueWordmarkColor } from '../../../apps/ubereats-clone/src/theme/colors'
import {
  ueDarkTheme,
  ueLightTheme,
} from '../../../apps/ubereats-clone/src/theme/ueTheme'
import { CONTRAST_THRESHOLD, contrastRatioOf } from '../contrast'
import { createShadows, elevation } from '../elevation'
import { kazeDuration, kazeEasing } from '../motion'
import { theme } from '../theme'
import { letterSpacingVariant } from '../typography'

import type { Theme } from '@mui/material/styles'

/**
 * 各プロダクトは kaze-ux の lightTheme / darkTheme を spread して
 * ブランドカラーだけを差し替えている。その過程でデザイントークンが
 * 失われていないことを保証する。
 *
 * ここが壊れると「デザインシステムはあるが、プロダクトには効いていない」
 * という最悪の状態になり、しかも見た目では気づきにくい。
 */
const brandThemes: Array<[string, Theme, 'light' | 'dark']> = [
  ['sky-kaze (light)', logiLightTheme, 'light'],
  ['sky-kaze (dark)', logiDarkTheme, 'dark'],
  ['ubereats-clone (light)', ueLightTheme, 'light'],
  ['ubereats-clone (dark)', ueDarkTheme, 'dark'],
]

describe('プロダクトテーマが光学タイポグラフィを継承している', () => {
  for (const [name, t] of brandThemes) {
    it(`${name}: 字間・行送り・ウェイトが失われていない`, () => {
      expect(t.typography.h1.letterSpacing, 'h1 字間').toBe(
        letterSpacingVariant.xxl
      )
      expect(t.typography.body1.letterSpacing, 'body1 字間').toBe(
        letterSpacingVariant.md
      )
      expect(t.typography.h1.lineHeight, 'h1 行送り').toBe(1.3)
      expect(t.typography.body1.lineHeight, 'body1 行送り').toBe(1.6)
      expect(t.typography.button.fontWeight, 'button ウェイト').toBe(500)
    })
  }
})

describe('プロダクトテーマがモーション体系を継承している', () => {
  for (const [name, t] of brandThemes) {
    it(`${name}: Kaze のイージングとデュレーションを保つ`, () => {
      expect(t.transitions.easing.easeOut, '出現').toBe(kazeEasing.enter)
      expect(t.transitions.easing.easeIn, '退出').toBe(kazeEasing.exit)
      expect(t.transitions.duration.enteringScreen).toBe(kazeDuration.macro)
      expect(t.transitions.duration.leavingScreen).toBe(kazeDuration.short)
      // 退出は出現より速い
      expect(t.transitions.duration.leavingScreen).toBeLessThan(
        t.transitions.duration.enteringScreen
      )
    })
  }
})

describe('プロダクトテーマがエレベーション体系を継承している', () => {
  for (const [name, t, mode] of brandThemes) {
    it(`${name}: ${mode} 用の影スケールを保つ`, () => {
      const expected = createShadows(mode)
      expect(t.shadows[elevation.raised]).toBe(expected[elevation.raised])
      expect(t.shadows[elevation.modal]).toBe(expected[elevation.modal])
      expect(t.shadows[elevation.resting]).toBe('none')
    })
  }

  it('ダークのプロダクトテーマにリムライトが乗っている', () => {
    // モードで絞り込む形なので、対象が消えるとアサーション 0 件で成功する
    expect.hasAssertions()
    for (const [name, t, mode] of brandThemes) {
      if (mode !== 'dark') continue
      expect(t.shadows[elevation.raised], name).toContain('inset')
    }
  })

  it('ライトのプロダクトテーマは寒色ニュートラルの影を使う', () => {
    expect.hasAssertions()
    for (const [name, t, mode] of brandThemes) {
      if (mode !== 'light') continue
      expect(t.shadows[elevation.raised], name).toContain('rgba(15, 23, 42,')
    }
  })
})

describe('ブランド差し替えが目的どおり効いている', () => {
  it('sky-kaze は primary をロジ・オレンジに差し替える', () => {
    // ブランド色をハードコードすると、Kaze 側の primary を変えたときに
    // 差し替えの検証にならないまま通過する
    expect(logiLightTheme.palette.primary.main).not.toBe(
      theme.palette.primary.main
    )
    expect(logiLightTheme.palette.logiOrange.main).toBeTruthy()
  })

  it('ubereats-clone は ueGreen を追加しつつ Kaze の primary を保つ', () => {
    expect(ueLightTheme.palette.ueGreen.main).toBeTruthy()
  })
})

describe('CssVarsProvider 版テーマ (saas-dashboard が使用)', () => {
  it('ライトの影スケールを持つ', () => {
    const light = createShadows('light')
    expect(theme.shadows[elevation.raised]).toBe(light[elevation.raised])
  })

  it('モーション体系を持つ', () => {
    expect(theme.transitions.easing.easeOut).toBe(kazeEasing.enter)
  })

  it('ダークスキームでもリムライトが効く', () => {
    // colorSchemes 版は shadows をスキーム別に持てないため、
    // CssBaseline 側でダークスキーム時の影を上書きしている
    const overrides = theme.components?.MuiCssBaseline?.styleOverrides as
      Record<string, unknown> | undefined
    expect(overrides).toBeDefined()

    const darkRules = overrides?.['[data-mui-color-scheme="dark"], .dark'] as
      Record<string, { boxShadow: string }> | undefined
    expect(darkRules, 'ダークスキーム用の影上書き').toBeDefined()

    const dark = createShadows('dark')
    expect(darkRules?.['& .MuiCard-root'].boxShadow).toBe(
      dark[elevation.raised]
    )
    expect(darkRules?.['& .MuiCard-root'].boxShadow).toContain('inset')
    expect(darkRules?.['& .MuiDialog-paper'].boxShadow).toBe(
      dark[elevation.modal]
    )
  })

  it('ダーク上書きが主要な浮遊面を網羅している', () => {
    const overrides = theme.components?.MuiCssBaseline?.styleOverrides as
      Record<string, unknown> | undefined
    const darkRules = overrides?.['[data-mui-color-scheme="dark"], .dark'] as
      Record<string, unknown> | undefined

    for (const selector of [
      '& .MuiCard-root',
      '& .MuiCard-root:hover',
      '& .MuiMenu-paper',
      '& .MuiPopover-paper',
      '& .MuiTooltip-tooltip',
      '& .MuiDialog-paper',
      '& .MuiDrawer-paper',
    ]) {
      expect(darkRules?.[selector], selector).toBeDefined()
    }
  })
})

/**
 * アプリ側のブランド色は「面ごとに前景を決める」形にしてある。
 * 面を渡し忘れると、片方のモードで基準を割る（実際に起きた）。
 */
describe('アプリのブランド色が置く面ごとに基準を満たす', () => {
  it('KazeEats のワードマークはライト・ダーク両方で大きい文字の 3:1 を満たす', () => {
    for (const t of [ueLightTheme, ueDarkTheme]) {
      const surface = t.palette.background.paper
      expect(
        contrastRatioOf(ueWordmarkColor(surface), surface),
        `${t.palette.mode}: ${surface}`
      ).toBeGreaterThanOrEqual(CONTRAST_THRESHOLD.largeText)
    }
  })

  it('KazeLogistics のブランド色は前景として使う面で基準を満たす', () => {
    for (const mode of ['light', 'dark'] as const) {
      const surface = mode === 'light' ? '#FFFFFF' : LOGI_NAVY_LIGHT
      for (const color of [LOGI_ORANGE, LOGI_AMBER, LOGI_GREEN]) {
        expect(
          contrastRatioOf(logiForeground(color, mode), surface),
          `${mode} / ${color}`
        ).toBeGreaterThanOrEqual(CONTRAST_THRESHOLD.text)
        expect(
          contrastRatioOf(logiForegroundLarge(color, mode), surface),
          `${mode} / ${color} (大きい文字)`
        ).toBeGreaterThanOrEqual(CONTRAST_THRESHOLD.largeText)
      }
    }
  })
})
