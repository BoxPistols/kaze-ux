/**
 * 日付・時刻フォーマット用ユーティリティ
 * UTMコンポーネント全体で使用する統一フォーマット関数群
 */

/**
 * 時刻をHH:mm形式でフォーマット
 * @param date - フォーマット対象の日付
 * @returns HH:mm形式の文字列
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 時刻をH:mm形式（短縮形）でフォーマット
 * @param date - フォーマット対象の日付
 * @returns H:mm形式の文字列
 */
export const formatTimeShort = (date: Date): string => {
  return date.toLocaleTimeString('ja-JP', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * 時刻をHH:mm:ss形式でフォーマット
 * @param date - フォーマット対象の日付
 * @returns HH:mm:ss形式の文字列
 */
export const formatTimeWithSeconds = (date: Date): string => {
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * 日時をYYYY/MM/DD HH:mm形式でフォーマット
 * @param date - フォーマット対象の日付
 * @returns YYYY/MM/DD HH:mm形式の文字列
 */
export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 日付をYYYY/MM/DD形式でフォーマット
 * @param date - フォーマット対象の日付
 * @returns YYYY/MM/DD形式の文字列
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * ISO形式の日付文字列（YYYY-MM-DD）に変換
 * @param date - フォーマット対象の日付
 * @returns YYYY-MM-DD形式の文字列
 */
export const formatDateISO = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

/**
 * 経過時間を計算し、適切な形式で表示
 * @param startTime - 開始時刻
 * @param endTime - 終了時刻（省略時は現在時刻）
 * @returns フォーマット済みの経過時間文字列
 */
export const formatDuration = (startTime: Date, endTime?: Date): string => {
  const end = endTime || new Date()
  const diffMs = end.getTime() - startTime.getTime()

  if (diffMs < 0) {
    return '0分'
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60

  if (hours > 0) {
    return `${hours}時間${minutes}分`
  }
  return `${minutes}分`
}

/**
 * 飛行時間をフォーマット（秒単位からの変換）
 * @param seconds - 飛行秒数
 * @returns フォーマット済みの飛行時間文字列
 */
export const formatFlightDuration = (seconds: number): string => {
  if (seconds < 0) {
    return '0:00'
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * ファイルサイズをフォーマット
 * @param bytes - バイト数
 * @returns フォーマット済みのファイルサイズ文字列
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`
}

/**
 * 相対時間を表示（例: "3分前", "1時間前"）
 * @param date - 対象の日付
 * @returns 相対時間の文字列
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) {
    return 'たった今'
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}分前`
  }
  if (diffHours < 24) {
    return `${diffHours}時間前`
  }
  if (diffDays < 7) {
    return `${diffDays}日前`
  }
  return formatDate(date)
}
