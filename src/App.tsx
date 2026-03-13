import AirIcon from '@mui/icons-material/Air'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PaletteIcon from '@mui/icons-material/Palette'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import WidgetsIcon from '@mui/icons-material/Widgets'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  Grid,
  Typography,
} from '@mui/material'
import {
  Route,
  HashRouter as Router,
  Routes,
  Navigate,
  useNavigate,
} from 'react-router-dom'

import { NotFoundView } from '@/components/ui/feedback'
import {
  LayoutWithSidebar,
  SidebarProvider,
  type MenuItem as SidebarMenuItem,
  type AccountMenuType,
} from '@/layouts/sidebar'

// アプリリンクカード定義
interface AppLink {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  external?: boolean
  port: string
}

const appLinks: AppLink[] = [
  {
    title: 'Storybook',
    description: 'コンポーネントカタログ・デザインガイド・ドキュメント',
    icon: <AutoStoriesIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    href: 'http://localhost:6006',
    external: true,
    port: '6006',
  },
  {
    title: 'SaaS Dashboard',
    description: 'CRUD操作・データテーブル・フォームパターン',
    icon: (
      <SpaceDashboardIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
    ),
    href: 'http://localhost:3001',
    external: true,
    port: '3001',
  },
  {
    title: 'UberEats Clone',
    description: 'レストラン検索・カート・注文フロー',
    icon: <RestaurantIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
    href: 'http://localhost:3002',
    external: true,
    port: '3002',
  },
]

// 概要カード定義
const overviewCards = [
  {
    title: 'Components',
    description: 'MUI + Tailwind CSSで構築された再利用可能なUIコンポーネント',
    icon: <WidgetsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  },
  {
    title: 'Design Tokens',
    description: 'カラー・タイポグラフィ・スペーシングトークン',
    icon: <PaletteIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
  },
  {
    title: 'Theme System',
    description: 'MUI v7マルチスキーム対応のLight/Darkモード',
    icon: <AirIcon sx={{ fontSize: 40, color: 'info.main' }} />,
  },
  {
    title: 'Layout System',
    description: 'レスポンシブサイドバーレイアウト',
    icon: <DashboardIcon sx={{ fontSize: 40, color: 'success.main' }} />,
  },
]

// Demo dashboard page
const DemoDashboard = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant='h5' sx={{ mb: 3, fontWeight: 600 }}>
      Dashboard
    </Typography>

    {/* アプリ遷移リンク */}
    <Typography
      variant='subtitle2'
      color='text.secondary'
      sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
      Applications
    </Typography>
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {appLinks.map((app) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={app.title}>
          <Card
            sx={{
              height: '100%',
              transition: 'box-shadow 0.2s, transform 0.2s',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)',
              },
            }}>
            <CardActionArea
              href={app.href}
              target='_blank'
              rel='noopener noreferrer'
              sx={{ height: '100%' }}>
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 1.5,
                  py: 4,
                }}>
                {app.icon}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}>
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    {app.title}
                  </Typography>
                  <Chip
                    label={`:${app.port}`}
                    size='small'
                    variant='outlined'
                    sx={{ fontSize: '0.7rem', height: 22 }}
                  />
                </Box>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ lineHeight: 1.6 }}>
                  {app.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>

    <Divider sx={{ mb: 3 }} />

    {/* 概要カード */}
    <Typography
      variant='subtitle2'
      color='text.secondary'
      sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
      Design System Overview
    </Typography>
    <Grid container spacing={3}>
      {overviewCards.map((card) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
          <Card sx={{ height: '100%' }}>
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 2,
                py: 4,
              }}>
              {card.icon}
              <Typography variant='h6' sx={{ fontWeight: 600 }}>
                {card.title}
              </Typography>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ lineHeight: 1.6 }}>
                {card.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
)

// Menu items for the demo app
const menuItems: SidebarMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    href: '/dashboard',
    category: 'MAIN MENU',
    description: 'Overview and demo cards',
  },
  {
    id: 'components',
    label: 'Components',
    icon: <WidgetsIcon />,
    href: '/components',
    category: 'MAIN MENU',
    description: 'UI component showcase',
  },
  {
    id: 'theme',
    label: 'Theme',
    icon: <PaletteIcon />,
    href: '/theme',
    category: 'MAIN MENU',
    description: 'Theme and design tokens',
  },
]

const availablePaths = ['/', '/dashboard', '/components', '/theme', /.+/]

const AppContent = () => {
  const navigate = useNavigate()
  const accountMenu: AccountMenuType = {
    userName: 'Demo User',
    userEmail: 'demo@example.com',
    menuItems: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <DashboardIcon />,
        onClick: () => navigate('/dashboard'),
      },
    ],
  }

  return (
    <SidebarProvider>
      <LayoutWithSidebar
        availablePaths={availablePaths}
        fullWidthPaths={[]}
        sidebarExcludedPaths={[]}
        menuItems={menuItems}
        accountMenu={accountMenu}
        appName='Kaze UX'
        defaultUrl='/dashboard'>
        <Routes>
          <Route path='/' element={<Navigate to='/dashboard' replace />} />
          <Route path='/dashboard' element={<DemoDashboard />} />
          <Route
            path='/components'
            element={
              <Box sx={{ p: 3 }}>
                <Typography variant='h5' sx={{ mb: 2, fontWeight: 600 }}>
                  Components
                </Typography>
                <Typography color='text.secondary'>
                  Browse the Storybook for the full component library.
                </Typography>
              </Box>
            }
          />
          <Route
            path='/theme'
            element={
              <Box sx={{ p: 3 }}>
                <Typography variant='h5' sx={{ mb: 2, fontWeight: 600 }}>
                  Theme
                </Typography>
                <Typography color='text.secondary'>
                  Toggle light/dark mode using the theme switcher.
                </Typography>
              </Box>
            }
          />
          <Route path='*' element={<NotFoundView homePath='/dashboard' />} />
        </Routes>
      </LayoutWithSidebar>
    </SidebarProvider>
  )
}

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
