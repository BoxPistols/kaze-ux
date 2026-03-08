import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect } from 'vitest'

import { hookUseTheme } from '@/hooks/useTheme'
import { CalendarSettingsProvider } from '@/providers/CalendarSettingsProvider'
import { SidebarProvider } from '@/layouts/sidebar'

import DashboardPage from '~/pages/DashboardPage'
import ProjectsPage from '~/pages/ProjectsPage'
import ProjectDetailPage from '~/pages/ProjectDetailPage'
import ProjectFormPage from '~/pages/ProjectFormPage'
import ContactsPage from '~/pages/ContactsPage'
import CalendarPage from '~/pages/CalendarPage'
import ReportsPage from '~/pages/ReportsPage'
import InvoicesPage from '~/pages/InvoicesPage'
import TeamPage from '~/pages/TeamPage'
import MapPage from '~/pages/MapPage'
import IntegrationsPage from '~/pages/IntegrationsPage'
import SettingsPage from '~/pages/SettingsPage'

const TestProviders = ({
  children,
  initialEntries = ['/'],
}: {
  children: React.ReactNode
  initialEntries?: string[]
}) => {
  const { theme } = hookUseTheme()
  return (
    <ThemeProvider theme={theme}>
      <CalendarSettingsProvider>
        <SidebarProvider>
          <MemoryRouter initialEntries={initialEntries}>
            {children}
          </MemoryRouter>
        </SidebarProvider>
      </CalendarSettingsProvider>
    </ThemeProvider>
  )
}

const renderPage = (page: React.ReactNode, path = '/', route = '/') => {
  return render(
    <TestProviders initialEntries={[path]}>
      <Routes>
        <Route path={route} element={page} />
      </Routes>
    </TestProviders>
  )
}

describe('SaaS Dashboard Pages - Smoke Tests', () => {
  it('renders DashboardPage without crashing', () => {
    renderPage(<DashboardPage />)
    expect(screen.getByText('Dashboard')).toBeTruthy()
  })

  it('renders ProjectsPage without crashing', () => {
    renderPage(<ProjectsPage />)
    expect(screen.getByText('Projects')).toBeTruthy()
  })

  it('renders ProjectDetailPage for existing project', () => {
    renderPage(<ProjectDetailPage />, '/projects/p1', '/projects/:id')
    expect(screen.getByText('Website Redesign')).toBeTruthy()
  })

  it('renders ProjectDetailPage 404 for missing project', () => {
    renderPage(<ProjectDetailPage />, '/projects/nonexistent', '/projects/:id')
    expect(screen.getByText('ページが見つかりません')).toBeTruthy()
  })

  it('renders ProjectFormPage without crashing', () => {
    renderPage(<ProjectFormPage />)
    expect(screen.getByText('New Project')).toBeTruthy()
  })

  it('renders ContactsPage without crashing', () => {
    renderPage(<ContactsPage />)
    expect(screen.getByText('Contacts')).toBeTruthy()
  })

  it('renders CalendarPage without crashing', () => {
    renderPage(<CalendarPage />)
    expect(screen.getByText('Calendar')).toBeTruthy()
  })

  it('renders ReportsPage without crashing', () => {
    renderPage(<ReportsPage />)
    expect(screen.getByText('Reports')).toBeTruthy()
  })

  it('renders InvoicesPage without crashing', () => {
    renderPage(<InvoicesPage />)
    expect(screen.getByText('Invoices')).toBeTruthy()
  })

  it('renders TeamPage without crashing', () => {
    renderPage(<TeamPage />)
    expect(screen.getByText('Team')).toBeTruthy()
  })

  it('renders MapPage without crashing', () => {
    renderPage(<MapPage />)
    expect(screen.getByText('Office Locations')).toBeTruthy()
  })

  it('renders IntegrationsPage without crashing', () => {
    renderPage(<IntegrationsPage />)
    expect(screen.getByText('Integrations')).toBeTruthy()
  })

  it('renders SettingsPage without crashing', () => {
    renderPage(<SettingsPage />)
    expect(screen.getByText('Settings')).toBeTruthy()
  })
})

describe('Provider requirements', () => {
  it('MiniCalendar requires CalendarSettingsProvider', () => {
    // This test ensures the Dashboard (which uses MiniCalendar) works with providers
    const { container } = render(
      <TestProviders initialEntries={['/']}>
        <Routes>
          <Route path='/' element={<DashboardPage />} />
        </Routes>
      </TestProviders>
    )
    expect(container.querySelector('.MuiBox-root')).toBeTruthy()
  })

  it('CalendarPage requires CalendarSettingsProvider', () => {
    const { container } = render(
      <TestProviders initialEntries={['/']}>
        <Routes>
          <Route path='/' element={<CalendarPage />} />
        </Routes>
      </TestProviders>
    )
    expect(container.querySelector('.MuiBox-root')).toBeTruthy()
  })

  it('SettingsPage WeekStartSelector requires CalendarSettingsProvider', () => {
    const { container } = render(
      <TestProviders initialEntries={['/']}>
        <Routes>
          <Route path='/' element={<SettingsPage />} />
        </Routes>
      </TestProviders>
    )
    expect(container.querySelector('.MuiBox-root')).toBeTruthy()
  })
})
