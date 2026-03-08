import AssignmentIcon from '@mui/icons-material/Assignment'
import ChatIcon from '@mui/icons-material/Chat'
import CloudIcon from '@mui/icons-material/Cloud'
import CodeIcon from '@mui/icons-material/Code'
import PaymentIcon from '@mui/icons-material/Payment'
import StorageIcon from '@mui/icons-material/Storage'
import { Box, Grid, Typography } from '@mui/material'
import type { ReactNode } from 'react'

import { ServiceCard } from '@/components/ui/card/serviceCard'
import { ConnectionStatusChip } from '@/components/ui/chip'
import { PageHeader } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'

import { integrations } from '~/data/integrations'

const iconMap: Record<string, ReactNode> = {
  slack: <ChatIcon sx={{ fontSize: 32 }} aria-hidden='true' />,
  github: <CodeIcon sx={{ fontSize: 32 }} aria-hidden='true' />,
  aws: <CloudIcon sx={{ fontSize: 32 }} aria-hidden='true' />,
  jira: <AssignmentIcon sx={{ fontSize: 32 }} aria-hidden='true' />,
  'google-drive': <StorageIcon sx={{ fontSize: 32 }} aria-hidden='true' />,
  stripe: <PaymentIcon sx={{ fontSize: 32 }} aria-hidden='true' />,
}

export const IntegrationsPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title='Integrations'
        subtitle='Connect your favorite tools and services.'
      />

      <Grid container spacing={3}>
        {integrations.map((integration) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={integration.id}>
            <ServiceCard
              title={integration.name}
              description={integration.description}
              icon={iconMap[integration.icon]}
              connected={integration.status === 'connected'}
              error={integration.status === 'error'}
              onRegisterClick={() => {
                if (integration.status === 'connected') {
                  toast.info(`Disconnect ${integration.name}`)
                } else {
                  toast.success(`Connect ${integration.name}`)
                }
              }}
              registerButtonLabel={
                integration.status === 'connected' ? 'Disconnect' : 'Connect'
              }
              headerContent={
                <ConnectionStatusChip
                  connected={integration.status === 'connected'}
                  connectedLabel='Connected'
                  disconnectedLabel={
                    integration.status === 'error' ? 'Error' : 'Disconnected'
                  }
                />
              }>
              {integration.lastSync && (
                <Typography variant='caption' color='text.secondary'>
                  Last sync: {new Date(integration.lastSync).toLocaleString()}
                </Typography>
              )}
            </ServiceCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
