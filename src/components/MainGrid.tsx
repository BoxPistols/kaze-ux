// MainGrid.tsx
import { Box, Container, Typography } from '@mui/material'
import type { ReactNode } from 'react'

import { LAYOUT_CONSTANTS } from '@/constants/layout'
import { motionOf } from '@/themes/motion'

interface MainGridProps {
  children?: ReactNode
  overview?: string
}

export default function MainGrid({ children, overview }: MainGridProps) {
  return (
    <Container
      sx={{
        width: 'auto',
        marginTop: `${LAYOUT_CONSTANTS.HEADER.HEIGHT}px`,
        paddingTop: 4,
        transition: motionOf(['padding'], 'long'),
        minHeight: 'calc(100vh - 64px)',
      }}>
      <Box sx={{ position: 'relative', p: 4 }}>
        <Box>
          <Typography variant='h2'>{overview}</Typography>
        </Box>
        <Box sx={{ position: 'relative' }}>{children}</Box>
      </Box>
    </Container>
  )
}
