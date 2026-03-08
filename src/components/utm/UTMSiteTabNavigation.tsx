/**
 * UTMサイトタブナビゲーション
 *
 * マルチサイトフライトのサイト選択タブを表示
 * - サイト名表示
 * - ドローン数バッジ
 * - ステータス色分け
 * - レスポンシブ対応
 */

import { Badge, Box, Chip, Stack, Tab, Tabs } from '@mui/material'
import { useMemo } from 'react'

import type { SiteInfo } from '../../types/utmTypes'

interface UTMSiteTabNavigationProps {
  sites: SiteInfo[]
  activeSiteId: string
  onSiteChange: (siteId: string) => void
  flightStatus?: 'preflight' | 'in_flight' | 'completed'
}

/**
 * フライトステータスに応じた色を取得
 */
const getStatusColor = (
  status: UTMSiteTabNavigationProps['flightStatus']
): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  switch (status) {
    case 'preflight':
      return 'warning'
    case 'in_flight':
      return 'primary'
    case 'completed':
      return 'success'
    default:
      return 'default'
  }
}

/**
 * フライトステータスのラベルを取得
 */
const getStatusLabel = (
  status: UTMSiteTabNavigationProps['flightStatus']
): string => {
  switch (status) {
    case 'preflight':
      return 'プリフライト'
    case 'in_flight':
      return '飛行中'
    case 'completed':
      return '完了'
    default:
      return ''
  }
}

function UTMSiteTabNavigation(props: UTMSiteTabNavigationProps): JSX.Element {
  const { sites, activeSiteId, onSiteChange, flightStatus } = props

  // アクティブサイトのインデックスを取得
  const activeIndex = useMemo(() => {
    const index = sites.findIndex((site) => site.id === activeSiteId)
    return index >= 0 ? index : 0
  }, [sites, activeSiteId])

  // タブ変更ハンドラ
  const handleChange = (
    _event: React.SyntheticEvent,
    newIndex: number
  ): void => {
    const newSite = sites[newIndex]
    if (newSite) {
      onSiteChange(newSite.id)
    }
  }

  if (sites.length === 0) {
    return <></>
  }

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}>
      <Stack
        direction='row'
        spacing={2}
        alignItems='center'
        sx={{ px: 2, py: 1 }}>
        {/* サイトタブ */}
        <Tabs
          value={activeIndex}
          onChange={handleChange}
          variant='scrollable'
          scrollButtons='auto'
          sx={{ flex: 1 }}>
          {sites.map((site) => (
            <Tab
              key={site.id}
              label={
                <Stack direction='row' spacing={1} alignItems='center'>
                  <span>{site.name}</span>
                  <Badge
                    badgeContent={site.drones.length}
                    color='primary'
                    max={99}
                    showZero
                    sx={{
                      '& .MuiBadge-badge': {
                        right: -8,
                        top: 4,
                        fontSize: '0.7rem',
                        height: 18,
                        minWidth: 18,
                      },
                    }}
                  />
                </Stack>
              }
              sx={{
                textTransform: 'none',
                minHeight: 48,
                '&.Mui-selected': {
                  fontWeight: 'bold',
                },
              }}
            />
          ))}
        </Tabs>

        {/* ステータス表示 */}
        {flightStatus && (
          <Chip
            label={getStatusLabel(flightStatus)}
            color={getStatusColor(flightStatus)}
            size='small'
            variant='outlined'
            sx={{ fontWeight: 'bold' }}
          />
        )}
      </Stack>
    </Box>
  )
}

export default UTMSiteTabNavigation
