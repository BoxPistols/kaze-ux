import AddIcon from '@mui/icons-material/Add'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import SendIcon from '@mui/icons-material/Send'
import TimerIcon from '@mui/icons-material/Timer'
import { Box, Grid, Typography } from '@mui/material'
import { useMemo, useState } from 'react'

import { CustomSelect } from '@/components/Form/CustomSelect'
import { CustomTextField } from '@/components/Form/CustomTextField'
import { Button } from '@/components/ui/Button'
import { LoadingButton } from '@/components/ui/button/loadingButton'
import { Card, CardContent } from '@/components/ui/Card'
import { CustomChip } from '@/components/ui/chip'
import { ConfirmDialog, FormDialog } from '@/components/ui/dialog'
import { ActionMenu } from '@/components/ui/menu'
import { ResourceTable } from '@/components/ui/table'
import { StatusTag } from '@/components/ui/tag'
import type { StatusType } from '@/components/ui/tag'
import { PageHeader } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'

import type { GridColDef } from '@mui/x-data-grid'
import type { Invoice, InvoiceStatus } from '~/data/invoices'

import { invoices as initialInvoices } from '~/data/invoices'

const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`

const statusMap: Record<InvoiceStatus, StatusType> = {
  paid: 'approved',
  pending: 'pending',
  overdue: 'rejected',
  draft: 'draft',
  cancelled: 'inactive',
}

const statusFilters: { value: InvoiceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'draft', label: 'Draft' },
  { value: 'cancelled', label: 'Cancelled' },
]

const statusOptions: { value: InvoiceStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
]

const emptyForm = {
  number: '',
  client: '',
  amount: '',
  status: 'draft' as InvoiceStatus,
  issueDate: '',
  dueDate: '',
  project: '',
  description: '',
}

export const InvoicesPage = () => {
  const [invoiceList, setInvoiceList] = useState<Invoice[]>(initialInvoices)
  const [sending, setSending] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Invoice | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null)
  const [form, setForm] = useState(emptyForm)

  const filteredInvoices = useMemo(
    () =>
      statusFilter === 'all'
        ? invoiceList
        : invoiceList.filter((i) => i.status === statusFilter),
    [statusFilter, invoiceList]
  )

  const totalPaid = useMemo(
    () =>
      invoiceList
        .filter((i) => i.status === 'paid')
        .reduce((sum, i) => sum + i.amount, 0),
    [invoiceList]
  )

  const totalPending = useMemo(
    () =>
      invoiceList
        .filter((i) => i.status === 'pending')
        .reduce((sum, i) => sum + i.amount, 0),
    [invoiceList]
  )

  const totalOverdue = useMemo(
    () =>
      invoiceList
        .filter((i) => i.status === 'overdue')
        .reduce((sum, i) => sum + i.amount, 0),
    [invoiceList]
  )

  const handleSend = (invoice: Invoice) => {
    setSending(invoice.id)
    setTimeout(() => {
      setSending(null)
      toast.success(`Invoice ${invoice.number} sent to ${invoice.client}`)
    }, 1500)
  }

  const openAdd = () => {
    setEditTarget(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (invoice: Invoice) => {
    setEditTarget(invoice)
    setForm({
      number: invoice.number,
      client: invoice.client,
      amount: String(invoice.amount),
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      project: invoice.project,
      description: invoice.description,
    })
    setFormOpen(true)
  }

  const openDelete = (invoice: Invoice) => {
    setDeleteTarget(invoice)
    setDeleteOpen(true)
  }

  const handleSubmit = () => {
    if (!form.number.trim() || !form.client.trim()) {
      toast.error('Invoice number and client are required')
      return
    }

    const amount = Number(form.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const number = form.number.trim()
    const client = form.client.trim()

    if (editTarget) {
      setInvoiceList((prev) =>
        prev.map((inv) =>
          inv.id === editTarget.id
            ? { ...inv, ...form, number, client, amount }
            : inv
        )
      )
      toast.success(`Updated invoice: ${number}`)
    } else {
      const newInvoice: Invoice = {
        id: `inv${Date.now()}`,
        ...form,
        number,
        client,
        amount,
      }
      setInvoiceList((prev) => [newInvoice, ...prev])
      toast.success(`Created invoice: ${form.number}`)
    }
    setFormOpen(false)
  }

  const handleDelete = () => {
    if (deleteTarget) {
      setInvoiceList((prev) => prev.filter((inv) => inv.id !== deleteTarget.id))
      toast.success(`Deleted invoice: ${deleteTarget.number}`)
    }
    setDeleteOpen(false)
    setDeleteTarget(null)
  }

  const columns: GridColDef<Invoice>[] = [
    {
      field: 'number',
      headerName: 'Invoice #',
      width: 150,
      renderCell: (params) => (
        <Typography variant='body2' sx={{ fontWeight: 600 }}>
          {params.value}
        </Typography>
      ),
    },
    { field: 'client', headerName: 'Client', flex: 1, minWidth: 150 },
    { field: 'project', headerName: 'Project', flex: 1, minWidth: 150 },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 130,
      renderCell: (params) => (
        <Typography variant='body2' sx={{ fontWeight: 600 }}>
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <StatusTag
          text={params.value}
          status={statusMap[params.value as InvoiceStatus]}
        />
      ),
    },
    { field: 'issueDate', headerName: 'Issue Date', width: 120 },
    { field: 'dueDate', headerName: 'Due Date', width: 120 },
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
              id: 'send',
              label: 'Send',
              onClick: () => handleSend(params.row),
            },
            {
              id: 'download',
              label: 'Download PDF',
              onClick: () => toast.info(`Download ${params.row.number}`),
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
      <PageHeader title='Invoices' subtitle='Manage billing and payments.'>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <LoadingButton
            loading={sending !== null}
            loadingText='Sending...'
            variant='outlined'
            onClick={() => toast.info('Send all pending invoices')}
            startIcon={<SendIcon aria-hidden='true' />}
            size='small'>
            Send All Pending
          </LoadingButton>
          <Button variant='default' onClick={openAdd}>
            <AddIcon sx={{ fontSize: 18, mr: 0.5 }} aria-hidden='true' /> New
            Invoice
          </Button>
        </Box>
      </PageHeader>

      {/* Summary Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 2.5,
                px: 3,
              }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  flexShrink: 0,
                }}>
                <ReceiptLongIcon aria-hidden='true' />
              </Box>
              <Box>
                <Typography variant='h5' sx={{ fontWeight: 700 }}>
                  {invoiceList.length}
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ fontWeight: 500 }}>
                  Total Invoices
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 2.5,
                px: 3,
              }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: 'success.main',
                  color: '#fff',
                  flexShrink: 0,
                }}>
                <AttachMoneyIcon aria-hidden='true' />
              </Box>
              <Box>
                <Typography variant='h5' sx={{ fontWeight: 700 }}>
                  {formatCurrency(totalPaid)}
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ fontWeight: 500 }}>
                  Paid
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 2.5,
                px: 3,
              }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: 'warning.main',
                  color: '#fff',
                  flexShrink: 0,
                }}>
                <TimerIcon aria-hidden='true' />
              </Box>
              <Box>
                <Typography variant='h5' sx={{ fontWeight: 700 }}>
                  {formatCurrency(totalPending)}
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ fontWeight: 500 }}>
                  Pending
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 2.5,
                px: 3,
              }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: 'error.main',
                  color: '#fff',
                  flexShrink: 0,
                }}>
                <ErrorOutlineIcon aria-hidden='true' />
              </Box>
              <Box>
                <Typography variant='h5' sx={{ fontWeight: 700 }}>
                  {formatCurrency(totalOverdue)}
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ fontWeight: 500 }}>
                  Overdue
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Filter */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
        {statusFilters.map((filter) => (
          <CustomChip
            key={filter.value}
            label={filter.label}
            onClick={() => setStatusFilter(filter.value)}
            variant={statusFilter === filter.value ? 'filled' : 'outlined'}
            color={statusFilter === filter.value ? 'primary' : 'default'}
            sx={{
              cursor: 'pointer',
              fontWeight: statusFilter === filter.value ? 600 : 400,
            }}
          />
        ))}
      </Box>

      <ResourceTable
        columns={columns}
        rows={filteredInvoices}
        showQuickFilter
        pageSizeOptions={[10, 25]}
        initialPageSize={10}
        autoHeight
      />

      <FormDialog
        open={formOpen}
        title={editTarget ? 'Edit Invoice' : 'New Invoice'}
        onSubmit={handleSubmit}
        onCancel={() => setFormOpen(false)}
        submitText={editTarget ? 'Update' : 'Create'}
        maxWidth='sm'
        fullWidth>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              label='Invoice Number'
              value={form.number}
              onChange={(e) =>
                setForm((f) => ({ ...f, number: e.target.value }))
              }
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              label='Client'
              value={form.client}
              onChange={(e) =>
                setForm((f) => ({ ...f, client: e.target.value }))
              }
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              label='Amount (¥)'
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
              required
              fullWidth
              type='number'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomSelect
              label='Status'
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as InvoiceStatus,
                }))
              }
              options={statusOptions}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              label='Issue Date'
              value={form.issueDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, issueDate: e.target.value }))
              }
              fullWidth
              type='date'
              slotProps={{ inputLabel: { shrink: true } }}
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
          <Grid size={{ xs: 12 }}>
            <CustomTextField
              label='Project'
              value={form.project}
              onChange={(e) =>
                setForm((f) => ({ ...f, project: e.target.value }))
              }
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
        </Grid>
      </FormDialog>

      <ConfirmDialog
        open={deleteOpen}
        title='Delete Invoice'
        message={`Are you sure you want to delete "${deleteTarget?.number}"?`}
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
