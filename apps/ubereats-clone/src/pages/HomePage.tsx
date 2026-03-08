import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining'
import SearchIcon from '@mui/icons-material/Search'
import StarIcon from '@mui/icons-material/Star'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Box, Typography, Grid, InputAdornment, Rating } from '@mui/material'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { CustomTextField } from '@/components/Form/CustomTextField'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { CustomChip } from '@/components/ui/chip'

import { restaurants, categories } from '~/data/restaurants'

const formatPrice = (price: number) => `¥${price.toLocaleString()}`

const HomePage = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredRestaurants = useMemo(() => {
    let filtered = restaurants
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((r) => r.cuisine === selectedCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.cuisine.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [search, selectedCategory])

  const featuredRestaurants = restaurants.filter((r) => r.featured)

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          pt: { xs: 4, md: 6 },
          pb: { xs: 5, md: 7 },
          px: 3,
        }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Typography
            variant='h3'
            sx={{
              fontWeight: 800,
              color: '#fff',
              mb: 1,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              letterSpacing: '-0.02em',
            }}>
            Delicious food,
            <br />
            delivered to your door.
          </Typography>
          <Typography
            variant='body1'
            sx={{
              color: 'rgba(255,255,255,0.8)',
              mb: 3,
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              maxWidth: 480,
            }}>
            Order from the best restaurants near you
          </Typography>

          <Box sx={{ maxWidth: 560 }}>
            <CustomTextField
              label=''
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              placeholder='Search restaurants, cuisines, dishes...'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, mt: -3 }}>
        {/* Category Chips */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mb: 4,
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': {
              borderRadius: 2,
              bgcolor: 'divider',
            },
          }}>
          {categories.map((cat) => (
            <CustomChip
              key={cat.id}
              label={cat.label}
              onClick={() => setSelectedCategory(cat.id)}
              variant={selectedCategory === cat.id ? 'filled' : 'outlined'}
              color={selectedCategory === cat.id ? 'primary' : 'default'}
              sx={{
                flexShrink: 0,
                fontWeight: selectedCategory === cat.id ? 600 : 400,
                px: 1,
                cursor: 'pointer',
              }}
            />
          ))}
        </Box>

        {/* Featured Restaurants */}
        {selectedCategory === 'all' && !search && (
          <Box sx={{ mb: 5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2.5,
              }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon
                  sx={{ color: 'primary.main', fontSize: 22 }}
                />
                <Typography
                  variant='h6'
                  sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                  Featured Restaurants
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                gap: 2.5,
                overflowX: 'auto',
                pb: 2,
                '&::-webkit-scrollbar': { height: 4 },
                '&::-webkit-scrollbar-thumb': {
                  borderRadius: 2,
                  bgcolor: 'divider',
                },
              }}>
              {featuredRestaurants.map((r) => (
                <Card
                  key={r.id}
                  sx={{
                    minWidth: 300,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: (theme) =>
                        theme.palette.mode === 'dark'
                          ? '0 12px 32px rgba(0,0,0,0.5)'
                          : '0 12px 32px rgba(0,0,0,0.12)',
                    },
                  }}
                  onClick={() => navigate(`/restaurant/${r.id}`)}>
                  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: 180,
                        background: `url(${r.image}) center/cover`,
                        transition: 'transform 0.4s ease',
                        '&:hover': { transform: 'scale(1.05)' },
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '50%',
                        background:
                          'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}>
                      Featured
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}>
                      <StarIcon sx={{ fontSize: 16, color: '#fbbf24' }} />
                      <Typography
                        variant='body2'
                        sx={{ color: '#fff', fontWeight: 600 }}>
                        {r.rating}
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{ color: 'rgba(255,255,255,0.75)' }}>
                        ({r.reviewCount}+)
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography
                      variant='subtitle1'
                      sx={{ fontWeight: 700, mb: 0.5 }}>
                      {r.name}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        color: 'text.secondary',
                      }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}>
                        <AccessTimeIcon sx={{ fontSize: 15 }} />
                        <Typography variant='body2'>
                          {r.deliveryTime}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}>
                        <DeliveryDiningIcon sx={{ fontSize: 15 }} />
                        <Typography variant='body2'>
                          {formatPrice(r.deliveryFee)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* All Restaurants */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant='h6'
            sx={{ fontWeight: 700, mb: 2.5, letterSpacing: '-0.01em' }}>
            {selectedCategory === 'all'
              ? 'All Restaurants'
              : `${categories.find((c) => c.id === selectedCategory)?.label} Restaurants`}
          </Typography>

          <Grid container spacing={3}>
            {filteredRestaurants.map((r) => (
              <Grid key={r.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (theme) =>
                        theme.palette.mode === 'dark'
                          ? '0 8px 24px rgba(0,0,0,0.5)'
                          : '0 8px 24px rgba(0,0,0,0.1)',
                    },
                  }}
                  onClick={() => navigate(`/restaurant/${r.id}`)}>
                  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: 200,
                        background: `url(${r.image}) center/cover`,
                        transition: 'transform 0.4s ease',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '40%',
                        background:
                          'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 10,
                        right: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: 'rgba(0,0,0,0.65)',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                      }}>
                      <AccessTimeIcon
                        sx={{ fontSize: 14, color: '#fff' }}
                      />
                      <Typography
                        variant='caption'
                        sx={{ color: '#fff', fontWeight: 500 }}>
                        {r.deliveryTime}
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 2.5, flex: 1 }}>
                    <Typography
                      variant='subtitle1'
                      sx={{ fontWeight: 700, mb: 0.5 }}>
                      {r.name}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mb: 1,
                      }}>
                      <Rating
                        value={r.rating}
                        precision={0.1}
                        size='small'
                        readOnly
                      />
                      <Typography
                        variant='body2'
                        sx={{ fontWeight: 600, ml: 0.5 }}>
                        {r.rating}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        ({r.reviewCount}+)
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: 'text.secondary',
                        mb: 1.5,
                      }}>
                      <DeliveryDiningIcon sx={{ fontSize: 15 }} />
                      <Typography variant='body2'>
                        {formatPrice(r.deliveryFee)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 0.5,
                        flexWrap: 'wrap',
                      }}>
                      {r.tags.map((tag) => (
                        <CustomChip
                          key={tag}
                          label={tag}
                          size='small'
                          variant='outlined'
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {filteredRestaurants.length === 0 && (
              <Grid size={12}>
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 10,
                    px: 3,
                  }}>
                  <SearchIcon
                    sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }}
                  />
                  <Typography
                    variant='h6'
                    color='text.secondary'
                    sx={{ fontWeight: 600, mb: 0.5 }}>
                    No restaurants found
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 3 }}>
                    Try a different search or category
                  </Typography>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setSearch('')
                      setSelectedCategory('all')
                    }}>
                    <ArrowForwardIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    View all restaurants
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    </Box>
  )
}

export default HomePage
