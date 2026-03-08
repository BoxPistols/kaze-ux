// src/components/ui/tooltip/customTooltip.tsx
// sdpf-frontend-nextに準拠したカスタムTooltipコンポーネント
import { styled } from '@mui/material/styles'
import MuiTooltip, {
  type TooltipProps,
  tooltipClasses,
} from '@mui/material/Tooltip'

import { colorData } from '@/themes/colorToken'

export const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <MuiTooltip {...props} arrow classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.arrow}`]: {
    color: colorData.grey[700],
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: colorData.grey[700],
    color: 'white',
    padding: '8px',
  },
})

export default CustomTooltip
