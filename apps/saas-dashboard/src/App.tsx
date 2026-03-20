import AirIcon from '@mui/icons-material/Air'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import ContactsIcon from '@mui/icons-material/Contacts'
import DashboardIcon from '@mui/icons-material/Dashboard'
import FolderIcon from '@mui/icons-material/Folder'
import GroupIcon from '@mui/icons-material/Group'
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import MapIcon from '@mui/icons-material/Map'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import SettingsIcon from '@mui/icons-material/Settings'
import SummarizeIcon from '@mui/icons-material/Summarize'
import {
  Navigate,
  Route,
  HashRouter as Router,
  Routes,
  useNavigate,
} from 'react-router-dom'

import { ThemeProvider } from '@/components/ThemeProvider'
import { NotFoundView } from '@/components/ui/feedback'
import { CustomToaster } from '@/components/ui/toast'
import {
  LayoutWithSidebar,
  SidebarProvider,
  type AccountMenuType,
  type MenuItem as SidebarMenuItem,
} from '@/layouts/sidebar'
import { CalendarSettingsProvider } from '@/providers/CalendarSettingsProvider'
import { APP_LINKS } from '@/utils/appLinks'

import { CalendarPage } from '~/pages/CalendarPage'
import { ContactsPage } from '~/pages/ContactsPage'
import { DashboardPage } from '~/pages/DashboardPage'
import { IntegrationsPage } from '~/pages/IntegrationsPage'
import { InvoicesPage } from '~/pages/InvoicesPage'
import { MapPage } from '~/pages/MapPage'
import { ProjectDetailPage } from '~/pages/ProjectDetailPage'
import { ProjectFormPage } from '~/pages/ProjectFormPage'
import { ProjectsPage } from '~/pages/ProjectsPage'
import { ReportsPage } from '~/pages/ReportsPage'
import { SettingsPage } from '~/pages/SettingsPage'
import { TeamPage } from '~/pages/TeamPage'

const menuItems: SidebarMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    href: '/dashboard',
    category: 'MAIN',
    description: 'Overview & KPIs',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: <FolderIcon />,
    href: '/projects',
    category: 'MAIN',
    description: 'Project management',
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: <ContactsIcon />,
    href: '/contacts',
    category: 'MAIN',
    description: 'Contacts & leads',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: <CalendarMonthIcon />,
    href: '/calendar',
    category: 'TOOLS',
    description: 'Schedule & events',
  },
  {
    id: 'invoices',
    label: 'Invoices',
    icon: <ReceiptLongIcon />,
    href: '/invoices',
    category: 'TOOLS',
    description: 'Billing & invoices',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <SummarizeIcon />,
    href: '/reports',
    category: 'TOOLS',
    description: 'Analytics & reports',
  },
  {
    id: 'team',
    label: 'Team',
    icon: <GroupIcon />,
    href: '/team',
    category: 'ORGANIZATION',
    description: 'Team members',
  },
  {
    id: 'map',
    label: 'Map',
    icon: <MapIcon />,
    href: '/map',
    category: 'ORGANIZATION',
    description: 'Office locations',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: <IntegrationInstructionsIcon />,
    href: '/integrations',
    category: 'ORGANIZATION',
    description: 'Connected services',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    href: '/settings',
    category: 'SYSTEM',
    description: 'App settings',
  },
  {
    id: 'kaze-design',
    label: 'Kaze Design System',
    icon: <AirIcon />,
    href: APP_LINKS.top(),
    category: 'APPS',
    description: 'トップページ',
  },
  {
    id: 'storybook',
    label: 'Storybook',
    icon: <AutoStoriesIcon />,
    href: APP_LINKS.storybook(),
    category: 'APPS',
    description: 'コンポーネント',
  },
  {
    id: 'logistics',
    label: 'KazeLogistics',
    icon: <LocalShippingIcon />,
    href: APP_LINKS.skyKaze(),
    category: 'APPS',
    description: '配送監視',
  },
  {
    id: 'ubereats',
    label: 'KazeEats',
    icon: <RestaurantIcon />,
    href: APP_LINKS.ubereats(),
    category: 'APPS',
    description: 'フードデリバリー',
  },
]

const availablePaths = [
  '/',
  '/dashboard',
  '/projects',
  '/projects/new',
  '/contacts',
  '/calendar',
  '/reports',
  '/invoices',
  '/team',
  '/map',
  '/integrations',
  '/settings',
  /^\/projects\/.+/,
]

const AppContent = () => {
  const navigate = useNavigate()
  const accountMenu: AccountMenuType = {
    userName: 'Takeshi Yamada',
    userEmail: 'takeshi@example.com',
    menuItems: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <DashboardIcon />,
        onClick: () => navigate('/dashboard'),
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <SettingsIcon />,
        onClick: () => navigate('/settings'),
      },
    ],
  }

  return (
    <SidebarProvider>
      <LayoutWithSidebar
        availablePaths={availablePaths}
        fullWidthPaths={['/map']}
        sidebarExcludedPaths={[]}
        menuItems={menuItems}
        accountMenu={accountMenu}
        appName='Kaze Dashboard'
        defaultUrl='/dashboard'>
        <Routes>
          <Route path='/' element={<Navigate to='/dashboard' replace />} />
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/projects' element={<ProjectsPage />} />
          <Route path='/projects/new' element={<ProjectFormPage />} />
          <Route path='/projects/:id' element={<ProjectDetailPage />} />
          <Route path='/contacts' element={<ContactsPage />} />
          <Route path='/calendar' element={<CalendarPage />} />
          <Route path='/reports' element={<ReportsPage />} />
          <Route path='/invoices' element={<InvoicesPage />} />
          <Route path='/team' element={<TeamPage />} />
          <Route path='/map' element={<MapPage />} />
          <Route path='/integrations' element={<IntegrationsPage />} />
          <Route path='/settings' element={<SettingsPage />} />
          <Route path='*' element={<NotFoundView homePath='/dashboard' />} />
        </Routes>
      </LayoutWithSidebar>
      <CustomToaster />
    </SidebarProvider>
  )
}

const App = () => {
  return (
    <ThemeProvider>
      <CalendarSettingsProvider>
        <Router>
          <AppContent />
        </Router>
      </CalendarSettingsProvider>
    </ThemeProvider>
  )
}

export { App }
