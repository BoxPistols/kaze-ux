import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew'
import MouseIcon from '@mui/icons-material/Mouse'
import PsychologyIcon from '@mui/icons-material/Psychology'
import TouchAppIcon from '@mui/icons-material/TouchApp'
import VisibilityIcon from '@mui/icons-material/Visibility'
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Link,
  Paper,
  Slider,
  Stack,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Guide/Ergonomics',
  parameters: {
    layout: 'padded',
    docs: { page: null },
  },
}

export default meta

const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant='body1' color='text.secondary' sx={{ mt: 1 }}>
        {subtitle}
      </Typography>
    )}
  </Box>
)

// ---------------------------------------------------------------------------
// Fitts' Law デモ
// ---------------------------------------------------------------------------
const FittsLawDemo = () => {
  const [clicks, setClicks] = useState({ small: 0, large: 0 })

  return (
    <Paper variant='outlined' sx={{ px: 3.5, py: 3, borderRadius: 2 }}>
      <Typography variant='body1' sx={{ fontWeight: 700, mb: 1 }}>
        Fitts の法則（体験）
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
        下の2つのボタンをクリックしてみてください。大きいボタンの方が素早くクリックできます。
      </Typography>
      <Stack direction='row' spacing={4} alignItems='center'>
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant='outlined'
            size='small'
            sx={{ minWidth: 40, minHeight: 24, fontSize: 10, px: 1 }}
            onClick={() => setClicks((p) => ({ ...p, small: p.small + 1 }))}>
            小
          </Button>
          <Typography variant='caption' display='block' sx={{ mt: 0.5 }}>
            {clicks.small} 回
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant='contained'
            sx={{ minWidth: 120, minHeight: 48, fontSize: 16 }}
            onClick={() => setClicks((p) => ({ ...p, large: p.large + 1 }))}>
            大きいボタン
          </Button>
          <Typography variant='caption' display='block' sx={{ mt: 0.5 }}>
            {clicks.large} 回
          </Typography>
        </Box>
      </Stack>
    </Paper>
  )
}

