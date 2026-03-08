/**
 * UTMユーティリティ関数
 *
 * マルチサイト対応の飛行計画に関するヘルパー関数を提供
 */

import {
  getFlightDrones,
  getFlightSites as getFlightSitesFromMock,
  isSingleSiteFlight as isSingleSiteFlightFromMock,
} from '../mocks/utmMultiDroneScenarios'

import type { ScheduledFlight } from '../mocks/utmMultiDroneScenarios'
import type { SiteInfo } from '../types/utmTypes'

// re-export from mocks
export {
  getFlightSitesFromMock as getFlightSites,
  isSingleSiteFlightFromMock as isSingleSiteFlight,
}

/**
 * サイトIDから特定のサイト情報を取得
 *
 * @param flight - 飛行計画
 * @param siteId - サイトID
 * @returns サイト情報（見つからない場合はundefined）
 */
export const getSiteById = (
  flight: ScheduledFlight,
  siteId: string
): SiteInfo | undefined => {
  const sites = getFlightSitesFromMock(flight)
  return sites.find((site) => site.id === siteId)
}

/**
 * 飛行計画に参加する全ドローンを取得
 *
 * シングルサイト・マルチサイト両対応
 * drones フィールドがあればそれを使用、なければ drone を配列で返す
 *
 * @param flight - 飛行計画
 * @returns ドローンステータスの配列
 */
export const getAllDronesForFlight = (
  flight: ScheduledFlight
): ScheduledFlight['drone'][] => {
  return getFlightDrones(flight)
}

/**
 * 特定サイトに所属するドローンを取得
 *
 * @param flight - 飛行計画
 * @param siteId - サイトID
 * @returns 該当サイトに所属するドローンの配列
 */
export const getDronesBySite = (
  flight: ScheduledFlight,
  siteId: string
): ScheduledFlight['drone'][] => {
  const site = getSiteById(flight, siteId)
  if (!site) return []

  const allDrones = getAllDronesForFlight(flight)
  return allDrones.filter((drone) => site.drones.includes(drone.droneId))
}

/**
 * マルチサイトフライトかどうかを判定
 *
 * @param flight - 飛行計画
 * @returns true: マルチサイト、false: シングルサイト
 */
export const isMultiSiteFlight = (flight: ScheduledFlight): boolean => {
  return !isSingleSiteFlightFromMock(flight)
}

/**
 * サイトごとのドローン数を取得
 *
 * @param flight - 飛行計画
 * @returns サイトID -> ドローン数のマップ
 */
export const getDroneCountPerSite = (
  flight: ScheduledFlight
): Record<string, number> => {
  const sites = getFlightSitesFromMock(flight)
  const result: Record<string, number> = {}

  for (const site of sites) {
    result[site.id] = site.drones.length
  }

  return result
}

/**
 * プライマリサイトを取得
 *
 * primarySiteId が設定されていればそれを返す、なければ最初のサイトを返す
 *
 * @param flight - 飛行計画
 * @returns プライマリサイト（サイトがない場合はundefined）
 */
export const getPrimarySite = (
  flight: ScheduledFlight
): SiteInfo | undefined => {
  const sites = getFlightSitesFromMock(flight)
  if (sites.length === 0) return undefined

  if (flight.primarySiteId) {
    const primarySite = getSiteById(flight, flight.primarySiteId)
    if (primarySite) return primarySite
  }

  // fallback: 最初のサイトを返す
  return sites[0]
}

/**
 * 全サイトの総ドローン数を取得
 *
 * @param flight - 飛行計画
 * @returns 総ドローン数
 */
export const getTotalDroneCount = (flight: ScheduledFlight): number => {
  return getAllDronesForFlight(flight).length
}

/**
 * サイトのステータスサマリーを生成
 *
 * @param flight - 飛行計画
 * @returns サイトごとのステータスサマリー
 */
export const getSiteStatusSummary = (
  flight: ScheduledFlight
): Array<{
  siteId: string
  siteName: string
  droneCount: number
  drones: ScheduledFlight['drone'][]
}> => {
  const sites = getFlightSitesFromMock(flight)

  return sites.map((site) => ({
    siteId: site.id,
    siteName: site.name,
    droneCount: site.drones.length,
    drones: getDronesBySite(flight, site.id),
  }))
}
