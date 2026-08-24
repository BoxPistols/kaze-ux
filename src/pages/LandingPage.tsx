import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import GitHubIcon from '@mui/icons-material/GitHub'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { Box, Typography, alpha, useTheme } from '@mui/material'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { KazeLogo } from '@/components/ui/logo'
import { parseColor } from '@/themes/contrast'
import { motionOf } from '@/themes/motion'
import { ANALYTICS_EVENTS, trackEvent } from '@/utils/analytics'
import {
  APP_LINKS,
  DEFAULT_PORTS,
  getDevPorts,
  saveDevPorts,
} from '@/utils/appLinks'
import type { DevPorts } from '@/utils/appLinks'

// アンビエント（オーブ・粒子・グロー）は同じ色を何段もの alpha で重ねるため、
// `rgba(r,g,b,` までを組んで末尾の alpha を呼び出し側が足す形にしている。
// 値を手打ちするとトークンと二重管理になるので、必ず色から導出する
const rgbaPrefix = (color: string) => {
  const { r, g, b } = parseColor(color)
  return `rgba(${r},${g},${b},`
}

// ヒーロー背景 — グラデーションオーブ + グリッドライン + パーティクル
const HeroBackground = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const brand = rgbaPrefix(theme.palette.primary.main)
  const brandAlt = rgbaPrefix(
    isDark ? theme.palette.primary.dark : theme.palette.primary.light
  )

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
      {/* メイングラデーションオーブ — 右上 */}
      <Box
        sx={{
          position: 'absolute',
          width: '80vw',
          height: '80vw',
          maxWidth: 1000,
          maxHeight: 1000,
          top: '-20%',
          right: '-15%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${brand}${isDark ? '0.18' : '0.12'}) 0%, ${brand}${isDark ? '0.06' : '0.04'}) 40%, transparent 70%)`,
          animation: 'orbDrift 16s ease-in-out infinite',
          filter: 'blur(40px)',
        }}
      />

      {/* サブオーブ — 左下 */}
      <Box
        sx={{
          position: 'absolute',
          width: '50vw',
          height: '50vw',
          maxWidth: 600,
          maxHeight: 600,
          bottom: '-15%',
          left: '-10%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${brandAlt}${isDark ? '0.12' : '0.08'}) 0%, transparent 65%)`,
          animation: 'orbDrift 20s ease-in-out infinite reverse',
          filter: 'blur(30px)',
        }}
      />

      {/* 第3オーブ — 中央やや上 */}
      <Box
        sx={{
          position: 'absolute',
          width: '30vw',
          height: '30vw',
          maxWidth: 400,
          maxHeight: 400,
          top: '20%',
          left: '40%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${brand}${isDark ? '0.08' : '0.05'}) 0%, transparent 60%)`,
          animation: 'orbFloat 12s ease-in-out infinite',
          filter: 'blur(50px)',
        }}
      />

      {/* グリッドライン */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: isDark ? 0.06 : 0.05,
          backgroundImage: `
            linear-gradient(${brand}0.3) 1px, transparent 1px),
            linear-gradient(90deg, ${brand}0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          maskImage:
            'radial-gradient(ellipse 90% 70% at 65% 35%, black 10%, transparent 60%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 70% at 65% 35%, black 10%, transparent 60%)',
        }}
      />

      {/* 浮遊パーティクル */}
      {[...Array(8)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: 3 + (i % 3) * 2,
            height: 3 + (i % 3) * 2,
            borderRadius: '50%',
            bgcolor: `${brand}${isDark ? '0.4' : '0.3'})`,
            top: `${10 + i * 10}%`,
            left: `${15 + ((i * 11) % 70)}%`,
            animation: `particle ${6 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}

      {/* 装飾リング */}
      <Box
        sx={{
          position: 'absolute',
          width: 300,
          height: 300,
          top: '10%',
          right: '8%',
          borderRadius: '50%',
          border: `1px solid ${brand}${isDark ? '0.1' : '0.08'})`,
          animation: 'ringRotate 30s linear infinite',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -1,
            left: '50%',
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: `${brand}${isDark ? '0.5' : '0.4'})`,
            transform: 'translateX(-50%)',
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 200,
          height: 200,
          top: '18%',
          right: '12%',
          borderRadius: '50%',
          border: `1px dashed ${brand}${isDark ? '0.06' : '0.05'})`,
          animation: 'ringRotate 24s linear infinite reverse',
        }}
      />

      <style>{`
        @keyframes orbDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -15px) scale(1.05); }
          66% { transform: translate(-15px, 10px) scale(0.97); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0); opacity: 1; }
          50% { transform: translate(30px, -20px); opacity: 0.6; }
        }
        @keyframes particle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
          50% { transform: translateY(-30px) scale(1.5); opacity: 0.8; }
        }
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  )
}

// プロダクトカードの型
interface ProductCardProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  label: string
  index: number
  /** public/captures/ のファイル名の頭。ダークが無いものは light だけ使う */
  capture?: { id: string; hasDark: boolean }
  /**
   * そのプロダクト固有の作り方。全プロダクトに共通する技術（React / MUI /
   * Tailwind 等）はページ下部の Tech Stack で述べているので、ここには
   * **そのプロダクトだけが持つ性質**だけを書く
   */
  techNote?: string
  /** 別ホストのプロダクト。新規タブで開く（LP から離脱させない） */
  external?: boolean
}

/** キャプチャの実寸。撮影時のビューポート (scripts/capture-products.mjs) と揃える */
const CAPTURE_SIZE = { width: 1440, height: 900 }

/**
 * プロダクトのキャプチャ。
 *
 * 画像が無い/読めない場合でもカードは成立する（画像は情報の補強で、
 * これが無いと意味が通らない作りにはしない）。alt は「何の画面か」を
 * 述べる。装飾ではないので空にはしない。
 */
const ProductCapture = ({
  title,
  capture,
  isDark,
}: {
  title: string
  capture: NonNullable<ProductCardProps['capture']>
  isDark: boolean
}) => {
  const scheme = isDark && capture.hasDark ? 'dark' : 'light'
  return (
    <Box
      sx={{
        mb: 3,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        // 読み込み前に高さが確定していないと、カードが後からずれる
        aspectRatio: `${CAPTURE_SIZE.width} / ${CAPTURE_SIZE.height}`,
        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      }}>
      <Box
        component='img'
        src={`${import.meta.env.BASE_URL}captures/${capture.id}-${scheme}.webp`}
        alt={`${title} の画面`}
        loading='lazy'
        decoding='async'
        width={CAPTURE_SIZE.width}
        height={CAPTURE_SIZE.height}
        sx={{ display: 'block', width: '100%', height: 'auto' }}
      />
    </Box>
  )
}

// インタラクティブなプロダクトカード
const ProductCard = ({
  title,
  description,
  icon,
  href,
  label,
  index,
  capture,
  techNote,
  external = false,
}: ProductCardProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // 実際に描画する行数から span を出す。固定値にすると、capture や techNote を
  // 持たないプロダクトを足したときに行が 1 つ余り、そこから下が全部ずれる
  // （揃えるための subgrid が、逆にずれの原因になる）
  const ALWAYS_ROWS = 3 // アイコン / タイトル / 説明
  const rowCount = ALWAYS_ROWS + (capture ? 1 : 0) + (techNote ? 1 : 0)
  const subgridSx = {
    display: 'grid',
    gridTemplateRows: 'subgrid',
    gridRow: `span ${rowCount}`,
    rowGap: 0,
  } as const

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.25, 0.1, 0, 1],
      }}
      // subgrid は親グリッドの行を継承する仕組みなので、間にある要素も
      // グリッドで繋いでおかないと連鎖が切れてカード内の行が揃わない。
      // rowGap: 0 が要る — 継承した行間に親の gap(24px) が全行に入り、
      // 要素の margin と二重になって間延びする
      style={subgridSx}>
      <Box
        component='a'
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        onClick={() =>
          trackEvent(ANALYTICS_EVENTS.PRODUCT_OPENED, {
            product: title,
            href,
          })
        }
        sx={{
          // カード内も subgrid にして、キャプチャ・アイコン・タイトル・説明・
          // techNote の各行を**カード間で**揃える。行数が違うカードが混ざっても
          // 説明の開始位置がずれない（グリッドの行を親から継承する）
          ...subgridSx,
          alignContent: 'start',
          textDecoration: 'none',
          color: 'inherit',
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          transition: motionOf(['border-color', 'box-shadow'], 'short'),
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: `0 12px 40px ${alpha(
              theme.palette.primary.main,
              isDark ? 0.15 : 0.12
            )}`,
            borderColor: 'primary.main',
          },
        }}>
        {/* ラベルバッジ */}
        <Box
          className='card-label'
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: '0.95rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            opacity: 1,
          }}>
          {label}
        </Box>

        {capture && (
          <ProductCapture title={title} capture={capture} isDark={isDark} />
        )}

        <Box
          className='card-icon'
          sx={{
            mb: 3,
            '& .MuiSvgIcon-root': { fontSize: 36 },
          }}>
          {icon}
        </Box>

        <Typography
          sx={{
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            mb: 1.5,
          }}>
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: '1rem',
            color: 'text.secondary',
            lineHeight: 1.8,
          }}>
          {description}
        </Typography>

        {techNote && (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: isDark
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(0,0,0,0.08)',
            }}>
            <Typography
              sx={{
                // 14px 基準なので 0.9rem = 12.6px。0.85rem だと 11.9px となり
                // 「12px 未満を使わない」に反する（typography-usage.test.ts が検出）
                fontSize: '0.9rem',
                color: 'text.secondary',
                lineHeight: 1.7,
              }}>
              {techNote}
            </Typography>
          </Box>
        )}
      </Box>
    </motion.div>
  )
}

// 特徴セクションの項目
const FeatureItem = ({
  number,
  title,
  desc,
  index,
}: {
  number: string
  title: string
  desc: string
  index: number
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}>
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', mb: 5 }}>
        <Typography
          sx={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'primary.textContrast',
            fontFamily: 'monospace',
            pt: 0.5,
            flexShrink: 0,
            letterSpacing: '0.05em',
          }}>
          {number}
        </Typography>
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1.2rem',
              mb: 0.75,
              letterSpacing: '-0.01em',
            }}>
            {title}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.95rem',
              color: 'text.secondary',
              lineHeight: 1.8,
            }}>
            {desc}
          </Typography>
        </Box>
      </Box>
    </motion.div>
  )
}

// バウハウス風の幾何学セパレーター — セクション間に視覚的な呼吸を与える
const BauhausDivider = ({
  variant = 'a',
  flip = false,
}: {
  variant?: 'a' | 'b' | 'c'
  flip?: boolean
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  // Kaze 骨格 3 色。ブランド青が主役 + asagi/beni をアクセントに（画面 5% 以下）
  const brand = rgbaPrefix(theme.palette.primary.main)
  const asagi = rgbaPrefix('#5B8FB9')
  const beni = rgbaPrefix('#E34E3A')
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const x1 = useTransform(
    scrollYProgress,
    [0, 1],
    [flip ? 60 : -60, flip ? -20 : 20]
  )
  const x2 = useTransform(
    scrollYProgress,
    [0, 1],
    [flip ? -40 : 40, flip ? 20 : -20]
  )

  const shapes: Record<string, React.ReactNode> = {
    a: (
      <>
        <motion.div style={{ x: x1 }}>
          <Box
            sx={{
              width: { xs: 120, md: 200 },
              height: { xs: 120, md: 200 },
              border: `2px solid ${brand}${isDark ? '0.12' : '0.08'})`,
              position: 'absolute',
              left: flip ? 'auto' : '8%',
              right: flip ? '8%' : 'auto',
              top: -40,
            }}
          />
        </motion.div>
        <motion.div style={{ x: x2 }}>
          <Box
            sx={{
              width: { xs: 60, md: 100 },
              height: { xs: 60, md: 100 },
              borderRadius: '50%',
              bgcolor: `${asagi}${isDark ? '0.12' : '0.1'})`,
              position: 'absolute',
              left: flip ? 'auto' : '18%',
              right: flip ? '18%' : 'auto',
              top: { xs: 30, md: 20 },
            }}
          />
        </motion.div>
        <Box
          sx={{
            position: 'absolute',
            left: flip ? 'auto' : { xs: '5%', md: '6%' },
            right: flip ? { xs: '5%', md: '6%' } : 'auto',
            top: '50%',
            width: { xs: 80, md: 140 },
            height: 2,
            bgcolor: `${brand}${isDark ? '0.1' : '0.06'})`,
          }}
        />
      </>
    ),
    b: (
      <>
        <motion.div style={{ x: x1 }}>
          <Box
            sx={{
              width: { xs: 80, md: 140 },
              height: { xs: 80, md: 140 },
              bgcolor: `${asagi}${isDark ? '0.08' : '0.06'})`,
              position: 'absolute',
              right: flip ? 'auto' : '12%',
              left: flip ? '12%' : 'auto',
              top: -20,
              transform: 'rotate(45deg)',
            }}
          />
        </motion.div>
        <motion.div style={{ x: x2 }}>
          <Box
            sx={{
              width: { xs: 40, md: 64 },
              height: { xs: 40, md: 64 },
              border: `2px solid ${brand}${isDark ? '0.14' : '0.1'})`,
              borderRadius: '50%',
              position: 'absolute',
              right: flip ? 'auto' : '22%',
              left: flip ? '22%' : 'auto',
              top: { xs: 40, md: 50 },
            }}
          />
        </motion.div>
      </>
    ),
    c: (
      <>
        <motion.div style={{ x: x1 }}>
          <Box
            sx={{
              width: { xs: 160, md: 280 },
              height: 2,
              bgcolor: `${brand}${isDark ? '0.08' : '0.05'})`,
              position: 'absolute',
              left: '50%',
              top: 20,
              transform: 'translateX(-50%)',
            }}
          />
        </motion.div>
        <Box
          sx={{
            width: { xs: 12, md: 16 },
            height: { xs: 12, md: 16 },
            borderRadius: '50%',
            bgcolor: `${beni}${isDark ? '0.75' : '0.7'})`,
            position: 'absolute',
            left: '50%',
            top: 12,
            transform: 'translateX(-50%)',
          }}
        />
        <motion.div style={{ x: x2 }}>
          <Box
            sx={{
              width: { xs: 50, md: 80 },
              height: { xs: 50, md: 80 },
              border: `1.5px solid ${brand}${isDark ? '0.08' : '0.05'})`,
              position: 'absolute',
              left: '50%',
              top: -10,
              transform: 'translateX(-50%) rotate(45deg)',
            }}
          />
        </motion.div>
      </>
    ),
  }

  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative',
        height: { xs: 80, md: 120 },
        overflow: 'visible',
        ...CONTAINER_SX,
      }}>
      {shapes[variant]}
    </Box>
  )
}

// 開発用ポート設定パネル（DEV モードのみ）
const DevPortSettings = () => {
  const [ports, setPorts] = useState<DevPorts>(getDevPorts)
  const [saved, setSaved] = useState(false)
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const handleSave = () => {
    saveDevPorts(ports)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    window.location.reload()
  }

  return (
    <Box
      sx={{
        ...CONTAINER_SX,
        my: 2,
        p: 2,
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'warning.main',
        bgcolor: isDark ? 'rgba(255,152,0,0.05)' : 'rgba(255,152,0,0.04)',
      }}>
      <Typography
        sx={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'warning.textContrast',
          mb: 1,
        }}>
        DEV — ポート設定（ローカルのみ表示）
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
        {(Object.keys(DEFAULT_PORTS) as Array<keyof DevPorts>).map((key) => (
          <Box
            key={key}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: 'text.primary',
                minWidth: 60,
              }}>
              {key}:
            </Typography>
            <Box
              component='input'
              type='number'
              value={ports[key]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPorts((prev) => ({ ...prev, [key]: Number(e.target.value) }))
              }
              sx={{
                width: 70,
                padding: '2px 6px',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                fontSize: '0.9rem',
                fontFamily: 'monospace',
                bgcolor: 'background.paper',
                color: 'text.primary',
              }}
            />
          </Box>
        ))}
        <Box
          component='button'
          onClick={handleSave}
          sx={{
            px: 2,
            py: 0.5,
            borderRadius: 1,
            border: 'none',
            bgcolor: saved ? 'success.main' : 'warning.main',
            color: saved ? 'success.contrastText' : 'warning.contrastText',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}>
          {saved ? '✓ Saved' : 'Save & Reload'}
        </Box>
      </Box>
    </Box>
  )
}

// コンテンツ最大幅 + 左右余白の共通定義
const CONTAINER_SX = {
  maxWidth: 1120,
  mx: 'auto',
  px: { xs: 2.5, sm: 3, md: 4 },
} as const

// Kaze 骨格 — section eyebrow (小さい uppercase ラベル、Plex Mono)
const EYEBROW_SX = {
  fontFamily: 'var(--kaze-font-mono)',
  fontSize: '0.86rem',
  fontWeight: 400,
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
  color: 'primary.textContrast',
  mb: 2,
} as const

// 大型見出し。本文と同じグロテスク系で、太さで階層を作る。
// 以前は可変明朝の SOFT/WONK 軸で字面を波打たせていたが、読みにくいうえ
// 装飾が意味を持っていなかったのでやめた
const DISPLAY_SX = {
  fontFamily: 'var(--kaze-font-display)',
  fontSize: { xs: '2.5rem', md: '3.6rem' },
  fontWeight: 700,
  letterSpacing: '-0.03em',
  lineHeight: 1.02,
  mb: 1.5,
} as const

// Kaze 骨格 — section sub-copy (日本語 / 英語 lead)
const SECTION_LEAD_SX = {
  fontFamily: 'var(--kaze-font-body)',
  fontSize: { xs: '0.9rem', md: '0.95rem' },
  fontWeight: 400,
  color: 'text.secondary',
  letterSpacing: '0.02em',
  lineHeight: 1.7,
  mb: 6,
} as const

// メインLPコンポーネント
export const LandingPage = () => {
  // 未設定なら null。ソース公開先への導線は既定で出さない
  const repositoryUrl = APP_LINKS.repository()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.96])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // TODO: useDevPorts() でポート検出し、未起動アプリをグレーアウト/バッジ表示する
  const products = [
    {
      title: 'Storybook',
      description:
        'コンポーネントカタログ・デザインガイド・AIチャットアシスタント',
      icon: <AutoStoriesIcon sx={{ color: 'primary.textContrast' }} />,
      href: APP_LINKS.storybook(),
      label: 'Documentation',
      // Storybook のテーマはツールバーの globals で持つため light のみ
      capture: { id: 'storybook', hasDark: false },
      techNote: 'Kaze DS の定義元。トークンと部品はここが単一ソース',
    },
    {
      title: 'SaaS Dashboard',
      description:
        'CRUD操作・データテーブル・カレンダー・マップ・フォームパターン',
      icon: <SpaceDashboardIcon sx={{ color: 'secondary.main' }} />,
      href: APP_LINKS.saas(),
      label: 'Product Demo',
      capture: { id: 'saas', hasDark: true },
      techNote: 'Kaze DS を workspace 参照で直接 import',
    },
    {
      title: 'KazeEats',
      description: 'レストラン検索・カート・注文フロー・レビュー・配達状況',
      icon: <RestaurantIcon sx={{ color: 'warning.main' }} />,
      href: APP_LINKS.kazeEats(),
      label: 'Product Demo',
      capture: { id: 'kaze-eats', hasDark: true },
      techNote: 'Kaze DS を workspace 参照で直接 import',
    },
    {
      title: 'KazeLogistics',
      description: '配送ルート最適化・物流拠点管理・距離/コスト計算・3Dマップ',
      icon: <LocalShippingIcon sx={{ color: 'info.main' }} />,
      href: APP_LINKS.skyKaze(),
      label: 'Product Demo',
      capture: { id: 'sky-kaze', hasDark: true },
      techNote: 'Kaze DS を workspace 参照で直接 import',
    },
    {
      title: 'kaze-ec',
      description: 'CtoC フリマサイト・出品検索・決済 × 暗号資産ウォレット',
      icon: <StorefrontIcon sx={{ color: 'success.main' }} />,
      // 他の 4 つと違い**別ホスト**にあるため APP_LINKS を通さない。
      // APP_LINKS.resolve は現在の origin からの相対で解決するので、
      // ここで使うと kaze-ux 側の 404 になる。
      // （リポジトリ URL が env 制御なのは個人へ辿れる導線を残さないためで、
      //   デモの公開ホストである以下は既存の公開パスと同じ扱いでよい）
      href: 'https://kaze-ec.vercel.app/',
      external: true,
      label: 'MCP Demo',
      capture: { id: 'kaze-ec', hasDark: true },
      techNote: 'kaze MCP 経由で作成。仕様↔実装のドリフトを CI で検査',
    },
  ]

  const features = [
    {
      number: '01',
      title: 'Design Tokens',
      desc: 'カラー・文字・余白・影を JSON で一元管理。テーマ変更が全体に反映されます',
    },
    {
      number: '02',
      title: 'Multi-Scheme Theme',
      desc: 'Light / Dark モードと複数カラースキームをワンクリックで切り替えられます',
    },
    {
      number: '03',
      title: 'AI-Powered Storybook',
      desc: '今見ているページについて AI に質問できます。使い方や設計意図をその場で確認',
    },
    {
      number: '04',
      title: 'Figma Plugin',
      desc: 'tokens.json を Figma に読み込むと Variables と Styles が自動で作られます',
    },
    {
      number: '05',
      title: 'Components',
      desc: 'ボタン・フォーム・テーブル・カレンダーなど、実務で使う UI を揃えています',
    },
    {
      number: '06',
      title: 'CLI Export',
      desc: 'コマンドひとつでテーマファイルからトークン JSON を書き出せます',
    },
  ]

  return (
    <Box
      ref={containerRef}
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        overflowX: 'hidden',
      }}>
      {/* ===== ヒーロー ===== */}
      <motion.div style={{ opacity: heroOpacity, scale: heroScale }}>
        <Box
          sx={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            py: 8,
          }}>
          <HeroBackground />

          <Box
            sx={{
              ...CONTAINER_SX,
              position: 'relative',
              zIndex: 1,
              maxWidth: 1120,
            }}>
            <Box sx={{ maxWidth: 900 }}>
              {/* ロゴ + ブランド */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0, 1] }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      // favicon と同じロックアップ。単色の正方形に白のシンボル。
                      // グラデーション・角丸・色付きの光彩はレギュレーションで排す
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <KazeLogo size={28} tone='inverse' title='' />
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: 'var(--kaze-font-mono)',
                      fontSize: '0.86rem',
                      fontWeight: 400,
                      letterSpacing: '0.24em',
                      textTransform: 'uppercase',
                      color: 'primary.textContrast',
                    }}>
                    Kaze Design System · v0
                  </Typography>
                </Box>
              </motion.div>

              {/* メインコピー */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.8,
                  delay: 0.15,
                  ease: [0.25, 0.1, 0, 1],
                }}>
                <Typography
                  sx={{
                    fontFamily: 'var(--kaze-font-display)',
                    fontSize: { xs: '3rem', sm: '4.5rem', md: '5.5rem' },
                    fontWeight: 700,
                    lineHeight: 0.98,
                    letterSpacing: '-0.035em',
                    mb: 2,
                  }}>
                  One System,
                  <br />
                  <Box
                    component='span'
                    sx={{
                      // 強調は色だけで作る。斜体と可変軸は使わない
                      color: 'primary.textContrast',
                    }}>
                    Infinite
                  </Box>{' '}
                  Interfaces.
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'var(--kaze-font-body)',
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    fontWeight: 400,
                    color: 'text.secondary',
                    letterSpacing: '0.02em',
                    lineHeight: 1.7,
                    mb: 3,
                  }}>
                  コンポーネント・トークン・テーマをひとつの基盤で管理
                </Typography>
              </motion.div>

              {/* サブコピー */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.8,
                  delay: 0.3,
                  ease: [0.25, 0.1, 0, 1],
                }}>
                <Typography
                  sx={{
                    fontFamily: 'var(--kaze-font-body)',
                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                    fontWeight: 400,
                    color: 'text.secondary',
                    letterSpacing: '0.02em',
                    lineHeight: 1.75,
                    maxWidth: 520,
                    mb: 5,
                  }}>
                  MUI + Tailwind CSS + Storybook で構築。
                  共通のトークンとコンポーネントから複数プロダクトを展開しています。
                </Typography>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.45 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box
                    component='a'
                    href={APP_LINKS.storybook()}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 3.5,
                      py: 1.5,
                      borderRadius: 2,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      transition: motionOf(
                        ['transform', 'box-shadow'],
                        'macro'
                      ),
                      boxShadow: (t) =>
                        `0 4px 20px ${alpha(t.palette.primary.main, 0.25)}`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: (t) =>
                          `0 8px 30px ${alpha(t.palette.primary.main, 0.35)}`,
                      },
                    }}>
                    <AutoStoriesIcon sx={{ fontSize: 18 }} />
                    Storybook
                  </Box>
                  {repositoryUrl && (
                    <Box
                      component='a'
                      href={repositoryUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 3.5,
                        py: 1.5,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: isDark
                          ? 'rgba(255,255,255,0.12)'
                          : 'rgba(0,0,0,0.12)',
                        color: 'text.primary',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        textDecoration: 'none',
                        transition: motionOf(
                          ['transform', 'box-shadow'],
                          'macro'
                        ),
                        '&:hover': {
                          borderColor: 'primary.main',
                          color: 'primary.textContrast',
                          transform: 'translateY(-2px)',
                        },
                      }}>
                      <GitHubIcon sx={{ fontSize: 18 }} />
                      GitHub
                    </Box>
                  )}
                </Box>
              </motion.div>
            </Box>
          </Box>
        </Box>
      </motion.div>

      {/* ===== プロダクト ===== */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ ...CONTAINER_SX }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}>
            <Typography sx={EYEBROW_SX}>Products</Typography>
            <Typography sx={DISPLAY_SX}>Built with Kaze</Typography>
            {/* 1 行が長いと目が戻れなくなるので、読み物の幅に制限する */}
            <Typography sx={{ ...SECTION_LEAD_SX, mb: 2, maxWidth: '62ch' }}>
              業種の違う 4
              プロダクトが、同じトークンと同じ部品定義で動いています。
              色・余白・文字・角丸はすべて Storybook が単一ソースで、変えれば
              全プロダクトに同時に反映されます。
            </Typography>
            <Typography sx={{ ...SECTION_LEAD_SX, mb: 4, maxWidth: '62ch' }}>
              取り込み方は 2 通りあります。workspace 参照で部品を直接 import
              するか（3 プロダクト）、別リポジトリから kaze MCP で仕様だけを
              引いて再生成するか（kaze-ec）。後者は仕様と実装のずれを CI
              で検査しています。
            </Typography>
          </motion.div>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              // カード内の各行（キャプチャ / アイコン / タイトル / 説明 /
              // techNote）を subgrid で継承させるため、行の高さは中身の最大に
              // 合わせる。これで説明文の行数が違ってもカード間で行頭が揃う。
              // 行数はカード側が実際の描画内容から算出するので、ここは
              // 「暗黙の行はすべて auto」とだけ言えばよい（本数を固定しない）
              gridAutoRows: 'auto',
              gap: 3,
            }}>
            {products.map((product, i) => (
              <ProductCard key={product.title} {...product} index={i} />
            ))}
          </Box>
        </Box>
      </Box>

      {/* セパレーター */}
      <BauhausDivider variant='a' />

      {/* ===== 特徴 ===== */}
      <Box sx={{ py: { xs: 10, md: 16 } }}>
        <Box sx={{ ...CONTAINER_SX }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 4, md: 10 },
            }}>
            <Box>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}>
                <Typography sx={EYEBROW_SX}>Architecture</Typography>
                <Typography sx={DISPLAY_SX}>Architecture</Typography>
                <Typography sx={{ ...SECTION_LEAD_SX, mb: 4 }}>
                  トークン・テーマ・AIチャットで構成する設計基盤
                </Typography>
              </motion.div>
            </Box>
            <Box>
              {features.map((f, i) => (
                <FeatureItem key={f.number} {...f} index={i} />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* セパレーター */}
      <BauhausDivider variant='b' flip />

      {/* ===== テックスタック ===== */}
      <Box sx={{ py: { xs: 8, md: 14 } }}>
        <Box sx={{ ...CONTAINER_SX }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}>
            <Typography sx={EYEBROW_SX}>Tech Stack</Typography>
            <Typography sx={DISPLAY_SX}>Tech Stack</Typography>
            <Typography sx={{ ...SECTION_LEAD_SX, mb: 4 }}>
              使用している技術とツール
            </Typography>
          </motion.div>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 2,
            }}>
            {[
              { label: 'React', desc: 'UI ライブラリ' },
              { label: 'MUI', desc: 'コンポーネントフレームワーク' },
              { label: 'Tailwind CSS', desc: 'ユーティリティ CSS' },
              { label: 'TypeScript', desc: '型安全' },
              { label: 'Storybook', desc: 'コンポーネントドキュメント' },
              { label: 'kaze MCP', desc: '設計知識を AI へ供給' },
              { label: 'Vite', desc: 'ビルドツール' },
              { label: 'Vitest', desc: 'テストフレームワーク' },
            ].map((tech, i) => (
              <motion.div
                key={tech.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: isDark
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(0,0,0,0.06)',
                    bgcolor: isDark
                      ? 'rgba(255,255,255,0.02)'
                      : 'rgba(255,255,255,0.5)',
                  }}>
                  <Typography
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      mb: 0.5,
                    }}>
                    {tech.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.9rem',
                      color: 'text.secondary',
                    }}>
                    {tech.desc}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Box>
      </Box>

      {/* セパレーター */}
      <BauhausDivider variant='c' />

      {/* ===== MCP Server ===== */}
      <Box sx={{ py: { xs: 8, md: 14 } }}>
        <Box sx={{ ...CONTAINER_SX }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}>
            <Typography sx={EYEBROW_SX}>MCP Server</Typography>
            <Typography sx={DISPLAY_SX}>AI に設計知識を配る</Typography>
            <Typography sx={{ ...SECTION_LEAD_SX, mb: 4 }}>
              トークン・部品仕様・禁止ルールを MCP
              で供給する。別のリポジトリでも AI が Kaze
              に準拠したコードを書けるようになる
            </Typography>
          </motion.div>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 3, md: 6 },
              alignItems: 'start',
            }}>
            {/* 導入 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, mb: 1.5 }}>
                Claude Code なら 2 コマンド
              </Typography>
              <Box
                component='pre'
                sx={{
                  m: 0,
                  p: 2.5,
                  borderRadius: 2,
                  overflowX: 'auto',
                  fontSize: '0.86rem',
                  lineHeight: 1.9,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  color: 'text.primary',
                  border: '1px solid',
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.12)'
                    : 'rgba(0,0,0,0.12)',
                  bgcolor: isDark
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(0,0,0,0.02)',
                }}>
                {'/plugin marketplace add BoxPistols/kaze-ux\n'}
                {'/plugin install kaze-design@kaze-ux'}
              </Box>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: 'text.secondary',
                  lineHeight: 1.9,
                  mt: 2,
                }}>
                MCP に加えて Skills・レビュー用の SubAgent・禁止パターンを止める
                Hook が一度に入る。Cursor などは
                <Box component='code' sx={{ mx: 0.5 }}>
                  .mcp.json
                </Box>
                に登録すれば MCP だけ使える
              </Typography>
            </motion.div>

            {/* 何が引けるか */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, mb: 1.5 }}>
                エージェントが引けるもの
              </Typography>
              <Box sx={{ display: 'grid', gap: 1.5 }}>
                {[
                  {
                    name: 'get_token',
                    desc: 'デザイントークンをドットパスで取得',
                  },
                  {
                    name: 'get_component',
                    desc: '部品の props・a11y・import 元',
                  },
                  {
                    name: 'check_rule',
                    desc: '書いたコードを禁止パターンに照合',
                  },
                  { name: 'search', desc: 'トークンと部品を横断検索' },
                ].map((tool) => (
                  <Box
                    key={tool.name}
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      alignItems: 'baseline',
                      flexWrap: 'wrap',
                    }}>
                    <Box
                      component='code'
                      sx={{
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        color: 'primary.main',
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, monospace',
                      }}>
                      {tool.name}
                    </Box>
                    <Typography
                      sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
                      {tool.desc}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box
                component='a'
                href={`${APP_LINKS.storybook()}?path=/story/guide-mcp-server--overview`}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  mt: 3,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: 'primary.main',
                  textDecoration: 'none',
                  transition: motionOf(['opacity'], 'macro'),
                  '&:hover': { opacity: 0.7 },
                }}>
                導入手順と仕組みを見る →
              </Box>
            </motion.div>
          </Box>
        </Box>
      </Box>

      {/* セパレーター */}
      <BauhausDivider variant='b' />

      {/* ===== 使い方 ===== */}
      <Box sx={{ py: { xs: 8, md: 14 } }}>
        <Box sx={{ ...CONTAINER_SX }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}>
            <Typography sx={EYEBROW_SX}>Getting Started</Typography>
            <Typography sx={DISPLAY_SX}>Getting Started</Typography>
            <Typography sx={{ ...SECTION_LEAD_SX, mb: 4 }}>
              3ステップではじめる
            </Typography>
          </motion.div>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 3,
            }}>
            {[
              {
                step: '01',
                title: 'Storybook を見る',
                desc: 'コンポーネントの見た目と使い方を Storybook で確認。AI チャットで質問もできます。',
                link: APP_LINKS.storybook(),
                linkLabel: 'Storybook を開く',
              },
              {
                step: '02',
                title: 'プロダクトを触る',
                desc: 'SaaS Dashboard や KazeEats で、同じコンポーネントが実際にどう使われているか体験。',
                link: APP_LINKS.saas(),
                linkLabel: 'SaaS Demo を開く',
              },
              {
                step: '03',
                title: 'コードを書く',
                desc: 'pnpm install して開発開始。CLAUDE.md を読めば AI エージェントも DS 準拠コードを生成できます。',
                link: repositoryUrl,
                linkLabel: repositoryUrl ? 'GitHub' : undefined,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}>
                <Box
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: isDark
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(0,0,0,0.06)',
                    bgcolor: isDark
                      ? 'rgba(255,255,255,0.02)'
                      : 'rgba(255,255,255,0.5)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                  <Typography
                    sx={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: 'primary.textContrast',
                      fontFamily: 'monospace',
                      mb: 1.5,
                    }}>
                    {item.step}
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700, mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '1rem',
                      color: 'text.secondary',
                      lineHeight: 1.8,
                      mb: 2,
                      flex: 1,
                    }}>
                    {item.desc}
                  </Typography>
                  {item.link && (
                    <Box
                      component='a'
                      href={item.link}
                      {...(item.link.startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      sx={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: 'primary.textContrast',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}>
                      {item.linkLabel} →
                    </Box>
                  )}
                </Box>
              </motion.div>
            ))}
          </Box>
        </Box>
      </Box>

      {/* セパレーター */}
      <BauhausDivider variant='a' flip />

      {/* ===== AI Chat 紹介 ===== */}
      <Box sx={{ py: { xs: 8, md: 14 } }}>
        <Box sx={{ ...CONTAINER_SX }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 4, md: 8 },
              alignItems: 'center',
            }}>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}>
              <Typography sx={EYEBROW_SX}>Storybook AI Chat</Typography>
              <Typography sx={DISPLAY_SX}>AI Concierge</Typography>
              <Typography
                sx={{
                  fontSize: '1rem',
                  color: 'text.secondary',
                  mb: 1,
                }}>
                各ページに常駐するAIアシスタント
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: 'text.secondary',
                  lineHeight: 1.8,
                  mb: 3,
                }}>
                Storybook の各ページに AI チャットを搭載。
                今見ているコンポーネントの使い方、設計意図、コード例をその場で質問できます。
                API キーがなくてもオフライン FAQ で基本的な質問に回答します。
              </Typography>
              <Box
                component='a'
                href={APP_LINKS.storybook()}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 3,
                  py: 1.25,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  transition: motionOf(['transform', 'box-shadow']),
                  '&:hover': {
                    boxShadow: (t) =>
                      `0 4px 16px ${alpha(t.palette.primary.main, 0.25)}`,
                  },
                }}>
                Storybook で試す
              </Box>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.06)',
                  bgcolor: isDark
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(255,255,255,0.5)',
                }}>
                {[
                  {
                    q: 'このコンポーネントは何？',
                    a: 'ページ文脈から自動で回答',
                  },
                  {
                    q: 'Figma でいうとどう作る？',
                    a: 'デザイナー向けに翻訳して説明',
                  },
                  { q: 'コード例を見せて', a: 'tsx のサンプルコードを生成' },
                  {
                    q: 'ダークモードの色は？',
                    a: 'テーマトークンから即座に回答',
                  },
                ].map((item) => (
                  <Box key={item.q} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
                    <Typography
                      sx={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: 'primary.textContrast',
                        mb: 0.5,
                      }}>
                      Q: {item.q}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.95rem',
                        color: 'text.secondary',
                      }}>
                      → {item.a}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </motion.div>
          </Box>
        </Box>
      </Box>

      {/* ===== 開発用ポート設定（DEV のみ表示） ===== */}
      {import.meta.env.DEV && <DevPortSettings />}

      {/* ===== フッター ===== */}
      <Box
        sx={{
          borderTop: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
        }}>
        <Box
          sx={{
            ...CONTAINER_SX,
            py: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <KazeLogo size={18} tone='outline' title='' />
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700 }}>
              Kaze Design System
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {[
              { label: 'Storybook', href: APP_LINKS.storybook() },
              { label: 'SaaS Demo', href: APP_LINKS.saas() },
              { label: 'KazeEats', href: APP_LINKS.kazeEats() },
              // 公開先が設定されている時だけ出す（既定は出さない）
              ...(repositoryUrl
                ? [{ label: 'Source', href: repositoryUrl }]
                : []),
            ].map((link) => (
              <Box
                key={link.label}
                component='a'
                href={link.href}
                {...(link.href.startsWith('http')
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                sx={{
                  fontSize: '0.9rem',
                  color: 'text.secondary',
                  textDecoration: 'none',
                  transition: motionOf(['color'], 'short'),
                  '&:hover': { color: 'primary.textContrast' },
                }}>
                {link.label}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
