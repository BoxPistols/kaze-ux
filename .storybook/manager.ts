import { create } from '@storybook/theming'
import { addons } from 'storybook/manager-api'

// SVG ロゴを data URI で埋め込み（ダークテーマ用: テキストを白に）
const logoSvg = `data:image/svg+xml,${encodeURIComponent(
  // シンボルは src/components/ui/logo/kazeLogo.tsx と同じ幾何（帯 + 上下の半円）
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 32">' +
    '<g fill="#5AA9FF">' +
    '<rect x="4" y="14" width="24" height="4"/>' +
    '<path d="M4 14 A7 7 0 0 1 18 14 Z"/>' +
    '<path d="M14 18 A7 7 0 0 0 28 18 Z"/>' +
    '</g>' +
    '<text x="40" y="22" font-family="Inter,sans-serif" font-size="16"' +
    ' font-weight="600" letter-spacing="-0.3" fill="#e4e9f0">Kaze</text>' +
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
  colorPrimary: '#5AA9FF',
  colorSecondary: '#5AA9FF',

  // UI
  appBg: '#14181e',
  appContentBg: '#1a1f27',
  appBorderColor: '#2b3340',
  appBorderRadius: 6,
  appPreviewBg: '#1a1f27',

  // テキスト
  textColor: '#e4e9f0',
  textInverseColor: '#14181e',
  textMutedColor: '#98a3b3',

  // ツールバー
  barTextColor: '#a8b3c4',
  barHoverColor: '#5AA9FF',
  barSelectedColor: '#5AA9FF',
  barBg: '#14181e',

  // フォーム
  inputBg: '#1e242e',
  inputBorder: '#2b3340',
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
