/**
 * UTM NOTAMパネル
 *
 * NOTAM申請状況の表示と操作を提供する
 */

import ArticleIcon from '@mui/icons-material/Article'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DescriptionIcon from '@mui/icons-material/Description'
import EditIcon from '@mui/icons-material/Edit'
import ErrorIcon from '@mui/icons-material/Error'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import PublicIcon from '@mui/icons-material/Public'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  Divider,
  Alert,
  AlertTitle,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
} from '@mui/material'
import React from 'react'

import type { NOTAMRequest, NOTAMStatus } from '../../types/utmTypes'

// ステータスの色
const getStatusColor = (
  status: NOTAMStatus
): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (status) {
    case 'approved':
    case 'published':
      return 'success'
    case 'submitted':
    case 'processing':
    case 'pending_review':
      return 'info'
    case 'draft':
      return 'default'
    case 'rejected':
    case 'cancelled':
    case 'expired':
      return 'error'
    default:
      return 'default'
  }
}

// ステータスラベル
const getStatusLabel = (status: NOTAMStatus): string => {
  const labels: Record<NOTAMStatus, string> = {
    draft: '下書き',
    pending_review: 'レビュー待ち',
    submitted: '申請済み',
    processing: '処理中',
    approved: '承認済み',
    rejected: '却下',
    published: '発行済み',
    cancelled: '取り消し',
    expired: '期限切れ',
  }
  return labels[status] || status
}

// ステータスアイコン
const getStatusIcon = (status: NOTAMStatus): React.ReactNode => {
  switch (status) {
    case 'approved':
    case 'published':
      return <CheckCircleIcon color='success' />
    case 'submitted':
    case 'processing':
    case 'pending_review':
      return <HourglassEmptyIcon color='info' />
    case 'rejected':
    case 'cancelled':
    case 'expired':
      return <ErrorIcon color='error' />
    default:
      return <DescriptionIcon color='action' />
  }
}

// 日時フォーマット
const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Props定義
export interface UTMNotamPanelProps {
  notamRequest: NOTAMRequest | null
  notamRequired: boolean
  onCreateDraft?: () => void
  onSubmit?: () => void
  onEdit?: () => void
  onViewPdf?: () => void
  onRefresh?: () => void
  loading?: boolean
}

