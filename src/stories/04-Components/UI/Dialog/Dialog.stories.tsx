import { Box, Button, TextField } from '@mui/material'
import { useState } from 'react'
import { action } from 'storybook/actions'

import { ConfirmDialog } from '@/components/ui/dialog/confirmDialog'
import { FormDialog } from '@/components/ui/dialog/formDialog'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Components/UI/Dialog',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'ダイアログコンポーネント群。FormDialog(フォーム入力)とConfirmDialog(確認・削除・警告)の2種類を提供。ローディング状態やカスタムサイズに対応。',
      },
    },
  },
  argTypes: {
    title: { control: 'text' },
    confirmColor: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
    },
    confirmVariant: {
      control: 'select',
      options: ['text', 'outlined', 'contained'],
    },
    maxWidth: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    loading: { control: 'boolean' },
  },
}

export default meta

export const ConfirmDialogPlayground: StoryObj = {
  args: {
    title: '確認',
    message: 'この操作を実行しますか？',
    confirmText: '実行',
    cancelText: 'キャンセル',
    confirmColor: 'primary',
    confirmVariant: 'contained',
    maxWidth: 'xs',
    loading: false,
  },
  argTypes: {
    message: { control: 'text' },
    confirmText: { control: 'text' },
    cancelText: { control: 'text' },
  },
  render: (args: Record<string, unknown>) => {
    const Demo = () => {
      const [open, setOpen] = useState(false)
      return (
        <>
          <Button variant='contained' onClick={() => setOpen(true)}>
            ConfirmDialog を開く
          </Button>
          <ConfirmDialog
            open={open}
            title={args.title as string}
            message={args.message as string}
            confirmText={args.confirmText as string}
            cancelText={args.cancelText as string}
            confirmColor={args.confirmColor as 'primary' | 'error' | 'warning'}
            confirmVariant={
              args.confirmVariant as 'text' | 'outlined' | 'contained'
            }
            maxWidth={args.maxWidth as 'xs' | 'sm' | 'md'}
            loading={args.loading as boolean}
            onConfirm={() => {
              action('onConfirm')()
              setOpen(false)
            }}
            onCancel={() => {
              action('onCancel')()
              setOpen(false)
            }}
          />
        </>
      )
    }
    return <Demo />
  },
}

export const FormDialogPlayground: StoryObj = {
  args: {
    title: '新規作成',
    description: '必要な情報を入力してください',
    submitText: '保存',
    cancelText: 'キャンセル',
    maxWidth: 'sm',
    loading: false,
  },
  argTypes: {
    description: { control: 'text' },
    submitText: { control: 'text' },
    cancelText: { control: 'text' },
  },
  render: (args: Record<string, unknown>) => {
    const Demo = () => {
      const [open, setOpen] = useState(false)
      return (
        <>
          <Button variant='contained' onClick={() => setOpen(true)}>
            FormDialog を開く
          </Button>
          <FormDialog
            open={open}
            title={args.title as string}
            description={args.description as string}
            submitText={args.submitText as string}
            cancelText={args.cancelText as string}
            maxWidth={args.maxWidth as 'xs' | 'sm' | 'md'}
            loading={args.loading as boolean}
            onSubmit={() => {
              action('onSubmit')()
              setOpen(false)
            }}
            onCancel={() => {
              action('onCancel')()
              setOpen(false)
            }}>
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField label='タイトル' fullWidth />
              <TextField label='説明' fullWidth multiline rows={3} />
            </Box>
          </FormDialog>
        </>
      )
    }
    return <Demo />
  },
}
