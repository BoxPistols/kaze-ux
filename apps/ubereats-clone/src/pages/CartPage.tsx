import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import RemoveIcon from '@mui/icons-material/Remove'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import { Box, Typography, Divider } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CustomSelect } from '@/components/Form/CustomSelect'
import { CustomTextField } from '@/components/Form/CustomTextField'
import { Button } from '@/components/ui/Button'
import { LoadingButton } from '@/components/ui/button/loadingButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/icon-button'
import { toast } from '@/components/ui/toast'

import { useCartStore } from '~/data/cart'
import { UE_BLACK, UE_BLACK_HOVER, UE_GREEN, UE_GREEN_DARK } from '~/theme/colors'
import { formatPrice } from '~/utils/format'

const paymentOptions = [
  { value: 'credit', label: 'Credit Card' },
  { value: 'paypay', label: 'PayPay' },
  { value: 'cash', label: 'Cash on Delivery' },
]

export const CartPage = () => {
  const navigate = useNavigate()
  const { items, restaurant, updateQuantity, removeItem, clearCart, subtotal } =
    useCartStore()
  const [address, setAddress] = useState('Shibuya, Tokyo 150-0001')
  const [payment, setPayment] = useState('credit')
  const [note, setNote] = useState('')
  const [isOrdering, setIsOrdering] = useState(false)

  const deliveryFee = restaurant?.deliveryFee ?? 0
  const total = subtotal() + deliveryFee

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
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 3, pt: 3 }}>
        <Box sx={{ mb: 3 }}>
          <IconButton
            onClick={() => navigate(-1)}
            tooltip='Go back'
            aria-label='Go back'>
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <ShoppingCartOutlinedIcon
            sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }}
            aria-hidden='true'
          />
          <Typography
            variant='h5'
            sx={{ fontWeight: 700, mb: 1, letterSpacing: '-0.01em' }}>
            Your cart is empty
          </Typography>
          <Typography
            variant='body1'
            color='text.secondary'
            sx={{ mb: 4, maxWidth: 360, mx: 'auto' }}>
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
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3, pt: 3, pb: 6 }}>
      <Box sx={{ mb: 3 }}>
        <IconButton
          onClick={() => navigate(-1)}
          tooltip='Go back'
          aria-label='Go back'>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Typography
        variant='h4'
        sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.02em' }}>
        Checkout
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        Order from {restaurant?.name}
      </Typography>

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
              {items.map((item, idx) => (
                <Box key={item.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 2,
                    }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {item.name}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {formatPrice(item.price)} each
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.04)',
                        borderRadius: 2,
                        px: 0.5,
                        py: 0.25,
                      }}>
                      <IconButton
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        tooltip='Decrease quantity'
                        aria-label={`Decrease ${item.name} quantity`}
                        size='small'>
                        <RemoveIcon />
                      </IconButton>
                      <Typography
                        variant='body2'
                        sx={{
                          fontWeight: 700,
                          minWidth: 28,
                          textAlign: 'center',
                        }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        tooltip='Increase quantity'
                        aria-label={`Increase ${item.name} quantity`}
                        size='small'>
                        <AddIcon />
                      </IconButton>
                    </Box>
                    <Typography
                      variant='body1'
                      sx={{
                        fontWeight: 700,
                        minWidth: 80,
                        textAlign: 'right',
                      }}>
                      {formatPrice(item.price * item.quantity)}
                    </Typography>
                    <IconButton
                      onClick={() => removeItem(item.id)}
                      tooltip='Remove item'
                      aria-label={`Remove ${item.name} from cart`}
                      color='error'
                      size='small'>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Box>
                  {idx < items.length - 1 && <Divider />}
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card>
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

        <Box sx={{ width: { xs: '100%', md: 340 } }}>
          <Card
            sx={{
              position: 'sticky',
              top: 80,
              overflow: 'hidden',
            }}>
            <Box
              sx={{
                height: 4,
                background: `linear-gradient(90deg, ${UE_GREEN} 0%, ${UE_GREEN_DARK} 100%)`,
              }}
            />
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}>
                <Typography variant='body2' color='text.secondary'>
                  Subtotal
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 500 }}>
                  {formatPrice(subtotal())}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}>
                <Typography variant='body2' color='text.secondary'>
                  Delivery Fee
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 500 }}>
                  {formatPrice(deliveryFee)}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 3,
                }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                  Total
                </Typography>
                <Typography
                  variant='subtitle1'
                  sx={{ fontWeight: 700, color: UE_GREEN }}>
                  {formatPrice(total)}
                </Typography>
              </Box>
              <LoadingButton
                onClick={handleOrder}
                loading={isOrdering}
                fullWidth
                variant='contained'
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  borderRadius: 2,
                  bgcolor: UE_BLACK,
                  '&:hover': {
                    bgcolor: UE_BLACK_HOVER,
                  },
                }}>
                Place Order
              </LoadingButton>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}
