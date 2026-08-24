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

// Node 22+ が globalThis.localStorage / sessionStorage をネイティブに持つため、
// jsdom の window.* より先に解決されてしまう（--localstorage-file 未設定だと
// setItem が機能しない）。テスト用の in-memory 実装で明示的に上書きする。
//
// **sessionStorage も同じ問題を持つ。** useChatState が
// sessionStorage.getItem('chat_support_open') を読み書きしているので、
// localStorage だけ直すと「保存したはずの値が既定値で返る」テストが
// 黙って通ってしまう。
//
// Object.keys(storage) で実際の保存キーを拾えるよう、store 自体を Proxy の
// ターゲットにする（プレーンオブジェクトだとメソッド名しか返らない）
const createMockStorage = () => {
  // Object.create(null) にして prototype を持たせない。プレーンな {} だと
  // getItem('constructor') が関数を返し、setItem('__proto__', …) が
  // prototype を汚染する
  const store: Record<string, string> = Object.create(null)
  const methods = {
    getItem: (key: string) => (Object.hasOwn(store, key) ? store[key] : null),
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
  return new Proxy(store, {
    get(target, prop, receiver) {
      if (prop === 'length') return Object.keys(target).length
      if (Object.hasOwn(methods, prop))
        return methods[prop as keyof typeof methods]
      return Reflect.get(target, prop, receiver)
    },
    set(target, prop, value) {
      if (typeof prop === 'string') target[prop] = String(value)
      return true
    },
  })
}

for (const name of ['localStorage', 'sessionStorage'] as const) {
  Object.defineProperty(globalThis, name, {
    value: createMockStorage(),
    writable: true,
    configurable: true,
  })
}

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
  // ストレージを毎回空に戻す。以前は Node の native storage が実質 no-op
  // だったので書き込みが残らなかったが、上の in-memory 実装にしたことで
  // **テスト間で値が持ち越される**ようになった。既定値を検証するテストが
  // 前のテストの書き込みを読んでしまい、実行順で結果が変わる
  localStorage.clear()
  sessionStorage.clear()
})
