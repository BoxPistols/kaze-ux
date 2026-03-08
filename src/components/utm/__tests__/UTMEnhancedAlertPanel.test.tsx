import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import UTMEnhancedAlertPanel from '../UTMEnhancedAlertPanel'

// Mock store
const mockAlerts = [
  {
    id: 'alert-1',
    droneId: 'drone-1',
    droneName: 'Drone 1',
    type: 'zone_violation',
    severity: 'critical', // Critical allows showing Hover/RTH buttons in modal
    message: 'Test Alert',
    details: 'Details',
    timestamp: new Date(),
    acknowledged: false,
  },
]

const mockAcknowledgeAlert = vi.fn()

vi.mock('@/store/utmStore', () => ({
  default: () => ({
    alerts: mockAlerts,
    clearAlert: vi.fn(),
    acknowledgeAlert: mockAcknowledgeAlert,
  }),
}))

const theme = createTheme()

describe('UTMEnhancedAlertPanel', () => {
  it('renders alerts', () => {
    render(
      <ThemeProvider theme={theme}>
        <UTMEnhancedAlertPanel />
      </ThemeProvider>
    )
    expect(screen.getByText('Test Alert')).toBeInTheDocument()
  })

  it('calls onDroneSelect when alert is clicked', () => {
    const handleDroneSelect = vi.fn()
    render(
      <ThemeProvider theme={theme}>
        <UTMEnhancedAlertPanel onDroneSelect={handleDroneSelect} />
      </ThemeProvider>
    )

    // Click the alert item to open modal and select drone
    fireEvent.click(screen.getByText('Test Alert'))
    expect(handleDroneSelect).toHaveBeenCalledWith('drone-1')
  })

  it('calls onHover when hovering button is clicked in modal', () => {
    const handleHover = vi.fn()
    render(
      <ThemeProvider theme={theme}>
        <UTMEnhancedAlertPanel onHover={handleHover} />
      </ThemeProvider>
    )

    // Open modal
    fireEvent.click(screen.getByText('Test Alert'))

    // Find Hover button (only visible for critical/emergency unacknowledged alerts)
    const hoverButton = screen.getByText('ホバリング')
    fireEvent.click(hoverButton)

    expect(handleHover).toHaveBeenCalledWith('drone-1')
  })
})
