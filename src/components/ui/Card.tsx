/**
 * shadcn-inspired Card component built on MUI
 * Provides semantic card structure with pure Tailwind CSS styling
 * Note: This is NOT shadcn/ui itself, but inspired by its component patterns
 */

import {
  Paper,
  type PaperProps,
  Typography,
  type TypographyProps,
} from '@mui/material'
import * as React from 'react'

import { cn } from '@/utils/className'

const Card = React.forwardRef<HTMLDivElement, PaperProps>(
  ({ className, ...props }, ref) => (
    <Paper
      ref={ref}
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
      elevation={0}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, variant = 'h3', ...props }, ref) => (
    <Typography
      ref={ref}
      variant={variant}
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, variant = 'body2', ...props }, ref) => (
    <Typography
      ref={ref}
      variant={variant}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
