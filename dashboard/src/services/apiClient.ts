import type {
  ActivityStatus,
  AlertSummary,
  ApiResponse,
  DashboardConfig,
  DistanceAnalytics,
  FleetAnalytics,
  FuelAnalytics,
  TelemetryData,
  VehicleActivity,
  VehicleDistance,
  VehicleFuelStatus,
} from '../types'

export class ApiClient {
  private baseUrl: string
  private retryAttempts: number
  private retryDelay: number

  constructor(config: DashboardConfig) {
    this.baseUrl = config.apiBaseUrl
    this.retryAttempts = 3
    this.retryDelay = 1000
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        })

        if (!response.ok) {
          throw new ApiError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
          )
        }

        const data = await response.json()
        return data
      }
      catch (error) {
        if (attempt === this.retryAttempts) {
          throw this.handleError(error)
        }

        await this.delay(this.retryDelay * 2 ** (attempt - 1))
      }
    }

    throw new ApiError('Max retry attempts exceeded')
  }

  private handleError(error: any): ApiError {
    if (error instanceof ApiError) {
      return error
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new ApiError('Network error - please check your connection', 0, 'NETWORK_ERROR')
    }

    if (error.name === 'AbortError') {
      return new ApiError('Request timeout', 408, 'TIMEOUT')
    }

    return new ApiError(
      error.message || 'An unexpected error occurred',
      error.status || 500,
      'UNKNOWN_ERROR',
    )
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getFleetAnalytics(params?: {
    fleetId?: string
    timeWindow?: number
  }): Promise<FleetAnalytics> {
    const queryParams = new URLSearchParams()
    if (params?.fleetId)
      queryParams.append('fleetId', params.fleetId)
    if (params?.timeWindow)
      queryParams.append('timeWindow', params.timeWindow.toString())

    const query = queryParams.toString()
    const endpoint = `/analytics/fleet${query ? `?${query}` : ''}`

    const response = await this.makeRequest<ApiResponse<FleetAnalytics>>(endpoint)
    return response.data
  }

  async getAlertSummary(params?: {
    fleetId?: string
    timeWindow?: number
    resolved?: boolean
  }): Promise<AlertSummary> {
    const queryParams = new URLSearchParams()
    if (params?.fleetId)
      queryParams.append('fleetId', params.fleetId)
    if (params?.timeWindow)
      queryParams.append('timeWindow', params.timeWindow.toString())
    if (params?.resolved !== undefined)
      queryParams.append('resolved', params.resolved.toString())

    const query = queryParams.toString()
    const endpoint = `/analytics/alerts/summary${query ? `?${query}` : ''}`

    const response = await this.makeRequest<ApiResponse<AlertSummary>>(endpoint)
    return response.data
  }

  async getVehicleActivity(params?: {
    fleetId?: string
    timeWindow?: number
    inactiveThreshold?: number
  }): Promise<VehicleActivity[]> {
    const queryParams = new URLSearchParams()
    if (params?.fleetId)
      queryParams.append('fleetId', params.fleetId)
    if (params?.timeWindow)
      queryParams.append('timeWindow', params.timeWindow.toString())
    if (params?.inactiveThreshold)
      queryParams.append('inactiveThreshold', params.inactiveThreshold.toString())

    const query = queryParams.toString()
    const endpoint = `/analytics/vehicles/activity${query ? `?${query}` : ''}`

    const response = await this.makeRequest<ApiResponse<VehicleActivity[]>>(endpoint)
    return response.data
  }

  async getActivityStatus(params?: {
    fleetId?: string
    timeWindow?: number
    inactiveThreshold?: number
  }): Promise<ActivityStatus> {
    const queryParams = new URLSearchParams()
    if (params?.fleetId)
      queryParams.append('fleetId', params.fleetId)
    if (params?.timeWindow)
      queryParams.append('timeWindow', params.timeWindow.toString())
    if (params?.inactiveThreshold)
      queryParams.append('inactiveThreshold', params.inactiveThreshold.toString())

    const query = queryParams.toString()
    const endpoint = `/analytics/activity${query ? `?${query}` : ''}`

    const response = await this.makeRequest<ApiResponse<ActivityStatus>>(endpoint)
    return response.data
  }

  async getFuelAnalytics(params?: {
    fleetId?: string
  }): Promise<FuelAnalytics> {
    const queryParams = new URLSearchParams()
    if (params?.fleetId)
      queryParams.append('fleetId', params.fleetId)

    const query = queryParams.toString()
    const endpoint = `/analytics/fuel${query ? `?${query}` : ''}`

    const response = await this.makeRequest<ApiResponse<FuelAnalytics>>(endpoint)
    return response.data
  }

  async getVehicleFuelStatus(): Promise<VehicleFuelStatus[]> {
    const response = await this.makeRequest<ApiResponse<VehicleFuelStatus[]>>('/analytics/vehicles/fuel')
    return response.data
  }

  async getDistanceAnalytics(params?: {
    fleetId?: string
    timeWindow?: number
  }): Promise<DistanceAnalytics> {
    const queryParams = new URLSearchParams()
    if (params?.fleetId)
      queryParams.append('fleetId', params.fleetId)
    if (params?.timeWindow)
      queryParams.append('timeWindow', params.timeWindow.toString())

    const query = queryParams.toString()
    const endpoint = `/analytics/distance${query ? `?${query}` : ''}`

    const response = await this.makeRequest<ApiResponse<DistanceAnalytics>>(endpoint)
    return response.data
  }

  async getVehicleDistances(params?: {
    fleetId?: string
    timeWindow?: number
  }): Promise<VehicleDistance[]> {
    const queryParams = new URLSearchParams()
    if (params?.fleetId)
      queryParams.append('fleetId', params.fleetId)
    if (params?.timeWindow)
      queryParams.append('timeWindow', params.timeWindow.toString())

    const query = queryParams.toString()
    const endpoint = `/analytics/vehicles/distances${query ? `?${query}` : ''}`

    const response = await this.makeRequest<ApiResponse<VehicleDistance[]>>(endpoint)
    return response.data
  }

  async getTelemetryData(params?: {
    vehicleVin?: string
    startTime?: string
    endTime?: string
    limit?: number
  }): Promise<TelemetryData[]> {
    const queryParams = new URLSearchParams()
    if (params?.vehicleVin)
      queryParams.append('vehicleVin', params.vehicleVin)
    if (params?.startTime)
      queryParams.append('startTime', params.startTime)
    if (params?.endTime)
      queryParams.append('endTime', params.endTime)
    if (params?.limit)
      queryParams.append('limit', params.limit.toString())

    const query = queryParams.toString()
    const endpoint = `/telemetry${query ? `?${query}` : ''}`

    const response = await this.makeRequest<ApiResponse<TelemetryData[]>>(endpoint)
    return response.data
  }

  async getHealthStatus(): Promise<{ status: string, database: string }> {
    return await this.makeRequest<{ status: string, database: string }>('/health')
  }

  async refreshCache(fleetId?: string): Promise<{ success: boolean, message: string }> {
    const body = fleetId ? { fleetId } : {}
    return await this.makeRequest<{ success: boolean, message: string }>('/analytics/cache/refresh', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
}

class ApiError extends Error {
  public status?: number
  public code?: string
  public details?: any

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export type { ApiError }
