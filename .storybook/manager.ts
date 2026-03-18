import { create } from '@storybook/theming'
import { addons } from 'storybook/manager-api'

// SVG ロゴを data URI で埋め込み（ダークテーマ用: テキストを白に）
const logoSvg = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 28">' +
    '<rect width="28" height="28" rx="6" fill="url(#g)"/>' +
    '<defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" stop-color="#0EADB8"/>' +
    '<stop offset="100%" stop-color="#0A8A94"/>' +
    '</linearGradient></defs>' +
    '<path d="M7 9h14M7 14h10M7 19h6" stroke="white" stroke-width="2.2" stroke-linecap="round"/>' +
    '<text x="34" y="20" font-family="Inter,sans-serif" font-size="15" font-weight="700" fill="#ffffff">Kaze</text>' +
    '</svg>'
)}`

const kazeTheme = create({
  base: 'dark',

  // ブランド — クリックで TOP に戻る（本番のみ有効）
  brandTitle: 'Kaze Design',
  brandImage: logoSvg,
  brandUrl: typeof window !== 'undefined' ? window.location.origin + '/' : '/',
  brandTarget: '_self',

  // カラー
  colorPrimary: '#0EADB8',
  colorSecondary: '#0EADB8',

  // UI
  appBg: '#141e20',
  appContentBg: '#1a2729',
  appBorderColor: '#2a4044',
  appBorderRadius: 6,
  appPreviewBg: '#1a2729',

  // テキスト
  textColor: '#e2f0f1',
  textInverseColor: '#141e20',
  textMutedColor: '#7aabaf',

  // ツールバー
  barTextColor: '#9ec8cc',
  barHoverColor: '#0EADB8',
  barSelectedColor: '#0EADB8',
  barBg: '#141e20',

  // フォーム
  inputBg: '#1e2e30',
  inputBorder: '#2a4044',
  inputTextColor: '#e2f0f1',
  inputBorderRadius: 4,

  // フォント
  fontBase: '"Inter", "Noto Sans JP", sans-serif',
  fontCode: '"JetBrains Mono", monospace',
})

addons.setConfig({
  theme: kazeTheme,
  sidebar: {
    showRoots: true,
    collapsedRoots: [],
  },
})
