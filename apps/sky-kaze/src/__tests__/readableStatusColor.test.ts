// ステータス色の明度補正 ユニットテスト
//
// ここは「見た目の調整」ではなく、置かれる面で読めることを保証する計算。
// 壊れても画面は出るので、テストが無いと気づけない。

import { describe, expect, it } from 'vitest'

import {
  CONTRAST_THRESHOLD,
  composite,
  contrastRatioOf,
  parseColor,
} from '@/themes/contrast'

import {
  PANEL_BACKGROUNDS,
  readableOnTint,
  readableStatusColor,
} from '~/utils/readableStatusColor'

import { DRIVER_STATUS_COLOR } from '~/data/simulation'
import { STATUS_COLORS } from '~/data/logistics'

const MODES = ['light', 'dark'] as const

describe('readableStatusColor', () => {
  it.each(MODES)('%s: パネルの実効背景で本文 AA を満たす', (mode) => {
    const bg = PANEL_BACKGROUNDS.standard[mode]
    for (const color of Object.values(STATUS_COLORS)) {
      expect(
        contrastRatioOf(readableStatusColor(color, mode), bg),
        `${mode} / ${color}`
      ).toBeGreaterThanOrEqual(CONTRAST_THRESHOLD.text)
    }
  })

  it.each(MODES)('%s: ドライバーの状態色も同じ基準を満たす', (mode) => {
    const bg = PANEL_BACKGROUNDS.standard[mode]
    for (const color of Object.values(DRIVER_STATUS_COLOR)) {
      expect(
        contrastRatioOf(readableStatusColor(color, mode), bg),
        `${mode} / ${color}`
      ).toBeGreaterThanOrEqual(CONTRAST_THRESHOLD.text)
    }
  })

  it('補正前のブランド色そのままでは基準に届かないものがある', () => {
    // 補正が「何もしていない」わけではないことを示す。
    // 全部が元から基準を満たしているなら、この関数は不要ということになる
    const bg = PANEL_BACKGROUNDS.standard.dark
    const raw = Object.values(STATUS_COLORS).map((c) => contrastRatioOf(c, bg))
    expect(Math.min(...raw)).toBeLessThan(CONTRAST_THRESHOLD.text)
  })

  it('同じ入力には同じ値を返す（キャッシュしても結果が変わらない）', () => {
    const a = readableStatusColor('#8B5CF6', 'dark')
    const b = readableStatusColor('#8B5CF6', 'dark')
    expect(a).toBe(b)
  })

  it('モードが違えば別の値になりうる', () => {
    const light = readableStatusColor('#3B82F6', 'light')
    const dark = readableStatusColor('#3B82F6', 'dark')
    expect(typeof light).toBe('string')
    expect(typeof dark).toBe('string')
    // 明暗が逆の面に同じ色を置けば、どちらかは必ず割れる
    expect(light).not.toBe(dark)
  })
})

/** 実装と同じ手順で「実際に描かれる面」を作る */
const tintedSurface = (color: string, surface: string, alpha = 0.12) => {
  const c = composite({ ...parseColor(color), a: alpha }, parseColor(surface))
  return `#${[c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
}

describe('readableOnTint', () => {
  it.each(['#FFFFFF', '#242424'])(
    '%s の上に色を薄く敷いた面で本文 AA を満たす',
    (surface) => {
      // Chip は面に alpha 0.12 で自分の色を敷く。素の面で測ると
      // 足りているように見えて、実際に描かれる面では割れる。
      // **合成後の面に対して測らないと、この関数の意味を検証していない**
      for (const color of Object.values(STATUS_COLORS)) {
        const ink = readableOnTint(color, surface)
        expect(
          contrastRatioOf(ink, tintedSurface(color, surface)),
          `${surface} / ${color}`
        ).toBeGreaterThanOrEqual(CONTRAST_THRESHOLD.text)
      }
    }
  )

  it('補正しなければ届かない色がある（関数が実際に効いている）', () => {
    const surface = '#FFFFFF'
    const raw = Object.values(STATUS_COLORS).map((c) =>
      contrastRatioOf(c, tintedSurface(c, surface))
    )
    expect(Math.min(...raw)).toBeLessThan(CONTRAST_THRESHOLD.text)
  })

  it('tint が濃いほど面が沈むので、文字側も変わる', () => {
    const light = readableOnTint('#F59E0B', '#FFFFFF', 0.12)
    const heavy = readableOnTint('#F59E0B', '#FFFFFF', 0.6)
    expect(light).not.toBe(heavy)
  })

  it('同じ入力には同じ値を返す', () => {
    expect(readableOnTint('#22C55E', '#242424')).toBe(
      readableOnTint('#22C55E', '#242424')
    )
  })
})

describe('PANEL_BACKGROUNDS', () => {
  it('半透明のパネルを下地に合成した solid 値を持つ', () => {
    for (const kind of ['standard', 'emphasized'] as const) {
      for (const mode of MODES) {
        expect(PANEL_BACKGROUNDS[kind][mode]).toMatch(/^#[0-9a-f]{6}$/i)
      }
    }
  })

  it('強調パネルは標準より不透明なので、下地の影響が小さい', () => {
    // 標準と強調が同値なら、合成が効いていないということ
    expect(PANEL_BACKGROUNDS.standard.dark).not.toBe(
      PANEL_BACKGROUNDS.emphasized.dark
    )
  })
})
