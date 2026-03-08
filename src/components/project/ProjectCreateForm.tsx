/**
 * ProjectCreateForm - プロジェクト作成フォームコンポーネント
 */
import { Box, Stack, TextField } from '@mui/material'
import Grid from '@mui/material/Grid'

export interface ProjectFormData {
  name: string
  description: string
  location: string
  startDate: string
  endDate: string
}

export interface ProjectCreateFormProps {
  /** フォームデータ */
  formData: ProjectFormData
  /** フィールド変更ハンドラー */
  onChange: (field: keyof ProjectFormData, value: string) => void
}

export const ProjectCreateForm = ({
  formData,
  onChange,
}: ProjectCreateFormProps) => {
  return (
    <Stack spacing={3}>
      <TextField
        label='プロジェクト名'
        value={formData.name}
        onChange={(e) => onChange('name', e.target.value)}
        fullWidth
        required
        placeholder='例: 東京湾岸エリア点検'
      />

      <TextField
        label='説明'
        value={formData.description}
        onChange={(e) => onChange('description', e.target.value)}
        fullWidth
        multiline
        rows={3}
        placeholder='プロジェクトの概要を入力してください'
      />

      <TextField
        label='場所'
        value={formData.location}
        onChange={(e) => onChange('location', e.target.value)}
        fullWidth
        placeholder='例: 東京都江東区'
      />

      <Box>
        <Grid container spacing={2}>
          <Grid size={6}>
            <TextField
              label='開始日'
              type='date'
              value={formData.startDate}
              onChange={(e) => onChange('startDate', e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label='終了日'
              type='date'
              value={formData.endDate}
              onChange={(e) => onChange('endDate', e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
        </Grid>
      </Box>
    </Stack>
  )
}

export default ProjectCreateForm
