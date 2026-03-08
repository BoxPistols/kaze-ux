/**
 * UTM飛行エリア選択ページ
 *
 * キーワード検索と地図選択を統合した2カラムレイアウト
 * フルスクリーンモード対応
 */

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import FlightIcon from '@mui/icons-material/Flight'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import MapIcon from '@mui/icons-material/Map'
import PauseCircleIcon from '@mui/icons-material/PauseCircle'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import ScheduleIcon from '@mui/icons-material/Schedule'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import Map, { Marker, Source, Layer, Popup } from 'react-map-gl/maplibre'
import { useNavigate } from 'react-router-dom'

import 'maplibre-gl/dist/maplibre-gl.css'
import {
  LayerControlPanel,
  RestrictionMapLayers,
} from '@/components/utm/components'
import { useRestrictionLayers, useKeyboardShortcuts } from '@/lib/map/hooks'
import useUTMStore from '@/store/utmStore'
import { colors } from '@/styles/tokens'
import type { UTMProject, UTMProjectStatus } from '@/types/utmTypes'

import type { MapRef } from 'react-map-gl/maplibre'

// ステータスの表示設定
const getStatusConfig = (status: UTMProjectStatus) => {
  switch (status) {
    case 'active':
      return {
        label: '飛行中',
        color: colors.success.main,
        bgColor: alpha(colors.success.main, 0.1),
      }
    case 'scheduled':
      return {
        label: '予定',
        color: colors.info.main,
        bgColor: alpha(colors.info.main, 0.1),
      }
    case 'standby':
      return {
        label: '待機中',
        color: colors.warning.main,
        bgColor: alpha(colors.warning.main, 0.1),
      }
    case 'completed':
      return {
        label: '完了',
        color: colors.gray[500],
        bgColor: alpha(colors.gray[500], 0.1),
      }
  }
}

// ステータス変更メニューの選択肢
const statusOptions: {
  status: UTMProjectStatus
  label: string
  icon: React.ReactNode
  color: string
}[] = [
  {
    status: 'active',
    label: '飛行開始',
    icon: <PlayCircleIcon fontSize='small' />,
    color: colors.success.main,
  },
  {
    status: 'standby',
    label: '待機',
    icon: <PauseCircleIcon fontSize='small' />,
    color: colors.warning.main,
  },
  {
    status: 'scheduled',
    label: '予定',
    icon: <ScheduleIcon fontSize='small' />,
    color: colors.info.main,
  },
  {
    status: 'completed',
    label: '完了',
    icon: <CheckCircleIcon fontSize='small' />,
    color: colors.gray[500],
  },
]

// プロジェクトリストアイテム
interface ProjectListItemProps {
  project: UTMProject
  isSelected: boolean
  isHovered: boolean
  onToggleSelect: () => void
  onHover: (id: string | null) => void
  onStatusChange: (projectId: string, status: UTMProjectStatus) => void
}

