/**
 * PasswordGate - 静的パスワード認証コンポーネント
 *
 * シンプルなパスワード認証をReactアプリケーション内で提供します。
 * - 環境変数 VITE_APP_PASSWORD でパスワードを設定
 * - LocalStorageに認証状態を保存（30日間有効）
 *
 * 注意: クライアントサイドのみの簡易認証です。
 * 機密性の高いコンテンツの保護には適していません。
 */
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type ReactNode, useState, useEffect, useCallback } from 'react'

// 認証設定
const AUTH_CONFIG = {
  // 環境変数からパスワードを取得（未設定時は空文字）
  password: import.meta.env.VITE_APP_PASSWORD || '',
  // LocalStorageのキー
  storageKey: 'sdpf_auth',
  // 30日間の有効期限（ミリ秒）
  expiryDuration: 30 * 24 * 60 * 60 * 1000,
  // 最大試行回数
  maxAttempts: 5,
}

interface AuthData {
  authenticated: boolean
  timestamp: number
  expiry: number
  // パスワードのハッシュ（パスワード変更検知用）
  passwordHash: string
}

/**
 * 簡易ハッシュ関数（パスワード変更検知用）
 * 注意: セキュリティ目的ではなく、パスワード変更の検知のみに使用
 */
const simpleHash = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // 32bit整数に変換
  }
  return hash.toString(36)
}

export interface PasswordGateProps {
  children: ReactNode
}

/**
 * 認証済みかチェック
 */
const checkAuthentication = (): boolean => {
  try {
    const authData = localStorage.getItem(AUTH_CONFIG.storageKey)
    if (!authData) return false

    const data: AuthData = JSON.parse(authData)

    // 有効期限チェック
    if (!data.expiry || Date.now() >= data.expiry) {
      // 期限切れの場合は認証情報を削除
      localStorage.removeItem(AUTH_CONFIG.storageKey)
      return false
    }

    // パスワードハッシュの検証（パスワード変更時にセッション無効化）
    const currentPasswordHash = simpleHash(AUTH_CONFIG.password)
    if (data.passwordHash !== currentPasswordHash) {
      // パスワードが変更された場合は認証情報を削除
      localStorage.removeItem(AUTH_CONFIG.storageKey)
      return false
    }

    return data.authenticated === true
  } catch {
    return false
  }
}

/**
 * 認証状態を保存（30日間有効）
 */
const saveAuthentication = (): void => {
  const data: AuthData = {
    authenticated: true,
    timestamp: Date.now(),
    expiry: Date.now() + AUTH_CONFIG.expiryDuration,
    passwordHash: simpleHash(AUTH_CONFIG.password),
  }
  localStorage.setItem(AUTH_CONFIG.storageKey, JSON.stringify(data))
}

/**
 * ログアウト（認証状態をクリア）
 */
export const logout = (): void => {
  localStorage.removeItem(AUTH_CONFIG.storageKey)
  window.location.reload()
}

// グローバル型定義
declare global {
  interface Window {
    sdpfLogout?: typeof logout
  }
}

// グローバルにログアウト関数を公開（開発者コンソールから呼び出し可能・開発環境のみ）
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.sdpfLogout = logout
}

export const PasswordGate = ({ children }: PasswordGateProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [attempts, setAttempts] = useState(0)

  // 初期認証状態チェック
  useEffect(() => {
    // パスワードが未設定の場合は認証をスキップ
    if (!AUTH_CONFIG.password) {
      setIsAuthenticated(true)
      return
    }

    setIsAuthenticated(checkAuthentication())
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (attempts >= AUTH_CONFIG.maxAttempts) {
        setError('試行回数の上限に達しました。ページを再読み込みしてください。')
        return
      }

      if (password === AUTH_CONFIG.password) {
        saveAuthentication()
        setIsAuthenticated(true)
        setError('')
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        if (newAttempts >= AUTH_CONFIG.maxAttempts) {
          setError(
            '試行回数の上限に達しました。ページを再読み込みしてください。'
          )
        } else {
          setError(
            `パスワードが正しくありません。残り試行回数: ${AUTH_CONFIG.maxAttempts - newAttempts}`
          )
        }
        setPassword('')
      }
    },
    [password, attempts]
  )

  // 初期化中
  if (isAuthenticated === null) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}>
        <Typography color='text.secondary'>読み込み中...</Typography>
      </Box>
    )
  }

  // 認証済み
  if (isAuthenticated) {
    return <>{children}</>
  }

  // ログイン画面
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2,
      }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
        }}>
        {/* ロゴ/タイトル */}
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}>
            <AirplanemodeActiveIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography variant='h5' component='h1' fontWeight='bold'>
            SDPF Theme
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            プレビューサイトへのアクセスには認証が必要です
          </Typography>
        </Box>

        {/* ログインフォーム */}
        <Box component='form' onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label='パスワード'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            helperText={error}
            disabled={attempts >= AUTH_CONFIG.maxAttempts}
            autoFocus
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      aria-label='パスワードの表示切り替え'
                      onClick={() => setShowPassword(!showPassword)}
                      edge='end'>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 2 }}
          />
          <Button
            type='submit'
            variant='contained'
            fullWidth
            size='large'
            disabled={!password || attempts >= AUTH_CONFIG.maxAttempts}>
            ログイン
          </Button>
        </Box>

        {/* フッター */}
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ display: 'block', mt: 3 }}>
          KDDI Smart Drone Platform
        </Typography>
      </Paper>
    </Box>
  )
}

export default PasswordGate
