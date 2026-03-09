// src/components/ui/table/tableToolbar.tsx
import { Stack, type SxProps, type Theme } from '@mui/material'
import { GridToolbarQuickFilter } from '@mui/x-data-grid'
import type { ReactNode } from 'react'

export interface TableToolbarProps {
  /** ツールバー左側のコンテンツ */
  children: ReactNode
  /** カスタムスタイル */
  sx?: SxProps<Theme>
  /** クイックフィルターを非表示 */
  hideQuickFilter?: boolean
  /** クイックフィルターのプレースホルダー */
  placeholder?: string
}

export const TableToolbar = ({
  children,
  sx,
  hideQuickFilter = false,
  placeholder,
}: TableToolbarProps) => {
  return (
    <Stack
      direction='row'
      sx={{
        justifyContent: 'space-between',
        alignItems: 'end',
        mb: 4,
        ...sx,
      }}>
      {children}
      {!hideQuickFilter && (
        <GridToolbarQuickFilter
          placeholder={placeholder}
          sx={{ minWidth: 200 }}
        />
      )}
    </Stack>
  )
}

export default TableToolbar
