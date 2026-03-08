import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import StarIcon from '@mui/icons-material/Star'
import { Box, Typography, Tab, Tabs, Divider, Badge } from '@mui/material'
import { useMemo } from 'react'
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { CustomAccordion } from '@/components/ui/accordion'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { CustomChip } from '@/components/ui/chip'
import { NotFoundView } from '@/components/ui/feedback'
import { IconButton } from '@/components/ui/icon-button'
import { toast } from '@/components/ui/toast'

import { useCartStore } from '~/data/cart'
import { restaurants } from '~/data/restaurants'

const RestaurantPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const restaurant = restaurants.find((r) => r.id === id)
  const { addItem, totalItems } = useCartStore()
  const [tabValue, setTabValue] = useState(0)

  const menuCategories = useMemo(() => {
    if (!restaurant) return []
    const cats = new Map<string, typeof restaurant.menu>()
    restaurant.menu.forEach((item) => {
      const existing = cats.get(item.category) || []
      cats.set(item.category, [...existing, item])
    })
    return Array.from(cats.entries())
  }, [restaurant])

  const popularItems = useMemo(
    () => (restaurant ? restaurant.menu.filter((item) => item.popular) : []),
    [restaurant]
  )

  if (!restaurant) return <NotFoundView homePath='/' />

  const formatPrice = (price: number) => `${price.toLocaleString()}`

  const handleAddToCart = (item: (typeof restaurant.menu)[0]) => {
    addItem(item, restaurant)
    toast.success(`${item.name} added to cart`)
  }

  const cartCount = totalItems()

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box
        sx={{
          height: 250,
          background: `url(${restaurant.image}) center/cover`,
          position: 'relative',
        }}>
        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
          <IconButton onClick={() => navigate('/')} tooltip='Back'>
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Badge badgeContent={cartCount} color='primary'>
            <IconButton onClick={() => navigate('/cart')} tooltip='Cart'>
              <ShoppingCartIcon />
            </IconButton>
          </Badge>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        <Typography variant='h4' sx={{ fontWeight: 700 }}>
          {restaurant.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <StarIcon sx={{ fontSize: 20, color: '#f5a623' }} />
          <Typography variant='body1' sx={{ fontWeight: 600 }}>
            {restaurant.rating}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            ({restaurant.reviewCount}+ ratings)
          </Typography>
          <Divider orientation='vertical' flexItem sx={{ mx: 1 }} />
          <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant='body2' color='text.secondary'>
            {restaurant.deliveryTime}
          </Typography>
          <Divider orientation='vertical' flexItem sx={{ mx: 1 }} />
          <Typography variant='body2' color='text.secondary'>
            Delivery: {formatPrice(restaurant.deliveryFee)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5 }}>
          {restaurant.tags.map((tag) => (
            <CustomChip key={tag} label={tag} size='small' variant='outlined' />
          ))}
        </Box>

        <Tabs
          value={tabValue}
          onChange={(_e, v) => setTabValue(v)}
          sx={{ mt: 3, mb: 2 }}>
          <Tab label='Menu' />
          <Tab label={`Popular (${popularItems.length})`} />
        </Tabs>

        {tabValue === 0 && (
          <Box>
            {menuCategories.map(([category, items]) => (
              <CustomAccordion
                key={category}
                defaultExpanded
                summary={
                  <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                    {category} ({items.length})
                  </Typography>
                }
                details={
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {items.map((item) => (
                      <Card
                        key={item.id}
                        sx={{ display: 'flex', alignItems: 'center' }}>
                        <CardContent sx={{ flex: 1, p: 2 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}>
                            <Typography
                              variant='subtitle2'
                              sx={{ fontWeight: 600 }}>
                              {item.name}
                            </Typography>
                            {item.popular && (
                              <CustomChip
                                label='Popular'
                                size='small'
                                color='primary'
                              />
                            )}
                            {item.spicy && (
                              <LocalFireDepartmentIcon
                                sx={{ fontSize: 16, color: 'error.main' }}
                              />
                            )}
                          </Box>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ mt: 0.5 }}>
                            {item.description}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              mt: 1,
                            }}>
                            <Typography
                              variant='body1'
                              sx={{ fontWeight: 600 }}>
                              {formatPrice(item.price)}
                            </Typography>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleAddToCart(item)}>
                              + Add
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                }
              />
            ))}
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {popularItems.map((item) => (
              <Card
                key={item.id}
                sx={{ display: 'flex', alignItems: 'center' }}>
                <CardContent sx={{ flex: 1, p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                      {item.name}
                    </Typography>
                    {item.spicy && (
                      <LocalFireDepartmentIcon
                        sx={{ fontSize: 16, color: 'error.main' }}
                      />
                    )}
                  </Box>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mt: 0.5 }}>
                    {item.description}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mt: 1,
                    }}>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      {formatPrice(item.price)}
                    </Typography>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleAddToCart(item)}>
                      + Add
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default RestaurantPage
