import { create } from '@storybook/theming'
import { addons } from 'storybook/manager-api'

const kazeTheme = create({
  base: 'light',

  // ブランド
  brandTitle: 'Kaze Design',
  brandUrl: 'https://github.com/BoxPistols/kaze-ux',
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
