/**
 * レイヤー制御パネル
 */

import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Layers as LayersIcon,
} from '@mui/icons-material'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Divider,
} from '@mui/material'
import { useState, useCallback } from 'react'

import { LAYER_GROUPS, getAllRestrictionZones } from '@/lib/map'

import type { LayerPanelProps } from './types'

function LayerPanel({
  layerStates,
  restrictionStates,
  opacity,
  darkMode,
  onLayerToggle,
  onRestrictionToggle,
  onOpacityChange,
  onClose,
}: LayerPanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(['関東'])
  )

  const handleGroupExpand = useCallback((groupName: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupName)) {
        next.delete(groupName)
      } else {
        next.add(groupName)
      }
      return next
    })
  }, [])

  const restrictionZones = getAllRestrictionZones()

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        width: 280,
        maxHeight: 'calc(100% - 32px)',
        overflow: 'auto',
        backgroundColor: darkMode ? 'grey.900' : 'background.paper',
        zIndex: 1000,
      }}>
      {/* ヘッダー */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LayersIcon fontSize='small' />
          <Typography variant='subtitle1' fontWeight='bold'>
            レイヤー
          </Typography>
        </Box>
        <IconButton size='small' onClick={onClose} aria-label='閉じる'>
          <CloseIcon fontSize='small' />
        </IconButton>
      </Box>

      {/* 透明度スライダー */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant='caption' color='text.secondary'>
          レイヤー透明度
        </Typography>
        <Slider
          value={opacity}
          onChange={(_, value) => onOpacityChange(value as number)}
          min={0}
          max={1}
          step={0.1}
          size='small'
          valueLabelDisplay='auto'
          valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
        />
      </Box>

      <Divider />

      {/* 飛行制限区域 */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant='subtitle2'>飛行制限区域</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          {restrictionZones.map((zone) => (
            <FormControlLabel
              key={zone.id}
              control={
                <Checkbox
                  size='small'
                  checked={restrictionStates.get(zone.id) ?? false}
                  onChange={() => onRestrictionToggle(zone.id)}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '2px',
                      backgroundColor: zone.color,
                    }}
                  />
                  <Typography variant='body2'>{zone.name}</Typography>
                </Box>
              }
              sx={{ width: '100%', mx: 0 }}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      <Divider />

      {/* DID（人口集中地区） */}
      <Typography variant='subtitle2' sx={{ px: 2, py: 1 }}>
        人口集中地区（DID）
      </Typography>

      {LAYER_GROUPS.map((group) => {
        const isExpanded = expandedGroups.has(group.name)

        return (
          <Accordion
            key={group.name}
            expanded={isExpanded}
            onChange={() => handleGroupExpand(group.name)}
            sx={{ '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='body2' fontWeight='medium'>
                {group.name}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, maxHeight: 200, overflow: 'auto' }}>
              {group.layers.map((layer) => {
                const state = layerStates.get(layer.id)
                const isLoading = state?.loading ?? false
                const isVisible = state?.visible ?? false

                return (
                  <FormControlLabel
                    key={layer.id}
                    control={
                      isLoading ? (
                        <CircularProgress size={20} sx={{ mx: 1 }} />
                      ) : (
                        <Checkbox
                          size='small'
                          checked={isVisible}
                          onChange={() => onLayerToggle(layer.id)}
                        />
                      )
                    }
                    label={
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '2px',
                            backgroundColor: layer.color,
                          }}
                        />
                        <Typography variant='body2' noWrap>
                          {layer.name}
                        </Typography>
                      </Box>
                    }
                    sx={{ width: '100%', mx: 0 }}
                  />
                )
              })}
            </AccordionDetails>
          </Accordion>
        )
      })}
    </Paper>
  )
}

export { LayerPanel }
