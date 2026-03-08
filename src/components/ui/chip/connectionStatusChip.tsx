import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { Box, Chip } from '@mui/material'
import { styled } from '@mui/material/styles'

export interface ConnectionStatusChipProps {
  connected: boolean
  connectedLabel?: string
  disconnectedLabel?: string
}

const StyledStatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'connected',
})<{ connected: boolean }>(({ theme, connected }) => ({
  backgroundColor: connected
    ? theme.palette.mode === 'light'
      ? theme.palette.success.lighter
      : `${theme.palette.success.main}20`
    : theme.palette.mode === 'light'
      ? theme.palette.error.lighter
      : `${theme.palette.error.main}20`,
  color: connected ? theme.palette.success.dark : theme.palette.error.dark,
  borderRadius: theme.shape.borderRadius,
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  border: `1px solid ${connected ? theme.palette.success.light : theme.palette.error.light}`,
  height: 28,
  fontWeight: 500,
  '& .MuiChip-icon': {
    color: 'inherit',
    fontSize: 16,
  },
}))

/**
 * 接続状態表示用チップコンポーネント
 * 連携済み/未連携などの状態を視覚的に表示
 */
export const ConnectionStatusChip = ({
  connected,
  connectedLabel = '連携済み',
  disconnectedLabel = '未連携',
}: ConnectionStatusChipProps) => (
  <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
    <StyledStatusChip
      connected={connected}
      icon={connected ? <CheckIcon /> : <CloseIcon />}
      label={connected ? connectedLabel : disconnectedLabel}
      size='small'
    />
  </Box>
)
