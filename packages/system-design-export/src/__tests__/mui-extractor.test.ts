import { describe, expect, it } from 'vitest'

import { extractPaletteColors } from '../extractors/mui'

// テスト用のモックパレット
const mockPalette = {
  mode: 'light' as const,
  primary: {
    main: '#2642be',
    dark: '#1a2c80',
    light: '#4d68d4',
    lighter: '#a6b4ec',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#696881',
    dark: '#424242',
    light: '#757575',
    contrastText: '#ffffff',
  },
  success: {
    main: '#46ab4a',
    dark: '#3f7f42',
    light: '#6db770',
    contrastText: '#ffffff',
  },
  info: {
    main: '#1dafc2',
    dark: '#277781',
    light: '#43bfcf',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#eb8117',
    dark: '#EF6C00',
    light: '#dd9c3c',
    contrastText: '#ffffff',
  },
  error: {
    main: '#da3737',
    dark: '#c63535',
    light: '#dc4e4e',
    contrastText: '#ffffff',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    500: '#9e9e9e',
    900: '#292929',
    A100: 'rgb(245, 245, 245)', // # 以外はスキップされるべき
  },
  text: {
    primary: '#1a1a2e',
    secondary: '#4a5568',
    disabled: '#bdbdbd',
  },
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
  },
  divider: 'rgba(0, 0, 0, 0.08)',
}

describe('extractPaletteColors', () => {
  it('セマンティックカラーを正しく抽出する', () => {
    const result = extractPaletteColors(mockPalette)
    expect(result.primary.main).toBe('#2642be')
    expect(result.primary.dark).toBe('#1a2c80')
    expect(result.primary.contrastText).toBe('#ffffff')
  })

  it('lighter がある場合のみ含める', () => {
    const result = extractPaletteColors(mockPalette)
    expect(result.primary.lighter).toBe('#a6b4ec')
    expect(result.secondary.lighter).toBeUndefined()
  })

  it('グレースケールの # 値のみ抽出する', () => {
    const result = extractPaletteColors(mockPalette)
    expect(result.grey['50']).toBe('#fafafa')
    expect(result.grey['500']).toBe('#9e9e9e')
    // rgb() 値はスキップ
    expect(result.grey.A100).toBeUndefined()
  })

  it('テキストカラーを抽出する', () => {
    const result = extractPaletteColors(mockPalette)
    expect(result.text.primary).toBe('#1a1a2e')
    expect(result.text.secondary).toBe('#4a5568')
    expect(result.text.disabled).toBe('#bdbdbd')
  })

  it('背景カラーを抽出する', () => {
    const result = extractPaletteColors(mockPalette)
    expect(result.background.default).toBe('#f8fafc')
    expect(result.background.paper).toBe('#ffffff')
  })

  it('divider を default キーで抽出する', () => {
    const result = extractPaletteColors(mockPalette)
    expect(result.divider.default).toBe('rgba(0, 0, 0, 0.08)')
  })

  it('6つのセマンティックカラーグループを全て含む', () => {
    const result = extractPaletteColors(mockPalette)
    const keys = ['primary', 'secondary', 'success', 'info', 'warning', 'error']
    for (const key of keys) {
      expect(result[key]).toBeDefined()
      expect(result[key].main).toBeDefined()
    }
  })
})
