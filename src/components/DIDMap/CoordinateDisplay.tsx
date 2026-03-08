/**
 * 座標表示コンポーネント
 */

import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'

import { convertDecimalToDMS } from '@/lib/map'

import type { CoordinateDisplayProps } from './types'

function CoordinateDisplay({
  position,
  format,
  darkMode,
  onFormatChange,
  onClose,
}: CoordinateDisplayProps) {
  if (!position) return null

  const formatCoordinate = () => {
    if (format === 'dms') {
      const lat = convertDecimalToDMS(position.lat, true, 'ja')
      const lng = convertDecimalToDMS(position.lng, false, 'ja')
      return `${lat}, ${lng}`
    }
    return `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatCoordinate())
    } catch (err) {
      console.error('Failed to copy coordinates:', err)
    }
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        left: position.x + 10,
        top: position.y + 10,
        minWidth: 200,
        backgroundColor: darkMode ? 'grey.900' : 'background.paper',
        zIndex: 1000,
      }}>
      {/* ヘッダー */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 0.5,
          borderBottom: 1,
          borderColor: 'divider',
        }}>
        <Typography variant='caption' color='text.secondary'>
          座標情報
        </Typography>
        <Box>
          <IconButton size='small' onClick={handleCopy} aria-label='コピー'>
            <CopyIcon fontSize='small' />
          </IconButton>
          <IconButton size='small' onClick={onClose} aria-label='閉じる'>
            <CloseIcon fontSize='small' />
          </IconButton>
        </Box>
      </Box>

      {/* 座標値 */}
      <Box sx={{ px: 1.5, py: 1 }}>
        <Typography variant='body2' fontFamily='monospace'>
          {formatCoordinate()}
        </Typography>
      </Box>

      {/* 表示形式切り替え */}
      <Box sx={{ px: 1.5, pb: 1 }}>
        <ToggleButtonGroup
          value={format}
          exclusive
          onChange={(_, value) => value && onFormatChange(value)}
          size='small'
          fullWidth>
          <ToggleButton
            value='decimal'
            sx={{ textTransform: 'none', py: 0.25 }}>
            10進数
          </ToggleButton>
          <ToggleButton value='dms' sx={{ textTransform: 'none', py: 0.25 }}>
            度分秒
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Paper>
  )
}

export { CoordinateDisplay }
