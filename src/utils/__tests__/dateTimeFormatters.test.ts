import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'

import {
  formatTime,
  formatTimeShort,
  formatTimeWithSeconds,
  formatDateTime,
  formatDate,
  formatDateISO,
  formatDuration,
  formatSecondsDuration,
  formatFileSize,
  formatRelativeTime,
} from '../dateTimeFormatters'

describe('dateTimeFormatters', () => {
  describe('formatTime', () => {
    it('時刻をHH:mm形式でフォーマットする', () => {
      const date = new Date('2025-01-15T14:30:00')
      const result = formatTime(date)
      expect(result).toMatch(/14:30/)
    })

    it('午前の時刻を正しくフォーマットする', () => {
      const date = new Date('2025-01-15T09:05:00')
      const result = formatTime(date)
      expect(result).toMatch(/09:05/)
    })
  })

  describe('formatTimeShort', () => {
    it('時刻をH:mm形式でフォーマットする', () => {
      const date = new Date('2025-01-15T14:30:00')
      const result = formatTimeShort(date)
      expect(result).toMatch(/14:30/)
    })
  })

  describe('formatTimeWithSeconds', () => {
    it('時刻をHH:mm:ss形式でフォーマットする', () => {
      const date = new Date('2025-01-15T14:30:45')
      const result = formatTimeWithSeconds(date)
      expect(result).toMatch(/14:30:45/)
    })
  })

  describe('formatDateTime', () => {
    it('日時をYYYY/MM/DD HH:mm形式でフォーマットする', () => {
      const date = new Date('2025-01-15T14:30:00')
      const result = formatDateTime(date)
      expect(result).toMatch(/2025/)
      expect(result).toMatch(/01/)
      expect(result).toMatch(/15/)
      expect(result).toMatch(/14:30/)
    })
  })

  describe('formatDate', () => {
    it('日付をYYYY/MM/DD形式でフォーマットする', () => {
      const date = new Date('2025-01-15T14:30:00')
      const result = formatDate(date)
      expect(result).toMatch(/2025/)
      expect(result).toMatch(/01/)
      expect(result).toMatch(/15/)
    })
  })

  describe('formatDateISO', () => {
    it('日付をYYYY-MM-DD形式でフォーマットする', () => {
      const date = new Date('2025-01-15T14:30:00Z')
      const result = formatDateISO(date)
      expect(result).toBe('2025-01-15')
    })
  })

  describe('formatDuration', () => {
    it('1時間未満の経過時間をフォーマットする', () => {
      const startTime = new Date('2025-01-15T14:00:00')
      const endTime = new Date('2025-01-15T14:30:00')
      const result = formatDuration(startTime, endTime)
      expect(result).toBe('30分')
    })

    it('1時間以上の経過時間をフォーマットする', () => {
      const startTime = new Date('2025-01-15T14:00:00')
      const endTime = new Date('2025-01-15T16:30:00')
      const result = formatDuration(startTime, endTime)
      expect(result).toBe('2時間30分')
    })

    it('負の経過時間は0分を返す', () => {
      const startTime = new Date('2025-01-15T16:00:00')
      const endTime = new Date('2025-01-15T14:00:00')
      const result = formatDuration(startTime, endTime)
      expect(result).toBe('0分')
    })
  })

  describe('formatSecondsDuration', () => {
    it('秒数を分:秒形式でフォーマットする', () => {
      const result = formatSecondsDuration(125)
      expect(result).toBe('2:05')
    })

    it('1時間以上をH:mm:ss形式でフォーマットする', () => {
      const result = formatSecondsDuration(3725)
      expect(result).toBe('1:02:05')
    })

    it('0秒は0:00を返す', () => {
      const result = formatSecondsDuration(0)
      expect(result).toBe('0:00')
    })

    it('負の値は0:00を返す', () => {
      const result = formatSecondsDuration(-100)
      expect(result).toBe('0:00')
    })
  })

  describe('formatFileSize', () => {
    it('バイト単位でフォーマットする', () => {
      expect(formatFileSize(500)).toBe('500 B')
    })

    it('KB単位でフォーマットする', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })

    it('MB単位でフォーマットする', () => {
      expect(formatFileSize(1572864)).toBe('1.5 MB')
    })

    it('GB単位でフォーマットする', () => {
      expect(formatFileSize(1610612736)).toBe('1.5 GB')
    })

    it('0バイトを正しく処理する', () => {
      expect(formatFileSize(0)).toBe('0 B')
    })
  })

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T15:00:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('1分未満は「たった今」を返す', () => {
      const date = new Date('2025-01-15T14:59:45')
      expect(formatRelativeTime(date)).toBe('たった今')
    })

    it('1時間未満は「X分前」を返す', () => {
      const date = new Date('2025-01-15T14:30:00')
      expect(formatRelativeTime(date)).toBe('30分前')
    })

    it('24時間未満は「X時間前」を返す', () => {
      const date = new Date('2025-01-15T12:00:00')
      expect(formatRelativeTime(date)).toBe('3時間前')
    })

    it('7日未満は「X日前」を返す', () => {
      const date = new Date('2025-01-13T15:00:00')
      expect(formatRelativeTime(date)).toBe('2日前')
    })
  })
})
