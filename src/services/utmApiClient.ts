/**
 * UTM APIクライアントサービス
 *
 * 飛行計画、空域判定、周知、NOTAM、承認ワークフローのAPI操作を提供
 */

import type {
  FlightPlan,
  FlightPlanStatus,
  AirspaceAssessmentRequest,
  AirspaceAssessmentResult,
  NotificationLog,
  NotificationSummary,
  NotificationSendRequest,
  NOTAMRequest,
  NOTAMStatus,
  ApprovalRequest,
  PreflightChecklist,
  OrganizationContact,
  FlightPlanWorkflowStatus,
  AuditLogEntry,
  AuditLogFilter,
} from '../types/utmTypes'

// APIレスポンス型
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

// ページネーション付きレスポンス
interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// APIクライアント設定
interface UTMApiClientConfig {
  baseUrl: string
  timeout?: number
  onError?: (error: Error) => void
}

/**
 * UTM APIクライアント
 */
export class UTMApiClient {
  private baseUrl: string
  private timeout: number
  private token: string | null = null
  private onError?: (error: Error) => void

  constructor(config: UTMApiClientConfig) {
    this.baseUrl = config.baseUrl
    this.timeout = config.timeout ?? 30000
    this.onError = config.onError
  }

  // 認証トークンを設定
  setToken(token: string | null): void {
    this.token = token
  }

