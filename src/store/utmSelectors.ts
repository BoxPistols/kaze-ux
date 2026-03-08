/**
 * UTMストア用セレクター
 *
 * パフォーマンス最適化のため、Zustandのセレクターパターンを使用。
 * 各コンポーネントは必要な状態のみを購読し、不要な再レンダリングを防止する。
 */

import { useShallow } from 'zustand/shallow'

import useUTMStore from './utmStore'

import type {
  DroneFlightStatus,
  RestrictedZone,
  UTMAlert,
  CollisionRisk,
  UTMProject,
  DIPSApplication,
  FlightLog,
  FlightArea,
} from '../types/utmTypes'

// ============================================
// 原子的セレクター（単一状態）
// ============================================

/** アクティブドローン一覧を取得 */
export const useActiveDrones = (): DroneFlightStatus[] =>
  useUTMStore((state) => state.activeDrones)

/** フィルター済みドローン一覧を取得（選択プロジェクト用） */
export const useFilteredDrones = (): DroneFlightStatus[] =>
  useUTMStore((state) => state.filteredDrones)

/** アラート一覧を取得 */
export const useAlerts = (): UTMAlert[] => useUTMStore((state) => state.alerts)

/** 制限区域一覧を取得 */
export const useRestrictedZones = (): RestrictedZone[] =>
  useUTMStore((state) => state.restrictedZones)

/** 衝突リスク一覧を取得 */
export const useCollisionRisks = (): CollisionRisk[] =>
  useUTMStore((state) => state.collisionRisks)

/** プロジェクト一覧を取得 */
export const useProjects = (): UTMProject[] =>
  useUTMStore((state) => state.projects)

/** 選択中のプロジェクトID一覧を取得 */
export const useSelectedProjectIds = (): string[] =>
  useUTMStore((state) => state.selectedProjectIds)

/** DIPS申請一覧を取得 */
export const useDipsApplications = (): DIPSApplication[] =>
  useUTMStore((state) => state.dipsApplications)

/** 飛行記録一覧を取得 */
export const useFlightLogs = (): FlightLog[] =>
  useUTMStore((state) => state.flightLogs)

/** シミュレーション実行状態を取得 */
export const useIsSimulationRunning = (): boolean =>
  useUTMStore((state) => state.isSimulationRunning)

// ============================================
// 複合セレクター（shallow比較）
// ============================================

/** 統計情報を取得（shallow比較で最適化） */
export const useStatistics = () =>
  useUTMStore(
    useShallow((state) => ({
      activeDrones: state.statistics.activeDrones,
      totalFlightsToday: state.statistics.totalFlightsToday,
      totalFlightHoursToday: state.statistics.totalFlightHoursToday,
      activeAlerts: state.statistics.activeAlerts,
      criticalAlerts: state.statistics.criticalAlerts,
      pendingApplications: state.statistics.pendingApplications,
      approvedApplications: state.statistics.approvedApplications,
      zoneViolations: state.statistics.zoneViolations,
      nearMissIncidents: state.statistics.nearMissIncidents,
    }))
  )

/** サウンド設定を取得（shallow比較で最適化） */
export const useSoundSettings = () =>
  useUTMStore(
    useShallow((state) => ({
      enabled: state.soundSettings.enabled,
      warningSound: state.soundSettings.warningSound,
      errorSound: state.soundSettings.errorSound,
      emergencySound: state.soundSettings.emergencySound,
    }))
  )

/** グローバルアラート閾値を取得（shallow比較で最適化） */
export const useGlobalAlertThresholds = () =>
  useUTMStore(useShallow((state) => state.globalAlertThresholds))

/** グローバル音設定を取得（shallow比較で最適化） */
export const useGlobalSoundConfig = () =>
  useUTMStore(useShallow((state) => state.globalSoundConfig))

// ============================================
// 派生セレクター（計算結果）
// ============================================

/** 飛行中のドローン数を取得 */
export const useFlyingDronesCount = (): number =>
  useUTMStore(
    (state) =>
      state.filteredDrones.filter((d) => d.status === 'in_flight').length
  )

/** 未確認アラート数を取得 */
export const useUnacknowledgedAlertsCount = (): number =>
  useUTMStore((state) => state.alerts.filter((a) => !a.acknowledged).length)

