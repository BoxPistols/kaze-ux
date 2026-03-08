import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import {
  Box,
  Grid,
  Typography,
  LinearProgress,
  Chip,
  Tab,
  Tabs,
} from '@mui/material'
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { CustomTable } from '@/components/Table'
import { UserAvatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/dialog'
import { NotFoundView } from '@/components/ui/feedback'
import { IconButton } from '@/components/ui/icon-button'
import { StatusTag } from '@/components/ui/tag'
import type { StatusType } from '@/components/ui/tag'
import { PageHeader } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'

import type { ProjectStatus } from '~/data/projects'

import { projects } from '~/data/projects'

const statusMap: Record<ProjectStatus, StatusType> = {
  active: 'active',
  draft: 'draft',
  completed: 'approved',
  'on-hold': 'pending',
  cancelled: 'rejected',
}

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const project = projects.find((p) => p.id === id)

  if (!project) return <NotFoundView homePath='/projects' />

  const taskColumns = [
    { accessor: 'title', header: 'Task' },
    { accessor: 'status', header: 'Status' },
    { accessor: 'assignee', header: 'Assignee' },
    { accessor: 'dueDate', header: 'Due Date' },
    { accessor: 'priority', header: 'Priority' },
  ]

  const taskData = project.tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    assignee: t.assignee,
    dueDate: t.dueDate,
    priority: t.priority,
  }))

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`

  const overviewTab = (
    <Grid container spacing={3}>
      {/* Project Details */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
              {project.description}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant='caption' color='text.secondary'>
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StatusTag
                    text={project.status}
                    status={statusMap[project.status]}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant='caption' color='text.secondary'>
                  Priority
                </Typography>
                <Box sx={{ mt: 0.5 }}>
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
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant='caption' color='text.secondary'>
                  Start Date
                </Typography>
                <Typography variant='body2' sx={{ mt: 0.5 }}>
                  {project.startDate}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant='caption' color='text.secondary'>
                  Due Date
                </Typography>
                <Typography variant='body2' sx={{ mt: 0.5 }}>
                  {project.dueDate}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant='caption' color='text.secondary'>
                  Budget
                </Typography>
                <Typography variant='body2' sx={{ mt: 0.5 }}>
                  {formatCurrency(project.budget)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant='caption' color='text.secondary'>
                  Spent
                </Typography>
                <Typography variant='body2' sx={{ mt: 0.5 }}>
                  {formatCurrency(project.spent)}
                </Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant='caption' color='text.secondary'>
                  Progress
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 0.5,
                  }}>
                  <LinearProgress
                    variant='determinate'
                    value={project.progress}
                    sx={{ flex: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {project.progress}%
                  </Typography>
                </Box>
              </Grid>
              <Grid size={12}>
                <Typography variant='caption' color='text.secondary'>
                  Tags
                </Typography>
                <Box
                  sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                  {project.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size='small'
                      variant='outlined'
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Team */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
          </CardHeader>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant='caption' color='text.secondary'>
                  Owner
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 0.5,
                  }}>
                  <UserAvatar
                    name={project.owner}
                    size='small'
                    color='primary'
                  />
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {project.owner}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary'>
                  Members
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    mt: 0.5,
                  }}>
                  {project.team.map((member) => (
                    <Box
                      key={member}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <UserAvatar name={member} size='small' />
                      <Typography variant='body2'>{member}</Typography>
                    </Box>
                  ))}
                  {project.team.length === 0 && (
                    <Typography variant='body2' color='text.secondary'>
                      No team members assigned
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  const tasksTab = (
    <Card>
      <CardHeader>
        <CardTitle>Tasks ({project.tasks.length})</CardTitle>
      </CardHeader>
      <CardContent className='p-0'>
        {project.tasks.length > 0 ? (
          <CustomTable
            columns={taskColumns}
            data={taskData}
            showCRUD
            searchable
            onView={(row) => toast.info(`View task: ${row.title}`)}
            onEdit={(row) => toast.info(`Edit task: ${row.title}`)}
            onDelete={(row) => toast.error(`Delete task: ${row.title}`)}
          />
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color='text.secondary'>No tasks yet</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <IconButton
          onClick={() => navigate('/projects')}
          tooltip='Back to projects'>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <PageHeader title={project.name} subtitle={project.description}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant='outline' onClick={() => toast.info('Edit project')}>
            <EditIcon sx={{ fontSize: 16, mr: 0.5 }} /> Edit
          </Button>
          <Button variant='destructive' onClick={() => setDeleteOpen(true)}>
            <DeleteIcon sx={{ fontSize: 16, mr: 0.5 }} /> Delete
          </Button>
        </Box>
      </PageHeader>

      <Tabs
        value={tabValue}
        onChange={(_e, v) => setTabValue(v)}
        sx={{ mb: 2 }}>
        <Tab label='Overview' />
        <Tab label='Tasks' />
      </Tabs>
      {tabValue === 0 && overviewTab}
      {tabValue === 1 && tasksTab}

      <ConfirmDialog
        open={deleteOpen}
        title='Delete Project'
        message={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false)
          toast.success('Project deleted')
          navigate('/projects')
        }}
        confirmColor='error'
        confirmText='Delete'
      />
    </Box>
  )
}

export default ProjectDetailPage
