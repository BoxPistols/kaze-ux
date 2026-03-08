import AddIcon from '@mui/icons-material/Add'
import { Box, LinearProgress, Chip } from '@mui/material'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { UserAvatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/Button'
import { ActionMenu } from '@/components/ui/menu'
import { ResourceTable } from '@/components/ui/table'
import { StatusTag } from '@/components/ui/tag'
import type { StatusType } from '@/components/ui/tag'
import { PageHeader } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'
import { ToggleButtonGroup } from '@/components/ui/toggle-button'

import type { GridColDef, GridRowParams } from '@mui/x-data-grid'
import type { Project, ProjectStatus } from '~/data/projects'

import { projects } from '~/data/projects'

const statusMap: Record<ProjectStatus, StatusType> = {
  active: 'active',
  draft: 'draft',
  completed: 'approved',
  'on-hold': 'pending',
  cancelled: 'rejected',
}

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'completed', label: 'Done' },
]

const ProjectsPage = () => {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<string | string[] | null>('all')

  const filteredProjects = useMemo(() => {
    if (!filter || filter === 'all') return projects
    return projects.filter((p) => p.status === filter)
  }, [filter])

  const columns: GridColDef<Project>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1.5,
      minWidth: 180,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <StatusTag
          text={params.value}
          status={statusMap[params.value as ProjectStatus]}
        />
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size='small'
          color={
            params.value === 'critical'
              ? 'error'
              : params.value === 'high'
                ? 'warning'
                : params.value === 'medium'
                  ? 'info'
                  : 'default'
          }
          variant='outlined'
        />
      ),
    },
    {
      field: 'owner',
      headerName: 'Owner',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UserAvatar name={params.value} size='small' />
          {params.value}
        </Box>
      ),
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 120,
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 150,
      renderCell: (params) => (
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <LinearProgress
            variant='determinate'
            value={params.value}
            sx={{ flex: 1, height: 6, borderRadius: 3 }}
          />
          <span style={{ fontSize: '0.75rem', minWidth: 32 }}>
            {params.value}%
          </span>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <ActionMenu
          items={[
            {
              id: 'view',
              label: 'View Details',
              onClick: () => navigate(`/projects/${params.row.id}`),
            },
            {
              id: 'edit',
              label: 'Edit',
              onClick: () => toast.info(`Edit ${params.row.name}`),
            },
            {
              id: 'delete',
              label: 'Delete',
              danger: true,
              onClick: () => toast.error(`Delete ${params.row.name}`),
            },
          ]}
          size='small'
        />
      ),
    },
  ]

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title='Projects'
        subtitle='Manage and track all your projects.'>
        <Button variant='default' onClick={() => navigate('/projects/new')}>
          <AddIcon sx={{ fontSize: 18, mr: 0.5 }} aria-hidden='true' /> New
          Project
        </Button>
      </PageHeader>

      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          options={filterOptions}
          value={filter}
          onChange={setFilter}
          size='small'
          exclusive
        />
      </Box>

      <ResourceTable
        columns={columns}
        rows={filteredProjects}
        showQuickFilter
        onRowClick={(params: GridRowParams<Project>) =>
          navigate(`/projects/${params.row.id}`)
        }
        pageSizeOptions={[10, 20]}
        initialPageSize={10}
        density='standard'
        autoHeight
      />
    </Box>
  )
}

export default ProjectsPage