// ---------------------------------------------------------------------------
// コントラスト比デモ
// ---------------------------------------------------------------------------
const ContrastDemo = () => {
  const theme = useTheme()
  const samples = [
    { bg: '#ffffff', fg: '#000000', ratio: '21:1', pass: 'AAA' },
    { bg: '#ffffff', fg: '#595959', ratio: '7:1', pass: 'AAA' },
    { bg: '#ffffff', fg: '#767676', ratio: '4.5:1', pass: 'AA' },
    { bg: '#ffffff', fg: '#949494', ratio: '3:1', pass: 'AA Large' },
    { bg: '#ffffff', fg: '#cccccc', ratio: '1.6:1', pass: 'Fail' },
  ]

  return (
    <Stack spacing={1}>
      {samples.map((s) => (
        <Stack
          key={s.ratio}
          direction='row'
          spacing={2}
          alignItems='center'
          sx={{
            p: 1.5,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}>
          <Box
            sx={{
              width: 140,
              px: 1.5,
              py: 0.5,
              bgcolor: s.bg,
              color: s.fg,
              borderRadius: 0.5,
              fontSize: 13,
              fontWeight: 600,
              border: '1px solid',
              borderColor:
                theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300',
            }}>
            サンプルテキスト
          </Box>
          <Typography
            variant='body2'
            sx={{ fontFamily: 'monospace', minWidth: 50 }}>
            {s.ratio}
          </Typography>
          <Chip
            label={s.pass}
            size='small'
            color={
              s.pass === 'Fail'
                ? 'error'
                : s.pass.includes('AAA')
                  ? 'success'
                  : 'warning'
            }
            sx={{ minWidth: 80 }}
          />
        </Stack>
      ))}
    </Stack>
  )
}

// ---------------------------------------------------------------------------
// タッチターゲットデモ
// ---------------------------------------------------------------------------
const TouchTargetDemo = () => (
  <Stack direction='row' spacing={3} alignItems='flex-end'>
    {[
      { size: 24, label: '24px', status: 'NG' as const },
      { size: 32, label: '32px', status: 'NG' as const },
      { size: 44, label: '44px', status: 'OK' as const },
      { size: 48, label: '48px', status: 'OK' as const },
    ].map((t) => (
      <Box key={t.size} sx={{ textAlign: 'center' }}>
        <IconButton
          sx={{
            width: t.size,
            height: t.size,
            border: '2px dashed',
            borderColor: t.status === 'OK' ? 'success.main' : 'error.main',
            borderRadius: 1,
            fontSize: 10,
          }}>
          <TouchAppIcon sx={{ fontSize: t.size * 0.5 }} />
        </IconButton>
        <Typography variant='caption' display='block' sx={{ mt: 0.5 }}>
          {t.label}
        </Typography>
        <Chip
          label={t.status}
          size='small'
          color={t.status === 'OK' ? 'success' : 'error'}
          sx={{ mt: 0.5, height: 20, fontSize: 11 }}
        />
      </Box>
    ))}
  </Stack>
)

// ---------------------------------------------------------------------------
// 認知負荷デモ
// ---------------------------------------------------------------------------
const CognitiveLoadDemo = () => (
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, md: 6 }}>
      <Paper
        variant='outlined'
        sx={{ px: 3.5, py: 3, borderRadius: 2, borderColor: 'error.main' }}>
        <Typography
          variant='body2'
          sx={{ fontWeight: 600, mb: 1.5, color: 'error.main' }}>
          NG: 認知負荷が高い
        </Typography>
        <Stack spacing={1}>
          <Button variant='contained' color='primary' size='small'>
            送信
          </Button>
          <Button variant='contained' color='secondary' size='small'>
            下書き保存
          </Button>
          <Button variant='contained' color='warning' size='small'>
            プレビュー
          </Button>
          <Button variant='contained' color='info' size='small'>
            テンプレート
          </Button>
          <Button variant='contained' color='success' size='small'>
            自動保存ON
          </Button>
          <Button variant='outlined' color='error' size='small'>
            破棄
          </Button>
        </Stack>
        <Typography variant='caption' color='text.secondary' sx={{ mt: 1 }}>
          選択肢が多すぎて迷う（Hick の法則）
        </Typography>
      </Paper>
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <Paper
        variant='outlined'
        sx={{ px: 3.5, py: 3, borderRadius: 2, borderColor: 'success.main' }}>
        <Typography
          variant='body2'
          sx={{ fontWeight: 600, mb: 1.5, color: 'success.main' }}>
          OK: 認知負荷が低い
        </Typography>
        <Stack spacing={1}>
          <Button variant='contained' size='small'>
            送信
          </Button>
          <Button variant='outlined' size='small'>
            下書き保存
          </Button>
        </Stack>
        <Typography variant='caption' color='text.secondary' sx={{ mt: 1 }}>
          主要アクション + 補助アクションに絞る
        </Typography>
      </Paper>
    </Grid>
  </Grid>
)

// ---------------------------------------------------------------------------
// メインコンテンツ
// ---------------------------------------------------------------------------

