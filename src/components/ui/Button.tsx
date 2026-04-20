/**
 * shadcn-inspired Button component
 * Pure Tailwind CSS + CVA — no MUI dependency
 */

import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { KAZE_META, KAZE_STAMP } from '@/themes/kazeMixins'
import { cn } from '@/utils/className'

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary-main text-white hover:bg-primary-dark',
        destructive: 'bg-error-main text-white hover:bg-error-dark',
        outline:
          'border border-gray-300 bg-transparent hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:hover:bg-slate-700 dark:hover:text-gray-100',
        secondary: 'bg-secondary-main text-white hover:bg-secondary-dark',
        ghost:
          'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-slate-700 dark:hover:text-gray-100',
        link: 'text-primary-main underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /**
   * Kaze 骨格を opt-in で適用（#38-#39 の token を参照）。
   * - border-radius: var(--kaze-r-sharp) (2px)
   * - transition: var(--kaze-dur-micro) var(--kaze-ease)
   * - font-family: var(--kaze-font-mono) + letter-spacing + uppercase
   * 既存デザインを壊さないため default は false。
   */
  kaze?: boolean
}

// Kaze opt-in 時のスタイル上書き。骨格 mixin を合成 (PR #53 領域語彙)。
// STAMP = 押印の鋭さ (radius + transition)、META = mono label (font)。
const kazeStyle: React.CSSProperties = { ...KAZE_STAMP, ...KAZE_META }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild: _asChild = false,
      kaze = false,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        style={kaze ? { ...kazeStyle, ...style } : style}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
