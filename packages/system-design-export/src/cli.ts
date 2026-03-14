#!/usr/bin/env node
/**
 * system-design-export CLI
 *
 * フレームワークのテーマファイルから W3C DTCG 形式の
 * デザイントークン JSON を生成する
 *
 * 使用例:
 *   npx system-design-export --from mui --input src/themes/theme.ts
 *   npx system-design-export --from mui --input src/themes/theme.ts -o tokens.json
 *   npx system-design-export --from mui --input src/themes/theme.ts --stdout
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

import { Command } from 'commander'

import { muiExtractor } from './extractors/mui.js'
import { tailwindExtractor } from './extractors/tailwind.js'
import { formatDTCG } from './formatter.js'

import type { Extractor } from './types.js'

const extractors: Record<string, Extractor> = {
  mui: muiExtractor,
  tailwind: tailwindExtractor,
}

const program = new Command()

program
  .name('system-design-export')
  .description(
    'Extract design tokens from framework themes and export as W3C DTCG JSON'
  )
  .version('0.1.0')
  .requiredOption(
    '--from <framework>',
    'Source framework (mui, tailwind, css-vars)'
  )
  .requiredOption('--input <path>', 'Path to theme/config file')
  .option(
    '-o, --output <path>',
    'Output file path (default: design-tokens/tokens.json)'
  )
  .option('--stdout', 'Print to stdout instead of file')
  .option('--description <text>', 'Description field in DTCG output')
  .action(async (options) => {
    const { from, input, output, stdout, description } = options

    // エクストラクター選択
    const extractor = extractors[from]
    if (!extractor) {
      const available = Object.keys(extractors).join(', ')
      console.error(`Unknown framework: "${from}". Available: ${available}`)
      process.exit(1)
    }

    try {
      // 抽出
      console.error(`Extracting tokens from ${from}: ${input}`)
      const tokens = await extractor.extract(input)

      // フォーマット
      const dtcg = formatDTCG(tokens, description)
      const json = JSON.stringify(dtcg, null, 2)

      // 出力
      if (stdout) {
        process.stdout.write(json + '\n')
      } else {
        const outputPath = resolve(
          process.cwd(),
          output ?? 'design-tokens/tokens.json'
        )
        mkdirSync(dirname(outputPath), { recursive: true })
        writeFileSync(outputPath, json, 'utf-8')
        console.error(`Tokens exported to: ${outputPath}`)

        // サマリー
        const colorLight = tokens.color?.light
        const colorCount = colorLight
          ? Object.keys(colorLight).reduce(
              (acc, group) => acc + Object.keys(colorLight[group]).length,
              0
            )
          : 0
        const typoCount = tokens.typography
          ? Object.keys(tokens.typography.sizes).length
          : 0
        const spacingCount = tokens.spacing
          ? Object.keys(tokens.spacing.values).length
          : 0

        console.error(`  Colors: ${colorCount} (light + dark)`)
        console.error(`  Typography: ${typoCount} sizes`)
        console.error(`  Spacing: ${spacingCount} values`)
        if (tokens.borderRadius) {
          console.error(
            `  Border radius: ${Object.keys(tokens.borderRadius).length}`
          )
        }
        if (tokens.shadows) {
          console.error(`  Shadows: ${tokens.shadows.length}`)
        }
        if (tokens.breakpoints) {
          console.error(
            `  Breakpoints: ${Object.keys(tokens.breakpoints).length}`
          )
        }
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : error}`)
      process.exit(1)
    }
  })

program.parse()
