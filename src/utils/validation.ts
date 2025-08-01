import type {
  ActivityQueryParams,
  AlertSummaryQueryParams,
  AnalyticsQueryParams,
  AnalyticsValidationResult,
  ValidationError,
} from '../types'

export class AnalyticsValidator {
  static validateAnalyticsQuery(params: any): AnalyticsValidationResult {
    const errors: ValidationError[] = []

    if (params.fleetId !== undefined) {
      if (typeof params.fleetId !== 'string' || params.fleetId.trim().length === 0) {
        errors.push({
          field: 'fleetId',
          message: 'Fleet ID must be a non-empty string',
          value: params.fleetId,
        })
      }
    }

    if (params.timeWindow !== undefined) {
      const timeWindow = Number(params.timeWindow)
      if (Number.isNaN(timeWindow) || timeWindow <= 0 || timeWindow > 8760) { // max 1 year
        errors.push({
          field: 'timeWindow',
          message: 'Time window must be a positive number of hours (max 8760)',
          value: params.timeWindow,
        })
      }
    }

    if (params.startTime !== undefined) {
      const startTime = new Date(params.startTime)
      if (Number.isNaN(startTime.getTime())) {
        errors.push({
          field: 'startTime',
          message: 'Start time must be a valid ISO date string',
          value: params.startTime,
        })
      }
    }

    if (params.endTime !== undefined) {
      const endTime = new Date(params.endTime)
      if (Number.isNaN(endTime.getTime())) {
        errors.push({
          field: 'endTime',
          message: 'End time must be a valid ISO date string',
          value: params.endTime,
        })
      }
    }

    if (params.startTime && params.endTime) {
      const startTime = new Date(params.startTime)
      const endTime = new Date(params.endTime)
      if (startTime >= endTime) {
        errors.push({
          field: 'timeRange',
          message: 'Start time must be before end time',
          value: { startTime: params.startTime, endTime: params.endTime },
        })
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static validateActivityQuery(params: any): AnalyticsValidationResult {
    const baseValidation = this.validateAnalyticsQuery(params)
    const errors = [...baseValidation.errors]

    if (params.inactiveThreshold !== undefined) {
      const threshold = Number(params.inactiveThreshold)
      if (Number.isNaN(threshold) || threshold <= 0 || threshold > 8760) {
        errors.push({
          field: 'inactiveThreshold',
          message: 'Inactive threshold must be a positive number of hours (max 8760)',
          value: params.inactiveThreshold,
        })
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static validateAlertSummaryQuery(params: any): AnalyticsValidationResult {
    const baseValidation = this.validateAnalyticsQuery(params)
    const errors = [...baseValidation.errors]

    if (params.resolved !== undefined) {
      if (typeof params.resolved !== 'boolean' && params.resolved !== 'true' && params.resolved !== 'false') {
        errors.push({
          field: 'resolved',
          message: 'Resolved must be a boolean value',
          value: params.resolved,
        })
      }
    }

    if (params.alertTypes !== undefined) {
      if (!Array.isArray(params.alertTypes)) {
        errors.push({
          field: 'alertTypes',
          message: 'Alert types must be an array',
          value: params.alertTypes,
        })
      }
      else {
        const invalidTypes = params.alertTypes.filter((type: any) => typeof type !== 'string' || type.trim().length === 0)
        if (invalidTypes.length > 0) {
          errors.push({
            field: 'alertTypes',
            message: 'All alert types must be non-empty strings',
            value: invalidTypes,
          })
        }
      }
    }

    if (params.severities !== undefined) {
      const validSeverities = ['Low', 'Medium', 'High', 'Critical']
      if (!Array.isArray(params.severities)) {
        errors.push({
          field: 'severities',
          message: 'Severities must be an array',
          value: params.severities,
        })
      }
      else {
        const invalidSeverities = params.severities.filter((severity: any) => !validSeverities.includes(severity))
        if (invalidSeverities.length > 0) {
          errors.push({
            field: 'severities',
            message: `Severities must be one of: ${validSeverities.join(', ')}`,
            value: invalidSeverities,
          })
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static sanitizeAnalyticsParams(params: any): AnalyticsQueryParams {
    const sanitized: AnalyticsQueryParams = {}

    if (params.fleetId) {
      sanitized.fleetId = String(params.fleetId).trim()
    }

    if (params.timeWindow) {
      const timeWindow = Number(params.timeWindow)
      if (!Number.isNaN(timeWindow) && timeWindow > 0) {
        sanitized.timeWindow = Math.min(timeWindow, 8760)
      }
    }

    if (params.startTime) {
      const startTime = new Date(params.startTime)
      if (!Number.isNaN(startTime.getTime())) {
        sanitized.startTime = startTime
      }
    }

    if (params.endTime) {
      const endTime = new Date(params.endTime)
      if (!Number.isNaN(endTime.getTime())) {
        sanitized.endTime = endTime
      }
    }

    return sanitized
  }

  static sanitizeActivityParams(params: any): ActivityQueryParams {
    const baseParams = this.sanitizeAnalyticsParams(params)
    const sanitized: ActivityQueryParams = { ...baseParams }

    if (params.inactiveThreshold) {
      const threshold = Number(params.inactiveThreshold)
      if (!Number.isNaN(threshold) && threshold > 0) {
        sanitized.inactiveThreshold = Math.min(threshold, 8760)
      }
    }

    return sanitized
  }

  static sanitizeAlertSummaryParams(params: any): AlertSummaryQueryParams {
    const baseParams = this.sanitizeAnalyticsParams(params)
    const sanitized: AlertSummaryQueryParams = { ...baseParams }

    if (params.resolved !== undefined) {
      if (typeof params.resolved === 'boolean') {
        sanitized.resolved = params.resolved
      }
      else if (params.resolved === 'true') {
        sanitized.resolved = true
      }
      else if (params.resolved === 'false') {
        sanitized.resolved = false
      }
    }

    if (params.alertTypes && Array.isArray(params.alertTypes)) {
      sanitized.alertTypes = params.alertTypes
        .filter((type: any) => typeof type === 'string' && type.trim().length > 0)
        .map((type: string) => type.trim())
    }

    if (params.severities && Array.isArray(params.severities)) {
      const validSeverities = ['Low', 'Medium', 'High', 'Critical']
      sanitized.severities = params.severities.filter((severity: any) => validSeverities.includes(severity))
    }

    return sanitized
  }
}

export const ANALYTICS_DEFAULTS = {
  TIME_WINDOW: 24, // hours
  INACTIVE_THRESHOLD: 24, // hours
  LOW_FUEL_THRESHOLD: 15, // percentage
  CRITICAL_FUEL_THRESHOLD: 5, // percentage
  MAX_TIME_WINDOW: 8760, // hours (1 year)
  CACHE_TTL: 300, // seconds (5 minutes)
} as const

export const ALERT_TYPES = {
  SPEED_VIOLATION: 'SPEED_VIOLATION',
  LOW_FUEL_BATTERY: 'LOW_FUEL_BATTERY',
  ENGINE_FAULT: 'ENGINE_FAULT',
  MAINTENANCE_DUE: 'MAINTENANCE_DUE',
} as const

export const SEVERITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
} as const
