---
name: theme-customization
description: MUI v7テーマとTailwind CSSカスタマイズ時に使用。カラーパレット、タイポグラフィ、ブレークポイント、コンポーネントスタイル、テーマ統合を含む。
version: 1.0.0
---

# テーマカスタマイズガイドライン

このスキルは、KDDI Smart Drone Platform UI Theme プロジェクトでMUI v7テーマとTailwind CSSをカスタマイズする際のベストプラクティスを提供します。

## 適用タイミング

以下の作業時に自動的に適用されます：

- テーマファイルの作成・編集
- カラーパレットの定義
- タイポグラフィ設定
- ブレークポイント調整
- MUI + Tailwind統合

## テーマファイル構造

```
src/themes/
├── theme.ts              # メインテーマ
├── palette.ts            # カラーパレット
├── typography.ts         # タイポグラフィ
├── components.ts         # コンポーネントスタイル
└── breakpoints.ts        # ブレークポイント
```

## MUI v7 テーマ作成

### 基本テーマ構造

```tsx
// src/themes/theme.ts
import { createTheme } from '@mui/material/styles'
import { palette } from './palette'
import { typography } from './typography'
import { components } from './components'
import { breakpoints } from './breakpoints'

export const theme = createTheme({
  palette,
  typography,
  components,
  breakpoints,
  spacing: 8, // 基本スペーシング単位
  shape: {
    borderRadius: 8, // デフォルト角丸
  },
})

// TypeScript型拡張
declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      headerHeight: number
      sidebarWidth: number
    }
  }
  interface ThemeOptions {
    custom?: {
      headerHeight?: number
      sidebarWidth?: number
    }
  }
}
```

### カラーパレット

```tsx
// src/themes/palette.ts
import { PaletteOptions } from '@mui/material/styles'

export const palette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  background: {
    default: '#ffffff',
    paper: '#f5f5f5',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
}
```

### タイポグラフィ

```tsx
// src/themes/typography.ts
import { TypographyOptions } from '@mui/material/styles/createTypography'

export const typography: TypographyOptions = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  fontSize: 14,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.6,
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.75,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.57,
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.43,
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.75,
    textTransform: 'none', // ボタンテキストを大文字にしない
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.66,
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 2.66,
    textTransform: 'uppercase',
  },
}
```

### コンポーネントスタイル

```tsx
// src/themes/components.ts
import { Components, Theme } from '@mui/material/styles'

export const components: Components<Theme> = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 500,
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    defaultProps: {
      disableElevation: true,
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
    },
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
      elevation1: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 16,
      },
    },
  },
}
```

### ブレークポイント

```tsx
// src/themes/breakpoints.ts
import { BreakpointsOptions } from '@mui/material/styles'

export const breakpoints: BreakpointsOptions = {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
}
```

## Tailwind CSS統合

### tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  important: '#root', // MUIとの競合回避
  theme: {
    extend: {
      colors: {
        // MUIパレットと統一
        primary: {
          light: '#42a5f5',
          main: '#1976d2',
          dark: '#1565c0',
        },
        secondary: {
          light: '#ba68c8',
          main: '#9c27b0',
          dark: '#7b1fa2',
        },
      },
      spacing: {
        // MUIの8px基準と統一
        0.5: '4px',
        1: '8px',
        2: '16px',
        3: '24px',
        4: '32px',
        5: '40px',
      },
      borderRadius: {
        // MUIと統一
        mui: '8px',
        'mui-card': '12px',
        'mui-chip': '16px',
      },
      screens: {
        // MUIブレークポイントと統一
        xs: '0px',
        sm: '600px',
        md: '900px',
        lg: '1200px',
        xl: '1536px',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // MUI CssBaselineを使用
  },
}
```

## テーマプロバイダー設定

### App.tsx

```tsx
import { ThemeProvider, CssBaseline } from '@mui/material'
import { theme } from './themes/theme'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* アプリケーションコンテンツ */}
    </ThemeProvider>
  )
}

export default App
```

## ダークモード対応

### テーマ切り替え

```tsx
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { useMemo, useState } from 'react'

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light')

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // ライトモードパレット
                primary: { main: '#1976d2' },
                background: { default: '#ffffff' },
              }
            : {
                // ダークモードパレット
                primary: { main: '#90caf9' },
                background: { default: '#121212' },
              }),
        },
      }),
    [mode]
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </ThemeProvider>
  )
}
```

## テーマ使用パターン

### useTheme フック

```tsx
import { useTheme } from '@mui/material/styles'

export const Component = () => {
  const theme = useTheme()

  return (
    <div
      style={{
        padding: theme.spacing(2),
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      }}>
      Themed Content
    </div>
  )
}
```

### sx prop

```tsx
import { Box } from '@mui/material'

export const Component = () => (
  <Box
    sx={{
      p: 2, // padding: theme.spacing(2)
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      borderRadius: 1, // borderRadius: theme.shape.borderRadius
      '&:hover': {
        bgcolor: 'primary.dark',
      },
    }}>
    Themed Box
  </Box>
)
```

### styled API

```tsx
import { styled } from '@mui/material/styles'
import { Button } from '@mui/material'

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 3),
  backgroundColor: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}))
```

## レスポンシブスタイル

```tsx
import { Box } from '@mui/material'

export const ResponsiveBox = () => (
  <Box
    sx={{
      width: {
        xs: '100%', // 0px以上
        sm: '75%', // 600px以上
        md: '50%', // 900px以上
        lg: '33.33%', // 1200px以上
      },
      padding: {
        xs: 1,
        md: 2,
        lg: 3,
      },
    }}>
    Responsive Content
  </Box>
)
```

## カスタムテーマ変数

```tsx
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
  },
  custom: {
    headerHeight: 64,
    sidebarWidth: 240,
  },
})

// 使用例
;<Box sx={{ height: (theme) => theme.custom.headerHeight }} />
```

## テーマのエクスポート

```tsx
// src/themes/index.ts
export { theme } from './theme'
export { palette } from './palette'
export { typography } from './typography'
export { components } from './components'
export { breakpoints } from './breakpoints'
```

## ベストプラクティス

1. カラーはパレットから参照（ハードコード禁止）
2. スペーシングは`theme.spacing()`を使用
3. ブレークポイントはテーマ定義を参照
4. MUIとTailwindのスタイルルールを統一
5. ダークモード対応を考慮
6. TypeScript型定義を拡張

## テスト

```bash
pnpm storybook  # テーマ確認
pnpm lint       # スタイルチェック
```

## 参考資料

- [MUI Theming](https://mui.com/material-ui/customization/theming/)
- [MUI Dark Mode](https://mui.com/material-ui/customization/dark-mode/)
- [Tailwind CSS Configuration](https://tailwindcss.com/docs/configuration)
- [MUI + Tailwind Integration](https://mui.com/material-ui/integrations/interoperability/)
