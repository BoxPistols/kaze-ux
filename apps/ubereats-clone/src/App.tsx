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
import { hookUseTheme } from '@/hooks/useTheme'

import { useCartStore } from '~/data/cart'
import CartPage from '~/pages/CartPage'
import HomePage from '~/pages/HomePage'
import OrderHistoryPage from '~/pages/OrderHistoryPage'
import OrderTrackingPage from '~/pages/OrderTrackingPage'
import ProfilePage from '~/pages/ProfilePage'
import RestaurantPage from '~/pages/RestaurantPage'

const navItems = [
  { label: 'Home', path: '/', icon: <HomeIcon /> },
  { label: 'Orders', path: '/orders', icon: <ReceiptLongIcon /> },
  { label: 'Cart', path: '/cart', icon: <ShoppingCartIcon /> },
  { label: 'Profile', path: '/profile', icon: <PersonIcon /> },
]

const AppContent = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { mode, setMode } = hookUseTheme()
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
          sx={{
            maxWidth: 1200,
            width: '100%',
            mx: 'auto',
            minHeight: { xs: 64, md: 72 },
            px: { xs: 2, md: 3 },
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
                outlineColor: 'primary.main',
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
                background:
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                flexShrink: 0,
              }}>
              <RestaurantMenuIcon sx={{ color: '#fff', fontSize: 26 }} />
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
              <Box component='span' sx={{ color: 'primary.main' }}>
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
                      color: isActive ? 'primary.main' : 'text.secondary',
                      bgcolor: isActive ? 'action.selected' : 'transparent',
                      '&:hover': {
                        color: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                    }}>
                    {item.label === 'Cart' ? (
                      <Badge badgeContent={cartCount} color='primary'>
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </IconButton>
                )
              })}
            </Box>
          )}

          {/* Theme Toggle */}
          <IconButton
            onClick={() => setMode(isDarkMode ? 'light' : 'dark')}
            tooltip={isDarkMode ? 'Light mode' : 'Dark mode'}
            aria-label={
              isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
            }
            size='medium'>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
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
              aria-label={item.label}
              icon={
                item.label === 'Cart' ? (
                  <Badge badgeContent={cartCount} color='primary'>
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )
              }
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
  const { theme } = hookUseTheme()
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ThemeProvider>
  )
}

export default App
