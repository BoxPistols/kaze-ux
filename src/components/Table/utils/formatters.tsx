// src/components/Table/utils/formatters.tsx
import { Box } from '@mui/material'

import { theme } from '@/themes/theme'

export const formatCellValue = (value: unknown): React.ReactNode => {
  if (value === null || value === undefined) {
    return '-'
  }

  if (typeof value === 'boolean') {
    return (
      <Box
        component='span'
        sx={{
          px: 2,
          py: 0.5,
          borderRadius: 1,
          fontSize: '0.875rem',
          fontWeight: 'medium',
          bgcolor: value ? 'success.lighter' : 'error.lighter',
          color: theme.palette.grey[700],
        }}>
        {value ? 'Active' : 'Inactive'}
      </Box>
    )
  }
  return String(value)
}
