import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import UTMTrackingMap from '../UTMTrackingMap'
import type { DroneFlightStatus } from '@/types/utmTypes'

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock react-map-gl/maplibre の型定義
interface MockMapProps {
  children?: React.ReactNode
}

interface MockMarkerProps {
  children?: React.ReactNode
  onClick?: (e: { originalEvent: { stopPropagation: () => void } }) => void
  latitude?: number
  longitude?: number
}

interface MockSourceProps {
  children?: React.ReactNode
}

interface MockPopupProps {
  children?: React.ReactNode
}

// Mock react-map-gl/maplibre
vi.mock('react-map-gl/maplibre', () => ({
  default: React.forwardRef<HTMLDivElement, MockMapProps>(
    ({ children }, ref) => (
      <div ref={ref} data-testid='map-container'>
        {children}
      </div>
    )
  ),
  Marker: ({
    children,
    onClick,
    latitude,
    longitude,
    ...props
  }: MockMarkerProps) => (
    <div
      data-testid='map-marker'
      data-lat={latitude}
      data-lng={longitude}
      onClick={() => {
        if (onClick) onClick({ originalEvent: { stopPropagation: vi.fn() } })
      }}
      {...props}>
      {children}
    </div>
  ),
  Source: ({ children }: MockSourceProps) => (
    <div data-testid='map-source'>{children}</div>
  ),
  Layer: () => <div data-testid='map-layer' />,
  Popup: ({ children }: MockPopupProps) => (
    <div data-testid='map-popup'>{children}</div>
  ),
}))

// Mock hooks
vi.mock('@/lib/map/hooks', () => ({
  useRestrictionLayers: () => ({
    visibility: { noFlyZones: true, airports: true, heliports: true },
    toggleLayer: vi.fn(),
    toggleAllLayers: vi.fn(),
    geoJsonData: {
      noFlyZones: { type: 'FeatureCollection', features: [] },
      airports: { type: 'FeatureCollection', features: [] },
      heliports: { type: 'FeatureCollection', features: [] },
    },
  }),
  useKeyboardShortcuts: vi.fn(),
  LAYER_COLORS: {
    noFlyZones: {
      red: '#FF0000',
      yellow: '#FFFF00',
      redOpacity: 0.4,
      yellowOpacity: 0.3,
    },
    airports: { fill: '#9C27B0', stroke: '#7B1FA2', opacity: 0.25 },
    did: { fill: '#FFB6C1', stroke: '#FF69B4', opacity: 0.3 },
    emergency: { fill: '#FFA500', stroke: '#FF8C00', opacity: 0.35 },
    remoteId: { fill: '#DDA0DD', stroke: '#BA55D3', opacity: 0.25 },
    mannedAircraft: { fill: '#87CEEB', stroke: '#4682B4', opacity: 0.3 },
    heliports: { fill: '#3B82F6', stroke: '#1D4ED8', opacity: 0.4 },
    radioInterference: { fill: '#FFC107', stroke: '#FFA000', opacity: 0.2 },
  },
  LAYER_INFO: {},
}))

const theme = createTheme()

const mockDrones: DroneFlightStatus[] = [
  {
    droneId: 'drone-1',
    droneName: 'Drone 1',
    pilotId: 'pilot-1',
    pilotName: 'Pilot 1',
    flightPlanId: 'fp-1',
    position: {
      droneId: 'drone-1',
      latitude: 35.6812,
      longitude: 139.7671,
      altitude: 100,
      heading: 90,
      speed: 10,
      timestamp: new Date(),
    },
    batteryLevel: 80,
    signalStrength: 90,
    flightMode: 'auto',
    status: 'in_flight',
    startTime: new Date(),
    estimatedEndTime: new Date(),
    plannedRoute: {
      waypoints: [
        [139.76, 35.68],
        [139.77, 35.68],
      ],
      corridorWidth: 50,
      color: '#ff0000',
    },
  },
]

describe('UTMTrackingMap', () => {
  it('renders drones correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <UTMTrackingMap drones={mockDrones} restrictedZones={[]} />
      </ThemeProvider>
    )
    expect(screen.getByTestId('map-marker')).toBeInTheDocument()
  })

  it('calls onDroneClick when clicking a drone', () => {
    const handleDroneClick = vi.fn()
    render(
      <ThemeProvider theme={theme}>
        <UTMTrackingMap
          drones={mockDrones}
          restrictedZones={[]}
          onDroneClick={handleDroneClick}
        />
      </ThemeProvider>
    )

    const marker = screen.getByTestId('map-marker')
    fireEvent.click(marker)
    expect(handleDroneClick).toHaveBeenCalledWith(mockDrones[0])
  })

  it('calls onDroneContextMenu when right-clicking a drone', () => {
    const handleContextMenu = vi.fn()
    render(
      <ThemeProvider theme={theme}>
        <UTMTrackingMap
          drones={mockDrones}
          restrictedZones={[]}
          onDroneContextMenu={handleContextMenu}
        />
      </ThemeProvider>
    )

    const marker = screen.getByTestId('map-marker')
    // We need to trigger context menu on the child div that has the handler
    // Since the structure is Marker -> Box(onContextMenu) -> ...,
    // and Marker mock renders children, we can find the child.
    // The child is a MUI Box, which is a div.

    // Let's try firing on the marker itself, it might bubble down if we implemented mock wrong?
    // No, React events bubble up.
    // So if we fire on the inner element, it should reach the handler.
    // If we fire on the marker div, it is the PARENT of the Box.
    // So we must fire on the Box or its children.

    // Let's find the Box. It doesn't have a test id.
    // But it's the first child of the marker.
    const box = marker.firstChild
    expect(box).toBeTruthy()

    fireEvent.contextMenu(box as Element)

    expect(handleContextMenu).toHaveBeenCalledWith(
      mockDrones[0],
      expect.anything()
    )
  })
})
