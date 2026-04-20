/**
 * Kaze 骨格スタイル mixin 集
 *
 * 各コンポーネントの kaze opt-in 実装で import してスプレッドで使う。
 * 同じ style object を 3 回以上書く前にここに集約する。
 *
 * CSS 変数は src/index.css の :root / .dark で定義済み (PR #39)。
 * 値の TS ミラーは src/themes/kazeTokens.ts (PR #38)。
 */

import type { CSSProperties } from 'react'

// ============================================================
// radius + transition セット — UI 階層別
// ============================================================

/** button / input / chip / tab 用: sharp radius + micro duration */
export const KAZE_SHARP_UI: CSSProperties = {
  borderRadius: 'var(--kaze-r-sharp)',
  transitionProperty: 'background-color, color, border-color, transform',
  transitionDuration: 'var(--kaze-dur-micro)',
  transitionTimingFunction: 'var(--kaze-ease)',
}

/** card / panel / popover 用: soft radius + macro duration */
export const KAZE_SOFT_CARD: CSSProperties = {
  borderRadius: 'var(--kaze-r-soft)',
  transitionProperty: 'border-color, box-shadow, transform',
  transitionDuration: 'var(--kaze-dur-macro)',
  transitionTimingFunction: 'var(--kaze-ease)',
}

/** modal / hero / section 用: generous radius + scene duration */
export const KAZE_GEN_SURFACE: CSSProperties = {
  borderRadius: 'var(--kaze-r-gen)',
  transitionProperty: 'transform, opacity',
  transitionDuration: 'var(--kaze-dur-scene)',
  transitionTimingFunction: 'var(--kaze-ease)',
}

// ============================================================
// typography セット — role 別
// ============================================================

/** CTA ラベル・eyebrow ラベル等: Plex Mono + uppercase + wide tracking */
export const KAZE_MONO_LABEL: CSSProperties = {
  fontFamily: 'var(--kaze-font-mono)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

/** eyebrow 専用: Mono + さらに広い tracking + 小さいサイズ想定 */
export const KAZE_EYEBROW: CSSProperties = {
  fontFamily: 'var(--kaze-font-mono)',
  fontSize: '0.75rem',
  fontWeight: 500,
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
}

/** display 見出し: Fraunces Variable + 基調 axis */
export const KAZE_DISPLAY: CSSProperties = {
  fontFamily: 'var(--kaze-font-display)',
  fontWeight: 380,
  letterSpacing: '-0.02em',
  fontVariationSettings: "'opsz' 144, 'wght' 380, 'SOFT' 30, 'WONK' 0",
}

/** display 強調 (italic + WONK): "Infinite" のような accent word 用 */
export const KAZE_DISPLAY_EMPHASIS: CSSProperties = {
  fontFamily: 'var(--kaze-font-display)',
  fontStyle: 'italic',
  fontWeight: 420,
  letterSpacing: '-0.02em',
  fontVariationSettings: "'opsz' 144, 'wght' 420, 'SOFT' 70, 'WONK' 1",
}

/** body text: Plex Sans + 日本語の呼吸 */
export const KAZE_BODY: CSSProperties = {
  fontFamily: 'var(--kaze-font-body)',
  letterSpacing: '0.02em',
  lineHeight: 1.7,
}
