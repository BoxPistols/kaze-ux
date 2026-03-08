import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import type { SelectChangeEvent } from '@mui/material'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * フォームレイアウトパターン。
 *
 * 複数のMUIフォームコンポーネントを組み合わせた実用的なフォームレイアウト。
 * テーマのTextField、Select、InputLabel等のカスタマイズが反映された状態を確認できる。
 *
 * テーマ設定:
 * - InputLabel: shrink が常に true、position は static（ラベルはフィールド上部に固定、アニメーションなし）
 * - OutlinedInput: notch（legend の切り欠き）が非表示
 * - FormLabel: 必須マーク（アスタリスク）が error.main カラー
 */
const meta: Meta = {
  title: 'Patterns/Form Layout',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'フォームレイアウトパターン。TextField、Select、Radio、Checkbox等を組み合わせた実用的な入力フォームのレイアウト例。',
      },
    },
  },
}
export default meta

// ===========================================================================
// ドローン関連の共通データ
// ===========================================================================

/** ドローン機種一覧 */
const droneModels = [
  { value: 'phantom4', label: 'Phantom 4 RTK' },
  { value: 'mavic3', label: 'Mavic 3 Enterprise' },
  { value: 'matrice300', label: 'Matrice 300 RTK' },
  { value: 'matrice350', label: 'Matrice 350 RTK' },
  { value: 'inspire3', label: 'Inspire 3' },
]

/** 飛行目的 */
const flightPurposes = [
  { value: 'inspection', label: '点検' },
  { value: 'survey', label: '測量' },
  { value: 'monitoring', label: 'モニタリング' },
  { value: 'delivery', label: '配送' },
  { value: 'test', label: 'テスト' },
]

// ===========================================================================
// 1. BasicForm - フライト計画登録フォーム
// ===========================================================================

interface FlightPlanFormState {
  flightName: string
  droneModel: string
  pilot: string
  departure: string
  destination: string
  flightDate: string
  flightTime: string
  purpose: string
  notes: string
}

const initialFlightPlan: FlightPlanFormState = {
  flightName: '',
  droneModel: '',
  pilot: '',
  departure: '',
  destination: '',
  flightDate: '',
  flightTime: '',
  purpose: '',
  notes: '',
}

