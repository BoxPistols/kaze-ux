import ArticleIcon from '@mui/icons-material/Article'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import DescriptionIcon from '@mui/icons-material/Description'
import DevicesIcon from '@mui/icons-material/Devices'
import FolderIcon from '@mui/icons-material/Folder'
import HistoryIcon from '@mui/icons-material/History'
import LinkIcon from '@mui/icons-material/Link'
import LogoutIcon from '@mui/icons-material/Logout'
import MapIcon from '@mui/icons-material/Map'
import NotificationsIcon from '@mui/icons-material/Notifications'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck'
import RadarIcon from '@mui/icons-material/Radar'
import SecurityIcon from '@mui/icons-material/Security'
import SettingsIcon from '@mui/icons-material/Settings'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import {
  Route,
  HashRouter as Router,
  Routes,
  Navigate,
  useNavigate,
} from 'react-router-dom'

import { PasswordGate, logout } from '@/components/auth'
import { NotFoundView } from '@/components/ui/feedback'
import { FlightWorkflowProvider } from '@/contexts/FlightWorkflowContext'
import { hookUseTheme } from '@/hooks/useTheme'
import {
  LayoutWithSidebar,
  SidebarProvider,
  type MenuItem as SidebarMenuItem,
  type AccountMenuType,
} from '@/layouts/sidebar'
import { CalendarSettingsProvider } from '@/providers/CalendarSettingsProvider'

// ページコンポーネント
import CheckinPage from './pages/CheckinPage'
import ContractsPage from './pages/ContractsPage'
import DashboardPage from './pages/DashboardPage'
import DevicesPage from './pages/DevicesPage'
import ExternalServicePage from './pages/ExternalServicePage'
import FlightPlanCreatePage from './pages/FlightPlanCreatePage'
import FlightRecordsPage from './pages/FlightRecordsPage'
import MapPage from './pages/MapPage'
import MediaPage from './pages/MediaPage'
import MonitoringPage from './pages/MonitoringPage'
import NotificationsPage from './pages/NotificationsPage'
import PostflightPage from './pages/PostflightPage'
import ProfilePage from './pages/ProfilePage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProjectPage from './pages/ProjectPage'
import SchedulePage from './pages/SchedulePage'
import SettingsPage from './pages/SettingsPage'
import UsersPage from './pages/UsersPage'
import UTMDashboardPage from './pages/UTMDashboardPage'
import UTMPreFlightLobbyPage from './pages/UTMPreFlightLobbyPage'
import UTMProjectSelectPage from './pages/UTMProjectSelectPage'
import UTMWorkflowPage from './pages/UTMWorkflowPage'

// 404ページ

import 'maplibre-gl/dist/maplibre-gl.css'

// メニュー定義（SDPF最終設計 - FlightHub 2準拠）
const menuItems: SidebarMenuItem[] = [
  // MAIN MENU - ユーザー指定順
  {
    id: 'dashboard',
    label: 'ダッシュボード',
    icon: <MapIcon />,
    href: '/dashboard',
    category: 'MAIN MENU',
    description: '概要・統計',
  },
  {
    id: 'project',
    label: 'プロジェクト',
    icon: <FolderIcon />,
    href: '/project',
    category: 'MAIN MENU',
    description: 'プロジェクト管理',
  },
  {
    id: 'schedule',
    label: 'スケジュール',
    icon: <CalendarMonthIcon />,
    href: '/schedule',
    category: 'MAIN MENU',
    description: 'スケジュール・カレンダー',
  },
  {
    id: 'flight-planning',
    label: '飛行計画',
    icon: <DescriptionIcon />,
    href: '/planning',
    category: 'MAIN MENU',
    description: '飛行計画・申請管理',
    children: [
      {
        id: 'applications',
        label: '申請管理',
        icon: <DescriptionIcon />,
        href: '/planning/applications',
        category: 'MAIN MENU',
        description: 'DIPS/FISS申請・承認ワークフロー',
      },
    ],
  },
  {
    id: 'operations',
    label: '運航管理',
    icon: <RadarIcon />,
    href: '/operations',
    category: 'MAIN MENU',
    description: '飛行準備・監視',
    children: [
      {
        id: 'operations-prepare',
        label: '飛行準備',
        icon: <PlaylistAddCheckIcon />,
        href: '/operations/prepare',
        category: 'MAIN MENU',
        description: '機体選択、アラート設定、監視準備',
      },
      {
        id: 'flight-monitoring',
        label: '飛行監視',
        icon: <RadarIcon />,
        href: '/operations/monitoring',
        category: 'MAIN MENU',
        description: 'リアルタイム監視',
      },
    ],
  },
  {
    id: 'flight-records',
    label: '飛行記録',
    icon: <HistoryIcon />,
    href: '/records',
    category: 'MAIN MENU',
    description: '飛行履歴・ログ・メディア',
  },
  // ADMIN - 管理機能
  {
    id: 'devices',
    label: 'デバイス',
    icon: <DevicesIcon />,
    href: '/devices',
    category: 'ADMIN',
    description: 'ドローン・ポート管理',
  },
  {
    id: 'users',
    label: 'ユーザー',
    icon: <PeopleIcon />,
    href: '/users',
    category: 'ADMIN',
    description: 'ユーザー管理',
  },
  {
    id: 'media',
    label: 'メディア',
    icon: <PhotoLibraryIcon />,
    href: '/media',
    category: 'ADMIN',
    description: '写真・動画管理',
  },
  {
    id: 'contracts',
    label: '契約',
    icon: <DescriptionIcon />,
    href: '/contracts',
    category: 'ADMIN',
    description: '契約情報管理',
  },
  {
    id: 'external-service',
    label: '外部サービス連携',
    icon: <LinkIcon />,
    href: '/external-service',
    category: 'ADMIN',
    description: '外部サービス連携設定',
  },
  // ACCOUNT
  {
    id: 'notifications',
    label: '通知',
    icon: <NotificationsIcon />,
    href: '/notifications',
    category: 'ACCOUNT',
    description: '通知一覧',
  },
  {
    id: 'settings',
    label: '設定',
    icon: <SettingsIcon />,
    href: '/settings',
    category: 'ACCOUNT',
    description: 'アプリケーション設定',
  },
]

