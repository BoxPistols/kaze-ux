import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof Table> = {
  title: 'Components/UI/Table/Table',
  component: Table,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'MUI Tableコンポーネント。カスタムTableContainer、TableHead、TableBody、TableCellのスタイリングがテーマで適用されている。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['medium', 'small'],
      description: 'テーブルの密度',
    },
    stickyHeader: { control: 'boolean', description: '固定ヘッダー' },
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 3, maxWidth: 960 }}>
        <Story />
      </Box>
    ),
  ],
}

export default meta

interface DeviceData {
  id: string
  name: string
  model: string
  status: '稼働中' | '待機中' | 'メンテナンス' | 'オフライン'
  battery: number
  location: string
}

const statusColorMap: Record<
  DeviceData['status'],
  'success' | 'info' | 'warning' | 'default'
> = {
  稼働中: 'success',
  待機中: 'info',
  メンテナンス: 'warning',
  オフライン: 'default',
}

const deviceRows: DeviceData[] = [
  {
    id: 'DEV-001',
    name: 'センサーAlpha',
    model: 'Model X-300',
    status: '稼働中',
    battery: 82,
    location: '東京都江東区',
  },
  {
    id: 'DEV-002',
    name: 'モニターBeta',
    model: 'Model Y-400',
    status: '待機中',
    battery: 100,
    location: '千葉県幕張',
  },
  {
    id: 'DEV-003',
    name: 'トラッカーGamma',
    model: 'Model Z-500',
    status: 'メンテナンス',
    battery: 45,
    location: '大阪府大阪市',
  },
  {
    id: 'DEV-004',
    name: 'サーベイヤーDelta',
    model: 'Model X-350',
    status: '稼働中',
    battery: 67,
    location: '愛知県名古屋市',
  },
  {
    id: 'DEV-005',
    name: 'パトロールEpsilon',
    model: 'Model Y-450',
    status: 'オフライン',
    battery: 0,
    location: '福岡県福岡市',
  },
]

export const Default: StoryObj<typeof Table> = {
  args: {
    size: 'medium',
    stickyHeader: false,
  },
  render: (args) => (
    <TableContainer>
      <Table {...args}>
        <TableHead>
          <TableRow>
            <TableCell>デバイス名</TableCell>
            <TableCell>モデル</TableCell>
            <TableCell>ステータス</TableCell>
            <TableCell align='right'>バッテリー</TableCell>
            <TableCell>所在地</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {deviceRows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>
                <Typography variant='body2' fontWeight={500}>
                  {row.name}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {row.id}
                </Typography>
              </TableCell>
              <TableCell>{row.model}</TableCell>
              <TableCell>
                <Chip
                  label={row.status}
                  color={statusColorMap[row.status]}
                  size='small'
                />
              </TableCell>
              <TableCell align='right'>
                <Typography
                  variant='body2'
                  sx={{
                    color:
                      row.battery >= 70
                        ? 'success.main'
                        : row.battery >= 30
                          ? 'warning.main'
                          : 'error.main',
                    fontWeight: 600,
                  }}>
                  {row.battery}%
                </Typography>
              </TableCell>
              <TableCell>{row.location}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ),
}
