import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

const theme = createTheme()

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
)

// localStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// window.location.reloadのモック
const reloadMock = vi.fn()
Object.defineProperty(window, 'location', {
  value: { reload: reloadMock },
  writable: true,
})

describe('PasswordGate コンポーネント', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('パスワード未設定時', () => {
    it('認証をスキップして子コンポーネントを表示する', async () => {
      console.log('テスト中: パスワード未設定時の認証スキップ')

      // パスワード未設定の状態でモジュールをインポート
      vi.stubEnv('VITE_APP_PASSWORD', '')
      const { PasswordGate } = await import('../PasswordGate')

      render(
        <TestWrapper>
          <PasswordGate>
            <div data-testid='child-content'>保護されたコンテンツ</div>
          </PasswordGate>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('child-content')).toBeInTheDocument()
      })
      console.log('成功: 認証がスキップされ、子コンポーネントが表示されました')
    })
  })

  describe('パスワード設定時', () => {
    it('未認証時にログイン画面を表示する', async () => {
      console.log('テスト中: 未認証時のログイン画面表示')

      vi.stubEnv('VITE_APP_PASSWORD', 'testpassword123')
      const { PasswordGate } = await import('../PasswordGate')

      render(
        <TestWrapper>
          <PasswordGate>
            <div data-testid='child-content'>保護されたコンテンツ</div>
          </PasswordGate>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText('パスワード')).toBeInTheDocument()
      })
      expect(
        screen.getByRole('button', { name: 'ログイン' })
      ).toBeInTheDocument()
      expect(screen.getByText('SDPF Theme')).toBeInTheDocument()
      console.log('成功: ログイン画面が表示されました')
    })

    it('正しいパスワードで認証が成功する', async () => {
      console.log('テスト中: 正しいパスワードでの認証')

      vi.stubEnv('VITE_APP_PASSWORD', 'testpassword123')
      const { PasswordGate } = await import('../PasswordGate')

      render(
        <TestWrapper>
          <PasswordGate>
            <div data-testid='child-content'>保護されたコンテンツ</div>
          </PasswordGate>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText('パスワード')).toBeInTheDocument()
      })

      const passwordInput = screen.getByLabelText('パスワード')
      const loginButton = screen.getByRole('button', { name: 'ログイン' })

      fireEvent.change(passwordInput, { target: { value: 'testpassword123' } })
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(screen.getByTestId('child-content')).toBeInTheDocument()
      })
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'sdpf_auth',
        expect.any(String)
      )
      console.log('成功: 認証が成功し、保護されたコンテンツが表示されました')
    })

    it('誤ったパスワードでエラーが表示される', async () => {
      console.log('テスト中: 誤ったパスワードでのエラー表示')

      vi.stubEnv('VITE_APP_PASSWORD', 'testpassword123')
      const { PasswordGate } = await import('../PasswordGate')

      render(
        <TestWrapper>
          <PasswordGate>
            <div data-testid='child-content'>保護されたコンテンツ</div>
          </PasswordGate>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText('パスワード')).toBeInTheDocument()
      })

      const passwordInput = screen.getByLabelText('パスワード')
      const loginButton = screen.getByRole('button', { name: 'ログイン' })

      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(
          screen.getByText(/パスワードが正しくありません/)
        ).toBeInTheDocument()
      })
      console.log('成功: エラーメッセージが表示されました')
    })

    it('最大試行回数後にログインが無効化される', async () => {
      console.log('テスト中: 最大試行回数後の無効化')

      vi.stubEnv('VITE_APP_PASSWORD', 'testpassword123')
      const { PasswordGate } = await import('../PasswordGate')

      render(
        <TestWrapper>
          <PasswordGate>
            <div data-testid='child-content'>保護されたコンテンツ</div>
          </PasswordGate>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText('パスワード')).toBeInTheDocument()
      })

      const passwordInput = screen.getByLabelText('パスワード')
      const loginButton = screen.getByRole('button', { name: 'ログイン' })

      // 5回失敗を試行
      for (let i = 0; i < 5; i++) {
        fireEvent.change(passwordInput, { target: { value: 'wrong' } })
        fireEvent.click(loginButton)
      }

      await waitFor(() => {
        expect(
          screen.getByText(/試行回数の上限に達しました/)
        ).toBeInTheDocument()
      })
      expect((passwordInput as HTMLInputElement).disabled).toBe(true)
      expect((loginButton as HTMLButtonElement).disabled).toBe(true)
      console.log('成功: 最大試行回数後にログインが無効化されました')
    })

    it('パスワード表示/非表示の切り替えが動作する', async () => {
      console.log('テスト中: パスワード表示切り替え')

      vi.stubEnv('VITE_APP_PASSWORD', 'testpassword123')
      const { PasswordGate } = await import('../PasswordGate')

      render(
        <TestWrapper>
          <PasswordGate>
            <div data-testid='child-content'>保護されたコンテンツ</div>
          </PasswordGate>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText('パスワード')).toBeInTheDocument()
      })

      const passwordInput = screen.getByLabelText(
        'パスワード'
      ) as HTMLInputElement
      const toggleButton = screen.getByRole('button', {
        name: 'パスワードの表示切り替え',
      })

      expect(passwordInput.type).toBe('password')

      fireEvent.click(toggleButton)
      expect(passwordInput.type).toBe('text')

      fireEvent.click(toggleButton)
      expect(passwordInput.type).toBe('password')
      console.log('成功: パスワード表示切り替えが動作しました')
    })
  })

  describe('LocalStorage認証状態', () => {
    // パスワードハッシュを計算する関数（PasswordGateと同じロジック）
    const simpleHash = (str: string): string => {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash
      }
      return hash.toString(36)
    }

    it('有効な認証情報からセッションを復元する', async () => {
      console.log('テスト中: LocalStorageからの認証状態復元')

      const testPassword = 'testpassword123'
      const validAuthData = {
        authenticated: true,
        timestamp: Date.now(),
        expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
        passwordHash: simpleHash(testPassword),
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(validAuthData))

      vi.stubEnv('VITE_APP_PASSWORD', testPassword)
      const { PasswordGate } = await import('../PasswordGate')

      render(
        <TestWrapper>
          <PasswordGate>
            <div data-testid='child-content'>保護されたコンテンツ</div>
          </PasswordGate>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('child-content')).toBeInTheDocument()
      })
      console.log('成功: 認証状態が復元されました')
    })

    it('パスワード変更時にセッションが無効化される', async () => {
      console.log('テスト中: パスワード変更時のセッション無効化')

      const oldPassword = 'oldpassword123'
      const newPassword = 'newpassword456'
      const authDataWithOldPassword = {
        authenticated: true,
        timestamp: Date.now(),
        expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
        passwordHash: simpleHash(oldPassword),
      }
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify(authDataWithOldPassword)
      )

      // 新しいパスワードに変更された状態
      vi.stubEnv('VITE_APP_PASSWORD', newPassword)
      const { PasswordGate } = await import('../PasswordGate')

      render(
        <TestWrapper>
          <PasswordGate>
            <div data-testid='child-content'>保護されたコンテンツ</div>
          </PasswordGate>
        </TestWrapper>
      )

      // パスワードが変更されたのでログイン画面が表示される
      await waitFor(() => {
        expect(screen.getByLabelText('パスワード')).toBeInTheDocument()
      })
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('sdpf_auth')
      console.log('成功: パスワード変更によりセッションが無効化されました')
    })

    it('有効期限切れの認証情報が削除される', async () => {
      console.log('テスト中: 有効期限切れの認証情報削除')

      const testPassword = 'testpassword123'
      const expiredAuthData = {
        authenticated: true,
        timestamp: Date.now() - 48 * 60 * 60 * 1000,
        expiry: Date.now() - 24 * 60 * 60 * 1000,
        passwordHash: simpleHash(testPassword),
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredAuthData))

      vi.stubEnv('VITE_APP_PASSWORD', testPassword)
      const { PasswordGate } = await import('../PasswordGate')

      render(
        <TestWrapper>
          <PasswordGate>
            <div data-testid='child-content'>保護されたコンテンツ</div>
          </PasswordGate>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText('パスワード')).toBeInTheDocument()
      })
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('sdpf_auth')
      console.log('成功: 有効期限切れの認証情報が削除されました')
    })
  })

  describe('logout関数', () => {
    it('認証状態をクリアしてリロードする', async () => {
      console.log('テスト中: logout関数の動作')

      vi.stubEnv('VITE_APP_PASSWORD', '')
      const { logout } = await import('../PasswordGate')

      logout()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('sdpf_auth')
      expect(reloadMock).toHaveBeenCalled()
      console.log('成功: logout関数が正常に動作しました')
    })
  })
})
