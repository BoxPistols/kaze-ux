import { Box, Button, MenuItem, Select, Typography } from '@mui/material'
import { useEffect, useMemo, useRef, type ReactElement } from 'react'

type PaginationRenderProps<T> = {
  /** 現在のページのアイテム */
  pageItems: T[]
  /** 全アイテム数 */
  totalItemsCount: number
}

export type PaginationProps<T> = {
  /** 全アイテム配列 */
  items: T[]
  /** 現在のページ番号（1始まり） */
  currentPage: number
  /** 1ページあたりの表示件数 */
  pageSize: number
  /** ページ変更時のコールバック */
  onPageChange: (page: number) => void
  /** ページサイズ変更時のコールバック */
  onPageSizeChange: (size: number) => void
  /** ページサイズ選択肢 */
  pageSizeOptions?: number[]
  /** レンダー関数（pageItemsを受け取ってテーブルなどを表示） */
  children: (args: PaginationRenderProps<T>) => ReactElement
}

/**
 * ページネーションコンポーネント
 * テーブルやリストのページング処理を提供
 */
export const Pagination = <T,>({
  items,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [20, 50, 100],
  children,
}: PaginationProps<T>) => {
  const isFirstRender = useRef<boolean>(true)
  const totalItemsCount = items.length
  const totalItemsCountRef = useRef<number>(totalItemsCount)

  const { pageItems, totalPages, startIndex, endIndex } = useMemo(() => {
    const totalPagesCalc = Math.max(1, Math.ceil(totalItemsCount / pageSize))
    const safePage = Math.min(currentPage, totalPagesCalc)
    const start = totalItemsCount === 0 ? 0 : (safePage - 1) * pageSize
    const end = Math.min(start + pageSize, totalItemsCount)
    const slice = items.slice(start, end)
    return {
      pageItems: slice,
      totalPages: totalPagesCalc,
      startIndex: start,
      endIndex: end,
    }
  }, [items, totalItemsCount, currentPage, pageSize])

  useEffect(() => {
    // 2回目以降のレンダリングで、totalItemsCountが変わったら、1ページ目に戻す
    if (
      !isFirstRender.current &&
      totalItemsCountRef.current !== totalItemsCount
    ) {
      onPageChange(1)
      totalItemsCountRef.current = totalItemsCount
    } else {
      isFirstRender.current = false
    }
  }, [totalItemsCount, onPageChange])

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5
    if (totalPages <= maxVisiblePages) {
      for (let page = 1; page <= totalPages; page++) pages.push(page)
    } else if (currentPage <= 3) {
      for (let page = 1; page <= 4; page++) pages.push(page)
      pages.push('...')
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 2) {
      pages.push(1)
      pages.push('...')
      for (let page = totalPages - 3; page <= totalPages; page++)
        pages.push(page)
    } else {
      pages.push(1)
      pages.push('...')
      for (let page = currentPage - 1; page <= currentPage + 1; page++)
        pages.push(page)
      pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <>
      {children({ pageItems, totalItemsCount })}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 2,
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant='body2'>
            {totalItemsCount === 0
              ? '0 / 0 件'
              : `${startIndex + 1} - ${endIndex} / ${totalItemsCount} 件`}
          </Typography>
          <Typography variant='body2'>表示件数:</Typography>
          <Select
            value={pageSize}
            size='small'
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            sx={{ height: 32 }}>
            {pageSizeOptions.map((size) => (
              <MenuItem key={size} value={size}>
                {size}件
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant='outlined'
            size='small'
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}>
            前へ
          </Button>
          {getPageNumbers().map((page, index) => (
            <Box key={`${page}-${index}`}>
              {typeof page !== 'number' ? (
                <Typography variant='body2' sx={{ px: 1.5 }}>
                  {page}
                </Typography>
              ) : (
                <Button
                  variant={currentPage === page ? 'contained' : 'outlined'}
                  size='small'
                  onClick={() => onPageChange(page)}
                  sx={{ minWidth: 40 }}>
                  {page}
                </Button>
              )}
            </Box>
          ))}
          <Button
            variant='outlined'
            size='small'
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}>
            次へ
          </Button>
        </Box>
      </Box>
    </>
  )
}
