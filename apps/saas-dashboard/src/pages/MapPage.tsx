import LocationOnIcon from '@mui/icons-material/LocationOn'
import PeopleIcon from '@mui/icons-material/People'
import { Box, Typography } from '@mui/material'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const offices = [
  {
    name: 'Tokyo HQ',
    address: 'Shibuya, Tokyo',
    employees: 45,
    color: 'primary.main',
    bgColor: 'rgba(38, 66, 190, 0.08)',
  },
  {
    name: 'Osaka Office',
    address: 'Umeda, Osaka',
    employees: 20,
    color: 'success.main',
    bgColor: 'rgba(70, 171, 74, 0.08)',
  },
  {
    name: 'Fukuoka Office',
    address: 'Hakata, Fukuoka',
    employees: 12,
    color: 'warning.main',
    bgColor: 'rgba(235, 129, 23, 0.08)',
  },
]

export const MapPage = () => {
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
            aria-hidden='true'
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
          width: 340,
          zIndex: 10,
        }}>
        <Card
          sx={{
            backdropFilter: 'blur(12px)',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(30, 30, 30, 0.9)'
                : 'rgba(255, 255, 255, 0.92)',
          }}>
          <CardHeader>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}>
              <CardTitle>Office Locations</CardTitle>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}>
                <PeopleIcon sx={{ fontSize: 14 }} aria-hidden='true' />
                {offices.reduce((sum, o) => sum + o.employees, 0)}
              </Box>
            </Box>
          </CardHeader>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {offices.map((office) => (
                <Box
                  key={office.name}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 1.5,
                  }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: office.bgColor,
                      color: office.color,
                      flexShrink: 0,
                    }}>
                    <LocationOnIcon sx={{ fontSize: 20 }} aria-hidden='true' />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {office.name}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {office.address}
                    </Typography>
                  </Box>
                  <Typography
                    variant='caption'
                    sx={{ fontWeight: 500, color: 'text.secondary' }}>
                    {office.employees}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
