/**
 * Kaze 骨格スタイル mixin 集
 *
 * ドメイン語彙で命名する。UI 階層の「何に使うか」を機械分類
 * (SHARP_UI / SOFT_CARD) で呼ぶのではなく、編集デザインの
 * メタファーで呼ぶ。Matlens aeros-design-system 並走の助言 2026-04-20。
 *
 * 対応表:
 *   STAMP  (印・判)     → button / chip / input / tab / icon-button
 *   LEAF   (一葉)       → card / panel / popover
 *   SPREAD (見開き)      → modal / hero / section
 *   PRINT  (活字)       → display 見出し
 *   ACCENT (強調)       → 強調語 (italic + WONK)
 *   META   (メタ表示)    → CTA ラベル・小さな mono 表記
 *   EYEBROW(袖見出し)    → section 上の小ラベル (editorial 標準語)
 *   RUN    (本文)       → 通常本文
 *
 * CSS 変数は src/index.css の :root / .dark で定義 (PR #39)。
 * 値の TS ミラーは src/themes/kazeTokens.ts (PR #38)。
 */

import type { CSSProperties } from 'react'

// ============================================================
// 接地 (radius + transition) — 何に「押される」か
// ============================================================

/** 印 (STAMP): 押印のように鋭い面 — button / chip / input / tab */
export const KAZE_STAMP: CSSProperties = {
  borderRadius: 'var(--kaze-r-sharp)',
  transitionProperty: 'background-color, color, border-color, transform',
  transitionDuration: 'var(--kaze-dur-micro)',
  transitionTimingFunction: 'var(--kaze-ease)',
}

/** 一葉 (LEAF): 一枚の和紙のような柔らかい面 — card / panel / popover */
export const KAZE_LEAF: CSSProperties = {
  borderRadius: 'var(--kaze-r-soft)',
  transitionProperty: 'border-color, box-shadow, transform',
  transitionDuration: 'var(--kaze-dur-macro)',
  transitionTimingFunction: 'var(--kaze-ease)',
}

/** 見開き (SPREAD): 誌面の見開きのような大きな面 — modal / hero / section */
export const KAZE_SPREAD: CSSProperties = {
  borderRadius: 'var(--kaze-r-gen)',
  transitionProperty: 'transform, opacity',
  transitionDuration: 'var(--kaze-dur-scene)',
  transitionTimingFunction: 'var(--kaze-ease)',
}

// ============================================================
// 文字 (typography) — 何として「読まれる」か
// ============================================================

/** メタ (META): 版の奥付のような mono 小文字 — CTA ラベル / caption */
export const KAZE_META: CSSProperties = {
  fontFamily: 'var(--kaze-font-mono)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

/** 袖見出し (EYEBROW): editorial 標準語、section 頭の小ラベル */
export const KAZE_EYEBROW: CSSProperties = {
  fontFamily: 'var(--kaze-font-mono)',
  fontSize: '0.75rem',
  fontWeight: 500,
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
}

/** 活字 (PRINT): Fraunces Variable の基調。display 見出し */
export const KAZE_PRINT: CSSProperties = {
  fontFamily: 'var(--kaze-font-display)',
  fontWeight: 380,
  letterSpacing: '-0.02em',
  fontVariationSettings: "'opsz' 144, 'wght' 380, 'SOFT' 30, 'WONK' 0",
}

/** 強調 (ACCENT): italic + WONK で「書き込み」の質感。"Infinite" 型 */
export const KAZE_ACCENT: CSSProperties = {
  fontFamily: 'var(--kaze-font-display)',
  fontStyle: 'italic',
  fontWeight: 420,
  letterSpacing: '-0.02em',
  fontVariationSettings: "'opsz' 144, 'wght' 420, 'SOFT' 70, 'WONK' 1",
}

/** 本文 (RUN): Plex Sans + 日本語の呼吸。通常本文 */
export const KAZE_RUN: CSSProperties = {
  fontFamily: 'var(--kaze-font-body)',
  letterSpacing: '0.02em',
  lineHeight: 1.7,
}
