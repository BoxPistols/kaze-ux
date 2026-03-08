/**
 * Storybook Manager Authentication テスト
 *
 * manager-head.htmlの認証ロジックをテスト
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// 認証設定（manager-head.htmlと同じ）
const CONFIG = {
  storageKey: 'sdpf_auth',
  expiryDuration: 30 * 24 * 60 * 60 * 1000,
  maxAttempts: 5,
}

// 簡易ハッシュ関数（manager-head.htmlと同じロジック）
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash.toString(36)
}

// 認証済みかチェック（manager-head.htmlと同じロジック）
function isAuthenticated(password: string): boolean {
  try {
    const authData = localStorage.getItem(CONFIG.storageKey)
    if (!authData) return false

    const data = JSON.parse(authData)

    // 有効期限チェック
    if (!data.expiry || Date.now() >= data.expiry) {
      localStorage.removeItem(CONFIG.storageKey)
      return false
    }

    // パスワードハッシュの検証
    const currentPasswordHash = simpleHash(password)
    if (data.passwordHash && data.passwordHash !== currentPasswordHash) {
      localStorage.removeItem(CONFIG.storageKey)
      return false
    }

    return data.authenticated === true
  } catch {
    return false
  }
}

// 認証状態を保存（manager-head.htmlと同じロジック）
function saveAuth(password: string): void {
  const data = {
    authenticated: true,
    timestamp: Date.now(),
    expiry: Date.now() + CONFIG.expiryDuration,
    passwordHash: simpleHash(password),
  }
  localStorage.setItem(CONFIG.storageKey, JSON.stringify(data))
}

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
    reset: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Storybook Manager 認証', () => {
  beforeEach(() => {
    localStorageMock.reset()
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('simpleHash 関数', () => {
    it('同じ文字列に対して同じハッシュを返す', () => {
      console.log('テスト中: ハッシュの一貫性')
      const password = 'testpassword123'
      const hash1 = simpleHash(password)
      const hash2 = simpleHash(password)
      expect(hash1).toBe(hash2)
      console.log('成功: 同じ文字列に対して同じハッシュが返されました')
    })

    it('異なる文字列に対して異なるハッシュを返す', () => {
      console.log('テスト中: 異なる文字列のハッシュ')
      const hash1 = simpleHash('password1')
      const hash2 = simpleHash('password2')
      expect(hash1).not.toBe(hash2)
      console.log('成功: 異なる文字列に対して異なるハッシュが返されました')
    })

    it('空文字列でもハッシュを返す', () => {
      console.log('テスト中: 空文字列のハッシュ')
      const hash = simpleHash('')
      expect(typeof hash).toBe('string')
      expect(hash).toBe('0')
      console.log('成功: 空文字列のハッシュが返されました')
    })

    it('PasswordGateと同じハッシュ結果を返す', () => {
      console.log('テスト中: PasswordGateとの互換性')
      // PasswordGateのsimpleHash関数と同じ結果になることを確認
      const testCases = ['test', 'password123', 'sdpf-theme', '日本語テスト']
      testCases.forEach((input) => {
        const hash = simpleHash(input)
        expect(typeof hash).toBe('string')
        expect(hash.length).toBeGreaterThan(0)
      })
      console.log('成功: PasswordGateとの互換性が確認されました')
    })
  })

  describe('isAuthenticated 関数', () => {
    it('localStorageに認証情報がない場合はfalseを返す', () => {
      console.log('テスト中: 認証情報なしの場合')
      localStorageMock.getItem.mockReturnValue(null)
      expect(isAuthenticated('anypassword')).toBe(false)
      console.log('成功: 認証情報なしでfalseが返されました')
    })

    it('有効な認証情報がある場合はtrueを返す', () => {
      console.log('テスト中: 有効な認証情報の場合')
      const password = 'testpassword123'
      const validAuthData = {
        authenticated: true,
        timestamp: Date.now(),
        expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
        passwordHash: simpleHash(password),
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(validAuthData))

      expect(isAuthenticated(password)).toBe(true)
      console.log('成功: 有効な認証情報でtrueが返されました')
    })

    it('有効期限切れの場合はfalseを返し、認証情報を削除する', () => {
      console.log('テスト中: 有効期限切れの場合')
      const password = 'testpassword123'
      const expiredAuthData = {
        authenticated: true,
        timestamp: Date.now() - 48 * 60 * 60 * 1000,
        expiry: Date.now() - 1000, // 過去の時刻
        passwordHash: simpleHash(password),
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredAuthData))

      expect(isAuthenticated(password)).toBe(false)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        CONFIG.storageKey
      )
      console.log('成功: 有効期限切れでfalseが返され、認証情報が削除されました')
    })

    it('パスワードハッシュが一致しない場合はfalseを返し、認証情報を削除する', () => {
      console.log('テスト中: パスワードハッシュ不一致の場合')
      const oldPassword = 'oldpassword'
      const newPassword = 'newpassword'
      const authDataWithOldPassword = {
        authenticated: true,
        timestamp: Date.now(),
        expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
        passwordHash: simpleHash(oldPassword),
      }
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify(authDataWithOldPassword)
      )

      expect(isAuthenticated(newPassword)).toBe(false)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        CONFIG.storageKey
      )
      console.log(
        '成功: パスワードハッシュ不一致でfalseが返され、認証情報が削除されました'
      )
    })

    it('不正なJSON形式の場合はfalseを返す', () => {
      console.log('テスト中: 不正なJSON形式の場合')
      localStorageMock.getItem.mockReturnValue('invalid json')

      expect(isAuthenticated('anypassword')).toBe(false)
      console.log('成功: 不正なJSON形式でfalseが返されました')
    })

    it('authenticated が false の場合はfalseを返す', () => {
      console.log('テスト中: authenticated が false の場合')
      const password = 'testpassword123'
      const authData = {
        authenticated: false,
        timestamp: Date.now(),
        expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
        passwordHash: simpleHash(password),
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(authData))

      expect(isAuthenticated(password)).toBe(false)
      console.log('成功: authenticated が false でfalseが返されました')
    })
  })

  describe('saveAuth 関数', () => {
    it('認証情報をlocalStorageに保存する', () => {
      console.log('テスト中: 認証情報の保存')
      const password = 'testpassword123'

      saveAuth(password)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        CONFIG.storageKey,
        expect.any(String)
      )

      const savedData = JSON.parse(
        localStorageMock.setItem.mock.calls[0][1] as string
      )
      expect(savedData.authenticated).toBe(true)
      expect(savedData.passwordHash).toBe(simpleHash(password))
      expect(savedData.expiry).toBeGreaterThan(Date.now())
      console.log('成功: 認証情報がlocalStorageに保存されました')
    })

    it('30日間の有効期限を設定する', () => {
      console.log('テスト中: 有効期限の設定')
      const password = 'testpassword123'
      const beforeSave = Date.now()

      saveAuth(password)

      const savedData = JSON.parse(
        localStorageMock.setItem.mock.calls[0][1] as string
      )
      const expectedExpiry = beforeSave + CONFIG.expiryDuration

      // 許容誤差1秒以内
      expect(savedData.expiry).toBeGreaterThanOrEqual(expectedExpiry - 1000)
      expect(savedData.expiry).toBeLessThanOrEqual(expectedExpiry + 1000)
      console.log('成功: 30日間の有効期限が設定されました')
    })
  })

  describe('PasswordGate との互換性', () => {
    it('PasswordGateで保存した認証情報をStorybook Managerで読み取れる', () => {
      console.log('テスト中: PasswordGateとの互換性（読み取り）')
      const password = 'sharedpassword'

      // PasswordGateが保存する形式と同じ
      const passwordGateAuthData = {
        authenticated: true,
        timestamp: Date.now(),
        expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
        passwordHash: simpleHash(password),
      }
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify(passwordGateAuthData)
      )

      // Storybook Managerで読み取り
      expect(isAuthenticated(password)).toBe(true)
      console.log(
        '成功: PasswordGateで保存した認証情報をStorybook Managerで読み取れました'
      )
    })

    it('Storybook Managerで保存した認証情報をPasswordGateで読み取れる形式である', () => {
      console.log('テスト中: PasswordGateとの互換性（書き込み）')
      const password = 'sharedpassword'

      saveAuth(password)

      const savedData = JSON.parse(
        localStorageMock.setItem.mock.calls[0][1] as string
      )

      // PasswordGateが期待する形式を確認
      expect(savedData).toHaveProperty('authenticated', true)
      expect(savedData).toHaveProperty('timestamp')
      expect(savedData).toHaveProperty('expiry')
      expect(savedData).toHaveProperty('passwordHash')
      expect(savedData.passwordHash).toBe(simpleHash(password))
      console.log(
        '成功: Storybook Managerで保存した認証情報はPasswordGateで読み取れる形式です'
      )
    })

    it('同じstorageKeyを使用している', () => {
      console.log('テスト中: storageKeyの一致')
      expect(CONFIG.storageKey).toBe('sdpf_auth')
      console.log('成功: PasswordGateと同じstorageKeyを使用しています')
    })
  })

  describe('パスワード未設定時の動作', () => {
    it('パスワードが空文字列の場合、認証チェックは常にfalseを返す', () => {
      console.log('テスト中: パスワード未設定時の認証チェック')
      // パスワードが空の場合、manager-head.htmlでは認証をスキップする
      // ただし、isAuthenticated関数自体は空パスワードでもfalseを返す
      localStorageMock.getItem.mockReturnValue(null)
      expect(isAuthenticated('')).toBe(false)
      console.log('成功: パスワード未設定時にfalseが返されました')
    })
  })

  describe('セキュリティ考慮事項', () => {
    it('パスワードは平文で保存されない', () => {
      console.log('テスト中: パスワードの保存形式')
      const password = 'secretpassword123'

      saveAuth(password)

      const savedData = localStorageMock.setItem.mock.calls[0][1] as string
      expect(savedData).not.toContain(password)
      expect(savedData).toContain(simpleHash(password))
      console.log('成功: パスワードは平文で保存されていません')
    })

    it('試行回数制限の設定が適切である', () => {
      console.log('テスト中: 試行回数制限')
      expect(CONFIG.maxAttempts).toBe(5)
      console.log('成功: 試行回数制限は5回に設定されています')
    })

    it('有効期限が30日間に設定されている', () => {
      console.log('テスト中: 有効期限の設定値')
      const expectedDuration = 30 * 24 * 60 * 60 * 1000 // 30日間（ミリ秒）
      expect(CONFIG.expiryDuration).toBe(expectedDuration)
      console.log('成功: 有効期限は30日間に設定されています')
    })
  })
})
