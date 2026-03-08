/**
 * shadcn-inspired Button component built on MUI
 * Combines MUI's robustness with pure Tailwind CSS utility-first approach
 * Note: This is NOT shadcn/ui itself, but inspired by its design patterns
 */

import {
  Button as MuiButton,
  type ButtonProps as MuiButtonProps,
} from '@mui/material'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/utils/className'

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary-main text-white hover:bg-primary-dark',
        destructive: 'bg-error-main text-white hover:bg-error-dark',
        outline:
          'border border-gray-300 bg-transparent hover:bg-gray-50 hover:text-gray-900',
        secondary: 'bg-secondary-main text-white hover:bg-secondary-dark',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
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
    Omit<MuiButtonProps, 'variant' | 'size' | 'color'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild: _asChild = false, ...props }, ref) => {
    return (
      <MuiButton
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disableRipple
        disableElevation
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
