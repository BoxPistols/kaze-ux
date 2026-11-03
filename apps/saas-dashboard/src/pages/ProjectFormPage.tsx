import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Box, Grid } from '@mui/material'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CustomSelect } from '@/components/Form/CustomSelect'
import { CustomTextField } from '@/components/Form/CustomTextField'
import { DateTimePicker } from '@/components/Form/DateTimePicker'
import type { Dayjs } from '@/components/Form/DateTimePicker'
import { MultiSelectAutocomplete } from '@/components/Form/MultiSelectAutocomplete'
import { SaveButton } from '@/components/ui/button/saveButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/icon-button'
import { PageHeader } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'

import { teamMembers } from '~/data/team'

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'on-hold', label: 'On Hold' },
]

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

const teamOptions = teamMembers.map((m) => ({
  value: m.id,
  label: m.name,
}))

const tagOptions = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'design', label: 'Design' },
  { value: 'devops', label: 'DevOps' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'security', label: 'Security' },
  { value: 'data', label: 'Data' },
  { value: 'ai', label: 'AI' },
]

export const ProjectFormPage = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('draft')
  const [priority, setPriority] = useState('medium')
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs())
  const [dueDate, setDueDate] = useState<Dayjs | null>(dayjs().add(3, 'month'))
  const [budget, setBudget] = useState('')
  const [team, setTeam] = useState<{ value: string | number; label: string }[]>(
    []
  )
  const [tags, setTags] = useState<{ value: string | number; label: string }[]>(
    []
  )

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Project name is required')
      return
    }
    toast.success(`Project "${name}" created successfully`)
    navigate('/projects')
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <IconButton
          onClick={() => navigate('/projects')}
          tooltip='Back to projects'
          aria-label='Back to projects'>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <PageHeader
        title='New Project'
        subtitle='Create a new project and assign team members.'
      />

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                label='Project Name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                placeholder='Enter project name'
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                label='Description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder='Describe the project scope and goals'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomSelect
                label='Status'
                value={status}
                onChange={(e) => setStatus(e.target.value as string)}
                options={statusOptions}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomSelect
                label='Priority'
                value={priority}
                onChange={(e) => setPriority(e.target.value as string)}
                options={priorityOptions}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DateTimePicker
                label='Start Date'
                value={startDate}
                onChange={setStartDate}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DateTimePicker
                label='Due Date'
                value={dueDate}
                onChange={setDueDate}
                minDateTime={startDate || undefined}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                label='Budget (¥)'
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                fullWidth
                placeholder='e.g. 5000000'
                type='number'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <MultiSelectAutocomplete
                label='Team Members'
                options={teamOptions}
                value={team}
                onChange={(_e, value) => setTeam(value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <MultiSelectAutocomplete
                label='Tags'
                options={tagOptions}
                value={tags}
                onChange={(_e, value) => setTags(value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2,
                  mt: 1,
                }}>
                <SaveButton onClick={handleSave} label='Create Project' />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}
