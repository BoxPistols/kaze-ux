// ChatSupport リサイズフック

import { useState, useRef, useEffect, useCallback } from 'react'

interface WidgetSize {
  width: number
  height: number
}

// ---------------------------------------------------------------------------
// ウィジェットリサイズ
// ---------------------------------------------------------------------------

export const useWidgetResize = (
  initialSize: WidgetSize = { width: 400, height: 600 }
) => {
  const [widgetSize, setWidgetSize] = useState<WidgetSize>(initialSize)
  const cleanupRef = useRef<(() => void) | null>(null)

  // アンマウント時にアクティブなリスナーをクリーンアップ
  useEffect(() => {
    return () => {
      cleanupRef.current?.()
    }
  }, [])

  const handleResizeStart = useCallback(
    (direction: string) => (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // 前回のリスナーが残っていればクリーンアップ
      cleanupRef.current?.()

      const startX = e.clientX
      const startY = e.clientY
      const startW = widgetSize.width
      const startH = widgetSize.height

      const onMove = (ev: MouseEvent) => {
        const dx = startX - ev.clientX
        const dy = startY - ev.clientY
        setWidgetSize({
          width: direction.includes('left')
            ? Math.max(320, Math.min(800, startW + dx))
            : startW,
          height: direction.includes('top')
            ? Math.max(400, Math.min(900, startH + dy))
            : startH,
        })
      }

      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        cleanupRef.current = null
      }

      // クリーンアップ関数を登録
      cleanupRef.current = onUp

      document.body.style.cursor =
        direction === 'top-left'
          ? 'nw-resize'
          : direction === 'top'
            ? 'n-resize'
            : 'ew-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [widgetSize]
  )

  return { widgetSize, setWidgetSize, handleResizeStart }
}

// ---------------------------------------------------------------------------
// サイドバーリサイズ
// ---------------------------------------------------------------------------

export const useSidebarResize = (
  sidebarWidth: number,
  onWidthChange: (width: number) => void
) => {
  const cleanupRef = useRef<(() => void) | null>(null)

  // アンマウント時にアクティブなリスナーをクリーンアップ
  useEffect(() => {
    return () => {
      cleanupRef.current?.()
    }
  }, [])

  const handleSidebarResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()

      // 前回のリスナーが残っていればクリーンアップ
      cleanupRef.current?.()

      const startX = e.clientX
      const startW = sidebarWidth || 400

      const onMove = (ev: MouseEvent) => {
        const dx = startX - ev.clientX
        const newWidth = Math.max(320, Math.min(800, startW + dx))
        onWidthChange(newWidth)
      }

      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        cleanupRef.current = null
      }

      // クリーンアップ関数を登録
      cleanupRef.current = onUp

      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [sidebarWidth, onWidthChange]
  )

  return { handleSidebarResize }
}
