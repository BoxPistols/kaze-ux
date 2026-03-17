import { create } from '@storybook/theming'
import { addons } from 'storybook/manager-api'

// SVG ロゴを data URI で埋め込み
const logoSvg = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 28">' +
    '<rect width="28" height="28" rx="6" fill="url(#g)"/>' +
    '<defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" stop-color="#0EADB8"/>' +
    '<stop offset="100%" stop-color="#0A8A94"/>' +
    '</linearGradient></defs>' +
    '<path d="M7 9h14M7 14h10M7 19h6" stroke="white" stroke-width="2.2" stroke-linecap="round"/>' +
    '<text x="34" y="20" font-family="Inter,sans-serif" font-size="15" font-weight="700" fill="#1a2e2e">Kaze</text>' +
    '</svg>'
)}`

const kazeTheme = create({
  base: 'light',

  // ブランド — クリックで TOP に戻る（本番のみ有効）
  brandTitle: 'Kaze Design',
  brandImage: logoSvg,
  brandUrl: typeof window !== 'undefined' ? window.location.origin + '/' : '/',
  brandTarget: '_blank',

  // カラー
  colorPrimary: '#0EADB8',
  colorSecondary: '#0EADB8',

  // UI
  appBg: '#f8fafa',
  appContentBg: '#ffffff',
  appBorderColor: '#d4e8ea',
  appBorderRadius: 6,
  appPreviewBg: '#ffffff',

  // テキスト
  textColor: '#1a2e2e',
  textInverseColor: '#ffffff',
  textMutedColor: '#5c7a7e',

  // ツールバー
  barTextColor: '#5c7a7e',
  barHoverColor: '#0EADB8',
  barSelectedColor: '#0EADB8',
  barBg: '#ffffff',

  // フォーム
  inputBg: '#ffffff',
  inputBorder: '#d4e8ea',
  inputTextColor: '#1a2e2e',
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
