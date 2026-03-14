import AddIcon from '@mui/icons-material/Add'
import AssignmentIcon from '@mui/icons-material/Assignment'
import ChatIcon from '@mui/icons-material/Chat'
import CloudIcon from '@mui/icons-material/Cloud'
import CodeIcon from '@mui/icons-material/Code'
import ExtensionIcon from '@mui/icons-material/Extension'
import PaymentIcon from '@mui/icons-material/Payment'
import SettingsIcon from '@mui/icons-material/Settings'
import StorageIcon from '@mui/icons-material/Storage'
import { Box, Grid, Typography } from '@mui/material'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { CustomSelect } from '@/components/Form/CustomSelect'
import { CustomTextField } from '@/components/Form/CustomTextField'
import { Button } from '@/components/ui/Button'
import { ServiceCard } from '@/components/ui/card/serviceCard'
import { ConnectionStatusChip } from '@/components/ui/chip'
import { ConfirmDialog, FormDialog } from '@/components/ui/dialog'
import { ActionMenu } from '@/components/ui/menu'
import { PageHeader } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'

import type { Integration, IntegrationStatus } from '~/data/integrations'

import { integrations as initialIntegrations } from '~/data/integrations'

const iconMap: Record<string, ReactNode> = {
  slack: <ChatIcon sx={{ fontSize: 32 }} aria-hidden='true' />,
  github: <CodeIcon sx={{ fontSize: 32 }} aria-hidden='true' />,
  aws: <CloudIcon sx={{ fontSize: 32 }} aria-hidden='true' />,
  jira: <AssignmentIcon sx={{ fontSize: 32 }} aria-hidden='true' />,
  'google-drive': <StorageIcon sx={{ fontSize: 32 }} aria-hidden='true' />,
  stripe: <PaymentIcon sx={{ fontSize: 32 }} aria-hidden='true' />,
  settings: <SettingsIcon sx={{ fontSize: 32 }} aria-hidden='true' />,
  extension: <ExtensionIcon sx={{ fontSize: 32 }} aria-hidden='true' />,
}

const iconOptions = [
  { value: 'extension', label: 'Extension' },
  { value: 'slack', label: 'Chat' },
  { value: 'github', label: 'Code' },
  { value: 'aws', label: 'Cloud' },
  { value: 'jira', label: 'Assignment' },
  { value: 'google-drive', label: 'Storage' },
  { value: 'stripe', label: 'Payment' },
  { value: 'settings', label: 'Settings' },
]

