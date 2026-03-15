import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { useEffect, useState } from 'react'

import { LandingPage } from '@/pages/LandingPage'
import { COLOR_SCHEME_STORAGE_KEY } from '@/themes/colorToken'
import type { ColorScheme } from '@/themes/colorToken'
import { lightTheme, createDarkTheme } from '@/themes/theme'

const App = () => {
  const [isDark, _setIsDark] = useState(() => {
    const saved = localStorage.getItem('mui-mode')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const [scheme] = useState<ColorScheme>(() => {
    return (
      (localStorage.getItem(COLOR_SCHEME_STORAGE_KEY) as ColorScheme) || 'blue'
    )
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const theme = isDark ? createDarkTheme(scheme) : lightTheme

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LandingPage />
    </ThemeProvider>
  )
}

export default App
