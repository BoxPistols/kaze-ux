import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Link,
  Paper,
  Skeleton,
  Slider,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  AlertTriangle,
  Battery,
  BatteryWarning,
  Bell,
  CheckCircle2,
  Heart,
  Inbox,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Signal,
  SignalZero,
  Star,
  User,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Design Philosophy/Component Design Guide',
  parameters: {
    layout: 'padded',
    docs: { page: null },
  },
}

export default meta

// ---------------------------------------------------------------------------
// 共通コンポーネント
// ---------------------------------------------------------------------------

const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        mb: 5,
        pl: 3,
        borderLeft: 4,
        borderColor: 'primary.main',
      }}>
      <Typography
        variant='h3'
        sx={{
          fontWeight: 800,
          letterSpacing: '-0.02em',
          fontSize: { xs: 24, sm: 28 },
          color: theme.palette.mode === 'dark' ? 'grey.100' : 'grey.900',
        }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ mt: 1, fontSize: 15, lineHeight: 1.8 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  )
}

const SubSection = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <Box sx={{ mb: 7 }}>
    <Typography
      variant='h5'
      sx={{
        fontWeight: 700,
        mb: 3,
        fontSize: { xs: 17, sm: 19 },
        letterSpacing: '-0.01em',
      }}>
      {title}
    </Typography>
    {children}
  </Box>
)

