/**
 * MUI sx props to Tailwind className conversion utilities
 * shadcn-inspired utility functions for seamless integration using pure Tailwind CSS
 * Note: This is NOT shadcn/ui itself, but inspired by its utility-first philosophy
 */

import { type SxProps, type Theme } from '@mui/material/styles'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * shadcn-inspired className merging utility (pure Tailwind CSS)
 * Combines clsx and tailwind-merge for optimal class handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Common sx to className mappings for frequent patterns
 */
export const sxToClassName = {
  // Display & Layout
  'display: "flex"': 'flex',
  'display: "block"': 'block',
  'display: "inline"': 'inline',
  'display: "inline-block"': 'inline-block',
  'flexDirection: "column"': 'flex-col',
  'flexDirection: "row"': 'flex-row',
  'alignItems: "center"': 'items-center',
  'justifyContent: "center"': 'justify-center',
  'justifyContent: "space-between"': 'justify-between',

  // Spacing (MUI spacing system: 1 unit = 8px)
  'p: 1': 'p-2', // 8px = 0.5rem * 4 = p-2
  'p: 2': 'p-4', // 16px = 1rem * 4 = p-4
  'p: 3': 'p-6', // 24px = 1.5rem * 4 = p-6
  'm: 1': 'm-2',
  'm: 2': 'm-4',
  'm: 3': 'm-6',
  'mt: 1': 'mt-2',
  'mt: 2': 'mt-4',
  'mt: 3': 'mt-6',
  'mb: 1': 'mb-2',
  'mb: 2': 'mb-4',
  'mb: 3': 'mb-6',
  'ml: 1': 'ml-2',
  'ml: 2': 'ml-4',
  'ml: 3': 'ml-6',
  'mr: 1': 'mr-2',
  'mr: 2': 'mr-4',
  'mr: 3': 'mr-6',

  // Sizing
  'width: "100%"': 'w-full',
  'height: "100%"': 'h-full',
  'height: "100vh"': 'h-screen',
  'minWidth: 300': 'min-w-[300px]',
  'minHeight: "100vh"': 'min-h-screen',

  // Colors (using MUI theme integration)
  'color: "primary.main"': 'text-primary-main',
  'backgroundColor: "primary.main"': 'bg-primary-main',
  'color: "error.main"': 'text-error-main',
  'backgroundColor: "error.main"': 'bg-error-main',
} as const

/**
 * Enhanced Box component props that accepts both sx and className
 * Provides gradual migration path from sx to className
 */
export interface BoxProps {
  sx?: SxProps<Theme>
  className?: string
  children?: React.ReactNode
  component?: React.ElementType
}

/**
 * Convert simple sx props to Tailwind className
 * For complex sx props, returns undefined to continue using sx
 */
export function convertSxToClassName(sx: SxProps<Theme>): string | undefined {
  if (typeof sx !== 'object' || sx === null || Array.isArray(sx)) {
    return undefined
  }

  const entries = Object.entries(sx)
  const classNames: string[] = []

  for (const [key, value] of entries) {
    const sxString = `${key}: ${JSON.stringify(value)}`
    const className = sxToClassName[sxString as keyof typeof sxToClassName]

    if (className) {
      classNames.push(className)
    } else {
      // If any property can't be converted, return undefined
      return undefined
    }
  }

  return classNames.length > 0 ? classNames.join(' ') : undefined
}

/**
 * Utility variants inspired by shadcn/ui approach using pure Tailwind CSS
 */
export const variants = {
  // Button variants
  button: {
    default:
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    primary: 'bg-primary-main text-white hover:bg-primary-dark',
    secondary: 'bg-secondary-main text-white hover:bg-secondary-dark',
    outline:
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  },

  // Card variants
  card: {
    default: 'rounded-lg border bg-card text-card-foreground shadow-sm',
    elevated: 'rounded-lg border bg-card text-card-foreground shadow-lg',
  },

  // Text variants
  text: {
    h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
    h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight',
    h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
    p: 'leading-7 [&:not(:first-child)]:mt-6',
    muted: 'text-sm text-muted-foreground',
  },
} as const

export type ButtonVariant = keyof typeof variants.button
export type CardVariant = keyof typeof variants.card
export type TextVariant = keyof typeof variants.text
