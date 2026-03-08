import AddIcon from '@mui/icons-material/Add'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import ContactsIcon from '@mui/icons-material/Contacts'
import FolderIcon from '@mui/icons-material/Folder'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import {
  Box,
  Grid,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
} from '@mui/material'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { UserAvatar } from '@/components/ui/avatar'
import { MiniCalendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Fab } from '@/components/ui/fab'
import { StatusTag } from '@/components/ui/tag'
import type { StatusType } from '@/components/ui/tag'
import { PageHeader } from '@/components/ui/text'

import { activities } from '~/data/activity'
import { kpiCards } from '~/data/kpi'
import { projects } from '~/data/projects'
import { teamMembers } from '~/data/team'

const iconMap = {
  projects: <FolderIcon sx={{ fontSize: 32 }} />,
  contacts: <ContactsIcon sx={{ fontSize: 32 }} />,
  revenue: <AttachMoneyIcon sx={{ fontSize: 32 }} />,
  tasks: <TaskAltIcon sx={{ fontSize: 32 }} />,
}

const statusMap: Record<string, StatusType> = {
  active: 'active',
  draft: 'draft',
  completed: 'approved',
  'on-hold': 'pending',
  cancelled: 'rejected',
}

const activityTypeColors: Record<string, string> = {
  project: 'primary',
  task: 'success',
  contact: 'info',
  invoice: 'warning',
  team: 'secondary',
  system: 'default',
}

const DashboardPage = () => {
  const navigate = useNavigate()
  const [calendarDate, setCalendarDate] = useState(dayjs())
  const recentProjects = projects
    .filter((p) => p.status === 'active')
    .slice(0, 5)
  const recentActivities = activities.slice(0, 8)
  const onlineTeam = teamMembers.filter((m) => m.status === 'online')

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title='Dashboard'
        subtitle='Welcome back! Here is an overview of your workspace.'
      />

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {kpiCards.map((kpi) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={kpi.id}>
            <Card>
              <CardContent className='p-4'>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}>
                  <Box>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mb: 0.5 }}>
                      {kpi.title}
                    </Typography>
                    <Typography variant='h4' sx={{ fontWeight: 700 }}>
                      {kpi.value}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mt: 1,
                        gap: 0.5,
                      }}>
                      {kpi.change > 0 ? (
                        <TrendingUpIcon
                          sx={{ fontSize: 18, color: 'success.main' }}
                          aria-hidden='true'
                        />
                      ) : (
                        <TrendingDownIcon
                          sx={{ fontSize: 18, color: 'error.main' }}
                          aria-hidden='true'
                        />
                      )}
                      <Typography
                        variant='caption'
                        sx={{
                          color: kpi.change > 0 ? 'success.main' : 'error.main',
                          fontWeight: 600,
                        }}>
                        {kpi.change > 0 ? '+' : ''}
                        {kpi.change}%
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {kpi.changeLabel}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ color: 'primary.main', opacity: 0.7 }}>
                    {iconMap[kpi.icon]}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Projects */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Name', 'Status', 'Priority', 'Progress', 'Owner'].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: 'left',
                              padding: '12px 16px',
                              borderBottom: '1px solid var(--color-border)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              color: 'var(--color-muted)',
                            }}>
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {recentProjects.map((project) => (
                      <tr
                        key={project.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/projects/${project.id}`)}>
                        <td
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--color-border)',
                          }}>
                          <Typography variant='body2' sx={{ fontWeight: 500 }}>
                            {project.name}
                          </Typography>
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--color-border)',
                          }}>
                          <StatusTag
                            text={project.status}
                            status={statusMap[project.status]}
                          />
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--color-border)',
                          }}>
                          <Chip
                            label={project.priority}
                            size='small'
                            color={
                              project.priority === 'critical'
                                ? 'error'
                                : project.priority === 'high'
                                  ? 'warning'
                                  : 'default'
                            }
                            variant='outlined'
                          />
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--color-border)',
                            minWidth: 120,
                          }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}>
                            <LinearProgress
                              variant='determinate'
                              value={project.progress}
                              sx={{ flex: 1, height: 6, borderRadius: 3 }}
                            />
                            <Typography
                              variant='caption'
                              color='text.secondary'>
                              {project.progress}%
                            </Typography>
                          </Box>
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--color-border)',
                          }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}>
                            <UserAvatar name={project.owner} size='small' />
                            <Typography variant='body2'>
                              {project.owner}
                            </Typography>
                          </Box>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Mini Calendar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MiniCalendar
            currentDate={calendarDate}
            onDateChange={setCalendarDate}
          />
        </Grid>

        {/* Activity Feed */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              <List dense disablePadding>
                {recentActivities.map((activity, idx) => (
                  <ListItem
                    key={activity.id}
                    divider={idx < recentActivities.length - 1}
                    sx={{ px: 2 }}>
                    <ListItemAvatar>
                      <UserAvatar name={activity.user} size='small' />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}>
                          <Typography variant='body2'>
                            {activity.message}
                          </Typography>
                          <Chip
                            label={activity.type}
                            size='small'
                            color={
                              activityTypeColors[activity.type] as
                                | 'primary'
                                | 'success'
                                | 'info'
                                | 'warning'
                                | 'secondary'
                                | 'default'
                            }
                            variant='outlined'
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        </Box>
                      }
                      secondary={dayjs(activity.timestamp).format(
                        'MMM D, HH:mm'
                      )}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Team Online */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader>
              <CardTitle>Team Online</CardTitle>
            </CardHeader>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {onlineTeam.map((member) => (
                  <Box
                    key={member.id}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <UserAvatar
                      name={member.name}
                      size='small'
                      color='primary'
                    />
                    <Box>
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {member.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {member.role}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Fab
        icon={<AddIcon />}
        tooltip='New Project'
        onClick={() => navigate('/projects/new')}
      />
    </Box>
  )
}

export default DashboardPage
