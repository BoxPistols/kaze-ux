/**
 * UTMIncidentRecorder - インシデント記録ウィジェット
 *
 * インシデントの追加・編集・削除を行うコンポーネント
 */

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import WarningIcon from '@mui/icons-material/Warning'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'

interface Incident {
  id: string
  description: string
  timestamp: string
  severity: 'low' | 'medium' | 'high'
}

interface UTMIncidentRecorderProps {
  incidents: Incident[]
  onChange: (incidents: Incident[]) => void
  maxIncidents?: number
}

/**
 * インシデント記録ウィジェットコンポーネント
 */
function UTMIncidentRecorder(props: UTMIncidentRecorderProps): JSX.Element {
  const { incidents, onChange, maxIncidents = 10 } = props

  const [newIncident, setNewIncident] = useState('')
  const [newSeverity, setNewSeverity] = useState<'low' | 'medium' | 'high'>(
    'medium'
  )

  const handleAddIncident = (): void => {
    if (!newIncident.trim()) return
    if (incidents.length >= maxIncidents) return

    const incident: Incident = {
      id: `incident-${Date.now()}`,
      description: newIncident.trim(),
      timestamp: new Date().toISOString(),
      severity: newSeverity,
    }

    onChange([...incidents, incident])
    setNewIncident('')
    setNewSeverity('medium')
  }

  const handleDeleteIncident = (id: string): void => {
    onChange(incidents.filter((inc) => inc.id !== id))
  }

  const getSeverityColor = (
    severity: 'low' | 'medium' | 'high'
  ): 'success' | 'warning' | 'error' => {
    switch (severity) {
      case 'low':
        return 'success'
      case 'medium':
        return 'warning'
      case 'high':
        return 'error'
    }
  }

  const getSeverityLabel = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
      case 'low':
        return '低'
      case 'medium':
        return '中'
      case 'high':
        return '高'
    }
  }

  return (
    <Box>
      <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
        インシデント記録
      </Typography>

      {/* インシデント追加フォーム */}
      <Card variant='outlined' sx={{ mb: 2 }}>
        <CardContent>
          <TextField
            fullWidth
            multiline
            rows={2}
            label='インシデント内容'
            placeholder='インシデントの詳細を入力してください'
            value={newIncident}
            onChange={(e) => setNewIncident(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant='caption' color='text.secondary'>
              重要度:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {(['low', 'medium', 'high'] as const).map((severity) => (
                <Chip
                  key={severity}
                  label={getSeverityLabel(severity)}
                  size='small'
                  color={
                    newSeverity === severity
                      ? getSeverityColor(severity)
                      : 'default'
                  }
                  onClick={() => setNewSeverity(severity)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
            <Button
              variant='contained'
              size='small'
              startIcon={<AddIcon />}
              onClick={handleAddIncident}
              disabled={!newIncident.trim() || incidents.length >= maxIncidents}
              sx={{ ml: 'auto' }}>
              追加
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* インシデントリスト */}
      {incidents.length === 0 ? (
        <Alert severity='info' sx={{ mb: 2 }}>
          インシデントは記録されていません
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {incidents.map((incident) => (
            <Card key={incident.id} variant='outlined'>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <WarningIcon
                    sx={{
                      fontSize: 20,
                      color:
                        incident.severity === 'high'
                          ? 'error.main'
                          : incident.severity === 'medium'
                            ? 'warning.main'
                            : 'success.main',
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body2' gutterBottom>
                      {incident.description}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                        mt: 1,
                      }}>
                      <Chip
                        label={getSeverityLabel(incident.severity)}
                        size='small'
                        color={getSeverityColor(incident.severity)}
                      />
                      <Typography variant='caption' color='text.secondary'>
                        {new Date(incident.timestamp).toLocaleString('ja-JP')}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    size='small'
                    onClick={() => handleDeleteIncident(incident.id)}
                    aria-label='削除'>
                    <DeleteIcon fontSize='small' />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* カウンター */}
      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}>
        {incidents.length} / {maxIncidents} インシデント
      </Typography>
    </Box>
  )
}

export default UTMIncidentRecorder
