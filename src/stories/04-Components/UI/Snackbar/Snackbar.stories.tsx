import CloseIcon from '@mui/icons-material/Close'
import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Typography,
} from '@mui/material'
import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * MUI Snackbarコンポーネント。
 *
 * 一時的なフィードバックメッセージを画面の端に表示。
 * Alert と組み合わせることで、成功/エラー/警告/情報の通知パターンを実現。
 */
const meta: Meta<typeof Snackbar> = {
  title: 'Components/UI/Snackbar',
  component: Snackbar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    autoHideDuration: {
      control: { type: 'number', min: 1000, max: 10000, step: 500 },
      description: '自動非表示までの時間 (ms)',
    },
    message: { control: 'text', description: 'メッセージテキスト' },
  },
}

export default meta

// ---------------------------------------------------------------------------
// 基本
// ---------------------------------------------------------------------------

const BasicContent = () => {
  const [open, setOpen] = useState(false)

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    // clickaway では閉じない
    if (reason === 'clickaway') return
    setOpen(false)
  }

  const action = (
    <IconButton
      size='small'
      aria-label='閉じる'
      color='inherit'
      onClick={handleClose}>
      <CloseIcon fontSize='small' />
    </IconButton>
  )

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
        基本のSnackbar
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
        シンプルなメッセージと閉じるボタンを備えた基本的なSnackbar。
        autoHideDuration で自動的に非表示になります。
      </Typography>

      <Button variant='contained' onClick={() => setOpen(true)}>
        Snackbarを表示
      </Button>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        message='操作が完了しました'
        action={action}
      />
    </Box>
  )
}

/**
 * シンプルなメッセージと閉じるボタンを備えた基本的なSnackbar
 */
export const Basic: StoryObj = {
  name: '基本',
  render: () => <BasicContent />,
}

// ---------------------------------------------------------------------------
// Alert付きSnackbar
// ---------------------------------------------------------------------------

const WithAlertContent = () => {
  const [openSuccess, setOpenSuccess] = useState(false)
  const [openError, setOpenError] = useState(false)
  const [openWarning, setOpenWarning] = useState(false)
  const [openInfo, setOpenInfo] = useState(false)

  /** severity ごとの定義 */
  const variants = [
    {
      severity: 'success' as const,
      label: '成功',
      message: '計画が保存されました',
      color: 'success' as const,
      open: openSuccess,
      setOpen: setOpenSuccess,
    },
    {
      severity: 'error' as const,
      label: 'エラー',
      message: '通信エラーが発生しました',
      color: 'error' as const,
      open: openError,
      setOpen: setOpenError,
    },
    {
      severity: 'warning' as const,
      label: '警告',
      message: 'バッテリー残量が低下しています',
      color: 'warning' as const,
      open: openWarning,
      setOpen: setOpenWarning,
    },
    {
      severity: 'info' as const,
      label: '情報',
      message: '新しいプランが登録されました',
      color: 'info' as const,
      open: openInfo,
      setOpen: setOpenInfo,
    },
  ]

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
        Alert付きSnackbar
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
        Snackbar の中に Alert
        を配置して、成功/エラー/警告/情報の通知パターンを実現。
      </Typography>

      <Grid container spacing={2}>
        {variants.map((v) => (
          <Grid key={v.severity} size={{ xs: 12, md: 6 }}>
            <Paper
              variant='outlined'
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 2,
              }}>
              <Typography variant='body2' sx={{ fontWeight: 600, mb: 2 }}>
                {v.label}
              </Typography>
              <Button
                variant='outlined'
                color={v.color}
                onClick={() => v.setOpen(true)}>
                {v.label}通知を表示
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {variants.map((v) => (
        <Snackbar
          key={v.severity}
          open={v.open}
          autoHideDuration={4000}
          onClose={(_event, reason) => {
            if (reason === 'clickaway') return
            v.setOpen(false)
          }}>
          <Alert
            onClose={() => v.setOpen(false)}
            severity={v.severity}
            variant='filled'
            sx={{ width: '100%' }}>
            {v.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  )
}

/**
 * Alert を内包し、成功/エラー/警告/情報の4パターンを表示
 */
export const WithAlert: StoryObj = {
  name: 'Alert付き',
  render: () => <WithAlertContent />,
}

// ---------------------------------------------------------------------------
// 表示位置
// ---------------------------------------------------------------------------

/** anchorOrigin に使用する位置の定義 */
interface AnchorPosition {
  vertical: 'top' | 'bottom'
  horizontal: 'left' | 'center' | 'right'
  label: string
}

const positions: AnchorPosition[] = [
  { vertical: 'top', horizontal: 'left', label: '左上' },
  { vertical: 'top', horizontal: 'center', label: '中央上' },
  { vertical: 'top', horizontal: 'right', label: '右上' },
  { vertical: 'bottom', horizontal: 'left', label: '左下' },
  { vertical: 'bottom', horizontal: 'center', label: '中央下' },
  { vertical: 'bottom', horizontal: 'right', label: '右下' },
]

const PositionsContent = () => {
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<AnchorPosition>(positions[4]) // 中央下をデフォルト

  const handleOpen = (pos: AnchorPosition) => {
    setAnchor(pos)
    setOpen(true)
  }

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return
    setOpen(false)
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
        表示位置
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
        anchorOrigin で Snackbar
        の表示位置を制御。6箇所の配置パターンを確認できます。
      </Typography>

      <Grid container spacing={2}>
        {positions.map((pos) => (
          <Grid
            key={`${pos.vertical}-${pos.horizontal}`}
            size={{ xs: 12, md: 4 }}>
            <Button
              variant='outlined'
              fullWidth
              onClick={() => handleOpen(pos)}
              sx={{ textTransform: 'none' }}>
              {pos.label}
            </Button>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{
          vertical: anchor.vertical,
          horizontal: anchor.horizontal,
        }}>
        <Alert
          onClose={() => setOpen(false)}
          severity='info'
          variant='filled'
          sx={{ width: '100%' }}>
          {anchor.label}に表示しています
        </Alert>
      </Snackbar>
    </Box>
  )
}

/**
 * anchorOrigin を変更し、6箇所の表示位置を確認
 */
export const Positions: StoryObj = {
  name: '表示位置',
  render: () => <PositionsContent />,
}
