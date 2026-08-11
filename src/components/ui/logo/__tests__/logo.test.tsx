import { ThemeProvider } from '@mui/material/styles'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { contrastRatio } from '@/themes/contrast'
import { darkTheme, lightTheme } from '@/themes/theme'

import { KazeLogo } from '../kazeLogo'
import {
  LOGO_CLEAR_SPACE_RATIO,
  LOGO_GRID,
  LOGO_MIN_SIZE,
  LOGO_PROHIBITIONS,
  LOGO_TONES,
} from '../logoRules'

const renderLogo = (
  ui: React.ReactElement,
  theme: typeof lightTheme = lightTheme
) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)

const svgOf = (container: HTMLElement) =>
  container.querySelector('svg') as SVGSVGElement

describe('シンボルの構造', () => {
  it('三本のストロークで構成される', () => {
    const { container } = renderLogo(<KazeLogo />)
    expect(svgOf(container).querySelectorAll('path')).toHaveLength(3)
  })

  it('デザイングリッドの座標系を保つ', () => {
    const { container } = renderLogo(<KazeLogo />)
    expect(svgOf(container).getAttribute('viewBox')).toBe(
      `0 0 ${LOGO_GRID} ${LOGO_GRID}`
    )
  })

  it('線端が丸い（筆が離れる瞬間の丸みに対応）', () => {
    const { container } = renderLogo(<KazeLogo />)
    const group = svgOf(container).querySelector('g')
    expect(group?.getAttribute('stroke-linecap')).toBe('round')
  })

  it('ストローク幅はグリッドの 1/12', () => {
    const { container } = renderLogo(<KazeLogo />)
    const group = svgOf(container).querySelector('g')
    expect(Number(group?.getAttribute('stroke-width'))).toBeCloseTo(
      LOGO_GRID / 12,
      3
    )
  })

  it('三本の長さが異なる（均等な三本線の硬さを避ける）', () => {
    const { container } = renderLogo(<KazeLogo />)
    const ds = [...svgOf(container).querySelectorAll('path')].map((p) =>
      p.getAttribute('d')
    )
    expect(new Set(ds).size).toBe(3)
  })
})

describe('縦横比', () => {
  it('常に正方形で描画される（縦横比を変えられない）', () => {
    for (const size of [16, 24, 48, 120]) {
      const { container } = renderLogo(<KazeLogo size={size} />)
      const svg = svgOf(container)
      expect(svg.getAttribute('width')).toBe(svg.getAttribute('height'))
    }
  })
})

describe('最小サイズ', () => {
  it('シンボルは icon の下限に丸められる', () => {
    const { container } = renderLogo(<KazeLogo size={4} />)
    expect(Number(svgOf(container).getAttribute('width'))).toBe(
      LOGO_MIN_SIZE.icon
    )
  })

  it('ワードマーク併記は withWordmark の下限に丸められる', () => {
    const { container } = renderLogo(<KazeLogo variant='horizontal' size={4} />)
    expect(Number(svgOf(container).getAttribute('width'))).toBe(
      LOGO_MIN_SIZE.withWordmark
    )
  })

  it('下限以上の指定はそのまま使う', () => {
    const { container } = renderLogo(<KazeLogo size={64} />)
    expect(Number(svgOf(container).getAttribute('width'))).toBe(64)
  })
})

describe('クリアスペース', () => {
  // sx は emotion のクラスを生成するため、インライン style ではなく
  // 算出値を読む
  const paddingOf = (container: HTMLElement) =>
    getComputedStyle(container.firstElementChild as HTMLElement).padding

  it('既定では余白を持たない', () => {
    const { container } = renderLogo(<KazeLogo size={40} />)
    expect(paddingOf(container)).toBe('0px')
  })

  it('withClearSpace で一辺の 25% を四辺に確保する', () => {
    const size = 40
    const { container } = renderLogo(<KazeLogo size={size} withClearSpace />)
    expect(paddingOf(container)).toBe(`${size * LOGO_CLEAR_SPACE_RATIO}px`)
  })
})