const ErgonomicsContent = () => {
  const theme = useTheme()
  const [lhValue, setLhValue] = useState(1.6)

  const principles = [
    {
      icon: <MouseIcon />,
      title: 'Fitts の法則',
      description:
        'ターゲットが大きく近いほど、操作が速く正確になる。重要なボタンは大きく配置する。',
    },
    {
      icon: <PsychologyIcon />,
      title: 'Hick の法則',
      description:
        '選択肢が増えるほど意思決定に時間がかかる。選択肢は5〜7個以下に絞る。',
    },
    {
      icon: <VisibilityIcon />,
      title: 'Miller の法則',
      description:
        '人間の短期記憶は7(+-2)個の情報を保持できる。情報はチャンク化して提示する。',
    },
    {
      icon: <TouchAppIcon />,
      title: 'タッチターゲット',
      description:
        'モバイルのタッチ領域は最低44x44px（Apple HIG）/ 48x48dp（Material Design）。',
    },
    {
      icon: <AccessibilityNewIcon />,
      title: 'WCAG コントラスト比',
      description:
        '通常テキスト 4.5:1以上（AA）、大テキスト 3:1以上。AAA は 7:1以上。',
    },
  ]

  const typographyRules = [
    {
      rule: '本文フォントサイズ',
      value: '14px〜16px',
      reason: 'デスクトップでの可読性の下限',
    },
    {
      rule: '行の長さ（measure）',
      value: '45〜75文字',
      reason: '長すぎると視線移動が疲れる',
    },
    {
      rule: '行間（line-height）',
      value: '1.5〜1.8',
      reason: '行間が狭いと読みにくい',
    },
    {
      rule: '段落間',
      value: 'フォントサイズの0.75〜1.25倍',
      reason: '段落の区切りを明確に',
    },
    {
      rule: '見出し階層',
      value: '最大3レベル',
      reason: '深すぎると構造が把握しにくい',
    },
    {
      rule: '日本語書体',
      value: 'Noto Sans JP / ヒラギノ',
      reason: '可読性と互換性のバランス',
    },
  ]

  const colorMeaning = [
    {
      color: 'primary.main',
      label: '主要アクション',
      usage: '送信、確定、ナビゲーション',
    },
    {
      color: 'error.main',
      label: '危険・エラー',
      usage: '削除、エラー表示、警告',
    },
    {
      color: 'success.main',
      label: '成功・完了',
      usage: '保存完了、ステータス正常',
    },
    { color: 'warning.main', label: '注意', usage: '確認が必要な操作、期限' },
    {
      color: 'info.main',
      label: '情報・補足',
      usage: 'ヒント、通知、補足情報',
    },
    {
      color: 'text.secondary',
      label: '非強調',
      usage: 'キャプション、補助テキスト',
    },
  ]

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3 }}>
      {/* ヒーロー */}
      <Paper
        variant='outlined'
        sx={{
          px: 6,
          py: 5,
          mb: 6,
          borderRadius: 3,
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(255,152,0,0.08) 0%, rgba(233,30,99,0.08) 100%)'
              : 'linear-gradient(135deg, rgba(255,152,0,0.04) 0%, rgba(233,30,99,0.04) 100%)',
        }}>
        <Typography variant='h4' sx={{ fontWeight: 800, mb: 1 }}>
          UI と人間工学
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          ユーザーの認知特性・身体特性に基づいたUI設計の原則。
          「使いやすい」は感覚ではなく科学で説明できる。
        </Typography>
      </Paper>

      {/* 基本法則 */}
      <SectionHeader
        title='UI設計の基本法則'
        subtitle='人間の認知・運動特性に基づく設計指針'
      />
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {principles.map((p) => (
          <Grid key={p.title} size={{ xs: 12, sm: 6 }}>
            <Paper
              variant='outlined'
              sx={{ px: 3.5, py: 3, borderRadius: 2, height: '100%' }}>
              <Stack direction='row' spacing={1.5} alignItems='flex-start'>
                <Box sx={{ color: 'primary.main', mt: 0.3 }}>{p.icon}</Box>
                <Box>
                  <Typography variant='body1' sx={{ fontWeight: 700, mb: 0.5 }}>
                    {p.title}
                  </Typography>
                  <Typography variant='body1' color='text.secondary'>
                    {p.description}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 5 }} />

      {/* Fitts 体験 */}
      <SectionHeader
        title='Fitts の法則（体験デモ）'
        subtitle='ボタンサイズと操作速度の関係'
      />
      <Box sx={{ mb: 5 }}>
        <FittsLawDemo />
      </Box>

      <Divider sx={{ my: 5 }} />

      {/* 認知負荷 */}
      <SectionHeader
        title='認知負荷の最小化'
        subtitle='Hick の法則: 選択肢を減らし、階層化する'
      />
      <Box sx={{ mb: 5 }}>
        <CognitiveLoadDemo />
      </Box>

      <Divider sx={{ my: 5 }} />

      {/* タッチターゲット */}
      <SectionHeader
        title='タッチターゲットサイズ'
        subtitle='Apple HIG: 44px / Material Design: 48dp'
      />
      <Paper variant='outlined' sx={{ px: 3.5, py: 3, borderRadius: 2, mb: 5 }}>
        <TouchTargetDemo />
        <Typography variant='body1' color='text.secondary' sx={{ mt: 2 }}>
          点線の枠がタッチ領域。44px未満だと誤タップが増え、ユーザー体験が悪化する。
          アイコンが小さくても、タッチ領域は padding で確保すること。
        </Typography>
      </Paper>

      <Divider sx={{ my: 5 }} />

      {/* コントラスト */}
      <SectionHeader
        title='色のコントラスト比（WCAG 2.1）'
        subtitle='テキストと背景色のコントラストによるアクセシビリティ基準'
      />
      <Paper variant='outlined' sx={{ px: 3.5, py: 3, borderRadius: 2, mb: 5 }}>
        <ContrastDemo />
        <Box sx={{ mt: 2 }}>
          <Stack spacing={0.5}>
            <Typography variant='body1' color='text.secondary'>
              <strong>AA（最低基準）:</strong> 通常テキスト 4.5:1 /
              大テキスト(18px+) 3:1
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              <strong>AAA（推奨基準）:</strong> 通常テキスト 7:1 / 大テキスト
              4.5:1
            </Typography>
          </Stack>
        </Box>
      </Paper>

      <Divider sx={{ my: 5 }} />

      {/* 色の意味 */}
      <SectionHeader
        title='色の意味づけ（セマンティックカラー）'
        subtitle='色だけに頼らず、アイコンやテキストと併用する'
      />
      <Stack spacing={1.5} sx={{ mb: 5 }}>
        {colorMeaning.map((c) => (
          <Paper
            key={c.label}
            variant='outlined'
            sx={{ px: 3, py: 2.5, borderRadius: 2 }}>
            <Stack direction='row' spacing={2.5} alignItems='center'>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: c.color,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant='body1' sx={{ fontWeight: 700 }}>
                  {c.label}
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ mt: 0.25 }}>
                  {c.usage}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Paper
        sx={{
          p: 2,
          mb: 5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'warning.main',
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'rgba(255,152,0,0.05)'
              : 'rgba(255,152,0,0.02)',
        }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 0.5 }}>
          色覚多様性への配慮
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          赤緑色覚異常は男性の約8%に存在する。色だけで状態を伝えず、
          アイコン・テキスト・パターンを併用すること。エラーには赤色 + アイコン
          + テキストで三重に伝達する。
        </Typography>
      </Paper>

      <Divider sx={{ my: 5 }} />

      {/* タイポグラフィ */}
      <SectionHeader
        title='読みやすさのルール（タイポグラフィ）'
        subtitle='可読性は行間・行長・フォントサイズの3要素で決まる'
      />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {typographyRules.map((r) => (
          <Grid key={r.rule} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper
              variant='outlined'
              sx={{ px: 3.5, py: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant='body1' sx={{ fontWeight: 700, mb: 0.5 }}>
                {r.rule}
              </Typography>
              <Chip
                label={r.value}
                size='small'
                color='primary'
                variant='outlined'
                sx={{ mb: 1 }}
              />
              <Typography
                variant='caption'
                color='text.secondary'
                display='block'>
                {r.reason}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 行間デモ */}
      <Paper variant='outlined' sx={{ px: 3.5, py: 3, borderRadius: 2, mb: 5 }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 1 }}>
          行間（line-height）の体感デモ: {lhValue.toFixed(1)}
        </Typography>
        <Slider
          value={lhValue}
          onChange={(_, v) => setLhValue(v as number)}
          min={1.0}
          max={2.5}
          step={0.1}
          marks={[
            { value: 1.0, label: '1.0' },
            { value: 1.5, label: '1.5' },
            { value: 2.0, label: '2.0' },
            { value: 2.5, label: '2.5' },
          ]}
          sx={{ mb: 2 }}
        />
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
            borderRadius: 1,
            maxWidth: 600,
          }}>
          <Typography
            key={`line-height-demo-${lhValue}`}
            variant='body2'
            sx={{ lineHeight: `${lhValue} !important` }}>
            ドローン運航管理システムは、複数の無人航空機を安全かつ効率的に管理するためのプラットフォームです。
            リアルタイムの位置情報追跡、フライト計画の作成と承認ワークフロー、気象データとの統合、
            緊急時の自動帰還機能など、運航に必要な機能を包括的に提供します。
            航空法に基づく飛行制限区域の自動チェック機能も搭載しています。
          </Typography>
        </Paper>
      </Paper>

      <Divider sx={{ my: 5 }} />

      {/* レスポンシブ */}
      <SectionHeader
        title='レスポンシブデザインの原則'
        subtitle='ブレークポイントと可読性'
      />
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {[
          {
            bp: 'xs (0-639px)',
            device: 'スマートフォン',
            rules: '1カラム、タッチ操作優先、フォント14px以上',
          },
          {
            bp: 'sm (640-767px)',
            device: 'タブレット縦',
            rules: '1-2カラム、サイドバー折りたたみ',
          },
          {
            bp: 'md (768-1365px)',
            device: 'タブレット横/小型PC',
            rules: '2-3カラム、サイドバー表示',
          },
          {
            bp: 'lg (1366px+)',
            device: 'デスクトップ',
            rules: '多カラム、dense表示可、ホバー操作',
          },
        ].map((b) => (
          <Grid key={b.bp} size={{ xs: 12, sm: 6 }}>
            <Paper
              variant='outlined'
              sx={{ px: 3.5, py: 3, borderRadius: 2, height: '100%' }}>
              <Chip
                label={b.bp}
                size='small'
                variant='outlined'
                sx={{ mb: 1, fontFamily: 'monospace' }}
              />
              <Typography variant='body1' sx={{ fontWeight: 700, mb: 0.5 }}>
                {b.device}
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                {b.rules}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 5 }} />

      {/* インタラクション */}
      <SectionHeader title='インタラクションの原則' />
      <Grid container spacing={2}>
        {[
          {
            title: 'フィードバック',
            description:
              '操作に対して0.1秒以内に視覚的フィードバックを返す。ボタンのripple、hover効果、loading状態。',
          },
          {
            title: '一貫性',
            description:
              '同じ操作は常に同じ結果をもたらす。同じ色は同じ意味。同じ位置に同じ機能。',
          },
          {
            title: 'エラー防止',
            description:
              'エラーが起きてから修正するより、起きないようにする。確認ダイアログ、入力バリデーション、Undo。',
          },
          {
            title: '可逆性',
            description:
              '操作を「元に戻す」手段を提供する。削除前の確認、ゴミ箱、Ctrl+Z。不安なく操作できる環境。',
          },
          {
            title: '進行状況の可視化',
            description:
              '処理の進捗をユーザーに伝える。ProgressBar、Skeleton、StepperなどUI要素で示す。',
          },
          {
            title: 'アフォーダンス',
            description:
              '見た目で操作方法が伝わるデザイン。ボタンは押せそうに、リンクはクリックできそうに見せる。',
          },
        ].map((item) => (
          <Grid key={item.title} size={{ xs: 12, sm: 6 }}>
            <Paper
              variant='outlined'
              sx={{ px: 3.5, py: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant='body1' sx={{ fontWeight: 700, mb: 0.5 }}>
                {item.title}
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                {item.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 参考リンク */}
      <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 1.5 }}>
          参考リンク
        </Typography>
        <Stack spacing={0.75}>
          <Link href='https://www.w3.org/WAI/WCAG21/quickref/' target='_blank' rel='noopener noreferrer' variant='body1' color='primary'>
            WCAG Quick Reference
          </Link>
          <Link href='https://mui.com/material-ui/getting-started/accessibility/' target='_blank' rel='noopener noreferrer' variant='body1' color='primary'>
            MUI Accessibility
          </Link>
        </Stack>
      </Box>
    </Box>
  )
}

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => <ErgonomicsContent />,
}
