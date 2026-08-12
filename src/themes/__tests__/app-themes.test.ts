import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  skyDarkColors,
  skyLightColors,
  skyTheme,
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
  ['ubereats-clone (light)', ueLightTheme, 'light'],
  ['ubereats-clone (dark)', ueDarkTheme, 'dark'],
]

/** colorSchemes 版テーマ（1 つのテーマが light/dark 両方を持つ） */
const cssVarsThemes: Array<[string, Theme]> = [
  ['kaze (共有)', theme],
  ['sky-kaze', skyTheme],
]

const cssBaselineOverrides = (t: Theme): Record<string, unknown> =>
  (t.components?.MuiCssBaseline?.styleOverrides ?? {}) as Record<
    string,
    unknown
  >

const DARK_SELECTOR = '[data-mui-color-scheme="dark"], .dark'

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
  it('sky-kaze は primary をロジのブランド軸に差し替える', () => {
    // ブランド色をハードコードすると、Kaze 側の primary を変えたときに
    // 差し替えの検証にならないまま通過する
    expect(skyLightColors.primary.main).not.toBe(theme.palette.primary.main)
    expect(skyTheme.palette.logiOrange.main).toBeTruthy()
  })

  it('ubereats-clone は ueGreen を追加しつつ Kaze の primary を保つ', () => {
    expect(ueLightTheme.palette.ueGreen.main).toBeTruthy()
  })
})

describe('colorSchemes 版テーマ (saas-dashboard / sky-kaze が使用)', () => {
  for (const [name, t] of cssVarsThemes) {
    it(`${name}: ライトの影スケールを持つ`, () => {
      const light = createShadows('light')
      expect(t.shadows[elevation.raised]).toBe(light[elevation.raised])
    })

    it(`${name}: モーション体系を持つ`, () => {
      expect(t.transitions.easing.easeOut).toBe(kazeEasing.enter)
    })

    it(`${name}: 光学タイポグラフィを継承している`, () => {
      expect(t.typography.h1.letterSpacing).toBe(letterSpacingVariant.xxl)
      expect(t.typography.body1.lineHeight).toBe(1.6)
      expect(t.typography.button.fontWeight).toBe(500)
    })

    it(`${name}: ダークスキームでもリムライトが効く`, () => {
      // colorSchemes 版は shadows をスキーム別に持てないため、
      // CssBaseline 側でダークスキーム時の影を上書きしている
      const darkRules = cssBaselineOverrides(t)[DARK_SELECTOR] as
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

    it(`${name}: ダーク上書きが主要な浮遊面を網羅している`, () => {
      const darkRules = cssBaselineOverrides(t)[DARK_SELECTOR] as
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
  }
})

/**
 * #69: apps/sky-kaze だけ `--color-*` が index.css に手打ちで残り、
 * 同じ画面で MUI の primary (青) と Tailwind の primary (navy) が
 * 別の色を指していた。どちらが効くかは CSS の注入順次第だった。
 *
 * 「MUI と Tailwind が同じ定義から出ていること」を構造として検証する。
 */
describe('MUI と Tailwind が同じ色定義を指している (sky-kaze)', () => {
  const overrides = cssBaselineOverrides(skyTheme)
  const lightVars = overrides[':root'] as Record<string, string>
  const darkVars = overrides[DARK_SELECTOR] as Record<string, string>

  it('ライト: --color-primary が palette.primary.main と一致する', () => {
    expect(lightVars['--color-primary']).toBe(skyLightColors.primary.main)
    expect(lightVars['--color-primary']).toBe(skyTheme.palette.primary.main)
  })

  it('ダーク: --color-primary が ダークスキームの primary.main と一致する', () => {
    expect(darkVars['--color-primary']).toBe(skyDarkColors.primary.main)
  })

  it('背景・文字もモードごとに生成されている', () => {
    expect(lightVars['--color-background-paper']).toBe(
      skyLightColors.background.paper
    )
    expect(darkVars['--color-background-paper']).toBe(
      skyDarkColors.background.paper
    )
    expect(lightVars['--color-foreground']).toBe(skyLightColors.text.primary)
    expect(darkVars['--color-foreground']).toBe(skyDarkColors.text.primary)
  })

  it('アプリ固有の accent も生成側に載っている', () => {
    for (const [label, vars] of [
      ['light', lightVars],
      ['dark', darkVars],
    ] as const) {
      expect(vars['--color-accent'], label).toBeTruthy()
      expect(vars['--color-accent-light'], label).toBeTruthy()
      // 塗り面に置く文字は実測で決める（明るいオレンジに白は乗らない）
      const accent = vars['--color-accent']
      const ink = vars['--color-accent-foreground']
      expect(
        contrastRatioOf(ink, accent),
        `${label}: accent ${accent} に ${ink}`
      ).toBeGreaterThanOrEqual(CONTRAST_THRESHOLD.text)
    }
  })

  it('アプリの index.css に --color-* の手打ち定義が無い', () => {
    // 生成に一本化した意味は「もう一つのソースが無いこと」にある。
    // 1 行に複数宣言が来ても拾えるよう、行頭を前提にしない
    // apps/ubereats-clone にも手打ちが残っているが、そちらはブランド色の
    // 変更と一緒に移す（#72）。移したらこの配列に足す
    const cssFiles = [
      'apps/sky-kaze/src/index.css',
      'apps/saas-dashboard/src/index.css',
    ]
    for (const rel of cssFiles) {
      const css = readFileSync(join(process.cwd(), rel), 'utf8')
      // コメント内の記述は対象外（注意書きで --color-* に言及している）
      const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
      const declarations = withoutComments.match(/--color-[\w-]+\s*:/g) ?? []
      expect(declarations, `${rel} の手打ち定義`).toEqual([])
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
