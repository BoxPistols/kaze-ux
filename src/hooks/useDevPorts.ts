import { useCallback, useEffect, useState } from 'react'

import {
  checkAllPorts,
  invalidatePortCache,
  type PortStatus,
} from '../utils/appLinks'

/**
 * dev環境でのポート生存状態を返す hook
 * 本番環境では全て alive 扱い
 *
 * @returns portStatus - 各アプリのポート番号と生存フラグ
 * @returns loading    - チェック中かどうか
 * @returns refresh    - 手動で再チェックするコールバック
 *
 * @example
 * const { portStatus, loading, refresh } = useDevPorts()
 * // portStatus = { top: { port: 5173, alive: true }, storybook: { port: 6007, alive: false }, ... }
 */
export const useDevPorts = () => {
  const [portStatus, setPortStatus] = useState<Record<
    string,
    PortStatus
  > | null>(null)
  const [loading, setLoading] = useState(true)

  const check = useCallback(async () => {
    setLoading(true)
    try {
      const result = await checkAllPorts()
      setPortStatus(result)
    } finally {
      setLoading(false)
    }
  }, [])

  /** キャッシュをクリアして再チェック */
  const refresh = useCallback(async () => {
    invalidatePortCache()
    await check()
  }, [check])

  useEffect(() => {
    void check()
  }, [check])

  return { portStatus, loading, refresh }
}
