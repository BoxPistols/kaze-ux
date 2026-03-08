/**
 * UTM書類自動生成パネル
 *
 * 有人機団体への調整書、NOTAM申請書、飛行計画書などの自動生成
 */

import ArticleIcon from '@mui/icons-material/Article'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload'
import DescriptionIcon from '@mui/icons-material/Description'
import EmailIcon from '@mui/icons-material/Email'
import FlightIcon from '@mui/icons-material/Flight'
import LocalAirportIcon from '@mui/icons-material/LocalAirport'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import PreviewIcon from '@mui/icons-material/Preview'
import TableChartIcon from '@mui/icons-material/TableChart'
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Chip,
  Divider,
  Alert,
  AlertTitle,
  Grid,
  CircularProgress,
  Tooltip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControlLabel,
  Checkbox,
  LinearProgress,
} from '@mui/material'
import React, { useState, useCallback } from 'react'

import type {
  DocumentTemplate,
  GeneratedDocument,
  FlightPlan,
} from '@/types/utmTypes'

// 書類生成パネルのProps
interface UTMDocumentGenerationPanelProps {
  // 飛行計画データ
  flightPlan: FlightPlan | null
  // 座標データ
  coordinates?: { latitude: number; longitude: number; name?: string }[]
  // 落下分散範囲
  fallDispersionRadius?: number
  // 生成完了時のコールバック
  onDocumentGenerated?: (doc: GeneratedDocument) => void
}

// モックテンプレート
const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'tpl-001',
    name: '有人機団体調整書',
    type: 'manned_aircraft_notification',
    format: 'docx',
    version: '1.0',
    description:
      '有人機運航団体（航空会社、ヘリコプター運航会社等）への飛行情報調整書。Word形式で出力。',
    variables: [
      {
        name: 'operatorName',
        label: '運航者名',
        type: 'string',
        required: true,
      },
      { name: 'flightDate', label: '飛行日', type: 'date', required: true },
      {
        name: 'flightArea',
        label: '飛行区域',
        type: 'polygon',
        required: true,
      },
      { name: 'contactInfo', label: '連絡先', type: 'string', required: true },
    ],
    templateUrl: '/templates/manned_aircraft_notification.docx',
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
    createdBy: 'system',
  },
  {
    id: 'tpl-002',
    name: 'NOTAM申請データ',
    type: 'notam_application',
    format: 'xlsx',
    version: '2.1',
    description:
      'AIS JAPANへのNOTAM発行依頼用データ。Excel形式で座標を含むすべての情報を出力。',
    variables: [
      { name: 'notamType', label: 'NOTAM種別', type: 'string', required: true },
      {
        name: 'coordinates',
        label: '座標一覧',
        type: 'coordinates',
        required: true,
      },
      { name: 'altitude', label: '高度', type: 'number', required: true },
      { name: 'timeRange', label: '有効期間', type: 'string', required: true },
    ],
    templateUrl: '/templates/notam_application.xlsx',
    createdAt: '2024-01-01',
    updatedAt: '2024-07-15',
    createdBy: 'system',
  },
  {
    id: 'tpl-003',
    name: '飛行計画概要書',
    type: 'flight_plan_summary',
    format: 'pdf',
    version: '1.2',
    description: '飛行計画の概要をまとめたPDF書類。地図画像と座標表を含む。',
    variables: [
      { name: 'planName', label: '計画名', type: 'string', required: true },
      { name: 'purpose', label: '飛行目的', type: 'string', required: true },
      { name: 'mapImage', label: '地図画像', type: 'string', required: false },
    ],
    templateUrl: '/templates/flight_plan_summary.pdf',
    createdAt: '2024-01-01',
    updatedAt: '2024-05-01',
    createdBy: 'system',
  },
  {
    id: 'tpl-004',
    name: 'FISS通報書',
    type: 'fiss_notification',
    format: 'pdf',
    version: '1.0',
    description:
      '飛行情報共有システム(FISS)への通報用書類。国への飛行計画通報に使用。',
    variables: [
      {
        name: 'registrationNumber',
        label: '登録番号',
        type: 'string',
        required: true,
      },
      { name: 'pilotName', label: '操縦者名', type: 'string', required: true },
    ],
    templateUrl: '/templates/fiss_notification.pdf',
    createdAt: '2024-01-01',
    updatedAt: '2024-08-01',
    createdBy: 'system',
  },
]

