import {
  Box,
  Button,
  Card,
  CardContent,
  Skeleton,
  Typography,
} from '@mui/material'
import { type ReactNode } from 'react'

import { ConnectionStatusChip } from '../chip'

export interface ServiceCardProps {
  /** サービス名 */
  title: string
  /** サービスの説明 */
  description?: string
  /** サービスアイコン */
  icon?: ReactNode
  /** 接続状態 */
  connected: boolean
  /** 読み込み中 */
  loading?: boolean
  /** エラー状態 */
  error?: boolean
  /** 登録ボタンクリック時のコールバック */
  onRegisterClick?: () => void
  /** 登録ボタンのラベル */
  registerButtonLabel?: string
  /** アカウントリスト表示領域 */
  children?: ReactNode
  /** カスタムヘッダー */
  headerContent?: ReactNode
}

/**
 * サービスカードコンポーネント
 * 外部サービス連携状態を表示するカード
 *
 * @example
 * ```tsx
 * <ServiceCard
 *   title="AWS S3"
 *   description="クラウドストレージサービス"
 *   icon={<StorageIcon />}
 *   connected={true}
 *   onRegisterClick={() => handleRegister()}
 * />
 * ```
 */
export const ServiceCard = ({
  title,
  description,
  icon,
  connected,
  loading = false,
  error = false,
  onRegisterClick,
  registerButtonLabel = 'システム連携する',
  children,
  headerContent,
}: ServiceCardProps) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
      {/* ヘッダー */}
      <Box
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
        {icon && (
          <Box
            sx={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              bgcolor: 'action.hover',
              color: 'text.secondary',
            }}>
            {icon}
          </Box>
        )}
        <Box sx={{ flex: 1 }}>
          <Typography variant='md' fontWeight={600} component='h3'>
            {title}
          </Typography>
          {description && (
            <Typography variant='sm' color='text.secondary' sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          )}
        </Box>
        {headerContent}
      </Box>

      {/* コンテンツ */}
      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 3,
        }}>
        {loading ? (
          <Box>
            <Skeleton
              variant='rectangular'
              width={80}
              height={24}
              sx={{ borderRadius: 1, mb: 3 }}
            />
            <Skeleton variant='text' width={120} height={20} sx={{ mb: 1 }} />
            {Array.from({ length: 2 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  mb: 1,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                }}>
                <Skeleton variant='text' width={100} height={20} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Skeleton variant='circular' width={24} height={24} />
                  <Skeleton variant='circular' width={24} height={24} />
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <ConnectionStatusChip connected={connected} />
            </Box>
            {children}
          </>
        )}

        {/* 登録ボタン */}
        {onRegisterClick && (
          <Box sx={{ mt: 3 }}>
            {loading ? (
              <Skeleton
                variant='rectangular'
                width='100%'
                height={36}
                sx={{ borderRadius: 1 }}
              />
            ) : (
              <Button
                variant='contained'
                fullWidth
                onClick={onRegisterClick}
                disabled={loading || error}>
                {registerButtonLabel}
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
