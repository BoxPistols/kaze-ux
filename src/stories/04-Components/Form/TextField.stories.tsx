import SearchIcon from '@mui/icons-material/Search'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { IconButton, InputAdornment, Stack, TextField } from '@mui/material'
import { useState } from 'react'

import type { TextFieldProps } from '@mui/material/TextField'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<TextFieldProps> = {
  title: 'Components/Form/TextField',
  component: TextField,
  tags: ['autodocs'],
  args: {
    label: 'ラベル',
    placeholder: '入力してください',
    variant: 'outlined',
    size: 'small',
    fullWidth: true,
  },
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    variant: {
      control: 'select',
      options: ['outlined', 'filled', 'standard'],
    },
    size: { control: 'radio', options: ['small', 'medium'] },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    helperText: { control: 'text' },
    fullWidth: { control: 'boolean' },
    multiline: { control: 'boolean' },
    rows: { control: 'number' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'MUI TextFieldコンポーネント。テーマでInputLabelのshrink固定、notch非表示、デフォルトsize: small が設定されている。',
      },
    },
  },
}

export default meta
type Story = StoryObj<TextFieldProps>

/**
 * デフォルト表示。Controlsパネルで各propsを操作可能。
 */
export const Default: Story = {}

/**
 * 各状態の一覧
 */
export const States: Story = {
  render: (args) => (
    <Stack spacing={3} sx={{ maxWidth: 400 }}>
      <TextField {...args} label='通常' />
      <TextField
        {...args}
        label='エラー'
        error
        helperText='入力内容にエラーがあります'
      />
      <TextField {...args} label='無効' disabled />
      <TextField {...args} label='必須' required />
    </Stack>
  ),
}

/**
 * アイコン付き
 */
const PasswordToggle = (args: TextFieldProps) => {
  const [show, setShow] = useState(false)
  return (
    <TextField
      {...args}
      label='パスワード'
      type={show ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position='end'>
              <IconButton
                onClick={() => setShow((p) => !p)}
                edge='end'
                size='small'>
                {show ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  )
}

export const WithIcons: Story = {
  name: 'アイコン付き',
  render: (args) => (
    <Stack spacing={3} sx={{ maxWidth: 400 }}>
      <TextField
        {...args}
        label='検索'
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />
      <PasswordToggle {...args} />
    </Stack>
  ),
}

/**
 * マルチライン
 */
export const Multiline: Story = {
  args: {
    label: '備考',
    placeholder: 'テキストを入力してください',
    multiline: true,
    rows: 3,
  },
}
