// src/components/Table/components/StyledComponents.tsx
// テーマのグローバルスタイルに準拠したテーブルコンポーネント
import { TableCell, TableRow, styled } from '@mui/material'
import { tableCellClasses } from '@mui/material/TableCell'

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor:
      theme.palette.mode === 'light'
        ? 'rgba(0, 0, 0, 0.02)'
        : 'rgba(255, 255, 255, 0.03)',
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: '12px 16px',
    whiteSpace: 'nowrap',
    '& .MuiTableSortLabel-root': {
      color: theme.palette.text.secondary,
      '&:hover': {
        color: theme.palette.text.primary,
      },
      '&.Mui-active': {
        color: theme.palette.text.primary,
        '& .MuiTableSortLabel-icon': {
          color: theme.palette.primary.main,
        },
      },
    },
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '0.875rem',
    color: theme.palette.text.primary,
    padding: '14px 16px',
    borderBottom: `1px solid ${
      theme.palette.mode === 'light'
        ? 'rgba(0, 0, 0, 0.06)'
        : 'rgba(255, 255, 255, 0.06)'
    }`,
  },
}))

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.02)'
        : theme.palette.grey[50],
  },
  '&:hover': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.06)'
        : theme.palette.action.hover,
  },
  // '&:last-child td, &:last-child th': {
  //   border: 0,
  // },
}))
