import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect } from 'vitest'

import { hookUseTheme } from '@/hooks/useTheme'

import HomePage from '~/pages/HomePage'
import RestaurantPage from '~/pages/RestaurantPage'
import CartPage from '~/pages/CartPage'
import OrderHistoryPage from '~/pages/OrderHistoryPage'
import OrderTrackingPage from '~/pages/OrderTrackingPage'
import ProfilePage from '~/pages/ProfilePage'

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
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
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

describe('UberEats Clone Pages - Smoke Tests', () => {
  it('renders HomePage without crashing', () => {
    renderPage(<HomePage />)
    expect(screen.getByText('What are you craving?')).toBeTruthy()
  })

  it('renders RestaurantPage for existing restaurant', () => {
    renderPage(<RestaurantPage />, '/restaurant/r1', '/restaurant/:id')
    expect(screen.getByText('Sakura Sushi')).toBeTruthy()
  })

  it('renders RestaurantPage 404 for missing restaurant', () => {
    renderPage(<RestaurantPage />, '/restaurant/nonexistent', '/restaurant/:id')
    expect(screen.getByText('ページが見つかりません')).toBeTruthy()
  })

  it('renders CartPage without crashing', () => {
    renderPage(<CartPage />)
    expect(screen.getByText('Your cart is empty')).toBeTruthy()
  })

  it('renders OrderHistoryPage without crashing', () => {
    renderPage(<OrderHistoryPage />)
    expect(screen.getByText('Order History')).toBeTruthy()
  })

  it('renders OrderTrackingPage for existing order', () => {
    renderPage(<OrderTrackingPage />, '/orders/o1', '/orders/:id')
    expect(screen.getByText(/Order #O1/i)).toBeTruthy()
  })

  it('renders OrderTrackingPage 404 for missing order', () => {
    renderPage(<OrderTrackingPage />, '/orders/nonexistent', '/orders/:id')
    expect(screen.getByText('ページが見つかりません')).toBeTruthy()
  })

  it('renders ProfilePage without crashing', () => {
    renderPage(<ProfilePage />)
    expect(screen.getByText('Profile')).toBeTruthy()
  })
})