const InfoBox = ({
  title,
  children,
  color = 'info',
}: {
  title: string
  children: React.ReactNode
  color?: 'info' | 'warning' | 'success' | 'error'
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const colorMap = {
    info: {
      border: theme.palette.info.main,
      bg: isDark ? 'rgba(33,150,243,0.07)' : 'rgba(33,150,243,0.04)',
    },
    warning: {
      border: theme.palette.warning.main,
      bg: isDark ? 'rgba(235,129,23,0.07)' : 'rgba(235,129,23,0.04)',
    },
    success: {
      border: theme.palette.success.main,
      bg: isDark ? 'rgba(70,171,74,0.07)' : 'rgba(70,171,74,0.04)',
    },
    error: {
      border: theme.palette.error.main,
      bg: isDark ? 'rgba(218,55,55,0.07)' : 'rgba(218,55,55,0.04)',
    },
  }
  const c = colorMap[color]
  return (
    <Box
      sx={{
        pl: 3,
        pr: 3.5,
        py: 2.5,
        mb: 5,
        borderRadius: '0 8px 8px 0',
        borderLeft: `4px solid ${c.border}`,
        bgcolor: c.bg,
      }}>
      <Typography
        variant='subtitle1'
        sx={{ fontWeight: 700, mb: 0.75, fontSize: 14 }}>
        {title}
      </Typography>
      <Typography
        variant='body1'
        color='text.secondary'
        component='div'
        sx={{ fontSize: 14, lineHeight: 1.85 }}>
        {children}
      </Typography>
    </Box>
  )
}

const SimpleTable = ({
  headers,
  rows,
}: {
  headers: string[]
  rows: (string | React.ReactNode)[][]
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  return (
    <TableContainer
      component={Paper}
      variant='outlined'
      sx={{
        mb: 5,
        borderRadius: 2,
        border: 1,
        borderColor: isDark ? 'grey.800' : 'grey.200',
        overflow: 'hidden',
      }}>
      <Table size='medium'>
        <TableHead>
          <TableRow
            sx={{
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            }}>
            {headers.map((h) => (
              <TableCell
                key={h}
                sx={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  py: 1.75,
                  borderBottomWidth: 2,
                  borderColor: isDark ? 'grey.800' : 'grey.200',
                }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow
              key={i}
              sx={{
                '&:last-child td': { borderBottom: 0 },
                '&:nth-of-type(even)': {
                  bgcolor: isDark
                    ? 'rgba(255,255,255,0.015)'
                    : 'rgba(0,0,0,0.01)',
                },
              }}>
              {row.map((cell, j) => (
                <TableCell
                  key={j}
                  sx={{ py: 2, fontSize: 14, lineHeight: 1.7 }}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

/** セクションヒーロー: 各ストーリー冒頭のビジュアルバナー */
const SectionHero = ({
  title,
  subtitle,
  gradient,
}: {
  title: string
  subtitle: string
  gradient: [string, string]
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  return (
    <Box
      sx={{
        px: { xs: 4, sm: 6 },
        py: { xs: 5, sm: 6 },
        mb: 8,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        background: isDark
          ? `linear-gradient(135deg, ${gradient[0]}14 0%, ${gradient[1]}14 100%)`
          : `linear-gradient(135deg, ${gradient[0]}08 0%, ${gradient[1]}08 100%)`,
        border: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      }}>
      <Typography
        variant='h2'
        sx={{
          fontWeight: 800,
          letterSpacing: '-0.03em',
          fontSize: { xs: 26, sm: 32 },
          mb: 1.5,
          color: isDark ? 'grey.50' : 'grey.900',
        }}>
        {title}
      </Typography>
      <Typography
        variant='body1'
        sx={{
          fontSize: { xs: 15, sm: 16 },
          lineHeight: 1.8,
          color: 'text.secondary',
          maxWidth: 600,
        }}>
        {subtitle}
      </Typography>
    </Box>
  )
}

/** セクション区切り: Dividerより視覚的に呼吸のある区切り */
const SectionDivider = () => (
  <Box sx={{ my: 8 }}>
    <Divider sx={{ opacity: 0.6 }} />
  </Box>
)

// ---------------------------------------------------------------------------
// 6原則
// ---------------------------------------------------------------------------

const PrinciplesContent = () => {
  const theme = useTheme()

  const principles = [
    {
      name: '間接化',
      en: 'Indirection',
      color: 'primary' as const,
      summary: '一箇所を直せば全部直る仕組み',
      detail:
        'トークンやマスターコンポーネントを介して変更を集約する。色=#0EADB8ではなくprimary.mainで参照すれば、トークン変更だけで全UIが更新される。',
      example:
        'Figmaの色指定 → トークン名(primary.main)で指定し、カラーコード直書きを避ける',
    },
    {
      name: 'カプセル化',
      en: 'Encapsulation',
      color: 'secondary' as const,
      summary: '複雑さを隠し、シンプルなインターフェースだけを見せる',
      detail:
        'ひとつの部品にひとつの責任を持たせる。3つの分離レイヤー: (1)見た目とデータ、(2)構造とスタイル、(3)汎用とドメイン。',
      example:
        'Buttonは内部でripple/shadow/hover等を処理するが、利用者はvariant/sizeだけ指定',
    },
    {
      name: '制約',
      en: 'Constraint',
      color: 'info' as const,
      summary: '選択肢を意図的に絞り、判断の負荷を下げる',
      detail:
        '色を1680万色から10色に、余白を4の倍数に限定する。自由度を下げることで一貫性を高める。',
      example: '余白: 4px/8px/16px/24px/32px の5段階のみ。中間値を使わない。',
    },
    {
      name: '意味の符号化',
      en: 'Semantic Encoding',
      color: 'success' as const,
      summary: '見た目ではなく意味で名付ける',
      detail:
        'redではなくerror、blueではなくprimary。視覚的な正確さと同じくらい「このコンポーネントが表現する意味」を言語化する。',
      example:
        'Dialog(汎用モーダル)とAlertDialog(確認用)は見た目が似ていても意味が異なる',
    },
    {
      name: '合成',
      en: 'Composition',
      color: 'warning' as const,
      summary: '小さな部品を組み合わせて多様なUIを作る',
      detail:
        'Avatar+Text+Badge+Button。4つの部品を並べ替えるだけでUserCardにもNotificationItemにもなる。足し算ではなく掛け算。',
      example: 'Button + Icon = IconButton、Card + List = CardList',
    },
    {
      name: '慣習',
      en: 'Convention',
      color: 'error' as const,
      summary: '暗黙知を形式化し、誰でも安全に拡張できる',
      detail:
        '「警告ボタンが欲しい」→慣習があればdestructiveやwarningを追加。なければred-buttonが生まれ体系が崩れる。',
      example: 'MUI v7 Grid API、React.FC禁止、8px基準スペーシング',
    },
  ]

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      <SectionHero
        title='コンポーネント設計6原則'
        subtitle='デザイナーのためのコンポーネント設計ガイド。6つの原則を貫く共通概念: 関心の分離（Separation of Concerns）'
        gradient={['#2196f3', '#9c27b0']}
      />

      <Grid container spacing={2.5} sx={{ mb: 6 }}>
        {principles.map((p) => (
          <Grid key={p.name} size={{ xs: 12, sm: 6 }}>
            <Paper
              variant='outlined'
              sx={{ px: 3.5, py: 3.5, height: '100%', borderRadius: 2 }}>
              <Stack spacing={2}>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <Chip
                    label={p.name}
                    color={p.color}
                    size='small'
                    sx={{ fontWeight: 600 }}
                  />
                  <Typography variant='caption' color='text.secondary'>
                    {p.en}
                  </Typography>
                </Stack>
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  {p.summary}
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ lineHeight: 1.8 }}>
                  {p.detail}
                </Typography>
                <Paper
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.04)'
                        : 'rgba(0,0,0,0.02)',
                    borderRadius: 1,
                  }}>
                  <Typography variant='caption' color='text.secondary'>
                    <Box component='span' sx={{ fontWeight: 600 }}>
                      例:{' '}
                    </Box>
                    {p.example}
                  </Typography>
                </Paper>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <InfoBox title='カプセル化の3レイヤー'>
        <Stack spacing={0.5}>
          <span>
            1. <strong>見た目とデータの分離</strong>:
            コンポーネントは表示に専念、データ取得は呼び出し側
          </span>
          <span>
            2. <strong>構造とスタイルの分離</strong>: 骨組みと装飾を切り離す
          </span>
          <span>
            3. <strong>汎用とドメインの分離</strong>:
            どこでも使える部品と特定機能特化を混ぜない
          </span>
        </Stack>
      </InfoBox>

      <InfoBox title='参考文献' color='success'>
        <Link
          href='https://github.com/yasuhiro-y/component-design-guide-for-designers'
          target='_blank'
          rel='noopener'>
          デザイナーのためのコンポーネント設計ガイド（GitHub）
        </Link>
      </InfoBox>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// 経路依存性・一貫性・妥協
// ---------------------------------------------------------------------------

const PathDependencyContent = () => {
  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      <SectionHero
        title='経路依存性と設計判断'
        subtitle='初期の選択が未来を縛る。追加は容易だが削除は困難。'
        gradient={['#eb8117', '#da3737']}
      />

      <SectionHeader
        title='経路依存性'
        subtitle='初期の設計判断がその後の選択肢を制約し、後戻りを難しくする現象'
      />
      <Stack spacing={3} sx={{ mb: 6 }}>
        <Paper variant='outlined' sx={{ px: 3.5, py: 3, borderRadius: 2 }}>
          <Typography variant='body2' sx={{ fontWeight: 600, mb: 1.5 }}>
            QWERTY配列の例
          </Typography>
          <Typography
            variant='body1'
            color='text.secondary'
            sx={{ lineHeight: 1.8 }}>
            技術的制約が消えた後もデファクトスタンダードであり続ける。デザインシステムでも初期の命名やディレクトリ構造の選択が時間と共に方向転換を難しくする。
          </Typography>
        </Paper>
        <InfoBox title='例' color='warning'>
          <code>primary</code>を<code>brand-blue</code>に後から変更 →
          全ファイル修正 + Figma更新 + ドキュメント修正 = 数週間の工数
        </InfoBox>
      </Stack>

      <SectionHeader title='追加と削除の非対称性' />
      <SimpleTable
        headers={['操作', '難易度', '所要時間', '影響範囲']}
        rows={[
          ['プロパティの追加', '簡単', '5分', '既存に影響なし'],
          [
            'プロパティの削除',
            '困難',
            '数週間',
            '全使用箇所に影響（破壊的変更）',
          ],
          ['名前の変更', '困難', '数週間', 'Figma + Code + ドキュメント全て'],
        ]}
      />
      <InfoBox title='鉄則'>
        最小限のAPIで始め、必要に応じて拡張する。一度追加したものは簡単には消せない。
      </InfoBox>

      <SectionDivider />

      <SectionHeader
        title='一貫性の価値'
        subtitle='一貫しているからこそ、意図的な逸脱がシグナルとして機能する'
      />
      <Grid container spacing={2.5} sx={{ mb: 5 }}>
        {[
          { title: '使いやすさ', desc: 'ユーザーの学習コストが下がる' },
          {
            title: 'ブランド信頼',
            desc: '細部まで統一されたプロダクトは規律を伝える',
          },
          { title: '再利用性', desc: '設計の一貫性が再利用の前提条件' },
        ].map((item) => (
          <Grid key={item.title} size={{ xs: 12, sm: 4 }}>
            <Paper
              variant='outlined'
              sx={{ px: 3, py: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant='body2' sx={{ fontWeight: 700, mb: 1 }}>
                {item.title}
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
                sx={{ lineHeight: 1.8 }}>
                {item.desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <SectionDivider />

      <SectionHeader
        title='意図的な妥協'
        subtitle='場当たり的な対処を設計に変える3つの習慣'
      />
      <Stack spacing={3} sx={{ mb: 6 }}>
        {[
          {
            step: '1',
            text: '「なぜ今こうするか」を一言残す（コメント、Figmaメモ）',
          },
          {
            step: '2',
            text: '後で直しやすい方向に倒す（一意な名前、厳密な型への移行容易性）',
          },
          { step: '3', text: '「今はやらない」と「やらなくていい」を区別する' },
        ].map((item) => (
          <Stack
            key={item.step}
            direction='row'
            spacing={2.5}
            alignItems='flex-start'>
            <Paper
              sx={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'warning.main',
                color: 'warning.contrastText',
                borderRadius: '50%',
                flexShrink: 0,
              }}>
              <Typography variant='body2' sx={{ fontWeight: 700 }}>
                {item.step}
              </Typography>
            </Paper>
            <Typography variant='body1' sx={{ pt: 0.75, lineHeight: 1.8 }}>
              {item.text}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <SectionDivider />

      <SectionHeader title='一般化と個別化のバランス' />
      <SimpleTable
        headers={['方向', '特徴', 'リスク']}
        rows={[
          [
            '一般化しすぎ',
            'どこでも使えるが、プロパティが膨張',
            'God Component化',
          ],
          ['個別化しすぎ', '最適だが、似た部品が乱立', '保守コスト増大'],
          [
            <strong key='b'>バランス（推奨）</strong>,
            '汎用コンポーネント + ドメイン特化',
            'Kaze UXのアプローチ',
          ],
        ]}
      />
    </Box>
  )
}

// ---------------------------------------------------------------------------
// 構築戦略・分割・命名
// ---------------------------------------------------------------------------

const StrategyContent = () => {
  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      <SectionHero
        title='構築戦略・分割・命名'
        subtitle='どう作るか、何を分けるか、どう名付けるか'
        gradient={['#46ab4a', '#1dafc2']}
      />

      {/* 構築戦略 */}
      <SectionHeader title='構築戦略' subtitle='コストと自由度のトレードオフ' />
      <SimpleTable
        headers={['戦略', '特徴', '向いているケース']}
        rows={[
          [
            <strong key='a'>汎用ライブラリ</strong>,
            'MUI, Chakra UI。すぐ開発開始、デザイン画一化リスク',
            '初期フェーズ、管理画面、スピード重視',
          ],
          [
            <strong key='b'>フルスクラッチ</strong>,
            'ゼロから自社専用。設計思想100%反映、コスト高',
            '大規模プロダクト、ブランド重視',
          ],
          [
            <strong key='c'>Headless UI</strong>,
            'Radix UI等。機能だけ借り見た目は自作',
            '独自デザイン + アクセシビリティ両立',
          ],
          [
            <strong key='d'>ハイブリッド（Kaze UX採用）</strong>,
            '汎用=MUI、ドメイン=独自',
            '多くのインハウス組織の現実解',
          ],
        ]}
      />

      <SubSection title='後発導入: 稼働中のプロダクトにシステムを入れる'>
        <Stack spacing={3} sx={{ mb: 4 }}>
          {[
            {
              step: '1',
              title: 'デザイントークンから入る',
              desc: '色・余白をトークン化。見た目を変えずにコード整理',
            },
            {
              step: '2',
              title: '新規画面から準拠',
              desc: '既存は触らず、新しい画面だけシステムを使う',
            },
            {
              step: '3',
              title: '既存画面は優先度順に移行',
              desc: '利用頻度が高い画面から段階的に',
            },
          ].map((item) => (
            <Stack
              key={item.step}
              direction='row'
              spacing={2.5}
              alignItems='flex-start'>
              <Paper
                sx={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'success.main',
                  color: 'success.contrastText',
                  borderRadius: '50%',
                  flexShrink: 0,
                }}>
                <Typography variant='body2' sx={{ fontWeight: 700 }}>
                  {item.step}
                </Typography>
              </Paper>
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>
                  {item.title}
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ lineHeight: 1.8 }}>
                  {item.desc}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </SubSection>

      <SectionDivider />

      {/* コンポーネント分割 */}
      <SectionHeader title='コンポーネント分割' subtitle='何をどう分けるか' />

      <SubSection title='コンポーネント化の判断基準'>
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {[
            { title: 'SSOT', desc: '一箇所を直せば全部直る状態にしたい場合' },
            { title: '再利用', desc: '2箇所以上で同じUIパターンが出現' },
            {
              title: 'Rule of Three',
              desc: '3回以上登場したらコンポーネント化',
            },
            { title: '独立した状態', desc: '自分だけのstate/ロジックがある' },
          ].map((item) => (
            <Grid key={item.title} size={{ xs: 12, sm: 6 }}>
              <Paper variant='outlined' sx={{ px: 3, py: 3, borderRadius: 2 }}>
                <Typography variant='body2' sx={{ fontWeight: 700, mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ lineHeight: 1.8 }}>
                  {item.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </SubSection>

      <SubSection title='分割アプローチ'>
        <SimpleTable
          headers={['アプローチ', '方法', '特徴']}
          rows={[
            [
              'Atomic Design',
              '複雑さで分ける（原子→分子→有機体）',
              'UI階層化に適、境界が曖昧になりやすい',
            ],
            [
              'Feature-Sliced',
              '目的で分ける（UI Kit→Domain→Widgets）',
              '依存の方向を一方向に保ちやすい',
            ],
            ['フラット配置', '階層なしで並べる', '小規模なうちは有効'],
          ]}
        />
      </SubSection>

      <SubSection title='汎用 vs ドメインコンポーネント'>
        <SimpleTable
          headers={['種類', '特徴', '例']}
          rows={[
            [
              <strong key='a'>汎用</strong>,
              'どのサービスでも使える。データ非依存',
              'Button, Card, Input, Alert',
            ],
            [
              <strong key='b'>ドメイン</strong>,
              '特定データ・ビジネスロジック依存',
              'ServiceCard, ZoneStatusChip, TaskStatusChip',
            ],
          ]}
        />
        <InfoBox title='早すぎる共通化の罠' color='warning'>
          見た目が似ている ≠ 目的が同じ。無理に共通化すると無関係なプロパティ（
          <code>hasLikeButton</code> と <code>isSwipeable</code>
          ）が混在し破綻する。
        </InfoBox>
      </SubSection>

      <SectionDivider />

      {/* 命名 */}
      <SectionHeader title='命名' subtitle='コンポーネントに名前をつける' />

      <SubSection title='業界の語彙から借りる'>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ mb: 3, lineHeight: 1.8 }}>
          Dialog, Popover, Tooltip
          などの名前は主要ライブラリで定着している。独自命名より既存の語彙に揃えることでコミュニケーションコストを下げる。
        </Typography>
      </SubSection>

      <SubSection title='状態やバリエーションを名前に含めない'>
        <SimpleTable
          headers={['悪い例', '良い例', '理由']}
          rows={[
            [
              <code key='a'>RedButton</code>,
              <>
                <code>Button</code> variant=&quot;danger&quot;
              </>,
              '色は状態であって名前ではない',
            ],
            [
              <code key='b'>LoadingButton</code>,
              <>
                <code>Button</code> isLoading=true
              </>,
              '状態はpropsで切り替え',
            ],
            [
              <code key='c'>SmallCard</code>,
              <>
                <code>Card</code> size=&quot;compact&quot;
              </>,
              'サイズはバリエーション',
            ],
          ]}
        />
      </SubSection>

      <SubSection title='データモデルとコンポーネント名'>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ mb: 3, lineHeight: 1.8 }}>
          ドメインコンポーネントはバックエンドのデータモデル（User, Job,
          Task）と名前を揃える。 UserCard, TaskItem
          のように対応させると、コードとデザインの語彙が一致する。
          汎用コンポーネントには特定のデータ名を含めない。
        </Typography>
      </SubSection>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// 変数・直交性
// ---------------------------------------------------------------------------

/** デモ操作パネルの共通スタイル */
const DemoPanel = ({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  return (
    <Box
      sx={{
        p: 4,
        borderRadius: 3,
        border: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
        mb: 5,
      }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'primary.main',
          mb: 3,
          textTransform: 'uppercase',
        }}>
        {label}
      </Typography>
      {children}
    </Box>
  )
}

const VariablesContent = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // --- Boolean デモ用 state ---
  const [showIcon, setShowIcon] = useState(true)
  const [isDisabled, setIsDisabled] = useState(false)
  const [showBadge, setShowBadge] = useState(true)

  // --- Enum デモ用 state ---
  const [btnSize, setBtnSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [btnVariant, setBtnVariant] = useState<
    'contained' | 'outlined' | 'text'
  >('contained')

  // --- String/Number デモ用 state ---
  const [labelText, setLabelText] = useState('送信する')
  const [badgeCount, setBadgeCount] = useState(3)

  // --- 直交性デモ用 state ---
  const [orthoSize, setOrthoSize] = useState<'small' | 'medium' | 'large'>(
    'medium'
  )
  const [orthoColor, setOrthoColor] = useState<
    'primary' | 'secondary' | 'success' | 'error'
  >('primary')

  // --- スロットデモ用 state ---
  const [slotIcon, setSlotIcon] = useState<'user' | 'mail' | 'star' | 'heart'>(
    'user'
  )
  const slotIcons = {
    user: <User size={20} />,
    mail: <Mail size={20} />,
    star: <Star size={20} />,
    heart: <Heart size={20} />,
  }

  return (
    <Box sx={{ maxWidth: 1040, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      <SectionHero
        title='変数と直交性'
        subtitle='コンポーネントの設定項目（プロパティ）にはどんな種類があるか。下のデモを実際に操作して体感してください。'
        gradient={['#9c27b0', '#2196f3']}
      />

      {/* ========== Boolean デモ ========== */}
      <SectionHeader
        title='Boolean: ON / OFF の切り替え'
        subtitle='スイッチのように、2つの状態を切り替える設定。Figmaではトグルスイッチに相当します。'
      />

      <DemoPanel label='操作してみよう'>
        <Grid container spacing={4}>
          {/* 操作パネル */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={3}>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  アイコンを表示
                </Typography>
                <Switch
                  checked={showIcon}
                  onChange={(_, v) => setShowIcon(v)}
                  color='primary'
                />
              </Stack>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  バッジを表示
                </Typography>
                <Switch
                  checked={showBadge}
                  onChange={(_, v) => setShowBadge(v)}
                  color='primary'
                />
              </Stack>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  無効化（操作不可）
                </Typography>
                <Switch
                  checked={isDisabled}
                  onChange={(_, v) => setIsDisabled(v)}
                  color='primary'
                />
              </Stack>
            </Stack>
          </Grid>

          {/* プレビュー */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box
              sx={{
                p: 4,
                borderRadius: 2,
                border: '2px dashed',
                borderColor: isDark
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.08)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 120,
              }}>
              <Button
                variant='contained'
                disabled={isDisabled}
                startIcon={showIcon ? <Bell size={18} /> : undefined}
                size='large'
                sx={{ px: 4 }}>
                {showBadge ? (
                  <Badge
                    badgeContent={3}
                    color='error'
                    sx={{ '& .MuiBadge-badge': { right: -12, top: -4 } }}>
                    通知ボタン
                  </Badge>
                ) : (
                  '通知ボタン'
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DemoPanel>

      <InfoBox title='ポイント'>
        Boolean は <strong>ON / OFF の2択</strong> だけを表現します。
        3つ以上の選択肢が将来ありえる場合は、Enum（次のセクション）を使いましょう。
      </InfoBox>

      <SectionDivider />

      {/* ========== Enum デモ ========== */}
      <SectionHeader
        title='Enum: 選択肢から選ぶ'
        subtitle='Figmaのバリアントに相当。あらかじめ決められた選択肢から選ぶ設定です。'
      />

      <DemoPanel label='操作してみよう'>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={4}>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5 }}>
                  サイズ
                </Typography>
                <ToggleButtonGroup
                  value={btnSize}
                  exclusive
                  onChange={(_, v) => v && setBtnSize(v)}
                  size='small'
                  fullWidth>
                  <ToggleButton value='small'>S</ToggleButton>
                  <ToggleButton value='medium'>M</ToggleButton>
                  <ToggleButton value='large'>L</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5 }}>
                  スタイル
                </Typography>
                <ToggleButtonGroup
                  value={btnVariant}
                  exclusive
                  onChange={(_, v) => v && setBtnVariant(v)}
                  size='small'
                  fullWidth>
                  <ToggleButton value='contained'>塗り</ToggleButton>
                  <ToggleButton value='outlined'>線</ToggleButton>
                  <ToggleButton value='text'>テキスト</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Box
              sx={{
                p: 4,
                borderRadius: 2,
                border: '2px dashed',
                borderColor: isDark
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.08)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 120,
              }}>
              <Button variant={btnVariant} size={btnSize} sx={{ px: 4 }}>
                ボタン
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DemoPanel>

      <InfoBox title='命名のコツ'>
        Enumの選択肢名は見た目ではなく<strong>意味</strong>で付けます。 例:
        &quot;Red&quot; ではなく &quot;Danger&quot;、&quot;Type1&quot; ではなく
        &quot;outlined&quot;
      </InfoBox>

      <SectionDivider />

      {/* ========== String / Number デモ ========== */}
      <SectionHeader
        title='テキストと数値'
        subtitle='自由入力のテキストや数値。エッジケース（空、長すぎ、上限超え）の設計が重要です。'
      />

      <DemoPanel label='操作してみよう'>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={4}>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5 }}>
                  ボタンのラベル（テキスト入力してみてください）
                </Typography>
                <TextField
                  value={labelText}
                  onChange={(e) => setLabelText(e.target.value)}
                  size='small'
                  fullWidth
                  placeholder='ボタンのラベルを入力'
                />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5 }}>
                  バッジの件数: {badgeCount}
                </Typography>
                <Slider
                  value={badgeCount}
                  onChange={(_, v) => setBadgeCount(v as number)}
                  min={0}
                  max={150}
                  step={1}
                  valueLabelDisplay='auto'
                />
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Box
              sx={{
                p: 4,
                borderRadius: 2,
                border: '2px dashed',
                borderColor: isDark
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.08)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 3,
                minHeight: 120,
              }}>
              <Button variant='contained' sx={{ px: 3 }}>
                {labelText || '\u00A0'}
              </Button>
              <IconButton>
                <Badge
                  badgeContent={badgeCount > 99 ? '99+' : badgeCount}
                  color='error'
                  invisible={badgeCount === 0}>
                  <Bell size={22} />
                </Badge>
              </IconButton>
            </Box>
            {(labelText === '' || badgeCount > 99) && (
              <Typography
                sx={{
                  mt: 2,
                  fontSize: 13,
                  color: 'warning.main',
                  textAlign: 'center',
                  lineHeight: 1.7,
                }}>
                {labelText === '' && 'テキストが空の場合どう見えるか？ '}
                {badgeCount > 99 &&
                  '99を超えると「99+」表記に。上限のデザインが重要です。'}
              </Typography>
            )}
          </Grid>
        </Grid>
      </DemoPanel>

      <SectionDivider />

      {/* ========== 直交性デモ ========== */}
      <SectionHeader
        title='直交性: 独立して変えられる設計'
        subtitle='あるプロパティを変えても、他のプロパティに影響しない状態が理想です。下のデモで「サイズ」と「色」を独立に操作してみてください。'
      />

      <DemoPanel label='操作してみよう - サイズを変えても色は変わらない'>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={4}>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5 }}>
                  サイズ（大きさだけが変わる）
                </Typography>
                <ToggleButtonGroup
                  value={orthoSize}
                  exclusive
                  onChange={(_, v) => v && setOrthoSize(v)}
                  size='small'
                  fullWidth>
                  <ToggleButton value='small'>S</ToggleButton>
                  <ToggleButton value='medium'>M</ToggleButton>
                  <ToggleButton value='large'>L</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5 }}>
                  色（色だけが変わる）
                </Typography>
                <ToggleButtonGroup
                  value={orthoColor}
                  exclusive
                  onChange={(_, v) => v && setOrthoColor(v)}
                  size='small'
                  fullWidth>
                  <ToggleButton value='primary'>Primary</ToggleButton>
                  <ToggleButton value='secondary'>Secondary</ToggleButton>
                  <ToggleButton value='success'>Success</ToggleButton>
                  <ToggleButton value='error'>Error</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Box
              sx={{
                p: 4,
                borderRadius: 2,
                border: '2px dashed',
                borderColor: isDark
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.08)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
                minHeight: 120,
              }}>
              <Button variant='contained' size={orthoSize} color={orthoColor}>
                ボタン
              </Button>
              <Chip
                label='ステータス'
                color={orthoColor}
                size={orthoSize === 'large' ? 'medium' : 'small'}
              />
              <Avatar
                sx={{
                  bgcolor: `${orthoColor}.main`,
                  width:
                    orthoSize === 'small'
                      ? 32
                      : orthoSize === 'medium'
                        ? 40
                        : 52,
                  height:
                    orthoSize === 'small'
                      ? 32
                      : orthoSize === 'medium'
                        ? 40
                        : 52,
                }}>
                <User
                  size={
                    orthoSize === 'small'
                      ? 16
                      : orthoSize === 'medium'
                        ? 20
                        : 26
                  }
                />
              </Avatar>
            </Box>
          </Grid>
        </Grid>
      </DemoPanel>

      <InfoBox title='直交性が保たれている状態'>
        サイズを変えても色には影響せず、色を変えてもサイズには影響しない。
        <strong>1つの設定 = 1つの役割</strong> が直交性の鉄則です。
      </InfoBox>

      <SectionDivider />

      {/* ========== スロットデモ ========== */}
      <SectionHeader
        title='スロット: 中身を差し替える'
        subtitle='Figmaの Instance Swap に相当。コンポーネントの一部を「入れ替え可能な枠」として設計します。'
      />

      <DemoPanel label='操作してみよう - アイコンを差し替え'>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 2 }}>
              左アイコンを選ぶ
            </Typography>
            <Grid container spacing={1.5}>
              {(Object.keys(slotIcons) as Array<keyof typeof slotIcons>).map(
                (key) => (
                  <Grid size={{ xs: 3 }} key={key}>
                    <Box
                      onClick={() => setSlotIcon(key)}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: 2,
                        borderColor:
                          slotIcon === key
                            ? 'primary.main'
                            : isDark
                              ? 'rgba(255,255,255,0.08)'
                              : 'rgba(0,0,0,0.08)',
                        bgcolor:
                          slotIcon === key
                            ? isDark
                              ? 'rgba(14,173,184,0.15)'
                              : 'rgba(14,173,184,0.06)'
                            : 'transparent',
                        display: 'flex',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        '&:hover': {
                          borderColor: 'primary.main',
                        },
                      }}>
                      {slotIcons[key]}
                    </Box>
                  </Grid>
                )
              )}
            </Grid>
            <Typography
              sx={{
                mt: 2,
                fontSize: 12,
                color: 'text.secondary',
                lineHeight: 1.7,
              }}>
              バリアントを増やさず、スロットを入れ替えるだけで多様なUIを実現
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Box
              sx={{
                p: 4,
                borderRadius: 2,
                border: '2px dashed',
                borderColor: isDark
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                minHeight: 120,
              }}>
              <Button
                variant='contained'
                startIcon={slotIcons[slotIcon]}
                sx={{ px: 3 }}>
                アクション
              </Button>
              <Button
                variant='outlined'
                startIcon={slotIcons[slotIcon]}
                sx={{ px: 3 }}>
                アクション
              </Button>
              <Chip
                icon={<Box sx={{ display: 'flex' }}>{slotIcons[slotIcon]}</Box>}
                label='ラベル'
              />
            </Box>
          </Grid>
        </Grid>
      </DemoPanel>

      <InfoBox title='スロット設計のメリット'>
        「左アイコンあり」「右アイコンあり」とバリアントを増やす代わりに、
        <strong>好きなアイコンを入れられる枠（スロット）</strong>
        を用意すればバリアント爆発を防げます。
      </InfoBox>

      <SectionDivider />

      {/* トークン共有の図解 */}
      <SectionHeader
        title='トークンの共有'
        subtitle='同じ色のルールを複数のコンポーネントで共有すると、一箇所の変更で全体が更新されます。'
      />
      <Box sx={{ mb: 5 }}>
        <Grid container spacing={2}>
          {(['info', 'success', 'error'] as const).map((semantic) => (
            <Grid key={semantic} size={{ xs: 12, sm: 4 }}>
              <Stack spacing={1.5} alignItems='center'>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: `${semantic}.main`,
                    textTransform: 'uppercase',
                  }}>
                  {semantic}
                </Typography>
                <Chip label='Chip' color={semantic} size='small' />
                <Alert severity={semantic} sx={{ width: '100%', py: 0 }}>
                  Alert
                </Alert>
                <Button
                  variant='outlined'
                  color={semantic}
                  size='small'
                  fullWidth>
                  Button
                </Button>
              </Stack>
            </Grid>
          ))}
        </Grid>
        <Typography
          sx={{
            mt: 3,
            textAlign: 'center',
            fontSize: 13,
            color: 'text.secondary',
            lineHeight: 1.7,
          }}>
          info / success / error の色をトークンで管理 →
          トークンを変えるだけでChip, Alert, Buttonの色が一括で変わる
        </Typography>
      </Box>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// 状態・レイアウト・アセット
// ---------------------------------------------------------------------------

const StatesLayoutContent = () => {
  const theme = useTheme()

  const uiStates = [
    {
      state: 'Ideal',
      label: '理想状態',
      desc: '全データが正常に表示',
      color: 'success' as const,
    },
    {
      state: 'Empty',
      label: 'データ空',
      desc: '「データがありません」+ アクションボタン',
      color: 'info' as const,
    },
    {
      state: 'Loading',
      label: '読み込み中',
      desc: 'スケルトン / スピナー表示',
      color: 'primary' as const,
    },
    {
      state: 'Partial',
      label: '不完全',
      desc: '一部欠損、フォールバック表示',
      color: 'warning' as const,
    },
    {
      state: 'Error',
      label: 'エラー',
      desc: 'エラーメッセージ + リトライボタン',
      color: 'error' as const,
    },
  ]

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3 }}>
      <Paper
        variant='outlined'
        sx={{
          px: 6,
          py: 5,
          mb: 6,
          borderRadius: 3,
          textAlign: 'center',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(29,175,194,0.08) 0%, rgba(70,171,74,0.08) 100%)'
              : 'linear-gradient(135deg, rgba(29,175,194,0.04) 0%, rgba(70,171,74,0.04) 100%)',
        }}>
        <Typography variant='h3' sx={{ fontWeight: 800, mb: 1 }}>
          状態・レイアウト・アセット
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          コンポーネントの見え方の網羅、配置責任、ビジュアル管理
        </Typography>
      </Paper>

      {/* UIステートスタック */}
      <SectionHeader
        title='UIステートスタック'
        subtitle='全コンポーネントに5つの状態を設計する'
      />
      <Grid container spacing={2.5} sx={{ mb: 5 }}>
        {uiStates.map((s) => (
          <Grid key={s.state} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper
              variant='outlined'
              sx={{ px: 3, py: 3, height: '100%', borderRadius: 2 }}>
              <Stack spacing={1.5}>
                <Chip
                  label={s.state}
                  color={s.color}
                  size='small'
                  sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
                />
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  {s.label}
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ lineHeight: 1.8 }}>
                  {s.desc}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <InfoBox title='よくある間違い' color='warning'>
        Ideal状態だけ設計してEmpty/Errorを忘れる。特にPartial
        State（名前はあるがアイコンがない等）のフォールバック設計を忘れがち。
      </InfoBox>

      <SubSection title='インタラクション状態'>
        <SimpleTable
          headers={['状態', 'ルール例', '用途']}
          rows={[
            ['Hover', '黒の8%オーバーレイ', 'マウスオーバー'],
            ['Pressed', '黒の12%オーバーレイ', 'クリック中'],
            ['Disabled', 'opacity: 0.38', '操作不可'],
            ['Focus', '2px outline + offset', 'キーボード操作時'],
          ]}
        />
        <Typography variant='body1' color='text.secondary'>
          個別にデザインせず、トークンで統一ルール化する。
        </Typography>
      </SubSection>

      <SubSection title='破壊的変更とライフサイクル'>
        <SimpleTable
          headers={['操作', '分類', '影響']}
          rows={[
            ['バリアント追加', '安全', '既存に影響なし'],
            ['新props追加', '安全', '既存に影響なし'],
            ['名前変更', <strong key='b'>破壊的</strong>, '全使用箇所に影響'],
            ['選択肢削除', <strong key='c'>破壊的</strong>, '全使用箇所に影響'],
          ]}
        />
        <InfoBox title='廃止プロセス'>
          [Deprecated]マーク明示 → 移行期間 → 使用箇所ゼロ確認 →
          削除。安易にDetachせず「組み合わせで解決 → props追加 → 新規切り出し →
          例外許容」の順で検討。
        </InfoBox>
      </SubSection>

      <SectionDivider />

      {/* レイアウト */}
      <SectionHeader
        title='レイアウト責任の分離'
        subtitle='中身は自分、配置は親'
      />

      <SubSection title='margin vs padding'>
        <SimpleTable
          headers={['種類', '責任', 'ルール']}
          rows={[
            [
              <strong key='a'>margin (外側)</strong>,
              '親の責任',
              'コンポーネントに持たせない。Stack spacing / Grid spacing で制御',
            ],
            [
              <strong key='b'>padding (内側)</strong>,
              '自分の責任',
              'コンポーネント内部で制御',
            ],
          ]}
        />
        <InfoBox title='区切り線'>
          コンポーネント内に線を含めるより、<strong>親がDividerを挟む</strong>
          か、最後の要素だけ線を消せる仕組み（showDivider）を用意。
        </InfoBox>
      </SubSection>

      <SubSection title='サイジング: Fill / Hug / Fixed'>
        <SimpleTable
          headers={['パターン', '動作', 'Figma', 'CSS', '例']}
          rows={[
            [
              'Fill',
              '親幅いっぱい',
              'Fill container',
              'width: 100%',
              'Card, TextField',
            ],
            [
              'Hug',
              '中身に合わせる',
              'Hug contents',
              'width: fit-content',
              'Button, Chip',
            ],
            [
              'Fixed',
              '固定値',
              'Fixed width',
              'width: 320px',
              'アイコン, Avatar',
            ],
          ]}
        />
      </SubSection>

      <SubSection title='オーバーフロー'>
        <SimpleTable
          headers={['ケース', '対処', 'CSS']}
          rows={[
            [
              'テキストが長すぎる',
              '省略（ellipsis）',
              'text-overflow: ellipsis',
            ],
            ['テキスト説明文', '折り返し', 'word-break: break-word'],
            ['コンテンツ過多', 'スクロール', 'overflow: auto'],
            ['大量データ', 'ページネーション', 'Pagination コンポーネント'],
            ['数値上限', '999+ 表記', 'バッジ maxCount'],
          ]}
        />
      </SubSection>

      <SectionDivider />

      {/* アセット */}
      <SectionHeader
        title='アセット管理'
        subtitle='ビジュアルをシステムとして管理する'
      />

      <SubSection title='コード実装 vs 画像埋め込み'>
        <SimpleTable
          headers={['判断基準', 'コード実装 (SVG)', '画像埋め込み']}
          rows={[
            ['色変更', 'あり → コード', 'なし → 画像'],
            ['ダークモード', '必須 → コード', '不要 → 画像'],
            ['アニメーション', 'あり → コード', 'なし → 画像'],
          ]}
        />
      </SubSection>

      <SubSection title='SVG色制御: currentColor'>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ mb: 3, lineHeight: 1.8 }}>
          fill=&quot;#000&quot; ではなく <code>currentColor</code> を使う →
          親のテキスト色に自動追従（ダークモード/ホバー自動対応）。 Kaze
          UXではlucide-reactを標準使用（全てcurrentColor対応済み）。
        </Typography>
      </SubSection>

      <InfoBox title='Kaze UX方針' color='success'>
        アイコン: lucide-react + MUI Icons
        標準使用。独自SVGは最終手段。装飾画像は alt=&quot;&quot;
        でスクリーンリーダーから隠す。
      </InfoBox>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// ストーリーのエクスポート
// ---------------------------------------------------------------------------

export const Principles: StoryObj = {
  name: '設計6原則',
  render: () => <PrinciplesContent />,
}

export const PathDependency: StoryObj = {
  name: '経路依存性と設計判断',
  render: () => <PathDependencyContent />,
}

export const Strategy: StoryObj = {
  name: '構築戦略・分割・命名',
  render: () => <StrategyContent />,
}

export const Variables: StoryObj = {
  name: '変数と直交性',
  render: () => <VariablesContent />,
}

export const StatesAndLayout: StoryObj = {
  name: '状態・レイアウト・アセット',
  render: () => <StatesLayoutContent />,
}

// ---------------------------------------------------------------------------
// UI State Playground（インタラクティブ）
// ---------------------------------------------------------------------------
interface UIStateArgs {
  state: 'Ideal' | 'Empty' | 'Loading' | 'Partial' | 'Error'
  sizing: 'fill' | 'hug' | 'fixed'
  showInteraction: boolean
}

/** デバイスステータス行 */
const DeviceRow = ({
  name,
  status,
  battery,
  failed,
}: {
  name: string
  status: string
  battery: number
  failed?: boolean
}) => {
  const theme = useTheme()
  const isActive = status === 'active' && !failed
  const batteryColor =
    battery > 60 ? 'success.main' : battery > 20 ? 'warning.main' : 'error.main'

  return (
    <Stack
      direction='row'
      alignItems='center'
      sx={{
        px: 2.5,
        py: 1.5,
        borderRadius: 1.5,
        bgcolor:
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.02)'
            : 'rgba(0,0,0,0.015)',
        transition: 'background 0.15s',
        '&:hover': {
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.03)',
        },
      }}>
      {/* 接続インジケータ */}
      <Box
        sx={{
          mr: 2,
          display: 'flex',
          color: isActive ? 'success.main' : 'text.disabled',
        }}>
        {isActive ? <Signal size={16} /> : <SignalZero size={16} />}
      </Box>

      {/* 名前 */}
      <Typography
        variant='body1'
        sx={{ fontWeight: 500, flex: 1, opacity: failed ? 0.5 : 1 }}>
        {name}
      </Typography>

      {/* ステータス */}
      {failed ? (
        <Chip
          icon={<WifiOff size={13} />}
          label='取得失敗'
          size='small'
          color='warning'
          variant='outlined'
          sx={{ fontSize: 12 }}
        />
      ) : (
        <Stack direction='row' spacing={1.5} alignItems='center'>
          <Chip
            icon={isActive ? <Wifi size={13} /> : undefined}
            label={status}
            size='small'
            color={isActive ? 'success' : 'default'}
            variant='outlined'
            sx={{ fontSize: 12 }}
          />
          <Stack direction='row' spacing={0.5} alignItems='center'>
            <Box sx={{ color: batteryColor, display: 'flex' }}>
              {battery > 20 ? (
                <Battery size={14} />
              ) : (
                <BatteryWarning size={14} />
              )}
            </Box>
            <Typography
              variant='caption'
              sx={{ fontWeight: 600, color: batteryColor, minWidth: 28 }}>
              {battery}%
            </Typography>
          </Stack>
        </Stack>
      )}
    </Stack>
  )
}

