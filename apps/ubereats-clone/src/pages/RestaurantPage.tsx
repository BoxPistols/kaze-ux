import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import StarIcon from '@mui/icons-material/Star'
import { Box, Typography, Tab, Tabs, Badge } from '@mui/material'
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

const formatPrice = (price: number) => `¥${price.toLocaleString()}`

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

  const handleAddToCart = (item: (typeof restaurant.menu)[0]) => {
    addItem(item, restaurant)
    toast.success(`${item.name} added to cart`)
  }

  const cartCount = totalItems()

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Hero Image */}
      <Box
        sx={{
          height: { xs: 220, md: 300 },
          position: 'relative',
          overflow: 'hidden',
        }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `url(${restaurant.image}) center/cover`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
          }}>
          <IconButton
            onClick={() => navigate('/')}
            tooltip='Back to home'
            aria-label='Back to home'
            sx={{
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: '#fff' },
            }}>
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Badge badgeContent={cartCount} color='primary'>
            <IconButton
              onClick={() => navigate('/cart')}
              tooltip='View cart'
              aria-label='View cart'
              sx={{
                bgcolor: 'rgba(255,255,255,0.9)',
                '&:hover': { bgcolor: '#fff' },
              }}>
              <ShoppingCartIcon />
            </IconButton>
          </Badge>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: 24,
            right: 24,
          }}>
          <Typography
            variant='h4'
            sx={{
              fontWeight: 800,
              color: '#fff',
              mb: 1,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
            {restaurant.name}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
            }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                bgcolor: 'rgba(0,0,0,0.5)',
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
              }}>
              <StarIcon
                sx={{ fontSize: 18, color: '#fbbf24' }}
                aria-hidden='true'
              />
              <Typography
                variant='body2'
                sx={{ color: '#fff', fontWeight: 600 }}>
                {restaurant.rating}
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: 'rgba(255,255,255,0.75)' }}>
                ({restaurant.reviewCount}+)
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'rgba(255,255,255,0.9)',
              }}>
              <AccessTimeIcon sx={{ fontSize: 18 }} aria-hidden='true' />
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {restaurant.deliveryTime}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'rgba(255,255,255,0.9)',
              }}>
              <DeliveryDiningIcon sx={{ fontSize: 18 }} aria-hidden='true' />
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {formatPrice(restaurant.deliveryFee)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
          {restaurant.tags.map((tag) => (
            <CustomChip key={tag} label={tag} size='small' variant='outlined' />
          ))}
        </Box>

        <Tabs
          value={tabValue}
          onChange={(_e, v) => setTabValue(v)}
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label='Menu' sx={{ fontWeight: 600 }} />
          <Tab
            label={`Popular (${popularItems.length})`}
            sx={{ fontWeight: 600 }}
          />
        </Tabs>

        {tabValue === 0 && (
          <Box>
            {menuCategories.map(([category, items]) => (
              <CustomAccordion
                key={category}
                defaultExpanded
                summary={
                  <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                    {category} ({items.length})
                  </Typography>
                }
                details={
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {items.map((item) => (
                      <Card
                        key={item.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: (theme) =>
                              theme.palette.mode === 'dark'
                                ? '0 4px 16px rgba(0,0,0,0.4)'
                                : '0 4px 16px rgba(0,0,0,0.08)',
                          },
                        }}>
                        <CardContent sx={{ flex: 1, p: 2.5 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}>
                            <Typography
                              variant='subtitle2'
                              sx={{ fontWeight: 700 }}>
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
                                sx={{ fontSize: 18, color: 'error.main' }}
                                aria-hidden='true'
                              />
                            )}
                          </Box>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ mt: 0.5, lineHeight: 1.5 }}>
                            {item.description}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              mt: 1.5,
                            }}>
                            <Typography
                              variant='body1'
                              sx={{ fontWeight: 700, color: 'primary.main' }}>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {popularItems.map((item) => (
              <Card
                key={item.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 4px 16px rgba(0,0,0,0.4)'
                        : '0 4px 16px rgba(0,0,0,0.08)',
                  },
                }}>
                <CardContent sx={{ flex: 1, p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
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
                    sx={{ mt: 0.5, lineHeight: 1.5 }}>
                    {item.description}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mt: 1.5,
                    }}>
                    <Typography
                      variant='body1'
                      sx={{ fontWeight: 700, color: 'primary.main' }}>
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
