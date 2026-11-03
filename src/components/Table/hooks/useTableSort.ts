// src/components/Table/hooks/useTableSort.ts
import { useMemo, useState } from 'react'

import type { SortConfig } from '@/types/type'

export const useTableSort = <T extends Record<string, unknown>>(
  data: Array<T>
) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: '',
    direction: 'asc',
  })

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === bValue) return 0
      if (sortConfig.direction === 'asc') {
        return (aValue as string | number) < (bValue as string | number)
          ? -1
          : 1
      }
      return (aValue as string | number) > (bValue as string | number) ? -1 : 1
    })
  }, [data, sortConfig])

  const handleSort = (accessor: string) => {
    const newDirection =
      sortConfig.key === accessor && sortConfig.direction === 'asc'
        ? 'desc'
        : 'asc'
    setSortConfig({ key: accessor, direction: newDirection })
  }

  return { sortedData, sortConfig, handleSort }
}
