// lib/cors ユニットテスト

import { describe, expect, it, vi } from 'vitest'

import { isAllowedOrigin, setCorsHeaders } from '../cors'

describe('isAllowedOrigin', () => {
  it('localhost を許可', () => {
    expect(isAllowedOrigin('http://localhost')).toBe(true)
    expect(isAllowedOrigin('http://localhost:5173')).toBe(true)
    expect(isAllowedOrigin('https://localhost:6006')).toBe(true)
  })

  it('127.0.0.1 を許可', () => {
    expect(isAllowedOrigin('http://127.0.0.1')).toBe(true)
    expect(isAllowedOrigin('http://127.0.0.1:6006')).toBe(true)
  })

  it('Vercel デプロイ URL を許可', () => {
    expect(isAllowedOrigin('https://kaze-ux.vercel.app')).toBe(true)
    expect(isAllowedOrigin('https://kaze-ux-git-main.vercel.app')).toBe(true)
    expect(
      isAllowedOrigin(
        'https://kaze-ux-feat-chatsupport-backend-proxy.vercel.app'
      )
    ).toBe(true)
  })

  it('GitHub Pages を許可', () => {
    expect(isAllowedOrigin('https://boxpistols.github.io')).toBe(true)
  })

  it('未許可オリジンを拒否', () => {
    expect(isAllowedOrigin('https://evil.example.com')).toBe(false)
    expect(isAllowedOrigin('https://kaze-ux.evil.com')).toBe(false)
    expect(isAllowedOrigin('http://kaze-ux.vercel.app')).toBe(false) // http
    expect(isAllowedOrigin('https://other.vercel.app')).toBe(false)
  })

  it('null/undefined/空文字を拒否', () => {
    expect(isAllowedOrigin(undefined)).toBe(false)
    expect(isAllowedOrigin(null)).toBe(false)
    expect(isAllowedOrigin('')).toBe(false)
  })
})

describe('setCorsHeaders', () => {
  const createResMock = () => {
    const setHeader = vi.fn()
    return { setHeader, headers: () => setHeader.mock.calls }
  }

  it('許可オリジンの場合、Access-Control-Allow-Origin にエコー', () => {
    const res = createResMock()
    setCorsHeaders(res, 'https://kaze-ux.vercel.app')

    const calls = res.headers()
    expect(calls).toContainEqual([
      'Access-Control-Allow-Origin',
      'https://kaze-ux.vercel.app',
    ])
    expect(calls).toContainEqual(['Vary', 'Origin'])
  })

  it('未許可オリジンの場合、Allow-Origin を設定しない', () => {
    const res = createResMock()
    setCorsHeaders(res, 'https://evil.example.com')

    const calls = res.headers()
    const hasAllowOrigin = calls.some(
      ([name]) => name === 'Access-Control-Allow-Origin'
    )
    expect(hasAllowOrigin).toBe(false)
  })

  it('共通ヘッダー（Methods/Headers/Max-Age）は常に設定', () => {
    const res = createResMock()
    setCorsHeaders(res, 'https://kaze-ux.vercel.app')

    const calls = res.headers()
    expect(calls).toContainEqual([
      'Access-Control-Allow-Methods',
      'POST, OPTIONS',
    ])
    expect(calls).toContainEqual([
      'Access-Control-Allow-Headers',
      'Content-Type, X-User-API-Key',
    ])
    expect(calls).toContainEqual(['Access-Control-Max-Age', '86400'])
  })

  it('レート制限ヘッダーを Expose-Headers に含める', () => {
    const res = createResMock()
    setCorsHeaders(res, 'https://kaze-ux.vercel.app')

    const calls = res.headers()
    const exposeCall = calls.find(
      ([name]) => name === 'Access-Control-Expose-Headers'
    )
    expect(exposeCall?.[1]).toContain('X-RateLimit-Limit')
    expect(exposeCall?.[1]).toContain('X-RateLimit-Remaining')
    expect(exposeCall?.[1]).toContain('X-RateLimit-Reset')
  })
})
