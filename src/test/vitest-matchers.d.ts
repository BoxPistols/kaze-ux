import { expect } from 'vitest'

type CustomMatchers<R = unknown> = {
  toBeInTheDocument(): R
  toHaveValue(expected: string): R
  toHaveFocus(): R
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}