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
import { COLOR_SCHEME_STORAGE_KEY } from '../src/themes/colorToken'
import { lightTheme, createDarkTheme } from '../src/themes/theme'

import type { ColorScheme } from '../src/themes/colorToken'
import type { Preview, StoryFn, StoryContext } from '@storybook/react-vite'

import '../src/index.css'
import 'maplibre-gl/dist/maplibre-gl.css'

// MUIのローカルストレージキーを統一
const updateLocalStorage = (mode: string) => {
  localStorage.setItem('mui-mode', mode === 'dark' ? 'dark' : 'light')
  localStorage.removeItem('mui-color-scheme-dark')
  localStorage.removeItem('mui-color-scheme-light')
}

/**
 * テーマセレクタの値からモードとスキームを解析する
 * 形式: "light" | "dark-dracula" | "dark-kaze"
 */
const parseThemeValue = (
  value: string
): { mode: 'light' | 'dark'; scheme: ColorScheme } => {
  if (value.startsWith('dark-')) {
    const scheme = value.replace('dark-', '') as ColorScheme
    return { mode: 'dark', scheme }
  }
  return { mode: 'light', scheme: 'kaze' }
}

const Decorator = (Story: StoryFn, context: StoryContext) => {
  const [globals] = useGlobals()
  const currentPadding = globals.padding || 'standard'

  // ページパラメータで明示的にダークテーマを強制するかチェック
  const forceDarkTheme = context.parameters?.forceDarkTheme === true
  const themeValue = forceDarkTheme ? 'dark-dracula' : globals.theme || 'light'
  const { mode, scheme } = parseThemeValue(themeValue)

  // 初回マウント検知 -- 初回はトランジションなしで即時適用
  const isFirstMount = useRef(true)

  const muiTheme = useMemo(() => {
    return mode === 'dark' ? createDarkTheme(scheme) : lightTheme
  }, [mode, scheme])

  // 背景色だけ文字列として取得（useEffectの依存配列にオブジェクト参照を入れない）
  const bgColor = muiTheme.palette.background.default

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

    updateLocalStorage(mode)
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme)
    html.setAttribute('data-theme', mode)

    if (mode === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }

    const root = document.getElementById('root')
    if (root) {
      root.style.backgroundColor = bgColor
    }

    return () => {
      if (timer) {
        clearTimeout(timer)
        html.removeAttribute('data-theme-transitioning')
      }
    }
  }, [mode, scheme, bgColor])

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

  // テーマ切替時にcurrentStoryの参照が変わらないようメモ化
  const storyTitle = context.title
  const storyName = context.name
  const storyDescription = context.parameters?.docs?.description?.component
  const storyArgTypes = context.argTypes
  const storyArgs = context.args
  const currentStory = useMemo(
    () => ({
      title: storyTitle,
      name: storyName,
      description: storyDescription,
      // argTypes / args を注入して AI プロンプトにコンポーネント props 情報を渡せるようにする
      argTypes: storyArgTypes as Record<string, unknown> | undefined,
      args: storyArgs as Record<string, unknown> | undefined,
    }),
    [storyTitle, storyName, storyDescription, storyArgTypes, storyArgs]
  )

  // 専用 Story (ChatSupport のデモ等) が独自に <ChatSupport /> を描画する場合、
  // Decorator 側の ChatSupport と二重レンダリングになるのを防ぐオプトアウト。
  // 使い方: meta の parameters に `disableDecoratorChat: true` を設定する。
  const disableDecoratorChat = context.parameters?.disableDecoratorChat === true

  return (
    <EmotionThemeProvider theme={muiTheme}>
      <ThemeProvider theme={muiTheme}>
        <CacheProvider value={cache}>
          <CssBaseline />
          <div
            style={{ padding: noPadding ? 0 : '1rem' }}
            onClick={(e) => {
              // blockLinks が有効なストーリーのみリンク遷移を防止
              if (!context.parameters.blockLinks) return
              const target = (e.target as HTMLElement).closest('a')
              if (target && target.getAttribute('href')) {
                e.preventDefault()
              }
            }}>
            <Story {...context} />
          </div>
          {context.viewMode !== 'docs' && !disableDecoratorChat && (
            <ChatSupport currentStory={currentStory} />
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
    // a11y: ページ遷移のたびにaxeが自動実行されるのを防止（パネルから手動実行は可能）
    a11y: {
      test: 'off',
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

  // a11y自動実行をデフォルトで無効化（Toolbarから手動切替可能）
  initialGlobals: {
    a11y: { manual: true },
  },

  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Light / Dark モード切替',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark-dracula', title: 'Dark (Dracula)' },
          { value: 'dark-kaze', title: 'Dark (Kaze)' },
        ],
        dynamicTitle: true,
      },
    },
    padding: {
      name: 'パディング',
      description: 'コンテンツ周囲のパディング',
      defaultValue: 'standard',
      toolbar: {
        icon: 'box',
        items: [
          { value: 'none', title: 'パディングなし' },
          { value: 'standard', title: '標準パディング' },
        ],
      },
    },
  },
}

export default preview
export { Decorator }
