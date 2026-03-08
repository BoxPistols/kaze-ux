import { describe, it, expect } from 'vitest'

// すべてのStoryを解決・変換できるかの静的チェック（未然にパス崩れを検知）
const modules = import.meta.glob('../stories/**/*.stories.{ts,tsx}', {
  eager: true,
})

describe('Story imports', () => {
  it('should import all stories without errors', () => {
    expect(Object.keys(modules).length).toBeGreaterThan(0)
  })
})