// 生成ステップ
const GENERATION_STEPS = [
  '飛行計画データの確認',
  '座標データの変換',
  'テンプレートへのデータ挿入',
  '書類の生成',
]

const UTMDocumentGenerationPanel = ({
  flightPlan,
  coordinates = [],
  fallDispersionRadius,
  onDocumentGenerated,
}: UTMDocumentGenerationPanelProps) => {
  const theme = useTheme()

  // 選択中のテンプレート
  const [selectedTemplate, setSelectedTemplate] =
    useState<DocumentTemplate | null>(null)

  // 生成中の状態
  const [generating, setGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const [generationProgress, setGenerationProgress] = useState(0)

  // 生成済み書類
  const [generatedDocuments, setGeneratedDocuments] = useState<
    GeneratedDocument[]
  >([])

  // プレビューダイアログ
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewDocument, setPreviewDocument] =
    useState<GeneratedDocument | null>(null)

  // 追加オプション
  const [includeMap, setIncludeMap] = useState(true)
  const [includeCoordinateTable, setIncludeCoordinateTable] = useState(true)
  const [includeDispersionArea, setIncludeDispersionArea] =
    useState(!!fallDispersionRadius)

  // 書類生成の実行
  const handleGenerate = useCallback(
    (template: DocumentTemplate) => {
      if (!flightPlan) return

      setSelectedTemplate(template)
      setGenerating(true)
      setGenerationStep(0)
      setGenerationProgress(0)

      // 生成プロセスのシミュレーション
      const stepDuration = 800
      let currentStep = 0

      const interval = setInterval(() => {
        currentStep++
        setGenerationStep(currentStep)
        setGenerationProgress((currentStep / GENERATION_STEPS.length) * 100)

        if (currentStep >= GENERATION_STEPS.length) {
          clearInterval(interval)

          // 生成完了
          const doc: GeneratedDocument = {
            id: `doc-${Date.now()}`,
            templateId: template.id,
            templateName: template.name,
            flightPlanId: flightPlan.id,
            fileName: `${template.name}_${flightPlan.name}_${new Date().toISOString().split('T')[0]}.${template.format}`,
            fileSize: Math.floor(Math.random() * 500000) + 100000,
            mimeType:
              template.format === 'docx'
                ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                : template.format === 'xlsx'
                  ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                  : 'application/pdf',
            downloadUrl: `/api/documents/download/${Date.now()}`,
            generatedAt: new Date().toISOString(),
            generatedBy: 'current-user',
            expiresAt: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: 'completed',
          }

          setGeneratedDocuments((prev) => [doc, ...prev])
          onDocumentGenerated?.(doc)
          setGenerating(false)
          setSelectedTemplate(null)
        }
      }, stepDuration)
    },
    [flightPlan, onDocumentGenerated]
  )

  // プレビュー表示
  const handlePreview = useCallback((doc: GeneratedDocument) => {
    setPreviewDocument(doc)
    setPreviewOpen(true)
  }, [])

  // ファイルサイズのフォーマット
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // テンプレートのアイコン取得
  const getTemplateIcon = (type: DocumentTemplate['type']) => {
    switch (type) {
      case 'manned_aircraft_notification':
        return <LocalAirportIcon />
      case 'notam_application':
        return <TableChartIcon />
      case 'flight_plan_summary':
        return <FlightIcon />
      case 'fiss_notification':
        return <ArticleIcon />
      default:
        return <DescriptionIcon />
    }
  }

  // フォーマットのアイコン取得
  const getFormatIcon = (format: DocumentTemplate['format']) => {
    switch (format) {
      case 'docx':
        return <DescriptionIcon color='primary' />
      case 'xlsx':
        return <TableChartIcon color='success' />
      case 'pdf':
        return <PictureAsPdfIcon color='error' />
      default:
        return <DescriptionIcon />
    }
  }

  return (
    <Box>
      {/* ヘッダー */}
      <Card sx={{ mb: 2 }}>
        <CardHeader
          avatar={<DescriptionIcon color='primary' />}
          title='書類自動生成'
          subheader='有人機団体への調整書、NOTAM申請書、飛行計画書を自動生成'
        />
      </Card>

      {/* 飛行計画が未選択の場合 */}
      {!flightPlan && (
        <Alert severity='info' sx={{ mb: 2 }}>
          <AlertTitle>飛行計画を選択してください</AlertTitle>
          書類を生成するには、まず飛行計画を選択する必要があります。
        </Alert>
      )}

      {/* データ状態の表示 */}
      {flightPlan && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant='subtitle2' gutterBottom>
            書類生成に使用するデータ
          </Typography>
          <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
            <Chip
              icon={<CheckCircleIcon />}
              label={`飛行計画: ${flightPlan.name}`}
              color='success'
              variant='outlined'
            />
            <Chip
              icon={coordinates.length > 0 ? <CheckCircleIcon /> : undefined}
              label={`座標: ${coordinates.length}件`}
              color={coordinates.length > 0 ? 'success' : 'default'}
              variant='outlined'
            />
            {fallDispersionRadius && (
              <Chip
                icon={<CheckCircleIcon />}
                label={`落下分散範囲: ${fallDispersionRadius.toFixed(0)}m`}
                color='success'
                variant='outlined'
              />
            )}
          </Stack>

          {/* オプション */}
          <Divider sx={{ my: 2 }} />
          <Typography variant='subtitle2' gutterBottom>
            出力オプション
          </Typography>
          <Stack direction='row' spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeMap}
                  onChange={(e) => setIncludeMap(e.target.checked)}
                />
              }
              label='地図画像を含める'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeCoordinateTable}
                  onChange={(e) => setIncludeCoordinateTable(e.target.checked)}
                />
              }
              label='座標表を含める'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeDispersionArea}
                  onChange={(e) => setIncludeDispersionArea(e.target.checked)}
                  disabled={!fallDispersionRadius}
                />
              }
              label='落下分散範囲を含める'
            />
          </Stack>
        </Paper>
      )}

      {/* 生成中の進捗表示 */}
      {generating && selectedTemplate && (
        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography variant='subtitle1' fontWeight={600} gutterBottom>
            {selectedTemplate.name} を生成中...
          </Typography>
          <LinearProgress
            variant='determinate'
            value={generationProgress}
            sx={{ mb: 2, height: 8, borderRadius: 4 }}
          />
          <Stepper activeStep={generationStep} orientation='vertical'>
            {GENERATION_STEPS.map((label, index) => (
              <Step key={label} completed={index < generationStep}>
                <StepLabel
                  optional={
                    index < generationStep ? (
                      <Typography variant='caption' color='success.main'>
                        完了
                      </Typography>
                    ) : index === generationStep ? (
                      <Typography variant='caption' color='primary'>
                        処理中...
                      </Typography>
                    ) : null
                  }>
                  {label}
                </StepLabel>
                <StepContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant='body2' color='text.secondary'>
                      処理中...
                    </Typography>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

      {/* テンプレート一覧 */}
      <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 2 }}>
        利用可能なテンプレート
      </Typography>

      <Grid container spacing={2}>
        {DOCUMENT_TEMPLATES.map((template) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={template.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
              }}>
              <CardHeader
                avatar={
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    }}>
                    {getTemplateIcon(template.type)}
                  </Box>
                }
                title={template.name}
                subheader={
                  <Stack direction='row' spacing={0.5} alignItems='center'>
                    {getFormatIcon(template.format)}
                    <Typography variant='caption'>
                      {template.format.toUpperCase()}
                    </Typography>
                  </Stack>
                }
              />
              <CardContent sx={{ flex: 1 }}>
                <Typography variant='body2' color='text.secondary'>
                  {template.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant='contained'
                  onClick={() => handleGenerate(template)}
                  disabled={!flightPlan || generating}
                  startIcon={
                    generating ? (
                      <CircularProgress size={16} />
                    ) : (
                      <DescriptionIcon />
                    )
                  }>
                  生成
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 生成済み書類一覧 */}
      {generatedDocuments.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 2 }}>
            生成済み書類
          </Typography>

          <Paper variant='outlined'>
            <List disablePadding>
              {generatedDocuments.map((doc, index) => (
                <React.Fragment key={doc.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}>
                    <ListItemIcon>
                      {doc.mimeType.includes('pdf') ? (
                        <PictureAsPdfIcon color='error' />
                      ) : doc.mimeType.includes('spreadsheet') ? (
                        <TableChartIcon color='success' />
                      ) : (
                        <DescriptionIcon color='primary' />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={doc.fileName}
                      secondary={
                        <Stack direction='row' spacing={2} alignItems='center'>
                          <Typography variant='caption' color='text.secondary'>
                            {formatFileSize(doc.fileSize)}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {new Date(doc.generatedAt).toLocaleString('ja-JP')}
                          </Typography>
                          <Chip
                            size='small'
                            label={
                              doc.status === 'completed' ? '生成完了' : '生成中'
                            }
                            color={
                              doc.status === 'completed' ? 'success' : 'warning'
                            }
                          />
                        </Stack>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction='row' spacing={1}>
                        <Tooltip title='プレビュー'>
                          <IconButton onClick={() => handlePreview(doc)}>
                            <PreviewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='ダウンロード'>
                          <IconButton color='primary'>
                            <CloudDownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='メール送信'>
                          <IconButton>
                            <EmailIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      {/* 一括生成ボタン */}
      {flightPlan && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'>
            <Box>
              <Typography variant='subtitle1' fontWeight={600}>
                すべての書類を一括生成
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                有人機団体調整書、NOTAM申請データ、飛行計画概要書をまとめて生成します
              </Typography>
            </Box>
            <Button
              variant='contained'
              size='large'
              disabled={generating}
              startIcon={<DescriptionIcon />}>
              一括生成
            </Button>
          </Stack>
        </Paper>
      )}

      {/* プレビューダイアログ */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth='md'
        fullWidth>
        <DialogTitle>
          <Stack direction='row' alignItems='center' spacing={1}>
            <PreviewIcon />
            <Typography variant='h6'>書類プレビュー</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {previewDocument && (
            <Box>
              <Alert severity='info' sx={{ mb: 2 }}>
                <Typography variant='body2'>
                  {previewDocument.fileName}
                </Typography>
              </Alert>
              <Paper
                variant='outlined'
                sx={{
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.100',
                }}>
                <Stack alignItems='center' spacing={2}>
                  {previewDocument.mimeType.includes('pdf') ? (
                    <PictureAsPdfIcon
                      sx={{ fontSize: 64, color: 'text.disabled' }}
                    />
                  ) : previewDocument.mimeType.includes('spreadsheet') ? (
                    <TableChartIcon
                      sx={{ fontSize: 64, color: 'text.disabled' }}
                    />
                  ) : (
                    <DescriptionIcon
                      sx={{ fontSize: 64, color: 'text.disabled' }}
                    />
                  )}
                  <Typography color='text.secondary'>
                    書類プレビューがここに表示されます
                  </Typography>
                  <Typography variant='caption' color='text.disabled'>
                    （実装時にPDF.jsまたはOffice Viewerを統合）
                  </Typography>
                </Stack>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>閉じる</Button>
          <Button variant='contained' startIcon={<CloudDownloadIcon />}>
            ダウンロード
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UTMDocumentGenerationPanel