const UIStatePlayground = ({ state, sizing, showInteraction }: UIStateArgs) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const stateConfig = {
    Ideal: {
      color: 'success' as const,
      label: 'Ideal',
      desc: '全データ取得完了',
    },
    Empty: { color: 'info' as const, label: 'Empty', desc: 'データなし' },
    Loading: {
      color: 'primary' as const,
      label: 'Loading',
      desc: '読み込み中...',
    },
    Partial: {
      color: 'warning' as const,
      label: 'Partial',
      desc: '一部データ欠損',
    },
    Error: { color: 'error' as const, label: 'Error', desc: '通信エラー' },
  }
  const cfg = stateConfig[state]
  const widthMap = { fill: '100%', hug: 'fit-content', fixed: 400 }
  const items = [
    { name: 'Falcon-01', status: 'active', battery: 85 },
    { name: 'Falcon-02', status: 'inactive', battery: 12 },
    { name: 'Falcon-03', status: 'active', battery: 42 },
  ]

  const stateIcon = {
    Ideal: <CheckCircle2 size={16} />,
    Empty: <Inbox size={16} />,
    Loading: <Loader2 size={16} />,
    Partial: <AlertTriangle size={16} />,
    Error: <XCircle size={16} />,
  }

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3 }}>
      <Typography variant='h5' sx={{ fontWeight: 700, mb: 0.5 }}>
        UI State Playground
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
        Controls で state / sizing / interaction を切り替えて、5つの状態を体験
      </Typography>

      {/* ステートインジケータ - 全5状態を横並び表示 */}
      <Stack direction='row' spacing={0.5} sx={{ mb: 3 }}>
        {(Object.keys(stateConfig) as Array<keyof typeof stateConfig>).map(
          (key) => (
            <Chip
              key={key}
              icon={stateIcon[key]}
              label={key}
              size='small'
              color={key === state ? stateConfig[key].color : 'default'}
              variant={key === state ? 'filled' : 'outlined'}
              sx={{
                fontWeight: key === state ? 700 : 400,
                opacity: key === state ? 1 : 0.5,
                transition: 'all 0.2s',
              }}
            />
          )
        )}
      </Stack>

      {/* メインカード */}
      <Paper
        variant='outlined'
        sx={{
          width: widthMap[sizing],
          minWidth: 320,
          maxWidth: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          borderColor: state === 'Error' ? 'error.main' : 'divider',
          ...(showInteraction && {
            cursor: 'pointer',
            '&:hover': {
              boxShadow: theme.shadows[8],
              borderColor: `${cfg.color}.main`,
              transform: 'translateY(-2px)',
            },
          }),
        }}>
        {/* ヘッダー */}
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
          sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          }}>
          <Stack direction='row' spacing={1.5} alignItems='center'>
            <Typography variant='body1' sx={{ fontWeight: 700 }}>
              Device Fleet
            </Typography>
            <Chip
              icon={stateIcon[state]}
              label={cfg.desc}
              size='small'
              color={cfg.color}
              sx={{ fontWeight: 500, fontSize: 12 }}
            />
          </Stack>
          <Chip
            label={`sizing: ${sizing}`}
            size='small'
            variant='outlined'
            sx={{ fontSize: 11, fontFamily: 'monospace' }}
          />
        </Stack>

        {/* Loading プログレス */}
        {state === 'Loading' && (
          <LinearProgress color='primary' sx={{ height: 2 }} />
        )}

        {/* コンテンツ */}
        <Box sx={{ p: 2.5 }}>
          {/* Ideal: 全データ正常 */}
          {state === 'Ideal' && (
            <Stack spacing={1}>
              {items.map((item) => (
                <DeviceRow key={item.name} {...item} />
              ))}
            </Stack>
          )}

          {/* Loading: スケルトン */}
          {state === 'Loading' && (
            <Stack spacing={1}>
              {[1, 2, 3].map((n) => (
                <Stack
                  key={n}
                  direction='row'
                  alignItems='center'
                  sx={{ px: 2.5, py: 1.5 }}>
                  <Skeleton
                    variant='circular'
                    width={16}
                    height={16}
                    sx={{ mr: 2 }}
                  />
                  <Skeleton variant='text' width={80} sx={{ flex: 0 }} />
                  <Box sx={{ flex: 1 }} />
                  <Skeleton
                    variant='rounded'
                    width={60}
                    height={24}
                    sx={{ mr: 1 }}
                  />
                  <Skeleton variant='rounded' width={40} height={16} />
                </Stack>
              ))}
            </Stack>
          )}

          {/* Empty: 空状態 */}
          {state === 'Empty' && (
            <Stack alignItems='center' spacing={2} sx={{ py: 5, px: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: isDark
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.disabled',
                }}>
                <Inbox size={28} />
              </Box>
              <Stack alignItems='center' spacing={0.5}>
                <Typography variant='body1' sx={{ fontWeight: 600 }}>
                  デバイスが登録されていません
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  デバイスを追加して監視を開始してください
                </Typography>
              </Stack>
              <Chip
                icon={<Plus size={14} />}
                label='デバイスを追加'
                color='primary'
                sx={{ cursor: 'pointer', fontWeight: 600, mt: 1 }}
              />
            </Stack>
          )}

          {/* Partial: 一部データ欠損 */}
          {state === 'Partial' && (
            <Stack spacing={1}>
              <DeviceRow {...items[0]} />
              <DeviceRow
                name={items[1].name}
                status='inactive'
                battery={0}
                failed
              />
              <DeviceRow {...items[2]} />
              <Alert
                severity='warning'
                variant='outlined'
                sx={{ mt: 1, borderRadius: 1.5, fontSize: 13 }}>
                Falcon-02 のデータ取得に失敗しました。接続を確認してください。
              </Alert>
            </Stack>
          )}

          {/* Error: 通信エラー */}
          {state === 'Error' && (
            <Stack alignItems='center' spacing={2} sx={{ py: 5, px: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: isDark
                    ? 'rgba(244,67,54,0.08)'
                    : 'rgba(244,67,54,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'error.main',
                }}>
                <XCircle size={28} />
              </Box>
              <Stack alignItems='center' spacing={0.5}>
                <Typography variant='body1' sx={{ fontWeight: 600 }}>
                  通信エラーが発生しました
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  サーバーに接続できません。ネットワーク状態を確認してください。
                </Typography>
              </Stack>
              <Chip
                icon={<RefreshCw size={14} />}
                label='再接続'
                color='error'
                variant='outlined'
                sx={{ cursor: 'pointer', fontWeight: 600, mt: 1 }}
              />
            </Stack>
          )}
        </Box>

        {/* フッター - Ideal / Partial のみ */}
        {(state === 'Ideal' || state === 'Partial') && (
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            sx={{
              px: 3,
              py: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
            }}>
            <Typography variant='caption' color='text.secondary'>
              {state === 'Ideal' ? '3/3 オンライン' : '2/3 オンライン'}
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontFamily: 'monospace' }}>
              最終更新: 12:34:56
            </Typography>
          </Stack>
        )}
      </Paper>

      {/* Sizing 説明 */}
      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block', fontFamily: 'monospace' }}>
        width:{' '}
        {typeof widthMap[sizing] === 'number'
          ? `${widthMap[sizing]}px`
          : widthMap[sizing]}
        {showInteraction ? ' | hover: enabled' : ''}
      </Typography>
    </Box>
  )
}

export const UIStateDemo: StoryObj<UIStateArgs> = {
  name: 'UI State Playground',
  args: {
    state: 'Ideal',
    sizing: 'fill',
    showInteraction: true,
  },
  argTypes: {
    state: {
      control: { type: 'select' },
      options: ['Ideal', 'Empty', 'Loading', 'Partial', 'Error'],
      description: 'UIの5状態（全コンポーネントに必要）',
    },
    sizing: {
      control: { type: 'select' },
      options: ['fill', 'hug', 'fixed'],
      description: 'サイジングパターン（Fill / Hug / Fixed）',
    },
    showInteraction: {
      control: 'boolean',
      description: 'ホバーインタラクションの有無',
    },
  },
  render: (args) => <UIStatePlayground {...args} />,
}
