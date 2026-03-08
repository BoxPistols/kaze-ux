import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PhoneIcon from '@mui/icons-material/Phone'
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'

import { UserAvatar } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { NotFoundView } from '@/components/ui/feedback'
import { IconButton } from '@/components/ui/icon-button'
import { StatusTag } from '@/components/ui/tag'
import type { StatusType } from '@/components/ui/tag'
import { toast } from '@/components/ui/toast'

import type { OrderStatus } from '~/data/orders'

import { orders } from '~/data/orders'

const statusMap: Record<OrderStatus, StatusType> = {
  preparing: 'pending',
  'on-the-way': 'active',
  delivered: 'approved',
  cancelled: 'rejected',
}

const steps = ['Order Placed', 'Preparing', 'On the Way', 'Delivered']

const getActiveStep = (status: OrderStatus) => {
  switch (status) {
    case 'preparing':
      return 1
    case 'on-the-way':
      return 2
    case 'delivered':
      return 4
    case 'cancelled':
      return -1
    default:
      return 0
  }
}

const OrderTrackingPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const order = orders.find((o) => o.id === id)

  if (!order) return <NotFoundView homePath='/orders' />

  const formatPrice = (price: number) => `${price.toLocaleString()}`
  const activeStep = getActiveStep(order.status)

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton
          onClick={() => navigate('/orders')}
          tooltip='Back to orders'>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 700 }}>
            Order #{order.id.toUpperCase()}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {order.restaurantName}
          </Typography>
        </Box>
        <StatusTag text={order.status} status={statusMap[order.status]} />
      </Box>

      {order.status !== 'cancelled' && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      )}

      {order.status === 'cancelled' && (
        <Card sx={{ mb: 3, borderColor: 'error.main' }}>
          <CardContent>
            <Typography
              variant='body1'
              color='error.main'
              sx={{ fontWeight: 500, textAlign: 'center' }}>
              This order has been cancelled
            </Typography>
          </CardContent>
        </Card>
      )}

      {order.driverName && order.status === 'on-the-way' && (
        <Card sx={{ mb: 3 }}>
          <CardHeader>
            <CardTitle>Your Driver</CardTitle>
          </CardHeader>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <UserAvatar
                name={order.driverName}
                size='medium'
                color='primary'
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                  {order.driverName}
                </Typography>
                {order.driverPhone && (
                  <Typography variant='body2' color='text.secondary'>
                    {order.driverPhone}
                  </Typography>
                )}
              </Box>
              {order.driverPhone && (
                <IconButton
                  onClick={() => toast.info(`Calling ${order.driverName}...`)}
                  tooltip='Call driver'>
                  <PhoneIcon />
                </IconButton>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 3 }}>
        <CardHeader>
          <CardTitle>Delivery Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant='body2' color='text.secondary'>
                Delivery Address
              </Typography>
              <Typography variant='body2'>{order.deliveryAddress}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant='body2' color='text.secondary'>
                Estimated Delivery
              </Typography>
              <Typography variant='body2'>
                {new Date(order.estimatedDelivery).toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant='body2' color='text.secondary'>
                Order Time
              </Typography>
              <Typography variant='body2'>
                {new Date(order.orderDate).toLocaleString('ja-JP', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          {order.items.map((item) => (
            <Box key={item.id}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 1,
                }}>
                <Box>
                  <Typography variant='body1'>
                    {item.quantity}x {item.name}
                  </Typography>
                </Box>
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  {formatPrice(item.price * item.quantity)}
                </Typography>
              </Box>
              <Divider />
            </Box>
          ))}
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 0.5,
              }}>
              <Typography variant='body2'>Subtotal</Typography>
              <Typography variant='body2'>
                {formatPrice(order.total)}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 0.5,
              }}>
              <Typography variant='body2'>Delivery Fee</Typography>
              <Typography variant='body2'>
                {formatPrice(order.deliveryFee)}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                Total
              </Typography>
              <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                {formatPrice(order.total + order.deliveryFee)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default OrderTrackingPage
