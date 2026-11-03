import { describe, expect, it } from 'vitest'

import { formatDTCG } from '../formatter'
import type { ExtractedTokens } from '../types'

describe('formatDTCG', () => {
  it('空トークンでも $schema と $description を出力する', () => {
    const result = formatDTCG({})
    expect(result.$schema).toBe(
      'https://design-tokens.github.io/community-group/format/'
    )
    expect(result.$description).toBe('Design Tokens (W3C DTCG format)')
  })

  it('カスタム description を設定できる', () => {
    const result = formatDTCG({}, 'My Design System')
    expect(result.$description).toBe('My Design System')
  })

  it('カラートークンを light/dark 構造で出力する', () => {
    const tokens: ExtractedTokens = {
      color: {
        light: { primary: { main: '#2642be', dark: '#1a2c80' } },
        dark: { primary: { main: '#5d7ce8', dark: '#4a66c9' } },
      },
    }
    const result = formatDTCG(tokens)
    const light = result.color as Record<string, unknown>
    expect(light).toBeDefined()
    expect(light.light).toBeDefined()
    expect(light.dark).toBeDefined()
  })

  it('タイポグラフィトークンを正しく出力する', () => {
    const tokens: ExtractedTokens = {
      typography: {
        fontFamily: 'Inter, sans-serif',
        baseFontSize: 14,
        sizes: {
          h1: { px: 22, rem: '1.57rem' },
          body1: { px: 14, rem: '1rem' },
        },
        weights: { regular: 400, bold: 700 },
      },
    }
    const result = formatDTCG(tokens)
    const typo = result.typography as Record<string, unknown>
    expect(typo).toBeDefined()

    const fontFamily = typo.fontFamily as { $value: string; $type: string }
    expect(fontFamily.$value).toBe('Inter, sans-serif')
    expect(fontFamily.$type).toBe('fontFamily')

    const fontSize = typo.fontSize as Record<string, unknown>
    const h1 = fontSize.h1 as { $value: string; $type: string }
    expect(h1.$value).toBe('22px')
    expect(h1.$type).toBe('dimension')
  })

  it('スペーシングトークンを px 単位で出力する', () => {
    const tokens: ExtractedTokens = {
      spacing: {
        base: 4,
        values: { '1': 4, '2': 8, '4': 16 },
      },
    }
    const result = formatDTCG(tokens)
    const spacing = result.spacing as Record<string, unknown>
    const s1 = spacing['1'] as { $value: string }
    expect(s1.$value).toBe('4px')
  })

  it('ボーダーラジウストークンを出力する', () => {
    const tokens: ExtractedTokens = {
      borderRadius: { sm: 4, md: 8, full: '9999px' },
    }
    const result = formatDTCG(tokens)
    const br = result.borderRadius as Record<string, unknown>
    const sm = br.sm as { $value: string }
    expect(sm.$value).toBe('4px')
    const full = br.full as { $value: string }
    expect(full.$value).toBe('9999px')
  })

  it('シャドウトークンに名前付きキーを割り当てる', () => {
    const tokens: ExtractedTokens = {
      shadows: [
        'none',
        '0 1px 2px rgba(0,0,0,0.1)',
        '0 4px 6px rgba(0,0,0,0.1)',
      ],
    }
    const result = formatDTCG(tokens)
    const shadow = result.shadow as Record<string, unknown>
    expect(shadow.none).toBeDefined()
    expect(shadow.xs).toBeDefined()
    expect(shadow.sm).toBeDefined()
  })

  it('ブレークポイントトークンを出力する', () => {
    const tokens: ExtractedTokens = {
      breakpoints: { xs: 0, sm: 600, md: 960 },
    }
    const result = formatDTCG(tokens)
    const bp = result.breakpoint as Record<string, unknown>
    const sm = bp.sm as { $value: string }
    expect(sm.$value).toBe('600px')
  })
})
