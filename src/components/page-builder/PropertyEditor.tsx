/**
 * プロパティエディタ（右パネル）
 * 選択中のノードのプロパティを GUI で編集
 */

import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material'

import { getComponentMeta } from './registry'

import type { CanvasNode } from './types'

interface PropertyEditorProps {
  selectedNode: CanvasNode | null
  onUpdateProps: (nodeId: string, props: Record<string, unknown>) => void
  onRemoveNode: (nodeId: string) => void
}

export const PropertyEditor = ({
  selectedNode,
  onUpdateProps,
  onRemoveNode,
}: PropertyEditorProps) => {
  if (!selectedNode) {
    return (
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'text.secondary',
        }}>
        <Typography sx={{ fontSize: '0.8rem' }}>
          コンポーネントを選択してください
        </Typography>
      </Box>
    )
  }

  const meta = getComponentMeta(selectedNode.componentId)
  if (!meta) return null

  const handleChange = (name: string, value: unknown) => {
    onUpdateProps(selectedNode.id, { [name]: value })
  }

  return (
    <Box sx={{ p: 1.5, overflow: 'auto', height: '100%' }}>
      <Typography
        sx={{
          fontSize: '0.85rem',
          fontWeight: 700,
          mb: 0.5,
        }}>
        {meta.name}
      </Typography>
      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mb: 2 }}>
        {meta.description}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {meta.propSchema.map((schema) => {
        const currentValue =
          selectedNode.props[schema.name] ?? schema.defaultValue

        if (schema.type === 'string') {
          return (
            <Box key={schema.name} sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  mb: 0.5,
                }}>
                {schema.label}
              </Typography>
              <TextField
                size='small'
                fullWidth
                value={currentValue as string}
                onChange={(e) => handleChange(schema.name, e.target.value)}
                sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }}
              />
            </Box>
          )
        }

        if (schema.type === 'select' && schema.options) {
          return (
            <Box key={schema.name} sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  mb: 0.5,
                }}>
                {schema.label}
              </Typography>
              <Select
                size='small'
                fullWidth
                value={currentValue as string}
                onChange={(e) => handleChange(schema.name, e.target.value)}
                sx={{ fontSize: '0.8rem' }}>
                {schema.options.map((opt) => (
                  <MenuItem key={opt} value={opt} sx={{ fontSize: '0.8rem' }}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )
        }

        if (schema.type === 'boolean') {
          return (
            <Box key={schema.name} sx={{ mb: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    size='small'
                    checked={currentValue as boolean}
                    onChange={(e) =>
                      handleChange(schema.name, e.target.checked)
                    }
                  />
                }
                label={
                  <Typography sx={{ fontSize: '0.8rem' }}>
                    {schema.label}
                  </Typography>
                }
              />
            </Box>
          )
        }

        if (schema.type === 'number') {
          return (
            <Box key={schema.name} sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  mb: 0.5,
                }}>
                {schema.label}
              </Typography>
              <TextField
                size='small'
                fullWidth
                type='number'
                value={currentValue as number}
                onChange={(e) =>
                  handleChange(schema.name, Number(e.target.value))
                }
                sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }}
              />
            </Box>
          )
        }

        return null
      })}

      <Divider sx={{ my: 2 }} />

      <Box
        onClick={() => onRemoveNode(selectedNode.id)}
        sx={{
          px: 1.5,
          py: 0.75,
          borderRadius: 1.5,
          cursor: 'pointer',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'error.main',
          border: '1px solid',
          borderColor: 'error.main',
          transition: 'all 0.15s',
          '&:hover': { bgcolor: 'error.main', color: '#fff' },
        }}>
        削除
      </Box>
    </Box>
  )
}
