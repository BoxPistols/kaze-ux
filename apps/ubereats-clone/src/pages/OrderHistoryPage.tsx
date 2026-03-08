import { Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'

import { ActionMenu } from '@/components/ui/menu'
import { ResourceTable } from '@/components/ui/table'
import { StatusTag } from '@/components/ui/tag'
import type { StatusType } from '@/components/ui/tag'
import { PageHeader } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'

import type { GridColDef, GridRowParams } from '@mui/x-data-grid'
import type { Order, OrderStatus } from '~/data/orders'

import { orders } from '~/data/orders'

const statusMap: Record<OrderStatus, StatusType> = {
  preparing: 'pending',
  'on-the-way': 'active',
  delivered: 'approved',
  cancelled: 'rejected',
}

const OrderHistoryPage = () => {
  const navigate = useNavigate()

  const columns: GridColDef<Order>[] = [
    {
      field: 'id',
      headerName: 'Order #',
      width: 100,
      renderCell: (params) => params.value.toUpperCase(),
    },
    {
      field: 'restaurantName',
      headerName: 'Restaurant',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'items',
      headerName: 'Items',
      flex: 1,
      minWidth: 200,
      renderCell: (params) =>
        params.value
          .map((i: Order['items'][0]) => `${i.quantity}x ${i.name}`)
          .join(', '),
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 120,
      renderCell: (params) =>
        `${(params.value + params.row.deliveryFee).toLocaleString()}`,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <StatusTag
          text={params.value}
          status={statusMap[params.value as OrderStatus]}
        />
      ),
    },
    {
      field: 'orderDate',
      headerName: 'Date',
      width: 160,
      renderCell: (params) =>
        new Date(params.value).toLocaleString('ja-JP', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
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
              id: 'track',
              label: 'Track Order',
              onClick: () => navigate(`/orders/${params.row.id}`),
            },
            {
              id: 'reorder',
              label: 'Reorder',
              onClick: () =>
                toast.info(`Reordering from ${params.row.restaurantName}...`),
            },
            {
              id: 'help',
              label: 'Get Help',
              onClick: () => toast.info('Opening help...'),
            },
          ]}
          size='small'
        />
      ),
    },
  ]

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title='Order History'
        subtitle='View your past and current orders.'
      />

      <ResourceTable
        columns={columns}
        rows={orders}
        showQuickFilter
        onRowClick={(params: GridRowParams<Order>) =>
          navigate(`/orders/${params.row.id}`)
        }
        pageSizeOptions={[5, 10]}
        initialPageSize={10}
        density='standard'
        autoHeight
      />
    </Box>
  )
}

export default OrderHistoryPage