// アカウントメニュー生成関数（useNavigateを使用するためコンポーネント内で呼び出す）
const createAccountMenu = (
  navigate: ReturnType<typeof useNavigate>
): AccountMenuType => ({
  userName: 'デモユーザー',
  userEmail: 'demo@example.com',
  menuItems: [
    {
      id: 'profile',
      label: 'プロフィール',
      icon: <PersonIcon />,
      onClick: () => navigate('/profile'),
    },
    {
      id: 'security',
      label: 'セキュリティ',
      icon: <SecurityIcon />,
      onClick: () => navigate('/settings'), // セキュリティは設定ページへ
    },
    {
      id: 'manual',
      label: 'マニュアル',
      icon: <ArticleIcon />,
      onClick: () => window.open('/docs', '_blank'), // 外部ドキュメントは別タブ
    },
    {
      id: 'logout',
      label: 'ログアウト',
      icon: <LogoutIcon />,
      onClick: () => {
        logout()
      },
    },
  ],
})

// 利用可能なパス（*は404用のキャッチオール）
const availablePaths = [
  '/',
  '/project',
  /^\/project\/.+$/,
  '/map',
  '/planning',
  /^\/planning\/.+$/,
  '/operations',
  /^\/operations\/.+$/,
  '/checkin', // レガシーサポート
  /^\/checkin\/.+$/,
  '/monitoring', // レガシーサポート
  /^\/monitoring\/.+$/,
  '/records',
  /^\/records\/.+$/,
  '/schedule',
  '/dashboard',
  /^\/postflight\/.+$/,
  /^\/utm\/.+$/, // レガシーサポート（リダイレクト用）
  '/devices',
  '/users',
  '/media',
  '/contracts',
  '/external-service',
  '/notifications',
  '/settings',
  '/profile',
  /.+/, // 404用のキャッチオール
]

// フルワイドで表示するパス（マップなど）
const fullWidthPaths = [
  '/map', // マップ専用ページ
  '/operations/monitoring', // 飛行監視
  /^\/operations\/monitoring\/.+$/,
  '/monitoring', // レガシーサポート
  /^\/monitoring\/.+$/,
  /^\/postflight\/.+$/,
  /^\/utm\/.*-legacy$/, // レガシーページのみフルワイド
]

// サイドバーを非表示にするパス
const sidebarExcludedPaths: (string | RegExp)[] = [
  /^\/operations\/monitoring\/.+$/,
  /^\/monitoring\/.+$/,
  /^\/postflight\/.+$/,
]

// サイドバーを自動的に閉じるパス（フルスクリーン系）
const sidebarCollapsedPaths: (string | RegExp)[] = []

