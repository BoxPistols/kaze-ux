import { Box, Grid, Typography } from '@mui/material'
import { useState } from 'react'

import { CustomTextField } from '@/components/Form/CustomTextField'
import { UserAvatar } from '@/components/ui/avatar'
import { SaveButton } from '@/components/ui/button/saveButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/text'
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
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <PageHeader title='Profile' subtitle='Manage your account settings.' />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <UserAvatar name={name} size='large' color='primary' />
              <Typography variant='h6' sx={{ mt: 2, fontWeight: 600 }}>
                {name}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {email}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
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
              <Grid container spacing={2}>
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