const categoryOptions = [
  { value: 'Communication', label: 'Communication' },
  { value: 'Development', label: 'Development' },
  { value: 'Infrastructure', label: 'Infrastructure' },
  { value: 'Project Management', label: 'Project Management' },
  { value: 'Storage', label: 'Storage' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Other', label: 'Other' },
]

const statusOptions: { value: IntegrationStatus; label: string }[] = [
  { value: 'connected', label: 'Connected' },
  { value: 'disconnected', label: 'Disconnected' },
  { value: 'pending', label: 'Pending' },
]

type FormState = {
  name: string
  description: string
  icon: string
  category: string
  status: IntegrationStatus
  apiKey: string
  webhookUrl: string
}

const emptyForm: FormState = {
  name: '',
  description: '',
  icon: 'extension',
  category: 'Other',
  status: 'disconnected',
  apiKey: '',
  webhookUrl: '',
}

export const IntegrationsPage = () => {
  const [integrationList, setIntegrationList] =
    useState<Integration[]>(initialIntegrations)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Integration | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Integration | null>(null)
  const [disconnectOpen, setDisconnectOpen] = useState(false)
  const [disconnectTarget, setDisconnectTarget] = useState<Integration | null>(
    null
  )
  const [form, setForm] = useState<FormState>(emptyForm)

  // --- Create ---
  const openAdd = () => {
    setEditTarget(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  // --- Update ---
  const openEdit = (integration: Integration) => {
    setEditTarget(integration)
    setForm({
      name: integration.name,
      description: integration.description,
      icon: integration.icon,
      category: integration.category,
      status: integration.status,
      apiKey: integration.apiKey ?? '',
      webhookUrl: integration.webhookUrl ?? '',
    })
    setFormOpen(true)
  }

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }

    if (editTarget) {
      setIntegrationList((prev) =>
        prev.map((i) =>
          i.id === editTarget.id
            ? {
                ...i,
                name: form.name,
                description: form.description,
                icon: form.icon,
                category: form.category,
                status: form.status,
                apiKey: form.apiKey || undefined,
                webhookUrl: form.webhookUrl || undefined,
                lastSync:
                  form.status === 'connected'
                    ? (i.lastSync ?? new Date().toISOString())
                    : form.status === 'disconnected'
                      ? undefined
                      : i.lastSync,
              }
            : i
        )
      )
      toast.success(`Updated integration: ${form.name}`)
    } else {
      const newIntegration: Integration = {
        id: `int${Date.now()}`,
        name: form.name,
        description: form.description,
        icon: form.icon,
        category: form.category,
        status: form.status,
        apiKey: form.apiKey || undefined,
        webhookUrl: form.webhookUrl || undefined,
        lastSync:
          form.status === 'connected' ? new Date().toISOString() : undefined,
      }
      setIntegrationList((prev) => [...prev, newIntegration])
      toast.success(`Added integration: ${form.name}`)
    }
    setFormOpen(false)
  }

  // --- Delete ---
  const openDelete = (integration: Integration) => {
    setDeleteTarget(integration)
    setDeleteOpen(true)
  }

  const handleDelete = () => {
    if (deleteTarget) {
      setIntegrationList((prev) => prev.filter((i) => i.id !== deleteTarget.id))
      toast.success(`Removed integration: ${deleteTarget.name}`)
    }
    setDeleteOpen(false)
    setDeleteTarget(null)
  }

  // --- Connect / Disconnect toggle ---
  const handleToggle = (integration: Integration) => {
    if (integration.status === 'connected') {
      setDisconnectTarget(integration)
      setDisconnectOpen(true)
    } else {
      setIntegrationList((prev) =>
        prev.map((i) =>
          i.id === integration.id
            ? {
                ...i,
                status: 'connected' as const,
                lastSync: new Date().toISOString(),
              }
            : i
        )
      )
      toast.success(`Connected to ${integration.name}`)
    }
  }

  const handleDisconnect = () => {
    if (disconnectTarget) {
      setIntegrationList((prev) =>
        prev.map((i) =>
          i.id === disconnectTarget.id
            ? { ...i, status: 'disconnected' as const, lastSync: undefined }
            : i
        )
      )
      toast.success(`Disconnected from ${disconnectTarget.name}`)
    }
    setDisconnectOpen(false)
    setDisconnectTarget(null)
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title='Integrations'
        subtitle='Connect your favorite tools and services.'>
        <Button variant='default' onClick={openAdd}>
          <AddIcon sx={{ fontSize: 18, mr: 0.5 }} aria-hidden='true' /> Add
          Integration
        </Button>
      </PageHeader>

      <Grid container spacing={3}>
        {integrationList.map((integration) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={integration.id}>
            <ServiceCard
              title={integration.name}
              description={integration.description}
              icon={iconMap[integration.icon] ?? iconMap.extension}
              connected={integration.status === 'connected'}
              error={integration.status === 'error'}
              onRegisterClick={() => handleToggle(integration)}
              registerButtonLabel={
                integration.status === 'connected' ? 'Disconnect' : 'Connect'
              }
              headerContent={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ConnectionStatusChip
                    connected={integration.status === 'connected'}
                    connectedLabel='Connected'
                    disconnectedLabel={
                      integration.status === 'error' ? 'Error' : 'Disconnected'
                    }
                  />
                  <ActionMenu
                    items={[
                      {
                        id: 'edit',
                        label: 'Settings',
                        onClick: () => openEdit(integration),
                      },
                      {
                        id: 'delete',
                        label: 'Remove',
                        danger: true,
                        onClick: () => openDelete(integration),
                      },
                    ]}
                    size='small'
                  />
                </Box>
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

      {/* Add / Edit FormDialog */}
      <FormDialog
        open={formOpen}
        title={editTarget ? 'Edit Integration' : 'Add Integration'}
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
              label='Icon'
              value={form.icon}
              onChange={(_e, v) => setForm((f) => ({ ...f, icon: String(v) }))}
              options={iconOptions}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomSelect
              label='Category'
              value={form.category}
              onChange={(_e, v) =>
                setForm((f) => ({ ...f, category: String(v) }))
              }
              options={categoryOptions}
              fullWidth
            />
          </Grid>
          {editTarget && (
            <Grid size={{ xs: 12 }}>
              <CustomSelect
                label='Status'
                value={form.status}
                onChange={(_e, v) =>
                  setForm((f) => ({
                    ...f,
                    status: String(v) as IntegrationStatus,
                  }))
                }
                options={statusOptions}
                fullWidth
              />
            </Grid>
          )}
          <Grid size={{ xs: 12 }}>
            <CustomTextField
              label='API Key'
              value={form.apiKey}
              onChange={(e) =>
                setForm((f) => ({ ...f, apiKey: e.target.value }))
              }
              fullWidth
              type='password'
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomTextField
              label='Webhook URL'
              value={form.webhookUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, webhookUrl: e.target.value }))
              }
              fullWidth
            />
          </Grid>
        </Grid>
      </FormDialog>

      {/* Delete ConfirmDialog */}
      <ConfirmDialog
        open={deleteOpen}
        title='Remove Integration'
        message={`Are you sure you want to remove "${deleteTarget?.name}"? This will permanently delete the integration and its configuration.`}
        onCancel={() => {
          setDeleteOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
        confirmColor='error'
        confirmText='Remove'
      />

      {/* Disconnect ConfirmDialog */}
      <ConfirmDialog
        open={disconnectOpen}
        title='Disconnect Integration'
        message={`Are you sure you want to disconnect "${disconnectTarget?.name}"? This may affect related automations.`}
        onCancel={() => {
          setDisconnectOpen(false)
          setDisconnectTarget(null)
        }}
        onConfirm={handleDisconnect}
        confirmColor='error'
        confirmText='Disconnect'
      />
    </Box>
  )
}
