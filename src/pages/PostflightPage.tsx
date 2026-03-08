/**
 * PostflightPage - ポストフライト記録ページ
 *
 * フライト完了後の記録作成ページ
 * - フライトサマリー表示
 * - インシデント記録
 * - サイト別レポート（マルチサイトの場合）
 * - 全体ノート
 * - 添付ファイルアップロード
 */

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from '@mui/material'
import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import {
  UTMFlightSummaryHeader,
  UTMPostflightReportForm,
  UTMSitePostflightForm,
} from '@/components/utm'
import {
  createMultiSiteScenario,
  createDefaultScenario,
} from '@/mocks/utmMultiDroneScenarios'
import { getFlightSites, isSingleSiteFlight } from '@/utils/utmHelpers'

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

interface SitePostflightData {
  siteId: string
  siteName: string
  incidents: Incident[]
  notes: string
}

interface PostflightReportData {
  incidents: Incident[]
  notes: string
  attachments: Attachment[]
}

function PostflightPage(): JSX.Element {
  const { flightId } = useParams<{ flightId?: string }>()
  const navigate = useNavigate()

  // フライトデータ取得（URLパラメータまたはデフォルト）
  const flight = useMemo(() => {
    if (flightId === 'multi-site-001') {
      const [multiSiteFlight] = createMultiSiteScenario()
      return multiSiteFlight
    }
    if (flightId) {
      const [defaultFlight] = createDefaultScenario()
      return defaultFlight
    }
    const [multiSiteFlight] = createMultiSiteScenario()
    return multiSiteFlight
  }, [flightId])

  const sites = useMemo(() => getFlightSites(flight), [flight])
  const isMultiSite = useMemo(() => !isSingleSiteFlight(flight), [flight])

  // レポートデータ
  const [reportData, setReportData] = useState<PostflightReportData>({
    incidents: [],
    notes: '',
    attachments: [],
  })

  // サイト別データ（マルチサイトの場合）
  const [siteData, setSiteData] = useState<Record<string, SitePostflightData>>(
    {}
  )

  // サイトデータ更新ハンドラ
  const handleSiteDataChange = useCallback((data: SitePostflightData): void => {
    setSiteData((prev) => ({
      ...prev,
      [data.siteId]: data,
    }))
  }, [])

  // 送信処理
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleSubmit = async (): Promise<void> => {
    setIsSubmitting(true)

    try {
      // TODO: APIへのデータ送信を実装
      // const payload = {
      //   flightId: flight.id,
      //   reportData,
      //   siteData: isMultiSite ? Object.values(siteData) : undefined,
      // }
      // await api.submitPostflightReport(payload)

      // モック: 2秒待機
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setSubmitSuccess(true)

      // 3秒後にプロジェクト一覧に戻る
      setTimeout(() => {
        navigate('/project')
      }, 3000)
    } catch (error) {
      console.error('Failed to submit postflight report:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // キャンセル処理
  const handleCancel = (): void => {
    if (
      reportData.incidents.length > 0 ||
      reportData.notes.trim() !== '' ||
      reportData.attachments.length > 0 ||
      Object.keys(siteData).length > 0
    ) {
      const confirmed = window.confirm(
        '入力内容が破棄されます。よろしいですか？'
      )
      if (!confirmed) return
    }
    navigate(-1)
  }

  if (!flight) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='error'>
          <AlertTitle>フライトが見つかりません</AlertTitle>
          <Typography variant='body2'>フライトID: {flightId}</Typography>
        </Alert>
      </Container>
    )
  }

  if (submitSuccess) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='success' icon={<CheckCircleIcon fontSize='large' />}>
          <AlertTitle>フライト記録が完了しました</AlertTitle>
          <Typography variant='body2'>
            フライトID: {flight.id} の記録が正常に保存されました。
          </Typography>
          <Typography variant='body2' sx={{ mt: 1 }}>
            3秒後にプロジェクト一覧に戻ります...
          </Typography>
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant='outlined'
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          sx={{ mb: 2 }}>
          戻る
        </Button>
        <Typography variant='h4' fontWeight='bold' gutterBottom>
          ポストフライト記録
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          フライト完了後の記録を作成してください
        </Typography>
      </Box>

      {/* フライトサマリー */}
      <Box sx={{ mb: 4 }}>
        <UTMFlightSummaryHeader flight={flight} />
      </Box>

      {/* マルチサイトアコーディオン */}
      {isMultiSite && sites.length > 1 && (
        <Box sx={{ mb: 4 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' fontWeight='bold' gutterBottom>
                サイト別レポート
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                各拠点でのインシデントや特記事項を記録してください
              </Typography>

              {sites.map((site, index) => (
                <Accordion key={site.id} defaultExpanded={index === 0}>
                  <AccordionSummary>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        width: '100%',
                      }}>
                      <Typography variant='subtitle1' fontWeight='bold'>
                        {site.name}
                      </Typography>
                      {siteData[site.id] && (
                        <Typography variant='caption' color='text.secondary'>
                          インシデント: {siteData[site.id].incidents.length}件
                        </Typography>
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <UTMSitePostflightForm
                      site={site}
                      data={siteData[site.id]}
                      onChange={handleSiteDataChange}
                    />
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* 全体レポート */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant='h6' fontWeight='bold' gutterBottom>
            全体レポート
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            フライト全体に関する情報を記録してください
          </Typography>
          <UTMPostflightReportForm data={reportData} onChange={setReportData} />
        </CardContent>
      </Card>

      {/* アクションボタン */}
      <Stack direction='row' spacing={2} justifyContent='flex-end'>
        <Button
          variant='outlined'
          onClick={handleCancel}
          disabled={isSubmitting}>
          キャンセル
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting ? undefined : <CheckCircleIcon />}>
          {isSubmitting ? '送信中...' : 'フライト完了'}
        </Button>
      </Stack>
    </Container>
  )
}

export default PostflightPage
