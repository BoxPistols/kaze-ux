import AddIcon from '@mui/icons-material/Add'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import { Box, Grid, Typography } from '@mui/material'
import { useState } from 'react'

import { CustomSelect } from '@/components/Form/CustomSelect'
import { CustomTextField } from '@/components/Form/CustomTextField'
import { UserAvatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ConfirmDialog, FormDialog } from '@/components/ui/dialog'
import { IconButton } from '@/components/ui/icon-button'
import { ActionMenu } from '@/components/ui/menu'
import { StatusTag } from '@/components/ui/tag'
import type { StatusType } from '@/components/ui/tag'
import { PageHeader } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'

import type { TeamMember } from '~/data/team'

import { teamMembers as initialMembers } from '~/data/team'

type MemberStatus = TeamMember['status']

const statusMap: Record<string, StatusType> = {
  online: 'active',
  offline: 'inactive',
  busy: 'rejected',
  away: 'pending',
}

const statusOptions: { value: MemberStatus; label: string }[] = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'busy', label: 'Busy' },
  { value: 'away', label: 'Away' },
]

const emptyForm = {
  name: '',
  email: '',
  role: '',
  department: '',
  phone: '',
  status: 'online' as MemberStatus,
}

export const TeamPage = () => {
  const [teamList, setTeamList] = useState<TeamMember[]>(initialMembers)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null)
  const [form, setForm] = useState(emptyForm)

  const openAdd = () => {
    setEditTarget(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (member: TeamMember) => {
    setEditTarget(member)
    setForm({
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department,
      phone: member.phone,
      status: member.status,
    })
    setFormOpen(true)
  }

  const openDelete = (member: TeamMember) => {
    setDeleteTarget(member)
    setDeleteOpen(true)
  }

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required')
      return
    }

    if (editTarget) {
      setTeamList((prev) =>
        prev.map((m) => (m.id === editTarget.id ? { ...m, ...form } : m))
      )
      toast.success(`Updated member: ${form.name}`)
    } else {
      const newMember: TeamMember = {
        id: `t${Date.now()}`,
        ...form,
        joinedAt: new Date().toISOString().split('T')[0],
      }
      setTeamList((prev) => [newMember, ...prev])
      toast.success(`Added member: ${form.name}`)
    }
    setFormOpen(false)
  }

  const handleDelete = () => {
    if (deleteTarget) {
      setTeamList((prev) => prev.filter((m) => m.id !== deleteTarget.id))
      toast.success(`Removed member: ${deleteTarget.name}`)
    }
    setDeleteOpen(false)
    setDeleteTarget(null)
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title='Team'
        subtitle='Your team members and their current status.'>
        <Button variant='default' onClick={openAdd}>
          <AddIcon sx={{ fontSize: 18, mr: 0.5 }} aria-hidden='true' /> Add
          Member
        </Button>
      </PageHeader>

      <Grid container spacing={3}>
        {teamList.map((member) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={member.id}>
            <Card>
              <CardContent className='p-4'>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    mb: 2,
                  }}>
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
                  <ActionMenu
                    items={[
                      {
                        id: 'edit',
                        label: 'Edit',
                        onClick: () => openEdit(member),
                      },
                      {
                        id: 'delete',
                        label: 'Remove',
                        danger: true,
                        onClick: () => openDelete(member),
                      },
                    ]}
                    size='small'
                  />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}>
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

      <FormDialog
        open={formOpen}
        title={editTarget ? 'Edit Member' : 'Add Member'}
        onSubmit={handleSubmit}
        onCancel={() => setFormOpen(false)}
        submitText={editTarget ? 'Update' : 'Add'}
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              label='Email'
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              required
              fullWidth
              type='email'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              label='Phone'
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              label='Role'
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              label='Department'
              value={form.department}
              onChange={(e) =>
                setForm((f) => ({ ...f, department: e.target.value }))
              }
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomSelect
              label='Status'
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as MemberStatus,
                }))
              }
              options={statusOptions}
              fullWidth
            />
          </Grid>
        </Grid>
      </FormDialog>

      <ConfirmDialog
        open={deleteOpen}
        title='Remove Member'
        message={`Are you sure you want to remove "${deleteTarget?.name}" from the team?`}
        onCancel={() => {
          setDeleteOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
        confirmColor='error'
        confirmText='Remove'
      />
    </Box>
  )
}
