/**
 * ExtractedTokens → W3C DTCG JSON フォーマッター
 */

import type {
  DTCGDocument,
  ExtractedTokens,
  TokenGroup,
  TokenValue,
} from './types.js'

const colorToken = (value: string, description?: string): TokenValue => ({
  $value: value,
  $type: 'color',
  ...(description ? { $description: description } : {}),
})

const dimensionToken = (
  value: string | number,
  description?: string
): TokenValue => ({
  $value: typeof value === 'number' ? `${value}px` : value,
  $type: 'dimension',
  ...(description ? { $description: description } : {}),
})

const buildColorTokens = (
  colors: Record<string, Record<string, string>>
): TokenGroup => {
  const result: TokenGroup = {}
  for (const [group, values] of Object.entries(colors)) {
    if (typeof values === 'string') {
      result[group] = colorToken(values)
    } else {
      const groupTokens: TokenGroup = {}
      for (const [key, val] of Object.entries(values)) {
        groupTokens[key] = colorToken(val)
      }
      result[group] = groupTokens
    }
  }
  return result
}

const buildTypographyTokens = (
  typo: NonNullable<ExtractedTokens['typography']>
): TokenGroup => {
  const sizes: TokenGroup = {}
  for (const [name, data] of Object.entries(typo.sizes)) {
    sizes[name] = dimensionToken(`${data.px}px`, data.rem)
  }

  const weights: TokenGroup = {}
  for (const [name, val] of Object.entries(typo.weights)) {
    weights[name] = { $value: val, $type: 'fontWeight' }
  }

  return {
    fontFamily: { $value: typo.fontFamily, $type: 'fontFamily' },
    fontSize: sizes,
    fontWeight: weights,
    baseFontSize: dimensionToken(
      `${typo.baseFontSize}px`,
      `1rem = ${typo.baseFontSize}px`
    ),
  }
}

const buildSpacingTokens = (
  spacing: NonNullable<ExtractedTokens['spacing']>
): TokenGroup => {
  const result: TokenGroup = {}
  for (const [key, px] of Object.entries(spacing.values)) {
    result[key] = dimensionToken(`${px}px`, `spacing(${key})`)
  }
  return result
}

const buildBorderRadiusTokens = (
  radii: NonNullable<ExtractedTokens['borderRadius']>
): TokenGroup => {
  const result: TokenGroup = {}
  for (const [key, val] of Object.entries(radii)) {
    result[key] = dimensionToken(typeof val === 'number' ? `${val}px` : val)
  }
  return result
}

const buildShadowTokens = (shadows: string[]): TokenGroup => {
  const result: TokenGroup = {}
  const names = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']
  for (let i = 0; i < Math.min(shadows.length, names.length); i++) {
    result[names[i]] = { $value: shadows[i], $type: 'shadow' }
  }
  return result
}

const buildBreakpointTokens = (
  breakpoints: NonNullable<ExtractedTokens['breakpoints']>
): TokenGroup => {
  const result: TokenGroup = {}
  for (const [name, val] of Object.entries(breakpoints)) {
    result[name] = dimensionToken(`${val}px`)
  }
  return result
}

/**
 * ExtractedTokens → DTCG JSON
 */
export const formatDTCG = (
  tokens: ExtractedTokens,
  description?: string
): DTCGDocument => {
  const doc: DTCGDocument = {
    $schema: 'https://design-tokens.github.io/community-group/format/',
    $description: description ?? 'Design Tokens (W3C DTCG format)',
  }

  if (tokens.color) {
    doc.color = {
      light: buildColorTokens(tokens.color.light),
      dark: buildColorTokens(tokens.color.dark),
    }
  }

  if (tokens.typography) {
    doc.typography = buildTypographyTokens(tokens.typography)
  }

  if (tokens.spacing) {
    doc.spacing = buildSpacingTokens(tokens.spacing)
  }

  if (tokens.borderRadius) {
    doc.borderRadius = buildBorderRadiusTokens(tokens.borderRadius)
  }

  if (tokens.shadows) {
    doc.shadow = buildShadowTokens(tokens.shadows)
  }

  if (tokens.breakpoints) {
    doc.breakpoint = buildBreakpointTokens(tokens.breakpoints)
  }

  return doc
}
