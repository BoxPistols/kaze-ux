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
  LOGO_PRODUCTS,
  LOGO_PROHIBITIONS,
  LOGO_TONES,
} from '../logoRules'

const renderLogo = (
  ui: React.ReactElement,
  theme: typeof lightTheme = lightTheme
) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)

const svgOf = (container: HTMLElement) =>
  container.querySelector('svg') as SVGSVGElement

/** 図形の色（帯と半円は同じ g にまとめている） */
const shapeColorOf = (container: HTMLElement) =>
  svgOf(container).querySelector('g')?.getAttribute('fill') ?? ''

/** 塗り面の色。面を持つのは brand のみ（面がある場合は最初の rect） */
const surfaceColorOf = (container: HTMLElement) => {
  const rects = svgOf(container).querySelectorAll('rect')
  return rects.length > 1 ? rects[0].getAttribute('fill') : null
}

describe('シンボルの構造', () => {
  it('矩形と円だけで構成される（幾何学的原形のみ）', () => {
    const { container } = renderLogo(<KazeLogo tone='ink' />)
    const svg = svgOf(container)
    // 帯 1 + 半円 2
    expect(svg.querySelectorAll('rect')).toHaveLength(1)
    expect(svg.querySelectorAll('path')).toHaveLength(2)
  })

  it('デザイングリッドの座標系を保つ', () => {
    const { container } = renderLogo(<KazeLogo />)
    expect(svgOf(container).getAttribute('viewBox')).toBe(
      `0 0 ${LOGO_GRID} ${LOGO_GRID}`
    )
  })

  it('帯の高さはグリッドの 1/8', () => {
    const { container } = renderLogo(<KazeLogo tone='ink' />)
    const band = svgOf(container).querySelector('rect')
    expect(Number(band?.getAttribute('height'))).toBe(LOGO_GRID / 8)
  })

  it('上下の半円が逆側にずれている（非対称の均衡）', () => {
    const { container } = renderLogo(<KazeLogo tone='ink' />)
    const ds = [...svgOf(container).querySelectorAll('path')].map(
      (p) => p.getAttribute('d') ?? ''
    )
    expect(ds).toHaveLength(2)
    // 整数だけを見る正規表現だと、パスの書式が変わったとき NaN になり、
    // NaN !== NaN で検証せずに通ってしまう
    const startX = ds.map((d) => Number(d.match(/^M\s*(-?\d+(?:\.\d+)?)/)?.[1]))
    for (const x of startX) {
      expect(x, '起点 X を抽出できていない').not.toBeNaN()
    }
    expect(startX[0], '起点が同じでは対称になる').not.toBe(startX[1])
  })

  it('角丸を持たない（装飾を排す）', () => {
    // tone を明示しないと面が描かれず、最初の rect が帯になる
    const { container } = renderLogo(<KazeLogo tone='brand' />)
    const rects = [...svgOf(container).querySelectorAll('rect')]
    expect(rects, '面 + 帯').toHaveLength(2)
    for (const rect of rects) {
      expect(rect.getAttribute('rx')).toBeNull()
      expect(rect.getAttribute('ry')).toBeNull()
    }
  })

  it('影・グラデーションを持たない', () => {
    const { container } = renderLogo(<KazeLogo />)
    const svg = svgOf(container)
    expect(svg.querySelector('filter')).toBeNull()
    expect(svg.querySelector('linearGradient')).toBeNull()
    expect(svg.querySelector('defs')).toBeNull()
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

  it('最小サイズでも帯が 1px を割らない', () => {
    expect(LOGO_MIN_SIZE.icon / 8).toBeGreaterThanOrEqual(1)
  })
})

describe('クリアスペース', () => {
  // sx は emotion のクラスを生成するため、インライン style ではなく算出値を読む
  const paddingOf = (container: HTMLElement) =>
    Number.parseFloat(
      getComputedStyle(container.firstElementChild as HTMLElement).padding
    )

  it('既定では余白を持たない', () => {
    const { container } = renderLogo(<KazeLogo size={40} />)
    expect(paddingOf(container)).toBe(0)
  })

  it('withClearSpace で一辺の 25% を四辺に確保する', () => {
    const size = 40
    const { container } = renderLogo(<KazeLogo size={size} withClearSpace />)
    expect(paddingOf(container)).toBeCloseTo(size * LOGO_CLEAR_SPACE_RATIO)
  })
})

// ink / inverse は tone を明示するため、置かれる面も固定値で表す。
// auto はテーマから面を決めるので、そちらはテーマ値で検証する
const LIGHT_SURFACE = '#ffffff'
const DARK_SURFACE = '#0A0A0A'

describe('配色', () => {
  it('brand は塗り面を持ち、図形は面に対して本文 AA を満たす', () => {
    const { container } = renderLogo(<KazeLogo tone='brand' />)
    expect(svgOf(container).querySelectorAll('rect'), '面 + 帯').toHaveLength(2)

    const surface = surfaceColorOf(container) ?? ''
    const shape = shapeColorOf(container)
    const ratio = contrastRatio(shape, surface)
    expect(
      ratio,
      `図形 ${shape} on 面 ${surface} = ${ratio.toFixed(2)}`
    ).toBeGreaterThanOrEqual(4.5)
  })

  it('ink / inverse / outline は塗り面を持たない', () => {
    for (const tone of ['ink', 'inverse', 'outline'] as const) {
      const { container } = renderLogo(<KazeLogo tone={tone} />)
      // 面がなければ rect は帯の 1 つだけ
      expect(svgOf(container).querySelectorAll('rect'), tone).toHaveLength(1)
    }
  })

  it('ink は明るい面で、inverse は暗い面で AA を満たす', () => {
    const ink = renderLogo(<KazeLogo tone='ink' />)
    expect(
      contrastRatio(shapeColorOf(ink.container), LIGHT_SURFACE)
    ).toBeGreaterThanOrEqual(4.5)

    const inv = renderLogo(<KazeLogo tone='inverse' />)
    expect(
      contrastRatio(shapeColorOf(inv.container), DARK_SURFACE)
    ).toBeGreaterThanOrEqual(4.5)
  })

  it('auto はライトで ink、ダークで inverse を選ぶ', () => {
    const light = renderLogo(<KazeLogo tone='auto' />, lightTheme)
    expect(
      contrastRatio(
        shapeColorOf(light.container),
        lightTheme.palette.background.default
      )
    ).toBeGreaterThanOrEqual(4.5)

    const dark = renderLogo(<KazeLogo tone='auto' />, darkTheme)
    expect(
      contrastRatio(
        shapeColorOf(dark.container),
        darkTheme.palette.background.default
      )
    ).toBeGreaterThanOrEqual(4.5)
  })

  it('規定の 4 種以外のトーンを受け付けない（型と実装の対応）', () => {
    expect(LOGO_TONES).toEqual(['brand', 'ink', 'inverse', 'outline'])
  })
})

describe('プロダクト別サブブランド', () => {
  const products = Object.keys(LOGO_PRODUCTS) as Array<
    keyof typeof LOGO_PRODUCTS
  >

  it('形は全プロダクトで共通', () => {
    const shapes = products.map((product) => {
      const { container } = renderLogo(<KazeLogo product={product} />)
      return [...svgOf(container).querySelectorAll('path')]
        .map((p) => p.getAttribute('d'))
        .join('|')
    })
    expect(new Set(shapes).size, '形が分岐している').toBe(1)
  })

  it('面の色だけがプロダクトを識別する', () => {
    for (const product of products) {
      const { container } = renderLogo(<KazeLogo product={product} />)
      expect(surfaceColorOf(container), product).toBe(LOGO_PRODUCTS[product])
    }
  })

  it('バウハウスの三原色を使う（中間色を混ぜない）', () => {
    expect(Object.values(LOGO_PRODUCTS)).toEqual([
      '#0057B8',
      '#E4002B',
      '#FFB612',
    ])
  })

  it('どのプロダクト色でも図形が面に対して本文 AA を満たす', () => {
    for (const product of products) {
      const { container } = renderLogo(<KazeLogo product={product} />)
      const surface = surfaceColorOf(container) ?? ''
      const shape = shapeColorOf(container)
      const ratio = contrastRatio(shape, surface)
      expect(
        ratio,
        `${product}: 図形 ${shape} on 面 ${surface} = ${ratio.toFixed(2)}`
      ).toBeGreaterThanOrEqual(4.5)
    }
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