describe('配色', () => {
  it('brand は塗り面を持ち、線は面に対して本文 AA を満たす', () => {
    const { container } = renderLogo(<KazeLogo tone='brand' />)
    const svg = svgOf(container)
    const rect = svg.querySelector('rect')
    expect(rect, 'brand は面を持つ').not.toBeNull()

    const fill = rect?.getAttribute('fill') ?? ''
    const stroke = svg.querySelector('g')?.getAttribute('stroke') ?? ''
    const ratio = contrastRatio(stroke, fill)
    expect(
      ratio,
      `線 ${stroke} on 面 ${fill} = ${ratio.toFixed(2)}`
    ).toBeGreaterThanOrEqual(4.5)
  })

  it('ink / inverse / outline は面を持たない', () => {
    for (const tone of ['ink', 'inverse', 'outline'] as const) {
      const { container } = renderLogo(<KazeLogo tone={tone} />)
      expect(svgOf(container).querySelector('rect'), tone).toBeNull()
    }
  })

  it('ink は明るい面で、inverse は暗い面で AA を満たす', () => {
    const inkResult = renderLogo(<KazeLogo tone='ink' />)
    const ink =
      svgOf(inkResult.container).querySelector('g')?.getAttribute('stroke') ??
      ''
    expect(contrastRatio(ink, '#ffffff')).toBeGreaterThanOrEqual(4.5)

    const invResult = renderLogo(<KazeLogo tone='inverse' />)
    const inverse =
      svgOf(invResult.container).querySelector('g')?.getAttribute('stroke') ??
      ''
    expect(contrastRatio(inverse, '#0A0A0A')).toBeGreaterThanOrEqual(4.5)
  })

  it('auto はライトで ink、ダークで inverse を選ぶ', () => {
    const light = renderLogo(<KazeLogo tone='auto' />, lightTheme)
    const lightStroke =
      svgOf(light.container).querySelector('g')?.getAttribute('stroke') ?? ''
    expect(contrastRatio(lightStroke, '#ffffff')).toBeGreaterThanOrEqual(4.5)

    const dark = renderLogo(<KazeLogo tone='auto' />, darkTheme)
    const darkStroke =
      svgOf(dark.container).querySelector('g')?.getAttribute('stroke') ?? ''
    expect(
      contrastRatio(darkStroke, darkTheme.palette.background.default)
    ).toBeGreaterThanOrEqual(4.5)
  })

  it('規定の 4 種以外のトーンを受け付けない（型と実装の対応）', () => {
    expect(LOGO_TONES).toEqual(['brand', 'ink', 'inverse', 'outline'])
  })
})

describe('アクセシビリティ', () => {
  it('title を渡すと画像として名前を持つ', () => {
    const { container } = renderLogo(<KazeLogo title='Kaze' />)
    const svg = svgOf(container)
    expect(svg.getAttribute('role')).toBe('img')
    expect(svg.getAttribute('aria-label')).toBe('Kaze')
  })

  it('空文字を渡すと装飾として支援技術から隠される', () => {
    const { container } = renderLogo(<KazeLogo title='' />)
    const svg = svgOf(container)
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.getAttribute('role')).toBeNull()
  })

  it('フォーカス対象にならない', () => {
    const { container } = renderLogo(<KazeLogo />)
    expect(svgOf(container).getAttribute('focusable')).toBe('false')
  })
})

describe('レギュレーションの文書化', () => {
  it('禁止事項がすべて理由を伴う', () => {
    expect(LOGO_PROHIBITIONS.length).toBeGreaterThanOrEqual(5)
    for (const rule of LOGO_PROHIBITIONS) {
      expect(rule.title, rule.id).toBeTruthy()
      expect(rule.reason.length, `${rule.id} の理由が短すぎる`).toBeGreaterThan(
        15
      )
    }
  })
})
