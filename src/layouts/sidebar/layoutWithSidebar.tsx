import { Box, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

import { ThemeToggle } from '@/components/ui/themeToggle'
import type { ContainerMaxWidthVariant } from '@/themes/breakpoints'

import {
  MAIN_ELEMENT_PADDING_BOTTOM_SPACING,
  MAIN_ELEMENT_PADDING_TOP_SPACING,
} from './constants'
import { Sidebar, type SidebarProps } from './sidebar'
import { useSidebar } from './sidebarContext'

/**
 * サイドバー付きレイアウトコンポーネントのProps型定義
 *
 * @example
 * ```tsx
 * // 標準レイアウト（最大幅1280px、左寄せ）
 * <LayoutWithSidebar
 *   availablePaths={['/dashboard', /^\/project\/\d+$/]}
 *   fullWidthPaths={['/map']}
 *   sidebarExcludedPaths={[]}
 *   maxWidth="standard"
 *   menuItems={menuItems}
 *   accountMenu={accountMenu}
 *   appName="Operation"
 *   defaultUrl="/dashboard"
 * >
 *   {children}
 * </LayoutWithSidebar>
 *
 * // 狭いレイアウト（最大幅960px、中央寄せ）
 * <LayoutWithSidebar
 *   availablePaths={['/form']}
 *   fullWidthPaths={[]}
 *   sidebarExcludedPaths={[]}
 *   maxWidth="narrow"
 *   centerContent
 *   menuItems={menuItems}
 *   accountMenu={accountMenu}
 *   appName="System"
 *   defaultUrl="/form"
 * >
 *   {children}
 * </LayoutWithSidebar>
 * ```
 */
export type LayoutWithSidebarProps = {
  /**
   * 全てのパス一覧
   * 例: ['/dashboard', '/new-page', /^\/project\/new$/]
   */
  availablePaths: (string | RegExp)[]
  /**
   * 全幅表示を行うページのパス一覧
   * 例: ['/dashboard', '/new-page', /^\/project\/new$/]
   */
  fullWidthPaths: (string | RegExp)[]
  /**
   * サイドバーを表示しないページのパス一覧
   * 例: ['/project/new', '/^\/project\/new$/',]
   */
  sidebarExcludedPaths: (string | RegExp)[]
  /**
   * サイドバーを自動的に閉じるページのパス一覧
   * 例: ['/utm', '/map']
   */
  sidebarCollapsedPaths?: (string | RegExp)[]
  /**
   * メインコンテンツエリアの最大幅
   * - 'standard': 1280px（デフォルト、1366と1920の両環境で快適）
   * - 'narrow': 960px（フォーム、記事など、読みやすさ重視）
   * - 'wide': 1600px（ダッシュボード、テーブルなど、desktop環境で最適）
   * - 'full': 全幅（マップ、フルスクリーンなど）
   * - number: カスタム幅（px）
   * - string: カスタム幅（CSS値）
   */
  maxWidth?: ContainerMaxWidthVariant | number | string
  /**
   * メインコンテンツを中央寄せにするかどうか
   * @default false
   */
  centerContent?: boolean
  /** メインコンテンツ */
  children: React.ReactNode
} & Required<
  Pick<SidebarProps, 'accountMenu' | 'menuItems' | 'appName' | 'defaultUrl'>
>

export const LayoutWithSidebar = ({
  children,
  availablePaths,
  fullWidthPaths,
  sidebarExcludedPaths,
  sidebarCollapsedPaths = [],
  maxWidth = 'standard',
  centerContent = false,
  ...sidebarProps
}: LayoutWithSidebarProps) => {
  // Context APIからサイドバーの状態を取得
  const { isSidebarOpen, setSidebarOpen, toggleSidebar, sidebarWidth } =
    useSidebar()

  // テーマとレスポンシブ判定
  const theme = useTheme()
  const tabletBreakpoint = theme.breakpoints.values.md || 768
  const laptopBreakpoint = theme.breakpoints.values.lg || 1366
  const desktopBreakpoint = theme.breakpoints.values.xl || 1920
  // SSR時はデスクトップをデフォルトと仮定
  const isMobile = useMediaQuery(`(max-width:${tabletBreakpoint - 1}px)`, {
    defaultMatches: false,
  })
  const isLaptop = useMediaQuery(
    `(min-width:${laptopBreakpoint}px) and (max-width:${desktopBreakpoint - 1}px)`,
    { defaultMatches: false }
  )

  // 現在のパスを取得
  const location = useLocation()
  const pathname = location.pathname || '/'

  // 存在するパスか判定（パス自動判定）
  const isValidPath = availablePaths.some((pattern) =>
    typeof pattern === 'string' ? pattern === pathname : pattern.test(pathname)
  )

  // サイドバー表示の判定（パス自動判定）
  const shouldApplySidebar = !sidebarExcludedPaths.some((pattern) =>
    typeof pattern === 'string' ? pattern === pathname : pattern.test(pathname)
  )

  // 全幅表示の判定（パス自動判定）
  const shouldUseFullWidth = fullWidthPaths.some((pattern) =>
    typeof pattern === 'string' ? pattern === pathname : pattern.test(pathname)
  )

  // サイドバー自動折りたたみの判定
  const shouldCollapseSidebar = sidebarCollapsedPaths.some((pattern) =>
    typeof pattern === 'string' ? pattern === pathname : pattern.test(pathname)
  )

  // 前回のパスを記憶
  const prevPathRef = useRef(pathname)

  // サイドバー自動折りたたみ（パス遷移時のみ）
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      if (shouldCollapseSidebar && isSidebarOpen) {
        setSidebarOpen(false)
      }
      prevPathRef.current = pathname
    }
  }, [pathname, shouldCollapseSidebar, isSidebarOpen, setSidebarOpen])

  // Map系画面の判定（テーマ切り替えボタンを非表示にする）
  const isMapPage = shouldUseFullWidth

  // サイドバーを閉じる（メニューアイテムクリック時は呼ばれないようにする）
  const handleSidebarClose = () => {
    // 何もしない（メニューアイテムクリック時にサイドバーを閉じないため）
  }

  // maxWidthの値を解決する
  const resolveMaxWidth = (): string | number => {
    if (typeof maxWidth === 'number') {
      return `${maxWidth}px`
    }
    if (typeof maxWidth === 'string' && maxWidth !== 'full') {
      const widthVariant = maxWidth as ContainerMaxWidthVariant
      const variantValue = theme.layout?.containerMaxWidth[widthVariant]
      return typeof variantValue === 'number'
        ? `${variantValue}px`
        : variantValue
    }
    return maxWidth === 'full' ? '100%' : '100%'
  }

  // 共通のメインコンテンツスタイル
  const getMainContentStyles = () => {
    if (!isValidPath || shouldUseFullWidth) {
      // 全幅表示（sidebar不要ページ、Mapページなど）
      // サイドバーが表示されている場合はmarginLeftを設定してオーバーラップを防ぐ
      const hasVisibleSidebar = isValidPath && shouldApplySidebar
      return {
        marginLeft: hasVisibleSidebar ? `${sidebarWidth}px` : undefined,
        width: hasVisibleSidebar ? `calc(100% - ${sidebarWidth}px)` : '100%',
        height: '100vh',
        position: 'relative' as const,
        transition: 'margin-left 0.3s ease, width 0.3s ease',
      }
    }

    // モバイル/タブレットレイアウト（サイドバーが表示されている場合はmarginLeftを設定）
    if (isMobile) {
      const mobileMargin = shouldApplySidebar ? sidebarWidth + 8 : 0
      return {
        marginLeft: mobileMargin > 0 ? `${mobileMargin}px` : undefined,
        width: mobileMargin > 0 ? `calc(100% - ${mobileMargin}px)` : '100%',
        minHeight: '100vh',
        height: 'auto',
        overflow: 'auto',
        padding: 2,
        paddingTop: MAIN_ELEMENT_PADDING_TOP_SPACING,
        paddingBottom: MAIN_ELEMENT_PADDING_BOTTOM_SPACING,
        transition: 'margin-left 0.3s ease, width 0.3s ease',
      }
    }

    // 通常レイアウト（サイドバー考慮）
    const resolvedMaxWidth = resolveMaxWidth()

    // 環境別のマージンとパディング
    const sideMargin = isLaptop ? 16 : 24
    const contentPadding = isLaptop ? 2 : 3

    return {
      marginLeft: `${sidebarWidth + sideMargin}px`,
      width: `calc(100% - ${sidebarWidth + sideMargin}px)`,
      minHeight: '100vh',
      height: 'auto',
      overflow: 'auto',
      padding: contentPadding,
      paddingTop: MAIN_ELEMENT_PADDING_TOP_SPACING,
      paddingBottom: MAIN_ELEMENT_PADDING_BOTTOM_SPACING,
      transition: 'margin-left 0.3s ease, width 0.3s ease',
      ...(resolvedMaxWidth !== '100%' && {
        maxWidth: resolvedMaxWidth,
        ...(centerContent && {
          marginLeft: 'auto',
          marginRight: 'auto',
        }),
      }),
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* サイドバーコンポーネント（固定位置） */}
      {isValidPath && shouldApplySidebar && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 10,
            height: '100vh',
          }}>
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={handleSidebarClose}
            onToggle={toggleSidebar}
            pathname={pathname}
            {...sidebarProps}
          />
        </Box>
      )}

      {/* テーマ切り替えボタン（右上に固定表示、Map系画面では非表示） */}
      {!isMapPage && <ThemeToggle />}

      {/* メインコンテンツエリア */}
      <Box component='main' sx={getMainContentStyles()}>
        {children}
      </Box>
    </Box>
  )
}
