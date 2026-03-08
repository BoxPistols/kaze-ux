import AddIcon from '@mui/icons-material/Add'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import SendIcon from '@mui/icons-material/Send'
import TimerIcon from '@mui/icons-material/Timer'
import { Box, Grid, Typography } from '@mui/material'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { LoadingButton } from '@/components/ui/button/loadingButton'
import { Card, CardContent } from '@/components/ui/Card'
import { CustomChip } from '@/components/ui/chip'
import { ActionMenu } from '@/components/ui/menu'
import { ResourceTable } from '@/components/ui/table'
import { StatusTag } from '@/components/ui/tag'
import type { StatusType } from '@/components/ui/tag'
import { PageHeader } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'

import type { GridColDef } from '@mui/x-data-grid'
import type { Invoice, InvoiceStatus } from '~/data/invoices'

import { invoices } from '~/data/invoices'

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
]

const InvoicesPage = () => {
  const [sending, setSending] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')

  const filteredInvoices = useMemo(
    () =>
      statusFilter === 'all'
        ? invoices
        : invoices.filter((i) => i.status === statusFilter),
    [statusFilter]
  )

  const totalPaid = useMemo(
    () =>
      invoices
        .filter((i) => i.status === 'paid')
        .reduce((sum, i) => sum + i.amount, 0),
    []
  )

  const totalPending = useMemo(
    () =>
      invoices
        .filter((i) => i.status === 'pending')
        .reduce((sum, i) => sum + i.amount, 0),
    []
  )

  const totalOverdue = useMemo(
    () =>
      invoices
        .filter((i) => i.status === 'overdue')
        .reduce((sum, i) => sum + i.amount, 0),
    []
  )

  const handleSend = (invoice: Invoice) => {
    setSending(invoice.id)
    setTimeout(() => {
      setSending(null)
      toast.success(`Invoice ${invoice.number} sent to ${invoice.client}`)
    }, 1500)
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
              onClick: () => toast.info(`Edit ${params.row.number}`),
            },
            {
              id: 'delete',
              label: 'Delete',
              danger: true,
              onClick: () => toast.error(`Delete ${params.row.number}`),
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
          <Button
            variant='default'
            onClick={() => toast.info('Create invoice')}>
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
                  {invoices.length}
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
    </Box>
  )
}

export default InvoicesPage
