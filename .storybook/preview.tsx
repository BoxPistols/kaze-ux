import createCache from '@emotion/cache'
import {
  CacheProvider,
  ThemeProvider as EmotionThemeProvider,
} from '@emotion/react'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { useEffect, useMemo, useRef } from 'react'
import { useGlobals } from 'storybook/preview-api'

import { ChatSupport } from '../src/components/ui/ChatSupport/ChatSupport'
import { darkTheme, lightTheme } from '../src/themes/theme'

import type { Preview, StoryFn, StoryContext } from '@storybook/react-vite'

import '../src/index.css'
import 'maplibre-gl/dist/maplibre-gl.css'

// MUIのローカルストレージキーを統一
const updateLocalStorage = (theme: string) => {
  // mui-modeのみを使用し、mui-color-schemeは削除
  localStorage.setItem('mui-mode', theme === 'dark' ? 'dark' : 'light')

  // 競合するキーを削除
  localStorage.removeItem('mui-color-scheme-dark')
  localStorage.removeItem('mui-color-scheme-light')
}

const Decorator = (Story: StoryFn, context: StoryContext) => {
  const [globals] = useGlobals()
  const currentTheme = globals.theme || 'light'
  const currentPadding = globals.padding || 'standard'

  // ページパラメータで明示的にダークテーマを強制するかチェック
  const forceDarkTheme = context.parameters?.forceDarkTheme === true
  const themeToUse = forceDarkTheme ? 'dark' : currentTheme

  // 初回マウント検知 -- 初回はトランジションなしで即時適用
  const isFirstMount = useRef(true)

  const muiTheme = useMemo(() => {
    return themeToUse === 'dark' ? darkTheme : lightTheme
  }, [themeToUse])

  useEffect(() => {
    const html = document.documentElement

    // テーマ切替時のみトランジションを有効化（初回マウントはスキップ）
    let timer: ReturnType<typeof setTimeout> | undefined
    if (!isFirstMount.current) {
      html.setAttribute('data-theme-transitioning', '')
      timer = setTimeout(() => {
        html.removeAttribute('data-theme-transitioning')
      }, 350)
    }
    isFirstMount.current = false

    updateLocalStorage(themeToUse)
    html.setAttribute('data-theme', themeToUse)

    if (themeToUse === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }

    const root = document.getElementById('root')
    if (root) {
      root.style.backgroundColor = muiTheme.palette.background.default
    }

    return () => {
      if (timer) {
        clearTimeout(timer)
        html.removeAttribute('data-theme-transitioning')
      }
    }
  }, [themeToUse, muiTheme])

  const cache = useMemo(
    () =>
      createCache({
        key: 'css',
        prepend: true,
        stylisPlugins: [],
      }),
    []
  )

  // パディング制御のロジック
  const isFullscreen = context.viewMode === 'story'
  const noPadding =
    context.parameters.noPadding ||
    (isFullscreen && context.parameters.fullscreenNoPadding) ||
    currentPadding === 'none'

  return (
    <EmotionThemeProvider theme={muiTheme}>
      <ThemeProvider theme={muiTheme}>
        <CacheProvider value={cache}>
          <CssBaseline />
          <div style={{ padding: noPadding ? 0 : '1rem' }}>
            <Story {...context} />
          </div>
          {context.viewMode !== 'docs' && (
            <ChatSupport
              currentStory={{
                title: context.title,
                name: context.name,
                description: context.parameters?.docs?.description?.component,
              }}
            />
          )}
        </CacheProvider>
      </ThemeProvider>
    </EmotionThemeProvider>
  )
}

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      disable: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    staticDirs: ['../public'],
    assets: {
      prefix: '.',
    },
    docs: {
      toc: { headingSelector: 'h2, h3' },
      autodocs: true,
    },

    // カテゴリの順序を制御
    options: {
      storySort: {
        method: 'alphabetical',
        includeNames: true,
        order: [
          'Guide',
          [
            'Introduction',
            'How to Use',
            'MUI + Tailwind CSS',
            'For Designers',
            'Component Development',
            'Ergonomics',
            'HTML CSS Basics',
            'CSS Reference',
            '*',
          ],
          'Design Philosophy',
          ['Overview', 'Technical Stack', '*'],
          'Design Tokens',
          [
            'Token Overview',
            'Color Palette',
            'Typography',
            'Spacing',
            'Shadows & Elevation',
            'Breakpoints',
            'Motion',
            'Dark Mode',
            'Accessibility',
            '*',
          ],
          'Layout',
          ['*', ['Docs', '*']],
          'Components',
          [
            'UI',
            ['*', ['Docs', '*']],
            'Form',
            ['*', ['Docs', '*']],
            'Maps',
            ['*', ['Docs', '*']],
            '*',
          ],
          'Patterns',
          ['*', ['Docs', '*']],
          '*',
        ],
      },
    },
  },

  decorators: [Decorator],

  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
    padding: {
      name: 'Padding',
      description: 'Content padding / コンテンツ周囲のパディング',
      defaultValue: 'standard',
      toolbar: {
        icon: 'box',
        items: [
          { value: 'none', title: 'No Padding' },
          { value: 'standard', title: 'Standard Padding' },
        ],
      },
    },
  },
}

export default preview
export { Decorator }
