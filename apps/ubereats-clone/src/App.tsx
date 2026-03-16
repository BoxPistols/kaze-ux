import AirIcon from '@mui/icons-material/Air'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import HomeIcon from '@mui/icons-material/Home'
import LightModeIcon from '@mui/icons-material/LightMode'
import PersonIcon from '@mui/icons-material/Person'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
} from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { useState, useCallback, useMemo } from 'react'
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { IconButton } from '@/components/ui/icon-button'
import { CustomToaster } from '@/components/ui/toast'

import { useCartStore } from '~/data/cart'
import { CartPage } from '~/pages/CartPage'
import { HomePage } from '~/pages/HomePage'
import { OrderHistoryPage } from '~/pages/OrderHistoryPage'
import { OrderTrackingPage } from '~/pages/OrderTrackingPage'
import { ProfilePage } from '~/pages/ProfilePage'
import { RestaurantPage } from '~/pages/RestaurantPage'
import { UE_GREEN, UE_GREEN_LIGHT } from '~/theme/colors'
import { ueDarkTheme, ueLightTheme } from '~/theme/ueTheme'

type ThemeMode = 'light' | 'dark'

// hookUseTheme ではなく独自管理: UberEats Clone は専用テーマ (ueLightTheme/ueDarkTheme) を使用し、
// localStorage キーも 'ubereats-theme' で他アプリと分離するため。
// SaaS Dashboard は共通 ThemeProvider + CssVarsProvider を利用するが、
// 本アプリは UE ブランドカラー専用のため独立した ThemeProvider/useState で管理する。
const getInitialMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem('ubereats-theme')
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

const navItems = [
  { label: 'Home', path: '/', icon: <HomeIcon aria-hidden='true' /> },
  {
    label: 'Orders',
    path: '/orders',
    icon: <ReceiptLongIcon aria-hidden='true' />,
  },
  {
    label: 'Cart',
    path: '/cart',
    icon: <ShoppingCartIcon aria-hidden='true' />,
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: <PersonIcon aria-hidden='true' />,
  },
]

const BADGE_SX = {
  '& .MuiBadge-badge': { bgcolor: 'ueGreen.main', color: 'common.white' },
} as const

const renderNavIcon = (item: (typeof navItems)[0], cartCount: number) =>
  item.label === 'Cart' ? (
    <Badge badgeContent={cartCount} sx={BADGE_SX}>
      {item.icon}
    </Badge>
  ) : (
    item.icon
  )

const AppContent = ({
  mode,
  onToggleMode,
}: {
  mode: ThemeMode
  onToggleMode: () => void
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const isDarkMode = mode === 'dark'
  const cartCount = useCartStore((s) => s.totalItems())
  const isMobile = useMediaQuery('(max-width:768px)')

  const currentTab = navItems.findIndex((item) => {
    if (item.path === '/') return location.pathname === '/'
    return location.pathname.startsWith(item.path)
  })

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}>
      <AppBar
        position='sticky'
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
        <Toolbar
          disableGutters
          sx={{
            height: 64,
            minHeight: 64,
          }}>
          <Box
            sx={{
              maxWidth: 1200,
              width: '100%',
              mx: 'auto',
              px: { xs: 2, md: 3 },
              display: 'flex',
              alignItems: 'center',
            }}>
            {/* Logo */}
            <Box
              component='a'
              onClick={() => navigate('/')}
              role='link'
              tabIndex={0}
              aria-label='KazeEats Home'
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate('/')
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                flex: 1,
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'inherit',
                outline: 'none',
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: UE_GREEN,
                  outlineOffset: 4,
                  borderRadius: 1,
                },
              }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  bgcolor: UE_GREEN,
                  flexShrink: 0,
                }}>
                <RestaurantMenuIcon
                  sx={{ color: 'common.white', fontSize: 26 }}
                  aria-hidden='true'
                />
              </Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.25rem', md: '1.4rem' },
                  letterSpacing: '-0.03em',
                  color: 'text.primary',
                  lineHeight: 1,
                }}>
                Kaze
                <Box component='span' sx={{ color: UE_GREEN }}>
                  Eats
                </Box>
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box
                component='nav'
                aria-label='Main navigation'
                sx={{ display: 'flex', gap: 0.5, mr: 1 }}>
                {navItems.map((item) => {
                  const isActive =
                    item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.path)
                  return (
                    <IconButton
                      key={item.label}
                      onClick={() => navigate(item.path)}
                      tooltip={item.label}
                      aria-label={item.label}
                      size='medium'
                      sx={{
                        color: isActive ? UE_GREEN : 'text.secondary',
                        bgcolor: isActive ? UE_GREEN_LIGHT : 'transparent',
                        '&:hover': {
                          color: UE_GREEN,
                          bgcolor: 'action.hover',
                        },
                      }}>
                      {renderNavIcon(item, cartCount)}
                    </IconButton>
                  )
                })}
              </Box>
            )}

            {/* Theme Toggle */}
            <IconButton
              onClick={onToggleMode}
              tooltip={isDarkMode ? 'Light mode' : 'Dark mode'}
              aria-label={
                isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
              size='medium'>
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            {/* Kaze Design System */}
            <IconButton
              onClick={() =>
                window.open(
                  (import.meta.env.VITE_TOP_URL as string) || '/',
                  '_self'
                )
              }
              tooltip='Kaze Design System'
              aria-label='Back to Kaze Design System'
              size='medium'
              sx={{
                color: 'text.secondary',
                '&:hover': { color: '#0EADB8' },
              }}>
              <AirIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component='main' sx={{ flex: 1, pb: isMobile ? 8 : 0 }}>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/restaurant/:id' element={<RestaurantPage />} />
          <Route path='/cart' element={<CartPage />} />
          <Route path='/orders' element={<OrderHistoryPage />} />
          <Route path='/orders/:id' element={<OrderTrackingPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <BottomNavigation
          component='nav'
          aria-label='Main navigation'
          value={currentTab >= 0 ? currentTab : 0}
          onChange={(_e, newValue) => navigate(navItems[newValue].path)}
          showLabels
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 64,
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: 1200,
            bgcolor: 'background.paper',
          }}>
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.label}
              label={item.label}
              icon={renderNavIcon(item, cartCount)}
              sx={{
                minWidth: 64,
                '& .MuiSvgIcon-root': { fontSize: 24 },
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.7rem',
                  mt: 0.25,
                },
              }}
            />
          ))}
        </BottomNavigation>
      )}

      <CustomToaster />
    </Box>
  )
}

const App = () => {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode)
  const theme = useMemo(
    () => (mode === 'dark' ? ueDarkTheme : ueLightTheme),
    [mode]
  )
  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('ubereats-theme', next)
      return next
    })
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <AppContent mode={mode} onToggleMode={toggleMode} />
      </HashRouter>
    </ThemeProvider>
  )
}

export { App }
