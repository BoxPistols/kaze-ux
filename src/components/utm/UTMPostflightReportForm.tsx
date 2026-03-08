/**
 * UTMPostflightReportForm - ポストフライトレポートフォーム
 *
 * フライト全体のインシデント、ノート、添付ファイルを記録
 */

import AttachFileIcon from '@mui/icons-material/AttachFile'
import DeleteIcon from '@mui/icons-material/Delete'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'

import UTMIncidentRecorder from './UTMIncidentRecorder'

interface Incident {
  id: string
  description: string
  timestamp: string
  severity: 'low' | 'medium' | 'high'
}

interface Attachment {
  id: string
  url: string
  type: 'image' | 'video' | 'document' | 'log' | 'other'
  name: string
  size: number
  uploadedAt: Date
}

interface PostflightReportData {
  incidents: Incident[]
  notes: string
  attachments: Attachment[]
}

interface UTMPostflightReportFormProps {
  data: PostflightReportData
  onChange: (data: PostflightReportData) => void
  maxNoteLength?: number
  maxAttachments?: number
}

/**
 * ポストフライトレポートフォームコンポーネント
 */
function UTMPostflightReportForm(
  props: UTMPostflightReportFormProps
): JSX.Element {
  const { data, onChange, maxNoteLength = 1000, maxAttachments = 10 } = props

  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleIncidentsChange = (incidents: Incident[]): void => {
    onChange({ ...data, incidents })
  }

  const handleNotesChange = (notes: string): void => {
    onChange({ ...data, notes })
  }

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setUploadError(null)

    const files = event.target.files
    if (!files || files.length === 0) return

    if (data.attachments.length + files.length > maxAttachments) {
      setUploadError(`添付ファイルは最大${maxAttachments}個までです`)
      return
    }

    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: URL.createObjectURL(file),
      type: getFileType(file.type),
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
    }))

    onChange({ ...data, attachments: [...data.attachments, ...newAttachments] })

    // inputをリセット
    event.target.value = ''
  }

  const handleDeleteAttachment = (id: string): void => {
    onChange({
      ...data,
      attachments: data.attachments.filter((att) => att.id !== id),
    })
  }

  const getFileType = (mimeType: string): Attachment['type'] => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.includes('pdf') || mimeType.includes('document'))
      return 'document'
    if (mimeType.includes('log') || mimeType.includes('text')) return 'log'
    return 'other'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getTypeLabel = (type: Attachment['type']): string => {
    switch (type) {
      case 'image':
        return '画像'
      case 'video':
        return '動画'
      case 'document':
        return '文書'
      case 'log':
        return 'ログ'
      case 'other':
        return 'その他'
    }
  }

  return (
    <Box>
      {/* 全体インシデント */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h6' fontWeight='bold' gutterBottom>
          全体インシデント
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          フライト全体で発生したインシデントを記録してください
        </Typography>
        <UTMIncidentRecorder
          incidents={data.incidents}
          onChange={handleIncidentsChange}
        />
      </Box>

      {/* 全体ノート */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h6' fontWeight='bold' gutterBottom>
          全体ノート
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          フライト全体の特記事項、改善点、気づきなどを記録してください
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={6}
          label='全体ノート'
          placeholder='フライト全体に関する情報を入力してください'
          value={data.notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          helperText={`${data.notes.length} / ${maxNoteLength} 文字`}
          inputProps={{ maxLength: maxNoteLength }}
        />
      </Box>

      {/* 添付ファイル */}
      <Box>
        <Typography variant='h6' fontWeight='bold' gutterBottom>
          添付ファイル
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          写真、動画、ログファイルなどを添付できます
        </Typography>

        {/* アップロードボタン */}
        <Button
          variant='outlined'
          component='label'
          startIcon={<UploadFileIcon />}
          disabled={data.attachments.length >= maxAttachments}
          sx={{ mb: 2 }}>
          ファイルを選択
          <input type='file' hidden multiple onChange={handleFileUpload} />
        </Button>

        {/* エラー表示 */}
        {uploadError && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {uploadError}
          </Alert>
        )}

        {/* 添付ファイルリスト */}
        {data.attachments.length === 0 ? (
          <Alert severity='info'>添付ファイルはありません</Alert>
        ) : (
          <Card variant='outlined'>
            <List>
              {data.attachments.map((attachment, index) => (
                <ListItem
                  key={attachment.id}
                  divider={index < data.attachments.length - 1}
                  secondaryAction={
                    <IconButton
                      edge='end'
                      aria-label='削除'
                      onClick={() => handleDeleteAttachment(attachment.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }>
                  <ListItemIcon>
                    <AttachFileIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={attachment.name}
                    secondary={
                      <Box
                        component='span'
                        sx={{
                          display: 'flex',
                          gap: 1,
                          alignItems: 'center',
                          mt: 0.5,
                        }}>
                        <Chip
                          label={getTypeLabel(attachment.type)}
                          size='small'
                        />
                        <Typography variant='caption' color='text.secondary'>
                          {formatFileSize(attachment.size)}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {attachment.uploadedAt.toLocaleString('ja-JP')}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        )}

        {/* カウンター */}
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ mt: 2, display: 'block' }}>
          {data.attachments.length} / {maxAttachments} ファイル
        </Typography>
      </Box>
    </Box>
  )
}

export default UTMPostflightReportForm
