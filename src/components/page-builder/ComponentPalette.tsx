/**
 * コンポーネントパレット（左パネル）
 * カテゴリ別にコンポーネントを表示。クリックでキャンバスに追加
 */

import { Box, Typography, Tooltip } from '@mui/material'
import { useMemo } from 'react'

import { COMPONENT_REGISTRY, CATEGORIES } from './registry'

import type { ComponentCategory } from './types'

interface ComponentPaletteProps {
  onAddComponent: (componentId: string) => void
}

export const ComponentPalette = ({ onAddComponent }: ComponentPaletteProps) => {
  const grouped = useMemo(() => {
    const map = new Map<ComponentCategory, typeof COMPONENT_REGISTRY>()
    for (const comp of COMPONENT_REGISTRY) {
      const existing = map.get(comp.category) ?? []
      existing.push(comp)
      map.set(comp.category, existing)
    }
    return map
  }, [])

  return (
    <Box sx={{ p: 1.5, overflow: 'auto', height: '100%' }}>
      <Typography
        sx={{
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          mb: 1.5,
          px: 0.5,
        }}>
        Components
      </Typography>

      {[...grouped.entries()].map(([category, components]) => (
        <Box key={category} sx={{ mb: 2 }}>
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'text.secondary',
              mb: 0.5,
              px: 0.5,
            }}>
            {CATEGORIES[category] ?? category}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {components.map((comp) => (
              <Tooltip
                key={comp.id}
                title={comp.description}
                placement='right'
                arrow>
                <Box
                  onClick={() => onAddComponent(comp.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1,
                    py: 0.75,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: 1,
                      bgcolor: 'primary.main',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                    {comp.name.charAt(0)}
                  </Box>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                    {comp.name}
                  </Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  )
}
