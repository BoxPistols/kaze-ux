// Using native HTML button instead of MUI to avoid style conflicts
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/utils/className'

const customButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#0e0d6a] text-white hover:bg-[#11114a] shadow',
        secondary: 'bg-[#696881] text-white hover:bg-[#424242] shadow-sm',
        destructive: 'bg-[#da3737] text-white hover:bg-[#c63535] shadow-sm',
        outline:
          'border border-[#E0E0E0] bg-background hover:bg-accent hover:text-accent-foreground shadow-sm',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-[#0e0d6a] underline-offset-4 hover:underline',
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

export interface CustomButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof customButtonVariants> {
  children: React.ReactNode
  asChild?: boolean
}

export const CustomButton = React.forwardRef<
  HTMLButtonElement,
  CustomButtonProps
>(
  (
    { className, variant, size, asChild: _asChild = false, children, ...props },
    ref
  ) => {
    // Create a native button element instead of using MUI Button to avoid style conflicts
    const buttonClasses = cn(customButtonVariants({ variant, size, className }))

    return (
      <button className={buttonClasses} ref={ref} {...props}>
        {children}
      </button>
    )
  }
)
CustomButton.displayName = 'CustomButton'