/** クリティカル/緊急アラート数を取得 */
export const useCriticalAlertsCount = (): number =>
  useUTMStore(
    (state) =>
      state.alerts.filter(
        (a) =>
          !a.acknowledged &&
          (a.severity === 'critical' || a.severity === 'emergency')
      ).length
  )

/** アクティブプロジェクト数を取得 */
export const useActiveProjectsCount = (): number =>
  useUTMStore(
    (state) => state.projects.filter((p) => p.status === 'active').length
  )

/** 選択プロジェクトの飛行区域を取得 */
export const useSelectedFlightAreas = (): FlightArea[] =>
  useUTMStore((state) => {
    const selectedIds = new Set(state.selectedProjectIds)
    return state.projects
      .filter((p) => selectedIds.has(p.id) && p.flightArea)
      .map((p) => p.flightArea as FlightArea)
  })

/** 特定ドローンのアラートを取得 */
export const useAlertsForDrone = (droneId: string): UTMAlert[] =>
  useUTMStore((state) => state.alerts.filter((a) => a.droneId === droneId))

/** 特定ドローンの未確認アラートを取得 */
export const useUnacknowledgedAlertsForDrone = (droneId: string): UTMAlert[] =>
  useUTMStore((state) =>
    state.alerts.filter((a) => a.droneId === droneId && !a.acknowledged)
  )

// ============================================
// アクションセレクター
// ============================================

/** ドローン関連アクションを取得 */
export const useDroneActions = () =>
  useUTMStore(
    useShallow((state) => ({
      updateDronePosition: state.updateDronePosition,
      addActiveDrone: state.addActiveDrone,
      removeActiveDrone: state.removeActiveDrone,
    }))
  )

/** アラート関連アクションを取得 */
export const useAlertActions = () =>
  useUTMStore(
    useShallow((state) => ({
      addAlert: state.addAlert,
      acknowledgeAlert: state.acknowledgeAlert,
      unacknowledgeAlert: state.unacknowledgeAlert,
      clearAlert: state.clearAlert,
      clearAllAlerts: state.clearAllAlerts,
    }))
  )

/** プロジェクト関連アクションを取得 */
export const useProjectActions = () =>
  useUTMStore(
    useShallow((state) => ({
      selectProject: state.selectProject,
      toggleProjectSelection: state.toggleProjectSelection,
      clearProjectSelection: state.clearProjectSelection,
      selectAllProjects: state.selectAllProjects,
      updateProjectStatus: state.updateProjectStatus,
    }))
  )

/** シミュレーション関連アクションを取得 */
export const useSimulationActions = () =>
  useUTMStore(
    useShallow((state) => ({
      startSimulation: state.startSimulation,
      stopSimulation: state.stopSimulation,
      initializeMockData: state.initializeMockData,
    }))
  )

/** サウンド設定アクションを取得 */
export const useSoundSettingsAction = () =>
  useUTMStore((state) => state.updateSoundSettings)

/** 衝突検知アクションを取得 */
export const useCollisionActions = () =>
  useUTMStore(
    useShallow((state) => ({
      checkCollisions: state.checkCollisions,
      checkZoneViolations: state.checkZoneViolations,
    }))
  )

// ============================================
// 監視設定セレクター
// ============================================

/** ドローン監視設定を取得 */
export const useMonitoredDroneConfigs = () =>
  useUTMStore((state) => state.monitoredDroneConfigs)

/** 特定ドローンの監視設定を取得 */
export const useDroneMonitoringConfig = (droneId: string) =>
  useUTMStore((state) => state.monitoredDroneConfigs[droneId])

/** 監視設定アクションを取得 */
export const useMonitoringActions = () =>
  useUTMStore(
    useShallow((state) => ({
      initializeMonitoringConfig: state.initializeMonitoringConfig,
      toggleDroneMonitoring: state.toggleDroneMonitoring,
      setDroneAlertThresholds: state.setDroneAlertThresholds,
      setDroneSoundConfig: state.setDroneSoundConfig,
      renameDrone: state.renameDrone,
      updateGlobalAlertThresholds: state.updateGlobalAlertThresholds,
      updateGlobalSoundConfig: state.updateGlobalSoundConfig,
    }))
  )
