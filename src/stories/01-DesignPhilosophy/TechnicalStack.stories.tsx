import { Box, Typography, Grid, Paper, Container, Divider } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Design Philosophy/Technical Stack',
  parameters: {
    layout: 'padded',
    docs: {
      page: null,
    },
  },
}

export default meta

const TechnicalStackOverview = () => {
  const theme = useTheme()

  const technicalStack = [
    {
      name: 'Material UI',
      version: 'v7.x',
      description: 'React UIライブラリ',
      features: [
        'コンポーネントライブラリ',
        'デザインシステム',
        'アクセシビリティ',
        'TypeScript対応',
      ],
      category: 'UI Framework',
    },
    {
      name: 'Tailwind CSS',
      version: 'v3.x',
      description: 'ユーティリティファーストCSSフレームワーク',
      features: [
        'ユーティリティクラス',
        'レスポンシブデザイン',
        'カスタマイズ可能',
        'パフォーマンス最適化',
      ],
      category: 'CSS Framework',
    },
    {
      name: 'React',
      version: 'v18.x',
      description: 'ユーザーインターフェース構築のためのJavaScriptライブラリ',
      features: ['コンポーネントベース', '仮想DOM', 'Hooks', 'TypeScript対応'],
      category: 'UI Library',
    },
    {
      name: 'TypeScript',
      version: 'v5.x',
      description: 'JavaScriptの型付きスーパーセット',
      features: ['型安全性', 'IDEサポート', 'リファクタリング', 'エラー検出'],
      category: 'Language',
    },
    {
      name: 'Vite',
      version: 'v5.x',
      description: '高速なフロントエンドビルドツール',
      features: ['高速ビルド', 'HMR', 'ES Modules', 'プラグインシステム'],
      category: 'Build Tool',
    },
    {
      name: 'Storybook',
      version: 'v8.x',
      description: 'UIコンポーネントの開発・テスト・ドキュメント化ツール',
      features: ['コンポーネント開発', 'ドキュメント', 'テスト', 'プレビュー'],
      category: 'Development Tool',
    },
  ]

  const selectionReasons = [
    {
      title: '開発効率',
      description:
        '成熟した技術スタックを採用することで、開発速度と品質の両立を実現します。',
      details: [
        '豊富なドキュメントとコミュニティサポート',
        '型安全性によるバグの早期発見',
        '再利用可能なコンポーネントライブラリ',
      ],
    },
    {
      title: 'パフォーマンス',
      description:
        '最適化されたビルドツールとフレームワークにより、高速なユーザー体験を提供します。',
      details: [
        '高速なビルドとホットリロード',
        '効率的なバンドルサイズ',
        '最適化されたレンダリング',
      ],
    },
    {
      title: 'アクセシビリティ',
      description:
        'WCAG 2.1 AA準拠を基準とした、すべてのユーザーが利用しやすいデザインを実現します。',
      details: [
        'キーボードナビゲーション対応',
        'スクリーンリーダー対応',
        'コントラスト比の最適化',
      ],
    },
    {
      title: '保守性',
      description:
        '型安全性とモジュラー設計により、長期的な保守性と拡張性を確保します。',
      details: [
        'TypeScriptによる型安全性',
        'コンポーネントの再利用性',
        '明確なアーキテクチャ',
      ],
    },
  ]

  return (
    <Container maxWidth='lg' sx={{ py: { xs: 6, md: 8 } }}>
      {/* ヘッダーセクション */}
      <Box sx={{ mb: 8 }}>
        <Typography
          variant='h4'
          sx={{
            mb: 2,
            fontWeight: 400,
            color: 'text.secondary',
            fontSize: { xs: '0.9rem', md: '1rem' },
          }}>
          技術スタック
        </Typography>
        <Typography
          variant='h1'
          sx={{
            mb: 3,
            fontWeight: 700,
            fontSize: { xs: '2rem', md: '2.5rem' },
          }}>
          KDDI Smart Drone Design Systemを支える技術基盤
        </Typography>
      </Box>

      {/* 技術スタックグリッド */}
      <Grid container spacing={3} sx={{ mb: 8 }}>
        {technicalStack.map((tech, index) => (
          <Grid size={{ xs: 12, md: 6 }} key={index}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                p: 3,
                bgcolor: 'action.hover',
                border: `1px solid ${theme.palette.divider}`,
              }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant='h5' sx={{ fontWeight: 600, mb: 0.5 }}>
                  {tech.name}
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 1 }}>
                  {tech.version} | {tech.category}
                </Typography>
              </Box>

              <Typography
                variant='body2'
                sx={{ mb: 2, lineHeight: 1.6, color: 'text.secondary' }}>
                {tech.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mb: 1, fontWeight: 600 }}>
                主な機能
              </Typography>
              <Box
                component='ul'
                sx={{
                  m: 0,
                  pl: 2,
                  listStyle: 'disc',
                  '& li': {
                    mb: 0.5,
                  },
                }}>
                {tech.features.map((feature, featureIndex) => (
                  <Typography
                    key={featureIndex}
                    component='li'
                    variant='body2'
                    sx={{
                      color: 'text.secondary',
                    }}>
                    {feature}
                  </Typography>
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 技術選定理由 */}
      <Box>
        <Typography
          variant='h3'
          sx={{
            mb: 4,
            fontWeight: 600,
            fontSize: { xs: '1.5rem', md: '1.75rem' },
          }}>
          技術選定の理由
        </Typography>

        <Grid container spacing={3}>
          {selectionReasons.map((reason, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  p: 3,
                  bgcolor: 'action.hover',
                  border: `1px solid ${theme.palette.divider}`,
                }}>
                <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
                  {reason.title}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{ mb: 2, lineHeight: 1.7, color: 'text.secondary' }}>
                  {reason.description}
                </Typography>
                <Box
                  component='ul'
                  sx={{
                    m: 0,
                    pl: 2,
                    listStyle: 'disc',
                    '& li': {
                      mb: 0.5,
                    },
                  }}>
                  {reason.details.map((detail, detailIndex) => (
                    <Typography
                      key={detailIndex}
                      component='li'
                      variant='body2'
                      sx={{
                        color: 'text.secondary',
                      }}>
                      {detail}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  )
}

export const Default: StoryObj = {
  name: '技術スタック概要',
  render: () => <TechnicalStackOverview />,
}
