/**
 * UTMSitePostflightForm - サイト別ポストフライトフォーム
 *
 * マルチサイトフライトにおける各サイトごとのインシデント・ノート記録
 */

import { Box, TextField, Typography } from '@mui/material'
import { useState, useEffect } from 'react'

import type { SiteInfo } from '@/types/utmTypes'

import UTMIncidentRecorder from './UTMIncidentRecorder'

interface Incident {
  id: string
  description: string
  timestamp: string
  severity: 'low' | 'medium' | 'high'
}

interface SitePostflightData {
  siteId: string
  siteName: string
  incidents: Incident[]
  notes: string
}

interface UTMSitePostflightFormProps {
  site: SiteInfo
  data?: SitePostflightData
  onChange: (data: SitePostflightData) => void
}

/**
 * サイト別ポストフライトフォームコンポーネント
 */
function UTMSitePostflightForm(props: UTMSitePostflightFormProps): JSX.Element {
  const { site, data, onChange } = props

  const [incidents, setIncidents] = useState<Incident[]>(data?.incidents ?? [])
  const [notes, setNotes] = useState(data?.notes ?? '')

  // データが変更されたら親コンポーネントに通知
  useEffect(() => {
    onChange({
      siteId: site.id,
      siteName: site.name,
      incidents,
      notes,
    })
  }, [incidents, notes, site.id, site.name, onChange])

  return (
    <Box>
      <Typography variant='h6' fontWeight='bold' gutterBottom>
        {site.name}
      </Typography>
      <Typography variant='body2' color='text.secondary' gutterBottom>
        {site.description ?? `サイトID: ${site.id}`}
      </Typography>
      <Typography
        variant='caption'
        color='text.secondary'
        display='block'
        sx={{ mb: 3 }}>
        ドローン数: {site.drones.length}機
      </Typography>

      {/* インシデント記録 */}
      <Box sx={{ mb: 3 }}>
        <UTMIncidentRecorder incidents={incidents} onChange={setIncidents} />
      </Box>

      {/* サイト別ノート */}
      <Box>
        <TextField
          fullWidth
          multiline
          rows={4}
          label='サイト別ノート'
          placeholder='この拠点での特記事項があれば入力してください'
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          helperText={`${notes.length} / 500 文字`}
          inputProps={{ maxLength: 500 }}
        />
      </Box>
    </Box>
  )
}

export default UTMSitePostflightForm
