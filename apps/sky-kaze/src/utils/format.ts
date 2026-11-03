/**
 * 共通フォーマットユーティリティ
 */

/** HH:MM:SS 形式（経過時間表示用） */
export const formatElapsedTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** MM:SS 形式（短時間表示用） */
export const formatShortTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** 通貨フォーマット */
export const formatCurrency = (yen: number): string =>
  `\u00a5${yen.toLocaleString()}`
