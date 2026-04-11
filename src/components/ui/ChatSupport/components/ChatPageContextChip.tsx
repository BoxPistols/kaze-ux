// ページ解説トリガー（スティッキーチップ）
// storyGuide が存在する時だけ表示し、クリックでページ解説をチャットに展開する

import { Box, Chip, useTheme } from '@mui/material'
import { Info } from 'lucide-react'

import type { CurrentStoryContext } from '../chatSupportTypes'
import type { StoryGuideEntry } from '../storyGuideMap'

interface ChatPageContextChipProps {
  storyGuide: StoryGuideEntry | null
  currentStory: CurrentStoryContext | null | undefined
  onExplain: () => void
}

export const ChatPageContextChip = ({
  storyGuide,
  currentStory,
  onExplain,
}: ChatPageContextChipProps) => {
  const theme = useTheme()

  if (!storyGuide || !currentStory) return null

  return (
    <Box
      sx={{
        px: 1.5,
        py: 0.75,
        bgcolor:
          theme.palette.mode === 'dark'
            ? 'rgba(14,173,184,0.3)'
            : 'rgba(63,81,181,0.08)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 1,
      }}>
      <Chip
        icon={<Info size={14} />}
        label={`${currentStory.title} の解説を見る`}
        size='small'
        variant='outlined'
        onClick={onExplain}
        sx={{
          height: 28,
          fontSize: '0.75rem',
          cursor: 'pointer',
          borderColor:
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.2)'
              : 'primary.light',
          color:
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.9)'
              : 'primary.main',
          '& .MuiChip-icon': { color: 'inherit' },
          '&:hover': {
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(63,81,181,0.12)',
          },
        }}
      />
    </Box>
  )
}
