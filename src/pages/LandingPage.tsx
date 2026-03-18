import AirIcon from '@mui/icons-material/Air'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import GitHubIcon from '@mui/icons-material/GitHub'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import { Box, Typography, useTheme } from '@mui/material'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import {
  APP_LINKS,
  DEFAULT_PORTS,
  getDevPorts,
  saveDevPorts,
} from '@/utils/appLinks'
import type { DevPorts } from '@/utils/appLinks'

// ヒーロー背景 — グラデーションオーブ + グリッドライン + パーティクル
const HeroBackground = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const teal = isDark ? 'rgba(14,173,184,' : 'rgba(14,173,184,'
  const teal2 = isDark ? 'rgba(10,138,148,' : 'rgba(60,192,200,'

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
          background: `radial-gradient(circle, ${teal}${isDark ? '0.18' : '0.12'}) 0%, ${teal}${isDark ? '0.06' : '0.04'}) 40%, transparent 70%)`,
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
          background: `radial-gradient(circle, ${teal2}${isDark ? '0.12' : '0.08'}) 0%, transparent 65%)`,
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
          background: `radial-gradient(circle, ${teal}${isDark ? '0.08' : '0.05'}) 0%, transparent 60%)`,
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
            linear-gradient(${teal}0.3) 1px, transparent 1px),
            linear-gradient(90deg, ${teal}0.3) 1px, transparent 1px)
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
            bgcolor: `${teal}${isDark ? '0.4' : '0.3'})`,
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
          border: `1px solid ${teal}${isDark ? '0.1' : '0.08'})`,
          animation: 'ringRotate 30s linear infinite',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -1,
            left: '50%',
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: `${teal}${isDark ? '0.5' : '0.4'})`,
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
          border: `1px dashed ${teal}${isDark ? '0.06' : '0.05'})`,
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
}

