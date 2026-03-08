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
          foreground: 'var(--color-primary-foreground)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          foreground: 'var(--color-secondary-foreground)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          foreground: 'var(--color-success-foreground)',
          light: 'var(--color-success-light)',
          border: 'var(--color-success-border)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          foreground: 'var(--color-error-foreground)',
          light: 'var(--color-error-light)',
          border: 'var(--color-error-border)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          foreground: 'var(--color-warning-foreground)',
          light: 'var(--color-warning-light)',
          border: 'var(--color-warning-border)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
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
        accent: {
          DEFAULT: colorData.action.hover,
          foreground: colorData.text.primary,
        },
        destructive: {
          DEFAULT: 'var(--color-error)',
          foreground: 'var(--color-error-foreground)',
        },
        popover: {
          DEFAULT: 'var(--color-background-paper)',
          foreground: 'var(--color-foreground)',
        },
        ring: 'var(--color-primary)',
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