// src/components/ui/icon/fixedCameraIcon.tsx
// sdpf-frontend-nextに準拠した固定カメラアイコンコンポーネント
import SvgIcon from '@mui/material/SvgIcon'

import type { CustomIconProps } from './types'

/**
 * 固定カメラSVGアイコンコンポーネント
 *
 * プロジェクト独自の固定カメラアイコンです。
 * MUI SvgIconでラップすることで、ダークモード対応を含む
 * MUIアイコンと同等の機能を提供します。
 */
export const FixedCameraIcon = ({
  variant = 'filled',
  ...props
}: CustomIconProps) => (
  <SvgIcon {...props} data-testid='FixedCameraIcon' viewBox='0 0 24 24'>
    <g clipPath='url(#clip0_20219_20432)'>
      <g clipPath='url(#clip1_20219_20432)'>
        <path
          d='M18.585 11.5755L19.5397 8.91494C19.6897 8.49685 19.4441 8.02258 18.9939 7.86101L9.1702 4.33576C8.71995 4.17419 8.22881 4.38407 8.07878 4.80216L5.35091 12.4038C5.20088 12.8219 5.44651 13.2962 5.89676 13.4577L15.7204 16.983C16.1707 17.1445 16.6618 16.9347 16.8118 16.5166L17.7666 13.856L19.0166 16.2695C19.3605 16.9335 20.3674 16.9087 20.6101 16.2321L22.2932 11.5419C22.536 10.8654 21.7746 10.206 21.0871 10.4999L18.585 11.5755Z'
          fill={variant === 'filled' ? 'currentColor' : 'none'}
          stroke={variant === 'outlined' ? 'currentColor' : 'none'}
          strokeWidth={variant === 'outlined' ? '1' : '0'}
        />
      </g>
      <path
        d='M2 10.7627H5.35476V20.827H2V10.7627Z'
        fill={variant === 'filled' ? 'currentColor' : 'none'}
        stroke={variant === 'outlined' ? 'currentColor' : 'none'}
        strokeWidth={variant === 'outlined' ? '1' : '0'}
      />
      <path
        d='M4.23828 15.2356L6.71845 12.472C7.03613 12.118 7.54298 12.0037 7.98184 12.1871L12.0661 13.8937'
        stroke='currentColor'
        strokeWidth='1.3419'
        strokeLinecap='round'
        fill='none'
      />
    </g>
    <defs>
      <clipPath id='clip0_20219_20432'>
        <rect width='24' height='24' fill='white' />
      </clipPath>
      <clipPath id='clip1_20219_20432'>
        <rect
          width='17.8921'
          height='17.8921'
          fill='white'
          transform='translate(9.16016 -0.419922) rotate(19.7406)'
        />
      </clipPath>
    </defs>
  </SvgIcon>
)

export default FixedCameraIcon