const AppContent = () => {
  const navigate = useNavigate()
  const accountMenu = createAccountMenu(navigate)

  return (
    <SidebarProvider>
      <LayoutWithSidebar
        availablePaths={availablePaths}
        fullWidthPaths={fullWidthPaths}
        sidebarExcludedPaths={sidebarExcludedPaths}
        sidebarCollapsedPaths={sidebarCollapsedPaths}
        maxWidth='standard'
        menuItems={menuItems}
        accountMenu={accountMenu}
        appName='SDPF Theme'
        defaultUrl='/dashboard'>
        {/* ルーティング（nextのページ構造に準拠） */}
        <Routes>
          {/* ルートはダッシュボードにリダイレクト */}
          <Route path='/' element={<Navigate to='/dashboard' replace />} />

          {/* MAIN MENU */}
          <Route path='/project' element={<ProjectPage />} />
          <Route path='/project/:id' element={<ProjectDetailPage />} />
          <Route
            path='/project/:projectId/flight-plan/new'
            element={<FlightPlanCreatePage />}
          />

          {/* マップ（独立最重要ページ） - 直接アクセス用に維持 */}
          <Route path='/map' element={<MapPage />} />

          {/* 飛行計画 */}
          {/* 飛行計画（書類・申請関係） */}
          <Route
            path='/planning'
            element={<Navigate to='/planning/applications' replace />}
          />
          <Route path='/planning/applications' element={<UTMWorkflowPage />} />
          <Route
            path='/planning/workflow'
            element={<Navigate to='/planning/applications' replace />}
          />

          {/* 運航管理（機体・運航関係） */}
          <Route
            path='/operations'
            element={<Navigate to='/operations/prepare' replace />}
          />
          <Route path='/operations/prepare' element={<CheckinPage />} />
          <Route path='/operations/monitoring' element={<UTMDashboardPage />} />
          <Route
            path='/operations/monitoring/:flightId'
            element={<MonitoringPage />}
          />

          {/* レガシーパス - リダイレクト */}
          <Route
            path='/operations/preflight'
            element={<Navigate to='/operations/prepare' replace />}
          />
          <Route
            path='/planning/preflight'
            element={<Navigate to='/operations/prepare' replace />}
          />
          <Route
            path='/checkin'
            element={<Navigate to='/operations/prepare' replace />}
          />
          <Route
            path='/checkin/monitoring'
            element={<Navigate to='/operations/monitoring' replace />}
          />
          <Route
            path='/monitoring'
            element={<Navigate to='/operations/monitoring' replace />}
          />
          <Route path='/monitoring/:flightId' element={<MonitoringPage />} />
          <Route path='/postflight/:flightId' element={<PostflightPage />} />

          {/* 飛行記録 */}
          <Route path='/records' element={<FlightRecordsPage />} />
          <Route path='/records/logs' element={<FlightRecordsPage />} />
          <Route path='/records/media' element={<MediaPage />} />

          <Route path='/schedule' element={<SchedulePage />} />
          <Route path='/dashboard' element={<DashboardPage />} />

          {/* 旧URLリダイレクト */}
          <Route
            path='/utm/dashboard'
            element={<Navigate to='/monitoring' replace />}
          />
          <Route
            path='/utm/pre-flight-lobby'
            element={<Navigate to='/planning/preflight' replace />}
          />
          <Route
            path='/utm/projects'
            element={<Navigate to='/planning/applications' replace />}
          />
          <Route
            path='/utm/workflow'
            element={<Navigate to='/planning/applications' replace />}
          />
          <Route
            path='/flight-monitoring'
            element={<Navigate to='/monitoring' replace />}
          />
          <Route
            path='/flight-records'
            element={<Navigate to='/records' replace />}
          />
          <Route
            path='/operations'
            element={<Navigate to='/monitoring' replace />}
          />
          <Route
            path='/operations/monitoring'
            element={<Navigate to='/monitoring' replace />}
          />
          <Route
            path='/operations/records'
            element={<Navigate to='/records' replace />}
          />

          {/* レガシーページ（テスト用に維持） */}
          <Route path='/utm/dashboard-legacy' element={<UTMDashboardPage />} />
          <Route
            path='/utm/pre-flight-lobby-legacy'
            element={<UTMPreFlightLobbyPage />}
          />
          <Route
            path='/utm/projects-legacy'
            element={<UTMProjectSelectPage />}
          />
          <Route path='/utm/workflow-legacy' element={<UTMWorkflowPage />} />

          {/* ADMIN */}
          <Route path='/devices' element={<DevicesPage />} />
          <Route path='/users' element={<UsersPage />} />
          <Route path='/media' element={<MediaPage />} />
          <Route path='/contracts' element={<ContractsPage />} />
          <Route path='/external-service' element={<ExternalServicePage />} />

          {/* ACCOUNT */}
          <Route path='/notifications' element={<NotificationsPage />} />
          <Route path='/settings' element={<SettingsPage />} />
          <Route path='/profile' element={<ProfilePage />} />

          {/* 404ページ */}
          <Route path='*' element={<NotFoundView homePath='/project' />} />
        </Routes>
      </LayoutWithSidebar>
    </SidebarProvider>
  )
}

const App = () => {
  const { theme } = hookUseTheme()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CalendarSettingsProvider>
        <FlightWorkflowProvider>
          <PasswordGate>
            <Router>
              <AppContent />
            </Router>
          </PasswordGate>
        </FlightWorkflowProvider>
      </CalendarSettingsProvider>
    </ThemeProvider>
  )
}

export default App
