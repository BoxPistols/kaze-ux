'use client'

/**
 * UTM設定パネル
 * プロジェクト設定（単位、日時フォーマット）を切り替えるUI
 */

import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FlightIcon from '@mui/icons-material/Flight'
import LanguageIcon from '@mui/icons-material/Language'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  alpha,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material'
import { motion } from 'framer-motion'
import { useState } from 'react'

import { useProjectSettingsOptional } from '@/contexts/ProjectSettingsContext'
import { colors } from '@/styles/tokens'
import type { ProjectPreset } from '@/types/projectSettings'

interface UTMSettingsPanelProps {
  compact?: boolean
  defaultExpanded?: boolean
}

// プリセット情報
const PRESET_INFO: Record<
  ProjectPreset,
  { label: string; flag: string; description: string }
> = {
  japan: {
    label: '日本',
    flag: 'JP',
    description: 'メートル法 / 日本語 / JST',
  },
  usa: {
    label: 'USA',
    flag: 'US',
    description: 'フィート / 英語 / EST',
  },
  europe: {
    label: 'EU',
    flag: 'EU',
    description: 'メートル法 / 英語 / CET',
  },
  aviation: {
    label: '航空',
    flag: 'AV',
    description: 'フィート / ノット / UTC',
  },
}

const UTMSettingsPanel = ({
  compact = false,
  defaultExpanded = false,
}: UTMSettingsPanelProps) => {
  const theme = useTheme()
  const { settings, applyPreset, updateUnits, updateDateTime } =
    useProjectSettingsOptional()
  const [expanded, setExpanded] = useState(defaultExpanded)

  // 現在のプリセットを判定
  const getCurrentPreset = (): ProjectPreset | null => {
    const { units, dateTime } = settings

    // 航空プリセットの判定
    if (
      units.altitude === 'feet' &&
      units.speed === 'knots' &&
      dateTime.timezone === 'UTC'
    ) {
      return 'aviation'
    }
    // 日本プリセットの判定
    if (units.distance === 'meters' && dateTime.locale === 'ja-JP') {
      return 'japan'
    }
    // USAプリセットの判定
    if (units.distance === 'feet' && dateTime.locale === 'en-US') {
      return 'usa'
    }
    // 欧州プリセットの判定
    if (units.distance === 'meters' && dateTime.locale === 'en-GB') {
      return 'europe'
    }
    return null
  }

  const currentPreset = getCurrentPreset()

  const handlePresetChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPreset: ProjectPreset | null
  ) => {
    if (newPreset) {
      applyPreset(newPreset)
    }
  }

  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      elevation={0}
      sx={{
        overflow: 'hidden',
        borderRadius: 2,
        border: `1px solid ${alpha(colors.gray[500], 0.2)}`,
        background:
          theme.palette.mode === 'dark'
            ? alpha(colors.gray[900], 0.7)
            : alpha('#fff', 0.75),
        backdropFilter: 'blur(16px)',
      }}>
      {/* ヘッダー */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: expanded
            ? `1px solid ${alpha(colors.gray[500], 0.1)}`
            : 'none',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon sx={{ fontSize: 18, color: colors.primary[500] }} />
          <Typography variant='subtitle2' fontWeight={600}>
            プロジェクト設定
          </Typography>
          {currentPreset && (
            <Box
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 1,
                bgcolor: alpha(colors.primary[500], 0.1),
                color: colors.primary[500],
              }}>
              <Typography variant='caption' fontWeight={600}>
                {PRESET_INFO[currentPreset].label}
              </Typography>
            </Box>
          )}
        </Box>
        <IconButton size='small'>
          {expanded ? (
            <ExpandLessIcon fontSize='small' />
          ) : (
            <ExpandMoreIcon fontSize='small' />
          )}
        </IconButton>
      </Box>

      {/* コンテンツ */}
      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          {/* プリセット選択 */}
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ mb: 1, display: 'block' }}>
            プリセット
          </Typography>
          <ToggleButtonGroup
            value={currentPreset}
            exclusive
            onChange={handlePresetChange}
            size='small'
            sx={{ mb: 2, width: '100%', display: 'flex' }}>
            {(Object.keys(PRESET_INFO) as ProjectPreset[]).map((preset) => (
              <ToggleButton
                key={preset}
                value={preset}
                sx={{
                  flex: 1,
                  py: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.25,
                  textTransform: 'none',
                  '&.Mui-selected': {
                    bgcolor: alpha(colors.primary[500], 0.15),
                    color: colors.primary[500],
                  },
                }}>
                <Typography variant='caption' fontWeight={700}>
                  {PRESET_INFO[preset].flag}
                </Typography>
                <Typography variant='caption' sx={{ fontSize: '0.625rem' }}>
                  {PRESET_INFO[preset].label}
                </Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {!compact && (
            <>
              <Divider sx={{ my: 2 }} />

              {/* 単位設定 */}
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <FlightIcon sx={{ fontSize: 16, color: colors.gray[500] }} />
                <Typography variant='caption' color='text.secondary'>
                  単位設定
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 1.5,
                  mb: 2,
                }}>
                {/* 距離単位 */}
                <FormControl size='small' fullWidth>
                  <InputLabel sx={{ fontSize: '0.75rem' }}>距離</InputLabel>
                  <Select
                    value={settings.units.distance}
                    label='距離'
                    onChange={(e) =>
                      updateUnits({
                        distance: e.target
                          .value as typeof settings.units.distance,
                      })
                    }
                    sx={{ fontSize: '0.75rem' }}>
                    <MenuItem value='meters'>m</MenuItem>
                    <MenuItem value='feet'>ft</MenuItem>
                    <MenuItem value='kilometers'>km</MenuItem>
                    <MenuItem value='miles'>mi</MenuItem>
                    <MenuItem value='nauticalMiles'>NM</MenuItem>
                  </Select>
                </FormControl>

                {/* 速度単位 */}
                <FormControl size='small' fullWidth>
                  <InputLabel sx={{ fontSize: '0.75rem' }}>速度</InputLabel>
                  <Select
                    value={settings.units.speed}
                    label='速度'
                    onChange={(e) =>
                      updateUnits({
                        speed: e.target.value as typeof settings.units.speed,
                      })
                    }
                    sx={{ fontSize: '0.75rem' }}>
                    <MenuItem value='ms'>m/s</MenuItem>
                    <MenuItem value='kmh'>km/h</MenuItem>
                    <MenuItem value='mph'>mph</MenuItem>
                    <MenuItem value='knots'>kt</MenuItem>
                  </Select>
                </FormControl>

                {/* 高度単位 */}
                <FormControl size='small' fullWidth>
                  <InputLabel sx={{ fontSize: '0.75rem' }}>高度</InputLabel>
                  <Select
                    value={settings.units.altitude}
                    label='高度'
                    onChange={(e) =>
                      updateUnits({
                        altitude: e.target
                          .value as typeof settings.units.altitude,
                      })
                    }
                    sx={{ fontSize: '0.75rem' }}>
                    <MenuItem value='meters'>m</MenuItem>
                    <MenuItem value='feet'>ft</MenuItem>
                  </Select>
                </FormControl>

                {/* 温度単位 */}
                <FormControl size='small' fullWidth>
                  <InputLabel sx={{ fontSize: '0.75rem' }}>温度</InputLabel>
                  <Select
                    value={settings.units.temperature}
                    label='温度'
                    onChange={(e) =>
                      updateUnits({
                        temperature: e.target
                          .value as typeof settings.units.temperature,
                      })
                    }
                    sx={{ fontSize: '0.75rem' }}>
                    <MenuItem value='celsius'>°C</MenuItem>
                    <MenuItem value='fahrenheit'>°F</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* 日時設定 */}
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <LanguageIcon sx={{ fontSize: 16, color: colors.gray[500] }} />
                <Typography variant='caption' color='text.secondary'>
                  日時設定
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 1.5,
                }}>
                {/* ロケール */}
                <FormControl size='small' fullWidth>
                  <InputLabel sx={{ fontSize: '0.75rem' }}>言語</InputLabel>
                  <Select
                    value={settings.dateTime.locale}
                    label='言語'
                    onChange={(e) =>
                      updateDateTime({
                        locale: e.target
                          .value as typeof settings.dateTime.locale,
                      })
                    }
                    sx={{ fontSize: '0.75rem' }}>
                    <MenuItem value='ja-JP'>日本語</MenuItem>
                    <MenuItem value='en-US'>English (US)</MenuItem>
                    <MenuItem value='en-GB'>English (UK)</MenuItem>
                    <MenuItem value='de-DE'>Deutsch</MenuItem>
                    <MenuItem value='fr-FR'>Français</MenuItem>
                  </Select>
                </FormControl>

                {/* タイムゾーン */}
                <FormControl size='small' fullWidth>
                  <InputLabel sx={{ fontSize: '0.75rem' }}>TZ</InputLabel>
                  <Select
                    value={settings.dateTime.timezone}
                    label='TZ'
                    onChange={(e) =>
                      updateDateTime({
                        timezone: e.target
                          .value as typeof settings.dateTime.timezone,
                      })
                    }
                    sx={{ fontSize: '0.75rem' }}>
                    <MenuItem value='local'>ローカル</MenuItem>
                    <MenuItem value='UTC'>UTC</MenuItem>
                    <MenuItem value='Asia/Tokyo'>JST</MenuItem>
                    <MenuItem value='America/New_York'>EST</MenuItem>
                    <MenuItem value='Europe/London'>GMT</MenuItem>
                  </Select>
                </FormControl>

                {/* 時刻形式 */}
                <FormControl size='small' fullWidth>
                  <InputLabel sx={{ fontSize: '0.75rem' }}>時刻</InputLabel>
                  <Select
                    value={settings.dateTime.timeFormat}
                    label='時刻'
                    onChange={(e) =>
                      updateDateTime({
                        timeFormat: e.target
                          .value as typeof settings.dateTime.timeFormat,
                      })
                    }
                    sx={{ fontSize: '0.75rem' }}>
                    <MenuItem value='24h'>24時間</MenuItem>
                    <MenuItem value='12h'>12時間</MenuItem>
                    <MenuItem value='24h-seconds'>24時間+秒</MenuItem>
                  </Select>
                </FormControl>

                {/* 座標形式 */}
                <Tooltip title='座標表示形式'>
                  <FormControl size='small' fullWidth>
                    <InputLabel sx={{ fontSize: '0.75rem' }}>座標</InputLabel>
                    <Select
                      value={settings.units.coordinates}
                      label='座標'
                      onChange={(e) =>
                        updateUnits({
                          coordinates: e.target
                            .value as typeof settings.units.coordinates,
                        })
                      }
                      sx={{ fontSize: '0.75rem' }}>
                      <MenuItem value='decimal'>10進数</MenuItem>
                      <MenuItem value='dms'>度分秒</MenuItem>
                      <MenuItem value='dmm'>度分</MenuItem>
                    </Select>
                  </FormControl>
                </Tooltip>
              </Box>
            </>
          )}

          {/* 現在の設定サマリー */}
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(colors.gray[500], 0.05),
            }}>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'block', mb: 0.5 }}>
              現在の表示
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant='caption' sx={{ fontFamily: 'monospace' }}>
                100m →{' '}
                {settings.units.distance === 'feet'
                  ? '328ft'
                  : settings.units.distance === 'kilometers'
                    ? '0.1km'
                    : '100m'}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                |
              </Typography>
              <Typography variant='caption' sx={{ fontFamily: 'monospace' }}>
                10m/s →{' '}
                {settings.units.speed === 'kmh'
                  ? '36km/h'
                  : settings.units.speed === 'mph'
                    ? '22mph'
                    : settings.units.speed === 'knots'
                      ? '19kt'
                      : '10m/s'}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                |
              </Typography>
              <Typography variant='caption' sx={{ fontFamily: 'monospace' }}>
                20°C →{' '}
                {settings.units.temperature === 'fahrenheit' ? '68°F' : '20°C'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  )
}

export default UTMSettingsPanel
