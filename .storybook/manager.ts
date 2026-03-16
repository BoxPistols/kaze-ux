import { create } from '@storybook/theming'
import { addons } from 'storybook/manager-api'

// TOP ページへの戻りリンク（ローカル/本番共通）
const topUrl =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1')
    ? `${window.location.protocol}//${window.location.hostname}:5173`
    : '/'

const kazeTheme = create({
  base: 'light',

  // ブランド — クリックで TOP に戻る
  brandTitle: '風 Kaze Design',
  brandUrl: topUrl,
  brandTarget: '_self',

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
