/**
 * Kaze エレベーション（影）システム
 *
 * ## 設計方針
 *
 * ### 1. 影に色相を与える
 * 純黒 `rgba(0,0,0,α)` の影は彩度がゼロで、色面の上に落ちるとくすんで
 * 「汚れ」に見える。実世界の影は環境光（空の青）を拾って寒色に転ぶため、
 * ライトモードの影色は背景 (#f8fafc / slate 系) と同じ寒色ニュートラル
 * である slate-900 (#0f172a) を基準にする。
 *
 * ### 2. ライトとダークで戦略を変える
 * 暗い背景に暗い影を落としても見えない。ダークモードでは影を「落とす」
 * のではなく、面の上端が光を拾う **リムライト** (inset ハイライト) で
 * 浮きを表現する。影は奥行きの補助として濃度を上げて併用する。
 *
 * ### 3. 25 段を単一の曲線から生成する
 * 手打ちの配列は途中で設計思想が変わり、段の連続性が壊れる。
 * オフセット・ブラー・不透明度を段数 n の関数として導出し、
 * どの段を選んでも同じ物理の上に乗るようにする。
 *
 * ### 4. 二層構造（近接影 + 遠方影）
 * 単層の影は「板が浮いている」だけに見える。接地点を締める近接影と、
 * 距離を示す遠方影を重ねることで、面が空間に存在して見える。
 */

import type { Theme } from '@mui/material/styles'

/** MUI の elevation は 0-24 の 25 段 */
const ELEVATION_STEPS = 25

/** ライトモードの影色（slate-900）。背景の寒色ニュートラルと色相を揃える */
const LIGHT_SHADOW_RGB = '15, 23, 42'

/** ダークモードの影色。暗い背景で沈むよう純黒を使う */
const DARK_SHADOW_RGB = '0, 0, 0'

/** 小数第 3 位までに丸める（CSS 出力を安定させる） */
const round3 = (n: number) => Number(n.toFixed(3))

/**
 * 段 n の幾何（オフセット・ブラー・スプレッド）
 *
 * 近接影は要素の直下を締め、遠方影は負のスプレッドで裾を絞る。
 * 遠方影のブラーはオフセットの 2.5 倍 — 物理的な半影の広がりに合わせている
 * （整数への丸めがあるため実測比は 2.4〜2.7 に散る）。
 */
const geometryFor = (n: number) => ({
  nearY: Math.ceil(n / 2),
  nearBlur: Math.max(n, 1),
  farY: n,
  farBlur: Math.round(n * 2.5),
  farSpread: -Math.round(n * 0.5),
})

/**
 * 段 n の不透明度
 *
 * 高く浮くほど影は「薄く広く」なるのが物理だが、UI では階層の識別性が
 * 要るため、ごく緩やかに濃くする（1 段あたり 0.2-0.4%）。
 * 急峻に濃くすると上位の段が黒く潰れる。
 */
const opacityFor = (n: number, scale: number) => ({
  near: round3((0.04 + n * 0.002) * scale),
  far: round3((0.06 + n * 0.004) * scale),
})

/**
 * ダークモードのリムライト強度
 *
 * 面の上端が光を拾う表現。段が上がるほど強くなるが、10% で頭打ちにする。
 * それ以上は縁が白く浮いて、面ではなく「線」に見えてしまう。
 */
const rimAlphaFor = (n: number) => round3(Math.min(0.02 + n * 0.006, 0.1))

/** 1 段分の box-shadow 文字列を生成する */
const shadowAt = (n: number, mode: 'light' | 'dark'): string => {
  if (n === 0) return 'none'

  const isDark = mode === 'dark'
  const rgb = isDark ? DARK_SHADOW_RGB : LIGHT_SHADOW_RGB
  // ダークは背景に沈まないよう濃度を上げる。
  // 倍率 2.4 は最上段 (24) でも 40% を超えない上限として選んでいる —
  // それ以上は面の下が黒く潰れて、影ではなく「穴」に見える
  const alpha = opacityFor(n, isDark ? 2.4 : 1)
  const g = geometryFor(n)

  const near = `0 ${g.nearY}px ${g.nearBlur}px 0 rgba(${rgb}, ${alpha.near})`
  const far = `0 ${g.farY}px ${g.farBlur}px ${g.farSpread}px rgba(${rgb}, ${alpha.far})`

  if (!isDark) return `${near}, ${far}`

  // ダークは上端のリムライトで「浮き」を表現する
  const rim = `inset 0 1px 0 0 rgba(255, 255, 255, ${rimAlphaFor(n)})`
  return `${near}, ${far}, ${rim}`
}

/**
 * MUI の `theme.shadows` に渡す 25 段の配列を生成する。
 *
 * @param mode ライト / ダーク。ダークはリムライトを含む
 */
export const createShadows = (mode: 'light' | 'dark'): Theme['shadows'] =>
  Array.from({ length: ELEVATION_STEPS }, (_, n) =>
    shadowAt(n, mode)
  ) as unknown as Theme['shadows']

/**
 * セマンティックなエレベーション段
 *
 * 数値の elevation を直接書くと「なぜ 4 なのか」が失われる。
 * UI の役割で段を選べるようにし、`boxShadow` の直書きを置き換える。
 *
 * @example
 * <Paper elevation={elevation.overlay}>
 * // sx 内なら theme.shadows[elevation.overlay]
 */
export const elevation = {
  /** 接地。影を持たず、境界線と背景色差で分離する（表・リスト行・入れ子カード） */
  resting: 0,
  /** 微浮上。面がひとつ手前にあることだけを示す（カード・パネル） */
  raised: 1,
  /** 浮上。操作に応じて持ち上がった状態（hover 中のカード・選択中の行） */
  floating: 3,
  /** 重ね。下のコンテンツを覆う一時的な面（ドロップダウン・ポップオーバー） */
  overlay: 6,
  /** 前面。強い一時面（メニュー・ツールチップ・通知） */
  popover: 12,
  /** 最前面。背景を遮断する面（ダイアログ・ドロワー） */
  modal: 20,
} as const

export type ElevationLevel = (typeof elevation)[keyof typeof elevation]

/**
 * colorSchemes 版テーマ（CssVarsProvider）向けのダーク影上書き。
 *
 * MUI の `theme.shadows` はテーマ単体で 1 セットしか持てず、
 * colorSchemes にスキーム別の shadows を載せる口がない。そのため
 * lightTheme / darkTheme を切り替えるアプリと違い、CssVarsProvider を
 * 使う画面ではダークでもライトの影が当たってしまう —
 * 暗い背景に薄い寒色影が落ちて、エレベーションが消える。
 *
 * ここではスキーム属性の下で主要コンポーネントの影だけを差し替える。
 * MUI が内部生成する CSS 変数名に依存しないため、MUI の実装が変わっても壊れない。
 */
export const createDarkSchemeElevationOverrides = () => {
  const dark = createShadows('dark')

  return {
    '[data-mui-color-scheme="dark"], .dark': {
      '& .MuiCard-root': { boxShadow: dark[elevation.raised] },
      '& .MuiCard-root:hover': { boxShadow: dark[elevation.floating] },
      '& .MuiMenu-paper': { boxShadow: dark[elevation.overlay] },
      '& .MuiPopover-paper': { boxShadow: dark[elevation.overlay] },
      '& .MuiTooltip-tooltip': { boxShadow: dark[elevation.popover] },
      '& .MuiDialog-paper': { boxShadow: dark[elevation.modal] },
      '& .MuiDrawer-paper': { boxShadow: dark[elevation.modal] },
    },
  }
}