const BasicFormContent = () => {
  const [form, setForm] = useState<FlightPlanFormState>(initialFlightPlan)

  /** テキストフィールドの変更ハンドラ */
  const handleChange =
    (field: keyof FlightPlanFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

  /** Selectの変更ハンドラ */
  const handleSelectChange =
    (field: keyof FlightPlanFormState) => (e: SelectChangeEvent) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

  /** フォームリセット */
  const handleReset = () => {
    setForm(initialFlightPlan)
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
        フライト計画登録フォーム
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
        Card内にGridレイアウトで配置したフォーム。
        TextField、Select、multilineを組み合わせた実用的なパターン。
      </Typography>

      <Card>
        <CardHeader title='フライト計画登録' />
        <CardContent>
          <Box component='form' noValidate>
            <Grid container spacing={5}>
              {/* フライト名 - 全幅 */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='フライト名'
                  placeholder='例: 東京湾岸エリア定期点検'
                  required
                  fullWidth
                  value={form.flightName}
                  onChange={handleChange('flightName')}
                />
              </Grid>

              {/* 使用機体 */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>使用機体</InputLabel>
                  <Select
                    value={form.droneModel}
                    onChange={handleSelectChange('droneModel')}
                    displayEmpty>
                    <MenuItem value='' disabled>
                      <Typography color='text.secondary'>
                        機体を選択してください
                      </Typography>
                    </MenuItem>
                    {droneModels.map((model) => (
                      <MenuItem key={model.value} value={model.value}>
                        {model.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    フライトに使用するドローン機体
                  </FormHelperText>
                </FormControl>
              </Grid>

              {/* パイロット */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='パイロット'
                  placeholder='例: 山田 太郎'
                  required
                  fullWidth
                  value={form.pilot}
                  onChange={handleChange('pilot')}
                />
              </Grid>

              {/* 出発地点 | 目的地 */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='出発地点'
                  placeholder='例: 新木場ベース'
                  required
                  fullWidth
                  value={form.departure}
                  onChange={handleChange('departure')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='目的地'
                  placeholder='例: 東京湾岸エリアA'
                  required
                  fullWidth
                  value={form.destination}
                  onChange={handleChange('destination')}
                />
              </Grid>

              {/* 飛行予定日 | 飛行時間 */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='飛行予定日'
                  type='date'
                  required
                  fullWidth
                  value={form.flightDate}
                  onChange={handleChange('flightDate')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='飛行時間'
                  type='time'
                  required
                  fullWidth
                  value={form.flightTime}
                  onChange={handleChange('flightTime')}
                />
              </Grid>

              {/* 飛行目的 */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>飛行目的</InputLabel>
                  <Select
                    value={form.purpose}
                    onChange={handleSelectChange('purpose')}
                    displayEmpty>
                    <MenuItem value='' disabled>
                      <Typography color='text.secondary'>
                        目的を選択してください
                      </Typography>
                    </MenuItem>
                    {flightPurposes.map((purpose) => (
                      <MenuItem key={purpose.value} value={purpose.value}>
                        {purpose.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* 備考 - 全幅 */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='備考'
                  placeholder='フライトに関する補足情報を入力してください'
                  multiline
                  rows={3}
                  fullWidth
                  value={form.notes}
                  onChange={handleChange('notes')}
                />
              </Grid>
            </Grid>
          </Box>
        </CardContent>
        <CardActions>
          <Stack direction='row' spacing={2} sx={{ ml: 'auto' }}>
            <Button variant='outlined' onClick={handleReset}>
              キャンセル
            </Button>
            <Button variant='contained'>登録</Button>
          </Stack>
        </CardActions>
      </Card>
    </Box>
  )
}

export const BasicForm: StoryObj = {
  name: 'フライト計画登録',
  render: () => <BasicFormContent />,
}

// ===========================================================================
// 2. SettingsForm - 設定ページ（複数セクション）
// ===========================================================================

interface NotificationSettings {
  email: boolean
  app: boolean
  sms: boolean
}

interface SafetySettings {
  preflightCheck: boolean
  weatherAutoCheck: boolean
  emergencyStopDialog: boolean
}

interface SettingsFormState {
  notifications: NotificationSettings
  theme: string
  language: string
  safety: SafetySettings
}

const initialSettings: SettingsFormState = {
  notifications: {
    email: true,
    app: true,
    sms: false,
  },
  theme: 'system',
  language: 'ja',
  safety: {
    preflightCheck: true,
    weatherAutoCheck: true,
    emergencyStopDialog: false,
  },
}

const SettingsFormContent = () => {
  const [settings, setSettings] = useState<SettingsFormState>(initialSettings)

  /** 通知設定のトグルハンドラ */
  const handleNotificationChange =
    (field: keyof NotificationSettings) =>
    (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setSettings((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, [field]: checked },
      }))
    }

  /** テーマ変更ハンドラ */
  const handleThemeChange = (
    _e: React.ChangeEvent<HTMLInputElement>,
    value: string
  ) => {
    setSettings((prev) => ({ ...prev, theme: value }))
  }

  /** 言語変更ハンドラ */
  const handleLanguageChange = (e: SelectChangeEvent) => {
    setSettings((prev) => ({ ...prev, language: e.target.value }))
  }

  /** 安全設定のトグルハンドラ */
  const handleSafetyChange =
    (field: keyof SafetySettings) =>
    (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setSettings((prev) => ({
        ...prev,
        safety: { ...prev.safety, [field]: checked },
      }))
    }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
        設定ページ
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
        Switch、RadioGroup、Select、Checkboxを組み合わせた設定フォーム。
        Dividerでセクションを区切るパターン。
      </Typography>

      <Card>
        <CardHeader title='設定' />
        <CardContent>
          <Stack spacing={5}>
            {/* セクション1: 通知設定 */}
            <Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2 }}>
                通知設定
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                各種通知の受信方法を設定します。
              </Typography>
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.email}
                      onChange={handleNotificationChange('email')}
                    />
                  }
                  label='メール通知'
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.app}
                      onChange={handleNotificationChange('app')}
                    />
                  }
                  label='アプリ通知'
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.sms}
                      onChange={handleNotificationChange('sms')}
                    />
                  }
                  label='SMS通知'
                />
              </Stack>
            </Box>

            <Divider />

            {/* セクション2: 表示設定 */}
            <Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2 }}>
                表示設定
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                アプリケーションの表示に関する設定です。
              </Typography>
              <Grid container spacing={5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl>
                    <FormLabel sx={{ mb: 1 }}>テーマ</FormLabel>
                    <RadioGroup
                      value={settings.theme}
                      onChange={handleThemeChange}>
                      <FormControlLabel
                        value='light'
                        control={<Radio />}
                        label='ライト'
                      />
                      <FormControlLabel
                        value='dark'
                        control={<Radio />}
                        label='ダーク'
                      />
                      <FormControlLabel
                        value='system'
                        control={<Radio />}
                        label='システム設定に従う'
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>言語</InputLabel>
                    <Select
                      value={settings.language}
                      onChange={handleLanguageChange}>
                      <MenuItem value='ja'>日本語</MenuItem>
                      <MenuItem value='en'>English</MenuItem>
                    </Select>
                    <FormHelperText>UIの表示言語を選択します</FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* セクション3: 安全設定 */}
            <Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2 }}>
                安全設定
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                フライト運用時の安全チェックに関する設定です。
              </Typography>
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.safety.preflightCheck}
                      onChange={handleSafetyChange('preflightCheck')}
                    />
                  }
                  label='フライト前チェック必須'
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.safety.weatherAutoCheck}
                      onChange={handleSafetyChange('weatherAutoCheck')}
                    />
                  }
                  label='気象条件自動チェック'
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.safety.emergencyStopDialog}
                      onChange={handleSafetyChange('emergencyStopDialog')}
                    />
                  }
                  label='緊急停止確認ダイアログ'
                />
              </Stack>
            </Box>
          </Stack>
        </CardContent>
        <CardActions>
          <Button variant='contained' sx={{ ml: 'auto' }}>
            保存
          </Button>
        </CardActions>
      </Card>
    </Box>
  )
}

