/**
 * CoordinateDisplay Component
 * クリック位置の座標を10進数とDMS形式で表示するパネル
 *
 * Adapted from DIDinJapan2026
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { formatCoordinates, formatCoordinatesDMS } from '../../lib/utils/geo'
import styles from './CoordinateDisplay.module.scss'

/**
 * Displays coordinates in both decimal and DMS (degree/minute/second) formats
 * Useful for NOTAM applications and general navigation
 */
export const CoordinateDisplay = ({
  lng,
  lat,
  darkMode,
  onClose,
  screenX,
  screenY,
  autoFade = true,
  preferredFormat = 'dms',
}) => {
  const [showModal, setShowModal] = useState(true)
  const panelRef = useRef(null)
  const autoCloseTimerRef = useRef(null)
  const [autoCloseEnabled, setAutoCloseEnabled] = useState(autoFade)
  const [pos, setPos] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragOffsetRef = useRef(null)
  const [arrowDir, setArrowDir] = useState('none')

  // 座標が変わったらposをリセット（新しいクリック位置に再配置）
  const prevCoordsRef = useRef(null)
  useEffect(() => {
    const prevCoords = prevCoordsRef.current
    if (
      prevCoords &&
      (prevCoords.lng !== lng ||
        prevCoords.lat !== lat ||
        prevCoords.screenX !== screenX ||
        prevCoords.screenY !== screenY)
    ) {
      setPos(null) // リセットして再配置をトリガー
    }
    prevCoordsRef.current = { lng, lat, screenX, screenY }
  }, [lng, lat, screenX, screenY])

  const clearAutoCloseTimer = useCallback(() => {
    if (autoCloseTimerRef.current !== null) {
      window.clearTimeout(autoCloseTimerRef.current)
      autoCloseTimerRef.current = null
    }
  }, [])

  const disableAutoClose = useCallback(() => {
    setAutoCloseEnabled(false)
  }, [])

  useEffect(() => {
    if (!autoCloseEnabled) {
      clearAutoCloseTimer()
      return
    }
    clearAutoCloseTimer()
    // Auto-close after 3 seconds
    autoCloseTimerRef.current = window.setTimeout(() => {
      setShowModal(false)
      onClose?.()
    }, 3000)
    return () => clearAutoCloseTimer()
  }, [autoCloseEnabled, clearAutoCloseTimer, onClose, lng, lat])

  const decimalFormat = useMemo(() => formatCoordinates(lng, lat), [lng, lat])
  const dmsFormat = useMemo(() => formatCoordinatesDMS(lng, lat), [lng, lat])

  // 初回表示時にクリック位置付近へ配置
  useEffect(() => {
    if (pos) return
    const el = panelRef.current
    if (!el) return

    const place = () => {
      const rect = el.getBoundingClientRect()
      const margin = 16
      const arrowSize = 10

      if (screenX !== undefined && screenY !== undefined) {
        const panelWidth = rect.width || 280
        const panelHeight = rect.height || 180

        let left = screenX + arrowSize + 12
        let top = screenY - panelHeight / 2
        let dir = 'left'

        if (left + panelWidth > window.innerWidth - margin) {
          left = screenX - panelWidth - arrowSize - 12
          dir = 'right'
        }

        if (left < margin) {
          left = Math.max(margin, screenX - panelWidth / 2)
          top = screenY + arrowSize + 12
          dir = 'top'
        }

        if (top < margin) {
          top = margin
        } else if (top + panelHeight > window.innerHeight - margin) {
          top = window.innerHeight - panelHeight - margin
        }

        setArrowDir(dir)
        setPos({ left, top })
      } else {
        const left = Math.max(margin, window.innerWidth - rect.width - margin)
        const top = Math.max(margin, window.innerHeight - rect.height - margin)
        setArrowDir('none')
        setPos({ left, top })
      }
    }

    const raf = window.requestAnimationFrame(place)
    return () => window.cancelAnimationFrame(raf)
  }, [pos, screenX, screenY])

  // ドラッグ中の移動
  useEffect(() => {
    if (!isDragging) return

    const onMove = (e) => {
      const el = panelRef.current
      const off = dragOffsetRef.current
      if (!el || !off) return

      const rect = el.getBoundingClientRect()
      const margin = 8
      const nextLeft = e.clientX - off.dx
      const nextTop = e.clientY - off.dy

      const clampedLeft = Math.min(
        Math.max(margin, nextLeft),
        Math.max(margin, window.innerWidth - rect.width - margin)
      )
      const clampedTop = Math.min(
        Math.max(margin, nextTop),
        Math.max(margin, window.innerHeight - rect.height - margin)
      )

      setPos({ left: clampedLeft, top: clampedTop })
    }

    const onUp = () => {
      dragOffsetRef.current = null
      setIsDragging(false)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp, { once: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [isDragging])

  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text)
  }, [])

  const handleClose = useCallback(() => {
    setShowModal(false)
    onClose?.()
  }, [onClose])

  const handleDragStart = useCallback(
    (e) => {
      disableAutoClose()
      const el = panelRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      dragOffsetRef.current = {
        dx: e.clientX - rect.left,
        dy: e.clientY - rect.top,
      }
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        // ignore
      }
      setIsDragging(true)
    },
    [disableAutoClose]
  )

  if (!showModal) {
    return null
  }

  return (
    <div
      ref={panelRef}
      className={`${styles.container} ${darkMode ? styles.dark : styles.light}`}
      style={
        pos
          ? { left: `${pos.left}px`, top: `${pos.top}px` }
          : { bottom: '20px', right: '20px' }
      }>
      {/* Arrow pointing to click position */}
      {arrowDir !== 'none' && (
        <div className={`${styles.arrow} ${styles[arrowDir]}`} />
      )}

      {/* Drag handle */}
      <div
        className={styles.header}
        onPointerDown={handleDragStart}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
        <div className={styles.title}>座標情報</div>
        <div className={styles.dragHint}>Drag</div>
      </div>

      <div className={styles.content}>
        {/* Primary format (based on preference) */}
        <div className={styles.formatSection}>
          <div className={styles.formatLabel}>
            <span className={styles.formatLabelBold}>
              {preferredFormat === 'dms' ? '度分秒表記 / 60進数' : '10進数表記'}
            </span>
            （{preferredFormat === 'dms' ? 'DMS' : 'Decimal'}）
          </div>
          <div className={styles.formatValue}>
            <code className={styles.code}>
              {preferredFormat === 'dms' ? dmsFormat : decimalFormat}
            </code>
            <button
              onClick={() =>
                handleCopy(
                  preferredFormat === 'dms' ? dmsFormat : decimalFormat
                )
              }
              className={styles.copyButton}
              title={
                preferredFormat === 'dms'
                  ? 'DMS座標をコピー'
                  : '10進数座標をコピー'
              }>
              📋 コピー
            </button>
          </div>
        </div>

        {/* Secondary format */}
        <div className={styles.formatSection}>
          <div className={styles.formatLabel}>
            <span className={styles.formatLabelBold}>
              {preferredFormat === 'dms' ? '10進数表記' : '度分秒表記 / 60進数'}
            </span>
            （{preferredFormat === 'dms' ? 'Decimal' : 'DMS'}）
          </div>
          <div className={styles.formatValue}>
            <code className={styles.code}>
              {preferredFormat === 'dms' ? decimalFormat : dmsFormat}
            </code>
            <button
              onClick={() =>
                handleCopy(
                  preferredFormat === 'dms' ? decimalFormat : dmsFormat
                )
              }
              className={styles.copyButton}
              title={
                preferredFormat === 'dms'
                  ? '10進数座標をコピー'
                  : 'DMS座標をコピー'
              }>
              📋 コピー
            </button>
          </div>
        </div>
      </div>

      {/* Close button */}
      <button onClick={handleClose} className={styles.closeButton}>
        閉じる
      </button>
    </div>
  )
}

CoordinateDisplay.propTypes = {
  lng: PropTypes.number.isRequired,
  lat: PropTypes.number.isRequired,
  darkMode: PropTypes.bool,
  onClose: PropTypes.func,
  screenX: PropTypes.number,
  screenY: PropTypes.number,
  autoFade: PropTypes.bool,
  preferredFormat: PropTypes.oneOf(['decimal', 'dms']),
}

export default CoordinateDisplay
