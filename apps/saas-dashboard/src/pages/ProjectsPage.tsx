import AddIcon from '@mui/icons-material/Add'
import { Box, Grid, LinearProgress } from '@mui/material'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { CustomSelect } from '@/components/Form/CustomSelect'
import { CustomTextField } from '@/components/Form/CustomTextField'
import { UserAvatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/Button'
import { CustomChip } from '@/components/ui/chip'
import { ConfirmDialog, FormDialog } from '@/components/ui/dialog'
import { ActionMenu } from '@/components/ui/menu'
import { ResourceTable } from '@/components/ui/table'
import { StatusTag } from '@/components/ui/tag'
import type { StatusType } from '@/components/ui/tag'
import { PageHeader } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'

import type { GridColDef, GridRowParams } from '@mui/x-data-grid'
import type { Project, ProjectStatus, ProjectPriority } from '~/data/projects'

import { projects as initialProjects } from '~/data/projects'

const statusMap: Record<ProjectStatus, StatusType> = {
  active: 'active',
  draft: 'draft',
  completed: 'approved',
  'on-hold': 'pending',
  cancelled: 'rejected',
}

const filterOptions: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'completed', label: 'Done' },
]

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
]

const priorityOptions: { value: ProjectPriority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const emptyForm = {
  name: '',
  description: '',
  status: 'active' as ProjectStatus,
  priority: 'medium' as ProjectPriority,
  owner: '',
  dueDate: '',
}

export const ProjectsPage = () => {
  const navigate = useNavigate()
  const [projectList, setProjectList] = useState<Project[]>(initialProjects)
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [form, setForm] = useState(emptyForm)

  const filteredProjects = useMemo(() => {
    if (filter === 'all') return projectList
    return projectList.filter((p) => p.status === filter)
  }, [filter, projectList])

  const openEdit = (project: Project) => {
    setEditTarget(project)
    setForm({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      owner: project.owner,
      dueDate: project.dueDate,
    })
    setFormOpen(true)
  }

  const openDelete = (project: Project) => {
    setDeleteTarget(project)
    setDeleteOpen(true)
  }

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Project name is required')
      return
    }

    if (editTarget) {
      setProjectList((prev) =>
        prev.map((p) => (p.id === editTarget.id ? { ...p, ...form } : p))
      )
      toast.success(`Updated project: ${form.name}`)
    }
    setFormOpen(false)
  }

  const handleDelete = () => {
    if (deleteTarget) {
      setProjectList((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      toast.success(`Deleted project: ${deleteTarget.name}`)
    }
    setDeleteOpen(false)
    setDeleteTarget(null)
  }

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
        <CustomChip
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
              onClick: () => openEdit(params.row),
            },
            {
              id: 'delete',
              label: 'Delete',
              danger: true,
              onClick: () => openDelete(params.row),
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

      <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
        {filterOptions.map((opt) => (
          <CustomChip
            key={opt.value}
            label={opt.label}
            onClick={() => setFilter(opt.value)}
            variant={filter === opt.value ? 'filled' : 'outlined'}
            color={filter === opt.value ? 'primary' : 'default'}
            sx={{
              cursor: 'pointer',
              fontWeight: filter === opt.value ? 600 : 400,
            }}
          />
        ))}
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

      <FormDialog
        open={formOpen}
        title='Edit Project'
        onSubmit={handleSubmit}
        onCancel={() => setFormOpen(false)}
        submitText='Update'
        maxWidth='sm'
        fullWidth>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CustomTextField
              label='Name'
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomTextField
              label='Description'
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomSelect
              label='Status'
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as ProjectStatus,
                }))
              }
              options={statusOptions}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomSelect
              label='Priority'
              value={form.priority}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  priority: e.target.value as ProjectPriority,
                }))
              }
              options={priorityOptions}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              label='Owner'
              value={form.owner}
              onChange={(e) =>
                setForm((f) => ({ ...f, owner: e.target.value }))
              }
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              label='Due Date'
              value={form.dueDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, dueDate: e.target.value }))
              }
              fullWidth
              type='date'
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
        </Grid>
      </FormDialog>

      <ConfirmDialog
        open={deleteOpen}
        title='Delete Project'
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        onCancel={() => {
          setDeleteOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
        confirmColor='error'
        confirmText='Delete'
      />
    </Box>
  )
}
