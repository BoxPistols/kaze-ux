import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import type { MouseEvent } from 'react'

const sampleText = '日本語ひらがなカタカナ123abcABC@*^¥'

const Typographies = () => {
  const theme = useTheme()

  const displayColor =
    theme.palette.mode === 'light'
      ? theme.palette.info.dark
      : theme.palette.info.light

  const display = displayColor
  const noteText = theme.palette.text.secondary
  const displayTitle = theme.palette.text.primary

  const TextStyledDisplay = styled(Typography)`
    font-weight: bold;
    color: ${display};
    font-size: 24px;
    margin-bottom: 16px;
    font-weight: bold;
  `

  const TextStyledVariant = styled(Typography)`
    font-size: 16px;
    font-weight: bold;
    color: ${displayTitle};
  `

  const TextStyledSmall = styled(Typography)`
    font-size: 12px;
    font-weight: bold;
    color: ${noteText};
    margin: 2px 4px 2px 10px;
  `

  const TextStyledSample = styled(Typography)`
    margin-bottom: 2px;
    border-left: 2px solid ${display};
    padding: 2px 8px;
    margin: 4px 4px 4px 10px;
  `

  const TextStyledNote = styled(Typography)`
    font-size: 14px;
    color: ${noteText};
    margin-bottom: 16px;
    margin: 8px 4px 4px 10px;
  `
  const typographyVariantsHeading = [
    {
      variant: 'h1',
      note: '現状はマークアップ用途のためロゴ画像に利用し、現在はそれ以外は利用していません',
    },
    {
      variant: 'h2',
      note: 'xlと同じ。大見出し用途。コンテンツ内の最も大きなテキストとなります。用途に意味合いを持たせない場合はxlでもかまいません',
    },
    {
      variant: 'h3',
      note: 'lgと同じ。中見出し用途。用途に意味合いを持たせない場合はlgでもかまいません',
    },
    {
      variant: 'h4',
      note: 'h3に次ぐ中見出し用途。ml + boldと同じです',
    },
    {
      variant: 'h5',
      note: '小見出し用途。md + boldと同じです',
    },
    {
      variant: 'h6',
      note: '小見出し用途。sm + boldと同じです',
    },
  ]

  const typographyVariants = [
    {
      variant: 'body1',
      note: 'デフォルトのスタイルを踏襲。主に本文用。variantに何も指定しない場合もbody1になります。これで少し大きく感じる場合はbody2を使います',
    },
    {
      variant: 'body2',
      note: 'body1より1回りに小さい本文用',
    },
    {
      variant: 'subtitle1',
      note: '主に大見出しに付随したサブタイトル用です',
    },
    {
      variant: 'subtitle2',
      note: '主に中見出しに付随したサブタイトル用です',
    },
    {
      variant: 'caption',
      note: '注意や注釈表示など、補足文用途、推奨として最小のフォントサイズとしても考えられます',
    },
    {
      variant: 'overline',
      note: '用途は確定していませんが、captionより少し小さいサイズとしています',
    },
    {
      variant: 'button',
      note: 'Buttonコンポーネントのデフォルトフォントサイズです',
    },
    {
      variant: 'inherit',
      note: 'inheritなので、親要素のフォントサイズを継承します。親要素のフォントサイズを変更する場合は、このvariantを指定します',
    },
  ]

  // 拡張variant
  const typographyVariantsExtended = [
    {
      variant: 'xxl',
      note: 'h1相当',
    },
    {
      variant: 'xl',
      note: 'h2相当',
    },
    {
      variant: 'lg',
      note: 'h3相当',
    },
    {
      variant: 'ml',
      note: 'h4相当の大きさで、normalの太さ。ブラウザ本来のサイズです',
    },
    {
      variant: 'md',
      note: 'デフォルトサイズで、body1相当',
    },
    {
      variant: 'sm',
      note: 'body2相当',
    },
    {
      variant: 'xs',
      note: '最小サイズ（10px）。特殊用途のみ推奨',
    },
  ]

  const typographyVariantsDisplayExtended = [
    {
      variant: 'displayLarge',
      note: '最大のディスプレイサイズ。大きな見出しや特殊な表示に使用',
    },
    {
      variant: 'displayMedium',
      note: '中間のディスプレイサイズ。重要な見出しに使用',
    },
    {
      variant: 'displaySmall',
      note: '小さめのディスプレイサイズ。セクションの見出しなどに使用',
    },
  ]

  type TypographyVariant = keyof typeof theme.typography

  type TypographyStyle = {
    fontSize: string
    lineHeight: string
  }

  // フォントサイズとline-heightを取得するためのヘルパー関数
  const getTypographyStyle = (variant: TypographyVariant) => {
    const style = theme.typography[variant] as TypographyStyle
    const fontSizeRem = style.fontSize
    const lineHeight = style.lineHeight
    // Parse float value from rem string and convert to px
    const fontSizeRemValue = Number.parseFloat(fontSizeRem)
    const fontSizePx = (
      fontSizeRemValue * theme.typography.htmlFontSize
    ).toFixed(0)
    const fontSize = `${fontSizeRem} (${fontSizePx}px相当)`
    return `font-size: ${fontSize}, line-height: ${lineHeight}`
  }

  //ページ内リンク用
  function handleClick(id: string) {
    return (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <>
      <Container sx={{ p: 1, m: 1 }} id='top'>
        <Typography variant='h1'>Typography variants</Typography>
        <Typography variant='subtitle1' mb={1}>
          現在のhtml基準フォントサイズ:
          <b style={{ color: 'tomato' }}>{theme.typography.fontSize}px</b>
        </Typography>
        {/* // 各TextStyledDisplayにパージ内リンクを設定 */}
        <Stack spacing={3} direction='row' my={3}>
          <Typography variant='sm'>Jump to:</Typography>
          <Button onClick={handleClick('heading')}>Heading</Button>
          <Button onClick={handleClick('util')}>body + util</Button>
          <Button color='info' onClick={handleClick('extended')}>
            Extended
          </Button>
          <Button color='info' onClick={handleClick('extendedDisplay')}>
            ExtendedDisplay
          </Button>
        </Stack>

        {/* INFO */}

        <Stack
          py={3}
          px={4}
          mt={2}
          sx={{
            backgroundColor:
              theme.palette.mode === 'light' ? 'grey.200' : 'grey.800',
          }}>
          <Typography>
            MuiのTypographyコンポーネントは一通りThemeにて定義していますが、以下の点の考慮が必要です。
          </Typography>
          <Typography>
            近日MUIのメジャーアップデートが予定されており、現行の
            <a href='https://material.io/design/typography/the-type-system.html#type-scale'>
              Material Design2の設計思想
            </a>
            から、
            <a href='https://m3.material.io/styles/typography/type-scale-tokens'>
              Material Design3の設計思想
            </a>
            に変更される可能性があります。
            <br />
          </Typography>
          <Typography>
            基本的にマークアップ構造としてのセマンティクス性を確保出来ないテキスト構造のUI箇所では、抽象度の高い
            <Typography
              color='info.main'
              component={'span'}
              onClick={handleClick('extended')}
              sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
              カスタム拡張Variant
            </Typography>
            を使用することを推奨します。
          </Typography>
          <Typography>
            用途が明確なTypographyパターンがあれば、さらに拡張Variantを追加することも推奨します。
          </Typography>
        </Stack>

        {/* Heading */}
        <>
          <TextStyledDisplay id='heading' mt={2}>
            Heading
            <Typography variant='body2' mb={2}>
              MUI Default Variants
            </Typography>
          </TextStyledDisplay>

          <Typography variant='body2' mb={2}>
            Mui 見出し / h1以外は <code>{"variant='h(x)'"}</code>
            で見出しデザインを持った<code>div</code>
            となるため、マークアップ構造自体は気にしなくて良い仕組みです。
            <br />
            見出しは全て<b>太字</b>になります。
          </Typography>
          {typographyVariantsHeading.map(({ variant, note }) => (
            <Box key={variant} sx={{ marginBottom: 2 }}>
              <TextStyledVariant>{variant}</TextStyledVariant>
              <TextStyledSmall>
                {getTypographyStyle(variant as never)}
              </TextStyledSmall>
              <TextStyledSample variant={variant as never}>
                SampleText: {sampleText}
              </TextStyledSample>
              <TextStyledNote>{note}</TextStyledNote>
            </Box>
          ))}
        </>
        <Divider sx={{ my: 8 }} />

        {/* 本文 */}
        <>
          <TextStyledDisplay id='util'>
            body + util
            <Typography variant='body2' mb={2}>
              MUI Default Variants
            </Typography>
          </TextStyledDisplay>
          <Typography variant='body2'>
            Mui 本文 / 見出しの下に使うサブタイトル / ユーティリティテキスト
            <br />
            <code>{"variant='body1'"}</code>はデフォルトとなり、何も指定しない
            <code>{'<Typography>テキスト</Typography>'}</code>
            と同じ結果になります。
            <br />
            そして現在はcss基準のbody要素よりも上のhtml要素に対して
            <span>{theme.typography.fontSize}px</span>
            を指定しているため、これが基準（1rem）となります。
          </Typography>
          <Typography variant='body2' mb={2}>
            要素対応リスト:
            <code>
              {`body1: 'p', body2: 'p', subtitle1: 'p', subtitle2: 'p', overline:'span', caption: 'span', button: 'p',`}
            </code>
          </Typography>
          {typographyVariants.map(({ variant, note }) => (
            <Box key={variant} sx={{ marginBottom: 2 }}>
              <TextStyledVariant>{variant}</TextStyledVariant>
              <TextStyledSmall>
                {getTypographyStyle(variant as never)}
              </TextStyledSmall>
              <TextStyledSample variant={variant as never}>
                SampleText: {sampleText}
              </TextStyledSample>
              <TextStyledNote>{note}</TextStyledNote>
            </Box>
          ))}
          <Divider sx={{ my: 8 }} />
        </>

        {/* 拡張variant */}
        <>
          <TextStyledDisplay id='extended'>
            Extended variant
            <Typography variant='body2' mb={2}>
              MUI拡張 Variants
            </Typography>
          </TextStyledDisplay>
          <Typography variant='body2'>
            これはMuiから拡張した独自variantです。
            <br />
            抽象化されたvariantを使うことで、マークアップ構造を気にせずに汎用的なテキストを作成できます。
          </Typography>
          <Typography variant='body2' mb={2}>
            要素対応リスト:
            <code>{`xxl: 'div', xl: 'div', lg: 'div', ml: 'p', md: 'p', sm: 'p', xs: 'p'`}</code>
          </Typography>

          {typographyVariantsExtended.map(({ variant, note }) => (
            <Box key={variant} sx={{ marginBottom: 2 }}>
              <TextStyledVariant>{variant}</TextStyledVariant>
              <TextStyledSmall>
                {getTypographyStyle(variant as never)}
              </TextStyledSmall>
              <TextStyledSample variant={variant as never}>
                SampleText: {sampleText}
              </TextStyledSample>
              <TextStyledNote>{note}</TextStyledNote>
            </Box>
          ))}
          <Divider sx={{ my: 8 }} />
        </>

        {/* 拡張variant Display */}

        <TextStyledDisplay id='extendedDisplay'>
          Extended variant Display
          <Typography variant='body2' mb={2}>
            MUI拡張 Variants
          </Typography>
        </TextStyledDisplay>
        <Typography variant='body2'>
          これはMuiから拡張した独自variantで、特別に大きな見出し用途です。
          <br />
          MaterialDesignの設計思想に準じた抽象名になっています
        </Typography>
        <Typography variant='body2' mb={2}>
          要素対応リスト:
          <code>{`displayLarge: 'div', displayMedium: 'div', displaySmall: 'div'`}</code>
        </Typography>

        {typographyVariantsDisplayExtended.map(({ variant, note }) => (
          <Box key={variant} sx={{ marginBottom: 2 }}>
            <TextStyledVariant>{variant}</TextStyledVariant>
            <TextStyledSmall>
              {getTypographyStyle(variant as never)}
            </TextStyledSmall>
            <TextStyledSample variant={variant as never}>
              SampleText: {sampleText}
            </TextStyledSample>
            <TextStyledNote>{note}</TextStyledNote>
          </Box>
        ))}

        <Button
          onClick={handleClick('top')}
          sx={{
            position: 'fixed',
            bottom: 10,
            right: 10,
            minWidth: 'auto',
            padding: '4px 12px',
            height: '32px',
            lineHeight: 1.5,
          }}>
          ↑ To Top
        </Button>
      </Container>
    </>
  )
}

export default Typographies
