/**
 * ResizableDivider Component
 *
 * A draggable divider for resizing adjacent panels
 * Supports both vertical and horizontal orientations
 * Includes visual feedback and accessibility features
 */

import { Box, useTheme, alpha } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'

/**
 * ドラッグインジケーター - ドット（・）の表示
 */
const DragIndicator = ({
  isVertical,
  isDragging,
}: {
  isVertical: boolean
  isDragging: boolean
}) => {
  const theme = useTheme()
  const dotColor = isDragging
    ? theme.palette.primary.main
    : alpha(theme.palette.primary.main, 0.6)

  return isVertical ? (
    // 垂直ドラッグインジケーター（上下の点）
    <Box
      sx={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        pointerEvents: 'none',
      }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 3,
            height: 3,
            borderRadius: '50%',
            bgcolor: dotColor,
            transition: isDragging ? 'none' : 'background-color 0.2s ease',
          }}
        />
      ))}
    </Box>
  ) : (
    // 水平ドラッグインジケーター（左右の点）
    <Box
      sx={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'row',
        gap: 0.5,
        pointerEvents: 'none',
      }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 3,
            height: 3,
            borderRadius: '50%',
            bgcolor: dotColor,
            transition: isDragging ? 'none' : 'background-color 0.2s ease',
          }}
        />
      ))}
    </Box>
  )
}

export interface ResizableDividerProps {
  /**
   * Callback when resize drag occurs
   * @param delta - The change in pixels (positive = expand, negative = collapse)
   */
  onResize: (delta: number) => void

  /**
   * Divider orientation
   * @default 'vertical'
   */
  orientation?: 'vertical' | 'horizontal'

  /**
   * Custom style overrides
   */
  sx?: React.CSSProperties | Record<string, unknown>
}

/**
 * ResizableDivider - A draggable divider for panel resizing
 *
 * Usage:
 * ```tsx
 * <ResizableDivider
 *   onResize={(delta) => setSidePanelWidth(prev => prev + delta)}
 *   orientation='vertical'
 * />
 * ```
 */
export const ResizableDivider = React.forwardRef<
  HTMLDivElement,
  ResizableDividerProps
>(({ onResize, orientation = 'vertical', sx }, ref) => {
  const theme = useTheme()
  const [isDragging, setIsDragging] = useState(false)
  const startPositionRef = useRef(0)

  // Handle mouse down to start dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)

    if (orientation === 'vertical') {
      startPositionRef.current = e.clientX
    } else {
      startPositionRef.current = e.clientY
    }

    // Set cursor and prevent selection during drag
    document.body.style.cursor =
      orientation === 'vertical' ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'
  }

  // Handle mouse move and mouse up
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      let delta = 0

      if (orientation === 'vertical') {
        delta = startPositionRef.current - e.clientX
        startPositionRef.current = e.clientX
      } else {
        delta = startPositionRef.current - e.clientY
        startPositionRef.current = e.clientY
      }

      onResize(delta)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.body.style.cursor = 'auto'
      document.body.style.userSelect = 'auto'
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, orientation, onResize])

  // Determine dimensions based on orientation
  const dividerStyles = {
    vertical: {
      width: 8,
      height: '100%',
      cursor: 'col-resize',
    },
    horizontal: {
      width: '100%',
      height: 8,
      cursor: 'row-resize',
    },
  }

  const style = dividerStyles[orientation]

  return (
    <Box
      ref={ref}
      onMouseDown={handleMouseDown}
      role='separator'
      aria-orientation={orientation}
      aria-label={
        orientation === 'vertical'
          ? 'サイドパネル幅調整ハンドル'
          : 'パネル高さ調整ハンドル'
      }
      sx={{
        ...style,
        position: 'relative',
        zIndex: 10,
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: isDragging
          ? alpha(theme.palette.primary.main, 0.3)
          : 'transparent',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.25),
        },
        transition: isDragging ? 'none' : 'background-color 0.2s ease',
        flexShrink: 0,
        ...sx,
      }}>
      {/* Visual separator line - always visible */}
      <Box
        sx={{
          position: 'absolute',
          ...(orientation === 'vertical'
            ? {
                width: 1,
                height: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
              }
            : {
                height: 1,
                width: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
              }),
          bgcolor: theme.palette.divider,
          opacity: isDragging ? 0 : 1, // Drag時はハイライト色が出るのでラインは隠す（好みで調整）
          transition: 'opacity 0.2s',
        }}
      />
      <DragIndicator
        isVertical={orientation === 'vertical'}
        isDragging={isDragging}
      />
    </Box>
  )
})

ResizableDivider.displayName = 'ResizableDivider'

export default ResizableDivider
