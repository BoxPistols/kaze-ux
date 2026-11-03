// マーカーの選択強調 ユニットテスト
//
// 壊れても画面は出る（マーカーは描画され、色も付く）。強調だけが
// 一度も出ない、という壊れ方をするのでテストが無いと気づけない。

import { describe, expect, it } from 'vitest'

import { selectionChanged } from '~/utils/markerSelection'

describe('selectionChanged', () => {
  it('選択されたドライバーは変化ありと判定する', () => {
    expect(selectionChanged('d1', 'd1', null)).toBe(true)
  })

  it('選択が外れたドライバーも変化ありと判定する', () => {
    expect(selectionChanged('d1', null, 'd1')).toBe(true)
  })

  it('別のドライバーへ選択が移ったら、両方が変化ありになる', () => {
    expect(selectionChanged('d1', 'd2', 'd1')).toBe(true)
    expect(selectionChanged('d2', 'd2', 'd1')).toBe(true)
  })

  it('関係ないドライバーは変化なし', () => {
    expect(selectionChanged('d3', 'd2', 'd1')).toBe(false)
  })

  it('選択が変わっていなければ、選ばれている側も変化なし', () => {
    // 以前の実装はここが常に false になっていた。つまり選択された瞬間も
    // false のままで、強調が適用されなかった
    expect(selectionChanged('d1', 'd1', 'd1')).toBe(false)
  })

  it('誰も選ばれていない状態が続けば変化なし', () => {
    expect(selectionChanged('d1', null, null)).toBe(false)
  })
})
