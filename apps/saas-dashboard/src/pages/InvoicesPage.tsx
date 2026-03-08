import AddIcon from '@mui/icons-material/Add'
import SendIcon from '@mui/icons-material/Send'
import { Box } from '@mui/material'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { LoadingButton } from '@/components/ui/button/loadingButton'
import { ActionMenu } from '@/components/ui/menu'
import { ResourceTable } from '@/components/ui/table'
import { StatusTag } from '@/components/ui/tag'
import type { StatusType } from '@/components/ui/tag'
import { PageHeader } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'

import type { GridColDef } from '@mui/x-data-grid'
import type { Invoice, InvoiceStatus } from '~/data/invoices'

import { invoices } from '~/data/invoices'

const statusMap: Record<InvoiceStatus, StatusType> = {
  paid: 'approved',
  pending: 'pending',
  overdue: 'rejected',
  draft: 'draft',
  cancelled: 'inactive',
}

const InvoicesPage = () => {
  const [sending, setSending] = useState<string | null>(null)

  const handleSend = (invoice: Invoice) => {
    setSending(invoice.id)
    setTimeout(() => {
      setSending(null)
      toast.success(`Invoice ${invoice.number} sent to ${invoice.client}`)
    }, 1500)
  }

  const columns: GridColDef<Invoice>[] = [
    { field: 'number', headerName: 'Invoice #', width: 150 },
    { field: 'client', headerName: 'Client', flex: 1, minWidth: 150 },
    { field: 'project', headerName: 'Project', flex: 1, minWidth: 150 },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 130,
      valueFormatter: (value: number) => `¥${value.toLocaleString()}`,
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
            startIcon={<SendIcon />}
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

      <ResourceTable
        columns={columns}
        rows={invoices}
        showQuickFilter
        pageSizeOptions={[10, 25]}
        initialPageSize={10}
        autoHeight
      />
    </Box>
  )
}

export default InvoicesPage
