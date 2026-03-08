// src/pages/MediaPage.tsx
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import FilterListIcon from '@mui/icons-material/FilterList'
import ImageIcon from '@mui/icons-material/Image'
import VideocamIcon from '@mui/icons-material/Videocam'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Typography,
} from '@mui/material'

// モックメディアデータ
const mockMedia = [
  {
    id: 'm1',
    name: '東京湾岸_点検_001.jpg',
    type: 'image',
    project: '東京湾岸エリア点検',
    date: '2025-11-27',
    size: '4.2MB',
  },
  {
    id: 'm2',
    name: '農地モニタリング_video.mp4',
    type: 'video',
    project: '農地モニタリング',
    date: '2025-11-26',
    size: '256MB',
  },
  {
    id: 'm3',
    name: '山間部測量_002.jpg',
    type: 'image',
    project: '山間部測量調査',
    date: '2025-11-25',
    size: '5.8MB',
  },
  {
    id: 'm4',
    name: 'インフラ点検_thermal.jpg',
    type: 'image',
    project: '都市部インフラ点検',
    date: '2025-11-24',
    size: '3.1MB',
  },
  {
    id: 'm5',
    name: '河川監視_panorama.jpg',
    type: 'image',
    project: '河川監視プロジェクト',
    date: '2025-11-23',
    size: '8.5MB',
  },
  {
    id: 'm6',
    name: '防災訓練_flight.mp4',
    type: 'video',
    project: '防災訓練2025',
    date: '2025-11-22',
    size: '512MB',
  },
  {
    id: 'm7',
    name: '東京湾岸_点検_002.jpg',
    type: 'image',
    project: '東京湾岸エリア点検',
    date: '2025-11-21',
    size: '4.8MB',
  },
  {
    id: 'm8',
    name: '農地_orthomosaic.tif',
    type: 'image',
    project: '農地モニタリング',
    date: '2025-11-20',
    size: '125MB',
  },
  {
    id: 'm9',
    name: '山間部測量_3dmodel.mp4',
    type: 'video',
    project: '山間部測量調査',
    date: '2025-11-19',
    size: '890MB',
  },
  {
    id: 'm10',
    name: 'インフラ点検_closeup.jpg',
    type: 'image',
    project: '都市部インフラ点検',
    date: '2025-11-18',
    size: '6.2MB',
  },
]

const MediaPage = () => {
  return (
    <Box>
      {/* ページヘッダー */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}>
        <Typography variant='h1'>メディア</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant='outlined' startIcon={<FilterListIcon />}>
            フィルター
          </Button>
          <Button variant='contained' startIcon={<CloudUploadIcon />}>
            アップロード
          </Button>
        </Box>
      </Box>

      {/* メディア一覧 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 2,
        }}>
        {mockMedia.map((media) => (
          <Card key={media.id} sx={{ cursor: 'pointer' }}>
            <CardMedia
              sx={{
                height: 140,
                backgroundColor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {media.type === 'image' ? (
                <ImageIcon sx={{ fontSize: 48, color: 'grey.400' }} />
              ) : (
                <VideocamIcon sx={{ fontSize: 48, color: 'grey.400' }} />
              )}
            </CardMedia>
            <CardContent>
              <Typography
                variant='body2'
                noWrap
                title={media.name}
                gutterBottom>
                {media.name}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {media.project}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 1,
                }}>
                <Chip
                  label={media.type === 'image' ? '画像' : '動画'}
                  size='small'
                  variant='outlined'
                />
                <Typography variant='caption' color='text.secondary'>
                  {media.size}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}

export default MediaPage
