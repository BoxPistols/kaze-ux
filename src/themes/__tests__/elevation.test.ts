import { describe, expect, it } from 'vitest'

import { createShadows, elevation } from '../elevation'

const light = createShadows('light')
const dark = createShadows('dark')

type ShadowLayer = {
  inset: boolean
  y: number
  blur: number
  spread: number
  alpha: number
}

// `0` と `0px` が混在するため長さの単位は optional にする
const LAYER_RE =
  /(inset\s+)?(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+rgba\([^)]*?,\s*([\d.]+)\)/g

/** box-shadow 文字列を層ごとに構造化する */
const parseLayers = (shadow: string): ShadowLayer[] =>
  [...shadow.matchAll(LAYER_RE)].map((m) => ({
    inset: Boolean(m[1]),
    y: Number(m[3]),
    blur: Number(m[4]),
    spread: Number(m[5]),
    alpha: Number(m[6]),
  }))

/** 影の層（リムライトを除く） */
const shadowLayersOf = (shadow: string) =>
  parseLayers(shadow).filter((l) => !l.inset)

/** リムライト層（ダークのみ存在） */
const rimLayerOf = (shadow: string) => parseLayers(shadow).find((l) => l.inset)

describe('影スケールの生成 (createShadows)', () => {
  it('MUI が要求する 25 段を返す', () => {
    expect(light).toHaveLength(25)
    expect(dark).toHaveLength(25)
  })

  it('段 0 は影なし', () => {
    expect(light[0]).toBe('none')
    expect(dark[0]).toBe('none')
  })

  it('段 1 以降は全て影を持つ', () => {
    for (let n = 1; n < 25; n++) {
      expect(light[n], `light[${n}]`).not.toBe('none')
      expect(dark[n], `dark[${n}]`).not.toBe('none')
    }
  })

  it('二層構造（近接影 + 遠方影）になっている', () => {
    for (let n = 1; n < 25; n++) {
      // ライトは 2 層、ダークはリムライトを足して 3 層
      expect(light[n].split('rgba').length - 1, `light[${n}]`).toBe(2)
      expect(dark[n].split('rgba').length - 1, `dark[${n}]`).toBe(3)
    }
  })
})

describe('影の色相', () => {
  it('ライトは寒色ニュートラル slate-900 を影色に使う', () => {
    for (let n = 1; n < 25; n++) {
      expect(light[n], `light[${n}]`).toContain('rgba(15, 23, 42,')
      // 純黒は使わない（くすんで見えるため）
      expect(light[n], `light[${n}]`).not.toContain('rgba(0, 0, 0,')
    }
  })

  it('ダークは暗い背景に沈むよう純黒を影色に使う', () => {
    for (let n = 1; n < 25; n++) {
      expect(dark[n], `dark[${n}]`).toContain('rgba(0, 0, 0,')
    }
  })
})

describe('ダークモードのリムライト', () => {
  it('ダークにのみ上端 inset ハイライトが入る', () => {
    for (let n = 1; n < 25; n++) {
      expect(dark[n], `dark[${n}]`).toContain(
        'inset 0 1px 0 0 rgba(255, 255, 255,'
      )
      expect(light[n], `light[${n}]`).not.toContain('inset')
    }
  })

  it('リムライトは 10% で頭打ちになる（縁が線に見えるのを防ぐ）', () => {
    const rimAlpha = (shadow: string) => rimLayerOf(shadow)?.alpha ?? 0
    for (let n = 1; n < 25; n++) {
      expect(rimAlpha(dark[n]), `dark[${n}]`).toBeLessThanOrEqual(0.1)
    }
    // 上位段はクランプに達している
    expect(rimAlpha(dark[24])).toBe(0.1)
    // 下位段はクランプ前で、段が上がるほど強くなる
    expect(rimAlpha(dark[1])).toBeLessThan(rimAlpha(dark[8]))
  })
})

describe('スケールの連続性', () => {
  it('不透明度は段が上がるほど単調に増える', () => {
    for (let n = 2; n < 25; n++) {
      const prev = shadowLayersOf(light[n - 1])
      const curr = shadowLayersOf(light[n])
      expect(curr[0].alpha, `near alpha at ${n}`).toBeGreaterThan(prev[0].alpha)
      expect(curr[1].alpha, `far alpha at ${n}`).toBeGreaterThan(prev[1].alpha)
    }
  })

  it('ぼかし半径とオフセットは段が上がるほど単調に増える', () => {
    for (let n = 2; n < 25; n++) {
      const prev = shadowLayersOf(light[n - 1])[1]
      const curr = shadowLayersOf(light[n])[1]
      expect(curr.blur, `far blur at ${n}`).toBeGreaterThan(prev.blur)
      expect(curr.y, `far offset at ${n}`).toBeGreaterThan(prev.y)
    }
  })

  it('遠方影のぼかし半径はオフセットの 2.5 倍（物理的な半影の広がり）', () => {
    // 整数への丸めがあるため 2.4〜2.7 に散る
    for (let n = 4; n < 25; n++) {
      const far = shadowLayersOf(light[n])[1]
      const ratio = far.blur / far.y
      expect(ratio, `far blur/offset at ${n}`).toBeGreaterThanOrEqual(2.4)
      expect(ratio, `far blur/offset at ${n}`).toBeLessThanOrEqual(2.7)
    }
  })

  it('不透明度が黒く潰れる域まで上がらない', () => {
    // 最上段でもライトは 16% 未満、ダークは 40% 未満に収める
    const lightMax = Math.max(...shadowLayersOf(light[24]).map((l) => l.alpha))
    const darkMax = Math.max(...shadowLayersOf(dark[24]).map((l) => l.alpha))
    expect(lightMax).toBeLessThan(0.16)
    expect(darkMax).toBeLessThan(0.4)
  })

  it('ダークはライトより濃い影を持つ（暗い背景で沈まないため）', () => {
    for (let n = 1; n < 25; n++) {
      const l = Math.max(...shadowLayersOf(light[n]).map((x) => x.alpha))
      const d = Math.max(...shadowLayersOf(dark[n]).map((x) => x.alpha))
      expect(d, `dark[${n}] vs light[${n}]`).toBeGreaterThan(l)
    }
  })

  it('遠方影は負のスプレッドで裾を絞る', () => {
    for (let n = 2; n < 25; n++) {
      const far = shadowLayersOf(light[n])[1]
      expect(far.spread, `far spread at ${n}`).toBeLessThan(0)
    }
  })
})

describe('セマンティック段 (elevation)', () => {
  it('全ての段が 0-24 の範囲に収まる', () => {
    for (const [name, level] of Object.entries(elevation)) {
      expect(level, name).toBeGreaterThanOrEqual(0)
      expect(level, name).toBeLessThanOrEqual(24)
    }
  })

  it('resting から modal に向かって単調に深くなる', () => {
    const order = [
      elevation.resting,
      elevation.raised,
      elevation.floating,
      elevation.overlay,
      elevation.popover,
      elevation.modal,
    ]
    for (let i = 1; i < order.length; i++) {
      expect(order[i]).toBeGreaterThan(order[i - 1])
    }
  })

  it('resting は影を持たない', () => {
    expect(light[elevation.resting]).toBe('none')
    expect(dark[elevation.resting]).toBe('none')
  })

  it('hover 時の floating は通常時の raised より深い', () => {
    const raised = shadowLayersOf(light[elevation.raised])[1]
    const floating = shadowLayersOf(light[elevation.floating])[1]
    expect(floating.blur).toBeGreaterThan(raised.blur)
    expect(floating.alpha).toBeGreaterThan(raised.alpha)
  })
})
