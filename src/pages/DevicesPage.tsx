// src/pages/DevicesPage.tsx
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull'
import CheckIcon from '@mui/icons-material/Check'
import FlightIcon from '@mui/icons-material/Flight'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import SyncIcon from '@mui/icons-material/Sync'
import WorkspacesIcon from '@mui/icons-material/Workspaces'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  styled,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { useState } from 'react'

import { ActionMenu, type ActionMenuItem } from '@/components/ui/menu'
import { PageHeader } from '@/components/ui/text'

// ステータスドット
interface StatusDotProps {
  status: 'online' | 'offline' | 'standby'
}

const StatusDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'status',
})<StatusDotProps>(({ theme, status }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor:
    status === 'online'
      ? theme.palette.success.main
      : status === 'standby'
        ? theme.palette.warning.main
        : theme.palette.grey[400],
  flexShrink: 0,
}))

// モックデバイスデータ
const mockDrones = [
  {
    id: 'd1',
    name: 'Matrice 350 RTK #1',
    serial: 'DJI-M350-001',
    registration: 'JU0000000001',
    status: 'online' as const,
    battery: 85,
    dipsConnected: true,
  },
  {
    id: 'd2',
    name: 'Matrice 350 RTK #2',
    serial: 'DJI-M350-002',
    registration: 'JU0000000002',
    status: 'offline' as const,
    battery: 45,
    dipsConnected: true,
  },
  {
    id: 'd3',
    name: 'Matrice 30T',
    serial: 'DJI-M30T-001',
    registration: 'JU0000000003',
    status: 'online' as const,
    battery: 92,
    dipsConnected: false,
  },
  {
    id: 'd4',
    name: 'Mavic 3 Enterprise',
    serial: 'DJI-M3E-001',
    registration: null,
    status: 'offline' as const,
    battery: 20,
    dipsConnected: false,
  },
  {
    id: 'd5',
    name: 'Phantom 4 RTK',
    serial: 'DJI-P4RTK-001',
    registration: 'JU0000000004',
    status: 'standby' as const,
    battery: 100,
    dipsConnected: true,
  },
  {
    id: 'd6',
    name: 'Matrice 300 RTK',
    serial: 'DJI-M300-001',
    registration: 'JU0000000005',
    status: 'online' as const,
    battery: 78,
    dipsConnected: true,
  },
  {
    id: 'd7',
    name: 'Inspire 3',
    serial: 'DJI-I3-001',
    registration: 'JU0000000006',
    status: 'offline' as const,
    battery: 0,
    dipsConnected: false,
  },
  {
    id: 'd8',
    name: 'Mini 4 Pro',
    serial: 'DJI-M4P-001',
    registration: null,
    status: 'standby' as const,
    battery: 65,
    dipsConnected: false,
  },
]

const mockPorts = [
  {
    id: 'p1',
    name: 'ドローンポート #1',
    serial: 'PORT-001',
    location: '東京湾岸',
    status: 'online' as const,
    dipsConnected: true,
  },
  {
    id: 'p2',
    name: 'ドローンポート #2',
    serial: 'PORT-002',
    location: '千葉エリア',
    status: 'standby' as const,
    dipsConnected: false,
  },
  {
    id: 'p3',
    name: 'ドローンポート #3',
    serial: 'PORT-003',
    location: '埼玉北部',
    status: 'online' as const,
    dipsConnected: true,
  },
  {
    id: 'p4',
    name: 'ドローンポート #4',
    serial: 'PORT-004',
    location: '神奈川中央',
    status: 'offline' as const,
    dipsConnected: false,
  },
]

