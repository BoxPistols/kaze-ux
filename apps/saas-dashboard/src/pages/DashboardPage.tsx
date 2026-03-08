import AddIcon from '@mui/icons-material/Add'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import ContactsIcon from '@mui/icons-material/Contacts'
import FolderIcon from '@mui/icons-material/Folder'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Box, Grid, Typography, LinearProgress } from '@mui/material'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { UserAvatar } from '@/components/ui/avatar'
import { MiniCalendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CustomChip } from '@/components/ui/chip'
import { Fab } from '@/components/ui/fab'
import { StatusTag } from '@/components/ui/tag'
import type { StatusType } from '@/components/ui/tag'
import { PageHeader } from '@/components/ui/text'

import { activities } from '~/data/activity'
import { kpiCards } from '~/data/kpi'
import { projects } from '~/data/projects'
import { teamMembers } from '~/data/team'

const kpiIconConfig: Record<
  string,
  { icon: React.ReactNode; bgColor: string; color: string }
> = {
  projects: {
    icon: <FolderIcon fontSize='small' aria-hidden='true' />,
    bgColor: 'rgba(38, 66, 190, 0.08)',
    color: 'primary.main',
  },
  contacts: {
    icon: <ContactsIcon fontSize='small' aria-hidden='true' />,
    bgColor: 'rgba(29, 175, 194, 0.08)',
    color: 'info.main',
  },
  revenue: {
    icon: <AttachMoneyIcon fontSize='small' aria-hidden='true' />,
    bgColor: 'rgba(70, 171, 74, 0.08)',
    color: 'success.main',
  },
  tasks: {
    icon: <TaskAltIcon fontSize='small' aria-hidden='true' />,
    bgColor: 'rgba(235, 129, 23, 0.08)',
    color: 'warning.main',
  },
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

const activityDotColors: Record<string, string> = {
  project: 'primary.main',
  task: 'success.main',
  contact: 'info.main',
  invoice: 'warning.main',
  team: 'secondary.main',
  system: 'text.disabled',
}

export const DashboardPage = () => {
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
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {kpiCards.map((kpi) => {
          const iconConfig = kpiIconConfig[kpi.icon]
          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={kpi.id}>
              <Card
                sx={{
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 8px 24px rgba(0,0,0,0.4)'
                        : '0 8px 24px rgba(0,0,0,0.08)',
                  },
                }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ mb: 0.5, fontWeight: 500 }}>
                        {kpi.title}
                      </Typography>
                      <Typography
                        variant='h4'
                        sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {kpi.value}
                      </Typography>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          mt: 1.5,
                          gap: 0.5,
                          bgcolor:
                            kpi.change > 0
                              ? 'rgba(70, 171, 74, 0.08)'
                              : 'rgba(218, 55, 55, 0.08)',
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                        }}>
                        {kpi.change > 0 ? (
                          <TrendingUpIcon
                            sx={{ fontSize: 16, color: 'success.main' }}
                            aria-hidden='true'
                          />
                        ) : (
                          <TrendingDownIcon
                            sx={{ fontSize: 16, color: 'error.main' }}
                            aria-hidden='true'
                          />
                        )}
                        <Typography
                          variant='caption'
                          sx={{
                            color:
                              kpi.change > 0 ? 'success.main' : 'error.main',
                            fontWeight: 600,
                          }}>
                          {kpi.change > 0 ? '+' : ''}
                          {kpi.change}%
                        </Typography>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ fontSize: '0.7rem' }}>
                          {kpi.changeLabel}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: iconConfig.bgColor,
                        color: iconConfig.color,
                        flexShrink: 0,
                      }}>
                      {iconConfig.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Recent Projects */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardHeader>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}>
                <CardTitle>Recent Projects</CardTitle>
                <Typography
                  component='a'
                  href='/projects'
                  variant='caption'
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault()
                    navigate('/projects')
                  }}>
                  View all
                </Typography>
              </Box>
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
                              padding: '10px 16px',
                              borderBottom: '1px solid var(--color-border)',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
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
                        style={{
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            'var(--color-hover, rgba(0,0,0,0.02))')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = '')
                        }
                        onClick={() => navigate(`/projects/${project.id}`)}>
                        <td
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--color-border)',
                          }}>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
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
                          <CustomChip
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
                              sx={{ fontWeight: 500, minWidth: 28 }}>
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
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent sx={{ pt: 0 }}>
              <MiniCalendar
                currentDate={calendarDate}
                onDateChange={setCalendarDate}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Feed */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent sx={{ pt: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {recentActivities.map((activity, idx) => (
                  <Box
                    key={activity.id}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      py: 1.5,
                      borderBottom:
                        idx < recentActivities.length - 1
                          ? '1px solid'
                          : 'none',
                      borderColor: 'divider',
                    }}>
                    {/* Timeline dot */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        pt: 0.5,
                      }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor:
                            activityDotColors[activity.type] || 'text.disabled',
                          flexShrink: 0,
                        }}
                      />
                      {idx < recentActivities.length - 1 && (
                        <Box
                          sx={{
                            width: 1,
                            flex: 1,
                            bgcolor: 'divider',
                            mt: 0.5,
                          }}
                        />
                      )}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 0.25,
                        }}>
                        <UserAvatar name={activity.user} size='small' />
                        <Typography variant='body2' sx={{ fontWeight: 500 }}>
                          {activity.user}
                        </Typography>
                        <CustomChip
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
                          sx={{ height: 18, fontSize: '0.6rem' }}
                        />
                      </Box>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ mb: 0.25 }}>
                        {activity.message}
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.disabled'
                        sx={{ fontSize: '0.7rem' }}>
                        {dayjs(activity.timestamp).format('MMM D, HH:mm')}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Team Online */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}>
                <CardTitle>Team Online</CardTitle>
                <Box
                  sx={{
                    bgcolor: 'success.main',
                    color: '#fff',
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}>
                  {onlineTeam.length}
                </Box>
              </Box>
            </CardHeader>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {onlineTeam.map((member) => (
                  <Box
                    key={member.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1,
                      borderRadius: 1.5,
                      transition: 'background-color 0.15s ease',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}>
                    <UserAvatar
                      name={member.name}
                      size='small'
                      color='primary'
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {member.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {member.role}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                      }}
                    />
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
