import { describe, expect, it } from 'vitest'

import { flattenColors, parsePxValue } from '../extractors/tailwind'

describe('flattenColors', () => {
  it('ネストされたカラーオブジェクトをフラット化する', () => {
    const colors = {
      primary: { DEFAULT: '#2642be', light: '#4d68d4', dark: '#1a2c80' },
    }
    const result = flattenColors(colors)
    expect(result.primary.main).toBe('#2642be')
    expect(result.primary.light).toBe('#4d68d4')
    expect(result.primary.dark).toBe('#1a2c80')
  })

  it('DEFAULT キーを main に変換する', () => {
    const colors = {
      success: { DEFAULT: '#46ab4a' },
    }
    const result = flattenColors(colors)
    expect(result.success.main).toBe('#46ab4a')
    expect(result.success.DEFAULT).toBeUndefined()
  })

  it('CSS 変数参照をそのまま保持する', () => {
    const colors = {
      primary: {
        DEFAULT: 'var(--color-primary)',
        light: 'var(--color-primary-light)',
      },
    }
    const result = flattenColors(colors)
    expect(result.primary.main).toBe('var(--color-primary)')
  })

  it('トップレベル文字列値を base グループに格納する', () => {
    const colors = {
      foreground: 'var(--color-foreground)',
      border: 'var(--color-border)',
    }
    const result = flattenColors(colors)
    expect(result.base.foreground).toBe('var(--color-foreground)')
    expect(result.base.border).toBe('var(--color-border)')
  })

  it('空オブジェクトを処理できる', () => {
    const result = flattenColors({})
    expect(Object.keys(result)).toHaveLength(0)
  })

  it('非文字列のサブ値をスキップする', () => {
    const colors = {
      complex: { DEFAULT: '#fff', nested: { deep: '#000' } },
    }
    const result = flattenColors(colors)
    expect(result.complex.main).toBe('#fff')
    // nested はオブジェクトなのでスキップ
    expect(result.complex.nested).toBeUndefined()
  })
})

describe('parsePxValue', () => {
  it('px 文字列から数値を抽出する', () => {
    expect(parsePxValue('768px')).toBe(768)
    expect(parsePxValue('4px')).toBe(4)
    expect(parsePxValue('12.5px')).toBe(12.5)
  })

  it('非 px 文字列は undefined を返す', () => {
    expect(parsePxValue('1rem')).toBeUndefined()
    expect(parsePxValue('100%')).toBeUndefined()
    expect(parsePxValue('auto')).toBeUndefined()
  })

  it('0px を正しく処理する', () => {
    expect(parsePxValue('0px')).toBe(0)
  })
})
