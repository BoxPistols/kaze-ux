// src/components/Table/components/TableToolbar.tsx

import {
  Search as SearchIcon,
  ViewColumn as ViewColumnIcon,
} from '@mui/icons-material'
import { Box, Button, InputAdornment, TextField } from '@mui/material'
import type React from 'react'

interface TableToolbarProps {
  searchable: boolean
  searchTerm: string
  onSearch: (value: string) => void
  onColumnMenuOpen: (event: React.MouseEvent<HTMLElement>) => void
}

export const TableToolbar = ({
  searchable,
  searchTerm,
  onSearch,
  onColumnMenuOpen,
}: TableToolbarProps) => (
  <Box
    sx={{
      mb: 2,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
    {searchable && (
      <TextField
        size='small'
        placeholder='Search...'
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        sx={{ width: 300 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon fontSize='small' color='primary' />
            </InputAdornment>
          ),
        }}
      />
    )}
    <Button
      size='small'
      variant='text'
      color='inherit'
      startIcon={<ViewColumnIcon />}
      onClick={onColumnMenuOpen}
      sx={{
        color: 'text.secondary',
        fontWeight: 400,
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}>
      Columns
    </Button>
  </Box>
)
