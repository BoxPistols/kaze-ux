import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  type AccordionProps,
  type AccordionSummaryProps,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { type ReactNode, useEffect, useState } from 'react'

export interface CustomAccordionProps {
  /** ハイライト表示するかどうか */
  highlight?: boolean
  /** 展開可能かどうか */
  canExpand?: boolean
  /** 選択時のコールバック */
  onSelect?: () => void
  /** サマリー部分のコンテンツ */
  summary: ReactNode
  /** 詳細部分のコンテンツ */
  details?: ReactNode
  /** 初期展開状態 */
  defaultExpanded?: boolean
}

const StyledAccordion = styled(
  (props: AccordionProps & { highlight?: boolean }) => (
    <Accordion disableGutters elevation={0} square {...props} />
  ),
  {
    shouldForwardProp: (prop) => prop !== 'highlight',
  }
)(({ theme, highlight }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  '&::before': { display: 'none' },
  backgroundColor: highlight
    ? theme.palette.mode === 'light'
      ? `${theme.palette.primary.main}08`
      : `${theme.palette.primary.main}15`
    : theme.palette.background.paper,
  transition: 'background-color 0.2s ease, border-color 0.2s ease',
  overflow: 'hidden',
  '&:hover': {
    borderColor:
      theme.palette.mode === 'light'
        ? 'rgba(0, 0, 0, 0.15)'
        : 'rgba(255, 255, 255, 0.15)',
  },
  '&.Mui-expanded': {
    margin: 0,
    marginBottom: theme.spacing(1),
  },
}))

const StyledAccordionSummary = styled((props: AccordionSummaryProps) => (
  <AccordionSummary {...props} />
))(({ theme }) => ({
  cursor: 'pointer',
  minHeight: 52,
  padding: `0 ${theme.spacing(3)}`,
  '& .MuiAccordionSummary-expandIconWrapper': {
    color:
      theme.palette.mode === 'light'
        ? theme.palette.grey[700]
        : theme.palette.grey[400],
    transition: 'transform 0.2s ease',
    '&.Mui-expanded': {
      transform: 'rotate(180deg)',
    },
  },
  '& .MuiAccordionSummary-content': {
    margin: `${theme.spacing(2)} 0`,
    alignItems: 'center',
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}))

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(3),
  paddingTop: 0,
  borderTop: `1px solid ${theme.palette.divider}`,
}))

/**
 * カスタムアコーディオンコンポーネント
 * - タイトルバー全体をクリッカブルに変更（canExpandがtrueの場合に開閉）
 * - ハイライト表示対応
 * - モダンなスタイル適用
 */
export const CustomAccordion = ({
  highlight = false,
  canExpand = true,
  onSelect,
  summary,
  details,
  defaultExpanded = false,
}: CustomAccordionProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded)

  useEffect(() => {
    if (!canExpand) setIsExpanded(false)
  }, [canExpand])

  const handleSummaryClick = () => {
    if (canExpand) {
      setIsExpanded((prev) => !prev)
    }
    onSelect?.()
  }

  const expandIcon = canExpand ? <ExpandMoreIcon /> : null

  return (
    <StyledAccordion
      highlight={highlight}
      expanded={isExpanded}
      onChange={() => {}}
      slotProps={{ transition: { unmountOnExit: true } }}>
      <StyledAccordionSummary
        expandIcon={expandIcon}
        onClick={handleSummaryClick}>
        {summary}
      </StyledAccordionSummary>

      {details && isExpanded && (
        <StyledAccordionDetails>{details}</StyledAccordionDetails>
      )}
    </StyledAccordion>
  )
}
