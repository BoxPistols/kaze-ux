import { Box, Grid, Typography } from '@mui/material'
import { useState } from 'react'

import { CustomTextField } from '@/components/Form/CustomTextField'
import { UserAvatar } from '@/components/ui/avatar'
import { SaveButton } from '@/components/ui/button/saveButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { toast } from '@/components/ui/toast'

const ProfilePage = () => {
  const [name, setName] = useState('Taro Yamada')
  const [email, setEmail] = useState('taro@example.com')
  const [phone, setPhone] = useState('090-1234-5678')
  const [address, setAddress] = useState('Shibuya, Tokyo 150-0001')

  const handleSave = () => {
    toast.success('Profile updated successfully')
  }

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3, pt: 3, pb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant='h4'
          sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.02em' }}>
          Profile
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Manage your account settings.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 5 }}>
              <UserAvatar name={name} size='large' color='primary' />
              <Typography variant='h6' sx={{ mt: 2.5, fontWeight: 700 }}>
                {name}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {email}
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', mt: 1.5 }}>
                Member since March 2025
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Grid container spacing={2.5}>
                <Grid size={12}>
                  <CustomTextField
                    label='Full Name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={12}>
                  <CustomTextField
                    label='Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    type='email'
                  />
                </Grid>
                <Grid size={12}>
                  <CustomTextField
                    label='Phone'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={12}>
                  <CustomTextField
                    label='Default Address'
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <SaveButton onClick={handleSave} label='Save Changes' />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ProfilePage
