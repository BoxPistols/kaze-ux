import EditIcon from '@mui/icons-material/Edit'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import NotificationsIcon from '@mui/icons-material/Notifications'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import StarIcon from '@mui/icons-material/Star'
import { Box, Divider, Grid, Typography } from '@mui/material'
import { useState } from 'react'

import { CustomSelect } from '@/components/Form/CustomSelect'
import { CustomTextField } from '@/components/Form/CustomTextField'
import { UserAvatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/Button'
import { SaveButton } from '@/components/ui/button/saveButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CustomChip } from '@/components/ui/chip'
import { IconButton } from '@/components/ui/icon-button'
import { toast } from '@/components/ui/toast'

const orderStats = [
  {
    label: 'Total Orders',
    value: '47',
    icon: <ReceiptLongIcon aria-hidden='true' />,
    color: '#06C167',
  },
  {
    label: 'Deliveries',
    value: '42',
    icon: <LocalShippingIcon aria-hidden='true' />,
    color: 'success.main',
  },
  {
    label: 'Avg Rating',
    value: '4.8',
    icon: <StarIcon aria-hidden='true' />,
    color: 'warning.main',
  },
]

const notificationOptions = [
  { value: 'all', label: 'All notifications' },
  { value: 'important', label: 'Important only' },
  { value: 'none', label: 'None' },
]

const languageOptions = [
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' },
]

export const ProfilePage = () => {
  const [name, setName] = useState('Taro Yamada')
  const [email, setEmail] = useState('taro@example.com')
  const [phone, setPhone] = useState('090-1234-5678')
  const [address, setAddress] = useState('Shibuya, Tokyo 150-0001')
  const [notifications, setNotifications] = useState('all')
  const [language, setLanguage] = useState('ja')
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    setIsEditing(false)
    toast.success('Profile updated successfully')
  }

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3, pt: 3, pb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant='h4'
          component='h1'
          sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.02em' }}>
          Profile
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Manage your account settings and preferences.
        </Typography>
      </Box>

      {/* Profile Card + Stats */}
      <Card sx={{ mb: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            height: 100,
            background: 'linear-gradient(135deg, #06C167 0%, #048848 100%)',
          }}
        />
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'flex-end' },
              gap: 2,
              mt: -5,
            }}>
            <Box
              sx={{
                border: '4px solid',
                borderColor: 'background.paper',
                borderRadius: '50%',
              }}>
              <UserAvatar name={name} size='large' color='primary' />
            </Box>
            <Box
              sx={{
                flex: 1,
                textAlign: { xs: 'center', sm: 'left' },
                pb: 0.5,
              }}>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                {name}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {email}
              </Typography>
            </Box>
            <Box sx={{ pb: 0.5 }}>
              <CustomChip label='Premium Member' color='success' size='small' />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Order Stats */}
          <Grid container spacing={2}>
            {orderStats.map((stat) => (
              <Grid key={stat.label} size={{ xs: 4 }}>
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 1.5,
                  }}>
                  <Box sx={{ color: stat.color, mb: 0.5 }}>{stat.icon}</Box>
                  <Typography variant='h5' sx={{ fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardHeader>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}>
                <CardTitle>Personal Information</CardTitle>
                {!isEditing && (
                  <IconButton
                    onClick={() => setIsEditing(true)}
                    tooltip='Edit profile'
                    aria-label='Edit profile'
                    size='small'>
                    <EditIcon />
                  </IconButton>
                )}
              </Box>
            </CardHeader>
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <CustomTextField
                    label='Full Name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    label='Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    type='email'
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    label='Phone'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    fullWidth
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid size={12}>
                  <CustomTextField
                    label='Default Address'
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    fullWidth
                    disabled={!isEditing}
                  />
                </Grid>
                {isEditing && (
                  <Grid size={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 1,
                      }}>
                      <Button
                        variant='outline'
                        onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <SaveButton onClick={handleSave} label='Save Changes' />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Preferences */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ mb: 3 }}>
            <CardHeader>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsIcon
                  sx={{ fontSize: 20, color: '#06C167' }}
                  aria-hidden='true'
                />
                <CardTitle>Preferences</CardTitle>
              </Box>
            </CardHeader>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <CustomSelect
                  label='Notifications'
                  value={notifications}
                  onChange={(e) => setNotifications(e.target.value as string)}
                  options={notificationOptions}
                  fullWidth
                />
                <CustomSelect
                  label='Language'
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as string)}
                  options={languageOptions}
                  fullWidth
                />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Member since
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    March 2025
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Account type
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    Premium
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Payment method
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    Visa •••• 4242
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => toast.info('Logging out...')}>
                  Log Out
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
