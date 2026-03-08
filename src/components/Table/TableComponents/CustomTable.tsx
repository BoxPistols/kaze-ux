// src/components/Table/TableComponents/CustomTable.tsx

import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Menu,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import type React from 'react'

import { useTableSearch, useTableSort } from '@/components/Table/hooks'
import {
  TableHeader,
  TableLoading,
  TableRows,
  TableToolbar,
} from '@/components/Table/TableComponents'
import type { TableProps } from '@/types/type'

export const CustomTable = ({
  columns = [],
  data = [],
  showCRUD = false,
  onView = () => {},
  onEdit = () => {},
  onDelete = () => {},
  searchable = false,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  loading = false,
}: TableProps) => {
  // Pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize)

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((col) => col.accessor))
  )
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(
    null
  )

  // Hooks for sorting and searching
  const { sortedData, sortConfig, handleSort } = useTableSort(data)
  const { searchTerm, filteredData, handleSearch } = useTableSearch(sortedData)

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', py: 2 }}>
        <Typography variant='body2' color='text.secondary'>
          No data available
        </Typography>
      </Box>
    )
  }

  // Loading state
  if (loading) {
    return (
      <TableLoading
        columns={columns}
        showCRUD={showCRUD}
        searchable={searchable}
        defaultPageSize={defaultPageSize}
      />
    )
  }

  // Pagination handlers
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  // Column visibility handler
  const handleColumnVisibilityChange = (accessor: string) => {
    const newVisibleColumns = new Set(visibleColumns)
    if (newVisibleColumns.has(accessor)) {
      newVisibleColumns.delete(accessor)
    } else {
      newVisibleColumns.add(accessor)
    }
    setVisibleColumns(newVisibleColumns)
  }

  // Calculate visible data based on current page
  const visibleData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  return (
    <Box sx={{ width: '100%' }}>
      <TableToolbar
        searchable={searchable}
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onColumnMenuOpen={(e) => setColumnMenuAnchor(e.currentTarget)}
      />

      <Menu
        anchorEl={columnMenuAnchor}
        open={Boolean(columnMenuAnchor)}
        onClose={() => setColumnMenuAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          backdrop: { invisible: true },
          paper: {
            elevation: 3,
            sx: {
              mt: 1,
              minWidth: 180,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            },
          },
        }}>
        <FormGroup sx={{ px: 2, py: 1 }}>
          {columns.map((column) => (
            <FormControlLabel
              key={column.accessor}
              control={
                <Checkbox
                  checked={visibleColumns.has(column.accessor)}
                  onChange={() => handleColumnVisibilityChange(column.accessor)}
                  size='small'
                />
              }
              label={column.header}
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
            />
          ))}
        </FormGroup>
      </Menu>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 1,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          mb: 2,
        }}>
        <Table
          sx={{ minWidth: '100%' }}
          aria-label='custom table'
          size='medium'>
          <TableHeader
            columns={columns}
            visibleColumns={visibleColumns}
            sortConfig={sortConfig}
            showCRUD={showCRUD}
            onSort={handleSort}
          />
          <TableBody>
            <TableRows
              visibleData={visibleData}
              columns={columns}
              visibleColumns={visibleColumns}
              showCRUD={showCRUD}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component='div'
        rowsPerPageOptions={pageSizeOptions}
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows':
            {
              my: 'auto',
            },
        }}
      />
    </Box>
  )
}

export default CustomTable
