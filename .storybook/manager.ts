import { create } from '@storybook/theming'
import { addons } from 'storybook/manager-api'

// TOP ページへの戻りリンク
// 本番: origin のルート（/storybook/ → / へ）
// ローカル: Storybook 自身と別ポートなので直接遷移不可。
//   → origin のルートにリンクし、ブラウザタブで切り替える運用。
const getTopUrl = (): string => {
  if (typeof window === 'undefined') return '/'
  // origin + '/' で常に同一ドメインのルートに戻る
  // 本番: https://kaze-ux.vercel.app/storybook/ → https://kaze-ux.vercel.app/
  // ローカル: http://localhost:6006/ → http://localhost:6006/ （SB自身。TOP は別ポート）
  return window.location.origin + '/'
}

const kazeTheme = create({
  base: 'light',

  // ブランド — クリックで TOP に戻る（別タブ）
  brandTitle: 'Kaze Design',
  brandUrl: getTopUrl(),
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
