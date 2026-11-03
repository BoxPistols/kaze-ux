import { type PaletteMode } from '@mui/material'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  themeMode: PaletteMode
  toggleThemeMode: () => void
  // コンパクトヘッダーモード
  compactHeader: boolean
  toggleCompactHeader: () => void
  // フルスクリーンモード（ヘッダー・サイドバー非表示）
  fullscreenMode: boolean
  setFullscreenMode: (enabled: boolean) => void
  toggleFullscreenMode: () => void
}

const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      themeMode:
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light',
      toggleThemeMode: () =>
        set((state) => ({
          themeMode: state.themeMode === 'light' ? 'dark' : 'light',
        })),
      // コンパクトヘッダー（デフォルトON - 高さを半分に）
      compactHeader: true,
      toggleCompactHeader: () =>
        set((state) => ({
          compactHeader: !state.compactHeader,
        })),
      // フルスクリーンモード
      fullscreenMode: false,
      setFullscreenMode: (enabled: boolean) =>
        set(() => ({
          fullscreenMode: enabled,
        })),
      toggleFullscreenMode: () =>
        set((state) => ({
          fullscreenMode: !state.fullscreenMode,
        })),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        themeMode: state.themeMode,
        compactHeader: state.compactHeader,
      }),
    }
  )
)

export default useAppStore
