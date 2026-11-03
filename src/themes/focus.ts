/**
 * フォーカスリング
 *
 * キーボードだけで操作する人にとって、フォーカスの所在は画面のどこを
 * 触っているかを知る唯一の手がかりになる。意匠を理由に消すことはできない。
 *
 * ブラウザ既定の outline は OS とブラウザで形も色も変わるため、
 * 「見えてはいるが、このデザインシステムの一部には見えない」状態になる。
 * 形をこちらで固定し、色はテーマから測って決める。
 *
 * 満たす基準:
 * - WCAG 2.4.7 Focus Visible — フォーカス位置が視認できる
 * - WCAG 2.4.11 Focus Appearance — 隣接する色に対して 3:1 以上、
 *   かつ 2px 相当以上の太さ
 *
 * `:focus` ではなく `:focus-visible` を使う。マウスでボタンを押した
 * ときにリングが出るのは、必要としない人にとってはノイズでしかない。
 */
import { CONTRAST_THRESHOLD, contrastRatio, ensureContrast } from './contrast'

/** リングの太さ (px)。WCAG 2.4.11 が求める最小に合わせる */
export const FOCUS_RING_WIDTH = 2

/**
 * リングと要素の間隔 (px)。
 *
 * 0 にすると、塗り面のボタンでリングが縁に溶けて境界が分からなくなる。
 * 間隔を空けると背景色が細い帯として挟まり、どんな面の上でも分離する。
 */
export const FOCUS_RING_OFFSET = 2

/**
 * リングの色を決める。
 *
 * ブランド色をそのまま使うと、primary の塗り面（ボタン）に同じ色の
 * リングが乗って消える。面と地の両方に対して基準を満たす明度まで
 * 色相を保ったまま動かす。
 */
export const focusRingColor = (
  brand: string,
  background: { default: string; paper: string }
): string => {
  const meets = (color: string) =>
    contrastRatio(color, background.paper) >= CONTRAST_THRESHOLD.ui &&
    contrastRatio(color, background.default) >= CONTRAST_THRESHOLD.ui

  // ensureContrast を paper → default と続けて当てると、後段の調整で
  // 前段の条件が崩れうる。両面を同時に満たすまで、厳しい側へ寄せ直す
  let color = brand
  for (let i = 0; i < 8 && !meets(color); i++) {
    const harder =
      contrastRatio(color, background.paper) <
      contrastRatio(color, background.default)
        ? background.paper
        : background.default
    const next = ensureContrast(color, harder, CONTRAST_THRESHOLD.ui)
    if (next === color) break // これ以上動かせない（明度が振り切っている）
    color = next
  }
  return color
}

/** リング 1 個分のスタイル */
export const focusRing = (color: string) => ({
  outline: `${FOCUS_RING_WIDTH}px solid ${color}`,
  outlineOffset: `${FOCUS_RING_OFFSET}px`,
})

/**
 * 全要素に適用する `:focus-visible` の上書き。
 *
 * MuiCssBaseline の styleOverrides に展開する。個々のコンポーネントで
 * 定義すると必ず抜けが出るため、既定を 1 箇所で与えて、外したい箇所だけが
 * 明示的に上書きする形にする。
 */
export const createFocusVisibleOverrides = (ringColor: string) => ({
  ':focus-visible': focusRing(ringColor),
  // MUI は一部の部品でフォーカスを class として持つ（ButtonBase 等）。
  // 素の :focus-visible が効かない経路にも同じ見た目を届ける
  '.Mui-focusVisible': focusRing(ringColor),
  // ブラウザ既定の二重描画を防ぐ
  ':focus:not(:focus-visible)': { outline: 'none' },
})

/** 測定用: リングが背景に対して UI 基準 (3:1) を満たすか */
export const focusRingMeetsContrast = (
  ringColor: string,
  background: string
): boolean => contrastRatio(ringColor, background) >= CONTRAST_THRESHOLD.ui
