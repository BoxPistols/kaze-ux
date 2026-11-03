import DeleteIcon from '@mui/icons-material/Delete'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import SaveIcon from '@mui/icons-material/Save'
import { Box } from '@mui/material'

import { SplitButton } from '@/components/ui/split-button'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof SplitButton> = {
  title: 'Components/UI/Button/SplitButton',
  component: SplitButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'メインアクション + ドロップダウンメニューの複合ボタン。保存や送信の追加オプションを提供する。danger指定で危険操作を区別。',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'text'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 3 }}>
        <Story />
      </Box>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof SplitButton>

export const Default: Story = {
  args: {
    label: '保存',
    icon: <SaveIcon />,
    onClick: () => alert('保存しました'),
    options: [
      { value: 'saveAs', label: '名前を付けて保存', icon: <FileCopyIcon /> },
      { value: 'saveDraft', label: '下書きとして保存' },
      { value: 'delete', label: '削除', icon: <DeleteIcon />, danger: true },
    ],
    onOptionClick: (option) => alert(`${option.label}が選択されました`),
  },
}
