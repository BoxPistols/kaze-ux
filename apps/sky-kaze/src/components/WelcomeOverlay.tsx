/**
 * 初回ロード時のガイダンスオーバーレイ
 * 一度でも再生したら永久に非表示（一時停止で再表示しない）
 */
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { Box, Typography } from '@mui/material'
import { useEffect, useRef } from 'react'

import { useSimulation } from '~/data/simulation'

export const WelcomeOverlay = () => {
  const isPlaying = useSimulation((s) => s.isPlaying)
  const hasPlayedRef = useRef(false)

  useEffect(() => {
    if (isPlaying) hasPlayedRef.current = true
  }, [isPlaying])

  // 一度でも再生したら二度と表示しない
  if (hasPlayedRef.current || isPlaying) return null

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 25,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 3,
          py: 1.5,
          borderRadius: 3,
          backdropFilter: 'blur(12px)',
          bgcolor: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.6s ease',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(8px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}>
        <PlayArrowIcon
          sx={{ color: '#22C55E', fontSize: 22 }}
          aria-hidden='true'
        />
        <Typography
          sx={{
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.01em',
          }}>
          再生ボタンを押すとシミュレーション開始
        </Typography>
      </Box>
    </Box>
  )
}
