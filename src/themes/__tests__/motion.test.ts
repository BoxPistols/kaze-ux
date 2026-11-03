import { describe, expect, it } from 'vitest'

import {
  kazeDuration,
  kazeEasing,
  kazeTransitions,
  motionOf,
  reducedMotionOverrides,
} from '../motion'

/** cubic-bezier(x1, y1, x2, y2) の 4 制御点を取り出す */
const controlPoints = (value: string): [number, number, number, number] => {
  const m = value.match(/^cubic-bezier\(([^)]+)\)$/)
  if (!m) throw new Error(`cubic-bezier ではない: ${value}`)
  const parts = m[1].split(',').map((s) => Number.parseFloat(s.trim()))
  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    throw new Error(`制御点が 4 つではない: ${value}`)
  }
  return [parts[0], parts[1], parts[2], parts[3]]
}

/** p0=0, p3=1 を前提とした 3 次ベジェの座標 */
const bezier = (t: number, c1: number, c2: number) => {
  const u = 1 - t
  return 3 * u * u * t * c1 + 3 * u * t * t * c2 + t * t * t
}

/**
 * 時刻 x に対応する媒介変数 t を二分法で求める。
 * イージングの実挙動は t ではなく x→y の写像であり、
 * 制御点の y が同じでも x が違えば曲線は別物になるため、
 * 曲線どうしの比較は必ず同じ x で行う。
 */
