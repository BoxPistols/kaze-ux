import { Alert, Box } from '@mui/material'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof Alert> = {
  title: 'Components/UI/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'MUI Alertコンポーネント。standard/outlined/filledバリアント、4段階の重要度、カスタムborderRadiusとカラーテーマが適用されている。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    severity: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
    },
    variant: {
      control: 'select',
      options: ['standard', 'outlined', 'filled'],
    },
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 3, maxWidth: 600 }}>
        <Story />
      </Box>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Alert>

export const Default: Story = {
  args: {
    severity: 'info',
    variant: 'standard',
    children: 'システムメンテナンスを予定しています。',
  },
}
