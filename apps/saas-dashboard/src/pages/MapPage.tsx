import LocationOnIcon from '@mui/icons-material/LocationOn'
import { Box, Typography } from '@mui/material'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const offices = [
  { name: 'Tokyo HQ', address: 'Shibuya, Tokyo', employees: 45 },
  { name: 'Osaka Office', address: 'Umeda, Osaka', employees: 20 },
  { name: 'Fukuoka Office', address: 'Hakata, Fukuoka', employees: 12 },
]

const MapPage = () => {
  return (
    <Box sx={{ position: 'relative', height: 'calc(100vh - 64px)' }}>
      {/* Map placeholder */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Box sx={{ textAlign: 'center' }}>
          <LocationOnIcon
            sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3 }}
          />
          <Typography variant='h6' color='text.secondary' sx={{ mt: 2 }}>
            MapLibre Integration
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Set VITE_MAPLIBRE_STYLE env variable to enable the map
          </Typography>
        </Box>
      </Box>

      {/* Overlay card */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          width: 320,
          zIndex: 10,
        }}>
        <Card>
          <CardHeader>
            <CardTitle>Office Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {offices.map((office) => (
                <Box
                  key={office.name}
                  sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <LocationOnIcon
                    sx={{ fontSize: 20, color: 'primary.main', mt: 0.3 }}
                  />
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>
                      {office.name}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {office.address}
                    </Typography>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: 'block' }}>
                      {office.employees} employees
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default MapPage
