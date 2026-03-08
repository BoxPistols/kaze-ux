// src/components/ui/toast/customToaster.tsx
// トーストコンポーネント
import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'

export interface CustomToasterProps {
  /** 同時に表示するトーストの最大数 */
  visibleToasts?: number
  /** リッチカラーを使用 */
  richColors?: boolean
  /** 表示位置 */
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
  /** トーストの表示時間（ミリ秒） */
  duration?: number
}

/**
 * トーストコンポーネント。
 * トーストを使用するためにアプリ内の任意の場所に配置する必要がある。
 *
 * 使用例:
 * ```tsx
 * import { toast } from 'sonner'
 *
 * // 成功トースト
 * toast.success('保存しました')
 *
 * // エラートースト
 * toast.error('エラーが発生しました')
 *
 * // ローディングトースト
 * const id = toast.loading('処理中...')
 * // 後で閉じる
 * toast.dismiss(id)
 * ```
 *
 * 公式リファレンス: https://sonner.emilkowal.ski/toaster#api-reference
 */
export const CustomToaster = ({
  visibleToasts = 5,
  richColors = true,
  position = 'bottom-right',
  duration = 4000,
}: CustomToasterProps) => {
  const [isMounted, setIsMounted] = useState(false)

  // SSR/hydrationの不一致を防ぐため、マウント後にのみレンダリング
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // クライアントサイドでのみレンダリング
  if (!isMounted) {
    return null
  }

  return (
    <Toaster
      richColors={richColors}
      visibleToasts={visibleToasts}
      position={position}
      duration={duration}
    />
  )
}

// sonnerのtoast関数を再エクスポート
export { toast } from 'sonner'

export default CustomToaster
