import defaultTheme from 'tailwindcss/defaultTheme'
import { colorData } from './src/themes/colorToken'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

// ヘルパー関数
const createColorSet = (colorKey) => ({
  main: colorData[colorKey].main,
  dark: colorData[colorKey].dark,
  light: colorData[colorKey].light,
  lighter: colorData[colorKey].lighter,
})

const createSimpleColorSet = (colorKey) => ({
  ...Object.entries(colorData[colorKey]).reduce((acc, [key, value]) => {
    acc[key] = value
    return acc
  }, {}),
})

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,mdx}',
    './.storybook/**/*.{js,jsx,ts,tsx,mdx}',
    './src/**/*.stories.mdx',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'Noto Sans JP',
          'sans-serif',
          ...defaultTheme.fontFamily.sans,
        ],
      },
      colors: {
        // CSS Variables based colors (theme-aware)
        primary: {
          DEFAULT: 'var(--color-primary)',
          // MUI の palette と同じ名前でも引けるようにする。
          // CVA コンポーネントは bg-primary-main と書いており、
          // DEFAULT だけでは解決せず背景が一切当たらなかった
          main: 'var(--color-primary)',
          // 文字・アイコン用。面用の main とは別の段
          ink: 'var(--color-primary-ink)',
          foreground: 'var(--color-primary-foreground)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          // MUI の palette と同じ名前でも引けるようにする。
          // CVA コンポーネントは bg-secondary-main と書いており、
          // DEFAULT だけでは解決せず背景が一切当たらなかった
          main: 'var(--color-secondary)',
          // 文字・アイコン用。面用の main とは別の段
          ink: 'var(--color-secondary-ink)',
          dark: 'var(--color-secondary-dark)',
          foreground: 'var(--color-secondary-foreground)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          // MUI の palette と同じ名前でも引けるようにする。
          // CVA コンポーネントは bg-success-main と書いており、
          // DEFAULT だけでは解決せず背景が一切当たらなかった
          main: 'var(--color-success)',
          // 文字・アイコン用。面用の main とは別の段
          ink: 'var(--color-success-ink)',
          dark: 'var(--color-success-dark)',
          foreground: 'var(--color-success-foreground)',
          light: 'var(--color-success-light)',
          border: 'var(--color-success-border)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          // MUI の palette と同じ名前でも引けるようにする。
          // CVA コンポーネントは bg-error-main と書いており、
          // DEFAULT だけでは解決せず背景が一切当たらなかった
          main: 'var(--color-error)',
          // 文字・アイコン用。面用の main とは別の段
          ink: 'var(--color-error-ink)',
          dark: 'var(--color-error-dark)',
          foreground: 'var(--color-error-foreground)',
          light: 'var(--color-error-light)',
          border: 'var(--color-error-border)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          // MUI の palette と同じ名前でも引けるようにする。
          // CVA コンポーネントは bg-warning-main と書いており、
          // DEFAULT だけでは解決せず背景が一切当たらなかった
          main: 'var(--color-warning)',
          // 文字・アイコン用。面用の main とは別の段
          ink: 'var(--color-warning-ink)',
          dark: 'var(--color-warning-dark)',
          foreground: 'var(--color-warning-foreground)',
          light: 'var(--color-warning-light)',
          border: 'var(--color-warning-border)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          // MUI の palette と同じ名前でも引けるようにする。
          // CVA コンポーネントは bg-info-main と書いており、
          // DEFAULT だけでは解決せず背景が一切当たらなかった
          main: 'var(--color-info)',
          // 文字・アイコン用。面用の main とは別の段
          ink: 'var(--color-info-ink)',
          dark: 'var(--color-info-dark)',
          foreground: 'var(--color-info-foreground)',
          light: 'var(--color-info-light)',
          border: 'var(--color-info-border)',
        },
        background: {
          DEFAULT: 'var(--color-background)',
          paper: 'var(--color-background-paper)',
          foreground: 'var(--color-foreground)',
        },
        foreground: 'var(--color-foreground)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',

        // Fallback static colors from MUI
        text: createSimpleColorSet('text'),
        action: createSimpleColorSet('action'),
        common: createSimpleColorSet('common'),

        // shadcn/ui compatible aliases
        card: {
          DEFAULT: 'var(--color-background-paper)',
          foreground: 'var(--color-foreground)',
        },
        // hover 用の面と、その上の文字。
        //
        // かつて colorData から静的に取っており、**ライトの値が焼き付いて
        // いた**。CustomButton の outline / ghost が hover:bg-accent
        // hover:text-accent-foreground を使っているため、ダークで
        // near-black の文字が出ていた。MUI 側は追従していたので、同じ画面で
        // MUI 製と CVA 製のボタンの hover だけが食い違う
        accent: {
          DEFAULT: 'var(--color-action-hover)',
          foreground: 'var(--color-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--color-error)',
          foreground: 'var(--color-error-foreground)',
        },
        popover: {
          DEFAULT: 'var(--color-background-paper)',
          foreground: 'var(--color-foreground)',
        },
        ring: 'var(--color-ring)',
        input: 'var(--color-border)',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: 'var(--color-foreground)',
            a: {
              color: 'var(--color-primary)',
              '&:hover': {
                color: 'var(--color-primary-light)',
              },
            },
          },
        },
      }),
    },
  },
  plugins: [
    forms({ strategy: 'class' }),
    typography,
  ],
}