// src/components/Table/TableComponents/TableLoading.tsx

import {
  Box,
  Skeleton,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'

import {
  StyledTableCell,
  StyledTableRow,
} from '@/components/Table/TableComponents/StyledComponents'
import type { Column } from '@/types/type'

interface TableLoadingProps {
  columns: Column[]
  showCRUD: boolean
  searchable: boolean
  defaultPageSize: number
}

export const TableLoading = ({
  columns,
  showCRUD,
  searchable,
  defaultPageSize,
}: TableLoadingProps) => (
  <Box sx={{ width: '100%' }}>
    {searchable && (
      <Box sx={{ mb: 2 }}>
        <Skeleton variant='rectangular' width={300} height={40} />
      </Box>
    )}
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <StyledTableCell key={column.accessor}>
                {column.header}
              </StyledTableCell>
            ))}
            {showCRUD && (
              <StyledTableCell align='right'>Actions</StyledTableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: defaultPageSize }).map((_, index) => {
            const uniqueKey = `loading-row-${index}`
            return (
              <StyledTableRow key={uniqueKey}>
                {columns.map((column) => (
                  <StyledTableCell key={column.accessor}>
                    <Skeleton />
                  </StyledTableCell>
                ))}
                {showCRUD && (
                  <StyledTableCell align='right'>
                    <Skeleton width={120} />
                  </StyledTableCell>
                )}
              </StyledTableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
    <Box sx={{ mt: 2 }}>
      <Skeleton variant='rectangular' width='100%' height={52} />
    </Box>
  </Box>
)
