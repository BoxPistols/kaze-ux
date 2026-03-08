import { Box, Grid, Tab, Tabs, Typography } from '@mui/material'
import { useState } from 'react'

import { CustomSelect } from '@/components/Form/CustomSelect'
import { CustomTextField } from '@/components/Form/CustomTextField'
import { CustomAccordion } from '@/components/ui/accordion'
import { SaveButton } from '@/components/ui/button/saveButton'
import { WeekStartSelector } from '@/components/ui/calendar/WeekStartSelector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/text'
import { ThemeToggle } from '@/components/ui/themeToggle'
import { toast } from '@/components/ui/toast'

const SettingsPage = () => {
  const [tabValue, setTabValue] = useState(0)
  const [name, setName] = useState('Takeshi Yamada')
  const [email, setEmail] = useState('takeshi@example.com')
  const [company, setCompany] = useState('Kaze Technologies')
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState('Asia/Tokyo')

  const handleSave = () => {
    toast.success('Settings saved successfully')
  }

  const generalTab = (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
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
                  label='Company'
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <SaveButton onClick={handleSave} label='Save Profile' />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={12}>
                <CustomSelect
                  label='Language'
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as string)}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'ja', label: 'Japanese' },
                  ]}
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <CustomSelect
                  label='Timezone'
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value as string)}
                  options={[
                    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
                    {
                      value: 'America/New_York',
                      label: 'America/New_York (EST)',
                    },
                    { value: 'Europe/London', label: 'Europe/London (GMT)' },
                  ]}
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <SaveButton onClick={handleSave} label='Save Preferences' />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  const appearanceTab = (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant='body2'>Dark Mode</Typography>
              <ThemeToggle />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <WeekStartSelector
              label='Week Start Day'
              description='Choose which day the week starts on.'
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  const advancedTab = (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Settings</CardTitle>
      </CardHeader>
      <CardContent className='p-0'>
        <CustomAccordion
          summary={
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              API Settings
            </Typography>
          }
          details={
            <Box sx={{ p: 2 }}>
              <CustomTextField
                label='API Key'
                value='sk-demo-xxxxx-xxxxx'
                fullWidth
                disabled
              />
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ mt: 1, display: 'block' }}>
                Your API key for external integrations.
              </Typography>
            </Box>
          }
        />
        <CustomAccordion
          summary={
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              Webhook Settings
            </Typography>
          }
          details={
            <Box sx={{ p: 2 }}>
              <CustomTextField
                label='Webhook URL'
                value=''
                fullWidth
                placeholder='https://your-app.com/webhook'
              />
            </Box>
          }
        />
        <CustomAccordion
          summary={
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              Data Export
            </Typography>
          }
          details={
            <Box sx={{ p: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                Export all your data in JSON or CSV format.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <SaveButton
                  onClick={() => toast.info('Exporting data...')}
                  label='Export Data'
                />
              </Box>
            </Box>
          }
        />
        <CustomAccordion
          summary={
            <Typography
              variant='body2'
              sx={{ fontWeight: 500, color: 'error.main' }}>
              Danger Zone
            </Typography>
          }
          details={
            <Box sx={{ p: 2 }}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Permanently delete your account and all associated data.
              </Typography>
              <SaveButton
                onClick={() =>
                  toast.error('This is a demo - account not deleted')
                }
                label='Delete Account'
              />
            </Box>
          }
        />
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title='Settings'
        subtitle='Manage your account and application preferences.'
      />

      <Tabs
        value={tabValue}
        onChange={(_e, v) => setTabValue(v)}
        sx={{ mb: 3 }}>
        <Tab label='General' />
        <Tab label='Appearance' />
        <Tab label='Advanced' />
      </Tabs>

      {tabValue === 0 && generalTab}
      {tabValue === 1 && appearanceTab}
      {tabValue === 2 && advancedTab}
    </Box>
  )
}

export default SettingsPage
