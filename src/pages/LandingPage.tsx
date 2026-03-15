import AirIcon from '@mui/icons-material/Air'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import GitHubIcon from '@mui/icons-material/GitHub'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import { Box, Typography, useTheme } from '@mui/material'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { APP_LINKS } from '@/utils/appLinks'

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
            left: `${15 + (i * 11) % 70}%`,
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
          p: 4,
          borderRadius: 3,
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.35s cubic-bezier(0.25, 0.1, 0, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: isDark
              ? '0 20px 60px rgba(14,173,184,0.15)'
              : '0 20px 60px rgba(14,173,184,0.12)',
            borderColor: 'primary.main',
            '& .card-label': {
              opacity: 1,
              transform: 'translateX(0)',
            },
            '& .card-icon': {
              transform: 'scale(1.1)',
            },
          },
        }}>
        {/* ラベルバッジ */}
        <Box
          className='card-label'
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            opacity: 0,
            transform: 'translateX(8px)',
            transition: 'all 0.3s ease',
          }}>
          {label}
        </Box>

        <Box
          className='card-icon'
          sx={{
            mb: 3,
            transition: 'transform 0.35s ease',
            '& .MuiSvgIcon-root': { fontSize: 36 },
          }}>
          {icon}
        </Box>

        <Typography
          sx={{
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            mb: 1,
          }}>
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.875rem',
            color: 'text.secondary',
            lineHeight: 1.7,
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
      desc: 'カラー・タイポグラフィ・スペーシング・シャドウを W3C DTCG 形式で一元管理',
    },
    {
      number: '02',
      title: 'Multi-Scheme Theme',
      desc: 'Light / Dark + 複数カラースキーム対応。MUI v7 のテーマシステムで切替',
    },
    {
      number: '03',
      title: 'AI-Powered Storybook',
      desc: 'ページ文脈認識 AI チャットが、コンポーネントの用途と設計意図を対話で案内',
    },
    {
      number: '04',
      title: 'Figma Plugin',
      desc: 'デザイントークンを Figma Variables / Styles として直接インポート',
    },
    {
      number: '05',
      title: '60+ Components',
      desc: 'MUI v7 + Tailwind CSS で構築。アクセシビリティとレスポンシブ対応',
    },
    {
      number: '06',
      title: 'CLI Export',
      desc: 'MUI / Tailwind テーマから DTCG トークン JSON を自動生成',
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
            px: { xs: 3, md: 8, lg: 12 },
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
                  mb: 3,
                }}>
                Build with
                <br />
                <Box component='span' sx={{ color: 'primary.main' }}>
                  consistency
                </Box>
                ,
                <br />
                ship with
                <Box component='span' sx={{ color: 'primary.main' }}>
                  {' '}
                  confidence
                </Box>
                .
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
                  fontSize: { xs: '1rem', md: '1.15rem' },
                  color: 'text.secondary',
                  lineHeight: 1.8,
                  maxWidth: 600,
                  mb: 5,
                }}>
                MUI v7 + Tailwind CSS + Storybook v10
                で構築されたデザインシステム。
                以下のプロダクトはすべてこのコンポーネントを基に開発されています。
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
          px: { xs: 3, md: 8, lg: 12 },
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
            Products — Built with Kaze
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              mb: 6,
              maxWidth: 500,
            }}>
            コンポーネントから
            <br />
            プロダクトへ。
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

      {/* ===== 特徴 ===== */}
      <Box
        sx={{
          px: { xs: 3, md: 8, lg: 12 },
          py: { xs: 8, md: 12 },
          borderTop: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
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
                  fontSize: { xs: '1.8rem', md: '2.4rem' },
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  mb: 2,
                }}>
                設計の全体像。
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: 'text.secondary',
                  lineHeight: 1.8,
                  mb: 4,
                }}>
                デザイントークンからコンポーネント、テーマ、AI
                アシスタントまで。一貫した設計言語でプロダクト開発を支援します。
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

      {/* ===== フッター ===== */}
      <Box
        sx={{
          px: { xs: 3, md: 8, lg: 12 },
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
