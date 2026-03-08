'use client'

import {
  Save as SaveIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  AttachFile as AttachIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Folder as FolderIcon,
  LocalHospital as InjuryIcon,
  HomeWork as PropertyIcon,
  FlightTakeoff as DroneIcon,
  WbSunny as WeatherIcon,
  Gavel as RegulatoryIcon,
  Assignment as TaskIcon,
  Add as AddIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  Chip,
  Stack,
  Alert,
  Collapse,
  FormControlLabel,
  Switch,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Grid,
} from '@mui/material'
import React, { useState, useCallback, useMemo, useRef } from 'react'

import type {
  IncidentReport,
  IncidentType,
  IncidentSeverity,
  IncidentReportStatus,
  IncidentAttachment,
  CorrectiveAction,
} from '../../types/utmTypes'

export interface UTMIncidentReportProps {
  // レポートデータ
  report: IncidentReport
  // エディタモード
  mode?: 'view' | 'edit' | 'create'
  // コールバック
  onChange?: (report: IncidentReport) => void
  onSave?: (report: IncidentReport) => void
  onSubmit?: (report: IncidentReport) => void
  onModeChange?: (mode: 'view' | 'edit' | 'create') => void
  onAttachmentUpload?: (file: File) => Promise<IncidentAttachment>
  onAttachmentDelete?: (attachmentId: string) => void
  // 表示オプション
  maxHeight?: number | string
  showAllSections?: boolean
}

// インシデントタイプのラベル
const incidentTypeLabels: Record<IncidentType, string> = {
  near_miss: 'ニアミス',
  collision: '衝突',
  crash: '墜落',
  lost_link: '通信途絶',
  flyaway: 'フライアウェイ',
  battery_failure: 'バッテリー異常',
  motor_failure: 'モーター異常',
  gps_failure: 'GPS異常',
  zone_violation: '区域侵入',
  injury: '人身事故',
  property_damage: '物損',
  other: 'その他',
}

// 重大度のラベルと色
const severityConfig: Record<
  IncidentSeverity,
  { label: string; color: 'default' | 'info' | 'warning' | 'error' }
> = {
  minor: { label: '軽微', color: 'default' },
  moderate: { label: '中程度', color: 'info' },
  serious: { label: '重大', color: 'warning' },
  critical: { label: '重大（報告義務）', color: 'error' },
}

// ステータスのラベルと色
const statusConfig: Record<
  IncidentReportStatus,
  {
    label: string
    color:
      | 'default'
      | 'primary'
      | 'secondary'
      | 'success'
      | 'warning'
      | 'error'
      | 'info'
  }
> = {
  draft: { label: '下書き', color: 'default' },
  submitted: { label: '提出済み', color: 'info' },
  under_review: { label: 'レビュー中', color: 'warning' },
  approved: { label: '承認済み', color: 'success' },
  rejected: { label: '却下', color: 'error' },
  closed: { label: 'クローズ', color: 'default' },
}

// ドローン状態のラベル
const droneStatusLabels: Record<string, string> = {
  operational: '運用可能',
  damaged: '損傷あり',
  destroyed: '全損',
  lost: '行方不明',
}

// 添付ファイルタイプのアイコン
const attachmentTypeIcons: Record<string, React.ReactNode> = {
  image: <ImageIcon />,
  video: <VideoIcon />,
  document: <DescriptionIcon />,
  log: <FolderIcon />,
  other: <AttachIcon />,
}