const DevicesPage = () => {
  const [tabValue, setTabValue] = useState(0)
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')

  const getStatusLabel = (status: 'online' | 'offline' | 'standby') => {
    switch (status) {
      case 'online':
        return 'オンライン'
      case 'standby':
        return '待機中'
      default:
        return 'オフライン'
    }
  }

  const getDroneActionMenuItems = (droneId: string): ActionMenuItem[] => [
    {
      id: 'edit',
      label: '編集',
      onClick: () => console.log('Edit drone:', droneId),
    },
    {
      id: 'delete',
      label: '削除',
      onClick: () => console.log('Delete drone:', droneId),
      danger: true,
    },
  ]

  const getPortActionMenuItems = (portId: string): ActionMenuItem[] => [
    {
      id: 'edit',
      label: '編集',
      onClick: () => console.log('Edit port:', portId),
    },
    {
      id: 'delete',
      label: '削除',
      onClick: () => console.log('Delete port:', portId),
      danger: true,
    },
  ]

  const renderDroneTable = () => (
    <Card sx={{ overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: '65vh' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width='20%'>名前</TableCell>
              <TableCell width='15%'>登記番号</TableCell>
              <TableCell width='8%' align='center'>
                DIPS
              </TableCell>
              <TableCell width='12%'>バッテリー</TableCell>
              <TableCell width='10%'>ステータス</TableCell>
              <TableCell align='right' width='8%'>
                アクション
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockDrones.map((drone) => (
              <TableRow key={drone.id} sx={{ cursor: 'pointer' }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FlightIcon
                      sx={{ fontSize: 18, color: 'text.secondary' }}
                    />
                    <Box>
                      <Typography variant='body2' fontWeight='medium'>
                        {drone.name}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {drone.serial}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>
                    {drone.registration || '-'}
                  </Typography>
                </TableCell>
                <TableCell align='center'>
                  {drone.dipsConnected && (
                    <CheckIcon sx={{ fontSize: 18, color: 'success.main' }} />
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BatteryChargingFullIcon
                      sx={{
                        fontSize: 16,
                        color:
                          drone.battery > 50
                            ? 'success.main'
                            : drone.battery > 20
                              ? 'warning.main'
                              : 'error.main',
                      }}
                    />
                    <Typography variant='body2'>{drone.battery}%</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StatusDot status={drone.status} />
                    <Typography variant='body2'>
                      {getStatusLabel(drone.status)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align='right' onClick={(e) => e.stopPropagation()}>
                  <ActionMenu items={getDroneActionMenuItems(drone.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )

  const renderDroneCards = () => (
    <Grid container spacing={3}>
      {mockDrones.map((drone) => (
        <Grid size={4} key={drone.id}>
          <Card
            elevation={1}
            sx={{
              cursor: 'pointer',
              '&:hover': { boxShadow: 2 },
              transition: 'box-shadow 0.2s',
            }}>
            <CardHeader
              sx={{ pb: 1 }}
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FlightIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant='h6' sx={{ fontSize: '1rem' }}>
                    {drone.name}
                  </Typography>
                </Box>
              }
              action={
                <Box onClick={(e) => e.stopPropagation()}>
                  <ActionMenu items={getDroneActionMenuItems(drone.id)} />
                </Box>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 2,
                  mb: 2,
                }}>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    シリアル
                  </Typography>
                  <Typography variant='body2'>{drone.serial}</Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    登記番号
                  </Typography>
                  <Typography variant='body2'>
                    {drone.registration || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    バッテリー
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BatteryChargingFullIcon
                      sx={{
                        fontSize: 16,
                        color:
                          drone.battery > 50
                            ? 'success.main'
                            : drone.battery > 20
                              ? 'warning.main'
                              : 'error.main',
                      }}
                    />
                    <Typography variant='body2'>{drone.battery}%</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    ステータス
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StatusDot status={drone.status} />
                    <Typography variant='body2'>
                      {getStatusLabel(drone.status)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {drone.dipsConnected && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckIcon sx={{ fontSize: 14, color: 'success.main' }} />
                  <Typography variant='body2' color='success.main'>
                    DIPS連携済み
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )

  const renderPortTable = () => (
    <Card sx={{ overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: '65vh' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width='25%'>名前</TableCell>
              <TableCell width='20%'>場所</TableCell>
              <TableCell width='8%' align='center'>
                DIPS
              </TableCell>
              <TableCell width='15%'>ステータス</TableCell>
              <TableCell align='right' width='8%'>
                アクション
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockPorts.map((port) => (
              <TableRow key={port.id} sx={{ cursor: 'pointer' }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkspacesIcon
                      sx={{ fontSize: 18, color: 'text.secondary' }}
                    />
                    <Box>
                      <Typography variant='body2' fontWeight='medium'>
                        {port.name}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {port.serial}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon
                      sx={{ fontSize: 16, color: 'text.secondary' }}
                    />
                    <Typography variant='body2'>{port.location}</Typography>
                  </Box>
                </TableCell>
                <TableCell align='center'>
                  {port.dipsConnected && (
                    <CheckIcon sx={{ fontSize: 18, color: 'success.main' }} />
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StatusDot status={port.status} />
                    <Typography variant='body2'>
                      {getStatusLabel(port.status)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align='right' onClick={(e) => e.stopPropagation()}>
                  <ActionMenu items={getPortActionMenuItems(port.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )

  const renderPortCards = () => (
    <Grid container spacing={3}>
      {mockPorts.map((port) => (
        <Grid size={4} key={port.id}>
          <Card
            elevation={1}
            sx={{
              cursor: 'pointer',
              '&:hover': { boxShadow: 2 },
              transition: 'box-shadow 0.2s',
            }}>
            <CardHeader
              sx={{ pb: 1 }}
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkspacesIcon
                    sx={{ fontSize: 20, color: 'text.secondary' }}
                  />
                  <Typography variant='h6' sx={{ fontSize: '1rem' }}>
                    {port.name}
                  </Typography>
                </Box>
              }
              action={
                <Box onClick={(e) => e.stopPropagation()}>
                  <ActionMenu items={getPortActionMenuItems(port.id)} />
                </Box>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 2,
                  mb: 2,
                }}>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    シリアル
                  </Typography>
                  <Typography variant='body2'>{port.serial}</Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    場所
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon
                      sx={{ fontSize: 14, color: 'text.secondary' }}
                    />
                    <Typography variant='body2'>{port.location}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    ステータス
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StatusDot status={port.status} />
                    <Typography variant='body2'>
                      {getStatusLabel(port.status)}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  {port.dipsConnected && (
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckIcon sx={{ fontSize: 14, color: 'success.main' }} />
                      <Typography variant='body2' color='success.main'>
                        DIPS連携済み
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )

  return (
    <Box>
      {/* ページヘッダー */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <PageHeader
          title='デバイス管理'
          subtitle='ドローンとポートを管理します'
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant='contained' startIcon={<SyncIcon />}>
            DIPS同期
          </Button>
          <Button variant='outlined' startIcon={<SyncIcon />}>
            外部GCS同期
          </Button>
        </Box>
      </Box>

      {/* メインコンテンツ */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* タブとビュー切替 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{
              minHeight: 'auto',
              '& .MuiTab-root': {
                minHeight: 'auto',
                py: 1.5,
                px: 2,
              },
            }}>
            <Tab
              icon={<FlightIcon />}
              iconPosition='start'
              label={`ドローン (${mockDrones.length})`}
            />
            <Tab
              icon={<WorkspacesIcon />}
              iconPosition='start'
              label={`ポート (${mockPorts.length})`}
            />
          </Tabs>

          <Tabs
            value={viewMode}
            onChange={(_, value) => setViewMode(value)}
            sx={{
              minHeight: 'auto',
              '& .MuiTab-root': {
                minHeight: 'auto',
                py: 1,
                px: 2,
                minWidth: 'auto',
              },
            }}>
            <Tab value='table' label='テーブル' />
            <Tab value='card' label='カード' />
          </Tabs>
        </Box>

        {/* デバイス一覧 */}
        <Box>
          {tabValue === 0 && (
            <>
              {viewMode === 'table' ? renderDroneTable() : renderDroneCards()}
            </>
          )}
          {tabValue === 1 && (
            <>{viewMode === 'table' ? renderPortTable() : renderPortCards()}</>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default DevicesPage
