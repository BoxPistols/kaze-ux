import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import { Box, Grid, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Card, CardContent } from '@/components/ui/Card'
import { CustomChip } from '@/components/ui/chip'
import { ActionMenu } from '@/components/ui/menu'
import { ResourceTable } from '@/components/ui/table'
import { StatusTag } from '@/components/ui/tag'
import type { StatusType } from '@/components/ui/tag'
import { toast } from '@/components/ui/toast'

import type { GridColDef, GridRowParams } from '@mui/x-data-grid'
import type { Order, OrderStatus } from '~/data/orders'

import { orders } from '~/data/orders'

const formatPrice = (price: number) => `¥${price.toLocaleString()}`

const statusMap: Record<OrderStatus, StatusType> = {
  preparing: 'pending',
  'on-the-way': 'active',
  delivered: 'approved',
  cancelled: 'rejected',
}

const statusFilters: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'on-the-way', label: 'On the Way' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const OrderHistoryPage = () => {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')

  const filteredOrders = useMemo(
    () =>
      statusFilter === 'all'
        ? orders
        : orders.filter((o) => o.status === statusFilter),
    [statusFilter]
  )

  const totalSpent = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'delivered')
        .reduce((sum, o) => sum + o.total + o.deliveryFee, 0),
    []
  )

  const activeOrders = orders.filter(
    (o) => o.status === 'preparing' || o.status === 'on-the-way'
  ).length

  const columns: GridColDef<Order>[] = [
    {
      field: 'id',
      headerName: 'Order #',
      width: 100,
      renderCell: (params) => (
        <Typography variant='body2' sx={{ fontWeight: 600 }}>
          {params.value.toUpperCase()}
        </Typography>
      ),
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
      renderCell: (params) => (
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {params.value
            .map((i: Order['items'][0]) => `${i.quantity}x ${i.name}`)
            .join(', ')}
        </Typography>
      ),
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 120,
      renderCell: (params) => (
        <Typography variant='body2' sx={{ fontWeight: 600 }}>
          {formatPrice(params.value + params.row.deliveryFee)}
        </Typography>
      ),
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
                toast.info(
                  `Reordering from ${params.row.restaurantName}...`
                ),
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
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, pt: 3, pb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant='h4'
          component='h1'
          sx={{
            fontWeight: 800,
            mb: 0.5,
            letterSpacing: '-0.02em',
          }}>
          Order History
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          View your past and current orders.
        </Typography>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
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
                  {orders.length}
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ fontWeight: 500 }}>
                  Total Orders
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
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
                <Typography
                  sx={{ fontWeight: 700, fontSize: '1.1rem' }}
                  aria-hidden='true'>
                  ¥
                </Typography>
              </Box>
              <Box>
                <Typography variant='h5' sx={{ fontWeight: 700 }}>
                  {formatPrice(totalSpent)}
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ fontWeight: 500 }}>
                  Total Spent
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
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
                <LocalShippingIcon aria-hidden='true' />
              </Box>
              <Box>
                <Typography variant='h5' sx={{ fontWeight: 700 }}>
                  {activeOrders}
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ fontWeight: 500 }}>
                  Active Orders
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
        rows={filteredOrders}
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
