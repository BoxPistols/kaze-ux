import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import StarIcon from '@mui/icons-material/Star'
import { Box, Typography, Tab, Tabs, Badge, Divider } from '@mui/material'
import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { CustomAccordion } from '@/components/ui/accordion'
import { Button } from '@/components/ui/Button'
import { CustomChip } from '@/components/ui/chip'
import { NotFoundView } from '@/components/ui/feedback'
import { IconButton } from '@/components/ui/icon-button'
import { toast } from '@/components/ui/toast'

import { useCartStore } from '~/data/cart'
import { restaurants } from '~/data/restaurants'
import { UE_GREEN, UE_STAR } from '~/theme/colors'
import { formatPrice } from '~/utils/format'

export const RestaurantPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const restaurant = restaurants.find((r) => r.id === id)
  const { addItem, totalItems } = useCartStore()
  const [tabValue, setTabValue] = useState(0)

  // Map は挿入順を保証するため、データ定義順でカテゴリが表示される
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
          {/* ヒーロー画像上のボタン: 背景画像に重なるため固定色を使用 */}
          <IconButton
            onClick={() => navigate('/')}
            tooltip='Back to home'
            aria-label='Back to home'
            sx={{
              bgcolor: 'rgba(255,255,255,0.9)',
              color: 'grey.800',
              '&:hover': { bgcolor: 'common.white', color: 'common.black' },
            }}>
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Badge
            badgeContent={cartCount}
            sx={{
              '& .MuiBadge-badge': { bgcolor: UE_GREEN, color: 'common.white' },
            }}>
            <IconButton
              onClick={() => navigate('/cart')}
              tooltip='View cart'
              aria-label='View cart'
              sx={{
                bgcolor: 'rgba(255,255,255,0.9)',
                color: 'grey.800',
                '&:hover': { bgcolor: 'common.white', color: 'common.black' },
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
                sx={{ fontSize: 18, color: UE_STAR }}
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
                  <Box>
                    {items.map((item, idx) => (
                      <Box key={item.id}>
                        <Box sx={{ py: 2 }}>
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
                                color='success'
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
                              mt: 1,
                            }}>
                            <Typography
                              variant='body1'
                              sx={{ fontWeight: 700, color: UE_GREEN }}>
                              {formatPrice(item.price)}
                            </Typography>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleAddToCart(item)}>
                              + Add
                            </Button>
                          </Box>
                        </Box>
                        {idx < items.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </Box>
                }
              />
            ))}
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            {popularItems.map((item, idx) => (
              <Box key={item.id}>
                <Box sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                      {item.name}
                    </Typography>
                    {item.popular && (
                      <CustomChip
                        label='Popular'
                        size='small'
                        color='success'
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
                      mt: 1,
                    }}>
                    <Typography
                      variant='body1'
                      sx={{ fontWeight: 700, color: UE_GREEN }}>
                      {formatPrice(item.price)}
                    </Typography>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleAddToCart(item)}>
                      + Add
                    </Button>
                  </Box>
                </Box>
                {idx < popularItems.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
