import AccessTimeIcon from '@mui/icons-material/AccessTime'
import StarIcon from '@mui/icons-material/Star'
import { Box, Typography, Grid, Rating } from '@mui/material'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { CustomTextField } from '@/components/Form/CustomTextField'
import { Card, CardContent } from '@/components/ui/Card'
import { CustomChip } from '@/components/ui/chip'
import { PageHeader } from '@/components/ui/text'

import { restaurants, categories } from '~/data/restaurants'

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

  const formatPrice = (price: number) => `${price.toLocaleString()}`

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title='What are you craving?'
        subtitle='Order from the best restaurants near you.'
      />

      <Box sx={{ mb: 3 }}>
        <CustomTextField
          label=''
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          placeholder='Search restaurants, cuisines, dishes...'
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 4, overflowX: 'auto', pb: 1 }}>
        {categories.map((cat) => (
          <CustomChip
            key={cat.id}
            label={`${cat.icon} ${cat.label}`}
            onClick={() => setSelectedCategory(cat.id)}
            variant={selectedCategory === cat.id ? 'filled' : 'outlined'}
            color={selectedCategory === cat.id ? 'primary' : 'default'}
            sx={{ flexShrink: 0 }}
          />
        ))}
      </Box>

      {selectedCategory === 'all' && !search && (
        <Box sx={{ mb: 4 }}>
          <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
            Featured Restaurants
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
            {featuredRestaurants.map((r) => (
              <Card
                key={r.id}
                sx={{
                  minWidth: 280,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
                onClick={() => navigate(`/restaurant/${r.id}`)}>
                <Box
                  sx={{
                    height: 160,
                    background: `url(${r.image}) center/cover`,
                    borderRadius: '8px 8px 0 0',
                  }}
                />
                <CardContent sx={{ p: 2 }}>
                  <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                    {r.name}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mt: 0.5,
                    }}>
                    <StarIcon sx={{ fontSize: 16, color: '#f5a623' }} />
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>
                      {r.rating}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      ({r.reviewCount})
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mx: 0.5 }}>
                      |
                    </Typography>
                    <AccessTimeIcon
                      sx={{ fontSize: 14, color: 'text.secondary' }}
                    />
                    <Typography variant='body2' color='text.secondary'>
                      {r.deliveryTime}
                    </Typography>
                  </Box>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mt: 0.5 }}>
                    Delivery: {formatPrice(r.deliveryFee)}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
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
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
                height: '100%',
              }}
              onClick={() => navigate(`/restaurant/${r.id}`)}>
              <Box
                sx={{
                  height: 180,
                  background: `url(${r.image}) center/cover`,
                  borderRadius: '8px 8px 0 0',
                }}
              />
              <CardContent sx={{ p: 2 }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                  {r.name}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mt: 0.5,
                  }}>
                  <Rating
                    value={r.rating}
                    precision={0.1}
                    size='small'
                    readOnly
                  />
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {r.rating}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    ({r.reviewCount}+)
                  </Typography>
                </Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <AccessTimeIcon
                    sx={{ fontSize: 14, color: 'text.secondary' }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    {r.deliveryTime}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    | Delivery {formatPrice(r.deliveryFee)}
                  </Typography>
                </Box>
                <Box
                  sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                  {r.tags.map((tag) => (
                    <CustomChip
                      key={tag}
                      label={tag}
                      size='small'
                      variant='outlined'
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {filteredRestaurants.length === 0 && (
          <Grid size={12}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant='h6' color='text.secondary'>
                No restaurants found
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Try a different search or category
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default HomePage