// インタラクティブなプロダクトカード
const ProductCard = ({
  title,
  description,
  icon,
  href,
  label,
  index,
}: ProductCardProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.25, 0.1, 0, 1],
      }}>
      <Box
        component='a'
        href={href}
        sx={{
          display: 'block',
          textDecoration: 'none',
          color: 'inherit',
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: isDark
              ? '0 12px 40px rgba(14,173,184,0.15)'
              : '0 12px 40px rgba(14,173,184,0.12)',
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
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            opacity: 1,
          }}>
          {label}
        </Box>

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
            fontSize: '0.875rem',
            color: 'text.secondary',
            lineHeight: 1.8,
          }}>
          {description}
        </Typography>
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
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', mb: 4 }}>
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'primary.main',
            fontFamily: 'monospace',
            pt: 0.3,
            flexShrink: 0,
            letterSpacing: '0.05em',
          }}>
          {number}
        </Typography>
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              mb: 0.5,
              letterSpacing: '-0.01em',
            }}>
            {title}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: 'text.secondary',
              lineHeight: 1.7,
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
  const teal = isDark ? 'rgba(14,173,184,' : 'rgba(14,173,184,'
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const x1 = useTransform(scrollYProgress, [0, 1], [flip ? 60 : -60, flip ? -20 : 20])
  const x2 = useTransform(scrollYProgress, [0, 1], [flip ? -40 : 40, flip ? 20 : -20])

  const shapes: Record<string, React.ReactNode> = {
    a: (
      <>
        <motion.div style={{ x: x1 }}>
          <Box
            sx={{
              width: { xs: 120, md: 200 },
              height: { xs: 120, md: 200 },
              border: `2px solid ${teal}${isDark ? '0.12' : '0.08'})`,
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
              bgcolor: `${teal}${isDark ? '0.06' : '0.04'})`,
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
            bgcolor: `${teal}${isDark ? '0.1' : '0.06'})`,
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
              bgcolor: `${teal}${isDark ? '0.04' : '0.03'})`,
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
              border: `2px solid ${teal}${isDark ? '0.1' : '0.06'})`,
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
              bgcolor: `${teal}${isDark ? '0.08' : '0.05'})`,
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
            bgcolor: `${teal}${isDark ? '0.15' : '0.1'})`,
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
              border: `1.5px solid ${teal}${isDark ? '0.08' : '0.05'})`,
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
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'warning.main',
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
                fontSize: '0.75rem',
                color: 'text.secondary',
                minWidth: 60,
              }}>
              {key}:
            </Typography>
            <input
              type='number'
              value={ports[key]}
              onChange={(e) =>
                setPorts((prev) => ({ ...prev, [key]: Number(e.target.value) }))
              }
              style={{
                width: 70,
                padding: '2px 6px',
                border: '1px solid #ccc',
                borderRadius: 4,
                fontSize: '0.75rem',
                fontFamily: 'monospace',
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
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 600,
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

// メインLPコンポーネント
export const LandingPage = () => {
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

  const products = [
    {
      title: 'Storybook',
      description:
        'コンポーネントカタログ・デザインガイド・AIチャットアシスタント',
      icon: <AutoStoriesIcon sx={{ color: 'primary.main' }} />,
      href: APP_LINKS.storybook(),
      label: 'Documentation',
    },
    {
      title: 'SaaS Dashboard',
      description:
        'CRUD操作・データテーブル・カレンダー・マップ・フォームパターン',
      icon: <SpaceDashboardIcon sx={{ color: 'secondary.main' }} />,
      href: APP_LINKS.saas(),
      label: 'Product Demo',
    },
    {
      title: 'KazeEats',
      description: 'レストラン検索・カート・注文フロー・レビューシステム',
      icon: <RestaurantIcon sx={{ color: 'warning.main' }} />,
      href: APP_LINKS.ubereats(),
      label: 'Product Demo',
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
            ...CONTAINER_SX,
            py: 8,
          }}>
          <HeroBackground />

          <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 900 }}>
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
                    borderRadius: 3,
                    background:
                      'linear-gradient(135deg, #0EADB8 0%, #0A8A94 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(14,173,184,0.3)',
                  }}>
                  <AirIcon sx={{ color: '#fff', fontSize: 28 }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'primary.main',
                  }}>
                  Kaze Design System
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
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.2rem' },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: '-0.04em',
                  mb: 2,
                }}>
                One System,
                <br />
                <Box component='span' sx={{ color: 'primary.main' }}>
                  Infinite
                </Box>
                {' '}Interfaces
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '0.85rem', md: '0.95rem' },
                  color: 'text.secondary',
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
                  fontSize: { xs: '0.95rem', md: '1.05rem' },
                  color: 'text.secondary',
                  lineHeight: 1.8,
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
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(14,173,184,0.25)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 30px rgba(14,173,184,0.35)',
                    },
                  }}>
                  <AutoStoriesIcon sx={{ fontSize: 18 }} />
                  Storybook
                </Box>
                <Box
                  component='a'
                  href={APP_LINKS.github()}
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
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      transform: 'translateY(-2px)',
                    },
                  }}>
                  <GitHubIcon sx={{ fontSize: 18 }} />
                  GitHub
                </Box>
              </Box>
            </motion.div>
          </Box>
        </Box>
      </motion.div>

      {/* ===== プロダクト ===== */}
      <Box
        sx={{
          ...CONTAINER_SX,
          py: { xs: 8, md: 12 },
        }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}>
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'primary.main',
              mb: 2,
            }}>
            Products
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '2rem', md: '2.8rem' },
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              mb: 1.5,
            }}>
            Built with Kaze
          </Typography>
          <Typography
            sx={{
              fontSize: '0.9rem',
              color: 'text.secondary',
              mb: 6,
            }}>
            同じコンポーネント基盤で構築したプロダクト
          </Typography>
        </motion.div>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
          }}>
          {products.map((product, i) => (
            <ProductCard key={product.title} {...product} index={i} />
          ))}
        </Box>
      </Box>

      {/* セパレーター */}
      <BauhausDivider variant='a' />

      {/* ===== 特徴 ===== */}
      <Box
        sx={{
          ...CONTAINER_SX,
          py: { xs: 10, md: 16 },
        }}>
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
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'primary.main',
                  mb: 2,
                }}>
                Architecture
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '2rem', md: '2.8rem' },
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.1,
                  mb: 1.5,
                }}>
                Architecture
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: 'text.secondary',
                  lineHeight: 1.8,
                  mb: 4,
                }}>
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

      {/* セパレーター */}
      <BauhausDivider variant='b' flip />

      {/* ===== テックスタック ===== */}
      <Box
        sx={{
          ...CONTAINER_SX,
          py: { xs: 8, md: 14 },
        }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}>
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'primary.main',
              mb: 2,
            }}>
            Tech Stack
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '2rem', md: '2.8rem' },
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              mb: 1.5,
            }}>
            Tech Stack
          </Typography>
          <Typography
            sx={{
              fontSize: '0.9rem',
              color: 'text.secondary',
              mb: 4,
            }}>
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
            { label: 'Vite', desc: 'ビルドツール' },
            { label: 'Vitest', desc: 'テストフレームワーク' },
            { label: 'pnpm', desc: 'パッケージマネージャ' },
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
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    mb: 0.5,
                  }}>
                  {tech.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                  }}>
                  {tech.desc}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Box>

      {/* セパレーター */}
      <BauhausDivider variant='c' />

      {/* ===== 使い方 ===== */}
      <Box
        sx={{
          ...CONTAINER_SX,
          py: { xs: 8, md: 14 },
        }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}>
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'primary.main',
              mb: 2,
            }}>
            Getting Started
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '2rem', md: '2.8rem' },
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              mb: 1.5,
            }}>
            Getting Started
          </Typography>
          <Typography
            sx={{
              fontSize: '0.9rem',
              color: 'text.secondary',
              mb: 4,
            }}>
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
              link: APP_LINKS.github(),
              linkLabel: 'GitHub',
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
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'primary.main',
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
                    fontSize: '0.85rem',
                    color: 'text.secondary',
                    lineHeight: 1.8,
                    mb: 2,
                    flex: 1,
                  }}>
                  {item.desc}
                </Typography>
                <Box
                  component='a'
                  href={item.link}
                  {...(item.link.startsWith('http')
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  sx={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}>
                  {item.linkLabel} →
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Box>

      {/* セパレーター */}
      <BauhausDivider variant='a' flip />

      {/* ===== AI Chat 紹介 ===== */}
      <Box
        sx={{
          ...CONTAINER_SX,
          py: { xs: 8, md: 14 },
        }}>
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
            <Typography
              sx={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'primary.main',
                mb: 2,
              }}>
              Storybook AI Chat
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '2rem', md: '2.8rem' },
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                mb: 1.5,
              }}>
              AI Concierge
            </Typography>
            <Typography
              sx={{
                fontSize: '0.85rem',
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
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem',
                textDecoration: 'none',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(14,173,184,0.25)',
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
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'primary.main',
                      mb: 0.5,
                    }}>
                    Q: {item.q}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
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

      {/* ===== 開発用ポート設定（DEV のみ表示） ===== */}
      {import.meta.env.DEV && <DevPortSettings />}

      {/* ===== フッター ===== */}
      <Box
        sx={{
          ...CONTAINER_SX,
          py: 4,
          borderTop: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AirIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
            Kaze Design System
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {[
            { label: 'Storybook', href: APP_LINKS.storybook() },
            { label: 'SaaS Demo', href: APP_LINKS.saas() },
            { label: 'KazeEats', href: APP_LINKS.ubereats() },
            { label: 'GitHub', href: APP_LINKS.github() },
          ].map((link) => (
            <Box
              key={link.label}
              component='a'
              href={link.href}
              {...(link.href.startsWith('http')
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              sx={{
                fontSize: '0.75rem',
                color: 'text.secondary',
                textDecoration: 'none',
                transition: 'color 0.2s',
                '&:hover': { color: 'primary.main' },
              }}>
              {link.label}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
