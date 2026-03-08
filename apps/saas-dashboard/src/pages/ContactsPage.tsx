import AddIcon from '@mui/icons-material/Add'
import ContactsIcon from '@mui/icons-material/Contacts'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import { Box, Grid, Typography } from '@mui/material'
import { useMemo, useState } from 'react'

import { CustomSelect } from '@/components/Form/CustomSelect'
import { CustomTextField } from '@/components/Form/CustomTextField'
import { CustomTable } from '@/components/Table'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ConfirmDialog, FormDialog } from '@/components/ui/dialog'
import { PageHeader } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'

import type { Contact, ContactStatus } from '~/data/contacts'

import { contacts as initialContacts } from '~/data/contacts'

const statusOptions: { value: ContactStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'lead', label: 'Lead' },
  { value: 'prospect', label: 'Prospect' },
]

const columns = [
  { accessor: 'name', header: 'Name', sortable: true },
  { accessor: 'email', header: 'Email', sortable: true },
  { accessor: 'company', header: 'Company', sortable: true },
  { accessor: 'role', header: 'Role' },
  { accessor: 'status', header: 'Status', sortable: true },
  { accessor: 'lastContact', header: 'Last Contact', sortable: true },
]

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  role: '',
  status: 'lead' as ContactStatus,
  notes: '',
}

export const ContactsPage = () => {
  const [contactList, setContactList] = useState<Contact[]>(initialContacts)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Contact | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null)
  const [form, setForm] = useState(emptyForm)

  const totalContacts = contactList.length
  const activeContacts = useMemo(
    () => contactList.filter((c) => c.status === 'active').length,
    [contactList]
  )
  const leadsCount = useMemo(
    () => contactList.filter((c) => c.status === 'lead').length,
    [contactList]
  )

  const statCards = useMemo(
    () => [
      {
        label: 'Total Contacts',
        value: totalContacts,
        icon: <ContactsIcon fontSize='small' aria-hidden='true' />,
        bgColor: 'rgba(38, 66, 190, 0.08)',
        color: 'primary.main',
      },
      {
        label: 'Active',
        value: activeContacts,
        icon: <PersonAddIcon fontSize='small' aria-hidden='true' />,
        bgColor: 'rgba(70, 171, 74, 0.08)',
        color: 'success.main',
      },
      {
        label: 'Leads',
        value: leadsCount,
        icon: <PersonOffIcon fontSize='small' aria-hidden='true' />,
        bgColor: 'rgba(235, 129, 23, 0.08)',
        color: 'warning.main',
      },
    ],
    [totalContacts, activeContacts, leadsCount]
  )

  const tableData = contactList.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    company: c.company,
    role: c.role,
    status: c.status,
    lastContact: c.lastContact,
  }))

  const openAdd = () => {
    setEditTarget(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (row: Record<string, string | number | boolean>) => {
    const contact = contactList.find((c) => c.id === row.id)
    if (!contact) return
    setEditTarget(contact)
    setForm({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      role: contact.role,
      status: contact.status,
      notes: contact.notes,
    })
    setFormOpen(true)
  }

  const openDelete = (row: Record<string, string | number | boolean>) => {
    const contact = contactList.find((c) => c.id === row.id)
    if (contact) {
      setDeleteTarget(contact)
      setDeleteOpen(true)
    }
  }

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required')
      return
    }

    if (editTarget) {
      setContactList((prev) =>
        prev.map((c) =>
          c.id === editTarget.id
            ? { ...c, ...form, tags: c.tags, lastContact: c.lastContact }
            : c
        )
      )
      toast.success(`Updated contact: ${form.name}`)
    } else {
      const newContact: Contact = {
        id: `c${Date.now()}`,
        ...form,
        lastContact: new Date().toISOString().split('T')[0],
        tags: [],
      }
      setContactList((prev) => [newContact, ...prev])
      toast.success(`Added contact: ${form.name}`)
    }
    setFormOpen(false)
  }

  const handleDelete = () => {
    if (deleteTarget) {
      setContactList((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      toast.success(`Deleted contact: ${deleteTarget.name}`)
    }
    setDeleteOpen(false)
    setDeleteTarget(null)
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title='Contacts'
        subtitle='Manage your CRM contacts and leads.'>
        <Button variant='default' onClick={openAdd}>
          <AddIcon sx={{ fontSize: 18, mr: 0.5 }} aria-hidden='true' /> Add
          Contact
        </Button>
      </PageHeader>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {statCards.map((stat) => (
          <Grid size={{ xs: 12, sm: 4 }} key={stat.label}>
            <Card>
              <CardContent
                sx={{
                  py: 2.5,
                  px: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  '&:last-child': { pb: 2.5 },
                }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: stat.bgColor,
                    color: stat.color,
                    flexShrink: 0,
                  }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography
                    variant='h5'
                    sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {stat.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <CustomTable
        columns={columns}
        data={tableData}
        showCRUD
        searchable
        onView={(row) => toast.info(`View: ${row.name}`)}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      <FormDialog
        open={formOpen}
        title={editTarget ? 'Edit Contact' : 'Add Contact'}
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
              label='Company'
              value={form.company}
              onChange={(e) =>
                setForm((f) => ({ ...f, company: e.target.value }))
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
          <Grid size={{ xs: 12 }}>
            <CustomSelect
              label='Status'
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as ContactStatus,
                }))
              }
              options={statusOptions}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomTextField
              label='Notes'
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </FormDialog>

      <ConfirmDialog
        open={deleteOpen}
        title='Delete Contact'
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