// 日時フォーマット
const formatDateTime = (date: Date): string => {
  return new Date(date).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ファイルサイズフォーマット
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const UTMIncidentReport = ({
  report,
  mode = 'view',
  onChange,
  onSave,
  onSubmit,
  onModeChange,
  onAttachmentUpload,
  onAttachmentDelete,
  maxHeight = '100%',
  showAllSections = false,
}: UTMIncidentReportProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(
      showAllSections
        ? [
            'basic',
            'details',
            'impact',
            'weather',
            'attachments',
            'actions',
            'regulatory',
          ]
        : ['basic', 'details']
    )
  )
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditable = mode === 'edit' || mode === 'create'

  // セクションの展開/折りたたみ
  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }, [])

  // フィールド更新
  const handleFieldChange = useCallback(
    (field: keyof IncidentReport, value: unknown) => {
      if (!isEditable || !onChange) return
      onChange({
        ...report,
        [field]: value,
        updatedAt: new Date(),
      })
    },
    [report, isEditable, onChange]
  )

  // ネストしたフィールド更新
  const handleNestedFieldChange = useCallback(
    (parentField: keyof IncidentReport, childField: string, value: unknown) => {
      if (!isEditable || !onChange) return
      const parentValue = report[parentField]
      if (typeof parentValue === 'object' && parentValue !== null) {
        onChange({
          ...report,
          [parentField]: {
            ...parentValue,
            [childField]: value,
          },
          updatedAt: new Date(),
        })
      }
    },
    [report, isEditable, onChange]
  )

  // 是正措置追加
  const handleAddCorrectiveAction = useCallback(() => {
    if (!isEditable || !onChange) return
    const newAction: CorrectiveAction = {
      id: `action-${Date.now()}`,
      description: '',
      status: 'pending',
    }
    onChange({
      ...report,
      correctiveActions: [...(report.correctiveActions || []), newAction],
      updatedAt: new Date(),
    })
  }, [report, isEditable, onChange])

  // 是正措置更新
  const handleUpdateCorrectiveAction = useCallback(
    (actionId: string, updates: Partial<CorrectiveAction>) => {
      if (!isEditable || !onChange) return
      const updatedActions = (report.correctiveActions || []).map((action) =>
        action.id === actionId ? { ...action, ...updates } : action
      )
      onChange({
        ...report,
        correctiveActions: updatedActions,
        updatedAt: new Date(),
      })
    },
    [report, isEditable, onChange]
  )

  // 是正措置削除
  const handleDeleteCorrectiveAction = useCallback(
    (actionId: string) => {
      if (!isEditable || !onChange) return
      onChange({
        ...report,
        correctiveActions: (report.correctiveActions || []).filter(
          (action) => action.id !== actionId
        ),
        updatedAt: new Date(),
      })
    },
    [report, isEditable, onChange]
  )

  // ファイルアップロードボタンクリック
  const handleUploadButtonClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // ファイル選択時の処理
  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file || !onChange) return

      setIsUploading(true)
      try {
        if (onAttachmentUpload) {
          // 外部アップロードハンドラーがある場合
          const attachment = await onAttachmentUpload(file)
          onChange({
            ...report,
            attachments: [...(report.attachments || []), attachment],
            updatedAt: new Date(),
          })
        } else {
          // モック: ローカルでファイル情報からアタッチメントを生成
          const fileType = file.type.startsWith('image/')
            ? 'image'
            : file.type.startsWith('video/')
              ? 'video'
              : file.name.endsWith('.pdf') ||
                  file.name.endsWith('.doc') ||
                  file.name.endsWith('.docx')
                ? 'document'
                : 'other'

          const mockAttachment: IncidentAttachment = {
            id: `attachment-${Date.now()}`,
            name: file.name,
            type: fileType,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
            url: URL.createObjectURL(file),
            uploadedAt: new Date(),
            uploadedBy: report.createdBy,
          }
          onChange({
            ...report,
            attachments: [...(report.attachments || []), mockAttachment],
            updatedAt: new Date(),
          })
        }
      } finally {
        setIsUploading(false)
        // ファイル入力をリセット
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [report, onChange, onAttachmentUpload]
  )

  // 重大度による警告表示
  const severityWarning = useMemo(() => {
    if (report.severity === 'critical') {
      return (
        <Alert severity='error' sx={{ mb: 2 }}>
          このインシデントは国土交通省への報告が義務付けられています。
        </Alert>
      )
    }
    if (report.injuries || report.propertyDamage) {
      return (
        <Alert severity='warning' sx={{ mb: 2 }}>
          人身事故または物損が発生しています。詳細を記録してください。
        </Alert>
      )
    }
    return null
  }, [report.severity, report.injuries, report.propertyDamage])

  // セクションヘッダーコンポーネント
  const SectionHeader = ({
    id,
    icon,
    title,
  }: {
    id: string
    icon: React.ReactNode
    title: string
  }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1.5,
        bgcolor: 'grey.100',
        cursor: 'pointer',
        '&:hover': { bgcolor: 'grey.200' },
      }}
      onClick={() => toggleSection(id)}>
      <Box sx={{ mr: 1, color: 'action.active' }}>{icon}</Box>
      <Typography variant='subtitle2' sx={{ flex: 1 }}>
        {title}
      </Typography>
      {expandedSections.has(id) ? <CollapseIcon /> : <ExpandIcon />}
    </Box>
  )

  return (
    <Box
      sx={{
        height: maxHeight,
        overflow: 'auto',
        bgcolor: 'background.default',
      }}>
      <Paper sx={{ m: 2 }}>
        {/* ヘッダー */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant='h6'>
              {report.title || 'インシデントレポート'}
            </Typography>
            {report.reportNumber && (
              <Typography variant='caption' color='text.secondary'>
                レポート番号: {report.reportNumber}
              </Typography>
            )}
          </Box>
          <Stack direction='row' spacing={1}>
            <Chip
              label={severityConfig[report.severity].label}
              color={severityConfig[report.severity].color}
              size='small'
            />
            <Chip
              label={statusConfig[report.status].label}
              color={statusConfig[report.status].color}
              size='small'
              variant='outlined'
            />
          </Stack>
        </Box>

        {/* モード切替とアクション */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}>
          <Tooltip title='閲覧モード'>
            <IconButton
              size='small'
              color={mode === 'view' ? 'primary' : 'default'}
              onClick={() => onModeChange?.('view')}>
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='編集モード'>
            <IconButton
              size='small'
              color={mode === 'edit' ? 'primary' : 'default'}
              onClick={() => onModeChange?.('edit')}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ flex: 1 }} />
          {isEditable && (
            <>
              <Button
                variant='outlined'
                startIcon={<SaveIcon />}
                onClick={() => onSave?.(report)}
                size='small'>
                保存
              </Button>
              {report.status === 'draft' && (
                <Button
                  variant='contained'
                  startIcon={<SendIcon />}
                  onClick={() => onSubmit?.(report)}
                  size='small'
                  color='primary'>
                  提出
                </Button>
              )}
            </>
          )}
        </Box>

        {/* 警告表示 */}
        <Box sx={{ px: 2, pt: 2 }}>{severityWarning}</Box>

        {/* 基本情報セクション */}
        <SectionHeader id='basic' icon={<DescriptionIcon />} title='基本情報' />
        <Collapse in={expandedSections.has('basic')}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label='タイトル'
                  value={report.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  disabled={!isEditable}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth disabled={!isEditable}>
                  <InputLabel>インシデント種類</InputLabel>
                  <Select
                    value={report.incidentType}
                    label='インシデント種類'
                    onChange={(e) =>
                      handleFieldChange('incidentType', e.target.value)
                    }>
                    {Object.entries(incidentTypeLabels).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth disabled={!isEditable}>
                  <InputLabel>重大度</InputLabel>
                  <Select
                    value={report.severity}
                    label='重大度'
                    onChange={(e) =>
                      handleFieldChange('severity', e.target.value)
                    }>
                    {Object.entries(severityConfig).map(([key, { label }]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon color='action' />
                  <Typography variant='body2'>
                    発生日時: {formatDateTime(report.occurredAt)}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon color='action' />
                  <Typography variant='body2'>
                    場所: {report.location.name}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DroneIcon color='action' />
                  <Typography variant='body2'>
                    機体: {report.droneName}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color='action' />
                  <Typography variant='body2'>
                    パイロット: {report.pilotName}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        <Divider />

        {/* 詳細セクション */}
        <SectionHeader
          id='details'
          icon={<DescriptionIcon />}
          title='インシデント詳細'
        />
        <Collapse in={expandedSections.has('details')}>
          <Box sx={{ p: 2 }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label='詳細説明'
                value={report.description}
                onChange={(e) =>
                  handleFieldChange('description', e.target.value)
                }
                disabled={!isEditable}
                multiline
                rows={4}
                required
              />
              <TextField
                fullWidth
                label='原因（わかっている場合）'
                value={report.cause || ''}
                onChange={(e) => handleFieldChange('cause', e.target.value)}
                disabled={!isEditable}
                multiline
                rows={2}
              />
              <TextField
                fullWidth
                label='即時対応'
                value={report.immediateActions || ''}
                onChange={(e) =>
                  handleFieldChange('immediateActions', e.target.value)
                }
                disabled={!isEditable}
                multiline
                rows={2}
                helperText='インシデント発生直後に行った対応を記載'
              />
            </Stack>
          </Box>
        </Collapse>

        <Divider />

        {/* 影響セクション */}
        <SectionHeader id='impact' icon={<WarningIcon />} title='影響' />
        <Collapse in={expandedSections.has('impact')}>
          <Box sx={{ p: 2 }}>
            <Stack spacing={2}>
              {/* 人身事故 */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={report.injuries}
                      onChange={(e) =>
                        handleFieldChange('injuries', e.target.checked)
                      }
                      disabled={!isEditable}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InjuryIcon
                        color={report.injuries ? 'error' : 'action'}
                      />
                      <span>人身事故あり</span>
                    </Box>
                  }
                />
                <Collapse in={report.injuries}>
                  <TextField
                    fullWidth
                    label='人身事故の詳細'
                    value={report.injuryDetails || ''}
                    onChange={(e) =>
                      handleFieldChange('injuryDetails', e.target.value)
                    }
                    disabled={!isEditable}
                    multiline
                    rows={2}
                    sx={{ mt: 1, ml: 4 }}
                  />
                </Collapse>
              </Box>

              {/* 物損 */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={report.propertyDamage}
                      onChange={(e) =>
                        handleFieldChange('propertyDamage', e.target.checked)
                      }
                      disabled={!isEditable}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PropertyIcon
                        color={report.propertyDamage ? 'warning' : 'action'}
                      />
                      <span>物損あり</span>
                    </Box>
                  }
                />
                <Collapse in={report.propertyDamage}>
                  <TextField
                    fullWidth
                    label='物損の詳細'
                    value={report.propertyDamageDetails || ''}
                    onChange={(e) =>
                      handleFieldChange('propertyDamageDetails', e.target.value)
                    }
                    disabled={!isEditable}
                    multiline
                    rows={2}
                    sx={{ mt: 1, ml: 4 }}
                  />
                </Collapse>
              </Box>

              {/* ドローン状態 */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth disabled={!isEditable}>
                    <InputLabel>機体の状態</InputLabel>
                    <Select
                      value={report.droneStatus}
                      label='機体の状態'
                      onChange={(e) =>
                        handleFieldChange('droneStatus', e.target.value)
                      }>
                      {Object.entries(droneStatusLabels).map(([key, label]) => (
                        <MenuItem key={key} value={key}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label='機体損傷の詳細'
                    value={report.droneDamageDetails || ''}
                    onChange={(e) =>
                      handleFieldChange('droneDamageDetails', e.target.value)
                    }
                    disabled={
                      !isEditable || report.droneStatus === 'operational'
                    }
                  />
                </Grid>
              </Grid>
            </Stack>
          </Box>
        </Collapse>

        <Divider />

        {/* 気象条件セクション */}
        <SectionHeader id='weather' icon={<WeatherIcon />} title='気象条件' />
        <Collapse in={expandedSections.has('weather')}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='天候'
                  value={report.weather?.conditions || ''}
                  onChange={(e) =>
                    handleNestedFieldChange(
                      'weather',
                      'conditions',
                      e.target.value
                    )
                  }
                  disabled={!isEditable}
                  placeholder='晴れ、曇り、雨など'
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  fullWidth
                  label='気温 (℃)'
                  type='number'
                  value={report.weather?.temperature || ''}
                  onChange={(e) =>
                    handleNestedFieldChange(
                      'weather',
                      'temperature',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  disabled={!isEditable}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  fullWidth
                  label='風速 (m/s)'
                  type='number'
                  value={report.weather?.windSpeed || ''}
                  onChange={(e) =>
                    handleNestedFieldChange(
                      'weather',
                      'windSpeed',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  disabled={!isEditable}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='視程'
                  value={report.weather?.visibility || ''}
                  onChange={(e) =>
                    handleNestedFieldChange(
                      'weather',
                      'visibility',
                      e.target.value
                    )
                  }
                  disabled={!isEditable}
                  placeholder='良好、やや不良など'
                />
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        <Divider />

        {/* 添付ファイルセクション */}
        <SectionHeader
          id='attachments'
          icon={<AttachIcon />}
          title={`添付ファイル (${report.attachments?.length || 0})`}
        />
        <Collapse in={expandedSections.has('attachments')}>
          <Box sx={{ p: 2 }}>
            {isEditable && (
              <>
                <input
                  type='file'
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept='image/*,video/*,.pdf,.doc,.docx,.txt,.log'
                />
                <Button
                  variant='outlined'
                  startIcon={<UploadIcon />}
                  onClick={handleUploadButtonClick}
                  disabled={isUploading}
                  sx={{ mb: 2 }}>
                  {isUploading ? 'アップロード中...' : 'ファイルをアップロード'}
                </Button>
              </>
            )}
            {report.attachments && report.attachments.length > 0 ? (
              <List dense>
                {report.attachments.map((attachment) => (
                  <ListItem key={attachment.id}>
                    <ListItemIcon>
                      {attachmentTypeIcons[attachment.type] || <AttachIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={attachment.name}
                      secondary={`${formatFileSize(attachment.size)} - ${formatDateTime(attachment.uploadedAt)}`}
                    />
                    {isEditable && (
                      <ListItemSecondaryAction>
                        <IconButton
                          size='small'
                          onClick={() => onAttachmentDelete?.(attachment.id)}>
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                添付ファイルはありません
              </Typography>
            )}
          </Box>
        </Collapse>

        <Divider />

        {/* 是正措置セクション */}
        <SectionHeader
          id='actions'
          icon={<TaskIcon />}
          title={`是正措置 (${report.correctiveActions?.length || 0})`}
        />
        <Collapse in={expandedSections.has('actions')}>
          <Box sx={{ p: 2 }}>
            {report.correctiveActions && report.correctiveActions.length > 0 ? (
              <List dense>
                {report.correctiveActions.map((action, index) => (
                  <ListItem
                    key={action.id}
                    sx={{
                      bgcolor: 'grey.50',
                      mb: 1,
                      borderRadius: 1,
                      flexDirection: 'column',
                      alignItems: 'stretch',
                    }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        mb: 1,
                      }}>
                      <Typography variant='subtitle2' sx={{ flex: 1 }}>
                        是正措置 #{index + 1}
                      </Typography>
                      <Chip
                        label={
                          action.status === 'pending'
                            ? '未着手'
                            : action.status === 'in_progress'
                              ? '対応中'
                              : '完了'
                        }
                        size='small'
                        color={
                          action.status === 'completed'
                            ? 'success'
                            : action.status === 'in_progress'
                              ? 'info'
                              : 'default'
                        }
                      />
                      {isEditable && (
                        <IconButton
                          size='small'
                          onClick={() =>
                            handleDeleteCorrectiveAction(action.id)
                          }
                          sx={{ ml: 1 }}>
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      )}
                    </Box>
                    <TextField
                      fullWidth
                      size='small'
                      label='対応内容'
                      value={action.description}
                      onChange={(e) =>
                        handleUpdateCorrectiveAction(action.id, {
                          description: e.target.value,
                        })
                      }
                      disabled={!isEditable}
                      multiline
                      rows={2}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                是正措置は登録されていません
              </Typography>
            )}
            {isEditable && (
              <Button
                variant='outlined'
                startIcon={<AddIcon />}
                onClick={handleAddCorrectiveAction}
                size='small'>
                是正措置を追加
              </Button>
            )}
          </Box>
        </Collapse>

        <Divider />

        {/* 規制報告セクション */}
        <SectionHeader
          id='regulatory'
          icon={<RegulatoryIcon />}
          title='規制報告'
        />
        <Collapse in={expandedSections.has('regulatory')}>
          <Box sx={{ p: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={report.regulatoryReport.required}
                  onChange={(e) =>
                    handleNestedFieldChange(
                      'regulatoryReport',
                      'required',
                      e.target.checked
                    )
                  }
                  disabled={!isEditable}
                />
              }
              label='規制当局への報告が必要'
            />
            <Collapse in={report.regulatoryReport.required}>
              <Box sx={{ mt: 2, ml: 4 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant='body2' color='text.secondary'>
                      報告先:{' '}
                      {report.regulatoryReport.reportedTo?.join(', ') ||
                        '未報告'}
                    </Typography>
                  </Grid>
                  {report.regulatoryReport.reportedAt && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant='body2' color='text.secondary'>
                        報告日時:{' '}
                        {formatDateTime(report.regulatoryReport.reportedAt)}
                      </Typography>
                    </Grid>
                  )}
                  {report.regulatoryReport.referenceNumber && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant='body2' color='text.secondary'>
                        参照番号: {report.regulatoryReport.referenceNumber}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Collapse>
          </Box>
        </Collapse>

        {/* フッター（メタデータ） */}
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'grey.50',
          }}>
          <Stack direction='row' spacing={2} flexWrap='wrap'>
            <Typography variant='caption' color='text.secondary'>
              作成: {formatDateTime(report.createdAt)} ({report.createdBy})
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              更新: {formatDateTime(report.updatedAt)}
            </Typography>
            {report.submittedAt && (
              <Typography variant='caption' color='text.secondary'>
                提出: {formatDateTime(report.submittedAt)}
              </Typography>
            )}
          </Stack>
        </Box>
      </Paper>
    </Box>
  )
}

export default UTMIncidentReport
