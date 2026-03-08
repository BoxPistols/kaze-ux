import InfoIcon from '@mui/icons-material/Info'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * MUIテーマでカスタマイズされたDialogコンポーネント。
 *
 * テーマ設定:
 * - Paper: borderRadius 16, elevation 0, border 1px solid rgba(0,0,0,0.08)
 * - boxShadow: '0 20px 40px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)'
 * - DialogTitle: padding '20px 24px 16px', fontSize lg, fontWeight 600, borderBottom divider
 * - DialogContent: padding '24px'
 * - DialogContentText: text.secondary, fontSize sm, lineHeight 1.6
 * - DialogActions: padding '16px 24px 20px', gap 12, borderTop divider
 * - Backdrop: rgba(0,0,0,0.5)
 * - maxWidth: sm=440, md=600, lg=900
 */
const meta: Meta<typeof Dialog> = {
  title: 'Components/UI/Dialog/MUI Dialog',
  component: Dialog,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'MUI Dialogコンポーネント。カスタムborderRadius、boxShadow、DialogTitle/Content/Actionsのスタイリングがテーマで適用されている。',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta

// ---------------------------------------------------------------------------
// 基本ダイアログ
// ---------------------------------------------------------------------------

const BasicContent = () => {
  const [open, setOpen] = useState(false)

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
        基本ダイアログ
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
        テーマ設定: borderRadius 16, elevation 0, DialogTitle / DialogContent /
        DialogActions にカスタム padding とボーダー。
      </Typography>

      <Button variant='contained' onClick={() => setOpen(true)}>
        ダイアログを開く
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth='sm'
        fullWidth>
        <DialogTitle>基本ダイアログ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            これはテーマカスタマイズが適用された基本的なダイアログです。
            borderRadius 16、elevation
            0、カスタムpadding、ボーダー区切りが設定されています。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>キャンセル</Button>
          <Button variant='contained' onClick={() => setOpen(false)}>
            確認
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export const Basic: StoryObj = {
  name: '基本',
  render: () => <BasicContent />,
}

// ---------------------------------------------------------------------------
// サイズバリエーション（sm / md / lg）
// ---------------------------------------------------------------------------

const SizesContent = () => {
  const [openSm, setOpenSm] = useState(false)
  const [openMd, setOpenMd] = useState(false)
  const [openLg, setOpenLg] = useState(false)

  const sizes = [
    {
      key: 'sm' as const,
      label: 'Small (440px)',
      open: openSm,
      setOpen: setOpenSm,
    },
    {
      key: 'md' as const,
      label: 'Medium (600px)',
      open: openMd,
      setOpen: setOpenMd,
    },
    {
      key: 'lg' as const,
      label: 'Large (900px)',
      open: openLg,
      setOpen: setOpenLg,
    },
  ]

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
        サイズバリエーション
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
        テーマ設定: sm=440px, md=600px, lg=900px のカスタム maxWidth。
      </Typography>

      <Stack direction='row' spacing={2}>
        {sizes.map((size) => (
          <Button
            key={size.key}
            variant='outlined'
            onClick={() => size.setOpen(true)}>
            {size.label}
          </Button>
        ))}
      </Stack>

      {sizes.map((size) => (
        <Dialog
          key={size.key}
          open={size.open}
          onClose={() => size.setOpen(false)}
          maxWidth={size.key}
          fullWidth>
          <DialogTitle>{size.label} ダイアログ</DialogTitle>
          <DialogContent>
            <DialogContentText>
              maxWidth=&quot;{size.key}&quot; が適用されたダイアログです。
              テーマにより最大幅が{' '}
              {size.label.replace(/.*\(/, '').replace(')', '')}{' '}
              に設定されています。
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => size.setOpen(false)}>閉じる</Button>
            <Button variant='contained' onClick={() => size.setOpen(false)}>
              OK
            </Button>
          </DialogActions>
        </Dialog>
      ))}
    </Box>
  )
}

export const Sizes: StoryObj = {
  name: 'サイズ',
  render: () => <SizesContent />,
}

// ---------------------------------------------------------------------------
// 実践パターン（確認・フォーム・情報）
// ---------------------------------------------------------------------------

const PracticalPatternsContent = () => {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
        実践パターン
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
        確認ダイアログ、フォームダイアログ、情報ダイアログの代表的なパターン。
      </Typography>

      <Grid container spacing={3}>
        {/* 確認ダイアログ */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              textAlign: 'center',
            }}>
            <Typography variant='body2' sx={{ fontWeight: 600, mb: 2 }}>
              削除確認
            </Typography>
            <Button
              variant='contained'
              color='error'
              onClick={() => setConfirmOpen(true)}>
              削除する
            </Button>
          </Box>
        </Grid>

        {/* フォームダイアログ */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              textAlign: 'center',
            }}>
            <Typography variant='body2' sx={{ fontWeight: 600, mb: 2 }}>
              フォーム入力
            </Typography>
            <Button variant='contained' onClick={() => setFormOpen(true)}>
              新規登録
            </Button>
          </Box>
        </Grid>

        {/* 情報ダイアログ */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              textAlign: 'center',
            }}>
            <Typography variant='body2' sx={{ fontWeight: 600, mb: 2 }}>
              情報表示
            </Typography>
            <Button variant='outlined' onClick={() => setInfoOpen(true)}>
              詳細を表示
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* --- 確認ダイアログ --- */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth='sm'
        fullWidth>
        <DialogTitle>
          <Stack direction='row' spacing={1} alignItems='center'>
            <WarningAmberIcon color='error' />
            <span>削除の確認</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            このプランを削除してもよろしいですか？
            関連するログデータもすべて削除されます。この操作は取り消せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>キャンセル</Button>
          <Button
            variant='contained'
            color='error'
            onClick={() => setConfirmOpen(false)}>
            削除する
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- フォームダイアログ --- */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth='sm'
        fullWidth>
        <DialogTitle>新規プラン登録</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            プランの基本情報を入力してください。
          </DialogContentText>
          <Stack spacing={2}>
            <TextField
              label='プラン名'
              fullWidth
              required
              autoFocus
              placeholder='例: 東京エリア調査タスク'
            />
            <TextField
              label='説明'
              fullWidth
              multiline
              rows={3}
              placeholder='タスクの目的や概要を記入してください'
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='予定日'
                  type='date'
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='所要時間（分）'
                  type='number'
                  fullWidth
                  placeholder='45'
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>キャンセル</Button>
          <Button variant='contained' onClick={() => setFormOpen(false)}>
            登録
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- 情報ダイアログ --- */}
      <Dialog
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        maxWidth='sm'
        fullWidth>
        <DialogTitle>
          <Stack direction='row' spacing={1} alignItems='center'>
            <InfoIcon color='info' />
            <span>システム情報</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            現在のシステムステータスと稼働状況をお知らせします。
          </DialogContentText>
          <Stack spacing={1.5}>
            {[
              { label: 'バージョン', value: 'v2.4.1' },
              { label: '最終更新', value: '2025-03-01 10:30' },
              { label: '稼働機体数', value: '8 / 12' },
              { label: 'サーバーステータス', value: '正常稼働中' },
            ].map((item) => (
              <Stack
                key={item.label}
                direction='row'
                justifyContent='space-between'
                sx={{
                  p: 1.5,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                }}>
                <Typography variant='body2' color='text.secondary'>
                  {item.label}
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  {item.value}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={() => setInfoOpen(false)}>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export const PracticalPatterns: StoryObj = {
  name: '実践パターン',
  render: () => <PracticalPatternsContent />,
}
