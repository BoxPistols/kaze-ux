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

import { KAZE_LEAF, KAZE_PRINT, KAZE_RUN } from '@/themes/kazeMixins'
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

// LEAF = 一葉 (soft radius + macro duration)、card/panel 想定
const kazeCardStyle: React.CSSProperties = KAZE_LEAF

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

// PRINT = 活字 (Fraunces Variable 基調)、display 見出し
const kazeTitleStyle: React.CSSProperties = KAZE_PRINT

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

// RUN = 本文 (Plex Sans + 呼吸)。CardDescription 用、行高を 1.65 に締める
const kazeDescStyle: React.CSSProperties = { ...KAZE_RUN, lineHeight: 1.65 }

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
