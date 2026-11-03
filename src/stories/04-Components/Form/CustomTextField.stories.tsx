import { Box } from '@mui/material'

import { CustomTextField } from '@/components/Form/CustomTextField'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof CustomTextField> = {
  title: 'Components/Form/CustomTextField',
  component: CustomTextField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'ツールチップ付きカスタムTextField。ラベル横に情報アイコンを表示し、ホバーで補足説明を提示する。',
      },
    },
  },
  args: {
    label: 'テキストフィールド',
    placeholder: 'ここにテキストを入力',
    size: 'small',
  },
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    required: { control: 'boolean' },
    error: { control: 'boolean' },
    tooltip: { control: 'text' },
    disabled: { control: 'boolean' },
    helperText: { control: 'text' },
    size: { control: 'radio', options: ['small', 'medium'] },
  },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 400 }}>
        <Story />
      </Box>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof CustomTextField>

/** デフォルト表示。Controlsで各propsを操作可能。 */
export const Default: Story = {}

/** ツールチップ付き */
export const WithTooltip: Story = {
  args: {
    tooltip: 'これは役立つツールチップです',
  },
}