  // 共通のfetchラッパー
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(options.headers ?? {}),
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: errorData.message || response.statusText,
          },
        }
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      this.onError?.(err)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err.message,
        },
      }
    }
  }

  // ============================================
  // 飛行計画 API
  // ============================================

  async createFlightPlan(
    plan: Omit<FlightPlan, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<FlightPlan>> {
    return this.fetch<FlightPlan>('/api/v1/flightplans', {
      method: 'POST',
      body: JSON.stringify(plan),
    })
  }

  async getFlightPlan(id: string): Promise<ApiResponse<FlightPlan>> {
    return this.fetch<FlightPlan>(`/api/v1/flightplans/${id}`)
  }

  async updateFlightPlan(
    id: string,
    plan: Partial<FlightPlan>
  ): Promise<ApiResponse<FlightPlan>> {
    return this.fetch<FlightPlan>(`/api/v1/flightplans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plan),
    })
  }

  async deleteFlightPlan(id: string): Promise<ApiResponse<undefined>> {
    return this.fetch<undefined>(`/api/v1/flightplans/${id}`, {
      method: 'DELETE',
    })
  }

  async listFlightPlans(params?: {
    status?: FlightPlanStatus
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<PaginatedResponse<FlightPlan>>> {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.page) query.set('page', String(params.page))
    if (params?.pageSize) query.set('pageSize', String(params.pageSize))

    return this.fetch<PaginatedResponse<FlightPlan>>(
      `/api/v1/flightplans?${query.toString()}`
    )
  }

  // ============================================
  // 空域判定 API
  // ============================================

  async assessAirspace(
    request: AirspaceAssessmentRequest
  ): Promise<ApiResponse<AirspaceAssessmentResult>> {
    return this.fetch<AirspaceAssessmentResult>('/api/v1/airspace/assess', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getAirspaceAssessment(
    flightPlanId: string
  ): Promise<ApiResponse<AirspaceAssessmentResult>> {
    return this.fetch<AirspaceAssessmentResult>(
      `/api/v1/airspace/assessment/${flightPlanId}`
    )
  }

  // ============================================
  // 周知 API
  // ============================================

  async sendNotifications(
    request: NotificationSendRequest
  ): Promise<ApiResponse<NotificationLog[]>> {
    return this.fetch<NotificationLog[]>('/api/v1/notifications/send', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getNotificationLogs(
    flightPlanId: string
  ): Promise<ApiResponse<NotificationLog[]>> {
    return this.fetch<NotificationLog[]>(
      `/api/v1/notifications/logs?flightPlanId=${flightPlanId}`
    )
  }

  async getNotificationSummary(
    flightPlanId: string
  ): Promise<ApiResponse<NotificationSummary>> {
    return this.fetch<NotificationSummary>(
      `/api/v1/notifications/summary/${flightPlanId}`
    )
  }

  async confirmNotification(
    logId: string,
    confirmedBy: string
  ): Promise<ApiResponse<NotificationLog>> {
    return this.fetch<NotificationLog>(
      `/api/v1/notifications/${logId}/confirm`,
      {
        method: 'POST',
        body: JSON.stringify({ confirmedBy }),
      }
    )
  }

  async retryNotification(
    logId: string
  ): Promise<ApiResponse<NotificationLog>> {
    return this.fetch<NotificationLog>(`/api/v1/notifications/${logId}/retry`, {
      method: 'POST',
    })
  }

  // ============================================
  // 有人機団体 API
  // ============================================

  async listOrganizations(params?: {
    region?: string
    isActive?: boolean
  }): Promise<ApiResponse<OrganizationContact[]>> {
    const query = new URLSearchParams()
    if (params?.region) query.set('region', params.region)
    if (params?.isActive !== undefined)
      query.set('isActive', String(params.isActive))

    return this.fetch<OrganizationContact[]>(
      `/api/v1/organizations?${query.toString()}`
    )
  }

  async getOrganization(id: string): Promise<ApiResponse<OrganizationContact>> {
    return this.fetch<OrganizationContact>(`/api/v1/organizations/${id}`)
  }

  // ============================================
  // NOTAM API
  // ============================================

  async createNotamRequest(
    flightPlanId: string
  ): Promise<ApiResponse<NOTAMRequest>> {
    return this.fetch<NOTAMRequest>('/api/v1/notam', {
      method: 'POST',
      body: JSON.stringify({ flightPlanId }),
    })
  }

  async getNotamRequest(id: string): Promise<ApiResponse<NOTAMRequest>> {
    return this.fetch<NOTAMRequest>(`/api/v1/notam/${id}`)
  }

  async getNotamByFlightPlan(
    flightPlanId: string
  ): Promise<ApiResponse<NOTAMRequest>> {
    return this.fetch<NOTAMRequest>(`/api/v1/notam/flightplan/${flightPlanId}`)
  }

  async submitNotam(id: string): Promise<ApiResponse<NOTAMRequest>> {
    return this.fetch<NOTAMRequest>(`/api/v1/notam/${id}/submit`, {
      method: 'POST',
    })
  }

  async updateNotamStatus(
    id: string,
    status: NOTAMStatus,
    comment?: string
  ): Promise<ApiResponse<NOTAMRequest>> {
    return this.fetch<NOTAMRequest>(`/api/v1/notam/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, comment }),
    })
  }

  // ============================================
  // 承認 API
  // ============================================

  async createApprovalRequest(
    flightPlanId: string,
    priority?: 'normal' | 'high' | 'urgent'
  ): Promise<ApiResponse<ApprovalRequest>> {
    return this.fetch<ApprovalRequest>('/api/v1/approvals', {
      method: 'POST',
      body: JSON.stringify({ flightPlanId, priority: priority ?? 'normal' }),
    })
  }

  async getApprovalRequest(id: string): Promise<ApiResponse<ApprovalRequest>> {
    return this.fetch<ApprovalRequest>(`/api/v1/approvals/${id}`)
  }

  async getApprovalByFlightPlan(
    flightPlanId: string
  ): Promise<ApiResponse<ApprovalRequest>> {
    return this.fetch<ApprovalRequest>(
      `/api/v1/approvals/flightplan/${flightPlanId}`
    )
  }

  async listPendingApprovals(): Promise<ApiResponse<ApprovalRequest[]>> {
    return this.fetch<ApprovalRequest[]>('/api/v1/approvals?status=pending')
  }

  async approveFlightPlan(
    approvalId: string,
    comment?: string
  ): Promise<ApiResponse<ApprovalRequest>> {
    return this.fetch<ApprovalRequest>(
      `/api/v1/approvals/${approvalId}/approve`,
      {
        method: 'POST',
        body: JSON.stringify({ comment }),
      }
    )
  }

  async rejectFlightPlan(
    approvalId: string,
    comment: string
  ): Promise<ApiResponse<ApprovalRequest>> {
    return this.fetch<ApprovalRequest>(
      `/api/v1/approvals/${approvalId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ comment }),
      }
    )
  }

  async requestRevision(
    approvalId: string,
    comment: string
  ): Promise<ApiResponse<ApprovalRequest>> {
    return this.fetch<ApprovalRequest>(
      `/api/v1/approvals/${approvalId}/revision`,
      {
        method: 'POST',
        body: JSON.stringify({ comment }),
      }
    )
  }

  // ============================================
  // プリフライトチェック API
  // ============================================

  async getPreflightChecklist(
    flightPlanId: string
  ): Promise<ApiResponse<PreflightChecklist>> {
    return this.fetch<PreflightChecklist>(`/api/v1/preflight/${flightPlanId}`)
  }

  async updatePreflightCheck(
    flightPlanId: string,
    itemId: string,
    checked: boolean,
    notes?: string
  ): Promise<ApiResponse<PreflightChecklist>> {
    return this.fetch<PreflightChecklist>(
      `/api/v1/preflight/${flightPlanId}/items/${itemId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ checked, notes }),
      }
    )
  }

  async completePreflightCheck(
    flightPlanId: string
  ): Promise<ApiResponse<PreflightChecklist>> {
    return this.fetch<PreflightChecklist>(
      `/api/v1/preflight/${flightPlanId}/complete`,
      {
        method: 'POST',
      }
    )
  }

  // ============================================
  // ワークフロー統合 API
  // ============================================

  async getWorkflowStatus(
    flightPlanId: string
  ): Promise<ApiResponse<FlightPlanWorkflowStatus>> {
    return this.fetch<FlightPlanWorkflowStatus>(
      `/api/v1/workflow/${flightPlanId}`
    )
  }

  // ============================================
  // 監査ログ API
  // ============================================

  async getAuditLogs(
    filter?: AuditLogFilter
  ): Promise<ApiResponse<PaginatedResponse<AuditLogEntry>>> {
    const query = new URLSearchParams()
    if (filter?.startDate) query.set('startDate', filter.startDate)
    if (filter?.endDate) query.set('endDate', filter.endDate)
    if (filter?.entityId) query.set('entityId', filter.entityId)
    if (filter?.userId) query.set('userId', filter.userId)
    if (filter?.searchText) query.set('q', filter.searchText)
    if (filter?.actions) query.set('actions', filter.actions.join(','))
    if (filter?.entityTypes)
      query.set('entityTypes', filter.entityTypes.join(','))

    return this.fetch<PaginatedResponse<AuditLogEntry>>(
      `/api/v1/audit?${query.toString()}`
    )
  }
}

// デフォルトのAPIクライアントインスタンス
let defaultClient: UTMApiClient | null = null

export function getUTMApiClient(): UTMApiClient {
  if (!defaultClient) {
    defaultClient = new UTMApiClient({
      baseUrl: import.meta.env.VITE_API_BASE_URL || '',
      onError: (error) => {
        console.error('[UTM API Error]', error)
      },
    })
  }
  return defaultClient
}

export function setUTMApiClient(client: UTMApiClient): void {
  defaultClient = client
}
