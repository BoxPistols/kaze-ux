// src/components/Table/components/TableRows.tsx

import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'

import {
  StyledTableCell,
  StyledTableRow,
} from '@/components/Table/TableComponents/StyledComponents'
import { formatCellValue } from '@/components/Table/utils/formatters'
import type { Column } from '@/types/type'

interface TableRowsProps {
  visibleData: Array<Record<string, string | number | boolean>>
  columns: Column[]
  visibleColumns: Set<string>
  showCRUD: boolean
  onView: (row: Record<string, string | number | boolean>) => void
  onEdit: (row: Record<string, string | number | boolean>) => void
  onDelete: (row: Record<string, string | number | boolean>) => void
}

export const TableRows = ({
  visibleData,
  columns,
  visibleColumns,
  showCRUD,
  onView,
  onEdit,
  onDelete,
}: TableRowsProps) => (
  <>
    {visibleData.map((row) => (
      <StyledTableRow key={String(row.id)}>
        {columns
          .filter((col) => visibleColumns.has(col.accessor))
          .map((column) => (
            <StyledTableCell key={column.accessor} align={column.align}>
              {formatCellValue(row[column.accessor])}
            </StyledTableCell>
          ))}
        {showCRUD && (
          <StyledTableCell align='center' sx={{ whiteSpace: 'nowrap' }}>
            <Tooltip arrow title='View'>
              <IconButton
                size='small'
                onClick={() => onView(row)}
                color='secondary'
                sx={{ mr: 1 }}>
                <VisibilityIcon fontSize='small' />
              </IconButton>
            </Tooltip>
            <Tooltip arrow title='Edit'>
              <IconButton
                size='small'
                onClick={() => onEdit(row)}
                color='secondary'
                sx={{ mr: 1 }}>
                <EditIcon fontSize='small' />
              </IconButton>
            </Tooltip>
            <Tooltip arrow title='Delete'>
              <IconButton
                size='small'
                onClick={() => onDelete(row)}
                color='secondary'>
                <DeleteIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          </StyledTableCell>
        )}
      </StyledTableRow>
    ))}
  </>
)
