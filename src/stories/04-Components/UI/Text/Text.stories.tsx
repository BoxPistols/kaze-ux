import { Box, Divider, Stack } from '@mui/material'

import { PageTitle, PageHeader, SectionTitle } from '@/components/ui/text'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof PageTitle> = {
  title: 'Components/UI/Text',
  component: PageTitle,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'テキスト表示コンポーネント群。PageTitle、PageHeader、SectionTitleの各サイズバリエーションを提供する。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: [
        'displayLarge',
        'displayMedium',
        'displaySmall',
        'xxl',
        'xl',
        'lg',
        'ml',
        'md',
        'sm',
        'xs',
      ],
      description: 'タイトルサイズ',
    },
    color: {
      control: 'select',
      options: [
        'text.primary',
        'text.secondary',
        'text.disabled',
        'primary',
        'secondary',
        'success',
        'info',
        'warning',
        'error',
      ],
      description: 'テキストカラー',
    },
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
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'ページタイトル',
    size: 'xl',
    color: 'text.primary',
  },
}

export const AllComponents: Story = {
  render: () => (
    <Stack spacing={3}>
      <PageTitle size='displayMedium' color='primary'>
        PageTitle (Display Medium)
      </PageTitle>
      <PageTitle size='xl'>PageTitle (XL / Default)</PageTitle>
      <Divider />
      <PageHeader title='PageHeader' subtitle='サブタイトル付き' />
      <Divider />
      <SectionTitle>SectionTitle</SectionTitle>
      <SectionTitle required>SectionTitle (必須)</SectionTitle>
    </Stack>
  ),
}
