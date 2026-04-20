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

// Card 配下の subcomponent (Title/Description/etc) が kaze mode を
// 明示 prop なしで参照できるようにする context。<Card kaze> だけ
// で子要素全部が骨格タイポに切り替わる。
const KazeContext = React.createContext(false)

export interface CardProps extends PaperProps {
  /**
   * Kaze 骨格を opt-in で適用（token は #38-#39 参照）。
   * - border-radius: var(--kaze-r-soft) (8px, card に適切)
   * - transition: var(--kaze-dur-macro) var(--kaze-ease)
   * - 配下の CardTitle / CardDescription も自動で Fraunces / Plex に切替
   */
  kaze?: boolean
}

const kazeCardStyle: React.CSSProperties = {
  borderRadius: 'var(--kaze-r-soft)',
  transitionProperty: 'border-color, box-shadow, transform',
  transitionDuration: 'var(--kaze-dur-macro)',
  transitionTimingFunction: 'var(--kaze-ease)',
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, kaze = false, style, ...props }, ref) => (
    <KazeContext.Provider value={kaze}>
      <Paper
        ref={ref}
        className={cn(
          'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
          className
        )}
        style={kaze ? { ...kazeCardStyle, ...style } : style}
        elevation={0}
        {...props}
      />
    </KazeContext.Provider>
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6 pb-0', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const kazeTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--kaze-font-display)',
  fontWeight: 380,
  letterSpacing: '-0.02em',
  fontVariationSettings: "'opsz' 144, 'wght' 380, 'SOFT' 30, 'WONK' 0",
}

const CardTitle = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, variant = 'h3', style, ...props }, ref) => {
    const kaze = React.useContext(KazeContext)
    return (
      <Typography
        ref={ref}
        variant={variant}
        className={cn(
          'text-2xl font-semibold leading-none tracking-tight',
          className
        )}
        style={kaze ? { ...kazeTitleStyle, ...style } : style}
        {...props}
      />
    )
  }
)
CardTitle.displayName = 'CardTitle'

const kazeDescStyle: React.CSSProperties = {
  fontFamily: 'var(--kaze-font-body)',
  letterSpacing: '0.01em',
  lineHeight: 1.65,
}

const CardDescription = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, variant = 'body2', style, ...props }, ref) => {
    const kaze = React.useContext(KazeContext)
    return (
      <Typography
        ref={ref}
        variant={variant}
        className={cn('text-sm text-muted-foreground', className)}
        style={kaze ? { ...kazeDescStyle, ...style } : style}
        {...props}
      />
    )
  }
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
