/**
 * プロジェクト設定デモ
 * 計測単位・日時フォーマットの切り替え機能を確認
 */
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  TextField,
  Grid,
  Stack,
  Chip,
} from '@mui/material'
import { useState, useCallback } from 'react'

import {
  ProjectSettingsProvider,
  useProjectSettings,
} from '../../../contexts/ProjectSettingsContext'

import type { ProjectPreset } from '../../../types/projectSettings'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Components/UTM/ProjectSettingsDemo',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## プロジェクト設定デモ

プロジェクトごとの計測単位・日時フォーマット切り替え機能のデモです。

### プリセット
- **日本**: メートル法、日本語フォーマット、JST
- **USA**: フィート/マイル、12時間制、米国フォーマット
- **ヨーロッパ**: メートル法、24時間制、英国フォーマット
- **航空**: フィート/ノット、UTC、航空標準

### 機能
- 距離・速度・高度・温度・気圧の単位変換
- 日付・時刻のローカライズフォーマット
- 座標表示形式（10進/度分秒/度分）
- 相対時間表示のON/OFF
- モックデータの基準位置設定
        `,
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

// サンプルデータ
const SAMPLE_DATA = {
  distance: 1500, // メートル
  speed: 12.5, // m/s
  altitude: 120, // メートル
  temperature: 22.5, // 摂氏
  pressure: 1013, // hPa
  latitude: 35.6812,
  longitude: 139.7671,
  timestamp: new Date(),
  pastTime: new Date(Date.now() - 15 * 60 * 1000), // 15分前
  oldTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3時間前
}

// 設定パネルコンポーネント
const SettingsPanel = () => {
  const { settings, applyPreset, updateUnits, updateDateTime, updateMockData } =
    useProjectSettings()

  const handlePresetChange = useCallback(
    (preset: ProjectPreset) => {
      applyPreset(preset)
    },
    [applyPreset]
  )

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant='h6' gutterBottom>
        設定
      </Typography>

      <Grid container spacing={3}>
        {/* プリセット選択 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth size='small'>
            <InputLabel>プリセット</InputLabel>
            <Select
              value=''
              label='プリセット'
              onChange={(e) =>
                handlePresetChange(e.target.value as ProjectPreset)
              }>
              <MenuItem value='japan'>日本</MenuItem>
              <MenuItem value='usa'>USA</MenuItem>
              <MenuItem value='europe'>ヨーロッパ</MenuItem>
              <MenuItem value='aviation'>航空</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* 距離単位 */}
        <Grid size={{ xs: 6, md: 2 }}>
          <FormControl fullWidth size='small'>
            <InputLabel>距離</InputLabel>
            <Select
              value={settings.units.distance}
              label='距離'
              onChange={(e) =>
                updateUnits({
                  distance: e.target.value as typeof settings.units.distance,
                })
              }>
              <MenuItem value='meters'>メートル</MenuItem>
              <MenuItem value='feet'>フィート</MenuItem>
              <MenuItem value='kilometers'>キロメートル</MenuItem>
              <MenuItem value='miles'>マイル</MenuItem>
              <MenuItem value='nauticalMiles'>海里</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* 速度単位 */}
        <Grid size={{ xs: 6, md: 2 }}>
          <FormControl fullWidth size='small'>
            <InputLabel>速度</InputLabel>
            <Select
              value={settings.units.speed}
              label='速度'
              onChange={(e) =>
                updateUnits({
                  speed: e.target.value as typeof settings.units.speed,
                })
              }>
              <MenuItem value='ms'>m/s</MenuItem>
              <MenuItem value='kmh'>km/h</MenuItem>
              <MenuItem value='mph'>mph</MenuItem>
              <MenuItem value='knots'>ノット</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* 高度単位 */}
        <Grid size={{ xs: 6, md: 2 }}>
          <FormControl fullWidth size='small'>
            <InputLabel>高度</InputLabel>
            <Select
              value={settings.units.altitude}
              label='高度'
              onChange={(e) =>
                updateUnits({
                  altitude: e.target.value as typeof settings.units.altitude,
                })
              }>
              <MenuItem value='meters'>メートル</MenuItem>
              <MenuItem value='feet'>フィート</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* 温度単位 */}
        <Grid size={{ xs: 6, md: 2 }}>
          <FormControl fullWidth size='small'>
            <InputLabel>温度</InputLabel>
            <Select
              value={settings.units.temperature}
              label='温度'
              onChange={(e) =>
                updateUnits({
                  temperature: e.target
                    .value as typeof settings.units.temperature,
                })
              }>
              <MenuItem value='celsius'>摂氏</MenuItem>
              <MenuItem value='fahrenheit'>華氏</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={3}>
        {/* ロケール */}
        <Grid size={{ xs: 6, md: 2 }}>
          <FormControl fullWidth size='small'>
            <InputLabel>ロケール</InputLabel>
            <Select
              value={settings.dateTime.locale}
              label='ロケール'
              onChange={(e) =>
                updateDateTime({
                  locale: e.target.value as typeof settings.dateTime.locale,
                })
              }>
              <MenuItem value='ja-JP'>日本語</MenuItem>
              <MenuItem value='en-US'>英語(US)</MenuItem>
              <MenuItem value='en-GB'>英語(UK)</MenuItem>
              <MenuItem value='de-DE'>ドイツ語</MenuItem>
              <MenuItem value='fr-FR'>フランス語</MenuItem>
              <MenuItem value='zh-CN'>中国語</MenuItem>
              <MenuItem value='ko-KR'>韓国語</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* 日付フォーマット */}
        <Grid size={{ xs: 6, md: 2 }}>
          <FormControl fullWidth size='small'>
            <InputLabel>日付</InputLabel>
            <Select
              value={settings.dateTime.dateFormat}
              label='日付'
              onChange={(e) =>
                updateDateTime({
                  dateFormat: e.target
                    .value as typeof settings.dateTime.dateFormat,
                })
              }>
              <MenuItem value='YYYY/MM/DD'>YYYY/MM/DD</MenuItem>
              <MenuItem value='YYYY-MM-DD'>YYYY-MM-DD</MenuItem>
              <MenuItem value='DD/MM/YYYY'>DD/MM/YYYY</MenuItem>
              <MenuItem value='MM/DD/YYYY'>MM/DD/YYYY</MenuItem>
              <MenuItem value='YYYY年MM月DD日'>YYYY年MM月DD日</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* 時刻フォーマット */}
        <Grid size={{ xs: 6, md: 2 }}>
          <FormControl fullWidth size='small'>
            <InputLabel>時刻</InputLabel>
            <Select
              value={settings.dateTime.timeFormat}
              label='時刻'
              onChange={(e) =>
                updateDateTime({
                  timeFormat: e.target
                    .value as typeof settings.dateTime.timeFormat,
                })
              }>
              <MenuItem value='24h'>24時間</MenuItem>
              <MenuItem value='12h'>12時間</MenuItem>
              <MenuItem value='24h-seconds'>24時間(秒)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* タイムゾーン */}
        <Grid size={{ xs: 6, md: 2 }}>
          <FormControl fullWidth size='small'>
            <InputLabel>タイムゾーン</InputLabel>
            <Select
              value={settings.dateTime.timezone}
              label='タイムゾーン'
              onChange={(e) =>
                updateDateTime({
                  timezone: e.target.value as typeof settings.dateTime.timezone,
                })
              }>
              <MenuItem value='local'>ローカル</MenuItem>
              <MenuItem value='UTC'>UTC</MenuItem>
              <MenuItem value='Asia/Tokyo'>JST</MenuItem>
              <MenuItem value='America/New_York'>EST</MenuItem>
              <MenuItem value='America/Los_Angeles'>PST</MenuItem>
              <MenuItem value='Europe/London'>GMT</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* 座標形式 */}
        <Grid size={{ xs: 6, md: 2 }}>
          <FormControl fullWidth size='small'>
            <InputLabel>座標</InputLabel>
            <Select
              value={settings.units.coordinates}
              label='座標'
              onChange={(e) =>
                updateUnits({
                  coordinates: e.target
                    .value as typeof settings.units.coordinates,
                })
              }>
              <MenuItem value='decimal'>10進数</MenuItem>
              <MenuItem value='dms'>度分秒</MenuItem>
              <MenuItem value='dmm'>度分</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* 相対時間 */}
        <Grid size={{ xs: 6, md: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.dateTime.useRelativeTime}
                onChange={(e) =>
                  updateDateTime({ useRelativeTime: e.target.checked })
                }
              />
            }
            label='相対時間'
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant='subtitle2' gutterBottom>
        モックデータ設定
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size='small'
            label='基準位置名'
            value={settings.mockData.baseLocation.name}
            onChange={(e) =>
              updateMockData({
                baseLocation: {
                  ...settings.mockData.baseLocation,
                  name: e.target.value,
                },
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <TextField
            fullWidth
            size='small'
            label='緯度'
            type='number'
            value={settings.mockData.baseLocation.latitude}
            onChange={(e) =>
              updateMockData({
                baseLocation: {
                  ...settings.mockData.baseLocation,
                  latitude: parseFloat(e.target.value) || 0,
                },
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <TextField
            fullWidth
            size='small'
            label='経度'
            type='number'
            value={settings.mockData.baseLocation.longitude}
            onChange={(e) =>
              updateMockData({
                baseLocation: {
                  ...settings.mockData.baseLocation,
                  longitude: parseFloat(e.target.value) || 0,
                },
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.mockData.useFixedTime}
                onChange={(e) =>
                  updateMockData({ useFixedTime: e.target.checked })
                }
              />
            }
            label='固定時刻'
          />
        </Grid>
      </Grid>
    </Paper>
  )
}

// 表示サンプルコンポーネント
const DisplaySamples = () => {
  const { formatters, settings } = useProjectSettings()

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h6' gutterBottom>
        表示サンプル
      </Typography>

      {/* 現在の設定 */}
      <Stack direction='row' spacing={1} sx={{ mb: 2 }}>
        <Chip
          label={`距離: ${formatters.units.labels.distance}`}
          size='small'
        />
        <Chip label={`速度: ${formatters.units.labels.speed}`} size='small' />
        <Chip
          label={`高度: ${formatters.units.labels.altitude}`}
          size='small'
        />
        <Chip
          label={`温度: ${formatters.units.labels.temperature}`}
          size='small'
        />
        <Chip
          label={settings.dateTime.locale}
          size='small'
          variant='outlined'
        />
        <Chip
          label={settings.dateTime.timezone}
          size='small'
          variant='outlined'
        />
      </Stack>

      <TableContainer>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>項目</TableCell>
              <TableCell>元データ</TableCell>
              <TableCell>フォーマット後</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* 距離 */}
            <TableRow>
              <TableCell>距離</TableCell>
              <TableCell>{SAMPLE_DATA.distance} m</TableCell>
              <TableCell>
                <strong>
                  {formatters.units.distance(SAMPLE_DATA.distance)}
                </strong>
              </TableCell>
            </TableRow>

            {/* 速度 */}
            <TableRow>
              <TableCell>速度</TableCell>
              <TableCell>{SAMPLE_DATA.speed} m/s</TableCell>
              <TableCell>
                <strong>{formatters.units.speed(SAMPLE_DATA.speed)}</strong>
              </TableCell>
            </TableRow>

            {/* 高度 */}
            <TableRow>
              <TableCell>高度</TableCell>
              <TableCell>{SAMPLE_DATA.altitude} m</TableCell>
              <TableCell>
                <strong>
                  {formatters.units.altitude(SAMPLE_DATA.altitude)}
                </strong>
              </TableCell>
            </TableRow>

            {/* 温度 */}
            <TableRow>
              <TableCell>温度</TableCell>
              <TableCell>{SAMPLE_DATA.temperature} °C</TableCell>
              <TableCell>
                <strong>
                  {formatters.units.temperature(SAMPLE_DATA.temperature)}
                </strong>
              </TableCell>
            </TableRow>

            {/* 気圧 */}
            <TableRow>
              <TableCell>気圧</TableCell>
              <TableCell>{SAMPLE_DATA.pressure} hPa</TableCell>
              <TableCell>
                <strong>
                  {formatters.units.pressure(SAMPLE_DATA.pressure)}
                </strong>
              </TableCell>
            </TableRow>

            {/* 座標 */}
            <TableRow>
              <TableCell>座標</TableCell>
              <TableCell>
                {SAMPLE_DATA.latitude}, {SAMPLE_DATA.longitude}
              </TableCell>
              <TableCell>
                <strong>
                  {
                    formatters.units.coordinate(
                      SAMPLE_DATA.latitude,
                      SAMPLE_DATA.longitude
                    ).combined
                  }
                </strong>
              </TableCell>
            </TableRow>

            {/* 日付 */}
            <TableRow>
              <TableCell>日付</TableCell>
              <TableCell>{SAMPLE_DATA.timestamp.toISOString()}</TableCell>
              <TableCell>
                <strong>{formatters.date(SAMPLE_DATA.timestamp)}</strong>
              </TableCell>
            </TableRow>

            {/* 時刻 */}
            <TableRow>
              <TableCell>時刻</TableCell>
              <TableCell>{SAMPLE_DATA.timestamp.toISOString()}</TableCell>
              <TableCell>
                <strong>{formatters.time(SAMPLE_DATA.timestamp)}</strong>
              </TableCell>
            </TableRow>

            {/* 日時 */}
            <TableRow>
              <TableCell>日時</TableCell>
              <TableCell>{SAMPLE_DATA.timestamp.toISOString()}</TableCell>
              <TableCell>
                <strong>{formatters.dateTime(SAMPLE_DATA.timestamp)}</strong>
              </TableCell>
            </TableRow>

            {/* 相対時間（15分前） */}
            <TableRow>
              <TableCell>相対時間（15分前）</TableCell>
              <TableCell>{SAMPLE_DATA.pastTime.toISOString()}</TableCell>
              <TableCell>
                <strong>{formatters.relativeTime(SAMPLE_DATA.pastTime)}</strong>
              </TableCell>
            </TableRow>

            {/* 相対時間（3時間前） */}
            <TableRow>
              <TableCell>相対時間（3時間前）</TableCell>
              <TableCell>{SAMPLE_DATA.oldTime.toISOString()}</TableCell>
              <TableCell>
                <strong>{formatters.relativeTime(SAMPLE_DATA.oldTime)}</strong>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

// メインデモコンポーネント
const ProjectSettingsDemo = () => {
  return (
    <ProjectSettingsProvider>
      <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
        <Typography variant='h4' gutterBottom>
          プロジェクト設定デモ
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          プリセットを選択するか、個別に設定を変更して表示の変化を確認してください。
        </Typography>

        <SettingsPanel />
        <DisplaySamples />
      </Box>
    </ProjectSettingsProvider>
  )
}

// プリセット比較デモ
const PresetComparisonDemo = () => {
  const [selectedPreset, setSelectedPreset] = useState<ProjectPreset>('japan')

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Typography variant='h4' gutterBottom>
        プリセット比較
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>プリセット選択</InputLabel>
          <Select
            value={selectedPreset}
            label='プリセット選択'
            onChange={(e) =>
              setSelectedPreset(e.target.value as ProjectPreset)
            }>
            <MenuItem value='japan'>日本</MenuItem>
            <MenuItem value='usa'>USA</MenuItem>
            <MenuItem value='europe'>ヨーロッパ</MenuItem>
            <MenuItem value='aviation'>航空</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <ProjectSettingsProvider
        key={selectedPreset}
        initialSettings={{
          id: selectedPreset,
          name: selectedPreset,
        }}>
        <PresetDisplay presetName={selectedPreset} />
      </ProjectSettingsProvider>
    </Box>
  )
}

const PresetDisplay = (props: { presetName: string }) => {
  const { settings, formatters, applyPreset } = useProjectSettings()
  const { presetName } = props

  // プリセットを適用
  useState(() => {
    applyPreset(presetName as ProjectPreset)
  })

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h6' gutterBottom>
        {presetName.toUpperCase()} プリセット
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant='subtitle2' gutterBottom>
            単位設定
          </Typography>
          <Stack spacing={1}>
            <Box>距離: {formatters.units.distance(1500)}</Box>
            <Box>速度: {formatters.units.speed(12.5)}</Box>
            <Box>高度: {formatters.units.altitude(120)}</Box>
            <Box>温度: {formatters.units.temperature(22.5)}</Box>
            <Box>気圧: {formatters.units.pressure(1013)}</Box>
            <Box>
              座標: {formatters.units.coordinate(35.6812, 139.7671).combined}
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant='subtitle2' gutterBottom>
            日時設定
          </Typography>
          <Stack spacing={1}>
            <Box>ロケール: {settings.dateTime.locale}</Box>
            <Box>タイムゾーン: {settings.dateTime.timezone}</Box>
            <Box>日付: {formatters.date(new Date())}</Box>
            <Box>時刻: {formatters.time(new Date())}</Box>
            <Box>日時: {formatters.dateTime(new Date())}</Box>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  )
}

// ===== ストーリー =====

/**
 * インタラクティブデモ - 設定を自由に変更可能
 */
export const Interactive: Story = {
  render: () => <ProjectSettingsDemo />,
}

/**
 * プリセット比較 - 各プリセットの設定を比較
 */
export const PresetComparison: Story = {
  render: () => <PresetComparisonDemo />,
}

/**
 * 日本プリセット
 */
export const JapanPreset: Story = {
  render: () => (
    <ProjectSettingsProvider initialSettings={{ id: 'japan', name: '日本' }}>
      <Box sx={{ p: 3 }}>
        <PresetDisplay presetName='japan' />
      </Box>
    </ProjectSettingsProvider>
  ),
}

/**
 * USAプリセット
 */
export const USAPreset: Story = {
  render: () => (
    <ProjectSettingsProvider initialSettings={{ id: 'usa', name: 'USA' }}>
      <Box sx={{ p: 3 }}>
        <PresetDisplay presetName='usa' />
      </Box>
    </ProjectSettingsProvider>
  ),
}

/**
 * 航空プリセット
 */
export const AviationPreset: Story = {
  render: () => (
    <ProjectSettingsProvider initialSettings={{ id: 'aviation', name: '航空' }}>
      <Box sx={{ p: 3 }}>
        <PresetDisplay presetName='aviation' />
      </Box>
    </ProjectSettingsProvider>
  ),
}
