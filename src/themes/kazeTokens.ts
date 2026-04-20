/**
 * Kaze 骨格トークン (v0)
 *
 * 「墨で書かれ、風で運ばれる」世界観を 4 軸で固定する single source of truth。
 * 既存 MUI テーマ（primary/secondary/...）には触れず、additive に共存する。
 * 新規コンポーネント・refresh 済み画面はこれを参照する。
 *
 * 参照: src/stories/01-DesignPhilosophy/KazeSkeleton.stories.tsx
 */

export const kazeTokens = {
  color: {
    kazeTeal: '#0EADB8',
    sumi: '#0A0A0A',
    washi: '#F7F4EE',
    asagi: '#5B8FB9',
    beni: '#E34E3A',
  },
  ink: {
    primary: 'rgba(10, 10, 10, 0.88)',
    muted: 'rgba(10, 10, 10, 0.54)',
    hair: 'rgba(10, 10, 10, 0.12)',
    mist: 'rgba(10, 10, 10, 0.04)',
  },
  radius: {
    sharp: 2,
    soft: 8,
    gen: 24,
    full: 9999,
  },
  motion: {
    ease: {
      kaze: 'cubic-bezier(0.33, 0, 0, 1)',
    },
    duration: {
      micro: 120,
      macro: 240,
      scene: 480,
    },
  },
  font: {
    display:
      "'Fraunces', 'Shippori Mincho B1', 'Noto Serif JP', Georgia, serif",
    body: "'IBM Plex Sans', 'IBM Plex Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif",
    mono: "'IBM Plex Mono', 'SFMono-Regular', Menlo, monospace",
  },
  fontAxis: {
    displayDefault: "'opsz' 144, 'wght' 380, 'SOFT' 30, 'WONK' 0",
    displayEmphasis: "'opsz' 144, 'wght' 420, 'SOFT' 70, 'WONK' 1",
  },
} as const

export type KazeTokens = typeof kazeTokens

/**
 * Google Fonts URL。Storybook preview-head / LP <head> / アプリ _document で
 * 同一ソースを使う。
 */
export const KAZE_GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2' +
  '?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..900,0..100,0..1' +
  '&family=IBM+Plex+Sans:wght@300;400;500;600;700' +
  '&family=IBM+Plex+Sans+JP:wght@300;400;500;600;700' +
  '&family=IBM+Plex+Mono:wght@400;500;600' +
  '&display=swap'

/**
 * CSS カスタムプロパティとして注入するための key-value マップ。
 * :root や scope element に展開して使う。
 */
export const kazeCssVars: Record<string, string> = {
  '--kaze-teal': kazeTokens.color.kazeTeal,
  '--kaze-sumi': kazeTokens.color.sumi,
  '--kaze-washi': kazeTokens.color.washi,
  '--kaze-asagi': kazeTokens.color.asagi,
  '--kaze-beni': kazeTokens.color.beni,
  '--kaze-ink': kazeTokens.ink.primary,
  '--kaze-ink-muted': kazeTokens.ink.muted,
  '--kaze-ink-hair': kazeTokens.ink.hair,
  '--kaze-ink-mist': kazeTokens.ink.mist,
  '--kaze-r-sharp': `${kazeTokens.radius.sharp}px`,
  '--kaze-r-soft': `${kazeTokens.radius.soft}px`,
  '--kaze-r-gen': `${kazeTokens.radius.gen}px`,
  '--kaze-r-full': `${kazeTokens.radius.full}px`,
  '--kaze-ease': kazeTokens.motion.ease.kaze,
  '--kaze-dur-micro': `${kazeTokens.motion.duration.micro}ms`,
  '--kaze-dur-macro': `${kazeTokens.motion.duration.macro}ms`,
  '--kaze-dur-scene': `${kazeTokens.motion.duration.scene}ms`,
  '--kaze-font-display': kazeTokens.font.display,
  '--kaze-font-body': kazeTokens.font.body,
  '--kaze-font-mono': kazeTokens.font.mono,
}
