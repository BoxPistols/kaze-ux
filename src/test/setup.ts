import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, expect } from 'vitest'

// Polyfill URL.createObjectURL/revokeObjectURL for jsdom (must run before stories import)
;(globalThis as any).URL = ((): any => {
  const URLObj: any = (globalThis as any).URL || {}
  if (typeof URLObj.createObjectURL !== 'function') {
    URLObj.createObjectURL = () => 'blob:mock'
  }
  if (typeof URLObj.revokeObjectURL !== 'function') {
    URLObj.revokeObjectURL = () => {}
  }
  return URLObj
})()

// Node 22+ が globalThis.localStorage をネイティブに持つため、jsdom の
// window.localStorage より先に解決されてしまう（--localstorage-file 未設定だと
// setItem が機能しない）。テスト用の in-memory 実装で明示的に上書きする。
// Object.keys(localStorage) で実際の保存キーを拾えるよう、store 自体を
// Proxy のターゲットにする（プレーンオブジェクトだとメソッド名しか返らない）
;(() => {
  const store: Record<string, string> = {}
  const methods = {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value)
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k])
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
  }
  const mockStorage = new Proxy(store, {
    get(target, prop, receiver) {
      if (prop === 'length') return Object.keys(target).length
      if (prop in methods) return methods[prop as keyof typeof methods]
      return Reflect.get(target, prop, receiver)
    },
    set(target, prop, value) {
      if (typeof prop === 'string') target[prop] = String(value)
      return true
    },
  })
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockStorage,
    writable: true,
    configurable: true,
  })
})()

// Custom matchers for vitest to replace jest-dom functionality
expect.extend({
  toBeInTheDocument(received) {
    const pass =
      received !== null && received !== undefined && received.isConnected

    if (pass) {
      return {
        message: () => `expected element not to be in the document`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected element to be in the document`,
        pass: false,
      }
    }
  },

  toHaveValue(received, expected) {
    const pass = received && received.value === expected

    if (pass) {
      return {
        message: () => `expected element not to have value "${expected}"`,
        pass: true,
      }
    } else {
      return {
        message: () =>
          `expected element to have value "${expected}", but got "${received?.value || 'undefined'}"`,
        pass: false,
      }
    }
  },

  toHaveFocus(received) {
    const pass = received && document.activeElement === received

    if (pass) {
      return {
        message: () => `expected element not to have focus`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected element to have focus`,
        pass: false,
      }
    }
  },
})

// React act警告を抑制
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  // Polyfill for URL.createObjectURL used by some stories/components
  // jsdom does not implement it
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ;(global as any).URL.createObjectURL =
    (global as any).URL.createObjectURL || (() => '')

  // React act()警告を抑制
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: An update to') ||
        args[0].includes('act(...)') ||
        args[0].includes('wrap into act'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }

  // MUI関連の警告を抑制
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('MUI:') ||
        args[0].includes('Material-UI:') ||
        args[0].includes('useLayoutEffect'))
    ) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})

// テスト後のクリーンアップ
afterEach(() => {
  cleanup()
})
