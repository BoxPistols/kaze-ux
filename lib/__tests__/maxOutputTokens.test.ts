import { describe, expect, it } from 'vitest'

import {
  GEMINI_REASONING_BUFFER,
  resolveMaxOutputTokens,
} from '../maxOutputTokens'

describe('resolveMaxOutputTokens', () => {
  describe('Gemini 2.5 の reasoning buffer', () => {
    // この分岐が無いと reasoning が上限を食い切って本文が空になる。
    // buffer を外すと落ちること（＝この test が分岐を守っていること）を確認済み
    it('Gemini 2.5 は buffer 分だけ他モデルより大きい', () => {
      const gemini = resolveMaxOutputTokens('gemini-2.5-flash')
      const other = resolveMaxOutputTokens('gemini-2.0-flash')
      expect(gemini - other).toBe(GEMINI_REASONING_BUFFER)
    })

    it('接続テストでも Gemini 2.5 は buffer を確保する', () => {
      const gemini = resolveMaxOutputTokens('gemini-2.5-pro', { isTest: true })
      const other = resolveMaxOutputTokens('gpt-5.6-luna', { isTest: true })
      expect(gemini).toBeGreaterThan(GEMINI_REASONING_BUFFER)
      expect(other).toBeLessThan(GEMINI_REASONING_BUFFER)
    })

    it('Gemini 2.5 以外に buffer を足さない', () => {
      expect(resolveMaxOutputTokens('gpt-4o')).toBe(
        resolveMaxOutputTokens('gemini-2.0-flash')
      )
    })
  })

  describe('requested の扱い', () => {
    // 呼び出し側はこの関数の戻り値をそのまま送ってくる（buffer 加算済み）。
    // サーバー側で再加算すると二重になる
    it('範囲内の requested はそのまま返す（二重加算しない）', () => {
      const clientValue = resolveMaxOutputTokens('gemini-2.5-flash')
      expect(
        resolveMaxOutputTokens('gemini-2.5-flash', { requested: clientValue })
      ).toBe(clientValue)
    })

    it('範囲外の requested は無視してモデル既定にフォールバックする', () => {
      const fallback = resolveMaxOutputTokens('gemini-2.5-flash')
      for (const requested of [0, -1, 32001, Number.NaN]) {
        expect(resolveMaxOutputTokens('gemini-2.5-flash', { requested })).toBe(
          fallback
        )
      }
    })

    it('isTest は requested より優先される', () => {
      expect(
        resolveMaxOutputTokens('gpt-4o', { requested: 8000, isTest: true })
      ).toBeLessThan(8000)
    })
  })

  describe('モデル別の既定値', () => {
    it('reasoning 系（gpt-5 / o1 / o3）は既定より大きい', () => {
      const base = resolveMaxOutputTokens('gpt-4o')
      for (const model of ['gpt-5.6', 'o1-preview', 'o3-mini']) {
        expect(resolveMaxOutputTokens(model)).toBeGreaterThan(base)
      }
    })

    it('コスト最適枠（nano / luna）は reasoning 系の拡大を受けない', () => {
      const base = resolveMaxOutputTokens('gpt-4o')
      // gpt-5.6-luna は gpt-5 にも一致するが、luna 判定が先に効く
      expect(resolveMaxOutputTokens('gpt-5.6-luna')).toBe(base)
      expect(resolveMaxOutputTokens('gpt-5-nano')).toBe(base)
    })
  })
})
