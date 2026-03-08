import AirIcon from '@mui/icons-material/Air'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PaletteIcon from '@mui/icons-material/Palette'
import WidgetsIcon from '@mui/icons-material/Widgets'
import { Box, Card, CardContent, Grid, Typography } from '@mui/material'
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

// Demo dashboard page
const DemoDashboard = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant='h5' sx={{ mb: 3, fontWeight: 600 }}>
      Dashboard
    </Typography>
    <Grid container spacing={3}>
      {[
        {
          title: 'Components',
          description:
            'Reusable UI components built with MUI and Tailwind CSS.',
          icon: <WidgetsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
        },
        {
          title: 'Design Tokens',
          description: 'Consistent color, typography, and spacing tokens.',
          icon: <PaletteIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
        },
        {
          title: 'Theme System',
          description: 'Light/dark mode with MUI v6 color schemes.',
          icon: <AirIcon sx={{ fontSize: 40, color: 'info.main' }} />,
        },
        {
          title: 'Layout System',
          description: 'Responsive sidebar layout with breakpoint support.',
          icon: <DashboardIcon sx={{ fontSize: 40, color: 'success.main' }} />,
        },
      ].map((card) => (
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