export const SettingsForm: StoryObj = {
  name: '設定ページ',
  render: () => <SettingsFormContent />,
}

// ===========================================================================
// 3. InlineEditForm - 機体詳細（表示/編集切替）
// ===========================================================================

/** 機体詳細データの型 */
interface DroneDetailData {
  name: string
  serialNumber: string
  registrationDate: string
  lastInspectionDate: string
  status: string
}

/** 初期表示データ */
const initialDroneDetail: DroneDetailData = {
  name: 'Matrice 300 RTK',
  serialNumber: 'DJI-M300-2024-00142',
  registrationDate: '2024-04-15',
  lastInspectionDate: '2025-02-28',
  status: '運用中',
}

/** フィールド定義（表示ラベルとキーのマッピング） */
const droneDetailFields: {
  key: keyof DroneDetailData
  label: string
}[] = [
  { key: 'name', label: '機体名' },
  { key: 'serialNumber', label: 'シリアル番号' },
  { key: 'registrationDate', label: '登録日' },
  { key: 'lastInspectionDate', label: '最終点検日' },
  { key: 'status', label: 'ステータス' },
]

const InlineEditFormContent = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [data, setData] = useState<DroneDetailData>(initialDroneDetail)
  /** 編集開始時のバックアップ（キャンセル用） */
  const [backup, setBackup] = useState<DroneDetailData>(initialDroneDetail)

  /** 編集モードに切替 */
  const handleEdit = () => {
    setBackup(data)
    setIsEditing(true)
  }

  /** 保存して表示モードに戻る */
  const handleSave = () => {
    setIsEditing(false)
  }

  /** キャンセルして元のデータに戻す */
  const handleCancel = () => {
    setData(backup)
    setIsEditing(false)
  }

  /** フィールド値の変更ハンドラ */
  const handleFieldChange =
    (field: keyof DroneDetailData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setData((prev) => ({ ...prev, [field]: e.target.value }))
    }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
        インライン編集フォーム
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
        閲覧モードと編集モードを切り替えるパターン。
        「編集」ボタンをクリックするとテキストフィールドに切り替わります。
      </Typography>

      <Card>
        <CardHeader
          title='機体詳細'
          action={
            !isEditing ? (
              <IconButton
                aria-label='編集モードに切り替え'
                onClick={handleEdit}>
                <EditIcon />
              </IconButton>
            ) : (
              <IconButton
                aria-label='保存'
                color='primary'
                onClick={handleSave}>
                <SaveIcon />
              </IconButton>
            )
          }
        />
        <CardContent>
          <Stack spacing={3}>
            {droneDetailFields.map((field) => (
              <Box key={field.key}>
                {isEditing ? (
                  <TextField
                    label={field.label}
                    fullWidth
                    value={data[field.key]}
                    onChange={handleFieldChange(field.key)}
                    type={
                      field.key === 'registrationDate' ||
                      field.key === 'lastInspectionDate'
                        ? 'date'
                        : 'text'
                    }
                  />
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1.5,
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ fontWeight: 500, minWidth: 140 }}>
                      {field.label}
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>
                      {data[field.key]}
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        </CardContent>
        {isEditing && (
          <CardActions>
            <Stack direction='row' spacing={2} sx={{ ml: 'auto' }}>
              <Button variant='outlined' onClick={handleCancel}>
                キャンセル
              </Button>
              <Button variant='contained' onClick={handleSave}>
                保存
              </Button>
            </Stack>
          </CardActions>
        )}
      </Card>
    </Box>
  )
}

export const InlineEditForm: StoryObj = {
  name: '機体詳細（インライン編集）',
  render: () => <InlineEditFormContent />,
}
