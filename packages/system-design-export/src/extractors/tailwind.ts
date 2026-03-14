/**
 * Tailwind エクストラクター
 *
 * Tailwind設定ファイルを動的インポートし、
 * theme.extend から デザイントークンを抽出する
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import type { Extractor, ExtractedTokens } from '../types.js'

// Tailwind 設定の型（最小定義）
interface TailwindConfig {
  darkMode?: string | string[]
  theme?: {
    extend?: TailwindThemeSection
    colors?: Record<string, unknown>
    fontFamily?: Record<string, string[]>
    fontSize?: Record<string, string | [string, Record<string, string>]>
    spacing?: Record<string, string>
    borderRadius?: Record<string, string>
    boxShadow?: Record<string, string>
    screens?: Record<string, string>
  }
}

interface TailwindThemeSection {
  colors?: Record<string, unknown>
  fontFamily?: Record<string, string[]>
  fontSize?: Record<string, string | [string, Record<string, string>]>
  spacing?: Record<string, string>
  borderRadius?: Record<string, string>
  boxShadow?: Record<string, string>
  screens?: Record<string, string>
}

/**
 * カラーオブジェクトをフラット化
 * Tailwind: { primary: { DEFAULT: '#xxx', light: '#yyy' } }
 * → { primary: { main: '#xxx', light: '#yyy' } }
 */
export const flattenColors = (
  colors: Record<string, unknown>
): Record<string, Record<string, string>> => {
  const result: Record<string, Record<string, string>> = {}

  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === 'string') {
      // トップレベル文字列（foreground, ring 等）
      if (!result.base) result.base = {}
      result.base[key] = value
    } else if (typeof value === 'object' && value !== null) {
      const group: Record<string, string> = {}
      for (const [subKey, subVal] of Object.entries(
        value as Record<string, unknown>
      )) {
        if (typeof subVal === 'string') {
          // DEFAULT → main にリネーム
          group[subKey === 'DEFAULT' ? 'main' : subKey] = subVal
        }
      }
      if (Object.keys(group).length > 0) {
        result[key] = group
      }
    }
  }

  return result
}

/**
 * px文字列から数値を抽出
 */
export const parsePxValue = (val: string): number | undefined => {
  const match = val.match(/^(\d+(?:\.\d+)?)px$/)
  return match ? parseFloat(match[1]) : undefined
}

/**
 * Tailwind設定ファイルからトークンを抽出
 */
const extractFromTailwind: Extractor['extract'] = async (inputPath: string) => {
  const absPath = resolve(process.cwd(), inputPath)
  if (!existsSync(absPath)) {
    throw new Error(`File not found: ${absPath}`)
  }

  const fileUrl = pathToFileURL(absPath).href
  const mod = await import(fileUrl)
  const config = (mod.default ?? mod) as TailwindConfig
  const extend = config.theme?.extend ?? {}
  const base = config.theme ?? {}

  const tokens: ExtractedTokens = {}

  // --- カラー ---
  const colors = extend.colors ?? base.colors
  if (colors) {
    const flattened = flattenColors(colors as Record<string, unknown>)
    // Tailwind は config レベルでは light/dark 区別がないため同一値
    tokens.color = { light: flattened, dark: flattened }
  }

  // --- タイポグラフィ ---
  const fontFamily = extend.fontFamily ?? base.fontFamily
  const fontSize = extend.fontSize ?? base.fontSize
  if (fontFamily || fontSize) {
    const family = fontFamily?.sans
      ? fontFamily.sans.filter((f) => typeof f === 'string').join(', ')
      : 'sans-serif'

    const sizes: Record<string, { px: number; rem: string }> = {}
    if (fontSize) {
      for (const [name, val] of Object.entries(fontSize)) {
        const sizeStr = Array.isArray(val) ? val[0] : val
        if (typeof sizeStr !== 'string') continue

        if (sizeStr.endsWith('rem')) {
          const remVal = parseFloat(sizeStr)
          const pxVal = Math.round(remVal * 16)
          sizes[name] = { px: pxVal, rem: sizeStr }
        } else if (sizeStr.endsWith('px')) {
          const pxVal = parseFloat(sizeStr)
          sizes[name] = { px: pxVal, rem: `${(pxVal / 16).toFixed(2)}rem` }
        }
      }
    }

    tokens.typography = {
      fontFamily: family,
      baseFontSize: 16,
      sizes,
      weights: { light: 300, regular: 400, medium: 500, bold: 700 },
    }
  }

  // --- スペーシング ---
  const spacing = extend.spacing ?? base.spacing
  if (spacing) {
    const values: Record<string, number> = {}
    for (const [key, val] of Object.entries(spacing)) {
      if (typeof val === 'string') {
        const px = parsePxValue(val)
        if (px != null) values[key] = px
      }
    }
    if (Object.keys(values).length > 0) {
      tokens.spacing = { base: 4, values }
    }
  }

  // --- ボーダーラジウス ---
  const borderRadius = extend.borderRadius ?? base.borderRadius
  if (borderRadius) {
    const result: Record<string, number | string> = {}
    for (const [key, val] of Object.entries(borderRadius)) {
      if (typeof val === 'string') {
        const px = parsePxValue(val)
        result[key] = px != null ? px : val
      }
    }
    if (Object.keys(result).length > 0) {
      tokens.borderRadius = result
    }
  }

  // --- シャドウ ---
  const boxShadow = extend.boxShadow ?? base.boxShadow
  if (boxShadow) {
    tokens.shadows = Object.values(boxShadow)
  }

  // --- ブレークポイント ---
  const screens = extend.screens ?? base.screens
  if (screens) {
    const result: Record<string, number> = {}
    for (const [key, val] of Object.entries(screens)) {
      if (typeof val === 'string') {
        const px = parsePxValue(val)
        if (px != null) result[key] = px
      }
    }
    if (Object.keys(result).length > 0) {
      tokens.breakpoints = result
    }
  }

  return tokens
}

export const tailwindExtractor: Extractor = {
  name: 'tailwind',
  extract: extractFromTailwind,
}
