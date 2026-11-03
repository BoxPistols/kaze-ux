import FolderIcon from '@mui/icons-material/Folder'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import { Box, Grid } from '@mui/material'

import { StatCard } from '@/components/ui/stat-card'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Data Display/StatCard',
  component: StatCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          '数値ひとつを主役にするカード。ダッシュボードの KPI、進捗、集計結果に使う。',
          '',
          'saas-dashboard と sky-kaze がそれぞれ独自に組んでいたものを DS に集約した。',
          '数値は等幅（KAZE_PRINT）で置く。桁が変わったときに横幅が跳ねると、',
          '並べたカードの端が揃わなくなるため。',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    value: { control: 'text' },
    label: { control: 'text' },
    caption: { control: 'text' },
    interactive: { control: 'boolean' },
    accentColor: { control: 'color' },
  },
  args: {
    label: 'Active Projects',
    value: 11,
  },
} satisfies Meta<typeof StatCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithTrend: Story = {
  args: {
    label: 'Active Contacts',
    value: 12,
    trend: { direction: 'up', value: '+8%' },
    caption: 'vs last month',
    icon: <FolderIcon color='primary' />,
  },
}

/**
 * 増えたことが良いとは限らない指標がある。
 * `upIsGood: false` を渡すと、上向きでも警告の色で出る。
 */
export const TrendWhereUpIsBad: Story = {
  args: {
    label: 'インシデント',
    value: 5,
    trend: { direction: 'up', value: '+2 件', upIsGood: false },
    caption: '前週比',
  },
}

export const WithProgress: Story = {
  args: {
    label: '点検進捗',
    value: '3/8',
    progress: { value: 3, max: 8 },
  },
}

/** 分母が 0 でも NaN にせず 0% として描く */
export const ProgressWithZeroMax: Story = {
  args: {
    label: '未着手',
    value: '0/0',
    progress: { value: 0, max: 0 },
  },
}

export const WithCaption: Story = {
  args: {
    label: '売上合計',
    value: '¥86,000',
    caption: '平均 ¥1,200/件',
    icon: <LocalShippingIcon color='warning' />,
  },
}

/** 一覧に並べて選ばせる用途では hover で持ち上げる */
export const Interactive: Story = {
  args: {
    label: 'Total Tasks',
    value: 38,
    trend: { direction: 'down', value: '-3%' },
    caption: 'vs last week',
    interactive: true,
  },
}

/** 実際の使われ方。桁数が違っても数値の左端が揃う */
export const Dashboard: Story = {
  render: () => (
    <Box sx={{ maxWidth: 1040 }}>
      <Grid container spacing={2.5}>
        {[
          {
            label: 'Active Projects',
            value: 11,
            trend: {
              direction: 'up' as const,
              value: '+12%',
              caption: 'vs last month',
            },
          },
          {
            label: 'Active Contacts',
            value: 12,
            trend: {
              direction: 'up' as const,
              value: '+8%',
              caption: 'vs last month',
            },
          },
          {
            label: 'Total Budget',
            value: '¥86.0M',
            trend: {
              direction: 'up' as const,
              value: '+15%',
              caption: 'vs last quarter',
            },
          },
          {
            label: 'Total Tasks',
            value: 38,
            trend: {
              direction: 'down' as const,
              value: '-3%',
              caption: 'vs last week',
            },
          },
        ].map((s) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={s.label}>
            <StatCard {...s} interactive />
          </Grid>
        ))}
      </Grid>
    </Box>
  ),
}
