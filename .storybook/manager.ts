import { create } from '@storybook/theming'
import { addons } from 'storybook/manager-api'

// TOP ページへの戻りリンク
// Storybook の manager は Vite の import.meta.env を使えないため window で判定
const isDev =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1')

// ローカル: hostname を動的取得（localhost 固定しない）。ポートは localStorage から取得
const getTopUrl = (): string => {
  if (!isDev) {
    // 本番: /storybook/ → origin のルートに戻る
    return typeof window !== 'undefined' ? window.location.origin + '/' : '/'
  }
  const hostname =
    typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  const protocol =
    typeof window !== 'undefined' ? window.location.protocol : 'http:'
  try {
    const saved = localStorage.getItem('kaze-dev-ports')
    if (saved) {
      const ports = JSON.parse(saved)
      if (ports.top) return `${protocol}//${hostname}:${ports.top}`
    }
  } catch {
    // ignore
  }
  return `${protocol}//${hostname}:5173`
}

const kazeTheme = create({
  base: 'light',

  // ブランド — クリックで TOP に戻る（別タブ）
  brandTitle: '風 Kaze Design',
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
