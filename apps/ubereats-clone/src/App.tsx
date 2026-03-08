import DarkModeIcon from '@mui/icons-material/DarkMode'
import HomeIcon from '@mui/icons-material/Home'
import LightModeIcon from '@mui/icons-material/LightMode'
import PersonIcon from '@mui/icons-material/Person'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
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
  const { isDarkMode, toggleTheme } = hookUseTheme()
  const cartCount = useCartStore((s) => s.totalItems())
  const isMobile = useMediaQuery('(max-width:768px)')

  const currentTab = navItems.findIndex((item) => {
    if (item.path === '/') return location.pathname === '/'
    return location.pathname.startsWith(item.path)
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position='sticky'
        color='inherit'
        elevation={0}
        sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 700,
              flex: 1,
              cursor: 'pointer',
              color: 'primary.main',
            }}
            onClick={() => navigate('/')}>
            Kaze Eats
          </Typography>
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, mr: 1 }}>
              {navItems.map((item) => (
                <IconButton
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  tooltip={item.label}>
                  {item.label === 'Cart' ? (
                    <Badge badgeContent={cartCount} color='primary'>
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </IconButton>
              ))}
            </Box>
          )}
          <IconButton
            onClick={toggleTheme}
            tooltip={isDarkMode ? 'Light mode' : 'Dark mode'}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, pb: isMobile ? 8 : 0 }}>
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

      {isMobile && (
        <BottomNavigation
          value={currentTab >= 0 ? currentTab : 0}
          onChange={(_e, newValue) => navigate(navItems[newValue].path)}
          showLabels
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: 1200,
          }}>
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.label}
              label={item.label}
              icon={
                item.label === 'Cart' ? (
                  <Badge badgeContent={cartCount} color='primary'>
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )
              }
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
