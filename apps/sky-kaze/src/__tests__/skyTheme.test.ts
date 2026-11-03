// 文字色が「実際に置かれる面」で読めることを保証する。
//
// text.secondary は素の背景 (paper / default) では足りていたのに、
// テーブル見出しの action.hover やステップ説明のオレンジ tint に乗せると
// 割れていた（実描画で 16 箇所）。素の面だけで判定すると通ってしまうので、
// 淡い面まで含めて測る。

import { describe, expect, it } from 'vitest'

import { CONTRAST_THRESHOLD, contrastRatioOf } from '@/themes/contrast'

import { skyDarkColors, skyLightColors } from '~/theme/skyTheme'

/**
 * ライトで secondary の文字が実際に乗る面。
 * #F5F5F5 は action.hover を paper に、#FAF2EC は alpha(LOGI_ORANGE, 0.06) を
 * default に合成した実測値
 */
const LIGHT_SURFACES = ['#FFFFFF', '#FAFAFA', '#F5F5F5', '#FAF2EC'] as const

/** ダークの同等面（action.hover / tint はいずれも paper より明るい側に出る） */
const DARK_SURFACES = ['#0F172A', '#1E293B', '#243244'] as const

describe('sky-kaze の文字色', () => {
  it('ライトの text.secondary が淡い面でも本文 AA を満たす', () => {
    for (const bg of LIGHT_SURFACES) {
      const ratio = contrastRatioOf(skyLightColors.text.secondary, bg)
      expect(
        ratio,
        `text.secondary (${skyLightColors.text.secondary}) on ${bg} = ${ratio.toFixed(2)}`
      ).toBeGreaterThanOrEqual(CONTRAST_THRESHOLD.text)
    }
  })

  it('ダークの text.secondary が淡い面でも本文 AA を満たす', () => {
    for (const bg of DARK_SURFACES) {
      const ratio = contrastRatioOf(skyDarkColors.text.secondary, bg)
      expect(
        ratio,
        `text.secondary (${skyDarkColors.text.secondary}) on ${bg} = ${ratio.toFixed(2)}`
      ).toBeGreaterThanOrEqual(CONTRAST_THRESHOLD.text)
    }
  })

  it('text.primary は secondary より濃い（階層が反転していない）', () => {
    // secondary を補正するときに primary を追い越すと、淡いはずの文字が
    // 濃くなって主従が入れ替わる。値を動かしたら必ずここで気づけるようにする
    for (const c of [skyLightColors, skyDarkColors]) {
      const onPaper = (fg: string) => contrastRatioOf(fg, c.background.paper)
      expect(onPaper(c.text.primary)).toBeGreaterThan(onPaper(c.text.secondary))
    }
  })
})
