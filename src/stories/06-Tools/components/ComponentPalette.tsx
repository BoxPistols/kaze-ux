// 左パネル: コンポーネント一覧

import { Box, Chip, Typography } from '@mui/material'

import { PALETTE_CATEGORIES } from './componentRegistry'

interface ComponentPaletteProps {
  onSelect: (name: string) => void
}

export const ComponentPalette = ({ onSelect }: ComponentPaletteProps) => (
  <Box
    sx={{
      width: 220,
      flexShrink: 0,
      borderRight: 1,
      borderColor: 'divider',
      overflow: 'auto',
      p: 1.5,
    }}>
    <Typography
      variant='caption'
      color='text.secondary'
      sx={{
        fontWeight: 600,
        letterSpacing: '0.05em',
        mb: 1,
        display: 'block',
      }}>
      COMPONENTS
    </Typography>
    {PALETTE_CATEGORIES.map((cat) => (
      <Box key={cat.label} sx={{ mb: 2 }}>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ fontSize: 11, mb: 0.5, display: 'block' }}>
          {cat.label}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {cat.components.map((name) => (
            <Chip
              key={name}
              label={name}
              size='small'
              variant='outlined'
              onClick={() => onSelect(name)}
              sx={{
                fontSize: 11,
                height: 24,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            />
          ))}
        </Box>
      </Box>
    ))}
  </Box>
)
