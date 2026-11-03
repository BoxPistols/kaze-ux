import { Box, Typography, List, ListItem, ListItemText } from '@mui/material'
import { useState } from 'react'

import { Pagination } from '@/components/ui/pagination/pagination'

import type { Meta, StoryObj } from '@storybook/react-vite'

// サンプルデータ
const generateItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `アイテム ${i + 1}`,
  }))

const meta: Meta<typeof Pagination> = {
  title: 'Components/UI/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '汎用ページネーションコンポーネント。Render Props パターンで子要素にページ済みデータを提供する。ページサイズ変更にも対応。',
      },
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
type Story = StoryObj<typeof Pagination>

export const Default: Story = {
  render: () => {
    const PaginationDemo = () => {
      const [page, setPage] = useState(1)
      const [pageSize, setPageSize] = useState(10)
      const items = generateItems(100)

      return (
        <Pagination
          items={items}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}>
          {({ pageItems }) => (
            <List>
              {pageItems.map((item) => (
                <ListItem key={item.id}>
                  <ListItemText primary={item.name} />
                </ListItem>
              ))}
            </List>
          )}
        </Pagination>
      )
    }
    return <PaginationDemo />
  },
}

export const FewPages: Story = {
  render: () => {
    const PaginationFewDemo = () => {
      const [page, setPage] = useState(1)
      const [pageSize, setPageSize] = useState(10)
      const items = generateItems(30)

      return (
        <Pagination
          items={items}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}>
          {({ pageItems, totalItemsCount }) => (
            <Box>
              <Typography variant='body2' sx={{ mb: 1 }}>
                全 {totalItemsCount} 件
              </Typography>
              <List>
                {pageItems.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemText primary={item.name} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Pagination>
      )
    }
    return <PaginationFewDemo />
  },
}

export const ManyPages: Story = {
  render: () => {
    const PaginationManyDemo = () => {
      const [page, setPage] = useState(5)
      const [pageSize, setPageSize] = useState(10)
      const items = generateItems(500)

      return (
        <Pagination
          items={items}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}>
          {({ pageItems, totalItemsCount }) => (
            <Box>
              <Typography variant='body2' sx={{ mb: 1 }}>
                全 {totalItemsCount} 件中 {pageItems.length} 件を表示
              </Typography>
              <List>
                {pageItems.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemText primary={item.name} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Pagination>
      )
    }
    return <PaginationManyDemo />
  },
}
