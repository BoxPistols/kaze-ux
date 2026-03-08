import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import { Box, Grid, Typography } from '@mui/material'

import { UserAvatar } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/Card'
import { ConnectionStatusChip } from '@/components/ui/chip'
import { IconButton } from '@/components/ui/icon-button'
import { StatusTag } from '@/components/ui/tag'
import type { StatusType } from '@/components/ui/tag'
import { PageHeader } from '@/components/ui/text'

import { teamMembers } from '~/data/team'

const statusMap: Record<string, StatusType> = {
  online: 'active',
  offline: 'inactive',
  busy: 'rejected',
  away: 'pending',
}

export const TeamPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title='Team'
        subtitle='Your team members and their current status.'
      />

      <Grid container spacing={3}>
        {teamMembers.map((member) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={member.id}>
            <Card>
              <CardContent className='p-4'>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <UserAvatar
                    name={member.name}
                    size='large'
                    color={
                      member.status === 'online'
                        ? 'success'
                        : member.status === 'busy'
                          ? 'error'
                          : 'secondary'
                    }
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                      {member.name}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {member.role}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {member.department}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}>
                  <ConnectionStatusChip
                    connected={member.status === 'online'}
                  />
                  <StatusTag
                    text={member.status}
                    status={statusMap[member.status]}
                  />
                </Box>

                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <IconButton
                    tooltip={member.email}
                    aria-label={`Email ${member.name}`}
                    size='small'>
                    <EmailIcon />
                  </IconButton>
                  <IconButton
                    tooltip={member.phone}
                    aria-label={`Call ${member.name}`}
                    size='small'>
                    <PhoneIcon />
                  </IconButton>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ ml: 'auto' }}>
                    Joined {member.joinedAt}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
