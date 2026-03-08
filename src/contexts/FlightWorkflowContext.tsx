/**
 * FlightWorkflowContext
 *
 * 飛行ワークフロー全体を管理するコンテキスト
 * プロジェクト選択 → 飛行計画選択 → 飛行準備 → 監視 の流れを制御
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'

import {
  getFlightPlanDetail,
  getProjectDetail,
  getChecklistByFlightPlanId,
} from '@/mocks/utmMockData'
import type {
  FlightPlanDetail,
  ProjectDetail,
  PreflightChecklist,
  FlightReadinessResult,
} from '@/types/utmDataModel'

// ============================================
// 型定義
// ============================================

interface FlightWorkflowState {
  // 選択状態
  selectedProjectId: string | null
  selectedFlightPlanId: string | null

  // データ
  selectedProject: ProjectDetail | null
  selectedFlightPlan: FlightPlanDetail | null
  checklist: PreflightChecklist | null

  // ワークフロー状態
  workflowStep: WorkflowStep
  canProceedToMonitoring: boolean
  readiness: FlightReadinessResult | null
}

interface FlightWorkflowActions {
  // 選択アクション
  selectProject: (projectId: string) => void
  selectFlightPlan: (flightPlanId: string) => void
  clearSelection: () => void

  // 準備アクション
  startPreflight: () => void
  updateChecklist: (updates: Partial<PreflightChecklist>) => void
  completePreflight: () => void

  // 監視アクション
  startMonitoring: () => void
  endMonitoring: () => void

  // 状態チェック
  checkReadiness: () => FlightReadinessResult
}

type WorkflowStep =
  | 'project_selection' // プロジェクト選択
  | 'flight_selection' // 飛行計画選択
  | 'preflight' // 飛行前準備
  | 'monitoring' // 監視中
  | 'completed' // 完了

type FlightWorkflowContextType = FlightWorkflowState & FlightWorkflowActions

// ============================================
// コンテキスト
// ============================================

const FlightWorkflowContext = createContext<FlightWorkflowContextType | null>(
  null
)

// ============================================
// Provider
// ============================================

interface FlightWorkflowProviderProps {
  children: ReactNode
}

export function FlightWorkflowProvider({
  children,
}: FlightWorkflowProviderProps) {
  // 選択状態
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  )
  const [selectedFlightPlanId, setSelectedFlightPlanId] = useState<
    string | null
  >(null)

  // ワークフロー状態
  const [workflowStep, setWorkflowStep] =
    useState<WorkflowStep>('project_selection')
  const [checklist, setChecklist] = useState<PreflightChecklist | null>(null)

  // 派生データ
  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null
    return getProjectDetail(selectedProjectId) || null
  }, [selectedProjectId])

  const selectedFlightPlan = useMemo(() => {
    if (!selectedFlightPlanId) return null
    return getFlightPlanDetail(selectedFlightPlanId) || null
  }, [selectedFlightPlanId])

  // 飛行可能判定
  const checkReadiness = useCallback((): FlightReadinessResult => {
    if (!selectedFlightPlan || !checklist) {
      return {
        canFly: false,
        reasons: ['飛行計画またはチェックリストが選択されていません'],
        checklist: {
          weather: false,
          airspace: false,
          aircraft: false,
          permits: false,
          crew: false,
        },
      }
    }

    const reasons: string[] = []
    const checklistStatus = {
      weather: checklist.weather.passed,
      airspace: checklist.airspace.passed,
      aircraft: checklist.aircraft.passed,
      permits: checklist.permits.passed,
      crew: checklist.crew.passed,
    }

    if (!checklistStatus.weather) reasons.push('気象確認が未完了です')
    if (!checklistStatus.airspace) reasons.push('空域確認が未完了です')
    if (!checklistStatus.aircraft) reasons.push('機体確認が未完了です')
    if (!checklistStatus.permits) reasons.push('許可確認が未完了です')
    if (!checklistStatus.crew) reasons.push('クルー確認が未完了です')

    if (
      selectedFlightPlan.status !== 'approved' &&
      selectedFlightPlan.status !== 'ready'
    ) {
      reasons.push('飛行計画が承認されていません')
    }

    return {
      canFly: reasons.length === 0,
      reasons,
      checklist: checklistStatus,
    }
  }, [selectedFlightPlan, checklist])

  const readiness = useMemo(() => {
    if (workflowStep !== 'preflight' && workflowStep !== 'monitoring') {
      return null
    }
    return checkReadiness()
  }, [workflowStep, checkReadiness])

  const canProceedToMonitoring = readiness?.canFly ?? false

  // アクション: プロジェクト選択
  const selectProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId)
    setSelectedFlightPlanId(null)
    setChecklist(null)
    setWorkflowStep('flight_selection')
  }, [])

  // アクション: 飛行計画選択
  const selectFlightPlan = useCallback((flightPlanId: string) => {
    setSelectedFlightPlanId(flightPlanId)
    const existingChecklist = getChecklistByFlightPlanId(flightPlanId)
    if (existingChecklist) {
      setChecklist(existingChecklist)
    } else {
      // 新規チェックリストを作成
      const newChecklist: PreflightChecklist = {
        id: `checklist-${Date.now()}`,
        flightPlanId,
        weather: { checked: false, passed: false },
        airspace: {
          checked: false,
          passed: false,
          items: { emergencyAirspace: false, notam: false, tfr: false },
        },
        aircraft: {
          checked: false,
          passed: false,
          items: {
            visualInspection: false,
            batteryLevel: 0,
            gpsStatus: false,
            remoteIdActive: false,
            sensorCalibration: false,
            firmwareUpToDate: false,
          },
        },
        permits: {
          checked: false,
          passed: false,
          items: {
            dipsRegistration: false,
            flightPermission: false,
            insuranceValid: false,
            pilotQualification: false,
          },
        },
        crew: {
          checked: false,
          passed: false,
          items: {
            pilotPresent: false,
            observerPresent: false,
            safetyManagerPresent: false,
            emergencyContactsSet: false,
          },
        },
        overallStatus: 'pending',
      }
      setChecklist(newChecklist)
    }
    setWorkflowStep('preflight')
  }, [])

  // アクション: 選択クリア
  const clearSelection = useCallback(() => {
    setSelectedProjectId(null)
    setSelectedFlightPlanId(null)
    setChecklist(null)
    setWorkflowStep('project_selection')
  }, [])

  // アクション: 飛行前準備開始
  const startPreflight = useCallback(() => {
    if (selectedFlightPlanId) {
      setWorkflowStep('preflight')
    }
  }, [selectedFlightPlanId])

  // アクション: チェックリスト更新
  const updateChecklist = useCallback(
    (updates: Partial<PreflightChecklist>) => {
      setChecklist((prev) => {
        if (!prev) return null
        return { ...prev, ...updates }
      })
    },
    []
  )

  // アクション: 飛行前準備完了
  const completePreflight = useCallback(() => {
    const readinessCheck = checkReadiness()
    if (readinessCheck.canFly) {
      setChecklist((prev) => {
        if (!prev) return null
        return {
          ...prev,
          overallStatus: 'passed',
          completedAt: new Date().toISOString(),
        }
      })
      setWorkflowStep('monitoring')
    }
  }, [checkReadiness])

  // アクション: 監視開始
  const startMonitoring = useCallback(() => {
    if (canProceedToMonitoring) {
      setWorkflowStep('monitoring')
    }
  }, [canProceedToMonitoring])

  // アクション: 監視終了
  const endMonitoring = useCallback(() => {
    setWorkflowStep('completed')
  }, [])

  // コンテキスト値
  const value: FlightWorkflowContextType = {
    // 状態
    selectedProjectId,
    selectedFlightPlanId,
    selectedProject,
    selectedFlightPlan,
    checklist,
    workflowStep,
    canProceedToMonitoring,
    readiness,
    // アクション
    selectProject,
    selectFlightPlan,
    clearSelection,
    startPreflight,
    updateChecklist,
    completePreflight,
    startMonitoring,
    endMonitoring,
    checkReadiness,
  }

  return (
    <FlightWorkflowContext.Provider value={value}>
      {children}
    </FlightWorkflowContext.Provider>
  )
}

// ============================================
// Hook
// ============================================

export function useFlightWorkflow(): FlightWorkflowContextType {
  const context = useContext(FlightWorkflowContext)
  if (!context) {
    throw new Error(
      'useFlightWorkflow must be used within a FlightWorkflowProvider'
    )
  }
  return context
}

// ============================================
// ユーティリティ
// ============================================

/**
 * ワークフローステップのラベル
 */
export function getWorkflowStepLabel(step: WorkflowStep): string {
  switch (step) {
    case 'project_selection':
      return 'プロジェクト選択'
    case 'flight_selection':
      return '飛行計画選択'
    case 'preflight':
      return '飛行前準備'
    case 'monitoring':
      return '監視中'
    case 'completed':
      return '完了'
    default:
      return ''
  }
}

/**
 * ワークフローステップのインデックス
 */
export function getWorkflowStepIndex(step: WorkflowStep): number {
  const steps: WorkflowStep[] = [
    'project_selection',
    'flight_selection',
    'preflight',
    'monitoring',
    'completed',
  ]
  return steps.indexOf(step)
}