export const UTMNotamPanel = ({
  notamRequest,
  notamRequired,
  onCreateDraft,
  onSubmit,
  onEdit,
  onViewPdf,
  onRefresh,
  loading = false,
}: UTMNotamPanelProps) => {
  const theme = useTheme()

  // NOTAM不要の場合
  if (!notamRequired) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 2,
        }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}>
          <Typography variant='h6' fontWeight='bold'>
            NOTAM申請
          </Typography>
        </Box>
        <Alert severity='success' icon={<CheckCircleIcon />}>
          <AlertTitle>NOTAM申請不要</AlertTitle>
          この飛行計画はNOTAM申請が必要ありません。
        </Alert>
      </Paper>
    )
  }

  // NOTAM未作成の場合
  if (!notamRequest) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 2,
        }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}>
          <Typography variant='h6' fontWeight='bold'>
            NOTAM申請
          </Typography>
        </Box>
        <Alert severity='warning'>
          <AlertTitle>NOTAM申請が必要です</AlertTitle>
          この飛行計画はNOTAM申請が必要です。申請書を作成してください。
        </Alert>
        <Button
          variant='contained'
          fullWidth
          startIcon={<ArticleIcon />}
          onClick={onCreateDraft}
          disabled={loading}
          sx={{ mt: 2 }}>
          NOTAM申請書を作成
        </Button>
      </Paper>
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
      }}>
      {/* ヘッダー */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant='h6' fontWeight='bold'>
            NOTAM申請
          </Typography>
          <Chip
            size='small'
            label={getStatusLabel(notamRequest.status)}
            color={getStatusColor(notamRequest.status)}
            icon={getStatusIcon(notamRequest.status) as React.ReactElement}
          />
        </Box>
        <Tooltip title='更新'>
          <IconButton size='small' onClick={onRefresh} disabled={loading}>
            <RefreshIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </Box>

      {/* NOTAM ID（発行済みの場合） */}
      {notamRequest.notamId && (
        <Alert severity='success' sx={{ mb: 2 }}>
          <AlertTitle>NOTAM発行済み</AlertTitle>
          NOTAM ID: <strong>{notamRequest.notamId}</strong>
        </Alert>
      )}

      {/* 却下の場合 */}
      {notamRequest.status === 'rejected' && notamRequest.reviewComment && (
        <Alert severity='error' sx={{ mb: 2 }}>
          <AlertTitle>申請が却下されました</AlertTitle>
          {notamRequest.reviewComment}
        </Alert>
      )}

      {/* 申請情報カード */}
      <Card variant='outlined' sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
            飛行情報
          </Typography>
          <List dense disablePadding>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <PublicIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText
                primary='飛行エリア'
                secondary={
                  <>
                    {notamRequest.location.description}
                    {notamRequest.location.referencePoint && (
                      <Typography
                        variant='caption'
                        display='block'
                        color='text.secondary'>
                        基準点: {notamRequest.location.referencePoint}
                      </Typography>
                    )}
                  </>
                }
                primaryTypographyProps={{
                  variant: 'caption',
                  color: 'text.secondary',
                }}
                secondaryTypographyProps={{
                  variant: 'body2',
                  component: 'div',
                }}
              />
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <DescriptionIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText
                primary='飛行日時'
                secondary={
                  <>
                    {formatDateTime(notamRequest.time.start)} -{' '}
                    {formatDateTime(notamRequest.time.end)}
                    {notamRequest.time.dailySchedule && (
                      <Typography
                        variant='caption'
                        display='block'
                        color='text.secondary'>
                        日次: {notamRequest.time.dailySchedule}
                      </Typography>
                    )}
                  </>
                }
                primaryTypographyProps={{
                  variant: 'caption',
                  color: 'text.secondary',
                }}
                secondaryTypographyProps={{
                  variant: 'body2',
                  component: 'div',
                }}
              />
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <ArticleIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText
                primary='飛行高度'
                secondary={
                  notamRequest.minAltitudeM !== undefined
                    ? `${notamRequest.minAltitudeM}m - ${notamRequest.maxAltitudeM}m`
                    : `最大 ${notamRequest.maxAltitudeM}m`
                }
                primaryTypographyProps={{
                  variant: 'caption',
                  color: 'text.secondary',
                }}
                secondaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <ArticleIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText
                primary='飛行目的'
                secondary={notamRequest.purpose ?? notamRequest.reason}
                primaryTypographyProps={{
                  variant: 'caption',
                  color: 'text.secondary',
                }}
                secondaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* 機体情報カード */}
      {notamRequest.aircraftInfo && (
        <Card variant='outlined' sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
              機体情報
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemText
                  primary='機体タイプ'
                  secondary={notamRequest.aircraftInfo.type}
                  primaryTypographyProps={{
                    variant: 'caption',
                    color: 'text.secondary',
                  }}
                  secondaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary='機種名'
                  secondary={notamRequest.aircraftInfo.model}
                  primaryTypographyProps={{
                    variant: 'caption',
                    color: 'text.secondary',
                  }}
                  secondaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary='登録番号'
                  secondary={notamRequest.aircraftInfo.registrationNumber}
                  primaryTypographyProps={{
                    variant: 'caption',
                    color: 'text.secondary',
                  }}
                  secondaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary='重量'
                  secondary={notamRequest.aircraftInfo.weight}
                  primaryTypographyProps={{
                    variant: 'caption',
                    color: 'text.secondary',
                  }}
                  secondaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              {notamRequest.aircraftInfo.maxFlightTime && (
                <ListItem disableGutters>
                  <ListItemText
                    primary='最大飛行時間'
                    secondary={notamRequest.aircraftInfo.maxFlightTime}
                    primaryTypographyProps={{
                      variant: 'caption',
                      color: 'text.secondary',
                    }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      {/* 申請者情報カード */}
      <Card variant='outlined' sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
            申請者情報
          </Typography>
          <List dense disablePadding>
            <ListItem disableGutters>
              <ListItemText
                primary='氏名'
                secondary={notamRequest.requester.name}
                primaryTypographyProps={{
                  variant: 'caption',
                  color: 'text.secondary',
                }}
                secondaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText
                primary='所属組織'
                secondary={
                  <>
                    {notamRequest.requester.organization}
                    {notamRequest.requester.department && (
                      <Typography
                        variant='caption'
                        display='block'
                        color='text.secondary'>
                        {notamRequest.requester.department}
                      </Typography>
                    )}
                  </>
                }
                primaryTypographyProps={{
                  variant: 'caption',
                  color: 'text.secondary',
                }}
                secondaryTypographyProps={{
                  variant: 'body2',
                  component: 'div',
                }}
              />
            </ListItem>
            {notamRequest.requester.licenseNumber && (
              <ListItem disableGutters>
                <ListItemText
                  primary='技能証明番号'
                  secondary={notamRequest.requester.licenseNumber}
                  primaryTypographyProps={{
                    variant: 'caption',
                    color: 'text.secondary',
                  }}
                  secondaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            )}
            <ListItem disableGutters>
              <ListItemText
                primary='連絡先'
                secondary={notamRequest.requester.contact}
                primaryTypographyProps={{
                  variant: 'caption',
                  color: 'text.secondary',
                }}
                secondaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* 安全対策カード */}
      {notamRequest.safetyMeasures && (
        <Card variant='outlined' sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
              安全対策
            </Typography>
            {Array.isArray(notamRequest.safetyMeasures) ? (
              <List dense disablePadding>
                {notamRequest.safetyMeasures.map((measure, index) => (
                  <ListItem key={index} disableGutters>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <CheckCircleIcon fontSize='small' color='success' />
                    </ListItemIcon>
                    <ListItemText
                      primary={measure}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant='body2'>
                {notamRequest.safetyMeasures}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* 緊急連絡先カード */}
      {notamRequest.emergencyContact && (
        <Card variant='outlined' sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
              緊急連絡先
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemText
                  primary={notamRequest.emergencyContact.primary.name}
                  secondary={
                    <>
                      {notamRequest.emergencyContact.primary.phone}
                      <Typography
                        variant='caption'
                        display='block'
                        color='text.secondary'>
                        対応時間:{' '}
                        {notamRequest.emergencyContact.primary.available}
                      </Typography>
                    </>
                  }
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: 'medium',
                  }}
                  secondaryTypographyProps={{
                    variant: 'body2',
                    component: 'div',
                  }}
                />
              </ListItem>
              {notamRequest.emergencyContact.secondary && (
                <ListItem disableGutters>
                  <ListItemText
                    primary={notamRequest.emergencyContact.secondary.name}
                    secondary={
                      <>
                        {notamRequest.emergencyContact.secondary.phone}
                        <Typography
                          variant='caption'
                          display='block'
                          color='text.secondary'>
                          対応時間:{' '}
                          {notamRequest.emergencyContact.secondary.available}
                        </Typography>
                      </>
                    }
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: 'medium',
                    }}
                    secondaryTypographyProps={{
                      variant: 'body2',
                      component: 'div',
                    }}
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      {/* 添付書類カード */}
      {notamRequest.attachments && notamRequest.attachments.length > 0 && (
        <Card variant='outlined' sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
              添付書類
            </Typography>
            <List dense disablePadding>
              {(
                notamRequest.attachments as Array<
                  { id: string; name: string; size: number } | string
                >
              ).map((attachment, index) => {
                if (typeof attachment === 'string') {
                  return (
                    <ListItem key={index} disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <PictureAsPdfIcon fontSize='small' color='error' />
                      </ListItemIcon>
                      <ListItemText
                        primary={attachment}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  )
                }
                return (
                  <ListItem key={attachment.id} disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PictureAsPdfIcon fontSize='small' color='error' />
                    </ListItemIcon>
                    <ListItemText
                      primary={attachment.name}
                      secondary={`${Math.round(attachment.size / 1024)} KB`}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                )
              })}
            </List>
          </CardContent>
        </Card>
      )}

      {/* 関連NOTAM */}
      {notamRequest.relatedNotams && notamRequest.relatedNotams.length > 0 && (
        <Card variant='outlined' sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
              関連NOTAM
            </Typography>
            <List dense disablePadding>
              {notamRequest.relatedNotams.map((relatedNotam) => (
                <ListItem key={relatedNotam.id} disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PublicIcon fontSize='small' />
                  </ListItemIcon>
                  <ListItemText
                    primary={relatedNotam.id}
                    secondary={relatedNotam.summary}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: 'medium',
                    }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* 審査履歴 */}
      {notamRequest.reviewHistory && notamRequest.reviewHistory.length > 0 ? (
        <Card variant='outlined' sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
              審査履歴
            </Typography>
            <List dense disablePadding>
              {notamRequest.reviewHistory.map((history, index) => (
                <ListItem
                  key={index}
                  disableGutters
                  sx={{ alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                    {history.action === 'approved' ? (
                      <CheckCircleIcon fontSize='small' color='success' />
                    ) : history.action === 'rejected' ? (
                      <ErrorIcon fontSize='small' color='error' />
                    ) : (
                      <HourglassEmptyIcon fontSize='small' color='action' />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <Typography variant='body2' fontWeight='medium'>
                          {history.by}
                        </Typography>
                        <Chip
                          size='small'
                          label={
                            history.action === 'submitted'
                              ? '申請'
                              : history.action === 'reviewed'
                                ? 'レビュー'
                                : history.action === 'approved'
                                  ? '承認'
                                  : history.action === 'rejected'
                                    ? '却下'
                                    : history.action
                          }
                          color={
                            history.action === 'approved'
                              ? 'success'
                              : history.action === 'rejected'
                                ? 'error'
                                : 'default'
                          }
                          sx={{ height: 18, fontSize: '0.65rem' }}
                        />
                      </Stack>
                    }
                    secondary={
                      <>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          display='block'>
                          {formatDateTime(history.at)}
                        </Typography>
                        {history.comment && (
                          <Typography variant='body2' sx={{ mt: 0.5 }}>
                            {history.comment}
                          </Typography>
                        )}
                      </>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      ) : (
        <Card variant='outlined' sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
              申請履歴
            </Typography>
            <Stack spacing={1}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Typography variant='caption' color='text.secondary'>
                  作成日時
                </Typography>
                <Typography variant='body2'>
                  {formatDateTime(notamRequest.createdAt)}
                </Typography>
              </Box>
              {notamRequest.submittedAt && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Typography variant='caption' color='text.secondary'>
                    申請日時
                  </Typography>
                  <Typography variant='body2'>
                    {formatDateTime(notamRequest.submittedAt)}
                  </Typography>
                </Box>
              )}
              {notamRequest.approvedAt && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Typography variant='caption' color='text.secondary'>
                    承認日時
                  </Typography>
                  <Typography variant='body2'>
                    {formatDateTime(notamRequest.approvedAt)}
                  </Typography>
                </Box>
              )}
              {notamRequest.publishedAt && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Typography variant='caption' color='text.secondary'>
                    発行日時
                  </Typography>
                  <Typography variant='body2'>
                    {formatDateTime(notamRequest.publishedAt)}
                  </Typography>
                </Box>
              )}
              {notamRequest.expiresAt && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Typography variant='caption' color='text.secondary'>
                    有効期限
                  </Typography>
                  <Typography variant='body2' color='warning.main'>
                    {formatDateTime(notamRequest.expiresAt)}
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      <Divider sx={{ my: 2 }} />

      {/* アクションボタン */}
      <Stack direction='row' spacing={1}>
        {notamRequest.status === 'draft' && (
          <>
            <Button
              variant='outlined'
              startIcon={<EditIcon />}
              onClick={onEdit}
              disabled={loading}
              sx={{ flex: 1 }}>
              編集
            </Button>
            <Button
              variant='contained'
              startIcon={<CloudUploadIcon />}
              onClick={onSubmit}
              disabled={loading}
              sx={{ flex: 1 }}>
              申請
            </Button>
          </>
        )}
        {notamRequest.status === 'rejected' && (
          <Button
            variant='contained'
            startIcon={<EditIcon />}
            onClick={onEdit}
            disabled={loading}
            fullWidth>
            修正して再申請
          </Button>
        )}
        {notamRequest.documents.pdfUrl && (
          <Button
            variant='outlined'
            startIcon={<PictureAsPdfIcon />}
            onClick={onViewPdf}
            endIcon={<OpenInNewIcon fontSize='small' />}>
            PDF表示
          </Button>
        )}
      </Stack>
    </Paper>
  )
}

export default UTMNotamPanel