const ProjectListItem = ({
  project,
  isSelected,
  isHovered,
  onToggleSelect,
  onHover,
  onStatusChange,
}: ProjectListItemProps) => {
  const statusConfig = getStatusConfig(project.status)
  const isActive = project.status === 'active'

  // ステータス変更メニュー
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const isMenuOpen = Boolean(menuAnchor)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setMenuAnchor(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
  }

  const handleStatusChange = (status: UTMProjectStatus) => {
    onStatusChange(project.id, status)
    handleMenuClose()
  }

  return (
    <>
      <ListItem
        disablePadding
        onMouseEnter={() => onHover(project.id)}
        onMouseLeave={() => onHover(null)}
        sx={{
          bgcolor: isHovered
            ? alpha(colors.primary[500], 0.08)
            : isSelected
              ? alpha(colors.primary[500], 0.12)
              : 'transparent',
          borderLeft: isSelected
            ? `3px solid ${colors.primary[500]}`
            : '3px solid transparent',
          transition: 'all 0.2s',
        }}>
        <ListItemButton onClick={onToggleSelect} sx={{ py: 1.5, px: 2 }}>
          <Checkbox
            checked={isSelected}
            size='small'
            onClick={(e) => e.stopPropagation()}
            onChange={onToggleSelect}
            sx={{ mr: 1 }}
          />
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant='body2' fontWeight={600} noWrap>
                  {project.name}
                </Typography>
                {isActive && (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: colors.success.main,
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.4 },
                        '100%': { opacity: 1 },
                      },
                    }}
                  />
                )}
              </Box>
            }
            secondary={
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                <Typography variant='caption' color='text.secondary' noWrap>
                  {project.location}
                </Typography>
              </Box>
            }
          />
          <Tooltip title='ステータス変更'>
            <Chip
              label={statusConfig.label}
              size='small'
              onClick={handleMenuOpen}
              sx={{
                bgcolor: statusConfig.bgColor,
                color: statusConfig.color,
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 22,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: alpha(statusConfig.color, 0.2),
                },
              }}
            />
          </Tooltip>
        </ListItemButton>
      </ListItem>

      {/* ステータス変更メニュー */}
      <Menu
        anchorEl={menuAnchor}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        {statusOptions.map((option) => (
          <MenuItem
            key={option.status}
            onClick={() => handleStatusChange(option.status)}
            selected={project.status === option.status}
            sx={{ py: 1, minWidth: 140 }}>
            <ListItemIcon sx={{ color: option.color, minWidth: 32 }}>
              {option.icon}
            </ListItemIcon>
            <ListItemText
              primary={option.label}
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: project.status === option.status ? 600 : 400,
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

// メインページコンポーネント
const UTMProjectSelectPage = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const mapRef = useRef<MapRef>(null)

  // utmStoreからプロジェクト一覧とアクションを取得
  const {
    projects,
    selectedProjectIds,
    toggleProjectSelection,
    clearProjectSelection,
    updateProjectStatus,
  } = useUTMStore()

  // 状態
  const [searchQuery, setSearchQuery] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null)
  const [mapPopup, setMapPopup] = useState<{
    project: UTMProject
    lng: number
    lat: number
  } | null>(null)

  // 検索フィルタ
  const filteredProjects = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return projects
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        const statusOrder = {
          active: 0,
          standby: 1,
          scheduled: 2,
          completed: 3,
        }
        return statusOrder[a.status] - statusOrder[b.status]
      })
  }, [projects, searchQuery])

  const activeCount = projects.filter((p) => p.status === 'active').length
  const scheduledCount = projects.filter((p) => p.status === 'scheduled').length

  // レイヤーコントロール
  const {
    visibility: restrictionVisibility,
    toggleLayer: toggleRestrictionLayer,
    toggleAllLayers: toggleAllRestrictionLayers,
    geoJsonData: restrictionGeoJsonData,
  } = useRestrictionLayers({
    initialVisibility: {
      noFlyZones: true,
      airports: true,
      heliports: false,
    },
  })

  // キーボードショートカット
  useKeyboardShortcuts({
    onToggleLayer: toggleRestrictionLayer,
    onToggleAllLayers: toggleAllRestrictionLayers,
    enabled: true,
  })

  // 座標データの有効性をチェックするヘルパー（3次元配列対応）
  const hasValidCoordinates = useCallback(
    (coords: number[][][] | undefined) => {
      if (!coords || coords.length === 0) return false
      const ring = coords[0] // 外部リング
      if (!ring || ring.length === 0) return false
      return ring.every(
        (c) =>
          Array.isArray(c) &&
          c.length >= 2 &&
          typeof c[0] === 'number' &&
          typeof c[1] === 'number' &&
          !isNaN(c[0]) &&
          !isNaN(c[1])
      )
    },
    []
  )

  // 地図のポリゴンデータを生成
  const polygonGeoJSON = useMemo(() => {
    const features = filteredProjects
      .filter((p) => hasValidCoordinates(p.flightArea?.coordinates))
      .map((p) => ({
        type: 'Feature' as const,
        properties: {
          id: p.id,
          name: p.name,
          status: p.status,
          isSelected: selectedProjectIds.includes(p.id),
          isHovered: hoveredProjectId === p.id,
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: p.flightArea?.coordinates ?? [],
        },
      }))

    return {
      type: 'FeatureCollection' as const,
      features,
    }
  }, [
    filteredProjects,
    selectedProjectIds,
    hoveredProjectId,
    hasValidCoordinates,
  ])

  // プロジェクトの中心座標を取得（centerCoordinatesを優先使用）
  const getProjectCenter = useCallback((project: UTMProject) => {
    // centerCoordinatesが定義されていればそれを使用
    if (project.centerCoordinates && project.centerCoordinates.length >= 2) {
      const [lng, lat] = project.centerCoordinates
      if (!isNaN(lng) && !isNaN(lat)) {
        return { lng, lat }
      }
    }
    // フォールバック: flightAreaから計算
    if (!project.flightArea?.coordinates?.length) return null
    const ring = project.flightArea.coordinates[0]
    if (!ring || ring.length === 0) return null
    const validCoords = ring.filter(
      (c: number[]) =>
        Array.isArray(c) &&
        c.length >= 2 &&
        typeof c[0] === 'number' &&
        typeof c[1] === 'number' &&
        !isNaN(c[0]) &&
        !isNaN(c[1])
    )
    if (validCoords.length === 0) return null
    const lng =
      validCoords.reduce((sum: number, c: number[]) => sum + c[0], 0) /
      validCoords.length
    const lat =
      validCoords.reduce((sum: number, c: number[]) => sum + c[1], 0) /
      validCoords.length
    if (isNaN(lng) || isNaN(lat)) return null
    return { lng, lat }
  }, [])

  // ホバー時に地図をパン
  useEffect(() => {
    if (hoveredProjectId && mapRef.current) {
      const project = projects.find((p) => p.id === hoveredProjectId)
      if (project) {
        const center = getProjectCenter(project)
        if (center) {
          mapRef.current.flyTo({
            center: [center.lng, center.lat],
            duration: 500,
          })
        }
      }
    }
  }, [hoveredProjectId, projects, getProjectCenter])

  // 地図クリックでポリゴン選択
  const handleMapClick = useCallback(
    (event: { features?: Array<{ properties?: { id?: string } }> }) => {
      const feature = event.features?.[0]
      if (feature?.properties?.id) {
        toggleProjectSelection(feature.properties.id)
      }
    },
    [toggleProjectSelection]
  )

  // 選択したプロジェクトで監視を開始
  const handleStartMonitoring = () => {
    if (selectedProjectIds.length === 0) return
    if (selectedProjectIds.length === 1) {
      navigate(`/utm/dashboard?projectId=${selectedProjectIds[0]}`)
    } else {
      navigate(`/utm/dashboard?projectIds=${selectedProjectIds.join(',')}`)
    }
  }

  // フルスクリーン切り替え
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <Box
      sx={{
        height: isFullscreen ? '100vh' : 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 1300 : 'auto',
        bgcolor: theme.palette.background.default,
      }}>
      {/* ヘッダー */}
      <Paper
        elevation={0}
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[400]})`,
            }}>
            <MapIcon sx={{ fontSize: 22, color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant='h6' fontWeight={600}>
              [WIP]飛行エリア選択
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              飛行中: {activeCount} / 予定: {scheduledCount}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {selectedProjectIds.length > 0 && (
            <>
              <Chip
                label={`${selectedProjectIds.length}件選択中`}
                size='small'
                onDelete={clearProjectSelection}
                color='primary'
                variant='outlined'
              />
              <Button
                variant='contained'
                size='small'
                startIcon={<VisibilityIcon />}
                onClick={handleStartMonitoring}>
                監視を開始
              </Button>
            </>
          )}
          <Tooltip title={isFullscreen ? '通常表示' : 'フルスクリーン'}>
            <IconButton onClick={toggleFullscreen}>
              {isFullscreen ? <CloseFullscreenIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* メインコンテンツ: 2カラム */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左カラム: 検索 + リスト */}
        <Paper
          elevation={0}
          sx={{
            width: 360,
            minWidth: 360,
            borderRight: `1px solid ${theme.palette.divider}`,
            borderRadius: 0,
            display: 'flex',
            flexDirection: 'column',
          }}>
          {/* 検索ボックス */}
          <Box
            sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <TextField
              fullWidth
              size='small'
              placeholder='キーワード検索（名前、場所）'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? alpha(colors.gray[800], 0.5)
                      : alpha(colors.gray[100], 0.5),
                },
              }}
            />
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ mt: 1, display: 'block' }}>
              {filteredProjects.length}件のプロジェクト
            </Typography>
          </Box>

          {/* プロジェクトリスト */}
          <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
            {filteredProjects.map((project) => (
              <ProjectListItem
                key={project.id}
                project={project}
                isSelected={selectedProjectIds.includes(project.id)}
                isHovered={hoveredProjectId === project.id}
                onToggleSelect={() => toggleProjectSelection(project.id)}
                onHover={setHoveredProjectId}
                onStatusChange={updateProjectStatus}
              />
            ))}
            {filteredProjects.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant='body2' color='text.secondary'>
                  該当するプロジェクトがありません
                </Typography>
              </Box>
            )}
          </List>
        </Paper>

        {/* 右カラム: 地図 + ドローン一覧 */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
          {/* 地図エリア */}
          <Box sx={{ flex: 1, position: 'relative', minHeight: 0 }}>
            <Map
              ref={mapRef}
              initialViewState={{
                longitude: 139.7,
                latitude: 35.68,
                zoom: 9,
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle='https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
              interactiveLayerIds={['project-polygons-fill']}
              onClick={handleMapClick}>
              {/* 制限区域レイヤー（飛行エリアより下に表示） */}
              {restrictionVisibility && restrictionGeoJsonData && (
                <RestrictionMapLayers
                  visibility={restrictionVisibility}
                  geoJsonData={restrictionGeoJsonData}
                />
              )}

              {/* 飛行エリアポリゴン */}
              <Source
                id='project-polygons'
                type='geojson'
                data={polygonGeoJSON}>
                {/* 塗りつぶし */}
                <Layer
                  id='project-polygons-fill'
                  type='fill'
                  paint={{
                    'fill-color': [
                      'case',
                      ['get', 'isSelected'],
                      colors.primary[500],
                      ['get', 'isHovered'],
                      colors.primary[400],
                      ['==', ['get', 'status'], 'active'],
                      colors.success.main,
                      colors.gray[500],
                    ],
                    'fill-opacity': [
                      'case',
                      ['get', 'isSelected'],
                      0.4,
                      ['get', 'isHovered'],
                      0.3,
                      0.2,
                    ],
                  }}
                />
                {/* 境界線 */}
                <Layer
                  id='project-polygons-line'
                  type='line'
                  paint={{
                    'line-color': [
                      'case',
                      ['get', 'isSelected'],
                      colors.primary[500],
                      ['get', 'isHovered'],
                      colors.primary[400],
                      ['==', ['get', 'status'], 'active'],
                      colors.success.main,
                      colors.gray[400],
                    ],
                    'line-width': [
                      'case',
                      ['get', 'isSelected'],
                      3,
                      ['get', 'isHovered'],
                      2,
                      1,
                    ],
                  }}
                />
              </Source>

              {/* プロジェクトマーカー */}
              {filteredProjects.map((project) => {
                const center = getProjectCenter(project)
                if (!center) return null
                const isSelected = selectedProjectIds.includes(project.id)
                const isHovered = hoveredProjectId === project.id
                const statusConfig = getStatusConfig(project.status)

                return (
                  <Marker
                    key={project.id}
                    longitude={center.lng}
                    latitude={center.lat}
                    anchor='center'
                    onClick={(e) => {
                      e.originalEvent.stopPropagation()
                      setMapPopup({ project, lng: center.lng, lat: center.lat })
                    }}>
                    <Tooltip title={project.name} placement='top'>
                      <Box
                        sx={{
                          width: isSelected || isHovered ? 32 : 24,
                          height: isSelected || isHovered ? 32 : 24,
                          borderRadius: '50%',
                          bgcolor: isSelected
                            ? colors.primary[500]
                            : isHovered
                              ? colors.primary[400]
                              : statusConfig.color,
                          border: `2px solid ${theme.palette.background.paper}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: theme.shadows[4],
                        }}>
                        <FlightIcon
                          sx={{
                            fontSize: isSelected || isHovered ? 18 : 14,
                            color: '#fff',
                          }}
                        />
                      </Box>
                    </Tooltip>
                  </Marker>
                )
              })}

              {/* ポップアップ */}
              {mapPopup && (
                <Popup
                  longitude={mapPopup.lng}
                  latitude={mapPopup.lat}
                  anchor='bottom'
                  onClose={() => setMapPopup(null)}
                  closeButton={true}
                  closeOnClick={false}>
                  <Box sx={{ p: 1, minWidth: 200 }}>
                    <Typography variant='subtitle2' fontWeight={600}>
                      {mapPopup.project.name}
                    </Typography>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: 'block', mb: 1 }}>
                      {mapPopup.project.location}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={getStatusConfig(mapPopup.project.status).label}
                        size='small'
                        sx={{
                          bgcolor: getStatusConfig(mapPopup.project.status)
                            .bgColor,
                          color: getStatusConfig(mapPopup.project.status).color,
                          fontSize: '0.7rem',
                          height: 20,
                        }}
                      />
                      <Button
                        size='small'
                        variant='outlined'
                        onClick={() => {
                          toggleProjectSelection(mapPopup.project.id)
                          setMapPopup(null)
                        }}>
                        {selectedProjectIds.includes(mapPopup.project.id)
                          ? '選択解除'
                          : '選択'}
                      </Button>
                    </Box>
                  </Box>
                </Popup>
              )}
            </Map>

            {/* レイヤーコントロールパネル */}
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 10,
              }}>
              <LayerControlPanel
                visibility={restrictionVisibility}
                onToggleLayer={toggleRestrictionLayer}
                onToggleAllLayers={toggleAllRestrictionLayers}
                compact
                defaultExpanded={false}
              />
            </Box>

            {/* 地図操作ヒント */}
            <Paper
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                px: 2,
                py: 1,
                bgcolor: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(4px)',
              }}>
              <Typography variant='caption' color='text.secondary'>
                地図上のエリアをクリックして選択 / リストのホバーで地図を移動
              </Typography>
            </Paper>
          </Box>

          {/* ドローン一覧パネル */}
          {selectedProjectIds.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                height: '30%',
                minHeight: 180,
                borderTop: `1px solid ${theme.palette.divider}`,
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}>
              <Box
                sx={{
                  p: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  bgcolor: alpha(theme.palette.background.paper, 0.3),
                }}>
                <Typography variant='subtitle2' fontWeight={600}>
                  選択プロジェクトのドローン
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {selectedProjectIds.length}件のプロジェクトが選択されています
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  overflow: 'auto',
                  textAlign: 'center',
                }}>
                <Typography variant='caption' color='text.secondary'>
                  監視を開始するとドローン一覧が表示されます
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default UTMProjectSelectPage
