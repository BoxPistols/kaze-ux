/**
 * Kaze モーション体系
 *
 * ## 設計方針
 *
 * ### 1. 風の動きを基調にする
 * 「墨で書かれ、風で運ばれる」— 風は立ち上がりが鋭く、収まりが長い。
 * 出現の基調 `enter` は kazeTokens.motion.ease.kaze をそのまま継承し、
 * 急に立ち上がって長く静かに収まる曲線にする。
 *
 * ### 2. 退出は出現より速い
 * 去るものを待たされるのは不快であり、意匠としても品がない。
 * 出現は減速（`enter`）、退出は加速（`exit`）で、かつ退出の
 * デュレーションは出現の 0.75 倍に置く。
 *
 * ### 3. 時間は距離と面積に比例する
 * 小さな要素の色変化と、画面を覆うドロワーの滑走が同じ時間で動くと、
 * 前者は緩慢に、後者は乱暴に見える。動く量に応じた 6 段を用意する。
 *
 * ### 4. ブラウザ既定の `ease` を使わない
 * `ease` = cubic-bezier(0.25, 0.1, 0.25, 1) は 1996 年の CSS1 由来で、
 * 立ち上がりが鈍く終わりが締まらない。意匠としては使わない。
 */

// MUI 標準キーに加え、意味が明示的な Kaze 語彙を型に載せる。
// 拡張は re-export 元の '@mui/material/styles' に対して行う
// （'@mui/material/styles/createTransitions' は package exports が
//   ./*/index.d.ts にマップされるため moduleResolution: bundler で解決できない）
declare module '@mui/material/styles' {
  interface Easing {
    enter: string
    exit: string
    standard: string
    emphasized: string
  }

  interface Duration {
    instant: number
    micro: number
    macro: number
    long: number
    scene: number
  }
}

/**
 * イージング
 *
 * UI の動きは「現れる / 去る / 動く / 際立つ」の 4 種にほぼ収まる。
 * 迷ったら standard を使う。
 */
export const kazeEasing = {
  /**
   * 出現（減速）。急に立ち上がり、長く静かに収まる。
   * kazeTokens.motion.ease.kaze を継承した Kaze の基調曲線。
   */
  enter: 'cubic-bezier(0.33, 0, 0, 1)',
  /**
   * 退出（加速）。静かに始まり、加速しながら去る。
   * 去るものは注意を引かないため、最後まで減速させない。
   */
  exit: 'cubic-bezier(0.6, 0, 1, 1)',
  /** 移動。両端がなめらか。画面内を動く要素に使う */
  standard: 'cubic-bezier(0.45, 0, 0.15, 1)',
  /**
   * 強調。わずかに行き過ぎて戻る。
   * 成功・追加など祝祭的な瞬間にだけ使い、常用しない。
   */
  emphasized: 'cubic-bezier(0.34, 1.35, 0.64, 1)',
  /** 即応。加速と減速が均等で、キビキビとした印象 */
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const

/**
 * デュレーション (ms)
 *
 * 動く距離と面積に比例させる。micro / macro / scene は
 * kazeTokens.motion.duration と同値を保つ。
 */
export const kazeDuration = {
  /** 色・不透明度だけの変化。hover の背景色など、位置が動かないもの */
  instant: 80,
  /** 小さな要素の状態変化。ボタン・チップ・アイコン */
  micro: 120,
  /** 中くらいの要素。カードの hover・ツールチップ */
  short: 180,
  /** 面の出現。メニュー・ポップオーバー・アコーディオン */
  macro: 240,
  /** 大きな面。ドロワー・モーダル */
  long: 320,
  /** 画面遷移。ページ切替・シーンの転換 */
  scene: 480,
} as const

/**
 * MUI の `theme.transitions` に渡す設定。
 *
 * MUI 標準のキーを Kaze の値で埋める。MUI 内部は出現に `easeOut`、
 * 退出に `easeIn` を使うため、それぞれ enter / exit を割り当てると
 * 標準コンポーネントの動きも Kaze の基調に揃う。
 *
 * 標準キーは MUI 内部向けで意味が読み取りにくいため、意味が明示的な
 * Kaze 語彙も併せて載せる。`sx` からはそちらを参照する。
 */
export const kazeTransitions = {
  easing: {
    // MUI 標準キー（MUI 内部のトランジションが参照する）
    easeOut: kazeEasing.enter,
    easeIn: kazeEasing.exit,
    easeInOut: kazeEasing.standard,
    sharp: kazeEasing.sharp,
    // Kaze 語彙（意味が明示的。アプリ側はこちらを使う）
    enter: kazeEasing.enter,
    exit: kazeEasing.exit,
    standard: kazeEasing.standard,
    emphasized: kazeEasing.emphasized,
  },
  duration: {
    // MUI 標準キー
    shortest: kazeDuration.micro,
    shorter: kazeDuration.short,
    short: kazeDuration.macro,
    standard: kazeDuration.macro,
    complex: kazeDuration.long,
    // 出現はゆっくり、退出は速く（0.75 倍）
    enteringScreen: kazeDuration.macro,
    leavingScreen: kazeDuration.short,
    // Kaze 語彙
    instant: kazeDuration.instant,
    micro: kazeDuration.micro,
    macro: kazeDuration.macro,
    long: kazeDuration.long,
    scene: kazeDuration.scene,
  },
} as const

/**
 * よく使う transition の組み立て。
 *
 * `transition: 'all ...'` は意図しないプロパティまで動かし、
 * レイアウトの再計算も誘発するため使わない。動かす対象を必ず明示する。
 *
 * @example
 * sx={{ transition: motionOf(['box-shadow', 'border-color'], 'short') }}
 */
export const motionOf = (
  properties: readonly string[],
  duration: keyof typeof kazeDuration = 'micro',
  easing: keyof typeof kazeEasing = 'standard'
) =>
  properties
    .map((p) => `${p} ${kazeDuration[duration]}ms ${kazeEasing[easing]}`)
    .join(', ')

/**
 * 動きを減らす設定への対応。
 *
 * `prefers-reduced-motion: reduce` は前庭障害などで動きが体調不良に
 * つながる利用者の明示的な要求であり、意匠より優先する。
 * 完全に 0 にせず 0.01ms を残すのは、transitionend / animationend に
 * 依存した実装が発火しなくなるのを避けるため。
 */
export const reducedMotionOverrides = {
  '@media (prefers-reduced-motion: reduce)': {
    '*, *::before, *::after': {
      animationDuration: '0.01ms !important',
      animationIterationCount: '1 !important',
      transitionDuration: '0.01ms !important',
      scrollBehavior: 'auto !important',
    },
  },
}

export type KazeEasing = keyof typeof kazeEasing
export type KazeDuration = keyof typeof kazeDuration
