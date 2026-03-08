/**
 * MonitoringSiteContext
 *
 * 運航監視画面でのサイト選択とドローン選択の状態管理
 * - アクティブサイトID
 * - 選択ドローンID
 * - サイト一覧
 */

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react'

import {
  getFlightSites,
  getDronesBySite,
  getAllDronesForFlight,
} from '../utils/utmHelpers'

import type { ScheduledFlight } from '../mocks/utmMultiDroneScenarios'
import type { SiteInfo } from '../types/utmTypes'

interface MonitoringSiteContextValue {
  /** アクティブサイトID（null = 全サイト表示） */
  activeSiteId: string | null
  /** サイトIDを設定 */
  setActiveSiteId: (siteId: string | null) => void
  /** 選択されたドローンID */
  selectedDroneId: string | null
  /** ドローンIDを設定 */
  setSelectedDroneId: (droneId: string | null) => void
  /** 全サイト一覧 */
  allSites: SiteInfo[]
  /** アクティブサイトの情報 */
  activeSite: SiteInfo | null
  /** アクティブサイトのドローン一覧（全サイトの場合は全ドローン） */
  activeDrones: ScheduledFlight['drone'][]
  /** 選択されたドローンの情報 */
  selectedDrone: ScheduledFlight['drone'] | null
}

const MonitoringSiteContext = createContext<MonitoringSiteContextValue | null>(
  null
)

interface MonitoringSiteProviderProps {
  children: React.ReactNode
  flight: ScheduledFlight
  initialSiteId?: string | null
  initialDroneId?: string | null
}

/**
 * MonitoringSiteProvider
 *
 * 運航監視画面の状態管理プロバイダー
 */
export function MonitoringSiteProvider(
  props: MonitoringSiteProviderProps
): JSX.Element {
  const { children, flight, initialSiteId, initialDroneId } = props

  const allSites = useMemo(() => getFlightSites(flight), [flight])
  const allDrones = useMemo(() => getAllDronesForFlight(flight), [flight])

  const [activeSiteId, setActiveSiteId] = useState<string | null>(() => {
    if (initialSiteId !== undefined) return initialSiteId
    if (allSites.length > 0) return allSites[0].id
    return null
  })

  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(() => {
    if (initialDroneId !== undefined) return initialDroneId
    return null
  })

  // アクティブサイトの情報
  const activeSite = useMemo(() => {
    if (!activeSiteId) return null
    return allSites.find((site) => site.id === activeSiteId) ?? null
  }, [activeSiteId, allSites])

  // アクティブサイトのドローン一覧
  const activeDrones = useMemo(() => {
    if (!activeSiteId) {
      // 全サイト表示の場合は全ドローン
      return allDrones
    }
    return getDronesBySite(flight, activeSiteId)
  }, [activeSiteId, flight, allDrones])

  // 選択されたドローンの情報
  const selectedDrone = useMemo(() => {
    if (!selectedDroneId) return null
    return allDrones.find((drone) => drone.droneId === selectedDroneId) ?? null
  }, [selectedDroneId, allDrones])

  // サイト切り替え時の処理
  const handleSetActiveSiteId = useCallback(
    (siteId: string | null): void => {
      setActiveSiteId(siteId)
      // サイト切り替え時に選択ドローンが新しいサイトに存在しない場合はクリア
      if (selectedDroneId && siteId) {
        const siteDrones = getDronesBySite(flight, siteId)
        const droneExistsInSite = siteDrones.some(
          (d) => d.droneId === selectedDroneId
        )
        if (!droneExistsInSite) {
          setSelectedDroneId(null)
        }
      }
    },
    [selectedDroneId, flight]
  )

  const value: MonitoringSiteContextValue = {
    activeSiteId,
    setActiveSiteId: handleSetActiveSiteId,
    selectedDroneId,
    setSelectedDroneId,
    allSites,
    activeSite,
    activeDrones,
    selectedDrone,
  }

  return (
    <MonitoringSiteContext.Provider value={value}>
      {children}
    </MonitoringSiteContext.Provider>
  )
}

/**
 * useMonitoringSite
 *
 * MonitoringSiteContextを使用するためのカスタムフック
 */
export function useMonitoringSite(): MonitoringSiteContextValue {
  const context = useContext(MonitoringSiteContext)
  if (!context) {
    throw new Error(
      'useMonitoringSite must be used within MonitoringSiteProvider'
    )
  }
  return context
}
