import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import RemoveIcon from '@mui/icons-material/Remove'
import { Box, Typography, Divider } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CustomSelect } from '@/components/Form/CustomSelect'
import { CustomTextField } from '@/components/Form/CustomTextField'
import { Button } from '@/components/ui/Button'
import { LoadingButton } from '@/components/ui/button/loadingButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/icon-button'
import { PageHeader } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'

import { useCartStore } from '~/data/cart'

const paymentOptions = [
  { value: 'credit', label: 'Credit Card' },
  { value: 'paypay', label: 'PayPay' },
  { value: 'cash', label: 'Cash on Delivery' },
]

const CartPage = () => {
  const navigate = useNavigate()
  const { items, restaurant, updateQuantity, removeItem, clearCart, subtotal } =
    useCartStore()
  const [address, setAddress] = useState('Shibuya, Tokyo 150-0001')
  const [payment, setPayment] = useState('credit')
  const [note, setNote] = useState('')
  const [isOrdering, setIsOrdering] = useState(false)

  const deliveryFee = restaurant?.deliveryFee ?? 0
  const total = subtotal() + deliveryFee

  const formatPrice = (price: number) => `${price.toLocaleString()}`

  const handleOrder = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    setIsOrdering(true)
    setTimeout(() => {
      setIsOrdering(false)
      clearCart()
      toast.success('Order placed successfully!')
      navigate('/orders')
    }, 2000)
  }

  if (items.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <IconButton onClick={() => navigate(-1)} tooltip='Back'>
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
            Your cart is empty
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
            Add items from a restaurant to get started
          </Typography>
          <Button variant='default' onClick={() => navigate('/')}>
            Browse Restaurants
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} tooltip='Back'>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <PageHeader
        title='Checkout'
        subtitle={`Order from ${restaurant?.name}`}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
        }}>
        <Box sx={{ flex: 1 }}>
          <Card sx={{ mb: 3 }}>
            <CardHeader>
              <CardTitle>Your Items</CardTitle>
            </CardHeader>
            <CardContent>
              {items.map((item) => (
                <Box key={item.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1.5,
                    }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        {item.name}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {formatPrice(item.price)} each
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        tooltip='Decrease'>
                        <RemoveIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <Typography
                        variant='body1'
                        sx={{
                          fontWeight: 600,
                          minWidth: 24,
                          textAlign: 'center',
                        }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        tooltip='Increase'>
                        <AddIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                    <Typography
                      variant='body1'
                      sx={{
                        fontWeight: 600,
                        minWidth: 70,
                        textAlign: 'right',
                      }}>
                      {formatPrice(item.price * item.quantity)}
                    </Typography>
                    <IconButton
                      onClick={() => removeItem(item.id)}
                      tooltip='Remove'>
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                  <Divider />
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <CustomTextField
                  label='Delivery Address'
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  fullWidth
                />
                <CustomSelect
                  label='Payment Method'
                  value={payment}
                  onChange={(e) => setPayment(e.target.value as string)}
                  options={paymentOptions}
                  fullWidth
                />
                <CustomTextField
                  label='Special Instructions'
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder='Any special requests for your order?'
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: '100%', md: 320 } }}>
          <Card sx={{ position: 'sticky', top: 16 }}>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                }}>
                <Typography variant='body2'>Subtotal</Typography>
                <Typography variant='body2'>
                  {formatPrice(subtotal())}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                }}>
                <Typography variant='body2'>Delivery Fee</Typography>
                <Typography variant='body2'>
                  {formatPrice(deliveryFee)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 2,
                }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                  Total
                </Typography>
                <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                  {formatPrice(total)}
                </Typography>
              </Box>
              <LoadingButton
                onClick={handleOrder}
                loading={isOrdering}
                fullWidth
                variant='contained'>
                Place Order
              </LoadingButton>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}

export default CartPage