const solveT = (value: string, targetX: number) => {
  const [x1, , x2] = controlPoints(value)
  let lo = 0
  let hi = 1
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (bezier(mid, x1, x2) < targetX) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/** 時刻 x（0-1）における進捗 y */
const progressAt = (value: string, x: number) => {
  const [, y1, , y2] = controlPoints(value)
  return bezier(solveT(value, x), y1, y2)
}

const EASING_NAMES = [
  'enter',
  'exit',
  'standard',
  'emphasized',
  'sharp',
] as const

describe('イージングの形式', () => {
  it('全て正しい cubic-bezier 記法である', () => {
    for (const name of EASING_NAMES) {
      expect(() => controlPoints(kazeEasing[name]), name).not.toThrow()
    }
  })

  it('制御点の x は 0-1 に収まる（時間軸は行き来しない）', () => {
    for (const name of EASING_NAMES) {
      const [x1, , x2] = controlPoints(kazeEasing[name])
      expect(x1, `${name} x1`).toBeGreaterThanOrEqual(0)
      expect(x1, `${name} x1`).toBeLessThanOrEqual(1)
      expect(x2, `${name} x2`).toBeGreaterThanOrEqual(0)
      expect(x2, `${name} x2`).toBeLessThanOrEqual(1)
    }
  })

  it('ブラウザ既定の ease / linear を採用していない', () => {
    const banned = ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear']
    for (const name of EASING_NAMES) {
      expect(banned, name).not.toContain(kazeEasing[name])
    }
    // CSS1 由来の ease と同値でもいけない
    for (const name of EASING_NAMES) {
      expect(kazeEasing[name], name).not.toBe(
        'cubic-bezier(0.25, 0.1, 0.25, 1)'
      )
    }
  })
})

describe('イージングの運動特性', () => {
  it('enter は減速する（早い段階で進み、終盤は静かに収まる）', () => {
    for (const x of [0.25, 0.5, 0.75]) {
      expect(progressAt(kazeEasing.enter, x), `x=${x}`).toBeGreaterThan(x)
    }
  })

  it('exit は加速する（序盤は動かず、終盤で一気に去る）', () => {
    for (const x of [0.25, 0.5, 0.75]) {
      expect(progressAt(kazeEasing.exit, x), `x=${x}`).toBeLessThan(x)
    }
  })

  it('emphasized は行き過ぎて戻る（オーバーシュート）', () => {
    const overshoots = [0.5, 0.6, 0.7, 0.8].some(
      (x) => progressAt(kazeEasing.emphasized, x) > 1
    )
    expect(overshoots).toBe(true)
  })

  it('emphasized 以外は 1 を超えない', () => {
    for (const name of ['enter', 'exit', 'standard', 'sharp'] as const) {
      for (let i = 1; i < 20; i++) {
        const x = i / 20
        expect(
          progressAt(kazeEasing[name], x),
          `${name} at x=${x}`
        ).toBeLessThanOrEqual(1)
      }
    }
  })

  it('enter は standard より強く減速する（風の収まりの長さ）', () => {
    // 同じ時刻でどれだけ先へ進んでいるかで比較する
    for (const x of [0.3, 0.5, 0.7]) {
      expect(progressAt(kazeEasing.enter, x), `x=${x}`).toBeGreaterThan(
        progressAt(kazeEasing.standard, x)
      )
    }
  })

  it('sharp は加速と減速が均等（対角線からの偏りが小さい）', () => {
    expect(progressAt(kazeEasing.sharp, 0.5)).toBeCloseTo(0.5, 1)
  })

  it('全てのイージングが 0 から始まり 1 で終わる', () => {
    for (const name of EASING_NAMES) {
      expect(progressAt(kazeEasing[name], 0), `${name} 始点`).toBeCloseTo(0, 5)
      expect(progressAt(kazeEasing[name], 1), `${name} 終点`).toBeCloseTo(1, 5)
    }
  })
})

describe('デュレーション', () => {
  const ORDER = ['instant', 'micro', 'short', 'macro', 'long', 'scene'] as const

  it('段が上がるほど長くなる', () => {
    for (let i = 1; i < ORDER.length; i++) {
      expect(
        kazeDuration[ORDER[i]],
        `${ORDER[i]} > ${ORDER[i - 1]}`
      ).toBeGreaterThan(kazeDuration[ORDER[i - 1]])
    }
  })

  it('kazeTokens の micro / macro / scene と同値を保つ', () => {
    expect(kazeDuration.micro).toBe(120)
    expect(kazeDuration.macro).toBe(240)
    expect(kazeDuration.scene).toBe(480)
  })

  it('体感できる下限 (80ms) を下回らない', () => {
    for (const name of ORDER) {
      expect(kazeDuration[name], name).toBeGreaterThanOrEqual(80)
    }
  })

  it('待たされる上限 (500ms) を超えない', () => {
    for (const name of ORDER) {
      expect(kazeDuration[name], name).toBeLessThanOrEqual(500)
    }
  })
})

describe('MUI テーマへの接続', () => {
  it('MUI 標準の easing キーが全て埋まっている', () => {
    for (const key of ['easeInOut', 'easeOut', 'easeIn', 'sharp'] as const) {
      expect(kazeTransitions.easing[key], key).toMatch(/^cubic-bezier\(/)
    }
  })

  it('MUI 標準の duration キーが全て埋まっている', () => {
    for (const key of [
      'shortest',
      'shorter',
      'short',
      'standard',
      'complex',
      'enteringScreen',
      'leavingScreen',
    ] as const) {
      expect(typeof kazeTransitions.duration[key], key).toBe('number')
    }
  })

  it('MUI が出現に使う easeOut は enter、退出に使う easeIn は exit', () => {
    expect(kazeTransitions.easing.easeOut).toBe(kazeEasing.enter)
    expect(kazeTransitions.easing.easeIn).toBe(kazeEasing.exit)
  })

  it('退出は出現より速い（去るものを待たせない）', () => {
    expect(kazeTransitions.duration.leavingScreen).toBeLessThan(
      kazeTransitions.duration.enteringScreen
    )
  })

  it('Kaze 語彙も併せて載っている', () => {
    expect(kazeTransitions.easing.emphasized).toBe(kazeEasing.emphasized)
    expect(kazeTransitions.duration.scene).toBe(kazeDuration.scene)
  })
})

describe('motionOf', () => {
  it('動かすプロパティを明示した transition を組み立てる', () => {
    expect(motionOf(['opacity'], 'micro', 'enter')).toBe(
      `opacity 120ms ${kazeEasing.enter}`
    )
  })

  it('複数プロパティをカンマで連結する', () => {
    const result = motionOf(['box-shadow', 'border-color'], 'short')
    expect(result).toBe(
      `box-shadow 180ms ${kazeEasing.standard}, border-color 180ms ${kazeEasing.standard}`
    )
  })

  it('既定は micro / standard', () => {
    expect(motionOf(['color'])).toBe(`color 120ms ${kazeEasing.standard}`)
  })

  it('all を生成しない（意図しないプロパティを動かさない）', () => {
    const result = motionOf(['transform', 'opacity'], 'macro', 'enter')
    expect(result).not.toContain('all ')
  })
})

describe('動きを減らす設定への対応', () => {
  const query = '@media (prefers-reduced-motion: reduce)'

  it('全要素に対する上書きを持つ', () => {
    expect(reducedMotionOverrides).toHaveProperty(query)
    expect(reducedMotionOverrides[query]).toHaveProperty(
      '*, *::before, *::after'
    )
  })

  it('transitionend が発火するよう完全な 0 にはしない', () => {
    const rules = reducedMotionOverrides[query]['*, *::before, *::after']
    expect(rules.transitionDuration).toBe('0.01ms !important')
    expect(rules.animationDuration).toBe('0.01ms !important')
  })

  it('無限ループのアニメーションを 1 回で止める', () => {
    const rules = reducedMotionOverrides[query]['*, *::before, *::after']
    expect(rules.animationIterationCount).toBe('1 !important')
  })
})
